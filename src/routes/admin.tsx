import { createFileRoute } from "@tanstack/react-router";
import { BarChart3, Users, Briefcase, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { jobs } from "@/data/jobs";
import { employers } from "@/data/employers";

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
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold">Admin Dashboard</h1>
          <p className="mt-1 text-muted-foreground">Manage listings and content</p>
        </div>
        <Button className="gap-2"><Plus className="h-4 w-4" /> Add Job</Button>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary"><Briefcase className="h-5 w-5" /></div>
            <div>
              <p className="text-2xl font-bold">{jobs.length}</p>
              <p className="text-sm text-muted-foreground">Active Jobs</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary"><Users className="h-5 w-5" /></div>
            <div>
              <p className="text-2xl font-bold">{employers.length}</p>
              <p className="text-sm text-muted-foreground">Employers</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary"><BarChart3 className="h-5 w-5" /></div>
            <div>
              <p className="text-2xl font-bold">1,247</p>
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
              {jobs.slice(0, 10).map((job) => (
                <tr key={job.id} className="border-b">
                  <td className="py-3 pr-4 font-medium">{job.title}</td>
                  <td className="py-3 pr-4 text-muted-foreground">{job.employerName}</td>
                  <td className="py-3 pr-4"><Badge variant="secondary" className="text-[10px]">{job.category}</Badge></td>
                  <td className="py-3 pr-4"><Badge className="bg-green-100 text-green-800 border-0 text-[10px]">Active</Badge></td>
                  <td className="py-3 text-muted-foreground">{job.postedDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
