"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { formatINR } from "@/lib/utils/currency";

export default function CartPage() {
  const [mounted, setMounted] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const items = useCartStore((s) => s.items);
  const total = useCartStore((s) => s.total);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const clearCart = useCartStore((s) => s.clearCart);

  useEffect(() => setMounted(true), []);

  const handleCheckout = async () => {
    setError(null);
    setCheckingOut(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            variantId: i.variantId ?? i.id,
            quantity: i.quantity,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not start checkout.");
        setCheckingOut(false);
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Network error. Please try again.");
      setCheckingOut(false);
    }
  };

  if (!mounted) {
    return <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8" />;
  }

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <h1 className="text-heading-2 text-dark-900">Your bag is empty</h1>
        <p className="mt-2 text-body text-dark-700">Once you add items, they’ll show up here.</p>
        <Link
          href="/products"
          className="mt-6 inline-block rounded-full bg-dark-900 px-6 py-3 text-body-medium text-light-100 transition hover:opacity-90"
        >
          Continue Shopping
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-heading-2 text-dark-900">Your Bag</h1>
        <button onClick={clearCart} className="text-body text-dark-700 underline-offset-2 hover:underline">
          Clear bag
        </button>
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_360px]">
        <ul className="flex flex-col gap-4">
          {items.map((item) => (
            <li key={item.id} className="flex gap-4 rounded-xl border border-light-300 p-4">
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-light-200">
                {item.image && (
                  <Image src={item.image} alt={item.name} fill sizes="96px" className="object-cover" />
                )}
              </div>
              <div className="flex flex-1 flex-col justify-between">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-body-medium text-dark-900">{item.name}</p>
                  <button
                    onClick={() => removeItem(item.id)}
                    aria-label="Remove item"
                    className="text-dark-700 transition hover:text-[--color-red]"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      aria-label="Decrease quantity"
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-light-300 hover:border-dark-500"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-6 text-center text-body text-dark-900">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      aria-label="Increase quantity"
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-light-300 hover:border-dark-500"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-body-medium text-dark-900">{formatINR(item.price * item.quantity)}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <aside className="h-fit rounded-xl border border-light-300 p-6">
          <h2 className="text-heading-3 text-dark-900">Order Summary</h2>
          <div className="mt-4 flex justify-between text-body text-dark-700">
            <span>Subtotal</span>
            <span>{formatINR(total)}</span>
          </div>
          <div className="mt-2 flex justify-between text-body text-dark-700">
            <span>Shipping</span>
            <span>Free</span>
          </div>
          <div className="mt-4 flex justify-between border-t border-light-300 pt-4 text-body-medium text-dark-900">
            <span>Total</span>
            <span>{formatINR(total)}</span>
          </div>
          {error && <p className="mt-3 text-caption text-[color:var(--color-red)]">{error}</p>}
          <button
            onClick={handleCheckout}
            disabled={checkingOut}
            className="mt-6 w-full rounded-full bg-dark-900 px-6 py-4 text-body-medium text-light-100 transition hover:opacity-90 disabled:opacity-60"
          >
            {checkingOut ? "Redirecting to checkout…" : "Checkout"}
          </button>
          <p className="mt-3 text-center text-footnote text-dark-700">Secured by Stripe</p>
        </aside>
      </div>
    </main>
  );
}
