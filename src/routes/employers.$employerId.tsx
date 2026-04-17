import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { MapPin, ExternalLink, ArrowLeft, Building2, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { JobCard } from "@/components/JobCard";
import {
  fetchEmployerBySlug, fetchJobsByEmployerId,
} from "@/lib/supabase-queries";
import { formatEmployerType } from "@/data/employer-types";

function NotFoundComp() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6">
      <h1 className="font-heading text-2xl font-bold">Employer Not Found</h1>
      <p className="mt-2 text-muted-foreground">
        This employer profile may have been removed.
      </p>
      <Link to="/employers">
        <Button variant="outline" className="mt-4">Browse Employers</Button>
      </Link>
    </div>
  );
}

export const Route = createFileRoute("/employers/$employerId")({
  loader: async ({ params }) => {
    try {
      const employer = await fetchEmployerBySlug(params.employerId);
      const jobs = await fetchJobsByEmployerId(employer.id);
      return { employer, jobs };
    } catch {
      throw notFound();
    }
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [] };
    const { employer } = loaderData;
    const typeLabel = formatEmployerType(employer.employer_type);
    const title = `${employer.name} — Open Roles | JD Careers`;
    const description =
      employer.description?.slice(0, 160).trim() ||
      `Open roles at ${employer.name}${typeLabel ? `, a ${typeLabel}` : ""}.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "profile" },
        ...(employer.logo_url
          ? [
              { property: "og:image", content: employer.logo_url },
              { property: "twitter:image", content: employer.logo_url },
            ]
          : []),
      ],
    };
  },
  component: EmployerDetailPage,
  notFoundComponent: NotFoundComp,
  errorComponent: NotFoundComp,
});

function EmployerDetailPage() {
  const { employer, jobs } = Route.useLoaderData();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Link
        to="/employers"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Employers
      </Link>

      <header className="flex flex-col gap-5 sm:flex-row sm:items-start">
        {employer.logo_url ? (
          <img
            src={employer.logo_url}
            alt={`${employer.name} logo`}
            className="h-16 w-16 shrink-0 rounded-xl object-cover sm:h-20 sm:w-20"
          />
        ) : (
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-primary/10 font-heading text-2xl font-bold text-primary sm:h-20 sm:w-20">
            {employer.name.charAt(0)}
          </div>
        )}

        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-heading text-3xl font-bold">{employer.name}</h1>
            {employer.employer_type && (
              <Badge variant="secondary">
                {formatEmployerType(employer.employer_type)}
              </Badge>
            )}
          </div>

          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-muted-foreground">
            {employer.headquarters && (
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />{employer.headquarters}
              </span>
            )}
            {employer.employer_type && (
              <span className="flex items-center gap-1.5">
                <Building2 className="h-4 w-4" />
                {formatEmployerType(employer.employer_type)}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Briefcase className="h-4 w-4" />
              {jobs.length} open {jobs.length === 1 ? "role" : "roles"}
            </span>
          </div>

          {employer.website && (
            <Button variant="outline" className="mt-4 gap-2" asChild>
              <a href={employer.website} target="_blank" rel="noopener noreferrer">
                Visit Website <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </Button>
          )}
        </div>
      </header>

      {employer.description && (
        <section className="mt-8 max-w-3xl">
          <h2 className="font-heading text-lg font-semibold">About</h2>
          <p className="mt-2 leading-relaxed text-muted-foreground">
            {employer.description}
          </p>
        </section>
      )}

      <Separator className="my-10" />

      <section>
        <h2 className="font-heading text-2xl font-bold">
          Open Roles at {employer.name} ({jobs.length})
        </h2>
        {jobs.length > 0 ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-lg border border-dashed bg-muted/30 p-8 text-center">
            <p className="text-muted-foreground">
              No open positions listed at this time.
            </p>
            <Link to="/jobs" search={{} as any}>
              <Button variant="outline" className="mt-4">
                Browse all jobs
              </Button>
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
