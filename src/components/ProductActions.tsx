"use client";

import { useMemo, useState } from "react";
import { Heart, ShoppingBag, Check } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { useFavoritesStore } from "@/store/favorites";
import { useVariantStore } from "@/store/variant";

export interface ActionVariant {
  id: string;
  price: number;
  salePrice: number | null;
  colorName: string;
  sizeName: string;
  sizeSortOrder: number;
  inStock: number;
}

export interface ProductActionsProps {
  productId: string;
  name: string;
  image?: string;
  variants: ActionVariant[];
  colorNames: string[];
}

export default function ProductActions({
  productId,
  name,
  image,
  variants,
  colorNames,
}: ProductActionsProps) {
  const [size, setSize] = useState<string | null>(null);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addItem = useCartStore((s) => s.addItem);
  const toggleFavorite = useFavoritesStore((s) => s.toggle);
  const favorite = useFavoritesStore((s) => s.items.some((i) => i.id === productId));
  const selectedColorIndex = useVariantStore((s) => s.getSelected(productId, 0));

  const selectedColorName = colorNames[selectedColorIndex];

  // Unique, sorted size options derived from the real variants.
  const sizes = useMemo(() => {
    const map = new Map<string, number>();
    for (const v of variants) {
      if (!map.has(v.sizeName)) map.set(v.sizeName, v.sizeSortOrder ?? 0);
    }
    return Array.from(map.entries())
      .sort((a, b) => a[1] - b[1])
      .map(([name]) => name);
  }, [variants]);

  const resolveVariant = (sizeName: string) =>
    variants.find((v) => v.sizeName === sizeName && v.colorName === selectedColorName) ||
    variants.find((v) => v.sizeName === sizeName);

  const handleAddToBag = () => {
    if (!size) {
      setError("Please select a size first.");
      return;
    }
    const variant = resolveVariant(size);
    if (!variant) {
      setError("That size is unavailable. Please choose another.");
      return;
    }
    if (variant.inStock <= 0) {
      setError("Sorry, this size is out of stock.");
      return;
    }
    setError(null);

    const effectivePrice = variant.salePrice ?? variant.price;
    addItem({
      id: variant.id,
      variantId: variant.id,
      productId,
      name: `${name} (Size ${variant.sizeName})`,
      price: effectivePrice,
      image,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleFavorite = () => {
    const variant = size ? resolveVariant(size) : undefined;
    const price = variant ? variant.salePrice ?? variant.price : undefined;
    toggleFavorite({ id: productId, name, price, image });
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="text-body-medium text-dark-900">Select Size</p>
          <button className="text-caption text-dark-700 underline-offset-2 hover:underline">
            Size Guide
          </button>
        </div>

        {sizes.length === 0 ? (
          <p className="text-body text-dark-700">No sizes available.</p>
        ) : (
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
            {sizes.map((s) => {
              const variant = resolveVariant(s);
              const unavailable = !variant || variant.inStock <= 0;
              const isActive = size === s;
              return (
                <button
                  key={s}
                  onClick={() => setSize(isActive ? null : s)}
                  disabled={unavailable}
                  aria-pressed={isActive}
                  className={`rounded-lg border px-3 py-3 text-center text-body transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[--color-dark-500] ${
                    isActive
                      ? "border-dark-900 text-dark-900"
                      : "border-light-300 text-dark-700 hover:border-dark-500"
                  } ${unavailable ? "cursor-not-allowed text-light-400 line-through opacity-60" : ""}`}
                >
                  {s}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {error && <p className="text-body text-[color:var(--color-red)]">{error}</p>}

      <button
        onClick={handleAddToBag}
        className="flex items-center justify-center gap-2 rounded-full bg-dark-900 px-6 py-4 text-body-medium text-light-100 transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[--color-dark-500]"
      >
        {added ? <Check className="h-5 w-5" /> : <ShoppingBag className="h-5 w-5" />}
        {added ? "Added to Bag" : "Add to Bag"}
      </button>

      <button
        onClick={handleFavorite}
        aria-pressed={favorite}
        className="flex items-center justify-center gap-2 rounded-full border border-light-300 px-6 py-4 text-body-medium text-dark-900 transition hover:border-dark-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-[--color-dark-500]"
      >
        <Heart className={`h-5 w-5 ${favorite ? "fill-dark-900 text-dark-900" : ""}`} />
        {favorite ? "Favorited" : "Favorite"}
      </button>
    </div>
  );
}
