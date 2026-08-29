import { PageShell } from "@/components/layout/PageShell";
import { EditorialHeading } from "@/components/ui/EditorialHeading";
import { DiscoverTabs } from "@/components/discover/DiscoverTabs";
import { OutfitCard } from "@/components/discover/OutfitCard";
import { listOutfits } from "@/lib/repositories/outfitsRepo";
import { DISCOVER_TABS, type DiscoverTab } from "@/types/outfit";

// Newly promoted outfits should show up without a redeploy.
export const dynamic = "force-dynamic";

function isDiscoverTab(value: string | undefined): value is DiscoverTab {
  return DISCOVER_TABS.some((tab) => tab.key === value);
}

export default async function DiscoverPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const params = await searchParams;
  const tab: DiscoverTab = isDiscoverTab(params.tab) ? params.tab : "trending";
  const outfits = await listOutfits(tab);

  return (
    <PageShell className="py-14 md:py-20">
      <EditorialHeading eyebrow="Discover" as="h1">
        See what campus is wearing.
      </EditorialHeading>

      <div className="mt-8">
        <DiscoverTabs active={tab} />
      </div>

      {outfits.length === 0 ? (
        <p className="mt-10 text-near-black/50">No fits here yet. Be the first to check yours.</p>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-5 md:grid-cols-4">
          {outfits.map((outfit) => (
            <OutfitCard key={outfit.id} outfit={outfit} />
          ))}
        </div>
      )}
    </PageShell>
  );
}
