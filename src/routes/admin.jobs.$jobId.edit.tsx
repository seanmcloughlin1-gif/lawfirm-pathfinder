import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { JobForm } from "@/components/admin/JobForm";
import { adminGetJob, adminUpdateJob } from "@/lib/admin-queries";
import type { Tables } from "@/integrations/supabase/types";

export const Route = createFileRoute("/admin/jobs/$jobId/edit")({
  component: AdminJobEdit,
});

function AdminJobEdit() {
  const { jobId } = Route.useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState<Tables<"jobs"> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminGetJob(jobId).then(setJob).catch(() => setJob(null)).finally(() => setLoading(false));
  }, [jobId]);

  return (
    <div>
      <Link to="/admin/jobs" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to jobs
      </Link>
      <h2 className="mb-6 font-heading text-2xl font-bold">Edit job</h2>
      {loading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : !job ? (
        <p className="text-muted-foreground">Job not found.</p>
      ) : (
        <JobForm
          initial={job}
          submitLabel="Save changes"
          onSubmit={async (payload) => {
            const { error } = await adminUpdateJob(jobId, payload);
            if (error) { toast.error(error); return; }
            toast.success("Job updated");
            navigate({ to: "/admin/jobs" });
          }}
        />
      )}
    </div>
  );
}
