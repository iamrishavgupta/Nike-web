"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card } from "@/components";
import { useFavoritesStore } from "@/store/favorites";

export default function FavoritesPage() {
  const [mounted, setMounted] = useState(false);
  const items = useFavoritesStore((s) => s.items);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8" />;
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-6 text-heading-2 text-dark-900">Favorites</h1>

      {items.length === 0 ? (
        <div className="rounded-xl border border-light-300 p-8 text-center">
          <p className="text-body text-dark-700">You haven’t favorited anything yet.</p>
          <Link
            href="/products"
            className="mt-6 inline-block rounded-full bg-dark-900 px-6 py-3 text-body-medium text-light-100 transition hover:opacity-90"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <Card
              key={item.id}
              title={item.name}
              imageSrc={item.image ?? "/shoes/shoe-1.jpg"}
              price={item.price}
              href={`/products/${item.id}`}
            />
          ))}
        </div>
      )}
    </main>
  );
}
