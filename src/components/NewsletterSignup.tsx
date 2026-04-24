import { useState } from "react";
import { Mail, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { subscribeNewsletter } from "@/lib/supabase-queries";

interface NewsletterSignupProps {
  variant?: "card" | "inline" | "compact";
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function NewsletterSignup({ variant = "card" }: NewsletterSignupProps) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;
    if (trimmed.length > 255 || !EMAIL_RE.test(trimmed)) {
      setError("Please enter a valid email address.");
      return;
    }
    setLoading(true);
    setError(null);
    const result = await subscribeNewsletter(trimmed);
    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      setSubmitted(true);
    }
  }

  if (variant === "compact") {
    if (submitted) {
      return (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CheckCircle2 className="h-4 w-4 text-primary" />
          <span>Subscribed — see you Monday.</span>
        </div>
      );
    }
    return (
      <div>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            maxLength={255}
            className="h-9 flex-1 text-sm"
            aria-label="Email address"
          />
          <Button type="submit" size="sm" disabled={loading}>
            {loading ? "…" : "Subscribe"}
          </Button>
        </form>
        {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
      </div>
    );
  }

  if (variant === "inline") {
    if (submitted) {
      return (
        <div className="flex items-center justify-center gap-2 rounded-xl border bg-card p-6 text-sm">
          <CheckCircle2 className="h-5 w-5 text-primary" />
          <span className="font-medium">You're on the list — first issue arrives Monday.</span>
        </div>
      );
    }
    return (
      <div className="rounded-xl border bg-card p-6 sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-heading text-base font-semibold sm:text-lg">Weekly JD-advantage roles in your inbox</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                A curated Monday digest of law firm and JD-advantage jobs for non-practicing attorneys.
              </p>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="flex w-full gap-2 sm:max-w-sm">
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              maxLength={255}
              className="flex-1"
              aria-label="Email address"
            />
            <Button type="submit" disabled={loading}>
              {loading ? "Subscribing…" : "Subscribe"}
            </Button>
          </form>
        </div>
        {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="rounded-xl border bg-card p-8 text-center">
        <CheckCircle2 className="mx-auto h-8 w-8 text-primary" />
        <h3 className="mt-3 font-heading text-lg font-semibold">You're on the list!</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Your first weekly digest of curated law firm and JD-advantage roles arrives Monday.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card p-8">
      <div className="text-center">
        <Mail className="mx-auto h-8 w-8 text-primary" />
        <h3 className="mt-3 font-heading text-lg font-semibold">Get Weekly Job Alerts</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          A curated Monday digest of law firm and JD-advantage roles for non-practicing attorneys.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="mx-auto mt-5 flex max-w-md gap-2">
        <Input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          maxLength={255}
          className="flex-1"
          aria-label="Email address"
        />
        <Button type="submit" disabled={loading}>
          {loading ? "Subscribing…" : "Subscribe"}
        </Button>
      </form>
      {error && <p className="mt-2 text-center text-sm text-destructive">{error}</p>}
    </div>
  );
}
