"use client";

import { useEffect, useState } from "react";
import { PageShell } from "@/components/layout/PageShell";
import { EditorialHeading } from "@/components/ui/EditorialHeading";
import { VibePicker } from "@/components/wear-today/VibePicker";
import { RandomRevealAnimation } from "@/components/wear-today/RandomRevealAnimation";
import { OutfitTemplateReveal } from "@/components/wear-today/OutfitTemplateReveal";
import { getTemplate, pickRandomVibe, type OutfitTemplate } from "@/services/outfits/vibeTemplates";

type ViewState = { mode: "picker" } | { mode: "revealing"; template: OutfitTemplate } | { mode: "result"; template: OutfitTemplate };

export default function WearTodayPage() {
  const [view, setView] = useState<ViewState>({ mode: "picker" });

  // A vibe card click doesn't navigate, so without this the page keeps
  // whatever scroll position it had, which can leave the reveal content
  // starting underneath the sticky navbar.
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [view.mode]);

  return (
    <PageShell className="py-14 md:py-20">
      {view.mode === "picker" && (
        <>
          <EditorialHeading eyebrow="What Can I Wear Today?" as="h1" className="mb-10 text-center mx-auto">
            What&rsquo;s your vibe today?
          </EditorialHeading>
          <VibePicker
            onSelect={(vibe) => setView({ mode: "result", template: getTemplate(vibe) })}
            onRandom={() => setView({ mode: "revealing", template: pickRandomVibe() })}
          />
        </>
      )}

      {view.mode === "revealing" && (
        <RandomRevealAnimation
          finalLabel={view.template.label}
          onDone={() => setView({ mode: "result", template: view.template })}
        />
      )}

      {view.mode === "result" && (
        <OutfitTemplateReveal template={view.template} onBack={() => setView({ mode: "picker" })} />
      )}
    </PageShell>
  );
}
