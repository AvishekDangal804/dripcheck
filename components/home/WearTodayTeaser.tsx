import { Button } from "@/components/ui/Button";
import { EditorialHeading } from "@/components/ui/EditorialHeading";
import { EditorialVisual } from "@/components/ui/EditorialVisual";
import { FadeIn } from "@/components/ui/FadeIn";

const VIBES = ["Old Money", "Casual", "Formal", "Streetwear", "Simple", "Random"];

export function WearTodayTeaser() {
  return (
    <FadeIn as="section" className="border-b border-stone/60 bg-ivory">
      <div className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-24">
        <EditorialHeading eyebrow="Not sure what to wear?" as="h2">
          What&rsquo;s your vibe today?
        </EditorialHeading>

        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-6">
          {VIBES.map((vibe) => (
            <EditorialVisual
              key={vibe}
              seed={vibe}
              label={vibe}
              className="aspect-square w-full rounded-sm"
            />
          ))}
        </div>

        <Button href="/wear-today" variant="secondary" size="lg" className="mt-8">
          Find My Fit
        </Button>
      </div>
    </FadeIn>
  );
}
