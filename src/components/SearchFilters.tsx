import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";

interface SearchFiltersProps {
  search: string;
  onSearchChange: (v: string) => void;
  state: string;
  onStateChange: (v: string) => void;
  size: string;
  onSizeChange: (v: string) => void;
  sort: string;
  onSortChange: (v: string) => void;
  states: string[];
}

export function SearchFilters({
  search,
  onSearchChange,
  state,
  onStateChange,
  size,
  onSizeChange,
  sort,
  onSortChange,
  states,
}: SearchFiltersProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search firms..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>
      <Select value={state} onValueChange={onStateChange}>
        <SelectTrigger className="w-full sm:w-[150px]">
          <SelectValue placeholder="State" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All States</SelectItem>
          {states.map((s) => (
            <SelectItem key={s} value={s}>
              {s}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={size} onValueChange={onSizeChange}>
        <SelectTrigger className="w-full sm:w-[160px]">
          <SelectValue placeholder="Firm Size" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Sizes</SelectItem>
          <SelectItem value="500">500+ attorneys</SelectItem>
          <SelectItem value="1000">1,000+ attorneys</SelectItem>
          <SelectItem value="2000">2,000+ attorneys</SelectItem>
        </SelectContent>
      </Select>
      <Select value={sort} onValueChange={onSortChange}>
        <SelectTrigger className="w-full sm:w-[150px]">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="rank">By Ranking</SelectItem>
          <SelectItem value="name">Alphabetical</SelectItem>
          <SelectItem value="size">By Size</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
