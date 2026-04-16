import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { BarChart3, Users, Briefcase } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import type { DbJob } from "@/lib/supabase-queries";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — JD Careers" },
      { name: "description", content: "Manage job listings, employers, and site content." },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [jobCount, setJobCount] = useState(0);
  const [employerCount, setEmployerCount] = useState(0);
  const [recentJobs, setRecentJobs] = useState<DbJob[]>([]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate({ to: "/login" }); return; }

    Promise.all([
      supabase.from("jobs").select("*", { count: "exact", head: true }).eq("is_active", true),
      supabase.from("employers").select("*", { count: "exact", head: true }),
      supabase.from("jobs").select("*").eq("is_active", true).order("date_posted", { ascending: false }).limit(10),
    ]).then(([jc, ec, rj]) => {
      setJobCount(jc.count ?? 0);
      setEmployerCount(ec.count ?? 0);
      setRecentJobs(rj.data ?? []);
    });
  }, [user, authLoading, navigate]);

  if (authLoading || !user) {
    return <div className="mx-auto max-w-7xl px-4 py-16 text-center"><p className="text-muted-foreground">Loading…</p></div>;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div>
        <h1 className="font-heading text-3xl font-bold">Admin Dashboard</h1>
        <p className="mt-1 text-muted-foreground">Manage listings and content</p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary"><Briefcase className="h-5 w-5" /></div>
            <div>
              <p className="text-2xl font-bold">{jobCount}</p>
              <p className="text-sm text-muted-foreground">Active Jobs</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary"><Users className="h-5 w-5" /></div>
            <div>
              <p className="text-2xl font-bold">{employerCount}</p>
              <p className="text-sm text-muted-foreground">Employers</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary"><BarChart3 className="h-5 w-5" /></div>
            <div>
              <p className="text-2xl font-bold">—</p>
              <p className="text-sm text-muted-foreground">Monthly Views</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-10">
        <h2 className="font-heading text-xl font-bold">Recent Listings</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="pb-3 pr-4 font-medium">Title</th>
                <th className="pb-3 pr-4 font-medium">Employer</th>
                <th className="pb-3 pr-4 font-medium">Category</th>
                <th className="pb-3 pr-4 font-medium">Status</th>
                <th className="pb-3 font-medium">Posted</th>
              </tr>
            </thead>
            <tbody>
              {recentJobs.map((job) => (
                <tr key={job.id} className="border-b">
                  <td className="py-3 pr-4 font-medium">{job.title}</td>
                  <td className="py-3 pr-4 text-muted-foreground">{job.employer_name}</td>
                  <td className="py-3 pr-4"><Badge variant="secondary" className="text-[10px]">{job.category}</Badge></td>
                  <td className="py-3 pr-4"><Badge className="bg-primary/10 text-primary border-0 text-[10px]">{job.is_active ? "Active" : "Inactive"}</Badge></td>
                  <td className="py-3 text-muted-foreground">{job.date_posted}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
