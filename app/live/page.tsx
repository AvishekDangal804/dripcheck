"use client";

import { useEffect, useRef } from "react";
import { PageShell } from "@/components/layout/PageShell";
import { NameGate } from "@/components/live/NameGate";
import { CameraStage } from "@/components/live/CameraStage";
import { UploadFallback } from "@/components/live/UploadFallback";
import { ErrorState } from "@/components/live/ErrorStates";
import { ResultCard } from "@/components/live/ResultCard";
import { useCamera } from "@/hooks/useCamera";
import { useFramingHeuristic } from "@/hooks/useFramingHeuristic";
import { useCountdown } from "@/hooks/useCountdown";
import { useLiveCheckMachine } from "@/hooks/useLiveCheckMachine";

function captureFrame(video: HTMLVideoElement): string {
  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext("2d")?.drawImage(video, 0, 0);
  return canvas.toDataURL("image/jpeg", 0.9);
}

export default function LivePage() {
  const machine = useLiveCheckMachine();
  const { state } = machine;
  const camera = useCamera();
  const framing = useFramingHeuristic(camera.videoRef, state.phase === "framing" || state.phase === "ready");
  const countdownActive = state.phase === "countdown";
  const readyDispatchedRef = useRef(false);

  // Request the camera when entering requesting-camera, but skip re-asking
  // permission if the stream is already open from a previous fit (§51:
  // "NEXT FIT" should not force a fresh permission prompt mid-showcase).
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

  const countdownCount = useCountdown(
    3,
    () => {
      const video = camera.videoRef.current;
      if (video) machine.submitCapture(captureFrame(video), state.participantName, "live");
    },
    countdownActive
  );

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
          onImageSelected={(dataUrl) => machine.submitCapture(dataUrl, state.participantName || "Guest", "upload")}
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
          title="We couldn't analyze your fit right now."
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
        phase={state.phase === "requesting-camera" ? "framing" : (state.phase as "framing" | "ready" | "countdown" | "analyzing")}
        framingStatus={framing.status}
        countdownCount={countdownCount}
        onConfirmReady={machine.startCountdown}
      />
    </PageShell>
  );
}
