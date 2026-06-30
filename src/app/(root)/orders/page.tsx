import Link from "next/link";
import Image from "next/image";
import { Package } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/actions";
import { getUserOrders, type OrderView } from "@/lib/actions/order";
import { formatRupees } from "@/lib/utils/currency";

export const dynamic = "force-dynamic";

const STATUS_STYLES: Record<OrderView["status"], string> = {
  pending: "bg-light-200 text-dark-700",
  paid: "bg-[color:var(--color-green)]/10 text-[color:var(--color-green)]",
  shipped: "bg-[color:var(--color-orange)]/10 text-[color:var(--color-orange)]",
  delivered: "bg-[color:var(--color-green)]/10 text-[color:var(--color-green)]",
  cancelled: "bg-[color:var(--color-red)]/10 text-[color:var(--color-red)]",
};

const STATUS_LABEL: Record<OrderView["status"], string> = {
  pending: "Payment pending",
  paid: "Paid · Preparing to ship",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export default async function OrdersPage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <h1 className="text-heading-2 text-dark-900">Your Orders</h1>
        <p className="mt-3 text-body text-dark-700">Please sign in to view your orders.</p>
        <Link
          href="/sign-in"
          className="mt-6 inline-block rounded-full bg-dark-900 px-6 py-3 text-body-medium text-light-100 transition hover:opacity-90"
        >
          Sign In
        </Link>
      </main>
    );
  }

  const orders = await getUserOrders();

  if (orders.length === 0) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <Package className="mx-auto h-14 w-14 text-dark-500" />
        <h1 className="mt-6 text-heading-2 text-dark-900">No orders yet</h1>
        <p className="mt-3 text-body text-dark-700">When you place an order, it’ll show up here.</p>
        <Link
          href="/products"
          className="mt-6 inline-block rounded-full bg-dark-900 px-6 py-3 text-body-medium text-light-100 transition hover:opacity-90"
        >
          Start Shopping
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-6 text-heading-2 text-dark-900">Your Orders</h1>

      <div className="flex flex-col gap-6">
        {orders.map((order) => (
          <section key={order.id} className="rounded-xl border border-light-300 p-5">
            <header className="flex flex-wrap items-center justify-between gap-3 border-b border-light-200 pb-4">
              <div>
                <p className="text-caption text-dark-700">
                  Order #{order.id.slice(0, 8).toUpperCase()}
                </p>
                <p className="text-caption text-dark-700">
                  {new Date(order.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
              <span className={`rounded-full px-3 py-1 text-caption ${STATUS_STYLES[order.status]}`}>
                {STATUS_LABEL[order.status]}
              </span>
            </header>

            <ul className="mt-4 flex flex-col gap-4">
              {order.items.map((item) => (
                <li key={item.id} className="flex items-center gap-4">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-light-200">
                    {item.image && (
                      <Image src={item.image} alt={item.name} fill sizes="64px" className="object-cover" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-body-medium text-dark-900">{item.name}</p>
                    <p className="text-caption text-dark-700">
                      {item.sizeName ? `Size ${item.sizeName} · ` : ""}Qty {item.quantity}
                    </p>
                  </div>
                  <p className="text-body-medium text-dark-900">{formatRupees(item.price * item.quantity)}</p>
                </li>
              ))}
            </ul>

            <footer className="mt-4 flex items-center justify-between border-t border-light-200 pt-4">
              <span className="text-body text-dark-700">Total</span>
              <span className="text-body-medium text-dark-900">{formatRupees(order.total)}</span>
            </footer>
          </section>
        ))}
      </div>
    </main>
  );
}
