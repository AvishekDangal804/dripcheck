import { PageShell } from "@/components/layout/PageShell";
import { EditorialHeading } from "@/components/ui/EditorialHeading";
import { Button } from "@/components/ui/Button";
import { ClosetView } from "@/components/closet/ClosetView";
import { isSupabaseConfigured } from "@/lib/env";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { listCloset } from "@/lib/repositories/closetRepo";
import { CLOSET_AI_IS_REAL } from "@/services/closet/identifyItem";

export const dynamic = "force-dynamic";

export default async function ClosetPage() {
  if (!isSupabaseConfigured()) {
    return (
      <PageShell className="py-24 text-center">
        <EditorialHeading as="h1" className="text-center">
          Closet needs an account
        </EditorialHeading>
        <p className="mx-auto mt-4 max-w-sm text-near-black/70">
          Your closet is private to you, so it needs a signed-in account and a connected database.
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
          Sign in to open your closet
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

  const items = await listCloset(data.user.id);

  return (
    <PageShell className="py-14 md:py-20">
      <EditorialHeading eyebrow="My Closet" as="h1">
        The clothes you actually own.
      </EditorialHeading>
      <p className="mt-3 max-w-md text-near-black/60">
        Add photos of your pieces. DripCheck tags each one and builds fits using only what&rsquo;s in here.
      </p>

      <div className="mt-10">
        <ClosetView initialItems={items} aiReal={CLOSET_AI_IS_REAL} />
      </div>
    </PageShell>
  );
}
