import { NextResponse } from "next/server";
import { z } from "zod";
import { extractImageBase64, extractImageMimeType, MAX_IMAGE_BYTES } from "@/lib/validation";
import { identifyItem, CLOSET_AI_IS_REAL } from "@/services/closet/identifyItem";
import { getCurrentUserId, listCloset, addClosetItem, uploadClosetImage } from "@/lib/repositories/closetRepo";
import { isClosetCategory } from "@/types/closet";

const dataUrlPattern = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/;

const addSchema = z.object({
  imageDataUrl: z
    .string()
    .refine((v) => {
      const m = v.match(dataUrlPattern);
      return !!m && m[2].length * 0.75 <= MAX_IMAGE_BYTES;
    }, "Image must be a JPEG, PNG, or WebP under 8MB."),
  // Optional manual overrides — the user can correct the AI before saving.
  category: z.string().optional(),
  name: z.string().trim().min(1).max(60).optional(),
  color: z.string().trim().max(20).nullable().optional(),
  style: z.string().trim().max(20).nullable().optional(),
  pattern: z.string().trim().max(20).nullable().optional(),
});

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Sign in to use your closet." }, { status: 401 });

  try {
    return NextResponse.json({ items: await listCloset(userId), aiReal: CLOSET_AI_IS_REAL });
  } catch (error) {
    console.error("[closet] list failed", error);
    return NextResponse.json({ error: "Couldn't load your closet." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Sign in to use your closet." }, { status: 401 });

  const parsed = addSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid request." }, { status: 400 });
  }

  const { imageDataUrl, category, name, color, style, pattern } = parsed.data;
  const base64 = extractImageBase64(imageDataUrl);
  const mimeType = extractImageMimeType(imageDataUrl);

  try {
    const identified = await identifyItem(base64, mimeType).catch((error) => {
      console.error("[closet] identify failed, falling back to generic", error);
      return null;
    });

    const finalCategory =
      (category && isClosetCategory(category) && category) ||
      identified?.category ||
      "accessory";

    const imageUrl = await uploadClosetImage(base64, mimeType, imageDataUrl);

    const item = await addClosetItem({
      user_id: userId,
      category: finalCategory,
      name: name || identified?.name || `New ${finalCategory}`,
      image_url: imageUrl,
      color: color ?? identified?.color ?? null,
      style: style ?? identified?.style ?? null,
      pattern: pattern ?? identified?.pattern ?? null,
    });

    return NextResponse.json({ item, aiReal: CLOSET_AI_IS_REAL });
  } catch (error) {
    console.error("[closet] add failed", error);
    return NextResponse.json({ error: "Couldn't add that item. Please try again." }, { status: 500 });
  }
}
