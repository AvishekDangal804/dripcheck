import { EditorialVisual } from "@/components/ui/EditorialVisual";
import { ScoreBadge } from "@/components/ui/ScoreBadge";
import { LikeSaveButtons } from "@/components/discover/LikeSaveButtons";
import type { Outfit } from "@/types/database";

function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function OutfitCard({ outfit }: { outfit: Outfit }) {
  const isPlaceholder = outfit.image_url.startsWith("placeholder:");

  return (
    <article className="group flex flex-col overflow-hidden rounded-sm border border-stone/60 bg-ivory">
      {isPlaceholder ? (
        <EditorialVisual seed={outfit.image_url.replace("placeholder:", "")} className="aspect-[4/5] w-full" />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={outfit.image_url} alt={`${outfit.name} outfit`} className="aspect-[4/5] w-full object-cover" />
      )}

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-display text-lg leading-tight text-near-black">{outfit.name}</p>
            {outfit.style && <p className="text-xs uppercase tracking-wide text-accent-500">{outfit.style}</p>}
          </div>
          {outfit.score != null && <ScoreBadge score={outfit.score} />}
        </div>

        {outfit.description && <p className="line-clamp-2 text-sm text-near-black/60">{outfit.description}</p>}

        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-xs text-near-black/40">{formatDate(outfit.created_at)}</span>
          <LikeSaveButtons outfitId={outfit.id} />
        </div>
      </div>
    </article>
  );
}
