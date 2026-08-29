import "server-only";
import type { FitCheck, LeaderboardEntry, Outfit, RankedLeaderboardEntry, Streak } from "@/types/database";
import type { ClosetItem, NewClosetItem } from "@/types/closet";

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
  streaks: Record<string, Streak>;
  closetItems: ClosetItem[];
}

const globalForMockStore = globalThis as unknown as { __dripcheckMockDb?: MockDb };

function getDb(): MockDb {
  if (!globalForMockStore.__dripcheckMockDb) {
    globalForMockStore.__dripcheckMockDb = {
      fitChecks: [],
      leaderboardEntries: [],
      outfits: seedOutfits(),
      streaks: {},
      closetItems: [],
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

  getStreak(userId: string): Streak | null {
    return getDb().streaks[userId] ?? null;
  },

  saveStreak(streak: Streak): Streak {
    getDb().streaks[streak.user_id] = streak;
    return streak;
  },

  getUserFitChecks(userId: string): FitCheck[] {
    return getDb().fitChecks.filter((fc) => fc.user_id === userId);
  },

  listCloset(userId: string): ClosetItem[] {
    return getDb().closetItems.filter((item) => item.user_id === userId);
  },

  addClosetItem(item: NewClosetItem): ClosetItem {
    const record: ClosetItem = { ...item, id: crypto.randomUUID(), created_at: new Date().toISOString() };
    getDb().closetItems.unshift(record);
    return record;
  },

  updateClosetItem(
    id: string,
    userId: string,
    patch: Partial<Pick<ClosetItem, "name" | "category" | "color" | "style" | "pattern">>
  ): ClosetItem {
    const item = getDb().closetItems.find((i) => i.id === id && i.user_id === userId);
    if (!item) throw new Error("Item not found.");
    Object.assign(item, patch);
    return item;
  },

  deleteClosetItem(id: string, userId: string): void {
    const db = getDb();
    db.closetItems = db.closetItems.filter((i) => !(i.id === id && i.user_id === userId));
  },
};
