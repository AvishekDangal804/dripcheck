"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";

export default function LiveError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[dripcheck] live error", error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-5 px-6 text-center">
      <p className="font-display text-3xl text-near-black">The fit check hit a snag.</p>
      <p className="text-near-black/60">
        Your camera is fine — this was an app error. Restart the check and try again.
      </p>
      <div className="flex gap-3">
        <Button onClick={reset} size="lg">
          Restart Fit Check
        </Button>
        <Button href="/" variant="secondary" size="lg">
          Home
        </Button>
      </div>
    </main>
  );
}
