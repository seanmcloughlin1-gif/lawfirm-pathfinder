import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { MapPin, Clock, DollarSign, Building2, ArrowLeft, Bookmark, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { jobs } from "@/data/jobs";
import { employers } from "@/data/employers";
import { categories } from "@/data/categories";

function NotFoundComp() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6">
      <h1 className="font-heading text-2xl font-bold">Job Not Found</h1>
      <p className="mt-2 text-muted-foreground">This job listing may have been removed or expired.</p>
      <Link to="/jobs"><Button variant="outline" className="mt-4">Browse All Jobs</Button></Link>
    </div>
  );
}

export const Route = createFileRoute("/jobs/$jobId")({
  head: ({ params }) => {
    const job = jobs.find((j) => j.id === params.jobId);
    return {
      meta: [
        { title: job ? `${job.title} at ${job.employerName} — JD Careers` : "Job Not Found — JD Careers" },
        { name: "description", content: job?.description.slice(0, 155) || "Job listing not found." },
        { property: "og:title", content: job ? `${job.title} at ${job.employerName}` : "Job Not Found" },
        { property: "og:description", content: job?.description.slice(0, 155) || "" },
      ],
    };
  },
  component: JobDetailPage,
  notFoundComponent: NotFoundComp,
  loader: ({ params }) => {
    const job = jobs.find((j) => j.id === params.jobId);
    if (!job) throw notFound();
    return { job };
  },
});

const remoteLabels: Record<string, string> = { remote: "Remote", hybrid: "Hybrid", onsite: "On-site" };

function JobDetailPage() {
  const { job } = Route.useLoaderData();
  const employer = employers.find((e) => e.id === job.employerId);
  const cat = categories.find((c) => c.id === job.category);
  const relatedJobs = jobs.filter((j) => j.id !== job.id && j.category === job.category).slice(0, 3);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Link to="/jobs" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Jobs
      </Link>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="flex flex-wrap items-center gap-2">
            {job.featured && <Badge className="bg-primary/10 text-primary border-0 text-xs">Featured</Badge>}
            {cat && <Badge variant="secondary" className="text-xs">{cat.name}</Badge>}
            <Badge variant="outline" className="text-xs">{job.type}</Badge>
          </div>

          <h1 className="mt-3 font-heading text-3xl font-bold sm:text-4xl">{job.title}</h1>
          <p className="mt-2 text-lg text-muted-foreground">{job.employerName}</p>

          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" />{job.location}</span>
            <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" />{remoteLabels[job.remote]}</span>
            {job.salary && <span className="flex items-center gap-1.5"><DollarSign className="h-4 w-4" />{job.salary}</span>}
          </div>

          <div className="mt-4 flex gap-2">
            <Button size="lg">Apply Now</Button>
            <Button variant="outline" size="icon"><Bookmark className="h-4 w-4" /></Button>
            <Button variant="outline" size="icon"><Share2 className="h-4 w-4" /></Button>
          </div>

          <div className="prose mt-8 max-w-none">
            <h2 className="font-heading text-xl font-semibold">About this Role</h2>
            <p className="mt-2 text-muted-foreground leading-relaxed">{job.description}</p>

            <h2 className="mt-8 font-heading text-xl font-semibold">Requirements</h2>
            <ul className="mt-3 space-y-2">
              {job.requirements.map((r, i) => (
                <li key={i} className="flex items-start gap-2 text-muted-foreground">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  {r}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="space-y-6">
          {employer && (
            <Card>
              <CardContent className="p-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 font-heading text-lg font-bold text-primary">
                  {employer.name.charAt(0)}
                </div>
                <h3 className="mt-3 font-heading text-base font-semibold">{employer.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground line-clamp-3">{employer.description}</p>
                <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                  <p className="flex items-center gap-1.5"><MapPin className="h-3 w-3" />{employer.location}</p>
                  <p className="flex items-center gap-1.5"><Building2 className="h-3 w-3" />{employer.size}</p>
                </div>
                <Link to="/employers/$employerId" params={{ employerId: employer.id }}>
                  <Button variant="outline" size="sm" className="mt-4 w-full">View Employer Profile</Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {relatedJobs.length > 0 && (
            <Card>
              <CardContent className="p-5">
                <h3 className="font-heading text-base font-semibold">Similar Jobs</h3>
                <div className="mt-3 space-y-3">
                  {relatedJobs.map((rj) => (
                    <Link key={rj.id} to="/jobs/$jobId" params={{ jobId: rj.id }} className="block">
                      <p className="text-sm font-medium hover:text-primary transition-colors">{rj.title}</p>
                      <p className="text-xs text-muted-foreground">{rj.employerName} · {rj.location}</p>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
