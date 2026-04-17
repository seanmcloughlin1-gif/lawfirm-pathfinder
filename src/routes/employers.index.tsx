import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { EmployerCard } from "@/components/EmployerCard";
import { fetchEmployers, type DbEmployer } from "@/lib/supabase-queries";
import { supabase } from "@/integrations/supabase/client";
import { employerTypes } from "@/data/employer-types";

export const Route = createFileRoute("/employers/")({
  head: () => ({
    meta: [
      { title: "Employer Directory — JD Careers" },
      { name: "description", content: "Browse law firms, legal tech companies, ALSPs, in-house legal departments, and consulting firms hiring legal professionals." },
      { property: "og:title", content: "Employer Directory — JD Careers" },
      { property: "og:description", content: "Browse employers hiring legal professionals." },
    ],
  }),
  component: EmployersPage,
});

function EmployersPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [employers, setEmployers] = useState<DbEmployer[]>([]);
  const [jobCounts, setJobCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmployers()
      .then(async (emps) => {
        setEmployers(emps);
        const { data } = await supabase
          .from("jobs")
          .select("employer_id")
          .eq("is_active", true);
        if (data) {
          const counts: Record<string, number> = {};
          for (const row of data) {
            if (row.employer_id) {
              counts[row.employer_id] = (counts[row.employer_id] || 0) + 1;
            }
          }
          setJobCounts(counts);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return employers.filter((e) => {
      const matchesSearch = !q || e.name.toLowerCase().includes(q);
      const matchesType = typeFilter === "all" || e.employer_type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [employers, search, typeFilter]);

  const hasActiveFilters = search.length > 0 || typeFilter !== "all";

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold">Employer Directory</h1>
        <p className="mt-1 text-muted-foreground">
          Discover organizations hiring legal professionals
        </p>
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search employers by name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="sm:w-64">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Employer Types</SelectItem>
            {employerTypes.map((t) => (
              <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            onClick={() => { setSearch(""); setTypeFilter("all"); }}
          >
            Clear
          </Button>
        )}
      </div>

      <p className="mb-4 text-sm text-muted-foreground">
        {loading ? "Loading…" : `${filtered.length} ${filtered.length === 1 ? "employer" : "employers"}`}
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((emp) => (
          <EmployerCard key={emp.id} employer={emp} jobCount={jobCounts[emp.id] ?? 0} />
        ))}
      </div>

      {!loading && filtered.length === 0 && (
        <div className="py-16 text-center text-muted-foreground">
          No employers match your search.
        </div>
      )}
    </div>
  );
}
