import React from "react";
import { Card, Hero } from "@/components";
import { getCurrentUser } from "@/lib/auth/actions";
import { getAllProducts } from "@/lib/actions/product";
import { parseFilterParams } from "@/lib/utils/query";
import { formatINR } from "@/lib/utils/currency";

const Home = async () => {
  const user = await getCurrentUser();
  console.log("USER:", user);

  const { products } = await getAllProducts(parseFilterParams({ sort: "newest", limit: "6" }));

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <Hero />

      <section aria-labelledby="latest" className="pb-12">
        <h2 id="latest" className="mb-6 text-heading-3 text-dark-900">
          Latest shoes
        </h2>

        {products.length === 0 ? (
          <div className="rounded-lg border border-light-300 p-8 text-center">
            <p className="text-body text-dark-700">No products available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => {
              const price =
                p.minPrice !== null && p.maxPrice !== null && p.minPrice !== p.maxPrice
                  ? `${formatINR(p.minPrice)} - ${formatINR(p.maxPrice)}`
                  : p.minPrice !== null
                  ? p.minPrice
                  : undefined;
              return (
                <Card
                  key={p.id}
                  title={p.name}
                  subtitle={p.subtitle ?? undefined}
                  imageSrc={p.imageUrl ?? "/shoes/shoe-1.jpg"}
                  price={price}
                  href={`/products/${p.id}`}
                />
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
};

export default Home;
