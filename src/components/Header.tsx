import { Link } from "@tanstack/react-router";
import { Scale } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <Scale className="h-5 w-5 text-primary" />
          <span>LawCareers150</span>
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link
            to="/"
            activeProps={{ className: "text-foreground font-medium" }}
            inactiveProps={{ className: "text-muted-foreground hover:text-foreground transition-colors" }}
            activeOptions={{ exact: true }}
          >
            Directory
          </Link>
          <Link
            to="/about"
            activeProps={{ className: "text-foreground font-medium" }}
            inactiveProps={{ className: "text-muted-foreground hover:text-foreground transition-colors" }}
          >
            About
          </Link>
        </nav>
      </div>
    </header>
  );
}
