"use client";

import { useCallback, useReducer, useRef } from "react";
import type { FitAnalysis } from "@/types/fit-analysis";
import type { RankedLeaderboardEntry } from "@/types/database";

export interface AnalyzeFitResult {
  fitCheck: { id: string; imageUrl: string };
  analysis: FitAnalysis;
  leaderboard: { rank: number | null; top3: RankedLeaderboardEntry[] };
}

type Phase =
  | "name-entry"
  | "requesting-camera"
  | "camera-denied"
  | "no-camera"
  | "framing"
  | "ready"
  | "countdown"
  | "analyzing"
  | "result"
  | "analysis-error"
  | "db-error"
  | "upload-fallback";

interface State {
  phase: Phase;
  participantName: string;
  capturedImage: string | null;
  result: AnalyzeFitResult | null;
  errorMessage: string | null;
}

type Action =
  | { type: "NAME_SUBMITTED"; name: string }
  | { type: "CAMERA_GRANTED" }
  | { type: "CAMERA_DENIED" }
  | { type: "NO_CAMERA" }
  | { type: "USE_UPLOAD_INSTEAD" }
  | { type: "FRAMING_READY" }
  | { type: "COUNTDOWN_STARTED" }
  | { type: "CAPTURED"; imageDataUrl: string }
  | { type: "ANALYSIS_SUCCESS"; result: AnalyzeFitResult }
  | { type: "ANALYSIS_FAILED"; message: string }
  | { type: "DB_FAILED"; message: string }
  | { type: "RETRY_FROM_FRAMING" }
  | { type: "RESET" };

const initialState: State = {
  phase: "name-entry",
  participantName: "",
  capturedImage: null,
  result: null,
  errorMessage: null,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "NAME_SUBMITTED":
      return { ...initialState, phase: "requesting-camera", participantName: action.name };
    case "CAMERA_GRANTED":
      return { ...state, phase: "framing" };
    case "CAMERA_DENIED":
      return { ...state, phase: "camera-denied" };
    case "NO_CAMERA":
      return { ...state, phase: "no-camera" };
    case "USE_UPLOAD_INSTEAD":
      return { ...state, phase: "upload-fallback" };
    case "FRAMING_READY":
      return { ...state, phase: "ready" };
    case "COUNTDOWN_STARTED":
      return { ...state, phase: "countdown" };
    case "CAPTURED":
      return { ...state, phase: "analyzing", capturedImage: action.imageDataUrl };
    case "ANALYSIS_SUCCESS":
      return { ...state, phase: "result", result: action.result };
    case "ANALYSIS_FAILED":
      return { ...state, phase: "analysis-error", errorMessage: action.message };
    case "DB_FAILED":
      return { ...state, phase: "db-error", errorMessage: action.message };
    case "RETRY_FROM_FRAMING":
      return { ...state, phase: "framing", capturedImage: null, errorMessage: null };
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

export function useLiveCheckMachine() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const inFlightRef = useRef(false);

  const submitName = useCallback((name: string) => dispatch({ type: "NAME_SUBMITTED", name }), []);
  const onCameraGranted = useCallback(() => dispatch({ type: "CAMERA_GRANTED" }), []);
  const onCameraDenied = useCallback(() => dispatch({ type: "CAMERA_DENIED" }), []);
  const onNoCamera = useCallback(() => dispatch({ type: "NO_CAMERA" }), []);
  const useUploadInstead = useCallback(() => dispatch({ type: "USE_UPLOAD_INSTEAD" }), []);
  const onFramingReady = useCallback(() => dispatch({ type: "FRAMING_READY" }), []);
  const startCountdown = useCallback(() => dispatch({ type: "COUNTDOWN_STARTED" }), []);
  const retry = useCallback(() => dispatch({ type: "RETRY_FROM_FRAMING" }), []);
  const reset = useCallback(() => dispatch({ type: "RESET" }), []);

  // The single point of contact with the AI + database: exactly one POST
  // per completed fit check, guarded against React effect double-invoke.
  const submitCapture = useCallback(
    async (imageDataUrl: string, participantName: string, source: "live" | "upload") => {
      if (inFlightRef.current) return;
      inFlightRef.current = true;
      dispatch({ type: "CAPTURED", imageDataUrl });

      try {
        const res = await fetch("/api/analyze-fit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ participantName, imageDataUrl, source }),
        });

        const body = await res.json();

        if (!res.ok) {
          if (body.stage === "ai") dispatch({ type: "ANALYSIS_FAILED", message: body.error });
          else dispatch({ type: "DB_FAILED", message: body.error ?? "Something went wrong." });
          return;
        }

        const result = body as AnalyzeFitResult;
        dispatch({ type: "ANALYSIS_SUCCESS", result });
        // Lets /leaderboard show "Your Rank" for guests with no account —
        // see components/leaderboard/YourRankBadge.tsx.
        try {
          localStorage.setItem("dripcheck:lastFitCheckId", result.fitCheck.id);
        } catch {
          // Storage can be unavailable (private browsing, etc.) — harmless to skip.
        }
      } catch {
        dispatch({ type: "ANALYSIS_FAILED", message: "We couldn't analyze your fit right now." });
      } finally {
        inFlightRef.current = false;
      }
    },
    []
  );

  return {
    state,
    submitName,
    onCameraGranted,
    onCameraDenied,
    onNoCamera,
    useUploadInstead,
    onFramingReady,
    startCountdown,
    submitCapture,
    retry,
    reset,
  };
}
