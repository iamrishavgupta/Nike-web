import { Card } from "@/components";
import { getAllProducts } from "@/lib/actions/product";
import { parseFilterParams } from "@/lib/utils/query";
import { formatINR } from "@/lib/utils/currency";

type SearchParams = Record<string, string | string[] | undefined>;

const COLLECTIONS = [
  { label: "All", href: "/collections" },
  { label: "Men", href: "/collections?gender=men" },
  { label: "Women", href: "/collections?gender=women" },
  { label: "Kids", href: "/collections?gender=unisex" },
];

export default async function CollectionsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const parsed = parseFilterParams(sp);
  const { products, totalCount } = await getAllProducts(parsed);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6">
        <h1 className="text-heading-2 text-dark-900">Collections</h1>
        <p className="mt-1 text-body text-dark-700">Explore our latest drops ({totalCount}).</p>
      </header>

      <div className="mb-6 flex flex-wrap gap-2">
        {COLLECTIONS.map((c) => (
          <a
            key={c.href}
            href={c.href}
            className="rounded-full border border-light-300 px-4 py-2 text-body text-dark-900 transition hover:border-dark-500"
          >
            {c.label}
          </a>
        ))}
      </div>

      {products.length === 0 ? (
        <div className="rounded-lg border border-light-300 p-8 text-center">
          <p className="text-body text-dark-700">No products available right now.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
    </main>
  );
}
