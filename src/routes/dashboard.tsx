import { createFileRoute, Link } from "@tanstack/react-router";
import { Bookmark, Bell, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { JobCard } from "@/components/JobCard";
import { featuredJobs } from "@/data/jobs";

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
  const savedJobs = featuredJobs.slice(0, 3);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold">Dashboard</h1>
          <p className="mt-1 text-muted-foreground">Welcome back, Jane</p>
        </div>
        <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
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
              <p className="text-2xl font-bold">2</p>
              <p className="text-sm text-muted-foreground">Active Alerts</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <User className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold">Jane Doe</p>
              <p className="text-xs text-muted-foreground">jane@example.com</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-10">
        <h2 className="font-heading text-xl font-bold">Saved Jobs</h2>
        <p className="mt-1 text-sm text-muted-foreground">Jobs you've bookmarked for later</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {savedJobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
        {savedJobs.length === 0 && (
          <div className="py-12 text-center text-muted-foreground">
            <Bookmark className="mx-auto h-8 w-8 mb-2" />
            <p>No saved jobs yet.</p>
            <Link to="/jobs"><Button variant="outline" className="mt-3">Browse Jobs</Button></Link>
          </div>
        )}
      </div>
    </div>
  );
}
