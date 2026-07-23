import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { runIngestion } from "./run-dry-run.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SOURCES_PATH = path.join(__dirname, "sources.json");
const REPORT_DIR = path.join(__dirname, "reports");
const REPORT_PATH = path.join(REPORT_DIR, "latest-live.json");

const WRITABLE_JOB_FIELDS = [
  "title",
  "employer_id",
  "employer_name",
  "location",
  "remote_type",
  "employment_type",
  "salary_min",
  "salary_max",
  "salary_display",
  "description",
  "short_summary",
  "category",
  "subcategory",
  "tags",
  "is_jd_advantage",
  "is_non_practicing_attorney_role",
  "source_url",
  "source_type",
  "date_posted",
  "expiration_date",
  "is_active",
  "featured",
  "requirements",
  "source_name",
  "imported_at",
  "status",
];

function loadLocalEnv(value) {
  for (const line of value.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match) continue;
    const [, key, rawValue] = match;
    if (process.env[key]) continue;
    process.env[key] = rawValue.replace(/^["']|["']$/g, "");
  }
}

async function loadEnvFiles() {
  for (const filename of [".env.local", ".env"]) {
    try {
      loadLocalEnv(await fs.readFile(path.join(__dirname, "..", filename), "utf8"));
    } catch {
      // Environment files are optional; GitHub Actions should use repository secrets.
    }
  }
}

function slugify(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function pickJobFields(job) {
  const writable = {};
  for (const field of WRITABLE_JOB_FIELDS) {
    if (field in job) writable[field] = job[field];
  }
  return writable;
}

function createSupabaseRestClient(supabaseUrl, serviceRoleKey) {
  const baseUrl = supabaseUrl.replace(/\/$/, "");
  const headers = {
    apikey: serviceRoleKey,
    authorization: `Bearer ${serviceRoleKey}`,
    "content-type": "application/json",
  };

  async function request(method, table, params = [], body = null, prefer = null) {
    const query = new URLSearchParams(params);
    const response = await fetch(`${baseUrl}/rest/v1/${table}?${query}`, {
      method,
      headers: {
        ...headers,
        ...(prefer ? { prefer } : {}),
      },
      body: body ? JSON.stringify(body) : null,
    });
    const text = await response.text();
    const json = text ? JSON.parse(text) : null;
    if (!response.ok) {
      throw new Error(json?.message ?? json?.error ?? `${method} ${table} failed with ${response.status}`);
    }
    return json;
  }

  return {
    select: (table, params) => request("GET", table, params),
    insert: (table, body, params = []) => request("POST", table, params, body, "return=representation"),
    update: (table, body, params = []) => request("PATCH", table, params, body, "return=representation"),
  };
}

function flattenAcceptedJobs(report) {
  return report.sources.flatMap((source) => source.accepted.map((job) => ({
    ...job,
    source_name: job.source_name ?? source.company,
  })));
}

async function loadEmployerMap(supabase, sources) {
  const data = await supabase.select("employers", [["select", "id,name,slug"]]);

  const bySlug = new Map((data ?? []).map((employer) => [employer.slug, employer]));
  const byName = new Map((data ?? []).map((employer) => [employer.name.toLowerCase(), employer]));

  for (const source of sources) {
    const existing = bySlug.get(source.employerSlug) ?? byName.get(source.company.toLowerCase());
    if (existing) {
      bySlug.set(source.employerSlug, existing);
      byName.set(source.company.toLowerCase(), existing);
      continue;
    }

    const insertedRows = await supabase
      .insert("employers", {
        name: source.company,
        slug: source.employerSlug,
        website: new URL(source.careersUrl).origin,
      }, [["select", "id,name,slug"]]);
    const inserted = insertedRows[0];
    bySlug.set(inserted.slug, inserted);
    byName.set(inserted.name.toLowerCase(), inserted);
  }

  return { bySlug, byName };
}

async function findExistingJob(supabase, job) {
  if (!job.source_url) return null;
  const data = await supabase.select("jobs", [
    ["select", "id,title,employer_name,source_url"],
    ["source_url", `eq.${job.source_url}`],
    ["limit", "10"],
  ]);

  return (data ?? []).find((candidate) =>
    candidate.title.toLowerCase() === job.title.toLowerCase()
    && candidate.employer_name.toLowerCase() === job.employer_name.toLowerCase()
  ) ?? null;
}

async function publishJobs(supabase, report, sources, employerMap) {
  const now = new Date().toISOString();
  const companySlug = new Map(sources.map((source) => [source.company, source.employerSlug]));
  const summary = { inserted: 0, updated: 0, failed: 0, failures: [] };

  for (const job of flattenAcceptedJobs(report)) {
    const slug = companySlug.get(job.employer_name) ?? slugify(job.employer_name);
    const employer = employerMap.bySlug.get(slug) ?? employerMap.byName.get(job.employer_name.toLowerCase());
    const payload = pickJobFields({
      ...job,
      employer_id: employer?.id ?? null,
      status: "published",
      is_active: true,
      expiration_date: null,
      imported_at: now,
    });

    try {
      const existing = await findExistingJob(supabase, payload);
      if (existing) {
        await supabase.update("jobs", payload, [["id", `eq.${existing.id}`]]);
        summary.updated += 1;
      } else {
        await supabase.insert("jobs", payload);
        summary.inserted += 1;
      }
    } catch (error) {
      summary.failed += 1;
      summary.failures.push({
        title: job.title,
        employer_name: job.employer_name,
        source_url: job.source_url,
        error: error.message,
      });
    }
  }

  return summary;
}

async function expireMissingJobs(supabase, report) {
  const today = new Date().toISOString().slice(0, 10);
  const summary = { expired: 0, sources: [] };

  for (const source of report.sources) {
    const sourceRanSuccessfully = source.errors.length === 0 && source.robots?.status !== "blocked" && source.discovered > 0;
    if (!sourceRanSuccessfully) continue;

    const acceptedUrls = new Set(source.accepted.map((job) => job.source_url).filter(Boolean));
    const missing = await supabase.select("jobs", [
      ["select", "id,source_url"],
      ["source_name", `eq.${source.company}`],
      ["is_active", "eq.true"],
      ["status", "eq.published"],
      ["imported_at", "not.is.null"],
    ]);
    const ids = (missing ?? [])
      .filter((job) => job.source_url && !acceptedUrls.has(job.source_url))
      .map((job) => job.id);
    if (ids.length === 0) continue;

    await supabase.update(
      "jobs",
      { status: "expired", is_active: false, expiration_date: today },
      [["id", `in.(${ids.join(",")})`]],
    );

    summary.expired += ids.length;
    summary.sources.push({ company: source.company, expired: ids.length });
  }

  return summary;
}

async function main() {
  await loadEnvFiles();

  if (process.env.INGEST_WRITE !== "true") {
    throw new Error("Refusing to write. Set INGEST_WRITE=true to publish jobs to Supabase.");
  }

  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing SUPABASE_URL/VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  }

  const sources = JSON.parse(await fs.readFile(SOURCES_PATH, "utf8")).filter((source) => source.enabled);
  const supabase = createSupabaseRestClient(supabaseUrl, serviceRoleKey);

  const report = await runIngestion({ mode: "supabase-live", writeReport: false });
  const employerMap = await loadEmployerMap(supabase, sources);
  const writeSummary = await publishJobs(supabase, report, sources, employerMap);
  const expirationSummary = await expireMissingJobs(supabase, report);

  const liveReport = {
    ...report,
    writeSummary,
    expirationSummary,
    notes: [
      "This report wrote accepted jobs to Supabase because INGEST_WRITE=true was set.",
      "Previously imported jobs are expired only for sources that ran successfully in this run.",
    ],
  };

  await fs.mkdir(REPORT_DIR, { recursive: true });
  await fs.writeFile(REPORT_PATH, `${JSON.stringify(liveReport, null, 2)}\n`);

  console.log(`\nLive ingestion report written to ${path.relative(process.cwd(), REPORT_PATH)}`);
  console.log(JSON.stringify({ ingestion: report.summary, writeSummary, expirationSummary }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
