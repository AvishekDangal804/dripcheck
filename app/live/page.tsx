"use client";

import { useCallback, useEffect, useRef } from "react";
import { PageShell } from "@/components/layout/PageShell";
import { NameGate } from "@/components/live/NameGate";
import { CameraStage } from "@/components/live/CameraStage";
import { UploadFallback } from "@/components/live/UploadFallback";
import { ErrorState } from "@/components/live/ErrorStates";
import { ResultCard } from "@/components/live/ResultCard";
import { useCamera } from "@/hooks/useCamera";
import { useFramingHeuristic } from "@/hooks/useFramingHeuristic";
import { useScanSequence } from "@/hooks/useScanSequence";
import { useLiveCheckMachine } from "@/hooks/useLiveCheckMachine";

// Frames are downscaled before upload so ~5 of them stay well under the API's
// per-frame limit — but not so small that clothing detail is lost.
const CAPTURE_MAX_WIDTH = 768;

function captureFrame(video: HTMLVideoElement): string | null {
  if (!video.videoWidth || !video.videoHeight) return null;

  const scale = Math.min(1, CAPTURE_MAX_WIDTH / video.videoWidth);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(video.videoWidth * scale);
  canvas.height = Math.round(video.videoHeight * scale);

  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  // Draws the REAL video frame. The preview's CSS `scaleX(-1)` mirror is
  // display-only and does not affect what drawImage reads, so the captured
  // image is correctly oriented for the AI.
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.85);
}

export default function LivePage() {
  const machine = useLiveCheckMachine();
  const { state, submitScan, startScan } = machine;
  const camera = useCamera();
  const framing = useFramingHeuristic(
    camera.videoRef,
    state.phase === "framing" || state.phase === "ready"
  );
  const readyDispatchedRef = useRef(false);
  const framingHintRef = useRef<Record<string, boolean>>({});

  // Hold onto the most recent framing read so it can be sent alongside the
  // captured frames when the scan finishes.
  useEffect(() => {
    framingHintRef.current = { ...framing.hints } as Record<string, boolean>;
  }, [framing.hints]);

  // Plain function on purpose — useScanSequence keeps the latest reference in
  // a ref, so this doesn't need to be memoized (and memoizing it trips the
  // React Compiler over the ref.current access).
  const grabFrame = (): string | null => {
    const video = camera.videoRef.current;
    return video ? captureFrame(video) : null;
  };

  const handleScanComplete = useCallback(
    (frames: string[]) => {
      submitScan(frames, state.participantName, "live", framingHintRef.current);
    },
    [submitScan, state.participantName]
  );

  const scan = useScanSequence(state.phase === "scanning", grabFrame, handleScanComplete);

  // Request the camera when entering requesting-camera, but skip re-asking
  // permission if the stream is already open from a previous fit — "NEXT
  // FIT" should not force a fresh permission prompt mid-showcase.
  useEffect(() => {
    if (state.phase !== "requesting-camera") return;

    if (camera.isActive) {
      machine.onCameraGranted();
      return;
    }

    camera.start().then(() => {
      if (camera.error === "denied") machine.onCameraDenied();
      else if (camera.error === "no-device") machine.onNoCamera();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.phase]);

  useEffect(() => {
    if (state.phase === "requesting-camera" && camera.error) {
      if (camera.error === "denied") machine.onCameraDenied();
      else machine.onNoCamera();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [camera.error]);

  useEffect(() => {
    if (state.phase !== "framing") readyDispatchedRef.current = false;
    if (state.phase === "framing" && framing.status === "ready" && !readyDispatchedRef.current) {
      readyDispatchedRef.current = true;
      machine.onFramingReady();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [framing.status, state.phase]);

  if (state.phase === "name-entry") {
    return (
      <PageShell>
        <NameGate onSubmit={machine.submitName} />
      </PageShell>
    );
  }

  if (state.phase === "upload-fallback") {
    return (
      <PageShell>
        <UploadFallback
          onImageSelected={(dataUrl) =>
            submitScan([dataUrl], state.participantName || "Guest", "upload")
          }
        />
      </PageShell>
    );
  }

  if (state.phase === "camera-denied") {
    return (
      <PageShell>
        <ErrorState
          title="Camera access was denied."
          message="You can still get scored — upload a photo of your fit instead."
          primaryLabel="Upload a Fit Instead"
          onPrimary={machine.useUploadInstead}
        />
      </PageShell>
    );
  }

  if (state.phase === "no-camera") {
    return (
      <PageShell>
        <ErrorState
          title="Camera isn't available on this device."
          message="No worries — upload a photo instead and we'll score what's visible."
          primaryLabel="Upload a Fit Instead"
          onPrimary={machine.useUploadInstead}
        />
      </PageShell>
    );
  }

  if (state.phase === "analysis-error") {
    return (
      <PageShell>
        <ErrorState
          title="Fit analysis failed."
          message={state.errorMessage ?? "Please try again."}
          primaryLabel="Try Again"
          onPrimary={machine.retry}
          secondaryLabel="Upload Instead"
          onSecondary={machine.useUploadInstead}
        />
      </PageShell>
    );
  }

  if (state.phase === "db-error") {
    return (
      <PageShell>
        <ErrorState
          title="Something went wrong."
          message={state.errorMessage ?? "Please try again."}
          primaryLabel="Try Again"
          onPrimary={machine.retry}
        />
      </PageShell>
    );
  }

  if (state.phase === "result" && state.result) {
    return (
      <PageShell>
        <ResultCard participantName={state.participantName} result={state.result} onNextFit={machine.reset} />
      </PageShell>
    );
  }

  return (
    <PageShell className="py-10">
      <CameraStage
        videoRef={camera.videoRef}
        phase={
          state.phase === "requesting-camera"
            ? "framing"
            : (state.phase as "framing" | "ready" | "scanning" | "analyzing")
        }
        framingStatus={framing.status}
        scanProgress={scan.progress}
        scanStageLabel={scan.stage.label}
        scanStageHint={scan.stage.hint}
        onStartScan={startScan}
      />
    </PageShell>
  );
}
