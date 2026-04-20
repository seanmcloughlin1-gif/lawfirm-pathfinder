import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Briefcase, Users, Mail } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/")({
  component: AdminOverview,
});

function AdminOverview() {
  const [counts, setCounts] = useState({ activeJobs: 0, totalJobs: 0, employers: 0, subscribers: 0 });

  useEffect(() => {
    Promise.all([
      supabase.from("jobs").select("*", { count: "exact", head: true }).eq("is_active", true),
      supabase.from("jobs").select("*", { count: "exact", head: true }),
      supabase.from("employers").select("*", { count: "exact", head: true }),
      supabase.from("newsletter_subscribers").select("*", { count: "exact", head: true }),
    ]).then(([aj, tj, e, s]) => {
      setCounts({
        activeJobs: aj.count ?? 0,
        totalJobs: tj.count ?? 0,
        employers: e.count ?? 0,
        subscribers: s.count ?? 0,
      });
    });
  }, []);

  const stats = [
    { label: "Active jobs", value: counts.activeJobs, sub: `${counts.totalJobs} total`, icon: Briefcase },
    { label: "Employers", value: counts.employers, sub: "in directory", icon: Users },
    { label: "Subscribers", value: counts.subscribers, sub: "newsletter", icon: Mail },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {stats.map((s) => {
        const Icon = s.icon;
        return (
          <Card key={s.label}>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
                <p className="text-xs text-muted-foreground">{s.sub}</p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
