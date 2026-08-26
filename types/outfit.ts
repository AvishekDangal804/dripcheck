export type DiscoverTab = "trending" | "highest-rated" | "newest" | "popular";

export const DISCOVER_TABS: { key: DiscoverTab; label: string }[] = [
  { key: "trending", label: "Trending Fits" },
  { key: "highest-rated", label: "Highest Rated" },
  { key: "newest", label: "Newest" },
  { key: "popular", label: "Popular Styles" },
];
