import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Target, Users, BarChart3, MailCheck, ArrowRight } from "lucide-react";
import { canonical } from "@/lib/seo";

export const Route = createFileRoute("/for-employers")({
  head: () => ({
    meta: [
      { title: "For Employers — Hire Non-Practicing Attorneys | JD Careers" },
      { name: "description", content: "Reach a focused audience of JD-advantage talent: legal operations, compliance, legal tech, KM, and law firm business professionals. Post your roles on JD Careers." },
      { property: "og:title", content: "Hire Non-Practicing Attorneys & Legal Business Professionals" },
      { property: "og:description", content: "Post your roles on the niche job board built for JD-advantage talent." },
      { property: "og:url", content: canonical("/for-employers") },
    ],
    links: [{ rel: "canonical", href: canonical("/for-employers") }],
  }),
  component: ForEmployersPage,
});

const benefits = [
  {
    icon: Target,
    title: "Reach the right candidates",
    body: "JDs exploring non-practicing paths, legal ops leaders, compliance pros, KM and legal tech specialists — all in one place.",
  },
  {
    icon: Users,
    title: "Quality over volume",
    body: "Curated audience that self-selects for legal-business roles. Less noise, more relevant applicants.",
  },
  {
    icon: BarChart3,
    title: "Transparent placement",
    body: "Clear category, JD Advantage, and Non-Practicing Attorney badges help your role surface to candidates who match.",
  },
  {
    icon: MailCheck,
    title: "Featured in our weekly digest",
    body: "Premium listings appear in our curated Monday email to subscribed legal professionals.",
  },
];

const audience = [
  "Legal operations and pricing",
  "Compliance, risk, and conflicts",
  "Knowledge management and innovation",
  "Legal technology and product",
  "Marketing, BD, and client development",
  "Practice management and PD",
  "Contracts, privacy, and eDiscovery",
  "ALSP and in-house adjacent roles",
];

function ForEmployersPage() {
  return (
    <div>
      <section className="bg-hero-bg px-4 py-16 text-center sm:py-24">
        <div className="mx-auto max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-hero-muted">For employers</p>
          <h1 className="mt-3 font-heading text-3xl font-bold tracking-tight text-hero-foreground sm:text-5xl">
            Hire non-practicing attorneys and legal business professionals
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-hero-muted">
            JD Careers is the focused job board for JD-advantage talent. Reach the candidates that
            generic boards bury — legal ops, compliance, KM, legal tech, and law firm business roles.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/contact">
              <Button size="lg">Post a role</Button>
            </Link>
            <a href="mailto:hello@jdcareers.com">
              <Button size="lg" variant="outline">Talk to our team</Button>
            </a>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <section>
          <h2 className="font-heading text-2xl font-bold">Why post with us</h2>
          <p className="mt-1 text-muted-foreground">
            Built for the niche, not the world.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {benefits.map((b) => {
              const Icon = b.icon;
              return (
                <Card key={b.title}>
                  <CardContent className="p-5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-4 font-heading text-base font-semibold">{b.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{b.body}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        <section className="mt-16">
          <h2 className="font-heading text-2xl font-bold">Who you'll reach</h2>
          <p className="mt-1 text-muted-foreground">
            Candidates across the legal-business career landscape.
          </p>
          <ul className="mt-6 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
            {audience.map((a) => (
              <li key={a} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                {a}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-16">
          <h2 className="font-heading text-2xl font-bold">How it works</h2>
          <ol className="mt-6 space-y-4">
            {[
              { n: "1", t: "Send us your role", b: "Share the listing details — title, location, summary, and apply URL." },
              { n: "2", t: "We curate and tag", b: "Our team places it in the right category with the appropriate JD Advantage / NPA badges." },
              { n: "3", t: "Candidates apply directly", b: "All applications go to your careers site. We never sit between you and the candidate." },
            ].map((s) => (
              <li key={s.n} className="flex gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                  {s.n}
                </span>
                <div>
                  <p className="font-heading font-semibold">{s.t}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">{s.b}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-16 rounded-xl bg-hero-bg p-8 text-center sm:p-12">
          <h2 className="font-heading text-2xl font-bold text-hero-foreground sm:text-3xl">
            Ready to post a role?
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-hero-muted">
            Pricing is simple and the audience is focused. Tell us about your opening and we'll get back within one business day.
          </p>
          <Link to="/contact">
            <Button size="lg" className="mt-6">
              Contact us <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </section>
      </div>
    </div>
  );
}
