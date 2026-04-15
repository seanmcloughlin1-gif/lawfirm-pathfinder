import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { EmployerCard } from "@/components/EmployerCard";
import { employers } from "@/data/employers";

export const Route = createFileRoute("/employers/")({
  head: () => ({
    meta: [
      { title: "Employer Directory — JD Careers" },
      { name: "description", content: "Browse law firms, legal tech companies, and consulting firms hiring JD-advantage and legal business professionals." },
      { property: "og:title", content: "Employer Directory — JD Careers" },
      { property: "og:description", content: "Browse employers hiring legal professionals." },
    ],
  }),
  component: EmployersPage,
});

function EmployersPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  const filtered = useMemo(() => {
    return employers.filter((e) => {
      const matchesSearch = !search || e.name.toLowerCase().includes(search.toLowerCase());
      const matchesType = !typeFilter || e.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [search, typeFilter]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold">Employer Directory</h1>
        <p className="mt-1 text-muted-foreground">Discover organizations hiring legal professionals</p>
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search employers…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="h-9 rounded-md border bg-background px-3 text-sm">
          <option value="">All Types</option>
          <option value="law-firm">Law Firm</option>
          <option value="legal-tech">Legal Tech</option>
          <option value="consulting">Consulting</option>
          <option value="corporate">Corporate</option>
          <option value="government">Government</option>
        </select>
      </div>

      <p className="mb-4 text-sm text-muted-foreground">{filtered.length} employers</p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((emp) => (
          <EmployerCard key={emp.id} employer={emp} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="py-16 text-center text-muted-foreground">No employers match your search.</div>
      )}
    </div>
  );
}
