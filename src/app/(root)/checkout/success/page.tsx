"use client";

import Link from "next/link";
import { useEffect } from "react";
import { CheckCircle2 } from "lucide-react";
import { useCartStore } from "@/store/cart";

export default function CheckoutSuccessPage() {
  const clearCart = useCartStore((s) => s.clearCart);

  useEffect(() => {
    // Order placed — empty the bag.
    clearCart();
  }, [clearCart]);

  return (
    <main className="mx-auto flex max-w-2xl flex-col items-center px-4 py-20 text-center sm:px-6 lg:px-8">
      <CheckCircle2 className="h-16 w-16 text-[color:var(--color-green)]" />
      <h1 className="mt-6 text-heading-2 text-dark-900">Thank you for your order!</h1>
      <p className="mt-3 max-w-md text-body text-dark-700">
        Your payment was successful and your order is being processed. A confirmation email is on its way.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/products"
          className="rounded-full bg-dark-900 px-6 py-3 text-body-medium text-light-100 transition hover:opacity-90"
        >
          Continue Shopping
        </Link>
        <Link
          href="/"
          className="rounded-full border border-light-300 px-6 py-3 text-body-medium text-dark-900 transition hover:border-dark-500"
        >
          Back to Home
        </Link>
      </div>
    </main>
  );
}
