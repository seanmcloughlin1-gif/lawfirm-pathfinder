import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Search, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { JobCard } from "@/components/JobCard";
import { EmployerCard } from "@/components/EmployerCard";
import { NewsletterSignup } from "@/components/NewsletterSignup";
import { categories } from "@/data/categories";
import { featuredJobs, recentJobs } from "@/data/jobs";
import { featuredEmployers } from "@/data/employers";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "JD Careers — Non-Practicing Attorney & Legal Professional Jobs" },
      { name: "description", content: "The niche job board for JD-advantage roles, legal operations, compliance, legal tech, and law firm business professional positions." },
      { property: "og:title", content: "JD Careers — Non-Practicing Attorney & Legal Professional Jobs" },
      { property: "og:description", content: "Find JD-advantage roles, legal ops, compliance, legal tech, and law firm business professional jobs." },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div>
      {/* Hero */}
      <section className="bg-hero-bg px-4 py-20 text-center sm:py-28">
        <div className="mx-auto max-w-3xl">
          <Badge className="mb-4 border-0 bg-primary/20 text-primary-foreground/80 text-xs">For JD-Advantage & Legal Business Professionals</Badge>
          <h1 className="font-heading text-4xl font-bold tracking-tight text-hero-foreground sm:text-5xl lg:text-6xl">
            Your law degree opens more doors than you think
          </h1>
          <p className="mt-4 text-lg text-hero-muted sm:text-xl">
            Curated roles for non-practicing attorneys, legal operations leaders, compliance professionals, knowledge managers, and legal tech innovators.
          </p>
          <form
            className="mx-auto mt-8 flex max-w-xl gap-2"
            onSubmit={(e) => {
              e.preventDefault();
            }}
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Job title, keyword, or employer…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-11 bg-background pl-10"
              />
            </div>
            <Link to="/jobs" search={{ q: searchQuery || undefined } as any}>
              <Button size="lg" className="h-11">Search Jobs</Button>
            </Link>
          </form>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Categories */}
        <section className="py-16">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-heading text-2xl font-bold">Browse by Category</h2>
              <p className="mt-1 text-sm text-muted-foreground">Find roles aligned with your expertise</p>
            </div>
            <Link to="/jobs" search={{} as any} className="hidden items-center gap-1 text-sm font-medium text-primary hover:underline sm:flex">
              All categories <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link key={cat.id} to="/jobs" search={{ category: cat.id } as any}>
                  <Card className="group cursor-pointer transition-all hover:border-primary/30 hover:shadow-md">
                    <CardContent className="flex items-center gap-4 p-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold">{cat.name}</p>
                        <p className="text-xs text-muted-foreground">{cat.jobCount} positions</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Featured Jobs */}
        <section className="pb-16">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-heading text-2xl font-bold">Featured Jobs</h2>
              <p className="mt-1 text-sm text-muted-foreground">Hand-picked opportunities from top employers</p>
            </div>
            <Link to="/jobs" search={{} as any} className="hidden items-center gap-1 text-sm font-medium text-primary hover:underline sm:flex">
              View all jobs <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featuredJobs.slice(0, 6).map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        </section>

        {/* Featured Employers */}
        <section className="pb-16">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-heading text-2xl font-bold">Featured Employers</h2>
              <p className="mt-1 text-sm text-muted-foreground">Leading organizations hiring legal professionals</p>
            </div>
            <Link to="/employers" className="hidden items-center gap-1 text-sm font-medium text-primary hover:underline sm:flex">
              View all employers <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featuredEmployers.slice(0, 6).map((emp) => (
              <EmployerCard key={emp.id} employer={emp} />
            ))}
          </div>
        </section>

        {/* Recent Jobs */}
        <section className="pb-16">
          <h2 className="font-heading text-2xl font-bold">Recently Posted</h2>
          <p className="mt-1 text-sm text-muted-foreground">The latest openings across our network</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recentJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        </section>

        {/* Newsletter */}
        <section className="pb-16">
          <NewsletterSignup />
        </section>

        {/* Employer CTA */}
        <section className="pb-16">
          <div className="rounded-xl bg-hero-bg p-8 text-center sm:p-12">
            <h2 className="font-heading text-2xl font-bold text-hero-foreground sm:text-3xl">Hiring Legal Professionals?</h2>
            <p className="mx-auto mt-2 max-w-lg text-hero-muted">Reach thousands of JD-holders and legal business professionals. Post your roles on the board built for your niche.</p>
            <Link to="/contact">
              <Button size="lg" className="mt-6">Contact Us to Post Jobs</Button>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
