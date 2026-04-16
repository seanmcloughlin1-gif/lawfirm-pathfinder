import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { MapPin, Clock, DollarSign, Building2, ArrowLeft, Bookmark, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { categories } from "@/data/categories";
import { supabase } from "@/integrations/supabase/client";
import { fetchJobById, fetchEmployerBySlug, fetchSavedJobIds, saveJob, unsaveJob, type DbJob, type DbEmployer } from "@/lib/supabase-queries";
import { useAuth } from "@/hooks/useAuth";

function NotFoundComp() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6">
      <h1 className="font-heading text-2xl font-bold">Job Not Found</h1>
      <p className="mt-2 text-muted-foreground">This job listing may have been removed or expired.</p>
      <Link to="/jobs" search={{} as any}><Button variant="outline" className="mt-4">Browse All Jobs</Button></Link>
    </div>
  );
}

export const Route = createFileRoute("/jobs/$jobId")({
  component: JobDetailPage,
  notFoundComponent: NotFoundComp,
});

const remoteLabels: Record<string, string> = { remote: "Remote", hybrid: "Hybrid", onsite: "On-site" };

function JobDetailPage() {
  const { jobId } = Route.useParams();
  const { user } = useAuth();
  const [job, setJob] = useState<DbJob | null>(null);
  const [employer, setEmployer] = useState<DbEmployer | null>(null);
  const [relatedJobs, setRelatedJobs] = useState<DbJob[]>([]);
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetchJobById(jobId)
      .then(async (j) => {
        setJob(j);
        if (j.employer_id) {
          // Fetch employer by ID
          const { data: emp } = await supabase.from("employers").select("*").eq("id", j.employer_id).single();
          if (emp) setEmployer(emp);
        }
        // Fetch related jobs
        const { data: related } = await supabase
          .from("jobs")
          .select("*")
          .eq("category", j.category)
          .eq("is_active", true)
          .neq("id", j.id)
          .limit(3);
        if (related) setRelatedJobs(related);

        // Check if saved
        if (user) {
          const savedIds = await fetchSavedJobIds(user.id);
          setIsSaved(savedIds.has(j.id));
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [jobId, user]);

  async function toggleSave() {
    if (!user || !job) return;
    if (isSaved) {
      await unsaveJob(user.id, job.id);
      setIsSaved(false);
    } else {
      await saveJob(user.id, job.id);
      setIsSaved(true);
    }
  }

  if (loading) {
    return <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6"><p className="text-muted-foreground">Loading…</p></div>;
  }

  if (notFound || !job) {
    return <NotFoundComp />;
  }

  const cat = categories.find((c) => c.id === job.category);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Link to="/jobs" search={{} as any} className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Jobs
      </Link>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="flex flex-wrap items-center gap-2">
            {job.featured && <Badge className="bg-primary/10 text-primary border-0 text-xs">Featured</Badge>}
            {cat && <Badge variant="secondary" className="text-xs">{cat.name}</Badge>}
            <Badge variant="outline" className="text-xs">{job.employment_type}</Badge>
          </div>

          <h1 className="mt-3 font-heading text-3xl font-bold sm:text-4xl">{job.title}</h1>
          <p className="mt-2 text-lg text-muted-foreground">{job.employer_name}</p>

          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" />{job.location}</span>
            <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" />{remoteLabels[job.remote_type]}</span>
            {job.salary_display && <span className="flex items-center gap-1.5"><DollarSign className="h-4 w-4" />{job.salary_display}</span>}
          </div>

          <div className="mt-4 flex gap-2">
            <Button size="lg">Apply Now</Button>
            <Button
              variant={isSaved ? "default" : "outline"}
              size="icon"
              onClick={toggleSave}
              title={user ? (isSaved ? "Unsave job" : "Save job") : "Sign in to save jobs"}
            >
              <Bookmark className="h-4 w-4" fill={isSaved ? "currentColor" : "none"} />
            </Button>
            <Button variant="outline" size="icon"><Share2 className="h-4 w-4" /></Button>
          </div>

          <div className="prose mt-8 max-w-none">
            <h2 className="font-heading text-xl font-semibold">About this Role</h2>
            <p className="mt-2 text-muted-foreground leading-relaxed">{job.description}</p>

            {job.requirements && job.requirements.length > 0 && (
              <>
                <h2 className="mt-8 font-heading text-xl font-semibold">Requirements</h2>
                <ul className="mt-3 space-y-2">
                  {job.requirements.map((r, i) => (
                    <li key={i} className="flex items-start gap-2 text-muted-foreground">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      {r}
                    </li>
                  ))}
                </ul>
              </>
            )}
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
                  {employer.headquarters && <p className="flex items-center gap-1.5"><MapPin className="h-3 w-3" />{employer.headquarters}</p>}
                </div>
                <Link to="/employers/$employerId" params={{ employerId: employer.slug }}>
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
                      <p className="text-xs text-muted-foreground">{rj.employer_name} · {rj.location}</p>
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
