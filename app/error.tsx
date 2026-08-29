"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";

export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[dripcheck] route error", error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-5 px-6 text-center">
      <p className="font-display text-3xl text-near-black">Something glitched.</p>
      <p className="text-near-black/60">That page hit an error. You can retry, or head back to the start.</p>
      <div className="flex gap-3">
        <Button onClick={reset} size="lg">
          Try Again
        </Button>
        <Button href="/" variant="secondary" size="lg">
          Home
        </Button>
      </div>
    </main>
  );
}
