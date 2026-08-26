"use client";

import { useCallback, useEffect, useState } from "react";

export function useFullscreen(ref: React.RefObject<HTMLElement | null>) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleChange = () => setIsFullscreen(document.fullscreenElement === ref.current);
    document.addEventListener("fullscreenchange", handleChange);
    return () => document.removeEventListener("fullscreenchange", handleChange);
  }, [ref]);

  const enter = useCallback(async () => {
    if (ref.current && !document.fullscreenElement) {
      await ref.current.requestFullscreen?.().catch(() => {});
    }
  }, [ref]);

  const exit = useCallback(async () => {
    if (document.fullscreenElement) {
      await document.exitFullscreen?.().catch(() => {});
    }
  }, []);

  const toggle = useCallback(() => (isFullscreen ? exit() : enter()), [isFullscreen, enter, exit]);

  return { isFullscreen, enter, exit, toggle };
}
