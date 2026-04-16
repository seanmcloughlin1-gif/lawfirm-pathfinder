import { Link } from "@tanstack/react-router";
import { MapPin, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { DbEmployer } from "@/lib/supabase-queries";

const typeLabels: Record<string, string> = {
  "law-firm": "Law Firm",
  corporate: "Corporate",
  "legal-tech": "Legal Tech",
  consulting: "Consulting",
  government: "Government",
};

export function EmployerCard({ employer, jobCount }: { employer: DbEmployer; jobCount?: number }) {
  return (
    <Card className="group transition-shadow hover:shadow-md">
      <CardContent className="flex flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 font-heading text-sm font-bold text-primary">
            {employer.name.charAt(0)}
          </div>
          {employer.employer_type && (
            <Badge variant="secondary" className="text-[10px]">{typeLabels[employer.employer_type] ?? employer.employer_type}</Badge>
          )}
        </div>
        <div>
          <Link
            to="/employers/$employerId"
            params={{ employerId: employer.slug }}
            className="font-heading text-base font-semibold text-foreground hover:text-primary transition-colors"
          >
            {employer.name}
          </Link>
          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{employer.description}</p>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          {employer.headquarters && (
            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{employer.headquarters}</span>
          )}
        </div>
        <div className="flex items-center justify-between pt-1">
          {jobCount !== undefined && (
            <span className="text-xs font-medium text-primary">{jobCount} open positions</span>
          )}
          {employer.website && (
            <a href={employer.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
              Website <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
