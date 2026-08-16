import Link from "next/link";
import {
  ArrowRight,
  Check,
  FileCheck2,
  FileText,
  MapPin,
  Stethoscope,
  Wrench,
} from "lucide-react";
import { Brand } from "@/components/brand";
import { RecoveryRedirect } from "@/components/recovery-redirect";
import { ThemeToggle } from "@/components/theme-toggle";

const journey = [
  { label: "Symptom", icon: Stethoscope },
  { label: "Shop", icon: MapPin },
  { label: "Repair", icon: Wrench },
  { label: "Invoice", icon: FileText },
  { label: "History", icon: FileCheck2 },
];

export default function Home() {
  return (
    <main className="home-page">
      <RecoveryRedirect />
      <header className="home-header">
        <div className="home-header-inner">
          <Brand />
          <nav className="home-account-nav" aria-label="Account">
            <ThemeToggle />
            <Link className="home-login" href="/login">Log in</Link>
            <Link className="home-create-account" href="/signup">Create account</Link>
          </nav>
        </div>
      </header>

      <section className="home-hero" aria-labelledby="home-title">
        <div className="home-pitch">
          <h1 id="home-title">Every repair.<br />One clear record.</h1>
          <p className="home-intro">Keep symptoms, shop visits, estimates, repairs, receipts, and warranties connected in one trustworthy vehicle history.</p>
          <div className="home-actions">
            <Link className="home-primary-action" href="/signup">Start your garage <ArrowRight size={18} /></Link>
            <Link className="home-secondary-action" href="/dashboard">Explore the dashboard</Link>
          </div>
          <ul className="home-assurances" aria-label="GarageBook benefits">
            <li><Check size={15} /> Free to start</li>
            <li><Check size={15} /> Private by default</li>
            <li><Check size={15} /> Built for real ownership</li>
          </ul>
        </div>

        <div className="home-record" aria-label="Example vehicle record">
          <div className="home-record-photo" role="img" aria-label="Graphite MINI Cooper S Paceman parked inside an independent service garage">
            <div className="home-record-heading">
              <div>
                <p>In your garage</p>
                <h2>2014 MINI Cooper S Paceman</h2>
              </div>
              <span><FileCheck2 size={13} /> Sample record</span>
            </div>
          </div>
          <div className="home-record-ledger">
            <div className="home-mileage-panel">
              <div>
                <p>Current mileage</p>
                <strong>121,450 <small>mi</small></strong>
              </div>
              <div className="home-health-score" aria-label="Vehicle history organized"><Check size={24} /></div>
            </div>
            <dl className="home-record-facts">
              <div>
                <dt><Wrench size={17} /> Latest repair</dt>
                <dd>Oil-pan gasket replacement</dd>
              </div>
              <div>
                <dt><FileText size={17} /> Evidence stored</dt>
                <dd>12 documents</dd>
              </div>
            </dl>
            <div className="home-journey">
              <p>One connected repair journey</p>
              <ol>
                {journey.map(({ label, icon: Icon }, index) => (
                  <li key={label}>
                    <span><Icon size={15} /></span>
                    <small>{label}</small>
                    {index < journey.length - 1 ? <i aria-hidden="true" /> : null}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      <section className="home-proof" aria-label="What GarageBook keeps together">
        <div>
          <h2>The context behind the work stays with the record.</h2>
        </div>
        <p>When a warning appears months later, you can see what you noticed, where you went, what was approved, what was repaired, and the documents that prove it.</p>
        <Link href="/signup">Build your vehicle history <ArrowRight size={17} /></Link>
      </section>
    </main>
  );
}
