import { createFileRoute, Outlet, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Briefcase, Users, Mail, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — JD Careers" },
      { name: "description", content: "Manage job listings, employers, and subscribers." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminLayout,
});

const tabs = [
  { to: "/admin" as const, label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/admin/jobs" as const, label: "Jobs", icon: Briefcase, exact: false },
  { to: "/admin/employers" as const, label: "Employers", icon: Users, exact: false },
  { to: "/admin/subscribers" as const, label: "Subscribers", icon: Mail, exact: false },
];

function AdminLayout() {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();

  useEffect(() => {
    if (authLoading || roleLoading) return;
    if (!user) navigate({ to: "/login" });
  }, [user, authLoading, roleLoading, navigate]);

  if (authLoading || roleLoading) {
    return <div className="mx-auto max-w-7xl px-4 py-16 text-center text-muted-foreground">Loading…</div>;
  }

  if (!user) return null;

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="font-heading text-2xl font-bold">Access denied</h1>
        <p className="mt-2 text-muted-foreground">
          This area is restricted to administrators. If you need access, contact the site owner.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="font-heading text-3xl font-bold">Admin</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage listings, employers, and subscribers</p>
      </div>

      <nav className="mb-8 flex flex-wrap gap-1 border-b">
        {tabs.map((t) => {
          const Icon = t.icon;
          return (
            <Link
              key={t.to}
              to={t.to}
              activeOptions={{ exact: t.exact }}
              className="-mb-px inline-flex items-center gap-2 border-b-2 border-transparent px-4 py-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
              activeProps={{ className: "-mb-px inline-flex items-center gap-2 border-b-2 border-primary px-4 py-3 text-sm font-medium text-foreground" }}
            >
              <Icon className="h-4 w-4" /> {t.label}
            </Link>
          );
        })}
      </nav>

      <Outlet />
    </div>
  );
}
