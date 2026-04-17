import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  MapPin, Clock, DollarSign, Briefcase, ArrowLeft, Bookmark,
  Share2, ExternalLink, Calendar, Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { categories } from "@/data/categories";
import { supabase } from "@/integrations/supabase/client";
import {
  fetchJobById, fetchSavedJobIds, saveJob, unsaveJob,
  type DbJob, type DbEmployer,
} from "@/lib/supabase-queries";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const remoteLabels: Record<string, string> = {
  remote: "Remote",
  hybrid: "Hybrid",
  onsite: "On-site",
};

function NotFoundComp() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6">
      <h1 className="font-heading text-2xl font-bold">Job Not Found</h1>
      <p className="mt-2 text-muted-foreground">
        This job listing may have been removed or expired.
      </p>
      <Link to="/jobs" search={{} as any}>
        <Button variant="outline" className="mt-4">Browse All Jobs</Button>
      </Link>
    </div>
  );
}

export const Route = createFileRoute("/jobs/$jobId")({
  loader: async ({ params }) => {
    try {
      const job = await fetchJobById(params.jobId);
      let employer: DbEmployer | null = null;
      if (job.employer_id) {
        const { data } = await supabase
          .from("employers")
          .select("*")
          .eq("id", job.employer_id)
          .single();
        employer = data;
      }
      return { job, employer };
    } catch {
      throw notFound();
    }
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [] };
    const { job, employer } = loaderData;
    const title = `${job.title} at ${job.employer_name} | JD Careers`;
    const description =
      job.short_summary ||
      job.description.slice(0, 160).replace(/\s+/g, " ").trim();
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        ...(employer?.logo_url
          ? [
              { property: "og:image", content: employer.logo_url },
              { property: "twitter:image", content: employer.logo_url },
            ]
          : []),
      ],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "JobPosting",
            title: job.title,
            description: job.description,
            datePosted: job.date_posted,
            validThrough: job.expiration_date ?? undefined,
            employmentType: job.employment_type.toUpperCase().replace("-", "_"),
            hiringOrganization: {
              "@type": "Organization",
              name: job.employer_name,
              ...(employer?.website ? { sameAs: employer.website } : {}),
              ...(employer?.logo_url ? { logo: employer.logo_url } : {}),
            },
            jobLocation: {
              "@type": "Place",
              address: {
                "@type": "PostalAddress",
                addressLocality: job.location,
              },
            },
            ...(job.salary_min && job.salary_max
              ? {
                  baseSalary: {
                    "@type": "MonetaryAmount",
                    currency: "USD",
                    value: {
                      "@type": "QuantitativeValue",
                      minValue: job.salary_min,
                      maxValue: job.salary_max,
                      unitText: "YEAR",
                    },
                  },
                }
              : {}),
          }),
        },
      ],
    };
  },
  component: JobDetailPage,
  notFoundComponent: NotFoundComp,
  errorComponent: NotFoundComp,
});

function formatPostedDate(dateStr: string) {
  const date = new Date(dateStr);
  const days = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (days === 0) return "Posted today";
  if (days === 1) return "Posted yesterday";
  if (days < 30) return `Posted ${days} days ago`;
  return `Posted ${date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
}

function JobDetailPage() {
  const { job, employer } = Route.useLoaderData();
  const { user } = useAuth();
  const [relatedJobs, setRelatedJobs] = useState<DbJob[]>([]);
  const [isSaved, setIsSaved] = useState(false);
  const [savingState, setSavingState] = useState(false);

  useEffect(() => {
    supabase
      .from("jobs")
      .select("*")
      .eq("category", job.category)
      .eq("is_active", true)
      .neq("id", job.id)
      .limit(4)
      .then(({ data }) => {
        if (data) setRelatedJobs(data);
      });
  }, [job.id, job.category]);

  useEffect(() => {
    if (!user) {
      setIsSaved(false);
      return;
    }
    fetchSavedJobIds(user.id).then((ids) => setIsSaved(ids.has(job.id)));
  }, [user, job.id]);

  async function toggleSave() {
    if (!user) {
      toast.info("Sign in to save jobs");
      return;
    }
    setSavingState(true);
    if (isSaved) {
      const { error } = await unsaveJob(user.id, job.id);
      if (!error) {
        setIsSaved(false);
        toast.success("Job removed from saved");
      } else {
        toast.error("Could not unsave job");
      }
    } else {
      const { error } = await saveJob(user.id, job.id);
      if (!error) {
        setIsSaved(true);
        toast.success("Job saved");
      } else {
        toast.error("Could not save job");
      }
    }
    setSavingState(false);
  }

  async function handleShare() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (navigator.share) {
      try {
        await navigator.share({ title: job.title, url });
      } catch {
        // user cancelled
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard");
    }
  }

  const cat = categories.find((c) => c.id === job.category);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Link
        to="/jobs"
        search={{} as any}
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Jobs
      </Link>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main column */}
        <article className="lg:col-span-2">
          <header>
            <div className="flex flex-wrap items-center gap-2">
              {job.featured && (
                <Badge className="border-0 bg-primary/10 text-xs text-primary">Featured</Badge>
              )}
              {cat && <Badge variant="secondary" className="text-xs">{cat.name}</Badge>}
              <Badge variant="outline" className="text-xs capitalize">{job.employment_type}</Badge>
              {job.is_jd_advantage && (
                <Badge className="border-0 bg-accent text-xs text-accent-foreground">
                  JD Advantage
                </Badge>
              )}
              {job.is_non_practicing_attorney_role && (
                <Badge variant="outline" className="border-primary/30 text-xs text-primary">
                  Non-Practicing Attorney
                </Badge>
              )}
            </div>

            <h1 className="mt-3 font-heading text-3xl font-bold sm:text-4xl">{job.title}</h1>
            <p className="mt-2 text-lg text-muted-foreground">{job.employer_name}</p>

            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />{job.location}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />{remoteLabels[job.remote_type] ?? job.remote_type}
              </span>
              <span className="flex items-center gap-1.5 capitalize">
                <Briefcase className="h-4 w-4" />{job.employment_type}
              </span>
              {job.salary_display && (
                <span className="flex items-center gap-1.5">
                  <DollarSign className="h-4 w-4" />{job.salary_display}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />{formatPostedDate(job.date_posted)}
              </span>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {job.source_url ? (
                <Button size="lg" asChild>
                  <a href={job.source_url} target="_blank" rel="noopener noreferrer">
                    Apply on Employer Site
                    <ExternalLink className="ml-1 h-4 w-4" />
                  </a>
                </Button>
              ) : (
                <Button size="lg" disabled>Application Link Unavailable</Button>
              )}
              <Button
                variant={isSaved ? "default" : "outline"}
                size="lg"
                onClick={toggleSave}
                disabled={savingState}
                title={user ? (isSaved ? "Unsave job" : "Save job") : "Sign in to save jobs"}
              >
                <Bookmark className="h-4 w-4" fill={isSaved ? "currentColor" : "none"} />
                {isSaved ? "Saved" : "Save Job"}
              </Button>
              <Button variant="outline" size="lg" onClick={handleShare}>
                <Share2 className="h-4 w-4" />
                Share
              </Button>
            </div>
          </header>

          <Separator className="my-8" />

          <section>
            <h2 className="font-heading text-xl font-semibold">About this Role</h2>
            {job.short_summary && (
              <p className="mt-3 text-base leading-relaxed text-foreground">{job.short_summary}</p>
            )}
            <div className="mt-4 whitespace-pre-line leading-relaxed text-muted-foreground">
              {job.description}
            </div>
          </section>

          {job.requirements && job.requirements.length > 0 && (
            <section className="mt-8">
              <h2 className="font-heading text-xl font-semibold">Requirements</h2>
              <ul className="mt-3 space-y-2">
                {job.requirements.map((r, i) => (
                  <li key={i} className="flex items-start gap-2 text-muted-foreground">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {job.tags && job.tags.length > 0 && (
            <section className="mt-8">
              <h2 className="flex items-center gap-2 font-heading text-base font-semibold">
                <Tag className="h-4 w-4" /> Tags
              </h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {job.tags.map((t) => (
                  <Badge key={t} variant="secondary" className="text-xs font-normal">
                    {t}
                  </Badge>
                ))}
              </div>
            </section>
          )}

          {job.source_url && (
            <div className="mt-10 rounded-lg border bg-muted/30 p-5 text-sm">
              <p className="font-medium text-foreground">Ready to apply?</p>
              <p className="mt-1 text-muted-foreground">
                Applications are handled directly by {job.employer_name} on their careers site.
              </p>
              <Button className="mt-3" asChild>
                <a href={job.source_url} target="_blank" rel="noopener noreferrer">
                  Apply on Employer Site
                  <ExternalLink className="ml-1 h-4 w-4" />
                </a>
              </Button>
            </div>
          )}
        </article>

        {/* Sidebar */}
        <aside className="space-y-6">
          {employer && (
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  {employer.logo_url ? (
                    <img
                      src={employer.logo_url}
                      alt={`${employer.name} logo`}
                      className="h-12 w-12 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 font-heading text-lg font-bold text-primary">
                      {employer.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h3 className="font-heading text-base font-semibold">{employer.name}</h3>
                    {employer.employer_type && (
                      <p className="text-xs capitalize text-muted-foreground">
                        {employer.employer_type.replace(/[-_]/g, " ")}
                      </p>
                    )}
                  </div>
                </div>
                {employer.description && (
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground line-clamp-4">
                    {employer.description}
                  </p>
                )}
                {employer.headquarters && (
                  <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />{employer.headquarters}
                  </p>
                )}
                <Link
                  to="/employers/$employerId"
                  params={{ employerId: employer.slug }}
                  className="block"
                >
                  <Button variant="outline" size="sm" className="mt-4 w-full">
                    View Employer Profile
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {relatedJobs.length > 0 && (
            <Card>
              <CardContent className="p-5">
                <h3 className="font-heading text-base font-semibold">Similar Jobs</h3>
                <div className="mt-3 divide-y">
                  {relatedJobs.map((rj) => (
                    <Link
                      key={rj.id}
                      to="/jobs/$jobId"
                      params={{ jobId: rj.id }}
                      className="block py-3 first:pt-0 last:pb-0"
                    >
                      <p className="text-sm font-medium transition-colors hover:text-primary">
                        {rj.title}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {rj.employer_name} · {rj.location}
                      </p>
                      {rj.salary_display && (
                        <p className="mt-0.5 text-xs text-muted-foreground">{rj.salary_display}</p>
                      )}
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </aside>
      </div>
    </div>
  );
}
