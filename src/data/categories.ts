import {
  Briefcase, Scale, Shield, Cpu, BarChart3, BookOpen, Megaphone, Users,
  AlertTriangle, GitBranch, Search, ClipboardList, FileText, Lock, Lightbulb, Kanban, TrendingUp, GraduationCap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface Category {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
}

export const categories: Category[] = [
  { id: "legal-operations", name: "Legal Operations", description: "Process, technology, and operational strategy for legal teams", icon: Briefcase },
  { id: "pricing", name: "Pricing", description: "Legal pricing strategy, AFAs, and matter budgeting", icon: BarChart3 },
  { id: "knowledge-management", name: "Knowledge Management", description: "Knowledge systems, precedent libraries, and institutional know-how", icon: BookOpen },
  { id: "compliance", name: "Compliance", description: "Regulatory compliance and governance programs", icon: Shield },
  { id: "risk", name: "Risk", description: "Enterprise and matter-level risk assessment and management", icon: AlertTriangle },
  { id: "conflicts", name: "Conflicts", description: "Conflicts clearance, new business intake, and ethics", icon: GitBranch },
  { id: "ediscovery", name: "eDiscovery", description: "Discovery operations, review management, and litigation support", icon: Search },
  { id: "practice-management", name: "Practice Management", description: "Practice group operations and attorney support", icon: ClipboardList },
  { id: "marketing-bd", name: "Marketing and Business Development", description: "Brand, marketing strategy, and growth", icon: Megaphone },
  { id: "client-development", name: "Client Development", description: "Client relationships, pursuits, and key accounts", icon: TrendingUp },
  { id: "professional-development", name: "Professional Development", description: "Attorney training, learning, and career development", icon: GraduationCap },
  { id: "legal-tech", name: "Legal Tech", description: "Legal technology product, implementation, and innovation", icon: Cpu },
  { id: "contracts", name: "Contracts", description: "Contract lifecycle management, drafting, and negotiation", icon: FileText },
  { id: "privacy", name: "Privacy", description: "Data privacy, protection programs, and DPO roles", icon: Lock },
  { id: "innovation", name: "Innovation", description: "Legal innovation, design, and new service models", icon: Lightbulb },
  { id: "project-management", name: "Project Management", description: "Legal project management and matter delivery", icon: Kanban },
  { id: "jd-advantage", name: "JD Advantage", description: "Roles that leverage a law degree outside traditional practice", icon: Scale },
  { id: "hr-talent", name: "HR & Talent", description: "Recruiting, people operations, and talent strategy", icon: Users },
];
