import type { FitAnalysis, CheckType } from "./fit-analysis";

export interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
}

export type FitCheckSource = "live" | "upload";

export interface FitCheck {
  id: string;
  participant_name: string;
  user_id: string | null;
  image_url: string;
  check_type: CheckType;
  score: number;
  style: string | null;
  description: string | null;
  analysis_json: FitAnalysis;
  is_public: boolean;
  source: FitCheckSource;
  created_at: string;
  // Denormalised per-category scores (migration 002). NULL when the
  // category was not visible — never 0.
  top_score?: number | null;
  bottom_score?: number | null;
  shoes_score?: number | null;
  accessories_score?: number | null;
  color_score?: number | null;
}

export interface Streak {
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_check_date: string | null;
  updated_at: string;
}

export interface UserFitStats {
  total: number;
  best: number | null;
  average: number | null;
}

export interface LeaderboardEntry {
  id: string;
  fit_check_id: string;
  participant_name: string;
  score: number;
  created_at: string;
}

export interface RankedLeaderboardEntry extends LeaderboardEntry {
  rank: number;
  style: string | null;
}

export interface Outfit {
  id: string;
  fit_check_id: string | null;
  name: string;
  image_url: string;
  score: number | null;
  style: string | null;
  description: string | null;
  created_at: string;
}

export interface Like {
  id: string;
  outfit_id: string;
  user_id: string;
  created_at: string;
}

export interface SavedOutfit {
  id: string;
  outfit_id: string;
  user_id: string;
  created_at: string;
}
