import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Target, Users, BarChart3, MailCheck, ArrowRight,
  Check, Star, Megaphone, Mail, Sparkles,
} from "lucide-react";
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

type Tier = {
  name: string;
  price: string;
  period: string;
  tagline: string;
  features: string[];
  cta: string;
  highlight?: boolean;
  icon: typeof Star;
};

const tiers: Tier[] = [
  {
    name: "Standard Post",
    price: "$199",
    period: "per role · 30 days",
    tagline: "Get your role in front of a curated legal-business audience.",
    icon: Megaphone,
    features: [
      "30-day listing on JD Careers",
      "Placement in relevant category",
      "JD Advantage / NPA badges if applicable",
      "Direct apply link to your careers site",
      "Indexed for SEO and search filters",
    ],
    cta: "Get notified",
  },
  {
    name: "Featured Post",
    price: "$399",
    period: "per role · 30 days",
    tagline: "Top-of-page placement plus inclusion in the weekly digest.",
    icon: Star,
    highlight: true,
    features: [
      "Everything in Standard Post",
      "Featured badge on listings page",
      "Priority placement above standard posts",
      "Included in our Monday email digest",
      "Social mention on launch",
    ],
    cta: "Get notified",
  },
  {
    name: "Employer Spotlight",
    price: "$1,499",
    period: "per month",
    tagline: "Be the employer of the month for JD-advantage talent.",
    icon: Sparkles,
    features: [
      "Up to 5 featured posts included",
      "Spotlight card on the homepage",
      "Custom employer profile section",
      "Top placement in employer directory",
      "Co-branded newsletter feature",
    ],
    cta: "Talk to us",
  },
];

const addOns = [
  {
    icon: Mail,
    name: "Newsletter Sponsorship",
    price: "$799",
    unit: "per send",
    body: "Dedicated section in our weekly Monday digest reaching subscribed JD-advantage candidates. Includes logo, blurb, and a CTA to your careers site or specific role.",
  },
  {
    icon: Megaphone,
    name: "Custom Recruiting Campaigns",
    price: "Custom",
    unit: "scoped per engagement",
    body: "Multi-week campaigns combining featured posts, newsletter placements, and homepage spotlight for high-volume hiring or new market launches.",
  },
];

function ForEmployersPage() {
  return (
    <div>
      {/* Hero */}
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
            <a href="#pricing">
              <Button size="lg">See pricing</Button>
            </a>
            <Link to="/contact">
              <Button size="lg" variant="outline">Talk to our team</Button>
            </Link>
          </div>
          <p className="mt-4 text-xs text-hero-muted">
            Launching soon — join the waitlist and lock in introductory pricing.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        {/* Benefits */}
        <section>
          <h2 className="font-heading text-2xl font-bold">Why post with us</h2>
          <p className="mt-1 text-muted-foreground">Built for the niche, not the world.</p>
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

        {/* Pricing */}
        <section id="pricing" className="mt-20 scroll-mt-24">
          <div className="text-center">
            <Badge variant="secondary" className="mb-3">Coming soon</Badge>
            <h2 className="font-heading text-3xl font-bold sm:text-4xl">Simple, transparent pricing</h2>
            <p className="mx-auto mt-2 max-w-2xl text-muted-foreground">
              Pay per role or invest in long-term visibility. All prices are introductory and
              subject to change at launch — early partners lock in these rates.
            </p>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {tiers.map((tier) => {
              const Icon = tier.icon;
              return (
                <Card
                  key={tier.name}
                  className={
                    tier.highlight
                      ? "relative border-primary shadow-lg shadow-primary/10 lg:scale-[1.02]"
                      : "relative"
                  }
                >
                  {tier.highlight && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="border-0 bg-primary text-primary-foreground shadow">
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  <CardContent className="flex h-full flex-col p-6">
                    <div className="flex items-center gap-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Icon className="h-4 w-4" />
                      </div>
                      <h3 className="font-heading text-lg font-semibold">{tier.name}</h3>
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground">{tier.tagline}</p>
                    <div className="mt-5">
                      <span className="font-heading text-4xl font-bold">{tier.price}</span>
                      <span className="ml-2 text-sm text-muted-foreground">{tier.period}</span>
                    </div>
                    <ul className="mt-6 flex-1 space-y-3">
                      {tier.features.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-sm">
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                    <Link to="/contact" className="mt-8 block">
                      <Button
                        className="w-full"
                        variant={tier.highlight ? "default" : "outline"}
                      >
                        {tier.cta}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Payments aren't live yet. Contact us to reserve a slot or join the launch waitlist.
          </p>
        </section>

        {/* Add-ons */}
        <section className="mt-20">
          <div className="text-center">
            <h2 className="font-heading text-2xl font-bold sm:text-3xl">Newsletter & custom add-ons</h2>
            <p className="mx-auto mt-2 max-w-2xl text-muted-foreground">
              Beyond job posts — sponsor our weekly digest or build a custom campaign.
            </p>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {addOns.map((a) => {
              const Icon = a.icon;
              return (
                <Card key={a.name}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <Icon className="h-5 w-5" />
                        </div>
                        <h3 className="font-heading text-base font-semibold">{a.name}</h3>
                      </div>
                      <div className="text-right">
                        <p className="font-heading text-xl font-bold">{a.price}</p>
                        <p className="text-xs text-muted-foreground">{a.unit}</p>
                      </div>
                    </div>
                    <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{a.body}</p>
                    <Link to="/contact">
                      <Button variant="outline" size="sm" className="mt-4">
                        Inquire
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Audience */}
        <section className="mt-20">
          <h2 className="font-heading text-2xl font-bold">Who you'll reach</h2>
          <p className="mt-1 text-muted-foreground">Candidates across the legal-business career landscape.</p>
          <ul className="mt-6 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
            {audience.map((a) => (
              <li key={a} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                {a}
              </li>
            ))}
          </ul>
        </section>

        {/* How it works */}
        <section className="mt-20">
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

        {/* FAQ */}
        <section className="mt-20">
          <h2 className="font-heading text-2xl font-bold">Frequently asked</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {[
              {
                q: "When does paid posting launch?",
                a: "We're onboarding launch partners now. Contact us to reserve a slot and lock in introductory pricing.",
              },
              {
                q: "Can I post unlimited roles?",
                a: "Employer Spotlight includes up to 5 featured posts per month. Higher volumes are available via custom campaigns.",
              },
              {
                q: "Do you take a cut of placements?",
                a: "No. JD Careers is a job board, not a recruiter. You pay for visibility — applicants apply directly to your careers site.",
              },
              {
                q: "Can I cancel or refund?",
                a: "Listings are pro-rated for unused days within the first 7 days. Newsletter sponsorships are refundable until 48 hours before send.",
              },
            ].map((f) => (
              <Card key={f.q}>
                <CardContent className="p-5">
                  <p className="font-heading text-sm font-semibold">{f.q}</p>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="mt-20 rounded-xl bg-hero-bg p-8 text-center sm:p-12">
          <h2 className="font-heading text-2xl font-bold text-hero-foreground sm:text-3xl">
            Ready to reach JD-advantage talent?
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-hero-muted">
            Tell us about your opening and we'll get back within one business day with next steps.
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
