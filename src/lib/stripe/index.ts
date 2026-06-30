import Stripe from "stripe";

const secretKey = process.env.STRIPE_SECRET_KEY;

if (!secretKey) {
  // Don't throw at import time so the app still boots without Stripe configured.
  console.warn("STRIPE_SECRET_KEY is not set. Checkout will be disabled until it is configured.");
}

export const stripe = secretKey
  ? new Stripe(secretKey)
  : null;

export const isStripeConfigured = Boolean(secretKey);
