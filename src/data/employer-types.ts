export interface EmployerType {
  id: string;
  label: string;
}

export const employerTypes: EmployerType[] = [
  { id: "law-firm", label: "Law Firm" },
  { id: "legal-tech-company", label: "Legal Tech Company" },
  { id: "alsp", label: "ALSP" },
  { id: "in-house", label: "In-House Legal Department" },
  { id: "consulting-firm", label: "Consulting Firm" },
  { id: "professional-services", label: "Professional Services Firm" },
];

export const employerTypeLabels: Record<string, string> = Object.fromEntries(
  employerTypes.map((t) => [t.id, t.label]),
);

export function formatEmployerType(value: string | null | undefined): string {
  if (!value) return "";
  return employerTypeLabels[value] ?? value.replace(/[-_]/g, " ");
}
