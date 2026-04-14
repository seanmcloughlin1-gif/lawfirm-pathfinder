import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — LawCareers150" },
      { name: "description", content: "Learn about LawCareers150, a free directory linking to career pages for the top 150 US law firms." },
      { property: "og:title", content: "About — LawCareers150" },
      { property: "og:description", content: "A free directory of career pages for the top 150 US law firms." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight">About LawCareers150</h1>
      <div className="mt-6 space-y-4 text-muted-foreground leading-relaxed">
        <p>
          <strong className="text-foreground">LawCareers150</strong> is a free resource that compiles
          career page links for the top 150 law firms in the United States, based on the widely
          recognized <em>Am Law 200</em> ranking published by <em>The American Lawyer</em>.
        </p>
        <p>
          Our goal is simple: make it easy for law students, lateral attorneys, and legal
          professionals to discover and access career opportunities at the nation's most
          prestigious firms — all in one place.
        </p>
        <h2 className="pt-4 text-xl font-semibold text-foreground">How We Rank</h2>
        <p>
          Firms are listed by their approximate position in the Am Law 200 ranking, which
          orders firms by gross revenue. Attorney counts and practice area information are
          approximate and sourced from publicly available data.
        </p>
        <h2 className="pt-4 text-xl font-semibold text-foreground">Disclaimer</h2>
        <p>
          This site is not affiliated with, endorsed by, or associated with <em>The American
          Lawyer</em>, ALM, or any of the listed law firms. All career page links point to
          the firms' own websites. We recommend verifying all information directly with the
          firm.
        </p>
      </div>
      <div className="mt-8">
        <Link to="/" className="text-sm font-medium text-primary hover:underline">
          ← Back to Directory
        </Link>
      </div>
    </div>
  );
}
