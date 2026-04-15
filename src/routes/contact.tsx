import { createFileRoute } from "@tanstack/react-router";
import { Mail, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — JD Careers" },
      { name: "description", content: "Get in touch with the JD Careers team for job posting inquiries, partnerships, or general questions." },
      { property: "og:title", content: "Contact JD Careers" },
      { property: "og:description", content: "Reach out about job postings, partnerships, or questions." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="font-heading text-3xl font-bold sm:text-4xl">Contact Us</h1>
      <p className="mt-2 text-muted-foreground">Have a question, want to post a job, or interested in a partnership? We'd love to hear from you.</p>

      <div className="mt-8 grid gap-8 sm:grid-cols-2">
        <Card>
          <CardContent className="flex items-start gap-4 p-5">
            <Mail className="mt-0.5 h-5 w-5 text-primary" />
            <div>
              <p className="font-semibold">Email Us</p>
              <a href="mailto:hello@jdcareers.com" className="text-sm text-primary hover:underline">hello@jdcareers.com</a>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-start gap-4 p-5">
            <MapPin className="mt-0.5 h-5 w-5 text-primary" />
            <div>
              <p className="font-semibold">Location</p>
              <p className="text-sm text-muted-foreground">New York, NY</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <form className="mt-8 space-y-4" onSubmit={(e) => e.preventDefault()}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="name">Name</Label>
            <Input id="name" placeholder="Your name" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@example.com" />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="subject">Subject</Label>
          <Input id="subject" placeholder="How can we help?" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="message">Message</Label>
          <Textarea id="message" placeholder="Tell us more…" rows={5} />
        </div>
        <Button type="submit">Send Message</Button>
      </form>
    </div>
  );
}
