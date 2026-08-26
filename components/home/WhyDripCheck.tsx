import { Button } from "@/components/ui/Button";
import { EditorialHeading } from "@/components/ui/EditorialHeading";
import { FadeIn } from "@/components/ui/FadeIn";

export function WhyDripCheck() {
  return (
    <FadeIn as="section" className="border-b border-stone/60 bg-warm-white">
      <div className="mx-auto max-w-3xl px-5 py-16 text-center md:px-8 md:py-24">
        <EditorialHeading eyebrow="Why DripCheck" as="h2" className="mx-auto">
          When you dress well, you feel confident.
        </EditorialHeading>
        <p className="mx-auto mt-6 max-w-xl text-near-black/70">
          IIC students don&rsquo;t have a fixed dress code — our everyday outfits are part of our identity. DripCheck
          turns that everyday moment into something fun: a fast, encouraging read on your fit, built only from what
          the camera can actually see, with a little friendly competition on the side.
        </p>
        <Button href="/about" variant="secondary" size="lg" className="mt-8">
          Meet the Developers
        </Button>
      </div>
    </FadeIn>
  );
}
