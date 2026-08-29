import { PageShell } from "@/components/layout/PageShell";
import { EditorialHeading } from "@/components/ui/EditorialHeading";
import { Button } from "@/components/ui/Button";
import { CreateAFitView } from "@/components/closet/CreateAFitView";
import { isSupabaseConfigured } from "@/lib/env";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { listCloset } from "@/lib/repositories/closetRepo";

export const dynamic = "force-dynamic";

export default async function CreateAFitPage() {
  if (!isSupabaseConfigured()) {
    return (
      <PageShell className="py-24 text-center">
        <EditorialHeading as="h1" className="text-center">
          Create a Fit needs an account
        </EditorialHeading>
        <p className="mx-auto mt-4 max-w-sm text-near-black/70">
          This builds outfits from clothes you&rsquo;ve added to your closet, so it needs a signed-in account.
        </p>
        <Button href="/live" size="lg" className="mt-6">
          Try Live Fit Check
        </Button>
      </PageShell>
    );
  }

  const supabase = await getSupabaseServerClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    return (
      <PageShell className="py-24 text-center">
        <EditorialHeading as="h1" className="text-center">
          Sign in to build fits
        </EditorialHeading>
        <div className="mt-6 flex justify-center gap-3">
          <Button href="/login" size="lg">
            Log In
          </Button>
          <Button href="/signup" variant="secondary" size="lg">
            Sign Up
          </Button>
        </div>
      </PageShell>
    );
  }

  const closet = await listCloset(data.user.id);
  const hasTop = closet.some((i) => i.category === "tshirt" || i.category === "shirt");
  const hasBottom = closet.some((i) => i.category === "pants" || i.category === "jeans" || i.category === "shorts");

  return (
    <PageShell className="py-14 md:py-20">
      <EditorialHeading eyebrow="Create a Fit" as="h1">
        Build a fit from your closet.
      </EditorialHeading>
      <p className="mt-3 max-w-md text-near-black/60">
        Every combination uses only clothes you&rsquo;ve added. Pick a vibe or an occasion and DripCheck puts the
        pieces together.
      </p>

      <div className="mt-10">
        <CreateAFitView hasClosetBasics={hasTop && hasBottom} />
      </div>
    </PageShell>
  );
}
