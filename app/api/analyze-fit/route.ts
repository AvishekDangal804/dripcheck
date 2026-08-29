import { NextResponse } from "next/server";
import { analyzeFitRequestSchema, extractImageBase64, extractImageMimeType } from "@/lib/validation";
import { analyzeFit } from "@/services/ai/analyzeFit";
import type { FitFrame } from "@/services/ai/types";
import type { CategoryKey } from "@/types/fit-analysis";
import { CATEGORY_KEYS } from "@/types/fit-analysis";
import { uploadFitImage } from "@/lib/repositories/storageRepo";
import { insertFitCheck } from "@/lib/repositories/fitChecksRepo";
import { insertLeaderboardEntry, getTodayLeaderboard } from "@/lib/repositories/leaderboardRepo";

// Maps N captured frames onto the rotation the model is told to expect:
// front -> turning -> back -> turning -> final. One frame (Photo Check) is
// just "front".
const VIEW_SEQUENCE: FitFrame["view"][] = ["front", "turning", "back", "turning", "final"];

function viewForIndex(i: number, total: number): FitFrame["view"] {
  if (total === 1) return "front";
  if (i === 0) return "front";
  if (i === total - 1) return "final";
  const mid = VIEW_SEQUENCE[Math.min(i, VIEW_SEQUENCE.length - 2)];
  return mid ?? "side";
}

// The one and only place a fit check gets scored and persisted. score,
// analysis_json, and check_type are computed entirely server-side here —
// never accepted from the client. See supabase/policies.sql for why the
// downstream tables have no client insert policy.
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = analyzeFitRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { stage: "validation", error: parsed.error.issues[0]?.message ?? "Invalid request." },
      { status: 400 }
    );
  }

  const { participantName, frames, source, framingHint } = parsed.data;

  const fitFrames: FitFrame[] = frames.map((dataUrl, i) => ({
    data: extractImageBase64(dataUrl),
    mimeType: extractImageMimeType(dataUrl),
    view: viewForIndex(i, frames.length),
  }));

  const hint = framingHint
    ? {
        framingHint: Object.fromEntries(
          CATEGORY_KEYS.filter((k) => k in framingHint).map((k) => [k, framingHint[k]])
        ) as Partial<Record<CategoryKey, boolean>>,
      }
    : undefined;

  let analysis;
  try {
    analysis = await analyzeFit(fitFrames, hint);
  } catch (error) {
    console.error("[analyze-fit] AI provider failed", error);
    return NextResponse.json(
      { stage: "ai", error: "Fit analysis failed. Please try again." },
      { status: 502 }
    );
  }

  try {
    // The front frame is the one we keep as the outfit photo.
    const primary = frames[0];
    const imageUrl = await uploadFitImage(
      extractImageBase64(primary),
      extractImageMimeType(primary),
      primary
    );

    const fitCheck = await insertFitCheck({
      participant_name: participantName,
      user_id: null,
      image_url: imageUrl,
      check_type: analysis.checkType,
      score: analysis.overallScore,
      style: analysis.style,
      description: analysis.description,
      analysis_json: analysis,
      is_public: true,
      source,
    });

    await insertLeaderboardEntry({
      fit_check_id: fitCheck.id,
      participant_name: participantName,
      score: analysis.overallScore,
    });

    const leaderboard = await getTodayLeaderboard();
    const rank = leaderboard.find((entry) => entry.fit_check_id === fitCheck.id)?.rank ?? null;

    return NextResponse.json({
      fitCheck: { id: fitCheck.id, imageUrl },
      analysis,
      leaderboard: { rank, top3: leaderboard.slice(0, 3) },
    });
  } catch (error) {
    console.error("[analyze-fit] Failed to save fit check", error);
    return NextResponse.json(
      { stage: "database", error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
