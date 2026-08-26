import "server-only";
import { isSupabaseConfigured } from "@/lib/env";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { mockStore } from "@/lib/mockStore";
import type { FitCheck } from "@/types/database";

export async function insertFitCheck(
  data: Omit<FitCheck, "id" | "created_at">
): Promise<FitCheck> {
  if (!isSupabaseConfigured()) {
    return mockStore.insertFitCheck(data);
  }

  const { data: row, error } = await getSupabaseAdminClient()
    .from("fit_checks")
    .insert(data)
    .select()
    .single();

  if (error) throw new Error(`Failed to save fit check: ${error.message}`);
  return row as FitCheck;
}

export async function listFitChecksByUser(userId: string): Promise<FitCheck[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const { data, error } = await getSupabaseAdminClient()
    .from("fit_checks")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Failed to load fit check history: ${error.message}`);
  return (data ?? []) as FitCheck[];
}

export async function getFitCheckById(id: string): Promise<FitCheck | null> {
  if (!isSupabaseConfigured()) {
    return mockStore.getFitCheckById(id) ?? null;
  }

  const { data, error } = await getSupabaseAdminClient()
    .from("fit_checks")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`Failed to load fit check: ${error.message}`);
  return (data as FitCheck) ?? null;
}
