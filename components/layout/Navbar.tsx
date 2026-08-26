"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { BRAND_NAME, NAV_LINKS } from "@/lib/constants";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-stone/60 bg-warm-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8">
        <Link href="/" className="font-display text-xl tracking-[0.15em] text-near-black">
          {BRAND_NAME}
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm uppercase tracking-wide text-near-black/70 transition-colors hover:text-accent-600",
                pathname === link.href && "text-accent-600"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          <Link href="/profile" className="text-sm uppercase tracking-wide text-near-black/70 hover:text-accent-600">
            Profile
          </Link>
          <Button href="/live" size="md">
            Check My Fit
          </Button>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex flex-col gap-1.5 p-2 md:hidden"
          aria-expanded={open}
          aria-label="Toggle menu"
        >
          <span className="h-px w-6 bg-near-black" />
          <span className="h-px w-6 bg-near-black" />
        </button>
      </div>

      {open && (
        <nav className="border-t border-stone/60 bg-warm-white px-5 py-4 md:hidden" aria-label="Mobile">
          <div className="flex flex-col gap-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="text-sm uppercase tracking-wide text-near-black/80"
              >
                {link.label}
              </Link>
            ))}
            <Link href="/profile" onClick={() => setOpen(false)} className="text-sm uppercase tracking-wide text-near-black/80">
              Profile
            </Link>
            <Button href="/live" size="md" className="w-full justify-center">
              Check My Fit
            </Button>
          </div>
        </nav>
      )}
    </header>
  );
}
