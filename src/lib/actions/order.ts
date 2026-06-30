"use server";

import { db } from "@/lib/db";
import {
  orders,
  orderItems,
  payments,
  productVariants,
  products,
  productImages,
  sizes,
} from "@/lib/db/schema/index";
import { eq, inArray, sql, desc, and } from "drizzle-orm";
import { usdToInr } from "@/lib/utils/currency";
import { getCurrentUser } from "@/lib/auth/actions";
import { stripe } from "@/lib/stripe";

export type RequestedItem = { variantId: string; quantity: number };

export type StripeLineItem = {
  quantity: number;
  price_data: {
    currency: string;
    unit_amount: number;
    product_data: { name: string };
  };
};

export type RepricedOrder = {
  orderId: string;
  total: number;
  lineItems: StripeLineItem[];
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Re-prices the requested cart items against the database (never trusting the
 * client price), then creates a pending order + order items + payment record.
 * Returns the Stripe line items built from the trusted DB prices.
 */
export async function createPendingOrder(
  requested: RequestedItem[],
  userId: string | null
): Promise<RepricedOrder> {
  // Aggregate quantities by variant and validate ids.
  const qtyByVariant = new Map<string, number>();
  for (const item of requested) {
    if (!UUID_RE.test(item.variantId)) {
      throw new Error("Invalid item in cart. Please remove it and try again.");
    }
    const qty = Math.max(1, Math.floor(item.quantity));
    qtyByVariant.set(item.variantId, (qtyByVariant.get(item.variantId) ?? 0) + qty);
  }

  const variantIds = Array.from(qtyByVariant.keys());
  if (variantIds.length === 0) {
    throw new Error("Your cart is empty.");
  }

  const rows = await db
    .select({
      variantId: productVariants.id,
      price: sql<number>`${productVariants.price}::numeric`,
      salePrice: sql<number | null>`${productVariants.salePrice}::numeric`,
      inStock: productVariants.inStock,
      productName: products.name,
      sizeName: sizes.name,
    })
    .from(productVariants)
    .innerJoin(products, eq(products.id, productVariants.productId))
    .leftJoin(sizes, eq(sizes.id, productVariants.sizeId))
    .where(inArray(productVariants.id, variantIds));

  const found = new Map(rows.map((r) => [r.variantId, r]));

  // Ensure every requested variant exists and is in stock.
  for (const id of variantIds) {
    const row = found.get(id);
    if (!row) throw new Error("One or more items are no longer available.");
    const qty = qtyByVariant.get(id)!;
    if ((row.inStock ?? 0) < qty) {
      throw new Error(`"${row.productName}" doesn't have enough stock.`);
    }
  }

  const lineItems: StripeLineItem[] = [];
  const orderItemValues: { productVariantId: string; quantity: number; priceAtPurchase: string }[] =
    [];
  let total = 0;

  for (const id of variantIds) {
    const row = found.get(id)!;
    const qty = qtyByVariant.get(id)!;
    const effectiveUsd = row.salePrice ?? row.price;
    // Convert to whole rupees so the displayed price matches the Stripe charge.
    const unitInr = usdToInr(Number(effectiveUsd));
    total += unitInr * qty;

    lineItems.push({
      quantity: qty,
      price_data: {
        currency: "inr",
        unit_amount: unitInr * 100,
        product_data: {
          name: row.sizeName ? `${row.productName} (Size ${row.sizeName})` : row.productName,
        },
      },
    });

    orderItemValues.push({
      productVariantId: id,
      quantity: qty,
      priceAtPurchase: unitInr.toFixed(2),
    });
  }

  // Create the pending order, its items, and an initiated payment.
  const [order] = await db
    .insert(orders)
    .values({
      userId: userId ?? null,
      status: "pending",
      totalAmount: total.toFixed(2),
    })
    .returning({ id: orders.id });

  await db.insert(orderItems).values(
    orderItemValues.map((v) => ({
      orderId: order.id,
      productVariantId: v.productVariantId,
      quantity: v.quantity,
      priceAtPurchase: v.priceAtPurchase,
    }))
  );

  await db.insert(payments).values({
    orderId: order.id,
    method: "stripe",
    status: "initiated",
  });

  return { orderId: order.id, total, lineItems };
}

/**
 * Marks an order as paid and completes its payment record. Idempotent: safe to
 * call multiple times (Stripe may deliver a webhook more than once).
 */
export async function markOrderPaid(orderId: string, transactionId: string | null) {
  if (!UUID_RE.test(orderId)) return;

  await db.update(orders).set({ status: "paid" }).where(eq(orders.id, orderId));

  await db
    .update(payments)
    .set({
      status: "completed",
      paidAt: new Date(),
      transactionId: transactionId ?? null,
    })
    .where(eq(payments.orderId, orderId));
}

export type OrderItemView = {
  id: string;
  name: string;
  sizeName: string | null;
  quantity: number;
  price: number;
  image: string | null;
};

export type OrderView = {
  id: string;
  status: "pending" | "paid" | "shipped" | "delivered" | "cancelled";
  total: number;
  createdAt: string;
  items: OrderItemView[];
};

/** Orders for the currently signed-in user, newest first. Amounts are in INR. */
export async function getUserOrders(): Promise<OrderView[]> {
  const user = await getCurrentUser();
  if (!user) return [];

  const orderRows = await db
    .select({
      id: orders.id,
      status: orders.status,
      total: sql<number>`${orders.totalAmount}::numeric`,
      createdAt: orders.createdAt,
    })
    .from(orders)
    .where(eq(orders.userId, user.id))
    .orderBy(desc(orders.createdAt));

  if (!orderRows.length) return [];

  const orderIds = orderRows.map((o) => o.id);

  const itemRows = await db
    .select({
      itemId: orderItems.id,
      orderId: orderItems.orderId,
      quantity: orderItems.quantity,
      price: sql<number>`${orderItems.priceAtPurchase}::numeric`,
      productId: products.id,
      productName: products.name,
      sizeName: sizes.name,
    })
    .from(orderItems)
    .innerJoin(productVariants, eq(productVariants.id, orderItems.productVariantId))
    .innerJoin(products, eq(products.id, productVariants.productId))
    .leftJoin(sizes, eq(sizes.id, productVariants.sizeId))
    .where(inArray(orderItems.orderId, orderIds));

  // Primary image per product for thumbnails.
  const productIds = Array.from(new Set(itemRows.map((r) => r.productId)));
  const imageMap = new Map<string, string>();
  if (productIds.length) {
    const imgRows = await db
      .select({
        productId: productImages.productId,
        url: productImages.url,
        isPrimary: productImages.isPrimary,
        sortOrder: productImages.sortOrder,
      })
      .from(productImages)
      .where(inArray(productImages.productId, productIds));

    imgRows
      .sort((a, b) => {
        if (a.isPrimary && !b.isPrimary) return -1;
        if (!a.isPrimary && b.isPrimary) return 1;
        return (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
      })
      .forEach((r) => {
        if (!imageMap.has(r.productId)) imageMap.set(r.productId, r.url);
      });
  }

  const itemsByOrder = new Map<string, OrderItemView[]>();
  for (const r of itemRows) {
    const list = itemsByOrder.get(r.orderId) ?? [];
    list.push({
      id: r.itemId,
      name: r.productName,
      sizeName: r.sizeName,
      quantity: r.quantity,
      price: Number(r.price),
      image: imageMap.get(r.productId) ?? null,
    });
    itemsByOrder.set(r.orderId, list);
  }

  return orderRows.map((o) => ({
    id: o.id,
    status: o.status,
    total: Number(o.total),
    createdAt: o.createdAt.toISOString(),
    items: itemsByOrder.get(o.id) ?? [],
  }));
}

/**
 * Cancels an order owned by the current user. If it was paid, issues a Stripe
 * refund, restores stock, and marks the order cancelled. Shipped/delivered
 * orders can't be cancelled here.
 */
export async function cancelOrder(orderId: string): Promise<{ ok: boolean; error?: string }> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Please sign in to cancel an order." };
  if (!UUID_RE.test(orderId)) return { ok: false, error: "Invalid order." };

  const [order] = await db
    .select()
    .from(orders)
    .where(and(eq(orders.id, orderId), eq(orders.userId, user.id)));

  if (!order) return { ok: false, error: "Order not found." };
  if (order.status === "cancelled") return { ok: false, error: "This order is already cancelled." };
  if (order.status === "shipped" || order.status === "delivered") {
    return { ok: false, error: "This order has already shipped and can't be cancelled." };
  }

  // Refund the payment if it was completed.
  if (order.status === "paid") {
    const [payment] = await db.select().from(payments).where(eq(payments.orderId, orderId));
    if (payment?.transactionId && stripe) {
      try {
        await stripe.refunds.create({ payment_intent: payment.transactionId });
      } catch (e) {
        console.error("Stripe refund failed:", e);
        return { ok: false, error: "Refund could not be processed. Please contact support." };
      }
    }
    await db.update(payments).set({ status: "failed" }).where(eq(payments.orderId, orderId));
  }

  // Restore stock for each item.
  const items = await db
    .select({ variantId: orderItems.productVariantId, quantity: orderItems.quantity })
    .from(orderItems)
    .where(eq(orderItems.orderId, orderId));

  for (const it of items) {
    await db
      .update(productVariants)
      .set({ inStock: sql`${productVariants.inStock} + ${it.quantity}` })
      .where(eq(productVariants.id, it.variantId));
  }

  await db.update(orders).set({ status: "cancelled" }).where(eq(orders.id, orderId));
  return { ok: true };
}
