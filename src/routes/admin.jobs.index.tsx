import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { adminListJobs, adminDeleteJob, adminToggleJobActive } from "@/lib/admin-queries";
import type { Tables } from "@/integrations/supabase/types";

export const Route = createFileRoute("/admin/jobs/")({
  component: AdminJobsList,
});

function AdminJobsList() {
  const [jobs, setJobs] = useState<Tables<"jobs">[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    adminListJobs().then(setJobs).catch(() => setJobs([])).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const filtered = jobs.filter(
    (j) =>
      j.title.toLowerCase().includes(search.toLowerCase()) ||
      j.employer_name.toLowerCase().includes(search.toLowerCase()),
  );

  const handleToggle = async (id: string, isActive: boolean) => {
    const { error } = await adminToggleJobActive(id, !isActive);
    if (error) return toast.error(error);
    toast.success(isActive ? "Job archived" : "Job activated");
    load();
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    const { error } = await adminDeleteJob(id);
    if (error) return toast.error(error);
    toast.success("Job deleted");
    load();
  };

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Input
          placeholder="Search jobs by title or employer…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="sm:max-w-md"
        />
        <Link to="/admin/jobs/new">
          <Button className="gap-1.5"><Plus className="h-4 w-4" /> New job</Button>
        </Link>
      </div>

      {loading ? (
        <p className="py-12 text-center text-muted-foreground">Loading…</p>
      ) : filtered.length === 0 ? (
        <p className="py-12 text-center text-muted-foreground">No jobs found.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr className="text-left">
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Employer</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Posted</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((job) => (
                <tr key={job.id} className="border-t">
                  <td className="px-4 py-3 font-medium">{job.title}</td>
                  <td className="px-4 py-3 text-muted-foreground">{job.employer_name}</td>
                  <td className="px-4 py-3"><Badge variant="secondary" className="text-[10px]">{job.category}</Badge></td>
                  <td className="px-4 py-3">
                    <Badge className={job.is_active ? "bg-primary/10 text-primary border-0" : "bg-muted text-muted-foreground border-0"}>
                      {job.is_active ? "Active" : "Archived"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{job.date_posted}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Button size="sm" variant="ghost" onClick={() => handleToggle(job.id, job.is_active)}>
                        {job.is_active ? "Archive" : "Activate"}
                      </Button>
                      <Link to="/admin/jobs/$jobId/edit" params={{ jobId: job.id }}>
                        <Button size="icon" variant="ghost" aria-label="Edit"><Pencil className="h-4 w-4" /></Button>
                      </Link>
                      <Button size="icon" variant="ghost" aria-label="Delete" onClick={() => handleDelete(job.id, job.title)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
