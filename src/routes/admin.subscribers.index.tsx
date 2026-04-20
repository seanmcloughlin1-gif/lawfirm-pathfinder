import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Mail, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { adminListSubscribers } from "@/lib/admin-queries";
import type { Tables } from "@/integrations/supabase/types";

export const Route = createFileRoute("/admin/subscribers/")({
  component: AdminSubscribers,
});

function AdminSubscribers() {
  const [subs, setSubs] = useState<Tables<"newsletter_subscribers">[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminListSubscribers().then(setSubs).catch(() => setSubs([])).finally(() => setLoading(false));
  }, []);

  const exportCsv = () => {
    const csv = ["email,subscribed_at", ...subs.map((s) => `${s.email},${s.created_at}`)].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="font-heading text-2xl font-bold">Newsletter subscribers</h2>
          <p className="mt-1 text-sm text-muted-foreground">{subs.length} {subs.length === 1 ? "subscriber" : "subscribers"}</p>
        </div>
        {subs.length > 0 && (
          <Button variant="outline" size="sm" className="gap-1.5" onClick={exportCsv}>
            <Download className="h-4 w-4" /> Export CSV
          </Button>
        )}
      </div>

      {loading ? (
        <p className="py-12 text-center text-muted-foreground">Loading…</p>
      ) : subs.length === 0 ? (
        <div className="rounded-lg border border-dashed py-16 text-center">
          <Mail className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-3 text-muted-foreground">No subscribers yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr className="text-left">
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Subscribed</th>
              </tr>
            </thead>
            <tbody>
              {subs.map((s) => (
                <tr key={s.id} className="border-t">
                  <td className="px-4 py-3">{s.email}</td>
                  <td className="px-4 py-3 text-muted-foreground">{new Date(s.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
