import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { Bookmark, User, LogOut, Bell, Trash2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { fetchSavedJobs, unsaveJob, type DbJob } from "@/lib/supabase-queries";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — JD Careers" },
      { name: "description", content: "Manage your saved jobs, alerts, and profile on JD Careers." },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [savedJobs, setSavedJobs] = useState<DbJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate({ to: "/login" });
      return;
    }
    fetchSavedJobs(user.id)
      .then((data) => {
        const jobs = data
          .map((d) => d.jobs)
          .filter((j): j is DbJob => j !== null);
        setSavedJobs(jobs);
      })
      .finally(() => setLoading(false));
  }, [user, authLoading, navigate]);

  const handleRemove = useCallback(
    async (jobId: string) => {
      if (!user) return;
      const previous = savedJobs;
      setSavedJobs((prev) => prev.filter((j) => j.id !== jobId));
      const result = await unsaveJob(user.id, jobId);
      if (result.error) {
        setSavedJobs(previous);
        toast.error(result.error);
      } else {
        toast.success("Removed from saved jobs");
      }
    },
    [user, savedJobs],
  );

  if (authLoading || !user) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold">Dashboard</h1>
          <p className="mt-1 text-muted-foreground">Welcome back, {user.email}</p>
        </div>
        <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground" onClick={() => signOut()}>
          <LogOut className="h-4 w-4" /> Sign Out
        </Button>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Bookmark className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{savedJobs.length}</p>
              <p className="text-sm text-muted-foreground">Saved Jobs</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">0</p>
              <p className="text-sm text-muted-foreground">Email Alerts</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <User className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{user.email}</p>
              <p className="text-xs text-muted-foreground">Your account</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_320px]">
        {/* Saved Jobs */}
        <section>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-heading text-xl font-bold">Saved Jobs</h2>
              <p className="mt-1 text-sm text-muted-foreground">Jobs you've bookmarked for later</p>
            </div>
            <Link to="/jobs" search={{} as never}>
              <Button variant="outline" size="sm">Browse Jobs</Button>
            </Link>
          </div>

          {loading ? (
            <p className="mt-6 text-sm text-muted-foreground">Loading saved jobs…</p>
          ) : savedJobs.length > 0 ? (
            <div className="mt-4 space-y-3">
              {savedJobs.map((job) => (
                <SavedJobRow key={job.id} job={job} onRemove={() => handleRemove(job.id)} />
              ))}
            </div>
          ) : (
            <Card className="mt-4">
              <CardContent className="py-12 text-center">
                <Bookmark className="mx-auto h-8 w-8 text-muted-foreground/60" />
                <p className="mt-3 font-medium">No saved jobs yet</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Bookmark jobs from the listings to keep track of them.
                </p>
                <Link to="/jobs" search={{} as never}>
                  <Button variant="outline" className="mt-4">Browse Jobs</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </section>

        {/* Sidebar: Account + Email Alerts */}
        <aside className="space-y-6">
          <Card>
            <CardContent className="p-5">
              <h3 className="font-heading text-base font-semibold">Account</h3>
              <dl className="mt-4 space-y-3 text-sm">
                <div>
                  <dt className="text-xs uppercase tracking-wide text-muted-foreground">Email</dt>
                  <dd className="mt-0.5 break-all font-medium">{user.email}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-muted-foreground">Member since</dt>
                  <dd className="mt-0.5 font-medium">
                    {new Date(user.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                  </dd>
                </div>
              </dl>
              <Button
                variant="outline"
                size="sm"
                className="mt-5 w-full gap-2"
                onClick={() => signOut()}
              >
                <LogOut className="h-3.5 w-3.5" /> Sign Out
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <h3 className="font-heading text-base font-semibold">Email Alerts</h3>
                <Badge variant="secondary" className="text-[10px]">Coming soon</Badge>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Get weekly digests of new roles matching your interests.
              </p>
              <Button variant="outline" size="sm" className="mt-4 w-full gap-2" disabled>
                <Mail className="h-3.5 w-3.5" /> Manage Alerts
              </Button>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}

function SavedJobRow({ job, onRemove }: { job: DbJob; onRemove: () => void }) {
  return (
    <Card className="transition-colors hover:border-primary/30">
      <CardContent className="flex items-start justify-between gap-4 p-4">
        <div className="min-w-0 flex-1">
          <Link
            to="/jobs/$jobId"
            params={{ jobId: job.id }}
            className="font-heading text-sm font-semibold leading-tight hover:text-primary"
          >
            {job.title}
          </Link>
          <p className="mt-1 truncate text-xs text-muted-foreground">
            {job.employer_name} · {job.location}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {job.salary_display && (
              <Badge variant="outline" className="text-[10px]">{job.salary_display}</Badge>
            )}
            {job.is_jd_advantage && (
              <Badge variant="secondary" className="text-[10px]">JD Advantage</Badge>
            )}
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
          onClick={onRemove}
          aria-label="Remove saved job"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
