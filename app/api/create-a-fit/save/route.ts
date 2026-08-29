import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUserId, listCloset } from "@/lib/repositories/closetRepo";
import { saveGeneratedOutfit } from "@/lib/repositories/generatedOutfitsRepo";
import type { GeneratedOutfitItem, OutfitSlot } from "@/types/closet";

const SLOTS = ["top", "bottom", "shoes", "outerwear", "accessory"] as const;

const schema = z.object({
  name: z.string().trim().min(1).max(80),
  vibe: z.string().nullable().optional(),
  occasion: z.string().nullable().optional(),
  palette: z.array(z.string()).max(6).default([]),
  compatibility: z.number().min(0).max(10),
  rationale: z.string().max(600).default(""),
  items: z.array(z.object({ closetItemId: z.string(), slot: z.enum(SLOTS) })).min(2).max(6),
});

export async function POST(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Sign in to save fits." }, { status: 401 });

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid request." }, { status: 400 });
  }

  const { name, vibe, occasion, palette, compatibility, rationale, items } = parsed.data;

  try {
    // Rebuild from the user's REAL closet so a client can't smuggle in items
    // it doesn't own or fake their details.
    const closet = await listCloset(userId);
    const byId = new Map(closet.map((c) => [c.id, c]));

    const outfitItems: GeneratedOutfitItem[] = [];
    for (const { closetItemId, slot } of items) {
      const item = byId.get(closetItemId);
      if (!item) {
        return NextResponse.json({ error: "That fit uses an item that isn't in your closet." }, { status: 400 });
      }
      outfitItems.push({ item, slot: slot as OutfitSlot });
    }

    const saved = await saveGeneratedOutfit(userId, {
      name,
      vibe: vibe ?? null,
      occasion: occasion ?? null,
      palette,
      compatibility,
      rationale,
      items: outfitItems,
    });

    return NextResponse.json({ id: saved.id });
  } catch (error) {
    console.error("[create-a-fit] save failed", error);
    return NextResponse.json({ error: "Couldn't save that fit. Please try again." }, { status: 500 });
  }
}
