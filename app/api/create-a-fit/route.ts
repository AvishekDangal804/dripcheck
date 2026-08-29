import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUserId, listCloset } from "@/lib/repositories/closetRepo";
import { generateOutfits } from "@/services/closet/generateOutfits";
import { isOutfitOccasion } from "@/types/closet";

const VIBES = ["old-money", "casual", "formal", "streetwear", "simple", "random"] as const;

const schema = z.object({
  vibe: z.enum(VIBES).nullable().optional(),
  occasion: z.string().refine((v) => isOutfitOccasion(v), "Unknown occasion.").nullable().optional(),
});

export async function POST(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Sign in to build fits from your closet." }, { status: 401 });

  const parsed = schema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid request." }, { status: 400 });
  }

  try {
    const closet = await listCloset(userId);
    const result = generateOutfits(closet, {
      vibe: parsed.data.vibe ?? null,
      occasion: (parsed.data.occasion as never) ?? null,
    });
    return NextResponse.json(result);
  } catch (error) {
    console.error("[create-a-fit] generate failed", error);
    return NextResponse.json({ error: "Couldn't build fits right now. Please try again." }, { status: 500 });
  }
}
