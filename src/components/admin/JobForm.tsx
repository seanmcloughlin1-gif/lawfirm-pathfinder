import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { categories } from "@/data/categories";
import { adminListEmployers, type JobInsert } from "@/lib/admin-queries";
import type { Tables } from "@/integrations/supabase/types";

type Job = Tables<"jobs">;
type Employer = Tables<"employers">;

const REMOTE_TYPES = ["remote", "hybrid", "onsite"];
const EMPLOYMENT_TYPES = ["full-time", "part-time", "contract", "temporary", "internship"];
const SOURCE_TYPES = ["direct", "scraped", "partner", "referral"];
const STATUSES = ["draft", "published", "expired", "archived"] as const;
type JobStatus = (typeof STATUSES)[number];

interface JobFormProps {
  initial?: Job;
  onSubmit: (payload: JobInsert) => Promise<void>;
  submitLabel?: string;
}

export function JobForm({ initial, onSubmit, submitLabel = "Save" }: JobFormProps) {
  const [employers, setEmployers] = useState<Employer[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    title: initial?.title ?? "",
    employer_id: initial?.employer_id ?? "",
    employer_name: initial?.employer_name ?? "",
    location: initial?.location ?? "",
    remote_type: initial?.remote_type ?? "onsite",
    employment_type: initial?.employment_type ?? "full-time",
    salary_min: initial?.salary_min?.toString() ?? "",
    salary_max: initial?.salary_max?.toString() ?? "",
    salary_display: initial?.salary_display ?? "",
    short_summary: initial?.short_summary ?? "",
    description: initial?.description ?? "",
    category: initial?.category ?? categories[0].id,
    subcategory: initial?.subcategory ?? "",
    tags: (initial?.tags ?? []).join(", "),
    source_url: initial?.source_url ?? "",
    source_type: initial?.source_type ?? "direct",
    source_name: (initial as { source_name?: string | null } | undefined)?.source_name ?? "",
    imported_at:
      (initial as { imported_at?: string | null } | undefined)?.imported_at?.slice(0, 10) ?? "",
    status: ((initial as { status?: JobStatus } | undefined)?.status ?? "published") as JobStatus,
    date_posted: initial?.date_posted ?? new Date().toISOString().slice(0, 10),
    expiration_date: initial?.expiration_date ?? "",
    is_jd_advantage: initial?.is_jd_advantage ?? false,
    is_non_practicing_attorney_role: initial?.is_non_practicing_attorney_role ?? false,
    is_active: initial?.is_active ?? true,
    featured: initial?.featured ?? false,
  });

  useEffect(() => {
    adminListEmployers().then(setEmployers).catch(() => setEmployers([]));
  }, []);

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleEmployerChange = (id: string) => {
    const emp = employers.find((e) => e.id === id);
    setForm((f) => ({ ...f, employer_id: id, employer_name: emp?.name ?? f.employer_name }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const payload: JobInsert = {
      title: form.title.trim(),
      employer_id: form.employer_id || null,
      employer_name: form.employer_name.trim(),
      location: form.location.trim(),
      remote_type: form.remote_type,
      employment_type: form.employment_type,
      salary_min: form.salary_min ? Number(form.salary_min) : null,
      salary_max: form.salary_max ? Number(form.salary_max) : null,
      salary_display: form.salary_display.trim() || null,
      short_summary: form.short_summary.trim() || null,
      description: form.description.trim(),
      category: form.category,
      subcategory: form.subcategory.trim() || null,
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      source_url: form.source_url.trim() || null,
      source_type: form.source_type || null,
      date_posted: form.date_posted,
      expiration_date: form.expiration_date || null,
      is_jd_advantage: form.is_jd_advantage,
      is_non_practicing_attorney_role: form.is_non_practicing_attorney_role,
      is_active: form.is_active,
      featured: form.featured,
    };
    try {
      await onSubmit(payload);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label htmlFor="title">Title *</Label>
          <Input id="title" required value={form.title} onChange={(e) => set("title", e.target.value)} />
        </div>

        <div>
          <Label>Employer</Label>
          <Select value={form.employer_id || "none"} onValueChange={(v) => handleEmployerChange(v === "none" ? "" : v)}>
            <SelectTrigger><SelectValue placeholder="Select employer" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">— None (use name only) —</SelectItem>
              {employers.map((e) => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="employer_name">Employer name *</Label>
          <Input id="employer_name" required value={form.employer_name} onChange={(e) => set("employer_name", e.target.value)} />
        </div>

        <div>
          <Label htmlFor="location">Location *</Label>
          <Input id="location" required value={form.location} onChange={(e) => set("location", e.target.value)} />
        </div>
        <div>
          <Label>Remote type *</Label>
          <Select value={form.remote_type} onValueChange={(v) => set("remote_type", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{REMOTE_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
          </Select>
        </div>

        <div>
          <Label>Employment type *</Label>
          <Select value={form.employment_type} onValueChange={(v) => set("employment_type", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{EMPLOYMENT_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <Label>Category *</Label>
          <Select value={form.category} onValueChange={(v) => set("category", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="subcategory">Subcategory</Label>
          <Input id="subcategory" value={form.subcategory} onChange={(e) => set("subcategory", e.target.value)} />
        </div>
        <div>
          <Label htmlFor="tags">Tags (comma-separated)</Label>
          <Input id="tags" value={form.tags} onChange={(e) => set("tags", e.target.value)} placeholder="contracts, AI, hybrid" />
        </div>

        <div>
          <Label htmlFor="salary_min">Salary min</Label>
          <Input id="salary_min" type="number" value={form.salary_min} onChange={(e) => set("salary_min", e.target.value)} />
        </div>
        <div>
          <Label htmlFor="salary_max">Salary max</Label>
          <Input id="salary_max" type="number" value={form.salary_max} onChange={(e) => set("salary_max", e.target.value)} />
        </div>

        <div className="sm:col-span-2">
          <Label htmlFor="salary_display">Salary display text</Label>
          <Input id="salary_display" value={form.salary_display} onChange={(e) => set("salary_display", e.target.value)} placeholder="$120k–$150k" />
        </div>

        <div className="sm:col-span-2">
          <Label htmlFor="short_summary">Short summary</Label>
          <Textarea id="short_summary" rows={2} value={form.short_summary} onChange={(e) => set("short_summary", e.target.value)} />
        </div>

        <div className="sm:col-span-2">
          <Label htmlFor="description">Full description *</Label>
          <Textarea id="description" required rows={10} value={form.description} onChange={(e) => set("description", e.target.value)} />
        </div>

        <div>
          <Label htmlFor="source_url">Source URL</Label>
          <Input id="source_url" type="url" value={form.source_url} onChange={(e) => set("source_url", e.target.value)} />
        </div>
        <div>
          <Label>Source type</Label>
          <Select value={form.source_type} onValueChange={(v) => set("source_type", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{SOURCE_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="date_posted">Posted date *</Label>
          <Input id="date_posted" type="date" required value={form.date_posted} onChange={(e) => set("date_posted", e.target.value)} />
        </div>
        <div>
          <Label htmlFor="expiration_date">Expiration date</Label>
          <Input id="expiration_date" type="date" value={form.expiration_date} onChange={(e) => set("expiration_date", e.target.value)} />
        </div>
      </div>

      <div className="space-y-3 rounded-lg border bg-muted/30 p-4">
        <div className="flex items-center gap-2">
          <Checkbox id="jda" checked={form.is_jd_advantage} onCheckedChange={(c) => set("is_jd_advantage", !!c)} />
          <Label htmlFor="jda" className="cursor-pointer font-normal">JD Advantage role</Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox id="npa" checked={form.is_non_practicing_attorney_role} onCheckedChange={(c) => set("is_non_practicing_attorney_role", !!c)} />
          <Label htmlFor="npa" className="cursor-pointer font-normal">Non-Practicing Attorney role</Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox id="active" checked={form.is_active} onCheckedChange={(c) => set("is_active", !!c)} />
          <Label htmlFor="active" className="cursor-pointer font-normal">Active (visible to public)</Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox id="featured" checked={form.featured} onCheckedChange={(c) => set("featured", !!c)} />
          <Label htmlFor="featured" className="cursor-pointer font-normal">Featured</Label>
        </div>
      </div>

      <Button type="submit" disabled={submitting} size="lg">
        {submitting ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}
