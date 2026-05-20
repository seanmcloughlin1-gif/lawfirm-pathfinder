import { supabase } from "@/integrations/supabase/client";
import type { TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type JobInsert = TablesInsert<"jobs">;
export type JobUpdate = TablesUpdate<"jobs">;
export type EmployerInsert = TablesInsert<"employers">;
export type EmployerUpdate = TablesUpdate<"employers">;

// ---- Jobs ----
export async function adminListJobs() {
  const { data, error } = await supabase
    .from("jobs")
    .select("*")
    .order("date_posted", { ascending: false });
  if (error) throw error;
  return data;
}

export async function adminGetJob(id: string) {
  const { data, error } = await supabase.from("jobs").select("*").eq("id", id).single();
  if (error) throw error;
  return data;
}

function friendlyJobError(message: string | undefined): string | null {
  if (!message) return null;
  if (message.includes("jobs_dedupe_source_idx") || (message.includes("duplicate key") && message.includes("source_url"))) {
    return "A job with the same title, employer, and source URL already exists.";
  }
  return message;
}

export async function adminCreateJob(payload: JobInsert) {
  const { data, error } = await supabase.from("jobs").insert(payload).select().single();
  return { data, error: friendlyJobError(error?.message) };
}

export async function adminUpdateJob(id: string, payload: JobUpdate) {
  const { data, error } = await supabase
    .from("jobs")
    .update(payload)
    .eq("id", id)
    .select()
    .single();
  return { data, error: friendlyJobError(error?.message) };
}

export async function adminDeleteJob(id: string) {
  const { error } = await supabase.from("jobs").delete().eq("id", id);
  return { error: error?.message ?? null };
}

export async function adminToggleJobActive(id: string, isActive: boolean) {
  const { error } = await supabase.from("jobs").update({ is_active: isActive }).eq("id", id);
  return { error: error?.message ?? null };
}

// ---- Employers ----
export async function adminListEmployers() {
  const { data, error } = await supabase.from("employers").select("*").order("name");
  if (error) throw error;
  return data;
}

export async function adminGetEmployer(id: string) {
  const { data, error } = await supabase.from("employers").select("*").eq("id", id).single();
  if (error) throw error;
  return data;
}

export async function adminCreateEmployer(payload: EmployerInsert) {
  const { data, error } = await supabase.from("employers").insert(payload).select().single();
  return { data, error: error?.message ?? null };
}

export async function adminUpdateEmployer(id: string, payload: EmployerUpdate) {
  const { data, error } = await supabase
    .from("employers")
    .update(payload)
    .eq("id", id)
    .select()
    .single();
  return { data, error: error?.message ?? null };
}

export async function adminDeleteEmployer(id: string) {
  const { error } = await supabase.from("employers").delete().eq("id", id);
  return { error: error?.message ?? null };
}

// ---- Newsletter ----
export async function adminListSubscribers() {
  const { data, error } = await supabase
    .from("newsletter_subscribers")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}
