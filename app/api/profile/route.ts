import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { updateMyProfile, uploadAvatar } from "@/lib/repositories/profileRepo";
import { extractImageBase64, extractImageMimeType, MAX_IMAGE_BYTES } from "@/lib/validation";
import { isSupabaseConfigured } from "@/lib/env";

const avatarPattern = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/;

const schema = z.object({
  username: z
    .string()
    .trim()
    .regex(/^[a-zA-Z0-9_]{3,20}$/, "Username must be 3–20 letters, numbers or underscores.")
    .nullable()
    .optional(),
  displayName: z.string().trim().min(1).max(50).nullable().optional(),
  avatarDataUrl: z
    .string()
    .refine((v) => {
      const m = v.match(avatarPattern);
      return !!m && m[2].length * 0.75 <= MAX_IMAGE_BYTES;
    }, "Avatar must be a JPEG, PNG, or WebP under 8MB.")
    .optional(),
});

export async function PATCH(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Accounts aren't set up on this deployment." }, { status: 401 });
  }

  const supabase = await getSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return NextResponse.json({ error: "Sign in to edit your profile." }, { status: 401 });

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid request." }, { status: 400 });
  }

  const { username, displayName, avatarDataUrl } = parsed.data;

  try {
    let avatarUrl: string | undefined;
    if (avatarDataUrl) {
      avatarUrl = await uploadAvatar(
        extractImageBase64(avatarDataUrl),
        extractImageMimeType(avatarDataUrl),
        userData.user.id
      );
    }

    const profile = await updateMyProfile({
      ...(username !== undefined ? { username: username || null } : {}),
      ...(displayName !== undefined ? { display_name: displayName || null } : {}),
      ...(avatarUrl ? { avatar_url: avatarUrl } : {}),
    });

    return NextResponse.json({ profile });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Couldn't update your profile.";
    console.error("[profile] update failed", error);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
