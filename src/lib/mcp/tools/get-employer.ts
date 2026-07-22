import { defineTool } from "@lovable.dev/mcp-js";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

export default defineTool({
  name: "get_employer",
  title: "Get employer details",
  description:
    "Fetch a single employer by id or slug, including description, website, headquarters, and currently active job openings at that employer.",
  inputSchema: {
    id: z.string().uuid().optional().describe("Employer id."),
    slug: z.string().trim().max(120).optional().describe("Employer slug (alternative to id)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ id, slug }) => {
    if (!id && !slug) {
      return { content: [{ type: "text", text: "Provide either id or slug." }], isError: true };
    }
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
    const empQ = supabase.from("employers").select("*");
    const { data: employer, error } = await (id ? empQ.eq("id", id) : empQ.eq("slug", slug!)).maybeSingle();
    if (error) {
      return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
    }
    if (!employer) {
      return { content: [{ type: "text", text: "Employer not found." }], isError: true };
    }
    const { data: jobs } = await supabase
      .from("jobs")
      .select("id,title,location,remote_type,date_posted")
      .eq("employer_id", employer.id)
      .eq("is_active", true)
      .eq("status", "published")
      .order("date_posted", { ascending: false })
      .limit(20);

    return {
      content: [
        {
          type: "text",
          text: `${employer.name}${employer.employer_type ? ` [${employer.employer_type}]` : ""}${employer.headquarters ? `\nHQ: ${employer.headquarters}` : ""}${employer.website ? `\nWeb: ${employer.website}` : ""}\n\n${employer.description ?? ""}\n\nOpen roles (${jobs?.length ?? 0}):\n${(jobs ?? []).map((j) => `• ${j.title} — ${j.location} (id: ${j.id})`).join("\n") || "  (none)"}`,
        },
      ],
      structuredContent: { employer, open_jobs: jobs ?? [] },
    };
  },
});
