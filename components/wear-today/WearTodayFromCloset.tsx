"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { GeneratedOutfitCard } from "@/components/closet/GeneratedOutfitCard";
import type { GeneratedOutfit } from "@/types/closet";

const VIBES: { key: string; label: string }[] = [
  { key: "old-money", label: "Old Money" },
  { key: "casual", label: "Casual" },
  { key: "formal", label: "Formal" },
  { key: "streetwear", label: "Streetwear" },
  { key: "simple", label: "Simple" },
  { key: "random", label: "Random" },
];

// Closet-powered flow: pick a vibe, get outfits built only from clothes the
// user owns (via the shared /api/create-a-fit generator).
export function WearTodayFromCloset() {
  const [chosen, setChosen] = useState<string | null>(null);
  const [outfits, setOutfits] = useState<GeneratedOutfit[] | null>(null);
  const [reason, setReason] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function pick(vibe: string) {
    setChosen(vibe);
    setBusy(true);
    setError(null);
    setReason(null);
    setOutfits(null);
    try {
      const res = await fetch("/api/create-a-fit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vibe }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Couldn't build fits.");
      setOutfits((body.outfits as GeneratedOutfit[]).slice(0, 3));
      setReason(body.reason ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap justify-center gap-3">
        {VIBES.map((v) => (
          <button
            key={v.key}
            type="button"
            onClick={() => pick(v.key)}
            className={`rounded-full border px-4 py-2 text-sm uppercase tracking-wide transition-colors ${
              chosen === v.key
                ? "border-accent-500 bg-accent-500 text-warm-white"
                : "border-stone/70 text-near-black/70 hover:border-accent-400"
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>

      {busy && <p className="mt-8 text-center text-near-black/60">Reading your closet…</p>}
      {error && (
        <p role="alert" className="mt-6 text-center text-sm text-accent-600">
          {error}
        </p>
      )}
      {reason && <p className="mt-6 text-center text-near-black/60">{reason}</p>}

      {outfits && outfits.length > 0 && (
        <>
          <p className="mt-10 text-center text-xs uppercase tracking-[0.2em] text-accent-500">
            From your closet
          </p>
          <div className="mt-4 grid gap-6 md:grid-cols-2">
            {outfits.map((outfit, i) => (
              <GeneratedOutfitCard key={i} outfit={outfit} />
            ))}
          </div>
          <div className="mt-8 text-center">
            <Button href="/create-a-fit" variant="secondary">
              More options
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
