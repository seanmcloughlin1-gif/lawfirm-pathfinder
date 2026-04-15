import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="border-t bg-muted/40">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="font-heading text-lg font-bold tracking-tight">JD Careers</p>
            <p className="mt-2 text-sm text-muted-foreground">
              The niche job board for non-practicing attorneys, legal ops professionals, and law firm business staff.
            </p>
          </div>
          <div>
            <h4 className="font-heading text-sm font-semibold">Navigate</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><Link to="/" className="hover:text-foreground transition-colors">Home</Link></li>
              <li><Link to="/jobs" className="hover:text-foreground transition-colors">Jobs</Link></li>
              <li><Link to="/employers" className="hover:text-foreground transition-colors">Employers</Link></li>
              <li><Link to="/about" className="hover:text-foreground transition-colors">About</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-heading text-sm font-semibold">Company</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><Link to="/contact" className="hover:text-foreground transition-colors">Contact</Link></li>
              <li><Link to="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-heading text-sm font-semibold">For Employers</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">Post a Job</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Pricing</a></li>
              <li><Link to="/contact" className="hover:text-foreground transition-colors">Get in Touch</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t pt-8 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} JD Careers. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
