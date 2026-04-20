import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { JobForm } from "@/components/admin/JobForm";
import { adminCreateJob } from "@/lib/admin-queries";

export const Route = createFileRoute("/admin/jobs/new")({
  component: AdminJobNew,
});

function AdminJobNew() {
  const navigate = useNavigate();
  return (
    <div>
      <Link to="/admin/jobs" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to jobs
      </Link>
      <h2 className="mb-6 font-heading text-2xl font-bold">New job</h2>
      <JobForm
        submitLabel="Create job"
        onSubmit={async (payload) => {
          const { error, data } = await adminCreateJob(payload);
          if (error) { toast.error(error); return; }
          toast.success("Job created");
          if (data) navigate({ to: "/admin/jobs" });
        }}
      />
    </div>
  );
}
