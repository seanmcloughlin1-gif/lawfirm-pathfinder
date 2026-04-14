import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { lawFirms, allStates } from "@/data/lawFirms";
import { FirmCard } from "@/components/FirmCard";
import { SearchFilters } from "@/components/SearchFilters";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Top 150 US Law Firm Careers — LawCareers150" },
      { name: "description", content: "Browse career pages for the top 150 US law firms ranked by Am Law 200. Search by name, state, or firm size." },
      { property: "og:title", content: "Top 150 US Law Firm Careers — LawCareers150" },
      { property: "og:description", content: "Browse career pages for the top 150 US law firms ranked by Am Law 200." },
    ],
  }),
  component: Index,
});

function Index() {
  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] = useState("all");
  const [sizeFilter, setSizeFilter] = useState("all");
  const [sort, setSort] = useState("rank");

  const filtered = useMemo(() => {
    let results = lawFirms.filter((f) => {
      const matchesSearch = f.name.toLowerCase().includes(search.toLowerCase());
      const matchesState = stateFilter === "all" || f.state === stateFilter;
      const matchesSize = sizeFilter === "all" || f.attorneys >= Number(sizeFilter);
      return matchesSearch && matchesState && matchesSize;
    });

    if (sort === "name") results.sort((a, b) => a.name.localeCompare(b.name));
    else if (sort === "size") results.sort((a, b) => b.attorneys - a.attorneys);
    else results.sort((a, b) => a.rank - b.rank);

    return results;
  }, [search, stateFilter, sizeFilter, sort]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Top 150 US Law Firm Careers
        </h1>
        <p className="mt-2 text-muted-foreground">
          Find career opportunities at America's leading law firms, ranked by the Am Law 200.
        </p>
      </div>

      <div className="mb-6">
        <SearchFilters
          search={search}
          onSearchChange={setSearch}
          state={stateFilter}
          onStateChange={setStateFilter}
          size={sizeFilter}
          onSizeChange={setSizeFilter}
          sort={sort}
          onSortChange={setSort}
          states={allStates}
        />
      </div>

      <p className="mb-4 text-sm text-muted-foreground">
        Showing {filtered.length} of {lawFirms.length} firms
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((firm) => (
          <FirmCard key={firm.rank} firm={firm} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="py-16 text-center text-muted-foreground">
          No firms match your filters. Try adjusting your search.
        </div>
      )}
    </div>
  );
}
