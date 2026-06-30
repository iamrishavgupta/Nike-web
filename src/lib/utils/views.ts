/**
 * The project ships a single photo per shoe (no real multi-angle sets), so we
 * synthesize "views" of the same shoe from one image using CSS transforms.
 * Each entry is a Tailwind transform applied to the image.
 */
export const PRODUCT_VIEWS = [
  { label: "Side", transform: "" },
  { label: "Other side", transform: "-scale-x-100" },
  { label: "Toe", transform: "scale-150 origin-bottom-left" },
  { label: "Heel", transform: "scale-150 origin-bottom-right" },
  { label: "Top", transform: "scale-150 origin-top" },
  { label: "Angled", transform: "rotate-3 scale-110" },
] as const;
