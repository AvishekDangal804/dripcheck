import "server-only";
import { isSupabaseConfigured } from "@/lib/env";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

// In mock mode there is no persistent storage — the captured/uploaded image
// data URL is used directly as image_url. It's only held in the in-process
// mock store (lib/mockStore.ts), never written to disk, and disappears on
// server restart. Once Supabase is configured, images are uploaded to the
// `fit-checks` bucket (see supabase/storage.sql) and a public URL is
// returned instead.
export async function uploadFitImage(
  base64: string,
  mimeType: string,
  imageDataUrl: string
): Promise<string> {
  if (!isSupabaseConfigured()) {
    return imageDataUrl;
  }

  const extension = mimeType.split("/")[1] || "jpg";
  const path = `${crypto.randomUUID()}.${extension}`;
  const bytes = Buffer.from(base64, "base64");

  const { error } = await getSupabaseAdminClient()
    .storage.from("fit-checks")
    .upload(path, bytes, { contentType: mimeType, upsert: false });

  if (error) throw new Error(`Failed to upload image: ${error.message}`);

  const { data } = getSupabaseAdminClient().storage.from("fit-checks").getPublicUrl(path);
  return data.publicUrl;
}
