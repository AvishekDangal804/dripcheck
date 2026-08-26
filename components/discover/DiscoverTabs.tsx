import Link from "next/link";
import { cn } from "@/lib/utils";
import { DISCOVER_TABS, type DiscoverTab } from "@/types/outfit";

export function DiscoverTabs({ active }: { active: DiscoverTab }) {
  return (
    <nav className="flex flex-wrap gap-6 border-b border-stone/60 pb-4" aria-label="Discover categories">
      {DISCOVER_TABS.map((tab) => (
        <Link
          key={tab.key}
          href={`/discover?tab=${tab.key}`}
          className={cn(
            "text-sm uppercase tracking-wide text-near-black/50 hover:text-accent-600",
            tab.key === active && "text-accent-600"
          )}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
