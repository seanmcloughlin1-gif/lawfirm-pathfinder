import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Bookmark, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { JobCard } from "@/components/JobCard";
import { useAuth } from "@/hooks/useAuth";
import { fetchSavedJobs, type DbJob } from "@/lib/supabase-queries";

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

  if (authLoading || !user) {
    return <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6"><p className="text-muted-foreground">Loading…</p></div>;
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

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
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
              <User className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold">{user.email}</p>
              <p className="text-xs text-muted-foreground">Your account</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-10">
        <h2 className="font-heading text-xl font-bold">Saved Jobs</h2>
        <p className="mt-1 text-sm text-muted-foreground">Jobs you've bookmarked for later</p>
        {loading ? (
          <p className="mt-4 text-muted-foreground">Loading saved jobs…</p>
        ) : savedJobs.length > 0 ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {savedJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-muted-foreground">
            <Bookmark className="mx-auto h-8 w-8 mb-2" />
            <p>No saved jobs yet.</p>
            <Link to="/jobs" search={{} as any}><Button variant="outline" className="mt-3">Browse Jobs</Button></Link>
          </div>
        )}
      </div>
    </div>
  );
}
