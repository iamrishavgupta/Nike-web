"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, ImageOff } from "lucide-react";
import { useVariantStore } from "@/store/variant";
import { PRODUCT_VIEWS } from "@/lib/utils/views";

export interface ProductGalleryProps {
  productId: string;
  image?: string;
  className?: string;
}

export default function ProductGallery({ productId, image, className = "" }: ProductGalleryProps) {
  const count = PRODUCT_VIEWS.length;
  const activeIndex = useVariantStore((s) => s.getImage(productId, 0));
  const setImage = useVariantStore((s) => s.setImage);
  const mainRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);

  const safeIndex = Math.min(Math.max(activeIndex, 0), count - 1);

  const go = useCallback(
    (dir: -1 | 1) => {
      const next = (safeIndex + dir + count) % count;
      setImage(productId, next);
    },
    [safeIndex, count, setImage, productId]
  );

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0]?.clientX ?? null;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = (e.changedTouches[0]?.clientX ?? 0) - touchStartX.current;
    const threshold = 40;
    if (dx > threshold) go(-1);
    else if (dx < -threshold) go(1);
    touchStartX.current = null;
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!mainRef.current || !document.activeElement) return;
      if (!mainRef.current.contains(document.activeElement)) return;
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  return (
    <section className={`w-full ${className}`}>
      <div
        ref={mainRef}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        className="relative h-[500px] w-full touch-pan-y select-none overflow-hidden rounded-xl bg-light-200"
      >
        {image ? (
          <>
            <Image
              src={image}
              alt={`Product view: ${PRODUCT_VIEWS[safeIndex].label}`}
              fill
              sizes="(min-width:1024px) 720px, 100vw"
              className={`object-cover transition-transform duration-300 ${PRODUCT_VIEWS[safeIndex].transform}`}
              priority
            />

            <div className="absolute inset-0 hidden items-center justify-between px-2 md:flex">
              <button
                aria-label="Previous view"
                onClick={() => go(-1)}
                className="rounded-full bg-light-100/80 p-2 ring-1 ring-light-300 transition hover:bg-light-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-[--color-dark-500]"
              >
                <ChevronLeft className="h-5 w-5 text-dark-900" />
              </button>
              <button
                aria-label="Next view"
                onClick={() => go(1)}
                className="rounded-full bg-light-100/80 p-2 ring-1 ring-light-300 transition hover:bg-light-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-[--color-dark-500]"
              >
                <ChevronRight className="h-5 w-5 text-dark-900" />
              </button>
            </div>

            {/* Mobile: dot indicators instead of arrows */}
            <div className="absolute inset-x-0 bottom-3 flex items-center justify-center gap-2 md:hidden">
              {PRODUCT_VIEWS.map((view, i) => (
                <button
                  key={view.label}
                  type="button"
                  aria-label={`Show ${view.label}`}
                  aria-current={i === safeIndex}
                  onClick={() => setImage(productId, i)}
                  className={`h-2.5 rounded-full transition-all ${
                    i === safeIndex ? "w-2.5 bg-dark-900" : "w-2.5 bg-dark-500/40"
                  }`}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center text-dark-700">
            <div className="flex items-center gap-2 rounded-lg border border-light-300 bg-light-100 px-4 py-3">
              <ImageOff className="h-5 w-5" />
              <span className="text-body">No images available</span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
