"use client";

import { useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { MAX_IMAGE_BYTES } from "@/lib/validation";
import {
  CLOSET_CATEGORIES,
  CLOSET_CATEGORY_LABELS,
  type ClosetCategory,
  type ClosetItem,
} from "@/types/closet";

interface ClosetViewProps {
  initialItems: ClosetItem[];
  aiReal: boolean;
}

export function ClosetView({ initialItems, aiReal }: ClosetViewProps) {
  const [items, setItems] = useState<ClosetItem[]>(initialItems);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const grouped = useMemo(() => {
    const map = new Map<ClosetCategory, ClosetItem[]>();
    for (const cat of CLOSET_CATEGORIES) {
      const forCat = items.filter((i) => i.category === cat);
      if (forCat.length) map.set(cat, forCat);
    }
    return map;
  }, [items]);

  async function handleFile(file: File) {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Please choose a JPEG, PNG, or WebP image.");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setError("That image is too large. Please choose one under 8MB.");
      return;
    }
    setError(null);
    setBusy(true);

    try {
      const dataUrl: string = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error("Couldn't read that file."));
        reader.readAsDataURL(file);
      });

      const res = await fetch("/api/closet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageDataUrl: dataUrl }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Couldn't add that item.");
      setItems((prev) => [body.item as ClosetItem, ...prev]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function remove(id: string) {
    const prev = items;
    setItems((list) => list.filter((i) => i.id !== id));
    const res = await fetch(`/api/closet/${id}`, { method: "DELETE" });
    if (!res.ok) {
      setItems(prev); // rollback
      setError("Couldn't delete that item.");
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-near-black/60">
          {items.length} {items.length === 1 ? "item" : "items"} in your closet
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
        <Button onClick={() => inputRef.current?.click()} disabled={busy}>
          {busy ? "Adding…" : "Add Item"}
        </Button>
      </div>

      {!aiReal && (
        <p className="mt-4 rounded-sm border border-accent-200 bg-accent-50 px-4 py-3 text-sm text-near-black/70">
          Auto-tagging is off — set <code>GEMINI_API_KEY</code> to identify items automatically. Items are still
          added with a best-guess category you can edit later.
        </p>
      )}

      {error && (
        <p role="alert" className="mt-4 text-sm text-accent-600">
          {error}
        </p>
      )}

      {items.length === 0 ? (
        <p className="mt-12 text-near-black/50">
          Your closet is empty. Add photos of clothes you own and DripCheck can build fits from them.
        </p>
      ) : (
        <div className="mt-10 space-y-10">
          {[...grouped.entries()].map(([category, catItems]) => (
            <section key={category}>
              <p className="mb-4 text-xs uppercase tracking-[0.2em] text-accent-500">
                {CLOSET_CATEGORY_LABELS[category]}
              </p>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                {catItems.map((item) => (
                  <article key={item.id} className="group overflow-hidden rounded-sm border border-stone/60 bg-ivory">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.image_url} alt={item.name} className="aspect-square w-full object-cover" />
                    <div className="flex flex-col gap-1 p-3">
                      <p className="line-clamp-1 font-display text-sm text-near-black">{item.name}</p>
                      <p className="text-[11px] uppercase tracking-wide text-near-black/45">
                        {[item.color, item.style, item.pattern].filter(Boolean).join(" · ") || "—"}
                      </p>
                      <button
                        type="button"
                        onClick={() => remove(item.id)}
                        className="mt-1 self-start text-[11px] uppercase tracking-wide text-near-black/40 hover:text-accent-600"
                      >
                        Remove
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
