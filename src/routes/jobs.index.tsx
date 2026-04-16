import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { JobCard } from "@/components/JobCard";
import { fetchJobs, fetchAllLocations, type DbJob } from "@/lib/supabase-queries";
import { categories } from "@/data/categories";

export const Route = createFileRoute("/jobs/")({
  head: () => ({
    meta: [
      { title: "Browse Jobs — JD Careers" },
      { name: "description", content: "Search JD-advantage, legal ops, compliance, legal tech, and business professional jobs at top law firms and legal organizations." },
      { property: "og:title", content: "Browse Jobs — JD Careers" },
      { property: "og:description", content: "Search JD-advantage and legal professional jobs." },
    ],
  }),
  validateSearch: (search: Record<string, unknown>): { q?: string; category?: string } => ({
    q: (search.q as string) || undefined,
    category: (search.category as string) || undefined,
  }),
  component: JobsPage,
});

function JobsPage() {
  const { q, category: urlCategory } = Route.useSearch();
  const [search, setSearch] = useState(q || "");
  const [categoryFilter, setCategoryFilter] = useState(urlCategory || "");
  const [locationFilter, setLocationFilter] = useState("");
  const [remoteFilter, setRemoteFilter] = useState("");
  const [jobs, setJobs] = useState<DbJob[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchJobs(), fetchAllLocations()])
      .then(([j, l]) => { setJobs(j); setLocations(l); })
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return jobs.filter((j) => {
      const matchesSearch = !search || j.title.toLowerCase().includes(search.toLowerCase()) || j.employer_name.toLowerCase().includes(search.toLowerCase()) || j.description.toLowerCase().includes(search.toLowerCase());
      const matchesCat = !categoryFilter || j.category === categoryFilter;
      const matchesLoc = !locationFilter || j.location === locationFilter;
      const matchesRemote = !remoteFilter || j.remote_type === remoteFilter;
      return matchesSearch && matchesCat && matchesLoc && matchesRemote;
    });
  }, [jobs, search, categoryFilter, locationFilter, remoteFilter]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold">Browse Jobs</h1>
        <p className="mt-1 text-muted-foreground">Find your next legal career opportunity</p>
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search jobs…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="h-9 rounded-md border bg-background px-3 text-sm">
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)} className="h-9 rounded-md border bg-background px-3 text-sm">
          <option value="">All Locations</option>
          {locations.map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
        <select value={remoteFilter} onChange={(e) => setRemoteFilter(e.target.value)} className="h-9 rounded-md border bg-background px-3 text-sm">
          <option value="">All Work Types</option>
          <option value="remote">Remote</option>
          <option value="hybrid">Hybrid</option>
          <option value="onsite">On-site</option>
        </select>
      </div>

      <p className="mb-4 text-sm text-muted-foreground">
        {loading ? "Loading…" : `${filtered.length} ${filtered.length === 1 ? "job" : "jobs"} found`}
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>

      {!loading && filtered.length === 0 && (
        <div className="py-16 text-center text-muted-foreground">
          No jobs match your search. Try adjusting your filters.
        </div>
      )}
    </div>
  );
}
