
-- Status enum
DO $$ BEGIN
  CREATE TYPE public.job_status AS ENUM ('draft', 'published', 'expired', 'archived');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- New columns
ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS source_name text,
  ADD COLUMN IF NOT EXISTS imported_at timestamptz,
  ADD COLUMN IF NOT EXISTS status public.job_status NOT NULL DEFAULT 'published';

-- Backfill: inactive existing rows become archived
UPDATE public.jobs SET status = 'archived'
  WHERE is_active = false AND status = 'published';

-- Index for status filtering
CREATE INDEX IF NOT EXISTS jobs_status_idx ON public.jobs (status);

-- Duplicate detection: title + employer + source_url (case-insensitive), only when source_url present
CREATE UNIQUE INDEX IF NOT EXISTS jobs_dedupe_source_idx
  ON public.jobs (lower(title), lower(employer_name), source_url)
  WHERE source_url IS NOT NULL;
