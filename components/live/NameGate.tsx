"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { EditorialHeading } from "@/components/ui/EditorialHeading";

export function NameGate({ onSubmit }: { onSubmit: (name: string) => void }) {
  const [name, setName] = useState("");

  return (
    <form
      className="mx-auto flex max-w-sm flex-col items-center gap-6 py-24 text-center"
      onSubmit={(e) => {
        e.preventDefault();
        const trimmed = name.trim();
        if (trimmed) onSubmit(trimmed);
      }}
    >
      <EditorialHeading eyebrow="Live Fit Check" as="h1" className="text-center">
        What&rsquo;s your name?
      </EditorialHeading>

      <label htmlFor="participant-name" className="sr-only">
        Enter your name
      </label>
      <input
        id="participant-name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter your name"
        maxLength={40}
        autoFocus
        className="w-full border-b border-near-black/30 bg-transparent px-2 py-3 text-center font-display text-2xl text-near-black outline-none focus:border-accent-500"
      />

      <Button type="submit" size="lg" disabled={!name.trim()}>
        Start Fit Check
      </Button>

      <p className="max-w-xs text-xs text-near-black/50">
        Your camera is only used for this fit check. Your captured photo may be shown publicly on the leaderboard
        and Discover.
      </p>
    </form>
  );
}
