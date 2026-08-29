import "server-only";
import { isSupabaseConfigured } from "@/lib/env";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/database";

export async function getMyProfile(): Promise<{ profile: Profile | null; email: string | null }> {
  if (!isSupabaseConfigured()) return { profile: null, email: null };

  const supabase = await getSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return { profile: null, email: null };

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userData.user.id)
    .maybeSingle();
  if (error) throw new Error(`Failed to load profile: ${error.message}`);

  // The signup trigger normally creates this row; self-heal if it's missing.
  if (!data) {
    const fallback: Profile = {
      id: userData.user.id,
      username: null,
      display_name: (userData.user.user_metadata?.display_name as string | undefined) ?? null,
      avatar_url: null,
      created_at: new Date().toISOString(),
    };
    await getSupabaseAdminClient().from("profiles").upsert({
      id: fallback.id,
      display_name: fallback.display_name,
    });
    return { profile: fallback, email: userData.user.email ?? null };
  }

  return { profile: data as Profile, email: userData.user.email ?? null };
}

export interface ProfilePatch {
  username?: string | null;
  display_name?: string | null;
  avatar_url?: string | null;
}

export async function updateMyProfile(patch: ProfilePatch): Promise<Profile> {
  const supabase = await getSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error("Not signed in.");

  const admin = getSupabaseAdminClient();

  if (patch.username) {
    const { data: clash } = await admin
      .from("profiles")
      .select("id")
      .ilike("username", patch.username)
      .neq("id", userData.user.id)
      .maybeSingle();
    if (clash) throw new Error("That username is taken.");
  }

  const { data, error } = await admin
    .from("profiles")
    .update(patch)
    .eq("id", userData.user.id)
    .select()
    .single();
  if (error) throw new Error(`Failed to update profile: ${error.message}`);
  return data as Profile;
}

export async function uploadAvatar(base64: string, mimeType: string, userId: string): Promise<string> {
  const admin = getSupabaseAdminClient();
  const extension = mimeType.split("/")[1] || "jpg";
  const path = `${userId}/${crypto.randomUUID()}.${extension}`;
  const bytes = Buffer.from(base64, "base64");

  const { error } = await admin.storage.from("avatars").upload(path, bytes, {
    contentType: mimeType,
    upsert: true,
  });
  if (error) throw new Error(`Failed to upload avatar: ${error.message}`);

  return admin.storage.from("avatars").getPublicUrl(path).data.publicUrl;
}
