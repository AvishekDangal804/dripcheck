"use client";

import { useCallback, useRef, useState } from "react";

export type CameraError = "denied" | "no-device" | "unknown";

interface UseCameraResult {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isActive: boolean;
  error: CameraError | null;
  start: () => Promise<void>;
  stop: () => void;
}

// No digital zoom, no cropping tricks — requests the camera at its natural
// aspect ratio and displays the raw stream. See §13 of the product brief:
// the user should feel like they're looking through a normal camera.
export function useCamera(): UseCameraResult {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<CameraError | null>(null);

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setIsActive(false);
  }, []);

  const start = useCallback(async () => {
    setError(null);

    if (!navigator.mediaDevices?.getUserMedia) {
      setError("no-device");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 1280 } },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsActive(true);
    } catch (err) {
      const name = err instanceof DOMException ? err.name : "unknown";
      if (name === "NotAllowedError" || name === "PermissionDeniedError") {
        setError("denied");
      } else if (name === "NotFoundError" || name === "DevicesNotFoundError") {
        setError("no-device");
      } else {
        setError("unknown");
      }
    }
  }, []);

  return { videoRef, isActive, error, start, stop };
}
