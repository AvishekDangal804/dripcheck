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
