import { defineTool } from "@lovable.dev/mcp-js";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

function publicSupabase() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}

export default defineTool({
  name: "search_jobs",
  title: "Search jobs",
  description:
    "Search the public JD Careers job board. Filter by keyword (matches title, employer, description), category, location, remote type, employment type, or JD-advantage/non-practicing-attorney flags. Returns up to 25 active, published jobs ordered by most recently posted.",
  inputSchema: {
    query: z
      .string()
      .trim()
      .max(200)
      .optional()
      .describe("Free-text keyword matched against job title, employer name, and description."),
    category: z.string().trim().max(100).optional().describe("Job category (e.g. 'Legal Operations', 'Compliance')."),
    location: z.string().trim().max(100).optional().describe("Location substring (e.g. 'New York', 'Remote')."),
    remote_type: z
      .enum(["remote", "hybrid", "onsite"])
      .optional()
      .describe("Filter by remote arrangement."),
    employment_type: z
      .string()
      .trim()
      .max(50)
      .optional()
      .describe("Employment type (e.g. 'full-time', 'contract')."),
    jd_advantage_only: z.boolean().optional().describe("Only return jobs flagged as JD-advantage roles."),
    non_practicing_only: z
      .boolean()
      .optional()
      .describe("Only return roles designed for non-practicing attorneys."),
    limit: z.number().int().min(1).max(25).optional().describe("Max results (1–25, default 10)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (input) => {
    const supabase = publicSupabase();
    let q = supabase
      .from("jobs")
      .select(
        "id,title,employer_name,location,remote_type,employment_type,category,salary_display,short_summary,date_posted,is_jd_advantage,is_non_practicing_attorney_role,source_url",
      )
      .eq("is_active", true)
      .eq("status", "published")
      .order("date_posted", { ascending: false })
      .limit(input.limit ?? 10);

    if (input.category) q = q.ilike("category", `%${input.category}%`);
    if (input.location) q = q.ilike("location", `%${input.location}%`);
    if (input.remote_type) q = q.eq("remote_type", input.remote_type);
    if (input.employment_type) q = q.ilike("employment_type", `%${input.employment_type}%`);
    if (input.jd_advantage_only) q = q.eq("is_jd_advantage", true);
    if (input.non_practicing_only) q = q.eq("is_non_practicing_attorney_role", true);
    if (input.query) {
      const term = input.query.replace(/[%,]/g, " ");
      q = q.or(
        `title.ilike.%${term}%,employer_name.ilike.%${term}%,description.ilike.%${term}%`,
      );
    }

    const { data, error } = await q;
    if (error) {
      return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
    }
    const rows = data ?? [];
    return {
      content: [
        {
          type: "text",
          text:
            rows.length === 0
              ? "No matching jobs found."
              : `Found ${rows.length} job(s):\n\n${rows
                  .map(
                    (j) =>
                      `• ${j.title} — ${j.employer_name} (${j.location}${j.remote_type ? `, ${j.remote_type}` : ""})\n  ${j.short_summary ?? ""}\n  id: ${j.id}`,
                  )
                  .join("\n\n")}`,
        },
      ],
      structuredContent: { jobs: rows },
    };
  },
});
