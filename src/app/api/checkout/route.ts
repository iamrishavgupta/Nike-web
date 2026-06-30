import { NextResponse } from "next/server";
import { z } from "zod";
import { stripe, isStripeConfigured } from "@/lib/stripe";
import { getCurrentUser } from "@/lib/auth/actions";
import { createPendingOrder } from "@/lib/actions/order";

const itemSchema = z.object({
  variantId: z.string(),
  quantity: z.number().int().positive(),
});

const bodySchema = z.object({
  items: z.array(itemSchema).min(1),
});

export async function POST(request: Request) {
  if (!isStripeConfigured || !stripe) {
    return NextResponse.json(
      { error: "Stripe is not configured. Add STRIPE_SECRET_KEY to .env.local." },
      { status: 503 }
    );
  }

  let parsed;
  try {
    const json = await request.json();
    parsed = bodySchema.parse(json);
  } catch {
    return NextResponse.json(
      { error: "Invalid cart. Please remove old items and add them again." },
      { status: 400 }
    );
  }

  const origin =
    request.headers.get("origin") || process.env.BETTER_AUTH_URL || "http://localhost:3000";

  const user = await getCurrentUser();

  try {
    // Re-price against the database and create a pending order.
    const { orderId, lineItems } = await createPendingOrder(
      parsed.items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
      user?.id ?? null
    );

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cart`,
      billing_address_collection: "auto",
      shipping_address_collection: {
        allowed_countries: ["US", "CA", "GB", "IN", "AU", "DE", "FR"],
      },
      metadata: { orderId },
      ...(user?.email ? { customer_email: user.email } : {}),
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Could not create checkout session.";
    console.error("Stripe checkout error:", err);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
