export function StorySection({ eyebrow, children }: { eyebrow: string; children: React.ReactNode }) {
  return (
    <section className="border-b border-stone/60 py-12 md:py-16">
      <p className="mb-4 text-xs font-medium uppercase tracking-[0.25em] text-accent-500">{eyebrow}</p>
      <div className="max-w-2xl space-y-4 text-near-black/80">{children}</div>
    </section>
  );
}
