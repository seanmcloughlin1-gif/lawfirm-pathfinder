import { useState } from "react";
import { Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { subscribeNewsletter } from "@/lib/supabase-queries";

export function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError(null);
    const result = await subscribeNewsletter(email);
    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      setSubmitted(true);
    }
  }

  if (submitted) {
    return (
      <div className="rounded-xl border bg-card p-8 text-center">
        <Mail className="mx-auto h-8 w-8 text-primary" />
        <h3 className="mt-3 font-heading text-lg font-semibold">You're on the list!</h3>
        <p className="mt-1 text-sm text-muted-foreground">We'll send weekly curated JD-advantage roles to your inbox.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card p-8">
      <div className="text-center">
        <Mail className="mx-auto h-8 w-8 text-primary" />
        <h3 className="mt-3 font-heading text-lg font-semibold">Get Weekly Job Alerts</h3>
        <p className="mt-1 text-sm text-muted-foreground">Curated non-practicing attorney and legal professional roles, delivered every Monday.</p>
      </div>
      <form onSubmit={handleSubmit} className="mx-auto mt-5 flex max-w-md gap-2">
        <Input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="flex-1"
        />
        <Button type="submit" disabled={loading}>
          {loading ? "Subscribing…" : "Subscribe"}
        </Button>
      </form>
      {error && <p className="mt-2 text-center text-sm text-destructive">{error}</p>}
    </div>
  );
}
