import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUserId, updateClosetItem, deleteClosetItem } from "@/lib/repositories/closetRepo";
import { isClosetCategory } from "@/types/closet";

const patchSchema = z.object({
  name: z.string().trim().min(1).max(60).optional(),
  category: z.string().refine(isClosetCategory, "Unknown category.").optional(),
  color: z.string().trim().max(20).nullable().optional(),
  style: z.string().trim().max(20).nullable().optional(),
  pattern: z.string().trim().max(20).nullable().optional(),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Sign in to use your closet." }, { status: 401 });

  const { id } = await params;
  const parsed = patchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid request." }, { status: 400 });
  }

  try {
    const item = await updateClosetItem(id, userId, parsed.data);
    return NextResponse.json({ item });
  } catch (error) {
    console.error("[closet] update failed", error);
    return NextResponse.json({ error: "Couldn't update that item." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Sign in to use your closet." }, { status: 401 });

  const { id } = await params;
  try {
    await deleteClosetItem(id, userId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[closet] delete failed", error);
    return NextResponse.json({ error: "Couldn't delete that item." }, { status: 500 });
  }
}
