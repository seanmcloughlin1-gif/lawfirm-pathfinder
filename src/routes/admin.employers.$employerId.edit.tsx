import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { EmployerForm } from "@/components/admin/EmployerForm";
import { adminGetEmployer, adminUpdateEmployer } from "@/lib/admin-queries";
import type { Tables } from "@/integrations/supabase/types";

export const Route = createFileRoute("/admin/employers/$employerId/edit")({
  component: AdminEmployerEdit,
});

function AdminEmployerEdit() {
  const { employerId } = Route.useParams();
  const navigate = useNavigate();
  const [employer, setEmployer] = useState<Tables<"employers"> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminGetEmployer(employerId).then(setEmployer).catch(() => setEmployer(null)).finally(() => setLoading(false));
  }, [employerId]);

  return (
    <div>
      <Link to="/admin/employers" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to employers
      </Link>
      <h2 className="mb-6 font-heading text-2xl font-bold">Edit employer</h2>
      {loading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : !employer ? (
        <p className="text-muted-foreground">Employer not found.</p>
      ) : (
        <EmployerForm
          initial={employer}
          submitLabel="Save changes"
          onSubmit={async (payload) => {
            const { error } = await adminUpdateEmployer(employerId, payload);
            if (error) { toast.error(error); return; }
            toast.success("Employer updated");
            navigate({ to: "/admin/employers" });
          }}
        />
      )}
    </div>
  );
}
