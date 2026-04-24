import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Briefcase, Compass, ShieldCheck, Sparkles } from "lucide-react";
import { canonical, SITE_URL } from "@/lib/seo";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About JD Careers — A Job Board for Non-Practicing Attorneys" },
      { name: "description", content: "JD Careers is a niche job board curating JD-advantage, legal operations, compliance, legal tech, and law firm business professional roles." },
      { property: "og:title", content: "About JD Careers" },
      { property: "og:description", content: "A niche job board for non-practicing attorneys and legal business professionals." },
      { property: "og:url", content: canonical("/about") },
    ],
    links: [{ rel: "canonical", href: canonical("/about") }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "AboutPage",
          name: "About JD Careers",
          url: `${SITE_URL}/about`,
        }),
      },
    ],
  }),
  component: AboutPage,
});

const pillars = [
  {
    icon: Compass,
    title: "Curated, not cluttered",
    body: "Every role is hand-reviewed for fit with non-practicing JDs and legal business professionals — no scraped junk.",
  },
  {
    icon: Briefcase,
    title: "Built for your niche",
    body: "Filters and categories that actually match how legal ops, compliance, KM, and legal tech careers work.",
  },
  {
    icon: ShieldCheck,
    title: "Honest signal",
    body: "Clear badges for JD Advantage and Non-Practicing Attorney roles so you know what you're applying to.",
  },
  {
    icon: Sparkles,
    title: "Weekly inbox",
    body: "A focused Monday digest with new openings — no daily noise, no generic alerts.",
  },
];

function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
      <header>
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">About</p>
        <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
          A job board built for the careers a JD actually leads to.
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
          JD Careers is the niche job board for non-practicing attorneys, legal operations leaders,
          compliance and risk professionals, knowledge managers, legal tech innovators, and law
          firm business professionals. We exist because these roles get buried on generic boards.
        </p>
      </header>

      <section className="mt-12 grid gap-4 sm:grid-cols-2">
        {pillars.map((p) => {
          const Icon = p.icon;
          return (
            <Card key={p.title}>
              <CardContent className="p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="mt-4 font-heading text-base font-semibold">{p.title}</h2>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <section className="mt-14">
        <h2 className="font-heading text-2xl font-bold">Who this is for</h2>
        <ul className="mt-4 grid gap-2 text-muted-foreground sm:grid-cols-2">
          <li>• JDs exploring careers outside private practice</li>
          <li>• Legal operations and pricing professionals</li>
          <li>• Compliance, risk, and conflicts teams</li>
          <li>• Knowledge management and innovation leaders</li>
          <li>• Legal technology and product roles</li>
          <li>• Marketing, BD, and client development at firms</li>
          <li>• Practice management and professional development</li>
          <li>• In-house counsel adjacent and ALSP roles</li>
        </ul>
      </section>

      <section className="mt-14 rounded-xl bg-muted/40 p-6 sm:p-8">
        <h2 className="font-heading text-xl font-semibold">A note on neutrality</h2>
        <p className="mt-2 leading-relaxed text-muted-foreground">
          JD Careers is independent and not affiliated with any law firm, ranking publication, or
          legal organization listed on this site. Job postings link directly to employer career
          sites; we never act as an intermediary.
        </p>
      </section>

      <div className="mt-12 flex flex-wrap gap-3">
        <Link to="/jobs" search={{} as any}>
          <Button>Browse open roles</Button>
        </Link>
        <Link to="/for-employers">
          <Button variant="outline">For employers</Button>
        </Link>
      </div>
    </div>
  );
}
