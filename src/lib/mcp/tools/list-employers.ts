import { defineTool } from "@lovable.dev/mcp-js";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

export default defineTool({
  name: "list_employers",
  title: "List employers",
  description:
    "List public employers on JD Careers. Optionally filter by name substring or employer type. Returns up to 25 employers alphabetically.",
  inputSchema: {
    query: z.string().trim().max(100).optional().describe("Name substring to match."),
    employer_type: z.string().trim().max(50).optional().describe("Employer type (e.g. 'law-firm', 'in-house', 'legal-tech')."),
    limit: z.number().int().min(1).max(25).optional().describe("Max results (1–25, default 10)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (input) => {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
    let q = supabase
      .from("employers")
      .select("id,name,slug,employer_type,headquarters,website,description")
      .order("name")
      .limit(input.limit ?? 10);
    if (input.query) q = q.ilike("name", `%${input.query}%`);
    if (input.employer_type) q = q.eq("employer_type", input.employer_type);

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
              ? "No employers found."
              : rows
                  .map(
                    (e) =>
                      `• ${e.name}${e.employer_type ? ` [${e.employer_type}]` : ""}${e.headquarters ? ` — ${e.headquarters}` : ""}\n  id: ${e.id} · slug: ${e.slug}`,
                  )
                  .join("\n"),
        },
      ],
      structuredContent: { employers: rows },
    };
  },
});
