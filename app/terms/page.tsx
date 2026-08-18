import type { Metadata } from "next";
import Link from "next/link";
import { PublicDocument } from "@/components/public-site-shell";

export const metadata: Metadata = { title: "Beta Terms" };

export default function TermsPage() {
  return <PublicDocument title="Beta Terms" intro="These terms cover use of the GarageBook beta while the product is still being tested and refined.">
    <section><h2>Beta service</h2><p>GarageBook is an early-stage record-keeping service. Features may change, experience interruptions, or contain errors. The beta is currently provided without charge and without a promise that every planned capability will be released.</p></section>
    <section><h2>Your account and records</h2><p>You are responsible for your account credentials and for the accuracy and legality of information you upload. You retain ownership of your content and grant GarageBook the limited permission needed to store, process, and display it back to you.</p></section>
    <section><h2>Not mechanical, legal, or warranty advice</h2><p>GarageBook organizes information you and repair providers document. Status labels reflect recorded reminders, symptoms, and repair cases—not an inspection or diagnosis. Always consult a qualified professional for safety-critical vehicle decisions.</p></section>
    <section><h2>Acceptable use</h2><p>Do not misuse the service, attempt to access another user’s records, upload malicious material, interfere with the service, or store content that violates another person’s rights.</p></section>
    <section><h2>Availability and data protection</h2><p>You should keep copies of important original documents. GarageBook will work to preserve beta data, but the service is provided as available and may be modified or discontinued.</p></section>
    <section><h2>Feedback</h2><p>You may provide suggestions and bug reports voluntarily. GarageBook may use that feedback to improve the product without an obligation to compensate you.</p></section>
    <section><h2>Changes and questions</h2><p>These terms may be revised as GarageBook approaches release. Questions can be submitted through the <Link href="/contact">contact page</Link>.</p></section>
  </PublicDocument>;
}
