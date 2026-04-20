import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { employerTypes } from "@/data/employer-types";
import type { EmployerInsert } from "@/lib/admin-queries";
import type { Tables } from "@/integrations/supabase/types";

type Employer = Tables<"employers">;

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

interface EmployerFormProps {
  initial?: Employer;
  onSubmit: (payload: EmployerInsert) => Promise<void>;
  submitLabel?: string;
}

export function EmployerForm({ initial, onSubmit, submitLabel = "Save" }: EmployerFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    slug: initial?.slug ?? "",
    employer_type: initial?.employer_type ?? employerTypes[0].id,
    headquarters: initial?.headquarters ?? "",
    website: initial?.website ?? "",
    logo_url: initial?.logo_url ?? "",
    description: initial?.description ?? "",
  });
  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const payload: EmployerInsert = {
      name: form.name.trim(),
      slug: (form.slug || slugify(form.name)).trim(),
      employer_type: form.employer_type,
      headquarters: form.headquarters.trim() || null,
      website: form.website.trim() || null,
      logo_url: form.logo_url.trim() || null,
      description: form.description.trim() || null,
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
        <div>
          <Label htmlFor="name">Name *</Label>
          <Input id="name" required value={form.name}
            onChange={(e) => {
              const name = e.target.value;
              setForm((f) => ({ ...f, name, slug: f.slug || slugify(name) }));
            }}
          />
        </div>
        <div>
          <Label htmlFor="slug">Slug *</Label>
          <Input id="slug" required value={form.slug} onChange={(e) => set("slug", e.target.value)} />
        </div>
        <div>
          <Label>Employer type</Label>
          <Select value={form.employer_type} onValueChange={(v) => set("employer_type", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{employerTypes.map((t) => <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="headquarters">Headquarters</Label>
          <Input id="headquarters" value={form.headquarters} onChange={(e) => set("headquarters", e.target.value)} />
        </div>
        <div>
          <Label htmlFor="website">Website</Label>
          <Input id="website" type="url" value={form.website} onChange={(e) => set("website", e.target.value)} placeholder="https://" />
        </div>
        <div>
          <Label htmlFor="logo_url">Logo URL</Label>
          <Input id="logo_url" type="url" value={form.logo_url} onChange={(e) => set("logo_url", e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" rows={6} value={form.description} onChange={(e) => set("description", e.target.value)} />
        </div>
      </div>
      <Button type="submit" disabled={submitting} size="lg">
        {submitting ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}
