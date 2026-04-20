import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { EmployerForm } from "@/components/admin/EmployerForm";
import { adminCreateEmployer } from "@/lib/admin-queries";

export const Route = createFileRoute("/admin/employers/new")({
  component: AdminEmployerNew,
});

function AdminEmployerNew() {
  const navigate = useNavigate();
  return (
    <div>
      <Link to="/admin/employers" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to employers
      </Link>
      <h2 className="mb-6 font-heading text-2xl font-bold">New employer</h2>
      <EmployerForm
        submitLabel="Create employer"
        onSubmit={async (payload) => {
          const { error } = await adminCreateEmployer(payload);
          if (error) { toast.error(error); return; }
          toast.success("Employer created");
          navigate({ to: "/admin/employers" });
        }}
      />
    </div>
  );
}
