"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cancelOrder } from "@/lib/actions/order";

export default function CancelOrderButton({ orderId }: { orderId: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleCancel = () => {
    if (!window.confirm("Cancel this order? If it was paid, the amount will be refunded.")) return;
    setError(null);
    startTransition(async () => {
      const res = await cancelOrder(orderId);
      if (res.ok) {
        router.refresh();
      } else {
        setError(res.error ?? "Could not cancel this order.");
      }
    });
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleCancel}
        disabled={pending}
        className="rounded-full border border-light-300 px-4 py-1.5 text-caption text-dark-900 transition hover:border-[color:var(--color-red)] hover:text-[color:var(--color-red)] disabled:opacity-60"
      >
        {pending ? "Cancelling…" : "Cancel order"}
      </button>
      {error && <span className="text-caption text-[color:var(--color-red)]">{error}</span>}
    </div>
  );
}
