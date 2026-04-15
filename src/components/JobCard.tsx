import { Link } from "@tanstack/react-router";
import { MapPin, Clock, Building2, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { categories } from "@/data/categories";
import type { Job } from "@/data/jobs";

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

export function JobCard({ job }: { job: Job }) {
  const cat = categories.find((c) => c.id === job.category);
  return (
    <Card className="group transition-shadow hover:shadow-md">
      <CardContent className="flex flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <Link
              to="/jobs/$jobId"
              params={{ jobId: job.id }}
              className="font-heading text-base font-semibold leading-tight text-foreground hover:text-primary transition-colors line-clamp-2"
            >
              {job.title}
            </Link>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
              <Building2 className="h-3.5 w-3.5 shrink-0" />
              {job.employerName}
            </p>
          </div>
          {job.featured && (
            <Badge className="shrink-0 bg-primary/10 text-primary border-0 text-[10px]">Featured</Badge>
          )}
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{job.location}</span>
          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{remoteLabels[job.remote]}</span>
          {job.salary && <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" />{job.salary}</span>}
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2">{job.description}</p>

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            {cat && <Badge variant="secondary" className="text-[10px]">{cat.name}</Badge>}
            <Badge variant="outline" className="text-[10px]">{job.type}</Badge>
          </div>
          <span className="text-[11px] text-muted-foreground">{formatDate(job.postedDate)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
