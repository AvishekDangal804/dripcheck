import "server-only";
import { isSupabaseConfigured } from "@/lib/env";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { mockStore } from "@/lib/mockStore";
import type { ClosetItem, NewClosetItem } from "@/types/closet";

export type { NewClosetItem };

export async function getCurrentUserId(): Promise<string | null> {
  if (!isSupabaseConfigured()) return "mock-user";
  const supabase = await getSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

export async function listCloset(userId: string): Promise<ClosetItem[]> {
  if (!isSupabaseConfigured()) return mockStore.listCloset(userId);

  const { data, error } = await getSupabaseAdminClient()
    .from("closet_items")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Failed to load closet: ${error.message}`);
  return (data ?? []) as ClosetItem[];
}

export async function addClosetItem(item: NewClosetItem): Promise<ClosetItem> {
  if (!isSupabaseConfigured()) return mockStore.addClosetItem(item);

  const { data, error } = await getSupabaseAdminClient()
    .from("closet_items")
    .insert(item)
    .select()
    .single();

  if (error) throw new Error(`Failed to add item: ${error.message}`);
  return data as ClosetItem;
}

export async function updateClosetItem(
  id: string,
  userId: string,
  patch: Partial<Pick<ClosetItem, "name" | "category" | "color" | "style" | "pattern">>
): Promise<ClosetItem> {
  if (!isSupabaseConfigured()) return mockStore.updateClosetItem(id, userId, patch);

  const { data, error } = await getSupabaseAdminClient()
    .from("closet_items")
    .update(patch)
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw new Error(`Failed to update item: ${error.message}`);
  return data as ClosetItem;
}

export async function deleteClosetItem(id: string, userId: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    mockStore.deleteClosetItem(id, userId);
    return;
  }

  const { error } = await getSupabaseAdminClient()
    .from("closet_items")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw new Error(`Failed to delete item: ${error.message}`);
}

export async function uploadClosetImage(base64: string, mimeType: string, dataUrl: string): Promise<string> {
  if (!isSupabaseConfigured()) return dataUrl;

  const extension = mimeType.split("/")[1] || "jpg";
  const path = `${crypto.randomUUID()}.${extension}`;
  const bytes = Buffer.from(base64, "base64");

  const admin = getSupabaseAdminClient();
  const { error } = await admin.storage.from("closet").upload(path, bytes, { contentType: mimeType, upsert: false });
  if (error) throw new Error(`Failed to upload image: ${error.message}`);

  return admin.storage.from("closet").getPublicUrl(path).data.publicUrl;
}
