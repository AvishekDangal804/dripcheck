"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface FadeInProps {
  as?: "div" | "section";
  delayMs?: number;
  className?: string;
  children: React.ReactNode;
}

export function FadeIn({ as = "div", delayMs = 0, className, children }: FadeInProps) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const sharedProps = {
    style: { transitionDelay: `${delayMs}ms` },
    className: cn(
      "transition-all duration-700 ease-out",
      visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
      className
    ),
  };

  if (as === "section") {
    return (
      <section ref={ref as React.RefObject<HTMLElement>} {...sharedProps}>
        {children}
      </section>
    );
  }

  return (
    <div ref={ref as React.RefObject<HTMLDivElement>} {...sharedProps}>
      {children}
    </div>
  );
}
