/**
 * Currency helpers. Product prices are stored in USD in the database; the whole
 * storefront displays and charges in INR. Adjust USD_TO_INR if the rate changes.
 */
export const USD_TO_INR = 83;

const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

/** Convert a USD amount to whole rupees (keeps display and Stripe charge in sync). */
export function usdToInr(usd: number): number {
  return Math.round(usd * USD_TO_INR);
}

/** Format a USD amount as an INR currency string, e.g. "₹8,300". */
export function formatINR(usd: number | null | undefined): string | undefined {
  if (usd === null || usd === undefined || Number.isNaN(usd)) return undefined;
  return inrFormatter.format(usdToInr(usd));
}
