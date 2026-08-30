import Link from "next/link";
import { BRAND_NAME, BRAND_TAGLINE, NAV_LINKS, DEVELOPERS } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="border-t border-stone/60 bg-warm-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-10 px-5 py-14 md:flex-row md:items-start md:justify-between md:px-8">
        <div>
          <p className="font-display text-2xl tracking-[0.15em] text-near-black">{BRAND_NAME}</p>
          <p className="mt-2 max-w-xs text-sm text-near-black/60">{BRAND_TAGLINE}</p>
        </div>

        <nav className="flex flex-wrap gap-x-8 gap-y-3" aria-label="Footer">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm text-near-black/70 hover:text-accent-600">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="text-sm text-near-black/60">
          <p className="mb-3 uppercase tracking-wide text-near-black/40">Developers</p>
          <div className="space-y-1.5">
            {DEVELOPERS.map((dev) => (
              <p key={dev.name}>{dev.name}</p>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
