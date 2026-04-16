import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { MapPin, ExternalLink, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { JobCard } from "@/components/JobCard";
import { fetchEmployerBySlug, fetchJobsByEmployerId, type DbEmployer, type DbJob } from "@/lib/supabase-queries";

const typeLabels: Record<string, string> = { "law-firm": "Law Firm", corporate: "Corporate", "legal-tech": "Legal Tech", consulting: "Consulting", government: "Government" };

function NotFoundComp() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6">
      <h1 className="font-heading text-2xl font-bold">Employer Not Found</h1>
      <p className="mt-2 text-muted-foreground">This employer profile may have been removed.</p>
      <Link to="/employers"><Button variant="outline" className="mt-4">Browse Employers</Button></Link>
    </div>
  );
}

export const Route = createFileRoute("/employers/$employerId")({
  component: EmployerDetailPage,
  notFoundComponent: NotFoundComp,
});

function EmployerDetailPage() {
  const { employerId } = Route.useParams();
  const [employer, setEmployer] = useState<DbEmployer | null>(null);
  const [employerJobs, setEmployerJobs] = useState<DbJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetchEmployerBySlug(employerId)
      .then(async (emp) => {
        setEmployer(emp);
        const jobs = await fetchJobsByEmployerId(emp.id);
        setEmployerJobs(jobs);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [employerId]);

  if (loading) {
    return <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6"><p className="text-muted-foreground">Loading…</p></div>;
  }

  if (notFound || !employer) {
    return <NotFoundComp />;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Link to="/employers" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Employers
      </Link>

      <div className="flex items-start gap-5">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-primary/10 font-heading text-2xl font-bold text-primary">
          {employer.name.charAt(0)}
        </div>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-heading text-3xl font-bold">{employer.name}</h1>
            {employer.employer_type && <Badge variant="secondary">{typeLabels[employer.employer_type] ?? employer.employer_type}</Badge>}
          </div>
          <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted-foreground">
            {employer.headquarters && <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" />{employer.headquarters}</span>}
          </div>
        </div>
      </div>

      <p className="mt-6 max-w-3xl text-muted-foreground leading-relaxed">{employer.description}</p>

      {employer.website && (
        <a href={employer.website} target="_blank" rel="noopener noreferrer">
          <Button variant="outline" className="mt-4 gap-2">Visit Website <ExternalLink className="h-3.5 w-3.5" /></Button>
        </a>
      )}

      <div className="mt-12">
        <h2 className="font-heading text-2xl font-bold">Open Positions ({employerJobs.length})</h2>
        {employerJobs.length > 0 ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {employerJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        ) : (
          <p className="mt-4 text-muted-foreground">No open positions listed at this time.</p>
        )}
      </div>
    </div>
  );
}
