import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SOURCES_PATH = path.join(__dirname, "sources.json");
const REPORT_DIR = path.join(__dirname, "reports");
const REPORT_PATH = path.join(REPORT_DIR, "latest.json");

const MAX_DETAIL_PAGES_PER_SOURCE = Number(process.env.INGEST_MAX_DETAIL_PAGES ?? 25);
const FETCH_TIMEOUT_MS = Number(process.env.INGEST_FETCH_TIMEOUT_MS ?? 20000);

const CATEGORY_RULES = [
  ["legal-operations", ["legal operations", "legal ops", "outside counsel", "matter management", "legal process", "legal department operations"]],
  ["pricing", ["pricing", "alternative fee", "afa", "matter budget", "rate analysis", "profitability"]],
  ["knowledge-management", ["knowledge management", "knowledge lawyer", "precedent", "practice resource", "know-how", "km "]],
  ["compliance", ["compliance", "regulatory", "governance", "aml", "anti-money laundering", "sanctions", "ethics"]],
  ["risk", ["risk management", "risk analyst", "enterprise risk", "business acceptance", "new business risk"]],
  ["conflicts", ["conflicts", "conflict", "new business intake", "business intake", "client intake"]],
  ["ediscovery", ["ediscovery", "e-discovery", "litigation support", "discovery", "document review", "relativity"]],
  ["practice-management", ["practice management", "practice manager", "practice coordinator", "practice group", "attorney support"]],
  ["marketing-bd", ["marketing", "business development", "proposal", "pitch", "communications", "brand"]],
  ["client-development", ["client development", "client relations", "key client", "client success", "account manager"]],
  ["professional-development", ["professional development", "attorney development", "learning and development", "training", "talent development"]],
  ["legal-tech", ["legal tech", "legal technology", "legal engineer", "product counsel", "implementation", "solutions engineer", "ai legal"]],
  ["contracts", ["contract", "contracts", "clm", "commercial legal", "contract lifecycle", "vendor agreement"]],
  ["privacy", ["privacy", "data protection", "dpo", "gdpr", "ccpa", "cybersecurity legal"]],
  ["innovation", ["innovation", "legal innovation", "practice innovation", "innovation counsel", "automation"]],
  ["project-management", ["project management", "project manager", "legal project", "program manager", "pmo"]],
  ["jd-advantage", ["jd advantage", "juris doctor", "law degree", "j.d.", "jd required", "bar admission not required", "non-practicing attorney"]],
  ["hr-talent", ["legal recruiting", "attorney recruiting", "law student recruiting", "legal talent", "professional recruiting"]],
];

const DISALLOWED_GENERAL_CATEGORIES = new Set([
  "hr-talent",
  "marketing-bd",
  "client-development",
]);

const LEGAL_TECH_COMPANIES = new Set([
  "harvey",
  "legora",
  "legalzoom",
  "clio",
  "norm-ai",
  "proof",
  "litera",
  "draftable",
  "linksquares",
]);

const US_LOCATION_HINTS = [
  "united states",
  " usa",
  "u.s.",
  "us-",
  "new york",
  "northern california",
  "silicon valley",
  "orange county",
  "long island",
  "white plains",
  "las vegas",
  "west palm beach",
  "fort lauderdale",
  "miramar",
  "phoenix",
  "charlotte",
  "raleigh",
  "reston",
  "short hills",
  "wilmington",
  "minneapolis",
  "omaha",
  "st. louis",
  "ny",
  "washington",
  "dc",
  "chicago",
  "illinois",
  "boston",
  "massachusetts",
  "california",
  "san francisco",
  "palo alto",
  "los angeles",
  "texas",
  "houston",
  "dallas",
  "austin",
  "miami",
  "florida",
  "philadelphia",
  "atlanta",
  "denver",
  "seattle",
  "remote",
  "hybrid",
];

const NON_US_LOCATION_HINTS = [
  "london",
  "uk",
  "united kingdom",
  "hong kong",
  "singapore",
  "australia",
  "canada",
  "germany",
  "france",
  "brussels",
  "dubai",
  "tokyo",
  "stockholm",
  "paris",
  "amsterdam",
  "berlin",
  "madrid",
  "sydney",
  "melbourne",
];

const NON_PRACTICING_HINTS = [
  "non-practicing",
  "non practicing",
  "jd advantage",
  "legal operations",
  "legal engineer",
  "legal engineering",
  "knowledge management",
  "conflicts",
  "business intake",
  "practice management",
  "professional development",
  "associate development",
  "legal technology",
  "e-discovery",
  "ediscovery",
  "pricing",
  "billing",
  "compliance",
  "risk",
  "contracts",
];

const TITLE_LEGAL_RELEVANCE_HINTS = [
  ...NON_PRACTICING_HINTS,
  "legal",
  "contract",
  "contracts",
  "compliance",
  "privacy",
  "risk",
  "ediscovery",
  "e-discovery",
  "billing",
  "ebilling",
  "tax",
  "hcm",
  "oracle hcm",
  "knowledge",
];

const ATTORNEY_PRACTICE_HINTS = [
  "associate attorney",
  "litigation associate",
  "corporate associate",
  "real estate associate",
  "private equity associate",
  "transactional associate",
  "employment associate",
  "environmental associate",
  "tax associate",
  "patent associate",
  "associate -",
  "attorney",
  "counsel",
  "partner",
];

const NON_JOB_TITLE_PATTERNS = [
  /\bprivacy\b/i,
  /\bterms\b/i,
  /\bcookie\b/i,
  /\bwelcome\b/i,
  /\bour firm\b/i,
  /\bour people\b/i,
  /\bcareers?\b/i,
  /\bopen positions?\b/i,
  /\bjob listings?\b/i,
  /\bcome join us\b/i,
  /\blife at\b/i,
  /\bprofessional staff\b/i,
  /\bbusiness professionals?\b/i,
  /\bempowering exceptional\b/i,
  /\bwork at\b/i,
  /\blet'?s make you official\b/i,
  /^(australia|hong kong sar|singapore|united states|canada|europe|asia)$/i,
];

const NON_JOB_URL_PATTERNS = [
  /\/privacy/i,
  /\/terms/i,
  /\/cookie/i,
  /\/about/i,
  /\/people/i,
  /\/professionals?\/?$/i,
  /\/business-professionals?\/?$/i,
  /\/careers?\/?$/i,
];

const ROLE_TITLE_PATTERNS = [
  /\b(analyst|administrator|assistant|associate|architect|consultant|coordinator|counsel|developer|director|engineer|lead|manager|officer|paralegal|specialist|strategist|technologist)\b/i,
  /\b(head|vp|vice president|senior|principal)\b/i,
];

function normalizeWhitespace(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function decodeEntities(value) {
  return String(value ?? "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ");
}

function stripHtml(html) {
  return normalizeWhitespace(
    decodeEntities(
      String(html ?? "")
        .replace(/<script[\s\S]*?<\/script>/gi, " ")
        .replace(/<style[\s\S]*?<\/style>/gi, " ")
        .replace(/<[^>]+>/g, " "),
    ),
  );
}

function slugify(value) {
  return normalizeWhitespace(value)
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function uniqueBy(items, keyFn) {
  const seen = new Set();
  const out = [];
  for (const item of items) {
    const key = keyFn(item);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

async function fetchText(url, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      method: options.method ?? "GET",
      body: options.body,
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "user-agent": "JD Careers dry-run ingestion bot; contact site owner for questions",
        accept: "text/html,application/json;q=0.9,*/*;q=0.8",
        ...options.headers,
      },
    });
    const text = await response.text();
    return { ok: response.ok, status: response.status, url: response.url, text };
  } catch (error) {
    return { ok: false, status: 0, url, text: "", error: error.message };
  } finally {
    clearTimeout(timer);
  }
}

async function fetchJson(url, options = {}) {
  const response = await fetchText(url, {
    ...options,
    headers: {
      accept: "application/json",
      ...options.headers,
    },
  });
  if (!response.ok) return { ...response, json: null };
  try {
    return { ...response, json: JSON.parse(response.text) };
  } catch (error) {
    return { ...response, ok: false, json: null, error: `Invalid JSON: ${error.message}` };
  }
}

async function checkRobots(targetUrl) {
  const url = new URL(targetUrl);
  const robotsUrl = `${url.origin}/robots.txt`;
  const response = await fetchText(robotsUrl);
  if (!response.ok) {
    return {
      status: "manual_review",
      message: `Could not verify robots.txt (${response.status || response.error || "fetch failed"})`,
    };
  }

  const pathName = url.pathname || "/";
  const lines = response.text.split(/\r?\n/);
  let applies = false;
  let disallowed = false;
  for (const rawLine of lines) {
    const line = rawLine.split("#")[0].trim();
    if (!line) continue;
    const [keyRaw, ...rest] = line.split(":");
    const key = keyRaw?.trim().toLowerCase();
    const value = rest.join(":").trim();
    if (key === "user-agent") {
      applies = value === "*" || /bot|crawler|spider/i.test(value);
      continue;
    }
    if (applies && key === "disallow" && value && pathName.startsWith(value)) {
      disallowed = true;
    }
  }

  return disallowed
    ? { status: "blocked", message: `robots.txt disallows ${pathName}` }
    : { status: "ok", message: "robots.txt did not disallow this path" };
}

function extractLinks(html, baseUrl) {
  const links = [];
  const anchorRegex = /<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let match;
  while ((match = anchorRegex.exec(html))) {
    const href = decodeEntities(match[1]);
    const text = stripHtml(match[2]);
    if (!href || href.startsWith("mailto:") || href.startsWith("tel:")) continue;
    let url;
    try {
      url = new URL(href, baseUrl).toString();
    } catch {
      continue;
    }
    links.push({ url, text });
  }
  return uniqueBy(links, (link) => link.url);
}

function looksLikeJobLink(link, source) {
  const haystack = `${link.url} ${link.text}`.toLowerCase();
  if (NON_JOB_URL_PATTERNS.some((pattern) => pattern.test(link.url))) return false;
  if (NON_JOB_TITLE_PATTERNS.some((pattern) => pattern.test(link.text))) return false;
  const companyWords = source.company.toLowerCase().split(/\W+/).filter(Boolean);
  if (haystack.includes("/job") || haystack.includes("jobid") || haystack.includes("requisition")) return true;
  if (haystack.includes("posting") || haystack.includes("opening") || haystack.includes("position")) return true;
  if (source.adapter === "lever" && haystack.includes("jobs.lever.co")) return true;
  if (source.adapter === "ashby" && haystack.includes("jobs.ashbyhq.com")) return true;
  if (source.adapter === "workday" && haystack.includes("myworkdayjobs.com")) return true;
  return companyWords.some((word) => word.length > 4 && haystack.includes(word)) && /career|job|role|position/.test(haystack);
}

function looksLikeJobDetail(job) {
  const title = normalizeWhitespace(job.title);
  if (!title || title.length < 5 || title.length > 140) return false;
  if (NON_JOB_TITLE_PATTERNS.some((pattern) => pattern.test(title))) return false;
  if (NON_JOB_URL_PATTERNS.some((pattern) => pattern.test(job.source_url))) return false;
  return ROLE_TITLE_PATTERNS.some((pattern) => pattern.test(title));
}

function extractTitle(html, fallbackText) {
  const h1 = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i);
  if (h1) return stripHtml(h1[1]);
  const title = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i);
  if (title) return stripHtml(title[1]).split("|")[0].split("- Careers")[0].trim();
  return normalizeWhitespace(fallbackText);
}

function extractDescription(text, company) {
  const withoutCompanyNoise = text.replace(new RegExp(company.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi"), company);
  return normalizeWhitespace(withoutCompanyNoise).slice(0, 12000);
}

function inferLocation(text) {
  const locationPatterns = [
    /\b(New York|Chicago|Washington,?\s*D\.?C\.?|Boston|San Francisco|Palo Alto|Los Angeles|Houston|Dallas|Austin|Miami|Atlanta|Denver|Seattle|Philadelphia|Remote|Hybrid)\b(?:,\s*[A-Z]{2})?/i,
    /\b([A-Z][a-z]+,\s*(?:NY|IL|DC|MA|CA|TX|FL|GA|CO|WA|PA))\b/,
    /\bUnited States\b/i,
  ];
  for (const pattern of locationPatterns) {
    const match = text.match(pattern);
    if (match) return normalizeWhitespace(match[0]);
  }
  return "";
}

function inferRemoteType(text) {
  const lower = text.toLowerCase();
  if (lower.includes("hybrid")) return "hybrid";
  if (lower.includes("remote")) return "remote";
  return "onsite";
}

function inferEmploymentType(text) {
  const lower = text.toLowerCase();
  if (lower.includes("part-time") || lower.includes("part time")) return "part-time";
  if (lower.includes("contract") || lower.includes("temporary")) return "contract";
  return "full-time";
}

function inferSalaryDisplay(text) {
  const salaryRegex = /\$\s?\d{2,3}(?:,\d{3})?(?:\s?-\s?\$?\s?\d{2,3}(?:,\d{3})?)?(?:\s?(?:per year|annually|\/year|\/yr|per hour|hourly|\/hour|\/hr))?/gi;
  const matches = [...String(text ?? "").matchAll(salaryRegex)];
  for (const match of matches) {
    const value = normalizeWhitespace(match[0]);
    const numbers = [...value.matchAll(/\d[\d,]*/g)].map((numberMatch) => Number(numberMatch[0].replace(/,/g, "")));
    const hasAnnualScale = numbers.some((number) => number >= 1000);
    const nearbyText = String(text ?? "").slice(match.index, match.index + value.length + 60).toLowerCase();
    const hasHourlyContext = /per hour|hourly|\/hour|\/hr/.test(nearbyText);
    if (hasAnnualScale || hasHourlyContext) return value;
  }
  return null;
}

function classify(job) {
  const haystack = `${job.title} ${job.description}`.toLowerCase();
  const titleHaystack = job.title.toLowerCase();
  const matches = [];
  for (const [category, keywords] of CATEGORY_RULES) {
    const titleMatches = keywords.filter((keyword) => titleHaystack.includes(keyword));
    const descriptionMatches = keywords.filter((keyword) => haystack.includes(keyword));
    if (titleMatches.length || descriptionMatches.length) {
      matches.push({ category, matchedKeywords: [...new Set([...titleMatches, ...descriptionMatches])], titleMatches });
    }
  }

  const practiceTitle = ATTORNEY_PRACTICE_HINTS.some((keyword) => titleHaystack.includes(keyword));
  const clearlyNonPracticing = NON_PRACTICING_HINTS.some((keyword) => haystack.includes(keyword));
  const titleClearlyNonPracticing = NON_PRACTICING_HINTS.some((keyword) => titleHaystack.includes(keyword));
  if (practiceTitle && !titleClearlyNonPracticing) {
    return { accepted: false, category: null, reason: "practicing_attorney_role", matches };
  }

  const titleMatch = matches.find((match) => match.titleMatches.length > 0);
  const category = titleMatch?.category ?? matches[0]?.category ?? null;
  if (!category) return { accepted: false, category: null, reason: "no_category_match", matches };

  if (DISALLOWED_GENERAL_CATEGORIES.has(category) && !clearlyNonPracticing) {
    return { accepted: false, category, reason: "general_business_role_without_legal_specialization", matches };
  }

  return { accepted: true, category, reason: "accepted", matches };
}

function isLikelyUsRole(job) {
  const location = String(job.location ?? "").toLowerCase();
  const locationHasUsHint = US_LOCATION_HINTS.some((hint) => location.includes(hint));
  const locationHasNonUsHint = NON_US_LOCATION_HINTS.some((hint) => location.includes(hint));
  if (locationHasNonUsHint && !locationHasUsHint) return false;
  if (location) return locationHasUsHint || /\b[A-Z]{2}\b/.test(job.location);

  const haystack = `${job.title} ${job.description}`.toLowerCase();
  return US_LOCATION_HINTS.some((hint) => haystack.includes(hint));
}

function validateJob(job) {
  const missing = [];
  for (const field of ["title", "employer_name", "location", "remote_type", "employment_type", "description", "category", "source_url"]) {
    if (!job[field] || (Array.isArray(job[field]) && job[field].length === 0)) missing.push(field);
  }
  if (!["remote", "hybrid", "onsite"].includes(job.remote_type)) missing.push("remote_type_valid");
  if (!["full-time", "part-time", "contract"].includes(job.employment_type)) missing.push("employment_type_valid");
  return missing;
}

function createDraftJob(source, values) {
  const description = normalizeWhitespace(values.description ?? "");
  return {
    title: normalizeWhitespace(values.title),
    employer_id: null,
    employer_name: source.company,
    location: normalizeWhitespace(values.location),
    remote_type: values.remote_type ?? inferRemoteType(description),
    employment_type: values.employment_type ?? inferEmploymentType(description),
    salary_min: null,
    salary_max: null,
    salary_display: values.salary_display ?? inferSalaryDisplay(description),
    description,
    short_summary: description.slice(0, 240),
    category: null,
    subcategory: null,
    tags: [],
    is_jd_advantage: false,
    is_non_practicing_attorney_role: false,
    source_url: values.source_url,
    source_type: source.adapter,
    date_posted: values.date_posted ?? new Date().toISOString().slice(0, 10),
    expiration_date: null,
    is_active: true,
    featured: false,
    requirements: [],
    source_name: source.company,
    imported_at: new Date().toISOString(),
    status: "published",
  };
}

function evaluateDraftJob(draft, sourceReport) {
  if (!looksLikeJobDetail(draft)) {
    sourceReport.skipped.push({ source_url: draft.source_url, title: draft.title, reason: "not_job_detail_page" });
    return;
  }

  if (!isLikelyUsRole(draft)) {
    sourceReport.skipped.push({ source_url: draft.source_url, title: draft.title, reason: "not_us_role" });
    return;
  }

  const classification = classify(draft);
  if (!classification.accepted) {
    sourceReport.skipped.push({
      source_url: draft.source_url,
      title: draft.title,
      reason: classification.reason,
      category: classification.category,
    });
    return;
  }

  if (
    LEGAL_TECH_COMPANIES.has(slugify(draft.employer_name)) &&
    !TITLE_LEGAL_RELEVANCE_HINTS.some((keyword) => draft.title.toLowerCase().includes(keyword))
  ) {
    sourceReport.skipped.push({
      source_url: draft.source_url,
      title: draft.title,
      reason: "legal_tech_role_without_title_level_legal_relevance",
      category: classification.category,
    });
    return;
  }

  draft.category = classification.category;
  draft.is_jd_advantage = classification.category === "jd-advantage" || /jd advantage|juris doctor|law degree|j\.d\./i.test(`${draft.title} ${draft.description}`);
  draft.is_non_practicing_attorney_role = NON_PRACTICING_HINTS.some((keyword) => `${draft.title} ${draft.description}`.toLowerCase().includes(keyword));

  const missing = validateJob(draft);
  if (missing.length) {
    sourceReport.skipped.push({ source_url: draft.source_url, title: draft.title, reason: "missing_required_fields", missing });
    return;
  }

  sourceReport.accepted.push({
    ...draft,
  });
}

async function discoverDetailLinks(source, listingHtml, resolvedUrl) {
  const links = extractLinks(listingHtml, resolvedUrl).filter((link) => looksLikeJobLink(link, source));
  return uniqueBy(links, (link) => link.url)
    .filter((link) => new URL(link.url).origin === new URL(resolvedUrl).origin || ["lever", "ashby", "workday", "icims", "oracle"].includes(source.adapter))
    .slice(0, MAX_DETAIL_PAGES_PER_SOURCE);
}

function createSourceReport(source) {
  return {
    company: source.company,
    adapter: source.adapter,
    url: source.careersUrl,
    robots: null,
    discovered: 0,
    accepted: [],
    skipped: [],
    manualReview: [],
    errors: [],
  };
}

function workdayConfig(source) {
  const url = new URL(source.careersUrl);
  return {
    origin: url.origin,
    tenant: source.workday?.tenant ?? url.hostname.split(".")[0],
    site: source.workday?.site ?? url.pathname.split("/").filter(Boolean).at(-1),
  };
}

function workdayPublicUrl(source, externalPath) {
  const url = new URL(source.careersUrl);
  return `${url.origin}${url.pathname.replace(/\/$/, "")}${externalPath}`;
}

function workdayLocation(detailInfo, posting) {
  const locations = detailInfo.additionalLocations ?? detailInfo.locations ?? [];
  if (Array.isArray(locations) && locations.length > 0) {
    const labels = locations
      .map((location) => location?.descriptor ?? location?.location ?? location)
      .filter(Boolean);
    if (labels.length) return labels.join("; ");
  }
  return detailInfo.location ?? posting.locationsText ?? "";
}

function workdayEmploymentType(detailInfo) {
  return inferEmploymentType(`${detailInfo.timeType ?? ""} ${detailInfo.workerSubType ?? ""}`);
}

function workdayPostedDate(postedOn) {
  const today = new Date();
  const lower = String(postedOn ?? "").toLowerCase();
  if (lower.includes("today")) return today.toISOString().slice(0, 10);
  if (lower.includes("yesterday")) {
    today.setDate(today.getDate() - 1);
    return today.toISOString().slice(0, 10);
  }
  const daysMatch = lower.match(/posted\s+(\d+)\s+days?\s+ago/);
  if (daysMatch) {
    today.setDate(today.getDate() - Number(daysMatch[1]));
    return today.toISOString().slice(0, 10);
  }
  return new Date().toISOString().slice(0, 10);
}

function extractEmbeddedJsonValue(text, key) {
  const marker = `"${key}":`;
  const markerIndex = text.indexOf(marker);
  if (markerIndex < 0) return null;
  const start = markerIndex + marker.length;
  const opening = text[start];
  const closing = opening === "[" ? "]" : opening === "{" ? "}" : null;
  if (!closing) return null;

  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let index = start; index < text.length; index += 1) {
    const char = text[index];
    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === "\"") {
        inString = false;
      }
      continue;
    }

    if (char === "\"") {
      inString = true;
      continue;
    }
    if (char === opening) depth += 1;
    if (char === closing) depth -= 1;
    if (depth === 0) {
      try {
        return JSON.parse(text.slice(start, index + 1));
      } catch {
        return null;
      }
    }
  }
  return null;
}

function extractJsonLdObjects(html) {
  const objects = [];
  const scriptRegex = /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = scriptRegex.exec(html))) {
    try {
      const parsed = JSON.parse(decodeEntities(match[1]).trim());
      objects.push(...(Array.isArray(parsed) ? parsed : [parsed]));
    } catch {
      // Ignore malformed third-party structured data and keep parsing fallback HTML.
    }
  }
  return objects;
}

function findJsonLdJobPosting(html) {
  return extractJsonLdObjects(html).find((item) => {
    const type = item?.["@type"];
    return Array.isArray(type) ? type.includes("JobPosting") : type === "JobPosting";
  }) ?? null;
}

function ashbyOrgSlug(source) {
  return source.ashby?.org ?? new URL(source.careersUrl).pathname.split("/").filter(Boolean)[0];
}

function ashbyEmploymentType(value) {
  const normalized = String(value ?? "").toLowerCase();
  if (normalized.includes("part")) return "part-time";
  if (normalized.includes("contract")) return "contract";
  return "full-time";
}

function ashbyRemoteType(value) {
  const normalized = String(value ?? "").toLowerCase();
  if (normalized.includes("remote")) return "remote";
  if (normalized.includes("hybrid")) return "hybrid";
  return "onsite";
}

async function processAshbySource(source, sourceReport) {
  const org = ashbyOrgSlug(source);
  if (!org) {
    sourceReport.errors.push("Missing Ashby organization slug");
    sourceReport.manualReview.push("Add ashby.org or use a jobs.ashbyhq.com/{org} URL");
    return sourceReport;
  }

  const board = await fetchText(`https://jobs.ashbyhq.com/${org}`);
  if (!board.ok) {
    sourceReport.errors.push(`Ashby board fetch failed: ${board.status || board.error}`);
    sourceReport.manualReview.push("Ashby board could not be read");
    return sourceReport;
  }

  const postings = extractEmbeddedJsonValue(board.text, "jobPostings") ?? [];
  const listedPostings = postings
    .filter((posting) => posting?.isListed !== false)
    .slice(0, MAX_DETAIL_PAGES_PER_SOURCE);
  sourceReport.discovered = listedPostings.length;
  if (listedPostings.length === 0) {
    sourceReport.manualReview.push("Ashby board returned no embedded postings");
    return sourceReport;
  }

  for (const posting of listedPostings) {
    const publicUrl = `https://jobs.ashbyhq.com/${org}/${posting.id}`;
    const detail = await fetchText(publicUrl);
    if (!detail.ok) {
      sourceReport.skipped.push({ title: posting.title, source_url: publicUrl, reason: `ashby_detail_fetch_failed_${detail.status || "unknown"}` });
      continue;
    }

    const detailPosting = extractEmbeddedJsonValue(detail.text, "posting") ?? posting;
    const location = detailPosting.locationName ?? posting.locationName ?? "";
    const description = stripHtml(detailPosting.descriptionHtml ?? "");
    const draft = createDraftJob(source, {
      title: detailPosting.title ?? posting.title,
      location,
      remote_type: ashbyRemoteType(detailPosting.workplaceType ?? posting.workplaceType),
      employment_type: ashbyEmploymentType(detailPosting.employmentType ?? posting.employmentType),
      salary_display: detailPosting.compensationTierSummary ?? posting.compensationTierSummary ?? inferSalaryDisplay(description),
      description,
      source_url: publicUrl,
      date_posted: new Date().toISOString().slice(0, 10),
    });

    evaluateDraftJob(draft, sourceReport);
  }

  return sourceReport;
}

function icimsIframeUrl(url) {
  const iframeUrl = new URL(url);
  iframeUrl.searchParams.set("in_iframe", "1");
  return iframeUrl.href;
}

function icimsNormalizeLocation(value) {
  const text = normalizeWhitespace(value);
  const match = text.match(/^US-([A-Z]{2})-(.+)$/i);
  if (match) return `${match[2].replace(/-/g, " ")}, ${match[1].toUpperCase()}, United States`;
  if (/^US-/.test(text)) return `${text.replace(/^US-/, "").replace(/-/g, " ")}, United States`;
  return text;
}

function icimsCountryLabel(value) {
  return /^US$/i.test(String(value ?? "")) ? "United States" : value;
}

function extractIcimsRows(html, baseUrl) {
  const rows = [];
  const cards = html.split(/<li\b[^>]*class=["'][^"']*iCIMS_JobCardItem[^"']*["'][^>]*>/i).slice(1);
  for (const card of cards) {
    const cardHtml = card.split(/<li\b[^>]*class=["'][^"']*iCIMS_JobCardItem[^"']*["'][^>]*>/i)[0];
    const linkMatch = cardHtml.match(/<a\b[^>]*href=["']([^"']*\/jobs\/[^"']*\/job[^"']*)["'][^>]*>([\s\S]*?)<\/a>/i);
    if (!linkMatch) continue;

    const titleMatch = linkMatch[2].match(/<h3\b[^>]*>([\s\S]*?)<\/h3>/i);
    const locationMatch = cardHtml.match(/<span\b[^>]*class=["']sr-only field-label["'][^>]*>\s*Job Locations?\s*<\/span>\s*<span\b[^>]*>([\s\S]*?)<\/span>/i)
      ?? cardHtml.match(/<span\b[^>]*class=["']sr-only field-label["'][^>]*>\s*Location[^<]*<\/span>[\s\S]*?<dd\b[^>]*class=["'][^"']*iCIMS_JobHeaderData[^"']*["'][^>]*>\s*<span\b[^>]*>([\s\S]*?)<\/span>/i);
    const typeMatch = cardHtml.match(/<dt\b[^>]*class=["'][^"']*iCIMS_JobHeaderField[^"']*["'][^>]*>\s*(?:Position\s+)?Type\s*<\/dt>\s*<dd\b[^>]*class=["'][^"']*iCIMS_JobHeaderData[^"']*["'][^>]*>\s*<span\b[^>]*>([\s\S]*?)<\/span>/i);
    const workplaceMatch = cardHtml.match(/<dt\b[^>]*class=["'][^"']*iCIMS_JobHeaderField[^"']*["'][^>]*>\s*Work Arrangement\s*<\/dt>\s*<dd\b[^>]*class=["'][^"']*iCIMS_JobHeaderData[^"']*["'][^>]*>\s*<span\b[^>]*>([\s\S]*?)<\/span>/i)
      ?? cardHtml.match(/<dt\b[^>]*class=["'][^"']*iCIMS_JobHeaderField[^"']*["'][^>]*>\s*Workplace Type\s*<\/dt>\s*<dd\b[^>]*class=["'][^"']*iCIMS_JobHeaderData[^"']*["'][^>]*>\s*<span\b[^>]*>([\s\S]*?)<\/span>/i);
    const postedMatch = cardHtml.match(/<dt\b[^>]*class=["'][^"']*iCIMS_JobHeaderField[^"']*["'][^>]*>\s*Posted\s+Date\s*<\/dt>\s*<dd\b[^>]*class=["'][^"']*iCIMS_JobHeaderData[^"']*["'][^>]*>\s*<span\b[^>]*>([\s\S]*?)<\/span>/i);

    rows.push({
      title: titleMatch ? stripHtml(titleMatch[1]) : stripHtml(linkMatch[2]),
      source_url: new URL(decodeEntities(linkMatch[1]), baseUrl).href,
      location: locationMatch ? icimsNormalizeLocation(stripHtml(locationMatch[1])) : "",
      remote_type: workplaceMatch ? inferRemoteType(stripHtml(workplaceMatch[1])) : "",
      employment_type: typeMatch ? inferEmploymentType(stripHtml(typeMatch[1])) : "",
      date_posted: postedMatch ? new Date(stripHtml(postedMatch[1])).toISOString().slice(0, 10) : null,
    });
  }
  return uniqueBy(rows, (row) => row.source_url);
}

function icimsJobPostingLocation(jobPosting) {
  const locations = Array.isArray(jobPosting?.jobLocation) ? jobPosting.jobLocation : [jobPosting?.jobLocation].filter(Boolean);
  const labels = locations.map((location) => {
    const address = location?.address ?? {};
    const city = address.addressLocality;
    const state = address.addressRegion;
    const country = icimsCountryLabel(address.addressCountry);
    if (city && state && state !== "UNAVAILABLE") return `${city}, ${state}, ${country ?? "United States"}`;
    if (city) return `${city}, ${country ?? "United States"}`;
    return "";
  }).filter(Boolean);
  return labels.join("; ");
}

function extractIcimsHeaderFields(html) {
  const fields = {};
  const fieldRegex = /<dt\b[^>]*class=["'][^"']*iCIMS_JobHeaderField[^"']*["'][^>]*>([\s\S]*?)<\/dt>\s*<dd\b[^>]*class=["'][^"']*iCIMS_JobHeaderData[^"']*["'][^>]*>\s*<span\b[^>]*>([\s\S]*?)<\/span>/gi;
  let match;
  while ((match = fieldRegex.exec(html))) {
    const label = stripHtml(match[1]).replace(/^Location\s*:\s*/i, "Location").toLowerCase();
    fields[label] = stripHtml(match[2]);
  }
  return fields;
}

function extractIcimsDetail(html, row) {
  const jobPosting = findJsonLdJobPosting(html);
  const fields = extractIcimsHeaderFields(html);
  const titleMatch = html.match(/<h1\b[^>]*class=["'][^"']*iCIMS_Header[^"']*["'][^>]*>([\s\S]*?)<\/h1>/i);
  const description = jobPosting?.description ? stripHtml(jobPosting.description) : stripHtml(html.match(/<div\b[^>]*class=["'][^"']*iCIMS_JobContent[^"']*["'][^>]*>([\s\S]*?)<div\b[^>]*class=["'][^"']*iCIMS_JobOptions/i)?.[1] ?? html);
  const location = icimsNormalizeLocation(icimsJobPostingLocation(jobPosting) || fields.location || row.location);
  return {
    title: jobPosting?.title ?? (titleMatch ? stripHtml(titleMatch[1]) : row.title),
    location,
    remote_type: inferRemoteType(`${fields["workplace type"] ?? ""} ${fields["work arrangement"] ?? ""} ${location} ${description}`) || row.remote_type,
    employment_type: inferEmploymentType(`${jobPosting?.employmentType ?? ""} ${fields.type ?? ""}`) || row.employment_type,
    salary_display: inferSalaryDisplay(description),
    description,
    source_url: jobPosting?.url ?? row.source_url,
    date_posted: jobPosting?.datePosted ? new Date(jobPosting.datePosted).toISOString().slice(0, 10) : row.date_posted,
  };
}

async function processIcimsSource(source, sourceReport) {
  const listing = await fetchText(icimsIframeUrl(source.careersUrl));
  if (!listing.ok) {
    sourceReport.errors.push(`iCIMS listing fetch failed: ${listing.status || listing.error}`);
    sourceReport.manualReview.push("iCIMS iframe listing page could not be read");
    return sourceReport;
  }

  const rows = extractIcimsRows(listing.text, listing.url).slice(0, MAX_DETAIL_PAGES_PER_SOURCE);
  sourceReport.discovered = rows.length;
  if (rows.length === 0) {
    sourceReport.manualReview.push("iCIMS listing returned no parseable job cards");
    return sourceReport;
  }

  for (const row of rows) {
    const detail = await fetchText(icimsIframeUrl(row.source_url));
    if (!detail.ok) {
      sourceReport.skipped.push({ title: row.title, source_url: row.source_url, reason: `icims_detail_fetch_failed_${detail.status || "unknown"}` });
      continue;
    }

    const detailFields = extractIcimsDetail(detail.text, row);
    const draft = createDraftJob(source, detailFields);
    evaluateDraftJob(draft, sourceReport);
  }

  return sourceReport;
}

function leverCompanySlug(source) {
  return source.lever?.company ?? new URL(source.careersUrl).pathname.split("/").filter(Boolean)[0];
}

function leverApiUrl(source) {
  return `https://api.lever.co/v0/postings/${leverCompanySlug(source)}?mode=json`;
}

function leverLocation(posting) {
  const locations = posting.categories?.allLocations;
  if (Array.isArray(locations) && locations.length > 0) return locations.join("; ");
  return posting.categories?.location ?? "";
}

function leverDescription(posting) {
  const parts = [
    posting.descriptionPlain,
    ...(posting.lists ?? []).map((list) => `${list.text}\n${stripHtml(list.content)}`),
    posting.additionalPlain,
  ].filter(Boolean);
  return normalizeWhitespace(parts.join("\n\n"));
}

function leverPostedDate(posting) {
  if (posting.createdAt) return new Date(posting.createdAt).toISOString().slice(0, 10);
  return new Date().toISOString().slice(0, 10);
}

async function processLeverSource(source, sourceReport) {
  const company = leverCompanySlug(source);
  if (!company) {
    sourceReport.errors.push("Missing Lever company slug");
    sourceReport.manualReview.push("Add lever.company or use a jobs.lever.co/{company} URL");
    return sourceReport;
  }

  const apiUrl = leverApiUrl(source);
  const list = await fetchJson(apiUrl);
  if (!list.ok) {
    sourceReport.errors.push(`Lever API failed: ${list.error || list.status}`);
    sourceReport.manualReview.push("Lever API could not be read");
    return sourceReport;
  }

  const postings = (Array.isArray(list.json) ? list.json : []).slice(0, MAX_DETAIL_PAGES_PER_SOURCE);
  sourceReport.discovered = postings.length;
  if (postings.length === 0) {
    sourceReport.manualReview.push("Lever API returned no postings");
    return sourceReport;
  }

  for (const posting of postings) {
    const location = leverLocation(posting);
    const description = leverDescription(posting);
    const draft = createDraftJob(source, {
      title: posting.text,
      location,
      remote_type: inferRemoteType(`${location} ${posting.workplaceType ?? ""} ${description}`),
      employment_type: inferEmploymentType(`${posting.categories?.commitment ?? ""} ${description}`),
      salary_display: inferSalaryDisplay(description),
      description,
      source_url: posting.hostedUrl ?? posting.applyUrl ?? `${source.careersUrl}/${posting.id}`,
      date_posted: leverPostedDate(posting),
    });

    evaluateDraftJob(draft, sourceReport);
  }

  return sourceReport;
}

function greenhouseBoardToken(source) {
  return source.greenhouse?.boardToken ?? new URL(source.careersUrl).pathname.split("/").filter(Boolean)[0];
}

function greenhouseApiUrl(source) {
  return `https://boards-api.greenhouse.io/v1/boards/${greenhouseBoardToken(source)}/jobs?content=true`;
}

function greenhouseLocation(job) {
  const primary = job.location?.name;
  const officeLocations = (job.offices ?? []).map((office) => office.location || office.name).filter(Boolean);
  return primary ?? [...new Set(officeLocations)].join("; ");
}

function greenhouseEmploymentType(job, description) {
  const haystack = `${job.metadata ? JSON.stringify(job.metadata) : ""} ${description}`;
  return inferEmploymentType(haystack);
}

async function processGreenhouseSource(source, sourceReport) {
  const boardToken = greenhouseBoardToken(source);
  if (!boardToken) {
    sourceReport.errors.push("Missing Greenhouse board token");
    sourceReport.manualReview.push("Add greenhouse.boardToken or use a job-boards.greenhouse.io/{boardToken} URL");
    return sourceReport;
  }

  const list = await fetchJson(greenhouseApiUrl(source));
  if (!list.ok) {
    sourceReport.errors.push(`Greenhouse API failed: ${list.error || list.status}`);
    sourceReport.manualReview.push("Greenhouse API could not be read");
    return sourceReport;
  }

  const jobs = (list.json?.jobs ?? []).slice(0, MAX_DETAIL_PAGES_PER_SOURCE);
  sourceReport.discovered = jobs.length;
  if (jobs.length === 0) {
    sourceReport.manualReview.push("Greenhouse API returned no jobs");
    return sourceReport;
  }

  for (const job of jobs) {
    const location = greenhouseLocation(job);
    const description = stripHtml(decodeEntities(job.content ?? ""));
    const draft = createDraftJob(source, {
      title: job.title,
      location,
      remote_type: inferRemoteType(`${location} ${description}`),
      employment_type: greenhouseEmploymentType(job, description),
      salary_display: inferSalaryDisplay(description),
      description,
      source_url: job.absolute_url,
      date_posted: job.first_published ? new Date(job.first_published).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
    });

    evaluateDraftJob(draft, sourceReport);
  }

  return sourceReport;
}

function extractJobviteRows(html, baseUrl) {
  const rows = [];
  const sectionRegex = /<h3\b[^>]*class=["']h2["'][^>]*>([\s\S]*?)<\/h3>\s*<table\b[^>]*class=["']jv-job-list["'][^>]*>([\s\S]*?)<\/table>/gi;
  let sectionMatch;
  while ((sectionMatch = sectionRegex.exec(html))) {
    const department = stripHtml(sectionMatch[1]);
    const tableHtml = sectionMatch[2];
    const rowRegex = /<tr\b[^>]*>([\s\S]*?)<\/tr>/gi;
    let rowMatch;
    while ((rowMatch = rowRegex.exec(tableHtml))) {
      const rowHtml = rowMatch[1];
      const linkMatch = rowHtml.match(/<a\b[^>]*href=["']([^"']*\/job\/[^"']+)["'][^>]*>([\s\S]*?)<\/a>/i);
      const locationMatch = rowHtml.match(/<td\b[^>]*class=["']jv-job-list-location["'][^>]*>([\s\S]*?)<\/td>/i);
      if (!linkMatch) continue;
      rows.push({
        department,
        title: stripHtml(linkMatch[2]),
        source_url: new URL(decodeEntities(linkMatch[1]), baseUrl).href,
        location: locationMatch ? stripHtml(locationMatch[1]) : "",
      });
    }
  }
  return uniqueBy(rows, (row) => row.source_url);
}

function extractJobviteDetail(html) {
  const titleMatch = html.match(/<h2\b[^>]*class=["']jv-header["'][^>]*>([\s\S]*?)<\/h2>/i);
  const metaMatch = html.match(/<p\b[^>]*class=["']jv-job-detail-meta["'][^>]*>([\s\S]*?)<\/p>/i);
  const descriptionMatch = html.match(/<div\b[^>]*class=["']jv-job-detail-description["'][^>]*>([\s\S]*?)<div\b[^>]*class=["']jv-job-detail-bottom-actions["']/i)
    ?? html.match(/<div\b[^>]*class=["']jv-job-detail-description["'][^>]*>([\s\S]*?)<\/article>/i);
  const metaText = metaMatch ? stripHtml(metaMatch[1]) : "";
  const metaParts = metaText.split(/\s{2,}|<span/i).map(normalizeWhitespace).filter(Boolean);
  return {
    title: titleMatch ? stripHtml(titleMatch[1]) : "",
    location: metaParts.at(-1) ?? metaText,
    description: descriptionMatch ? stripHtml(descriptionMatch[1]) : stripHtml(html),
  };
}

async function processJobviteSource(source, sourceReport) {
  const listing = await fetchText(source.careersUrl);
  if (!listing.ok) {
    sourceReport.errors.push(`Jobvite listing fetch failed: ${listing.status || listing.error}`);
    sourceReport.manualReview.push("Jobvite listing page could not be read");
    return sourceReport;
  }

  const rows = extractJobviteRows(listing.text, listing.url).slice(0, MAX_DETAIL_PAGES_PER_SOURCE);
  sourceReport.discovered = rows.length;
  if (rows.length === 0) {
    sourceReport.manualReview.push("Jobvite listing returned no parseable rows");
    return sourceReport;
  }

  for (const row of rows) {
    const detail = await fetchText(row.source_url);
    if (!detail.ok) {
      sourceReport.skipped.push({ title: row.title, source_url: row.source_url, reason: `jobvite_detail_fetch_failed_${detail.status || "unknown"}` });
      continue;
    }
    const detailFields = extractJobviteDetail(detail.text);
    const description = detailFields.description;
    const location = detailFields.location || row.location;
    const draft = createDraftJob(source, {
      title: detailFields.title || row.title,
      location,
      remote_type: inferRemoteType(`${location} ${description}`),
      employment_type: inferEmploymentType(description),
      salary_display: inferSalaryDisplay(description),
      description,
      source_url: detail.url,
      date_posted: new Date().toISOString().slice(0, 10),
    });

    evaluateDraftJob(draft, sourceReport);
  }

  return sourceReport;
}

function oracleConfig(source) {
  const url = new URL(source.careersUrl);
  const siteMatch = url.pathname.match(/\/sites\/([^/]+)/);
  return {
    origin: url.origin,
    siteNumber: source.oracle?.siteNumber ?? siteMatch?.[1] ?? "CX_1",
    selectedLocationsFacet: source.oracle?.selectedLocationsFacet ?? url.searchParams.get("selectedLocationsFacet"),
    lastSelectedFacet: source.oracle?.lastSelectedFacet ?? url.searchParams.get("lastSelectedFacet"),
  };
}

function oracleFinder(config, limit, offset) {
  const facets = "TITLES;LOCATIONS;LOCATION_LEVEL1;LOCATION_LEVEL2;LOCATION_LEVEL3;CATEGORIES;POSTING_DATES;WORK_LOCATIONS;FLEX_FIELDS;ORGANIZATIONS;WORKPLACE_TYPES";
  const parts = [
    `siteNumber=${config.siteNumber}`,
    `facetsList=${facets}`,
    `limit=${limit}`,
    `offset=${offset}`,
    "sortBy=RELEVANCY",
  ];
  if (config.selectedLocationsFacet) parts.push(`selectedLocationsFacet=${config.selectedLocationsFacet}`);
  if (config.lastSelectedFacet) parts.push(`lastSelectedFacet=${config.lastSelectedFacet}`);
  return `findReqs;${parts.join(",")}`;
}

function oracleLocation(requisition) {
  const locations = [
    requisition.PrimaryLocation,
    ...(requisition.secondaryLocations ?? []).map((location) => location.Name),
  ].filter(Boolean);
  return [...new Set(locations)].join("; ");
}

function oracleRemoteType(value) {
  const normalized = String(value ?? "").toLowerCase();
  if (normalized.includes("hybrid")) return "hybrid";
  if (normalized.includes("remote")) return "remote";
  return "onsite";
}

function oracleEmploymentType(value) {
  const normalized = String(value ?? "").toLowerCase();
  if (normalized.includes("part")) return "part-time";
  if (normalized.includes("contract") || normalized.includes("temporary")) return "contract";
  return "full-time";
}

async function processOracleSource(source, sourceReport) {
  const config = oracleConfig(source);
  const limit = Math.min(25, MAX_DETAIL_PAGES_PER_SOURCE);
  const finder = oracleFinder(config, limit, 0);
  const expand = "requisitionList.workLocation,requisitionList.otherWorkLocations,requisitionList.secondaryLocations,requisitionList.requisitionFlexFields";
  const listUrl = `${config.origin}/hcmRestApi/resources/latest/recruitingCEJobRequisitions?onlyData=true&expand=${expand}&finder=${encodeURIComponent(finder)}`;
  const list = await fetchJson(listUrl);
  if (!list.ok) {
    sourceReport.errors.push(`Oracle listing API failed: ${list.error || list.status}`);
    sourceReport.manualReview.push("Oracle listing API could not be read");
    return sourceReport;
  }

  const requisitions = uniqueBy(list.json?.items?.[0]?.requisitionList ?? [], (item) => item.Id).slice(0, MAX_DETAIL_PAGES_PER_SOURCE);
  sourceReport.discovered = requisitions.length;
  if (requisitions.length === 0) {
    sourceReport.manualReview.push("Oracle API returned no requisitions");
    return sourceReport;
  }

  for (const requisition of requisitions) {
    const publicUrl = `${config.origin}/hcmUI/CandidateExperience/en/sites/${config.siteNumber}/job/${requisition.Id}`;
    const detailUrl = `${config.origin}/hcmRestApi/resources/latest/recruitingCEJobRequisitionDetails/${requisition.Id}?expand=all&onlyData=true`;
    const detail = await fetchJson(detailUrl);
    if (!detail.ok) {
      sourceReport.skipped.push({ title: requisition.Title, source_url: publicUrl, reason: `oracle_detail_fetch_failed_${detail.status || "unknown"}` });
      continue;
    }

    const info = detail.json?.items?.[0] ?? detail.json;
    const descriptionParts = [
      info.ExternalDescriptionStr,
      info.ExternalResponsibilitiesStr,
      info.ExternalQualificationsStr,
    ].filter(Boolean);
    const description = stripHtml(descriptionParts.join("\n\n"));
    const location = oracleLocation(info);
    const draft = createDraftJob(source, {
      title: info.Title ?? requisition.Title,
      location,
      remote_type: oracleRemoteType(info.WorkplaceType ?? requisition.WorkplaceType),
      employment_type: oracleEmploymentType(info.JobSchedule),
      salary_display: inferSalaryDisplay(description),
      description,
      source_url: publicUrl,
      date_posted: info.ExternalPostedStartDate ? new Date(info.ExternalPostedStartDate).toISOString().slice(0, 10) : requisition.PostedDate,
    });

    evaluateDraftJob(draft, sourceReport);
  }

  return sourceReport;
}

async function processWorkdaySource(source, sourceReport) {
  const config = workdayConfig(source);
  if (!config.tenant || !config.site) {
    sourceReport.errors.push("Missing Workday tenant/site metadata");
    sourceReport.manualReview.push("Add workday.tenant and workday.site to source config");
    return sourceReport;
  }

  const listUrl = `${config.origin}/wday/cxs/${config.tenant}/${config.site}/jobs`;
  const postings = [];
  let offset = 0;
  const limit = Math.min(20, MAX_DETAIL_PAGES_PER_SOURCE);

  while (postings.length < MAX_DETAIL_PAGES_PER_SOURCE) {
    const page = await fetchJson(listUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ appliedFacets: {}, limit, offset, searchText: "" }),
    });
    if (!page.ok) {
      sourceReport.errors.push(`Workday listing API failed: ${page.error || page.status}`);
      sourceReport.manualReview.push("Workday listing API could not be read");
      return sourceReport;
    }

    const pagePostings = page.json?.jobPostings ?? [];
    postings.push(...pagePostings);
    if (pagePostings.length === 0 || postings.length >= (page.json?.total ?? 0)) break;
    offset += pagePostings.length;
  }

  const uniquePostings = uniqueBy(postings, (posting) => posting.externalPath).slice(0, MAX_DETAIL_PAGES_PER_SOURCE);
  sourceReport.discovered = uniquePostings.length;
  if (uniquePostings.length === 0) {
    sourceReport.manualReview.push("Workday API returned no postings");
    return sourceReport;
  }

  for (const posting of uniquePostings) {
    if (!posting.externalPath) {
      sourceReport.skipped.push({ title: posting.title, source_url: source.careersUrl, reason: "missing_workday_external_path" });
      continue;
    }

    const detailUrl = `${config.origin}/wday/cxs/${config.tenant}/${config.site}${posting.externalPath}`;
    const detail = await fetchJson(detailUrl);
    const publicUrl = workdayPublicUrl(source, posting.externalPath);
    if (!detail.ok) {
      sourceReport.skipped.push({ title: posting.title, source_url: publicUrl, reason: `workday_detail_fetch_failed_${detail.status || "unknown"}` });
      continue;
    }

    const info = detail.json?.jobPostingInfo ?? {};
    const description = stripHtml(info.jobDescription ?? "");
    const location = workdayLocation(info, posting);
    const draft = createDraftJob(source, {
      title: info.title ?? posting.title,
      location,
      remote_type: inferRemoteType(`${location} ${description}`),
      employment_type: workdayEmploymentType(info),
      salary_display: inferSalaryDisplay(description),
      description,
      source_url: publicUrl,
      date_posted: workdayPostedDate(posting.postedOn ?? info.startDate),
    });

    evaluateDraftJob(draft, sourceReport);
  }

  return sourceReport;
}

async function processSource(source) {
  const sourceReport = createSourceReport(source);

  const robots = await checkRobots(source.adapter === "lever" ? leverApiUrl(source) : source.adapter === "greenhouse" ? greenhouseApiUrl(source) : source.careersUrl);
  sourceReport.robots = robots;
  if (robots.status === "blocked") {
    sourceReport.manualReview.push(robots.message);
    return sourceReport;
  }
  if (robots.status === "manual_review") {
    sourceReport.manualReview.push(robots.message);
  }

  if (source.adapter === "workday") {
    return processWorkdaySource(source, sourceReport);
  }

  if (source.adapter === "ashby") {
    return processAshbySource(source, sourceReport);
  }

  if (source.adapter === "jobvite") {
    return processJobviteSource(source, sourceReport);
  }

  if (source.adapter === "icims") {
    return processIcimsSource(source, sourceReport);
  }

  if (source.adapter === "lever") {
    return processLeverSource(source, sourceReport);
  }

  if (source.adapter === "greenhouse") {
    return processGreenhouseSource(source, sourceReport);
  }

  if (source.adapter === "oracle") {
    return processOracleSource(source, sourceReport);
  }

  const listing = await fetchText(source.careersUrl);
  if (!listing.ok) {
    sourceReport.errors.push(`Listing fetch failed: ${listing.status || listing.error}`);
    sourceReport.manualReview.push("Could not fetch listing page");
    return sourceReport;
  }

  const detailLinks = await discoverDetailLinks(source, listing.text, listing.url);
  sourceReport.discovered = detailLinks.length;
  if (detailLinks.length === 0) {
    sourceReport.manualReview.push("No job detail links found with the generic extractor");
    return sourceReport;
  }

  for (const link of detailLinks) {
    const detail = await fetchText(link.url);
    if (!detail.ok) {
      sourceReport.skipped.push({ source_url: link.url, title: link.text, reason: `detail_fetch_failed_${detail.status || "unknown"}` });
      continue;
    }

    const text = stripHtml(detail.text);
    const title = extractTitle(detail.text, link.text);
    const description = extractDescription(text, source.company);
    const draft = createDraftJob(source, {
      title,
      location: inferLocation(text),
      remote_type: inferRemoteType(text),
      employment_type: inferEmploymentType(text),
      salary_display: inferSalaryDisplay(text),
      description,
      source_url: detail.url,
      date_posted: new Date().toISOString().slice(0, 10),
    });
    evaluateDraftJob(draft, sourceReport);
  }

  return sourceReport;
}

export async function runIngestion({ mode = "dry-run", writeReport = true } = {}) {
  const sources = JSON.parse(await fs.readFile(SOURCES_PATH, "utf8")).filter((source) => source.enabled);
  const report = {
    mode,
    generatedAt: new Date().toISOString(),
    sourceCount: sources.length,
    maxDetailPagesPerSource: MAX_DETAIL_PAGES_PER_SOURCE,
    summary: {
      discovered: 0,
      accepted: 0,
      skipped: 0,
      sourcesNeedingManualReview: 0,
      sourcesWithErrors: 0,
    },
    sources: [],
    notes: [
      "This report is read-only and does not write to Supabase.",
      "Missing jobs would become status='expired' and is_active=false in the future live writer.",
      "The MVP generic extractor is conservative; JavaScript-heavy ATS pages may need dedicated adapters.",
    ],
  };

  for (const source of sources) {
    process.stdout.write(`Processing ${source.company}... `);
    const result = await processSource(source);
    report.sources.push(result);
    report.summary.discovered += result.discovered;
    report.summary.accepted += result.accepted.length;
    report.summary.skipped += result.skipped.length;
    if (result.manualReview.length) report.summary.sourcesNeedingManualReview += 1;
    if (result.errors.length) report.summary.sourcesWithErrors += 1;
    process.stdout.write(`${result.accepted.length} accepted, ${result.skipped.length} skipped, ${result.manualReview.length} review note(s)\n`);
  }

  if (writeReport) {
    await fs.mkdir(REPORT_DIR, { recursive: true });
    await fs.writeFile(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`);
  }

  return report;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  runIngestion()
    .then((report) => {
      console.log(`\nDry-run report written to ${path.relative(process.cwd(), REPORT_PATH)}`);
      console.log(JSON.stringify(report.summary, null, 2));
    })
    .catch((error) => {
      console.error(error);
      process.exitCode = 1;
    });
}
