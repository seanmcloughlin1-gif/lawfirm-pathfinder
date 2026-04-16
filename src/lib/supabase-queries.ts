import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type DbJob = Tables<"jobs">;
export type DbEmployer = Tables<"employers">;

export async function fetchJobs() {
  const { data, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("is_active", true)
    .order("date_posted", { ascending: false });
  if (error) throw error;
  return data;
}

export async function fetchFeaturedJobs() {
  const { data, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("is_active", true)
    .eq("featured", true)
    .order("date_posted", { ascending: false })
    .limit(6);
  if (error) throw error;
  return data;
}

export async function fetchRecentJobs() {
  const { data, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("is_active", true)
    .order("date_posted", { ascending: false })
    .limit(6);
  if (error) throw error;
  return data;
}

export async function fetchJobById(id: string) {
  const { data, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

export async function fetchEmployers() {
  const { data, error } = await supabase
    .from("employers")
    .select("*")
    .order("name");
  if (error) throw error;
  return data;
}

export async function fetchEmployerBySlug(slug: string) {
  const { data, error } = await supabase
    .from("employers")
    .select("*")
    .eq("slug", slug)
    .single();
  if (error) throw error;
  return data;
}

export async function fetchJobsByEmployerId(employerId: string) {
  const { data, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("employer_id", employerId)
    .eq("is_active", true)
    .order("date_posted", { ascending: false });
  if (error) throw error;
  return data;
}

export async function fetchSavedJobs(userId: string) {
  const { data, error } = await supabase
    .from("saved_jobs")
    .select("job_id, jobs(*)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function saveJob(userId: string, jobId: string) {
  const { error } = await supabase
    .from("saved_jobs")
    .insert({ user_id: userId, job_id: jobId });
  return { error: error?.message ?? null };
}

export async function unsaveJob(userId: string, jobId: string) {
  const { error } = await supabase
    .from("saved_jobs")
    .delete()
    .eq("user_id", userId)
    .eq("job_id", jobId);
  return { error: error?.message ?? null };
}

export async function fetchSavedJobIds(userId: string) {
  const { data, error } = await supabase
    .from("saved_jobs")
    .select("job_id")
    .eq("user_id", userId);
  if (error) throw error;
  return new Set((data ?? []).map((d) => d.job_id));
}

export async function subscribeNewsletter(email: string) {
  const { error } = await supabase
    .from("newsletter_subscribers")
    .insert({ email });
  if (error) {
    if (error.code === "23505") return { error: null }; // already subscribed
    return { error: error.message };
  }
  return { error: null };
}

export async function fetchAllLocations() {
  const { data, error } = await supabase
    .from("jobs")
    .select("location")
    .eq("is_active", true);
  if (error) throw error;
  return [...new Set((data ?? []).map((d) => d.location))].sort();
}
