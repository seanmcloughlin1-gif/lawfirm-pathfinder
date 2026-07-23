# Jobs Ingestion MVP

This folder contains the dry-run ingestion MVP. It reads `sources.json`, fetches configured career pages, extracts candidate job detail URLs, applies deterministic relevance/category rules, validates records against the fields needed by Supabase, and writes a JSON run report.

The dry run does not write to Supabase.

## Run

```bash
npm run ingest:dry-run
```

The report is written to `ingestion/reports/latest.json`.

## Supabase Writer

Dry run remains the default. To publish accepted jobs to Supabase, run:

```bash
INGEST_WRITE=true npm run ingest:supabase
```

Required environment variables:

- `SUPABASE_URL` or `VITE_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `INGEST_WRITE=true`

The writer:

- Runs the same ingestion and filters as the dry run.
- Creates a minimal employer row when a configured source has no matching employer by slug/name.
- Updates existing imported jobs by matching `source_url` plus case-insensitive title/employer.
- Inserts new jobs as `status='published'` and `is_active=true`.
- Sets `imported_at` on every inserted/updated job.
- Expires previously imported active/published jobs from successful sources when their `source_url` is missing from the latest accepted set.
- Writes `ingestion/reports/latest-live.json`.

Sources that error, are blocked by robots, or discover no jobs are not used for expiration, which prevents a temporary outage from archiving good listings.

## Adding Sources

Add a row to `sources.json`:

```json
{
  "enabled": true,
  "company": "Example Firm",
  "employerSlug": "example-firm",
  "careersUrl": "https://example.com/careers/staff",
  "adapter": "custom-html",
  "country": "US"
}
```

Supported MVP adapter labels are `custom-html`, `workday`, `jobvite`, `ashby`, `oracle`, `icims`, `lever`, and `greenhouse`. The current dry run uses dedicated adapters for Workday, Ashby, Jobvite, Oracle, iCIMS, Lever, and Greenhouse; the remaining labels fall back to conservative HTML extraction and flag blocked or unparseable sources for manual review.

## Workday Sources

Workday sources should include explicit tenant and site metadata so the adapter can call the Workday CXS API directly:

```json
{
  "enabled": true,
  "company": "Sidley Austin",
  "employerSlug": "sidley-austin",
  "careersUrl": "https://sidley.wd501.myworkdayjobs.com/en-US/US",
  "adapter": "workday",
  "country": "US",
  "workday": {
    "tenant": "sidley",
    "site": "US"
  }
}
```

The Workday adapter reads `/wday/cxs/{tenant}/{site}/jobs`, fetches each returned detail endpoint, then sends normalized jobs through the same U.S.-only, category, and required-field validation as every other adapter.

## Jobvite Sources

Jobvite sources can point at the public jobs list:

```json
{
  "enabled": true,
  "company": "LegalZoom",
  "employerSlug": "legalzoom",
  "careersUrl": "https://jobs.jobvite.com/legalzoom/jobs",
  "adapter": "jobvite",
  "country": "US"
}
```

The Jobvite adapter reads the server-rendered jobs table, fetches each detail page, extracts title, location, and full description, then runs the shared filters.

## Oracle Sources

Oracle Candidate Experience sources should include the site number and any filter facet copied from the public jobs URL:

```json
{
  "enabled": true,
  "company": "Cozen O'Connor",
  "employerSlug": "cozen-oconnor",
  "careersUrl": "https://hctq.fa.us2.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_1/jobs?lastSelectedFacet=LOCATIONS&selectedLocationsFacet=300000000345520",
  "adapter": "oracle",
  "country": "US",
  "oracle": {
    "siteNumber": "CX_1",
    "lastSelectedFacet": "LOCATIONS",
    "selectedLocationsFacet": "300000000345520"
  }
}
```

The Oracle adapter reads `recruitingCEJobRequisitions` with expanded requisition lists, fetches `recruitingCEJobRequisitionDetails/{Id}`, and runs the shared filters.

## iCIMS Sources

iCIMS sources can point at the public search page. The adapter will request the `in_iframe=1` version automatically:

```json
{
  "enabled": true,
  "company": "Latham & Watkins",
  "employerSlug": "latham-watkins",
  "careersUrl": "https://careers-lw.icims.com/jobs/search?hashed=-625915638",
  "adapter": "icims",
  "country": "US"
}
```

The iCIMS adapter reads the server-rendered job cards, fetches each detail page, prefers the page's `JobPosting` JSON-LD for full descriptions and dates, then runs the shared filters.

## Lever Sources

Lever sources can point at the public company board:

```json
{
  "enabled": true,
  "company": "Proof",
  "employerSlug": "proof",
  "careersUrl": "https://jobs.lever.co/proof",
  "adapter": "lever",
  "country": "US"
}
```

The Lever adapter reads `https://api.lever.co/v0/postings/{company}?mode=json`, normalizes title, location, employment type, description, hosted URL, and created date, then runs the shared filters. The dry run checks robots against the API host because that is the endpoint the adapter reads.

## Greenhouse Sources

Greenhouse sources can point at the public job board. If the public board token is not obvious from the URL, add it explicitly:

```json
{
  "enabled": true,
  "company": "LinkSquares",
  "employerSlug": "linksquares",
  "careersUrl": "https://job-boards.greenhouse.io/linksquareslinkedin",
  "adapter": "greenhouse",
  "country": "US",
  "greenhouse": {
    "boardToken": "linksquareslinkedin"
  }
}
```

The Greenhouse adapter reads `https://boards-api.greenhouse.io/v1/boards/{boardToken}/jobs?content=true`, normalizes title, location, employment type, description, salary, hosted URL, and first published date, then runs the shared filters. The dry run checks robots against the API host because that is the endpoint the adapter reads.
