import { PageShell } from "@/components/layout/PageShell";
import { EditorialHeading } from "@/components/ui/EditorialHeading";
import { Button } from "@/components/ui/Button";
import { InitialsAvatar } from "@/components/ui/InitialsAvatar";
import { OutfitCard } from "@/components/discover/OutfitCard";
import { ScoreBadge } from "@/components/ui/ScoreBadge";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { formatTime, formatScore } from "@/lib/utils";
import { isSupabaseConfigured } from "@/lib/env";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { listFitChecksByUser, getUserFitStats } from "@/lib/repositories/fitChecksRepo";
import { getStreakForCurrentUser } from "@/lib/repositories/streaksRepo";
import { listSavedOutfitsForCurrentUser } from "@/lib/repositories/outfitsRepo";

// Per-user data behind auth cookies — always render per request.
export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  if (!isSupabaseConfigured()) {
    return (
      <PageShell className="py-24 text-center">
        <EditorialHeading as="h1" className="text-center">
          Guest mode
        </EditorialHeading>
        <p className="mx-auto mt-4 max-w-sm text-near-black/70">
          Profiles need an account. You can still take a Live Fit Check and enter today&rsquo;s leaderboard without
          signing in.
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
          Sign in to see your profile
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

  const displayName = (data.user.user_metadata?.display_name as string | undefined) || data.user.email || "You";
  const [history, saved, stats, streak] = await Promise.all([
    listFitChecksByUser(data.user.id),
    listSavedOutfitsForCurrentUser(),
    getUserFitStats(data.user.id),
    getStreakForCurrentUser(),
  ]);

  const statCards: { label: string; value: string }[] = [
    { label: "Fit Checks", value: String(stats.total) },
    { label: "Best Score", value: stats.best != null ? formatScore(stats.best) : "—" },
    { label: "Average", value: stats.average != null ? formatScore(stats.average) : "—" },
    { label: "Current Streak", value: `${streak?.current_streak ?? 0}🔥` },
    { label: "Longest Streak", value: String(streak?.longest_streak ?? 0) },
  ];

  return (
    <PageShell className="py-14 md:py-20">
      <div className="flex items-center justify-between gap-5">
        <div className="flex items-center gap-5">
          <InitialsAvatar name={displayName} className="h-16 w-16 text-xl" />
          <div>
            <p className="font-display text-2xl text-near-black">{displayName}</p>
            <p className="text-sm text-near-black/50">{data.user.email}</p>
          </div>
        </div>
        <LogoutButton />
      </div>

      <section className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {statCards.map((card) => (
          <div key={card.label} className="rounded-sm border border-stone/60 bg-warm-white px-4 py-3 text-center">
            <p className="font-display text-2xl text-near-black">{card.value}</p>
            <p className="mt-1 text-[11px] uppercase tracking-wide text-near-black/50">{card.label}</p>
          </div>
        ))}
      </section>

      <section className="mt-12">
        <p className="mb-4 text-xs uppercase tracking-[0.2em] text-accent-500">Fit Check History</p>
        {history.length === 0 ? (
          <p className="text-near-black/50">No fit checks yet.</p>
        ) : (
          <ul className="divide-y divide-stone/60 border-y border-stone/60">
            {history.map((fitCheck) => (
              <li key={fitCheck.id} className="flex items-center justify-between gap-4 py-3">
                <span className="text-near-black">{fitCheck.style ?? "Fit Check"}</span>
                <span className="text-sm text-near-black/40">{formatTime(fitCheck.created_at)}</span>
                <ScoreBadge score={fitCheck.score} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-12">
        <p className="mb-4 text-xs uppercase tracking-[0.2em] text-accent-500">Saved Outfits</p>
        {saved.length === 0 ? (
          <p className="text-near-black/50">Nothing saved yet — browse Discover to save fits you like.</p>
        ) : (
          <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
            {saved.map((outfit) => (
              <OutfitCard key={outfit.id} outfit={outfit} />
            ))}
          </div>
        )}
      </section>
    </PageShell>
  );
}
