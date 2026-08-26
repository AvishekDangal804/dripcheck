import { NextResponse } from "next/server";
import { analyzeFitRequestSchema, extractImageBase64, extractImageMimeType } from "@/lib/validation";
import { analyzeFit } from "@/services/ai/analyzeFit";
import { uploadFitImage } from "@/lib/repositories/storageRepo";
import { insertFitCheck } from "@/lib/repositories/fitChecksRepo";
import { insertLeaderboardEntry, getTodayLeaderboard } from "@/lib/repositories/leaderboardRepo";

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

  const { participantName, imageDataUrl, source } = parsed.data;
  const mimeType = extractImageMimeType(imageDataUrl);
  const base64 = extractImageBase64(imageDataUrl);

  let analysis;
  try {
    analysis = await analyzeFit(base64, mimeType);
  } catch (error) {
    console.error("[analyze-fit] AI provider failed", error);
    return NextResponse.json(
      { stage: "ai", error: "We couldn't analyze your fit right now." },
      { status: 502 }
    );
  }

  try {
    const imageUrl = await uploadFitImage(base64, mimeType, imageDataUrl);

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
