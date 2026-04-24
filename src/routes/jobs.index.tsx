import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { JobCard } from "@/components/JobCard";
import { NewsletterSignup } from "@/components/NewsletterSignup";
import {
  fetchJobs,
  fetchAllLocations,
  fetchEmployers,
  type DbJob,
  type DbEmployer,
} from "@/lib/supabase-queries";
import { categories } from "@/data/categories";

type SortOption = "newest" | "oldest" | "salary-desc" | "salary-asc";

const REMOTE_TYPES = [
  { id: "remote", label: "Remote" },
  { id: "hybrid", label: "Hybrid" },
  { id: "onsite", label: "On-site" },
];

const EMPLOYMENT_TYPES = [
  { id: "full-time", label: "Full-time" },
  { id: "part-time", label: "Part-time" },
  { id: "contract", label: "Contract" },
  { id: "temporary", label: "Temporary" },
  { id: "internship", label: "Internship" },
];

export const Route = createFileRoute("/jobs/")({
  head: () => ({
    meta: [
      { title: "Browse Jobs — JD-Advantage & Legal Professional Roles | JD Careers" },
      { name: "description", content: "Search curated JD-advantage, legal ops, compliance, legal tech, KM, and law firm business professional jobs. Filter by category, location, and remote type." },
      { property: "og:title", content: "Browse Jobs — JD Careers" },
      { property: "og:description", content: "Search JD-advantage and legal professional jobs at top firms and legal organizations." },
      { property: "og:url", content: "https://jdcareers.app/jobs" },
    ],
    links: [{ rel: "canonical", href: "https://jdcareers.app/jobs" }],
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
  const [categoryFilters, setCategoryFilters] = useState<string[]>(urlCategory ? [urlCategory] : []);
  const [employerFilters, setEmployerFilters] = useState<string[]>([]);
  const [locationFilter, setLocationFilter] = useState("");
  const [remoteFilters, setRemoteFilters] = useState<string[]>([]);
  const [employmentFilters, setEmploymentFilters] = useState<string[]>([]);
  const [salaryOnly, setSalaryOnly] = useState(false);
  const [jdAdvantageOnly, setJdAdvantageOnly] = useState(false);
  const [npaOnly, setNpaOnly] = useState(false);
  const [sort, setSort] = useState<SortOption>("newest");

  const [jobs, setJobs] = useState<DbJob[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [employers, setEmployers] = useState<DbEmployer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchJobs(), fetchAllLocations(), fetchEmployers()])
      .then(([j, l, e]) => { setJobs(j); setLocations(l); setEmployers(e); })
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const result = jobs.filter((j) => {
      const s = search.toLowerCase();
      const matchesSearch = !s
        || j.title.toLowerCase().includes(s)
        || j.employer_name.toLowerCase().includes(s)
        || j.description.toLowerCase().includes(s)
        || (j.tags ?? []).some((t) => t.toLowerCase().includes(s));
      const matchesCat = categoryFilters.length === 0 || categoryFilters.includes(j.category);
      const matchesEmp = employerFilters.length === 0 || (j.employer_id && employerFilters.includes(j.employer_id));
      const matchesLoc = !locationFilter || j.location === locationFilter;
      const matchesRemote = remoteFilters.length === 0 || remoteFilters.includes(j.remote_type);
      const matchesType = employmentFilters.length === 0 || employmentFilters.includes(j.employment_type);
      const matchesSalary = !salaryOnly || !!(j.salary_min || j.salary_max || j.salary_display);
      const matchesJd = !jdAdvantageOnly || j.is_jd_advantage;
      const matchesNpa = !npaOnly || j.is_non_practicing_attorney_role;
      return matchesSearch && matchesCat && matchesEmp && matchesLoc && matchesRemote && matchesType && matchesSalary && matchesJd && matchesNpa;
    });

    return result.sort((a, b) => {
      switch (sort) {
        case "oldest":
          return new Date(a.date_posted).getTime() - new Date(b.date_posted).getTime();
        case "salary-desc":
          return (b.salary_max ?? b.salary_min ?? 0) - (a.salary_max ?? a.salary_min ?? 0);
        case "salary-asc": {
          const av = a.salary_min ?? a.salary_max ?? Number.POSITIVE_INFINITY;
          const bv = b.salary_min ?? b.salary_max ?? Number.POSITIVE_INFINITY;
          return av - bv;
        }
        case "newest":
        default:
          return new Date(b.date_posted).getTime() - new Date(a.date_posted).getTime();
      }
    });
  }, [jobs, search, categoryFilters, employerFilters, locationFilter, remoteFilters, employmentFilters, salaryOnly, jdAdvantageOnly, npaOnly, sort]);

  const activeFilterCount =
    categoryFilters.length + employerFilters.length + remoteFilters.length + employmentFilters.length
    + (locationFilter ? 1 : 0) + (salaryOnly ? 1 : 0) + (jdAdvantageOnly ? 1 : 0) + (npaOnly ? 1 : 0);

  const clearAll = () => {
    setCategoryFilters([]);
    setEmployerFilters([]);
    setLocationFilter("");
    setRemoteFilters([]);
    setEmploymentFilters([]);
    setSalaryOnly(false);
    setJdAdvantageOnly(false);
    setNpaOnly(false);
  };

  const filterPanel = (
    <FiltersPanel
      categoryFilters={categoryFilters}
      setCategoryFilters={setCategoryFilters}
      employerFilters={employerFilters}
      setEmployerFilters={setEmployerFilters}
      locationFilter={locationFilter}
      setLocationFilter={setLocationFilter}
      remoteFilters={remoteFilters}
      setRemoteFilters={setRemoteFilters}
      employmentFilters={employmentFilters}
      setEmploymentFilters={setEmploymentFilters}
      salaryOnly={salaryOnly}
      setSalaryOnly={setSalaryOnly}
      jdAdvantageOnly={jdAdvantageOnly}
      setJdAdvantageOnly={setJdAdvantageOnly}
      npaOnly={npaOnly}
      setNpaOnly={setNpaOnly}
      employers={employers}
      locations={locations}
      onClearAll={clearAll}
      activeCount={activeFilterCount}
    />
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="font-heading text-3xl font-bold">Browse Jobs</h1>
        <p className="mt-1 text-muted-foreground">Find your next legal career opportunity</p>
      </div>

      {/* Search bar */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by title, employer, or keyword…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-10"
          />
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortOption)}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm font-medium"
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="salary-desc">Salary: high to low</option>
          <option value="salary-asc">Salary: low to high</option>
        </select>

        {/* Mobile filter trigger */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="h-10 lg:hidden">
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Filters {activeFilterCount > 0 && <span className="ml-1.5 rounded-full bg-primary px-1.5 text-[10px] text-primary-foreground">{activeFilterCount}</span>}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-full max-w-sm overflow-y-auto p-0">
            <SheetHeader className="border-b px-5 py-4">
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <div className="p-5">{filterPanel}</div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex gap-6">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block w-72 shrink-0">
          <div className="sticky top-20 rounded-lg border bg-card p-5">
            {filterPanel}
          </div>
        </aside>

        {/* Results */}
        <div className="min-w-0 flex-1">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {loading ? "Loading…" : `${filtered.length} ${filtered.length === 1 ? "job" : "jobs"} found`}
            </p>
            {activeFilterCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearAll} className="h-8 text-xs">
                <X className="mr-1 h-3 w-3" />Clear filters
              </Button>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {filtered.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>

          {!loading && filtered.length === 0 && (
            <div className="rounded-lg border border-dashed py-16 text-center">
              <p className="text-muted-foreground">No jobs match your search.</p>
              <Button variant="link" onClick={clearAll} className="mt-2">Clear filters</Button>
            </div>
          )}

          <div className="mt-10">
            <NewsletterSignup variant="inline" />
          </div>
        </div>
      </div>
    </div>
  );
}

interface FiltersPanelProps {
  categoryFilters: string[];
  setCategoryFilters: (v: string[]) => void;
  employerFilters: string[];
  setEmployerFilters: (v: string[]) => void;
  locationFilter: string;
  setLocationFilter: (v: string) => void;
  remoteFilters: string[];
  setRemoteFilters: (v: string[]) => void;
  employmentFilters: string[];
  setEmploymentFilters: (v: string[]) => void;
  salaryOnly: boolean;
  setSalaryOnly: (v: boolean) => void;
  jdAdvantageOnly: boolean;
  setJdAdvantageOnly: (v: boolean) => void;
  npaOnly: boolean;
  setNpaOnly: (v: boolean) => void;
  employers: DbEmployer[];
  locations: string[];
  onClearAll: () => void;
  activeCount: number;
}

function FiltersPanel(props: FiltersPanelProps) {
  const toggle = (arr: string[], val: string, setter: (v: string[]) => void) => {
    setter(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-sm font-semibold uppercase tracking-wide text-muted-foreground">Filters</h2>
        {props.activeCount > 0 && (
          <button onClick={props.onClearAll} className="text-xs font-medium text-primary hover:underline">
            Clear all
          </button>
        )}
      </div>

      {/* Quick toggles */}
      <FilterSection title="Quick filters">
        <CheckboxRow id="jd-advantage" label="JD Advantage only" checked={props.jdAdvantageOnly} onCheckedChange={props.setJdAdvantageOnly} />
        <CheckboxRow id="npa" label="Non-Practicing Attorney" checked={props.npaOnly} onCheckedChange={props.setNpaOnly} />
        <CheckboxRow id="salary" label="Salary listed" checked={props.salaryOnly} onCheckedChange={props.setSalaryOnly} />
      </FilterSection>

      <FilterSection title="Work type">
        {REMOTE_TYPES.map((t) => (
          <CheckboxRow
            key={t.id}
            id={`remote-${t.id}`}
            label={t.label}
            checked={props.remoteFilters.includes(t.id)}
            onCheckedChange={() => toggle(props.remoteFilters, t.id, props.setRemoteFilters)}
          />
        ))}
      </FilterSection>

      <FilterSection title="Employment type">
        {EMPLOYMENT_TYPES.map((t) => (
          <CheckboxRow
            key={t.id}
            id={`emp-${t.id}`}
            label={t.label}
            checked={props.employmentFilters.includes(t.id)}
            onCheckedChange={() => toggle(props.employmentFilters, t.id, props.setEmploymentFilters)}
          />
        ))}
      </FilterSection>

      <FilterSection title="Location">
        <select
          value={props.locationFilter}
          onChange={(e) => props.setLocationFilter(e.target.value)}
          className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">All locations</option>
          {props.locations.map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
      </FilterSection>

      <FilterSection title="Category" scrollable>
        {categories.map((c) => (
          <CheckboxRow
            key={c.id}
            id={`cat-${c.id}`}
            label={c.name}
            checked={props.categoryFilters.includes(c.id)}
            onCheckedChange={() => toggle(props.categoryFilters, c.id, props.setCategoryFilters)}
          />
        ))}
      </FilterSection>

      {props.employers.length > 0 && (
        <FilterSection title="Employer" scrollable>
          {props.employers.map((e) => (
            <CheckboxRow
              key={e.id}
              id={`emp2-${e.id}`}
              label={e.name}
              checked={props.employerFilters.includes(e.id)}
              onCheckedChange={() => toggle(props.employerFilters, e.id, props.setEmployerFilters)}
            />
          ))}
        </FilterSection>
      )}
    </div>
  );
}

function FilterSection({ title, scrollable, children }: { title: string; scrollable?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</h3>
      <div className={scrollable ? "max-h-56 space-y-2 overflow-y-auto pr-1" : "space-y-2"}>
        {children}
      </div>
    </div>
  );
}

function CheckboxRow({ id, label, checked, onCheckedChange }: { id: string; label: string; checked: boolean; onCheckedChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center gap-2">
      <Checkbox id={id} checked={checked} onCheckedChange={(v) => onCheckedChange(v === true)} />
      <Label htmlFor={id} className="cursor-pointer text-sm font-normal leading-none">{label}</Label>
    </div>
  );
}
