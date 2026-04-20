import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminListEmployers, adminDeleteEmployer } from "@/lib/admin-queries";
import { formatEmployerType } from "@/data/employer-types";
import type { Tables } from "@/integrations/supabase/types";

export const Route = createFileRoute("/admin/employers/")({
  component: AdminEmployersList,
});

function AdminEmployersList() {
  const [employers, setEmployers] = useState<Tables<"employers">[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    adminListEmployers().then(setEmployers).catch(() => setEmployers([])).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const filtered = employers.filter((e) => e.name.toLowerCase().includes(search.toLowerCase()));

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? Jobs referencing this employer will be unlinked.`)) return;
    const { error } = await adminDeleteEmployer(id);
    if (error) return toast.error(error);
    toast.success("Employer deleted");
    load();
  };

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Input
          placeholder="Search employers…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="sm:max-w-md"
        />
        <Link to="/admin/employers/new">
          <Button className="gap-1.5"><Plus className="h-4 w-4" /> New employer</Button>
        </Link>
      </div>

      {loading ? (
        <p className="py-12 text-center text-muted-foreground">Loading…</p>
      ) : filtered.length === 0 ? (
        <p className="py-12 text-center text-muted-foreground">No employers found.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr className="text-left">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Headquarters</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((emp) => (
                <tr key={emp.id} className="border-t">
                  <td className="px-4 py-3 font-medium">{emp.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{formatEmployerType(emp.employer_type)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{emp.headquarters ?? "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Link to="/admin/employers/$employerId/edit" params={{ employerId: emp.id }}>
                        <Button size="icon" variant="ghost" aria-label="Edit"><Pencil className="h-4 w-4" /></Button>
                      </Link>
                      <Button size="icon" variant="ghost" aria-label="Delete" onClick={() => handleDelete(emp.id, emp.name)}>
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
