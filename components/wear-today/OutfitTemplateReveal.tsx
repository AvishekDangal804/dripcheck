import { Button } from "@/components/ui/Button";
import { EditorialHeading } from "@/components/ui/EditorialHeading";
import type { OutfitPieces, OutfitTemplate } from "@/services/outfits/vibeTemplates";

const PIECE_LABELS: { key: keyof OutfitPieces; label: string }[] = [
  { key: "top", label: "Top" },
  { key: "bottom", label: "Bottom" },
  { key: "shoes", label: "Shoes" },
  { key: "accessory", label: "Accessory" },
];

function PiecesGrid({ pieces }: { pieces: OutfitPieces }) {
  return (
    <dl className="grid grid-cols-2 gap-4 text-left">
      {PIECE_LABELS.map(({ key, label }) => (
        <div key={key}>
          <dt className="text-xs uppercase tracking-wide text-accent-500">{label}</dt>
          <dd className="mt-1 text-near-black">{pieces[key]}</dd>
        </div>
      ))}
    </dl>
  );
}

export function OutfitTemplateReveal({ template, onBack }: { template: OutfitTemplate; onBack: () => void }) {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-8 py-16 text-center">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-accent-500">Your Vibe Today</p>
        <EditorialHeading as="h1" className="mt-2 text-center">
          {template.label}
        </EditorialHeading>
      </div>

      <PiecesGrid pieces={template.pieces} />

      <div>
        <p className="mb-2 text-xs uppercase tracking-wide text-accent-500">Color Palette</p>
        <div className="flex justify-center gap-3">
          {template.colorPalette.map((color) => (
            <span key={color} className="rounded-full border border-stone/60 bg-warm-white px-3 py-1 text-sm">
              {color}
            </span>
          ))}
        </div>
      </div>

      <div className="max-w-md">
        <p className="mb-1 text-xs uppercase tracking-wide text-accent-500">Why It Works</p>
        <p className="text-near-black/70">{template.whyItWorks}</p>
      </div>

      <div className="w-full border-t border-stone/60 pt-6 text-left">
        <p className="mb-3 text-center text-xs uppercase tracking-wide text-accent-500">Try This Instead</p>
        <PiecesGrid pieces={template.alternative} />
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        <Button href="/live" size="lg">
          Check This Fit
        </Button>
        <Button variant="secondary" onClick={onBack}>
          Choose Another Vibe
        </Button>
      </div>
    </div>
  );
}
