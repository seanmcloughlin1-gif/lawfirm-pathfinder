import { Link } from "@tanstack/react-router";
import { MapPin, Clock, Building2, DollarSign, Sparkles, Scale } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { categories } from "@/data/categories";
import type { DbJob } from "@/lib/supabase-queries";

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  if (diff < 7) return `${diff} days ago`;
  if (diff < 30) return `${Math.floor(diff / 7)}w ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const remoteLabels: Record<string, string> = {
  remote: "Remote",
  hybrid: "Hybrid",
  onsite: "On-site",
};

const employmentLabels: Record<string, string> = {
  "full-time": "Full-time",
  "part-time": "Part-time",
  contract: "Contract",
  temporary: "Temporary",
  internship: "Internship",
};

export function JobCard({ job }: { job: DbJob }) {
  const cat = categories.find((c) => c.id === job.category);
  const summary = job.short_summary || job.description;
  const tags = (job.tags ?? []).slice(0, 4);

  return (
    <Card className="group transition-all hover:shadow-md hover:border-primary/30">
      <CardContent className="flex flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              {job.featured && (
                <Badge className="bg-primary/10 text-primary border-0 text-[10px] font-medium">Featured</Badge>
              )}
              {job.is_jd_advantage && (
                <Badge className="bg-amber-500/10 text-amber-700 border-0 text-[10px] font-medium dark:text-amber-400">
                  <Scale className="mr-1 h-2.5 w-2.5" />JD Advantage
                </Badge>
              )}
              {job.is_non_practicing_attorney_role && (
                <Badge className="bg-emerald-500/10 text-emerald-700 border-0 text-[10px] font-medium dark:text-emerald-400">
                  <Sparkles className="mr-1 h-2.5 w-2.5" />Non-Practicing Attorney
                </Badge>
              )}
            </div>
            <Link
              to="/jobs/$jobId"
              params={{ jobId: job.id }}
              className="mt-1.5 block font-heading text-base font-semibold leading-tight text-foreground hover:text-primary transition-colors line-clamp-2"
            >
              {job.title}
            </Link>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
              <Building2 className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{job.employer_name}</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{job.location}</span>
          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{remoteLabels[job.remote_type] ?? job.remote_type}</span>
          {job.salary_display && (
            <span className="flex items-center gap-1 font-medium text-foreground"><DollarSign className="h-3 w-3" />{job.salary_display}</span>
          )}
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2">{summary}</p>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-[10px] font-normal">{tag}</Badge>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between border-t border-border/60 pt-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {cat && <Badge variant="secondary" className="text-[10px]">{cat.name}</Badge>}
            <Badge variant="outline" className="text-[10px]">{employmentLabels[job.employment_type] ?? job.employment_type}</Badge>
          </div>
          <span className="text-[11px] text-muted-foreground shrink-0">{formatDate(job.date_posted)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
