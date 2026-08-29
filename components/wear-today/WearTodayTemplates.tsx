"use client";

import { useEffect, useState } from "react";
import { VibePicker } from "@/components/wear-today/VibePicker";
import { RandomRevealAnimation } from "@/components/wear-today/RandomRevealAnimation";
import { OutfitTemplateReveal } from "@/components/wear-today/OutfitTemplateReveal";
import { getTemplate, pickRandomVibe, type OutfitTemplate } from "@/services/outfits/vibeTemplates";

type ViewState =
  | { mode: "picker" }
  | { mode: "revealing"; template: OutfitTemplate }
  | { mode: "result"; template: OutfitTemplate };

// Fallback flow when the user has no closet (or isn't signed in): curated
// vibe templates rather than closet-built outfits.
export function WearTodayTemplates() {
  const [view, setView] = useState<ViewState>({ mode: "picker" });

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [view.mode]);

  if (view.mode === "revealing") {
    return (
      <RandomRevealAnimation
        finalLabel={view.template.label}
        onDone={() => setView({ mode: "result", template: view.template })}
      />
    );
  }

  if (view.mode === "result") {
    return <OutfitTemplateReveal template={view.template} onBack={() => setView({ mode: "picker" })} />;
  }

  return (
    <VibePicker
      onSelect={(vibe) => setView({ mode: "result", template: getTemplate(vibe) })}
      onRandom={() => setView({ mode: "revealing", template: pickRandomVibe() })}
    />
  );
}
