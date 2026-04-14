import type { LawFirm } from "@/data/lawFirms";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, MapPin, Users } from "lucide-react";

export function FirmCard({ firm }: { firm: LawFirm }) {
  return (
    <Card className="flex flex-col justify-between transition-shadow hover:shadow-lg">
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
          <span className="inline-flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {firm.attorneys.toLocaleString()} attorneys
          </span>
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="flex flex-wrap gap-1.5">
          {firm.practiceAreas.map((area) => (
            <Badge key={area} variant="outline" className="text-xs font-normal">
              {area}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full" size="sm">
          <a href={firm.careersUrl} target="_blank" rel="noopener noreferrer">
            View Careers
            <ExternalLink className="ml-1 h-3.5 w-3.5" />
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
}
