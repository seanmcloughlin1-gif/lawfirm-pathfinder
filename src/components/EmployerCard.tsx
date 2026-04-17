import { Link } from "@tanstack/react-router";
import { MapPin, ExternalLink, Building2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatEmployerType } from "@/data/employer-types";
import type { DbEmployer } from "@/lib/supabase-queries";

export function EmployerCard({
  employer,
  jobCount,
}: {
  employer: DbEmployer;
  jobCount?: number;
}) {
  return (
    <Card className="group h-full transition-shadow hover:shadow-md">
      <CardContent className="flex h-full flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-2">
          {employer.logo_url ? (
            <img
              src={employer.logo_url}
              alt={`${employer.name} logo`}
              className="h-10 w-10 shrink-0 rounded-lg object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 font-heading text-sm font-bold text-primary">
              {employer.name.charAt(0)}
            </div>
          )}
          {employer.employer_type && (
            <Badge variant="secondary" className="text-[10px]">
              {formatEmployerType(employer.employer_type)}
            </Badge>
          )}
        </div>

        <div>
          <Link
            to="/employers/$employerId"
            params={{ employerId: employer.slug }}
            className="font-heading text-base font-semibold text-foreground transition-colors hover:text-primary"
          >
            {employer.name}
          </Link>
          {employer.description && (
            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
              {employer.description}
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          {employer.headquarters && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />{employer.headquarters}
            </span>
          )}
        </div>

        <div className="mt-auto flex items-center justify-between pt-1">
          {jobCount !== undefined ? (
            <span className="flex items-center gap-1 text-xs font-medium text-primary">
              <Building2 className="h-3 w-3" />
              {jobCount} open {jobCount === 1 ? "role" : "roles"}
            </span>
          ) : (
            <span />
          )}
          {employer.website && (
            <a
              href={employer.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              Website <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
