import { EditorialHeading } from "@/components/ui/EditorialHeading";
import { EditorialVisual } from "@/components/ui/EditorialVisual";
import { FadeIn } from "@/components/ui/FadeIn";

const TILES = [
  { seed: "insp-1", label: "Layering", span: "row-span-2" },
  { seed: "insp-2", label: "Neutral Palettes", span: "" },
  { seed: "insp-3", label: "Silhouette", span: "" },
  { seed: "insp-4", label: "Accessories", span: "row-span-2" },
  { seed: "insp-5", label: "Footwear", span: "" },
];

export function StyleInspiration() {
  return (
    <FadeIn as="section" className="border-b border-stone/60 bg-ivory">
      <div className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-24">
        <EditorialHeading eyebrow="Look book" as="h2">
          Style Inspiration
        </EditorialHeading>

        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4 md:auto-rows-[10rem]">
          {TILES.map((tile) => (
            <EditorialVisual key={tile.seed} seed={tile.seed} label={tile.label} className={`w-full rounded-sm ${tile.span || "aspect-square"}`} />
          ))}
        </div>
      </div>
    </FadeIn>
  );
}
