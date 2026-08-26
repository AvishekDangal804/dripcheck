import "server-only";
import type { FitCheck, LeaderboardEntry, Outfit, RankedLeaderboardEntry } from "@/types/database";

// In-process fallback data store, used only when isSupabaseConfigured() is
// false (lib/env.ts). Lets the whole app — leaderboard, Top 3, Discover —
// work end to end with zero external services during local development or
// a showcase run before a Supabase project exists. State resets whenever
// the dev/prod server process restarts; that's expected for a mock store.

function seedOutfits(): Outfit[] {
  const now = Date.now();
  // image_url uses the "placeholder:<seed>" scheme for editorial/seed
  // entries with no real photo — components/discover/OutfitCard.tsx renders
  // these as a generated EditorialVisual instead of an <img>. Real fit-check
  // submissions always have an actual storage/data URL here instead.
  const seed: Array<Omit<Outfit, "id" | "created_at">> = [
    {
      fit_check_id: null,
      name: "Clean Streetwear",
      image_url: "placeholder:streetwear",
      score: 9.1,
      style: "Streetwear",
      description:
        "Oversized neutral tee, relaxed trousers, and white sneakers keep this look sharp without trying hard.",
    },
    {
      fit_check_id: null,
      name: "Old Money Morning",
      image_url: "placeholder:old-money",
      score: 8.9,
      style: "Old Money",
      description: "A knit polo and tailored chinos read effortless and put-together in equal measure.",
    },
    {
      fit_check_id: null,
      name: "Minimal Monochrome",
      image_url: "placeholder:simple",
      score: 8.7,
      style: "Simple",
      description: "One tone, clean lines. Proof that restraint is its own kind of statement.",
    },
    {
      fit_check_id: null,
      name: "Campus Formal",
      image_url: "placeholder:formal",
      score: 8.6,
      style: "Formal",
      description:
        "A structured blazer over a plain shirt makes a presentation-ready fit that still feels like you.",
    },
    {
      fit_check_id: null,
      name: "Everyday Casual",
      image_url: "placeholder:casual",
      score: 8.4,
      style: "Casual",
      description: "Denim and a soft overshirt — comfortable enough for a full day of classes, styled enough to notice.",
    },
  ];

  return seed.map((outfit, index) => ({
    ...outfit,
    id: `seed-outfit-${index}`,
    created_at: new Date(now - index * 3_600_000).toISOString(),
  }));
}

interface MockDb {
  fitChecks: FitCheck[];
  leaderboardEntries: LeaderboardEntry[];
  outfits: Outfit[];
}

const globalForMockStore = globalThis as unknown as { __dripcheckMockDb?: MockDb };

function getDb(): MockDb {
  if (!globalForMockStore.__dripcheckMockDb) {
    globalForMockStore.__dripcheckMockDb = {
      fitChecks: [],
      leaderboardEntries: [],
      outfits: seedOutfits(),
    };
  }
  return globalForMockStore.__dripcheckMockDb;
}

function isToday(isoDate: string): boolean {
  const date = new Date(isoDate);
  const now = new Date();
  return (
    date.getUTCFullYear() === now.getUTCFullYear() &&
    date.getUTCMonth() === now.getUTCMonth() &&
    date.getUTCDate() === now.getUTCDate()
  );
}

export const mockStore = {
  insertFitCheck(fitCheck: Omit<FitCheck, "id" | "created_at">): FitCheck {
    const record: FitCheck = {
      ...fitCheck,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    };
    getDb().fitChecks.unshift(record);
    return record;
  },

  insertLeaderboardEntry(entry: Omit<LeaderboardEntry, "id" | "created_at">): LeaderboardEntry {
    const record: LeaderboardEntry = {
      ...entry,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    };
    getDb().leaderboardEntries.unshift(record);
    return record;
  },

  getTodayLeaderboard(): RankedLeaderboardEntry[] {
    return getDb()
      .leaderboardEntries.filter((entry) => isToday(entry.created_at))
      .sort((a, b) => b.score - a.score || (a.created_at < b.created_at ? -1 : 1))
      .map((entry, index) => ({
        ...entry,
        rank: index + 1,
        style: getDb().fitChecks.find((fc) => fc.id === entry.fit_check_id)?.style ?? null,
      }));
  },

  getFitCheckById(id: string): FitCheck | undefined {
    return getDb().fitChecks.find((fc) => fc.id === id);
  },

  listOutfits(): Outfit[] {
    return getDb().outfits;
  },
};
