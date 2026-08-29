"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { GeneratedOutfitCard } from "@/components/closet/GeneratedOutfitCard";
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

  async function generate() {
    setBusy(true);
    setError(null);
    setReason(null);
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
            <GeneratedOutfitCard key={i} outfit={outfit} />
          ))}
        </div>
      )}
    </div>
  );
}
