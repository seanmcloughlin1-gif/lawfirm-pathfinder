import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — JD Careers" },
      { name: "description", content: "Terms governing your use of JD Careers, the niche job board for non-practicing attorneys and legal business professionals." },
      { property: "og:title", content: "Terms of Service — JD Careers" },
      { property: "og:description", content: "Terms governing your use of JD Careers." },
      { property: "og:url", content: "https://jdcareers.app/terms" },
    ],
    links: [{ rel: "canonical", href: "https://jdcareers.app/terms" }],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="font-heading text-3xl font-bold">Terms of Service</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: April 15, 2026</p>
      <div className="mt-8 space-y-6 text-muted-foreground leading-relaxed">
        <p>By accessing and using JD Careers, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our platform.</p>
        <h2 className="font-heading text-xl font-semibold text-foreground">Use of Service</h2>
        <p>JD Careers provides a job listing platform for legal professionals. You may use our service to search for jobs, save listings, and submit applications. You agree to provide accurate information and use the platform in good faith.</p>
        <h2 className="font-heading text-xl font-semibold text-foreground">User Accounts</h2>
        <p>You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account. Notify us immediately of any unauthorized use.</p>
        <h2 className="font-heading text-xl font-semibold text-foreground">Employer Listings</h2>
        <p>Job listings are provided by employers and third-party sources. While we strive for accuracy, we do not guarantee the completeness or accuracy of any listing. We are not responsible for employment decisions made by employers.</p>
        <h2 className="font-heading text-xl font-semibold text-foreground">Limitation of Liability</h2>
        <p>JD Careers is provided "as is" without warranties of any kind. We shall not be liable for any damages arising from your use of the platform.</p>
        <h2 className="font-heading text-xl font-semibold text-foreground">Contact</h2>
        <p>For questions about these terms, email us at hello@jdcareers.com.</p>
      </div>
    </div>
  );
}
