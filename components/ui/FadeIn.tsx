"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface FadeInProps {
  as?: "div" | "section";
  delayMs?: number;
  className?: string;
  children: React.ReactNode;
}

// Fades in shortly after mount rather than on scroll-into-view. An
// IntersectionObserver-based version left below-the-fold content
// permanently invisible in contexts that never fire a real scroll event
// (headless screenshots, some fullPage capture tools) — content should
// never depend on scroll position to become visible at all.
export function FadeIn({ as = "div", delayMs = 0, className, children }: FadeInProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setVisible(true), delayMs);
    return () => clearTimeout(timeout);
  }, [delayMs]);

  const sharedProps = {
    className: cn(
      "transition-all duration-700 ease-out",
      visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
      className
    ),
  };

  if (as === "section") {
    return <section {...sharedProps}>{children}</section>;
  }

  return <div {...sharedProps}>{children}</div>;
}
