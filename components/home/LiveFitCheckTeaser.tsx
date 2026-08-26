import { Button } from "@/components/ui/Button";
import { EditorialHeading } from "@/components/ui/EditorialHeading";
import { EditorialVisual } from "@/components/ui/EditorialVisual";
import { FadeIn } from "@/components/ui/FadeIn";

export function LiveFitCheckTeaser() {
  return (
    <FadeIn as="section" className="border-b border-stone/60 bg-warm-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 md:grid-cols-2 md:items-center md:gap-16 md:px-8 md:py-24">
        <EditorialVisual seed="live-check" label="Step into the frame" className="aspect-[4/3] w-full order-2 md:order-1" />
        <div className="order-1 md:order-2">
          <EditorialHeading eyebrow="The main feature" as="h2">
            Step into the frame.
          </EditorialHeading>
          <p className="mt-5 max-w-md text-near-black/70">
            Open your camera, get your outfit read in seconds, and see a Drip Score built entirely from what&rsquo;s
            actually visible — no guessing, no fabricating.
          </p>
          <Button href="/live" size="lg" className="mt-8">
            Start Live Fit Check
          </Button>
        </div>
      </div>
    </FadeIn>
  );
}
