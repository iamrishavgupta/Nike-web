"use server";

import { db } from "@/lib/db";
import {
  orders,
  orderItems,
  payments,
  productVariants,
  products,
  sizes,
} from "@/lib/db/schema/index";
import { eq, inArray, sql } from "drizzle-orm";
import { usdToInr } from "@/lib/utils/currency";

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
