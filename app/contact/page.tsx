import type { Metadata } from "next";
import { ExternalLink, MessageSquareWarning } from "lucide-react";
import { PublicSiteShell } from "@/components/public-site-shell";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return <PublicSiteShell><section className="public-contact">
    <div><MessageSquareWarning aria-hidden="true" size={34}/><h1>Talk to the GarageBook beta team.</h1><p>Report a bug, request account deletion, or tell us where the experience was confusing. Do not include passwords, API keys, full VINs, or sensitive receipt details in a public report.</p></div>
    <article><h2>Submit a beta report</h2><p>GarageBook currently tracks beta feedback through its public GitHub issue board. Describe what you expected, what happened, and which page you were using.</p><a className="btn btn-primary" href="https://github.com/marcojaydomingo-del/GarrageBook/issues/new" rel="noreferrer" target="_blank">Open issue form <ExternalLink size={15}/></a><small>If your report contains private vehicle information, contact the person who invited you to the beta instead of posting it publicly.</small></article>
  </section></PublicSiteShell>;
}
