import { Briefcase, Scale, Shield, Cpu, BarChart3, BookOpen, Megaphone, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface Category {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  jobCount: number;
}

export const categories: Category[] = [
  { id: "legal-ops", name: "Legal Operations", description: "Process improvement, technology adoption, and operational strategy for legal departments", icon: Briefcase, jobCount: 42 },
  { id: "compliance", name: "Compliance & Risk", description: "Regulatory compliance, risk assessment, and governance programs", icon: Shield, jobCount: 38 },
  { id: "legal-tech", name: "Legal Technology", description: "Software development, implementation, and innovation in legal tech", icon: Cpu, jobCount: 31 },
  { id: "bd-marketing", name: "Business Development", description: "Client development, marketing strategy, and competitive intelligence", icon: Megaphone, jobCount: 27 },
  { id: "km", name: "Knowledge Management", description: "Knowledge systems, precedent databases, and institutional know-how", icon: BookOpen, jobCount: 22 },
  { id: "finance", name: "Finance & Pricing", description: "Legal pricing, financial analysis, budgeting, and billing operations", icon: BarChart3, jobCount: 19 },
  { id: "hr-talent", name: "HR & Talent", description: "Recruitment, professional development, and people operations", icon: Users, jobCount: 24 },
  { id: "jd-advantage", name: "JD Advantage", description: "Roles that leverage a law degree outside of traditional practice", icon: Scale, jobCount: 35 },
];
