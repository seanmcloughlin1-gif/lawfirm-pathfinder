import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { firmsWithStaffCareers, allStates, allStaffRoles } from "@/data/lawFirms";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ExternalLink, MapPin, Search, Briefcase } from "lucide-react";

export const Route = createFileRoute("/staff-careers")({
  head: () => ({
    meta: [
      { title: "Non-Attorney & Staff Careers at Top Law Firms — LawCareers150" },
      { name: "description", content: "Find non-attorney positions at America's top law firms. Browse IT, Marketing, HR, Finance, Paralegal, and Operations roles." },
      { property: "og:title", content: "Non-Attorney & Staff Careers at Top Law Firms — LawCareers150" },
      { property: "og:description", content: "Find non-attorney positions at America's top law firms." },
    ],
  }),
  component: StaffCareers,
});

function StaffCareers() {
  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");

  const filtered = useMemo(() => {
    return firmsWithStaffCareers.filter((f) => {
      const matchesSearch = f.name.toLowerCase().includes(search.toLowerCase());
      const matchesState = stateFilter === "all" || f.state === stateFilter;
      const matchesRole = roleFilter === "all" || (f.staffRoles ?? []).includes(roleFilter);
      return matchesSearch && matchesState && matchesRole;
    });
  }, [search, stateFilter, roleFilter]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Non-Attorney & Staff Careers
        </h1>
        <p className="mt-2 text-muted-foreground">
          Explore IT, Marketing, HR, Finance, and other professional staff opportunities at leading law firms.
        </p>
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search firms..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={stateFilter} onValueChange={setStateFilter}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="State" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All States</SelectItem>
            {allStates.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Role Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            {allStaffRoles.map((r) => (
              <SelectItem key={r} value={r}>{r}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <p className="mb-4 text-sm text-muted-foreground">
        Showing {filtered.length} of {firmsWithStaffCareers.length} firms with staff career pages
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((firm) => (
          <Card key={firm.rank} className="flex flex-col justify-between transition-shadow hover:shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-lg leading-snug">{firm.name}</CardTitle>
                <Badge variant="secondary" className="shrink-0 text-xs font-bold">
                  #{firm.rank}
                </Badge>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {firm.city}, {firm.state}
                </span>
              </div>
            </CardHeader>
            <CardContent className="pb-3">
              <p className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                <Briefcase className="mr-1 inline h-3 w-3" />
                Staff Role Categories
              </p>
              <div className="flex flex-wrap gap-1.5">
                {(firm.staffRoles ?? []).map((role) => (
                  <Badge key={role} variant="outline" className="text-xs font-normal">
                    {role}
                  </Badge>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full" size="sm">
                <a href={firm.staffCareersUrl} target="_blank" rel="noopener noreferrer">
                  View Staff Careers
                  <ExternalLink className="ml-1 h-3.5 w-3.5" />
                </a>
              </Button>
            </CardFooter>
          </Card>
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
