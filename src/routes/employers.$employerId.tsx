import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { MapPin, Users, ExternalLink, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { JobCard } from "@/components/JobCard";
import { employers } from "@/data/employers";
import { jobs } from "@/data/jobs";

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
  head: ({ params }) => {
    const emp = employers.find((e) => e.id === params.employerId);
    return {
      meta: [
        { title: emp ? `${emp.name} — JD Careers` : "Employer Not Found — JD Careers" },
        { name: "description", content: emp?.description.slice(0, 155) || "" },
        { property: "og:title", content: emp?.name || "Employer Not Found" },
        { property: "og:description", content: emp?.description.slice(0, 155) || "" },
      ],
    };
  },
  component: EmployerDetailPage,
  notFoundComponent: NotFoundComp,
  loader: ({ params }) => {
    const employer = employers.find((e) => e.id === params.employerId);
    if (!employer) throw notFound();
    return { employer };
  },
});

function EmployerDetailPage() {
  const { employer } = Route.useLoaderData() as { employer: Employer };
  const employerJobs = jobs.filter((j) => j.employerId === employer.id);

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
            <Badge variant="secondary">{typeLabels[employer.type]}</Badge>
          </div>
          <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" />{employer.location}</span>
            <span className="flex items-center gap-1.5"><Users className="h-4 w-4" />{employer.size}</span>
          </div>
        </div>
      </div>

      <p className="mt-6 max-w-3xl text-muted-foreground leading-relaxed">{employer.description}</p>

      <a href={employer.website} target="_blank" rel="noopener noreferrer">
        <Button variant="outline" className="mt-4 gap-2">Visit Website <ExternalLink className="h-3.5 w-3.5" /></Button>
      </a>

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
