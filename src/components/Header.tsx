import { Link } from "@tanstack/react-router";
import { Scale, Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const navLinks = [
  { to: "/" as const, label: "Home", exact: true },
  { to: "/jobs" as const, label: "Jobs", exact: false },
  { to: "/employers" as const, label: "Employers", exact: false },
  { to: "/about" as const, label: "About", exact: false },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <Scale className="h-5 w-5 text-primary" />
          <span className="font-heading text-lg font-bold tracking-tight">JD Careers</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm md:flex">
          {navLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeProps={{ className: "text-foreground font-medium" }}
              inactiveProps={{ className: "text-muted-foreground hover:text-foreground transition-colors" }}
              activeOptions={{ exact: l.exact }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link to="/login">
            <Button variant="ghost" size="sm">Sign In</Button>
          </Link>
        </div>

        <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t px-4 pb-4 pt-2 md:hidden">
          <nav className="flex flex-col gap-2 text-sm">
            {navLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="rounded-md px-3 py-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                {l.label}
              </Link>
            ))}
            <Link to="/login" onClick={() => setMobileOpen(false)}>
              <Button variant="outline" size="sm" className="mt-2 w-full">Sign In</Button>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
