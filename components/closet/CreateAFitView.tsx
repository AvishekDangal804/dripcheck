"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ScoreBadge } from "@/components/ui/ScoreBadge";
import { OUTFIT_OCCASIONS, type GeneratedOutfit, type OutfitOccasion } from "@/types/closet";

const VIBES: { key: string; label: string }[] = [
  { key: "old-money", label: "Old Money" },
  { key: "casual", label: "Casual" },
  { key: "formal", label: "Formal" },
  { key: "streetwear", label: "Streetwear" },
  { key: "simple", label: "Simple" },
  { key: "random", label: "Random" },
];

function Pill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-xs uppercase tracking-wide transition-colors ${
        active
          ? "border-accent-500 bg-accent-500 text-warm-white"
          : "border-stone/70 text-near-black/60 hover:border-accent-400"
      }`}
    >
      {children}
    </button>
  );
}

export function CreateAFitView({ hasClosetBasics }: { hasClosetBasics: boolean }) {
  const [vibe, setVibe] = useState<string | null>(null);
  const [occasion, setOccasion] = useState<OutfitOccasion | null>(null);
  const [outfits, setOutfits] = useState<GeneratedOutfit[] | null>(null);
  const [reason, setReason] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedKeys, setSavedKeys] = useState<Set<number>>(new Set());

  async function generate() {
    setBusy(true);
    setError(null);
    setReason(null);
    setSavedKeys(new Set());
    try {
      const res = await fetch("/api/create-a-fit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vibe, occasion }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Couldn't build fits.");
      setOutfits(body.outfits as GeneratedOutfit[]);
      setReason(body.reason ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  async function save(outfit: GeneratedOutfit, index: number) {
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
      setSavedKeys((prev) => new Set(prev).add(index));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't save that fit.");
    }
  }

  return (
    <div>
      <div className="space-y-4">
        <div>
          <p className="mb-2 text-xs uppercase tracking-[0.2em] text-accent-500">What&rsquo;s the vibe?</p>
          <div className="flex flex-wrap gap-2">
            {VIBES.map((v) => (
              <Pill key={v.key} active={vibe === v.key} onClick={() => setVibe(vibe === v.key ? null : v.key)}>
                {v.label}
              </Pill>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs uppercase tracking-[0.2em] text-accent-500">Occasion (optional)</p>
          <div className="flex flex-wrap gap-2">
            {OUTFIT_OCCASIONS.map((o) => (
              <Pill
                key={o.key}
                active={occasion === o.key}
                onClick={() => setOccasion(occasion === o.key ? null : o.key)}
              >
                {o.label}
              </Pill>
            ))}
          </div>
        </div>

        <Button onClick={generate} size="lg" disabled={busy || !hasClosetBasics}>
          {busy ? "Building your fits…" : "Create My Fits"}
        </Button>
        {!hasClosetBasics && (
          <p className="text-sm text-near-black/60">
            Add at least one top and one bottom to{" "}
            <a href="/closet" className="text-accent-600 underline">
              your closet
            </a>{" "}
            first.
          </p>
        )}
      </div>

      {error && (
        <p role="alert" className="mt-4 text-sm text-accent-600">
          {error}
        </p>
      )}
      {reason && <p className="mt-6 text-near-black/60">{reason}</p>}

      {outfits && outfits.length > 0 && (
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {outfits.map((outfit, i) => (
            <article key={i} className="rounded-sm border border-stone/60 bg-ivory p-5">
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

              <Button
                onClick={() => save(outfit, i)}
                variant="secondary"
                className="mt-4"
                disabled={savedKeys.has(i)}
              >
                {savedKeys.has(i) ? "Saved ✓" : "Save Fit"}
              </Button>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
