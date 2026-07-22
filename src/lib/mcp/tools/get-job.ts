import { defineTool } from "@lovable.dev/mcp-js";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

export default defineTool({
  name: "get_job",
  title: "Get job details",
  description:
    "Fetch a single JD Careers job listing by id, including full description, requirements, salary, tags, and the source URL to apply.",
  inputSchema: {
    id: z.string().uuid().describe("Job id returned by search_jobs."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ id }) => {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .eq("id", id)
      .eq("is_active", true)
      .eq("status", "published")
      .maybeSingle();
    if (error) {
      return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
    }
    if (!data) {
      return { content: [{ type: "text", text: "Job not found or no longer active." }], isError: true };
    }
    return {
      content: [
        {
          type: "text",
          text: `${data.title} — ${data.employer_name}\nLocation: ${data.location}${data.remote_type ? ` (${data.remote_type})` : ""}\nEmployment: ${data.employment_type}\nCategory: ${data.category}${data.salary_display ? `\nSalary: ${data.salary_display}` : ""}\nPosted: ${data.date_posted}\nApply: ${data.source_url ?? "(no URL)"}\n\n${data.description}`,
        },
      ],
      structuredContent: { job: data },
    };
  },
});
