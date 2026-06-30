"use client";

import Image from "next/image";
import { Check } from "lucide-react";
import { useVariantStore } from "@/store/variant";
import { PRODUCT_VIEWS } from "@/lib/utils/views";

export interface ProductThumbnailsProps {
  productId: string;
  image?: string;
  className?: string;
}

export default function ProductThumbnails({ productId, image, className = "" }: ProductThumbnailsProps) {
  const activeIndex = useVariantStore((s) => s.getImage(productId, 0));
  const setImage = useVariantStore((s) => s.setImage);

  if (!image) return null;

  return (
    <div className={`grid grid-cols-3 gap-3 sm:grid-cols-4 ${className}`} role="listbox" aria-label="Product views">
      {PRODUCT_VIEWS.map((view, i) => {
        const isActive = i === activeIndex;
        return (
          <button
            key={view.label}
            type="button"
            role="option"
            aria-selected={isActive}
            aria-label={view.label}
            onClick={() => setImage(productId, i)}
            className={`relative aspect-square overflow-hidden rounded-xl bg-light-200 ring-1 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[--color-dark-500] ${
              isActive ? "ring-dark-900" : "ring-light-300 hover:ring-dark-500"
            }`}
          >
            <Image
              src={image}
              alt={view.label}
              fill
              sizes="120px"
              className={`object-cover ${view.transform}`}
            />
            {isActive && (
              <span className="absolute right-1 top-1 rounded-full bg-dark-900 p-1">
                <Check className="h-3 w-3 text-light-100" />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
