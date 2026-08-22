import { Clock3, Mail, MapPin, ShieldAlert } from "lucide-react";
import { LegalPage } from "@/components/legal/LegalPage";

const contacts = [
  { label: "General, membership & billing", email: "hello@mindcast.co.nz", note: "Replies within 2 business days" },
  { label: "Safeguarding concerns", email: "safeguarding@mindcast.co.nz", note: "Replies within 24 hours", urgent: true },
  { label: "Privacy requests", email: "privacy@mindcast.co.nz", note: "Replies within 20 working days" },
  { label: "Press & partnerships", email: "press@mindcast.co.nz", note: "Tell us a little about your enquiry" },
];

export default function ContactPage() {
  return (
    <LegalPage title="How can we help?" lastUpdated="August 2026" eyebrow="Get in touch">
      <p className="lead">
        We’re a small team in Taupō. Email is the best way to reach us — every message is read by a person.
      </p>

      <div className="not-prose my-9 grid gap-3">
        {contacts.map((contact) => (
          <a
            key={contact.label}
            href={`mailto:${contact.email}`}
            className={`group flex items-start gap-4 rounded-2xl border p-5 transition focus:outline-none focus:ring-4 focus:ring-primary/10 sm:p-6 ${
              contact.urgent ? "border-destructive/15 bg-destructive/[0.03] hover:border-destructive/30" : "border-foreground/[0.08] bg-ivory/60 hover:border-primary/25 hover:bg-primary/[0.03]"
            }`}
          >
            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${contact.urgent ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"}`}>
              {contact.urgent ? <ShieldAlert className="h-4 w-4" aria-hidden="true" /> : <Mail className="h-4 w-4" aria-hidden="true" />}
            </span>
            <span className="min-w-0">
              <span className="block font-body text-sm font-semibold text-foreground">{contact.label}</span>
              <span className="mt-1 block break-all font-body text-sm text-primary underline decoration-primary/25 underline-offset-4">{contact.email}</span>
              <span className="mt-2 flex items-center gap-1.5 font-body text-xs text-muted-foreground"><Clock3 className="h-3.5 w-3.5" aria-hidden="true" /> {contact.note}</span>
            </span>
          </a>
        ))}
      </div>

      <div className="not-prose my-9 rounded-2xl border border-destructive/15 bg-destructive/[0.04] p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-destructive" aria-hidden="true" />
          <div>
            <h2 className="font-body text-sm font-semibold text-foreground">Is someone in immediate danger?</h2>
            <p className="mt-2 font-body text-sm leading-6 text-muted-foreground">Call New Zealand emergency services on <a href="tel:111" className="font-semibold text-foreground underline underline-offset-4">111</a>. Email is not monitored continuously.</p>
          </div>
        </div>
      </div>

      <h2>Where we gather</h2>
      <div className="not-prose my-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-foreground/[0.08] bg-ivory/50 p-5">
          <MapPin className="h-5 w-5 text-primary" aria-hidden="true" />
          <h3 className="mt-4 font-body text-sm font-semibold text-foreground">Sunday sessions</h3>
          <address className="mt-2 not-italic font-body text-sm leading-6 text-muted-foreground">Great Lake Centre<br />5 Story Place<br />Taupō 3330</address>
        </div>
        <div className="rounded-2xl border border-foreground/[0.08] bg-ivory/50 p-5">
          <Mail className="h-5 w-5 text-primary" aria-hidden="true" />
          <h3 className="mt-4 font-body text-sm font-semibold text-foreground">Postal address</h3>
          <address className="mt-2 not-italic font-body text-sm leading-6 text-muted-foreground">Mindcast Limited<br />PO Box 1234<br />Taupō 3351<br />New Zealand</address>
        </div>
      </div>

      <h2>Before you email</h2>
      <ul>
        <li>For membership questions, check the <a href="/membership">Membership page</a>.</li>
        <li>For refunds or cancellations, read the <a href="/refund">Refund & Cancellation Policy</a>.</li>
        <li>For a technical issue, include your device, browser and a screenshot if possible.</li>
      </ul>
    </LegalPage>
  );
}
