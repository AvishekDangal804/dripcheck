import Link from "next/link";
import { EditorialHeading } from "@/components/ui/EditorialHeading";
import { FadeIn } from "@/components/ui/FadeIn";
import { OutfitCard } from "@/components/discover/OutfitCard";
import { listOutfits } from "@/lib/repositories/outfitsRepo";

export async function TrendingFits() {
  const outfits = (await listOutfits("trending")).slice(0, 4);

  return (
    <FadeIn as="section" className="border-b border-stone/60 bg-warm-white">
      <div className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-24">
        <div className="flex items-end justify-between">
          <EditorialHeading eyebrow="On campus right now" as="h2">
            Trending Fits
          </EditorialHeading>
          <Link href="/discover" className="hidden text-sm uppercase tracking-wide text-accent-600 hover:underline md:block">
            See all →
          </Link>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-5 md:grid-cols-4">
          {outfits.map((outfit) => (
            <OutfitCard key={outfit.id} outfit={outfit} />
          ))}
        </div>
      </div>
    </FadeIn>
  );
}
