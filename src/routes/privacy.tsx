import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — JD Careers" },
      { name: "description", content: "How JD Careers collects, uses, and protects your information when you use our niche legal job board." },
      { property: "og:title", content: "Privacy Policy — JD Careers" },
      { property: "og:description", content: "How JD Careers handles your information." },
      { property: "og:url", content: "https://jdcareers.app/privacy" },
    ],
    links: [{ rel: "canonical", href: "https://jdcareers.app/privacy" }],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="font-heading text-3xl font-bold">Privacy Policy</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: April 15, 2026</p>
      <div className="mt-8 space-y-6 text-muted-foreground leading-relaxed">
        <p>JD Careers ("we", "our", "us") is committed to protecting your privacy. This policy explains how we collect, use, and safeguard your information when you use our website.</p>
        <h2 className="font-heading text-xl font-semibold text-foreground">Information We Collect</h2>
        <p>We may collect personal information you provide directly, such as your name, email address, and resume when you create an account or apply for jobs. We also collect usage data through cookies and analytics.</p>
        <h2 className="font-heading text-xl font-semibold text-foreground">How We Use Your Information</h2>
        <p>We use your information to provide and improve our services, send job alerts you've subscribed to, and communicate with you about your account. We do not sell your personal information to third parties.</p>
        <h2 className="font-heading text-xl font-semibold text-foreground">Data Security</h2>
        <p>We implement appropriate security measures to protect your personal information. However, no method of transmission over the internet is 100% secure.</p>
        <h2 className="font-heading text-xl font-semibold text-foreground">Contact Us</h2>
        <p>If you have questions about this privacy policy, please contact us at hello@jdcareers.com.</p>
      </div>
    </div>
  );
}
