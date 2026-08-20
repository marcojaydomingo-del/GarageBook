import type { Metadata } from "next";
import Link from "next/link";
import { PublicDocument } from "@/components/public-site-shell";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return <PublicDocument title="Privacy Policy" intro="This beta policy explains what OTTOKO stores, why it is needed, and the choices available to you.">
    <section><h2>Information you provide</h2><p>OTTOKO stores account information such as your email address, along with the vehicle details, mileage, symptoms, maintenance records, repair cases, shop notes, reminders, photos, receipts, invoices, and other documents you choose to add.</p></section>
    <section><h2>How information is used</h2><p>Your information is used to authenticate your account, operate your private garage, connect related repair records, display your vehicle history, and improve the beta experience. OTTOKO does not sell your personal information.</p></section>
    <section><h2>Storage and service providers</h2><p>Authentication, database records, and uploaded files are hosted with Supabase. Hosting and application delivery are provided through Netlify. Shop discovery may send a location or search query to Google Maps Platform when you use that feature. Those providers process information under their own terms and privacy policies.</p></section>
    <section><h2>Ownership and access</h2><p>Your records are private by default. Database ownership rules restrict user-owned records to the authenticated owner. Do not upload documents containing information you do not have permission to store.</p></section>
    <section><h2>Retention and deletion</h2><p>Beta records remain stored until you delete individual records or request account deletion. Some backups and operational logs may persist for a limited period after deletion. Use the <Link href="/contact">contact page</Link> to request account deletion during the beta.</p></section>
    <section><h2>Security and beta limitations</h2><p>OTTOKO uses access controls and private storage paths designed for authenticated owners. No online service can guarantee absolute security. Keep your password private and report suspected unauthorized access promptly.</p></section>
    <section><h2>Children</h2><p>OTTOKO is not directed to children under 13 and should not be used to create accounts for them.</p></section>
    <section><h2>Changes</h2><p>This policy may change as the beta develops. Material changes will be reflected on this page with a revised effective date.</p></section>
  </PublicDocument>;
}
