"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ScoreBadge } from "@/components/ui/ScoreBadge";
import type { GeneratedOutfit } from "@/types/closet";

// Shared card for a closet-built outfit — used by Create a Fit and by
// "What Can I Wear Today?" so both read as the same feature.
export function GeneratedOutfitCard({ outfit }: { outfit: GeneratedOutfit }) {
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/create-a-fit/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: outfit.name,
          vibe: outfit.vibe,
          occasion: outfit.occasion,
          palette: outfit.palette,
          compatibility: outfit.compatibility,
          rationale: outfit.rationale,
          items: outfit.items.map((i) => ({ closetItemId: i.item.id, slot: i.slot })),
        }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Couldn't save that fit.");
      setSaved(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't save that fit.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <article className="rounded-sm border border-stone/60 bg-ivory p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-display text-lg text-near-black">{outfit.name}</p>
          <p className="text-xs uppercase tracking-wide text-accent-500">
            {[outfit.vibe, outfit.occasion?.replace(/-/g, " ")].filter(Boolean).join(" · ")}
          </p>
        </div>
        <ScoreBadge score={outfit.compatibility} />
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        {outfit.items.map(({ item, slot }) => (
          <div key={item.id} className="w-20">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.image_url}
              alt={item.name}
              className="aspect-square w-full rounded-sm border border-stone/50 object-cover"
            />
            <p className="mt-1 text-[10px] uppercase tracking-wide text-near-black/45">{slot}</p>
            <p className="line-clamp-1 text-[11px] text-near-black/70">{item.name}</p>
          </div>
        ))}
      </div>

      {outfit.palette.length > 0 && (
        <div className="mt-4 flex items-center gap-2">
          {outfit.palette.map((c) => (
            <span
              key={c}
              title={c}
              className="h-4 w-4 rounded-full border border-stone/50"
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      )}

      <p className="mt-4 text-sm text-near-black/70">{outfit.rationale}</p>

      {error && (
        <p role="alert" className="mt-3 text-sm text-accent-600">
          {error}
        </p>
      )}

      <Button onClick={save} variant="secondary" className="mt-4" disabled={saved || busy}>
        {saved ? "Saved ✓" : busy ? "Saving…" : "Save Fit"}
      </Button>
    </article>
  );
}
