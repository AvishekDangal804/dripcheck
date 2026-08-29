import "server-only";
import { isSupabaseConfigured } from "@/lib/env";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { mockStore } from "@/lib/mockStore";
import { listCloset } from "@/lib/repositories/closetRepo";
import type { ClosetItem, GeneratedOutfit, OutfitSlot } from "@/types/closet";

export async function saveGeneratedOutfit(userId: string, outfit: GeneratedOutfit): Promise<GeneratedOutfit> {
  if (!isSupabaseConfigured()) {
    return mockStore.saveGeneratedOutfit(userId, outfit);
  }

  const admin = getSupabaseAdminClient();
  const { data: row, error } = await admin
    .from("generated_outfits")
    .insert({
      user_id: userId,
      name: outfit.name,
      vibe: outfit.vibe,
      occasion: outfit.occasion,
      palette: outfit.palette,
      compatibility: outfit.compatibility,
      rationale: outfit.rationale,
    })
    .select()
    .single();
  if (error) throw new Error(`Failed to save outfit: ${error.message}`);

  const links = outfit.items.map((i) => ({
    generated_outfit_id: row.id as string,
    closet_item_id: i.item.id,
    slot: i.slot,
  }));
  const { error: linkError } = await admin.from("generated_outfit_items").insert(links);
  if (linkError) throw new Error(`Failed to save outfit items: ${linkError.message}`);

  return { ...outfit, id: row.id as string };
}

export async function listSavedOutfits(userId: string): Promise<GeneratedOutfit[]> {
  if (!isSupabaseConfigured()) {
    return mockStore.listGeneratedOutfits(userId);
  }

  const admin = getSupabaseAdminClient();
  const { data: rows, error } = await admin
    .from("generated_outfits")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(`Failed to load saved fits: ${error.message}`);
  if (!rows || rows.length === 0) return [];

  const { data: linkRows, error: linkError } = await admin
    .from("generated_outfit_items")
    .select("*")
    .in(
      "generated_outfit_id",
      rows.map((r) => r.id)
    );
  if (linkError) throw new Error(`Failed to load saved fit items: ${linkError.message}`);

  const closet = await listCloset(userId);
  const byId = new Map<string, ClosetItem>(closet.map((c) => [c.id, c]));

  return rows.map((r) => ({
    id: r.id as string,
    name: r.name as string,
    vibe: (r.vibe as string | null) ?? null,
    occasion: (r.occasion as string | null) ?? null,
    palette: (r.palette as string[]) ?? [],
    compatibility: (r.compatibility as number | null) ?? 0,
    rationale: (r.rationale as string | null) ?? "",
    items: (linkRows ?? [])
      .filter((l) => l.generated_outfit_id === r.id)
      .map((l) => {
        const item = byId.get(l.closet_item_id as string);
        return item ? { item, slot: l.slot as OutfitSlot } : null;
      })
      .filter((x): x is { item: ClosetItem; slot: OutfitSlot } => x !== null),
  }));
}
