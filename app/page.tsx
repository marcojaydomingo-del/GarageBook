import Link from "next/link";
import {
  ArrowRight,
  BellRing,
  Check,
  FileCheck2,
  FileText,
  FolderLock,
  Gauge,
  History,
  MapPin,
  ReceiptText,
  ScanLine,
  ShieldCheck,
  Sparkles,
  Wrench,
} from "lucide-react";
import { Brand } from "@/components/brand";
import { LandingDashboardPreview } from "@/components/landing-dashboard-preview";
import { RecoveryRedirect } from "@/components/recovery-redirect";
import { ThemeToggle } from "@/components/theme-toggle";
import { pricing } from "@/lib/pricing";

const garageFeatures = [
  "Vehicle profile and photo gallery",
  "Mileage and maintenance status",
  "Reminders, costs, and documents",
];

const currentFeatures = [
  "Vehicle profiles and photo galleries",
  "Maintenance, repair, and symptom records",
  "Reminders, documents, estimates, and shops",
  "One chronological vehicle history",
];

export default function Home() {
  return (
    <main className="landing-page">
      <RecoveryRedirect />
      <header className="landing-header">
        <div className="landing-nav-shell">
          <Brand />
          <nav className="landing-links" aria-label="Main navigation">
            <a href="#features">Features</a>
            <a href="#how-it-works">How it works</a>
            <a href="#pricing">Pricing</a>
          </nav>
          <nav className="landing-account" aria-label="Account navigation">
            <ThemeToggle />
            <Link href="/login">Log in</Link>
            <Link className="landing-nav-cta" href="/signup">Get GarageBook free</Link>
          </nav>
        </div>
      </header>

      <section className="landing-hero" aria-labelledby="landing-title">
        <div className="landing-hero-inner">
          <div className="landing-hero-card">
            <h1 id="landing-title">Everything about your car. One garage.</h1>
            <p>Maintenance, repairs, symptoms, receipts, reminders, and vehicle history—kept together from the first warning to the final invoice.</p>
            <div className="landing-hero-actions">
              <Link className="landing-button landing-button-dark" href="/signup">Get GarageBook free <ArrowRight size={17} /></Link>
              <a className="landing-button landing-button-ghost" href="#how-it-works">See how it works <ArrowRight size={17} /></a>
            </div>
            <ul className="landing-hero-assurances">
              <li><Check size={14} /> Your data, always yours</li>
              <li><Check size={14} /> Works on all your devices</li>
              <li><Check size={14} /> Free to start</li>
            </ul>
          </div>
          <div className="landing-device-stage"><LandingDashboardPreview /></div>
        </div>
      </section>

      <section className="landing-ledger" id="features">
        <div className="landing-section-copy">
          <h2>Your entire garage, organized.</h2>
          <p>Every vehicle gets a durable digital home—complete with its photos, current mileage, upcoming service, costs, records, and documents.</p>
          <ul>{garageFeatures.map((feature) => <li key={feature}><Check size={16} />{feature}</li>)}</ul>
          <Link href="/signup">Add your first vehicle <ArrowRight size={16} /></Link>
        </div>
        <div className="landing-garage-board" aria-label="Example GarageBook vehicle record">
          <div className="landing-garage-photo"><span>2014</span><strong>MINI Cooper S Paceman</strong><small>121,450 miles</small></div>
          <div className="landing-garage-stats">
            <div><Check size={16} /><span>Maintenance status</span><strong>Up to date</strong></div>
            <div><BellRing size={16} /><span>Next service</span><strong>Oil change</strong></div>
            <div><FileText size={16} /><span>Documents</span><strong>12 stored</strong></div>
          </div>
        </div>
      </section>

      <section className="landing-journey-section" id="how-it-works">
        <div className="landing-journey-heading">
          <h2>The whole repair journey stays connected.</h2>
          <p>GarageBook preserves what happened before, during, and after a repair—so the context never disappears into a folder of receipts.</p>
        </div>
        <ol className="landing-journey-flow">
          <JourneyStep icon={Gauge} label="Symptom" detail="Record what you notice" />
          <JourneyStep icon={MapPin} label="Shop" detail="Keep the visit attached" />
          <JourneyStep icon={FileCheck2} label="Estimate" detail="Approve a clear scope" />
          <JourneyStep icon={Wrench} label="Repair" detail="Document completed work" />
          <JourneyStep icon={ReceiptText} label="Invoice" detail="Store proof and warranty" />
          <JourneyStep icon={History} label="History" detail="Build the lasting record" />
        </ol>
      </section>

      <section className="landing-feature-split">
        <div className="landing-feature-dark">
          <div className="landing-feature-icon"><BellRing size={24} /></div>
          <h2>Never forget another service.</h2>
          <p>Create time- or mileage-based reminders for maintenance, registration, insurance, inspections, and anything else your vehicle needs.</p>
          <div className="landing-reminder-list">
            <div><span>Oil change</span><strong>Due in 1,550 mi</strong></div>
            <div><span>Registration renewal</span><strong>Sep 18, 2026</strong></div>
            <div><span>Tire rotation</span><strong>Scheduled</strong></div>
          </div>
        </div>
        <div className="landing-feature-paper">
          <div className="landing-feature-icon"><FolderLock size={24} /></div>
          <h2>Your digital glovebox.</h2>
          <p>Keep private receipts, invoices, warranties, and photos with the vehicle they belong to. Your records remain private by default.</p>
          <ul className="landing-file-list">
            <li><FileText size={17} /><span>Oil-pan repair invoice.pdf</span><small>Invoice</small></li>
            <li><ShieldCheck size={17} /><span>Parts warranty.pdf</span><small>Warranty</small></li>
            <li><ReceiptText size={17} /><span>Coolant diagnosis.pdf</span><small>Receipt</small></li>
          </ul>
        </div>
      </section>

      <section className="landing-future">
        <div>
          <span className="landing-planned"><Sparkles size={14} /> Planned</span>
          <h2>Less typing. More useful context.</h2>
          <p>GarageBook is preparing receipt extraction, maintenance forecasting, and contextual vehicle assistance. These tools will organize evidence and suggest next steps—not replace a professional mechanic.</p>
        </div>
        <div className="landing-future-flow">
          <div><ScanLine size={24} /><strong>Snap a receipt</strong><span>Upload the shop document</span></div>
          <ArrowRight size={20} />
          <div><Sparkles size={24} /><strong>Review extracted details</strong><span>Confirm before saving</span></div>
          <ArrowRight size={20} />
          <div><FileCheck2 size={24} /><strong>Add to vehicle</strong><span>Preserve it in history</span></div>
        </div>
      </section>

      <section className="landing-trust">
        <div className="landing-trust-copy">
          <h2>A history you can actually trust.</h2>
          <p>GarageBook is being designed to preserve finalized records, corrections, document evidence, and where each entry came from—without silently rewriting the past.</p>
        </div>
        <div className="landing-trust-record">
          <div><ShieldCheck size={22} /><span>Receipt documented</span><strong>Oil-filter-housing gasket replacement</strong></div>
          <dl>
            <div><dt>Date</dt><dd>June 14, 2026</dd></div>
            <div><dt>Mileage</dt><dd>120,804 mi</dd></div>
            <div><dt>Shop</dt><dd>Bavarian Auto Works</dd></div>
          </dl>
          <span className="landing-planned">Historical locking planned</span>
        </div>
      </section>

      <section className="landing-pricing" id="pricing">
        <div className="landing-pricing-heading">
          <h2>Start with a garage that is genuinely useful.</h2>
          <p>Core ownership records stay available on the free plan. Plus is the planned home for expanded storage and advanced tools.</p>
        </div>
        <div className="landing-price-grid">
          <article>
            <h3>{pricing.free.name}</h3><strong>{pricing.free.price}</strong><p>{pricing.free.description}</p>
            <ul>{currentFeatures.map((feature) => <li key={feature}><Check size={15} />{feature}</li>)}</ul>
            <Link className="landing-button landing-button-dark" href="/signup">Start free <ArrowRight size={17} /></Link>
          </article>
          <article className="landing-price-plus">
            <span className="landing-planned">Planned</span>
            <h3>{pricing.plus.name}</h3><strong>{pricing.plus.price}<small>{pricing.plus.cadence}</small></strong><p>{pricing.plus.description}</p>
            <ul><li><Check size={15} />Unlimited vehicles</li><li><Check size={15} />Expanded document storage</li><li><Check size={15} />Advanced tools as they launch</li><li><Check size={15} />Family and history-report features</li></ul>
            <span className="landing-price-note">Not yet available for purchase</span>
          </article>
        </div>
      </section>

      <section className="landing-final-cta">
        <div><h2>Your car already has a story.</h2><p>Give every repair, receipt, and reminder one place to belong.</p></div>
        <Link className="landing-button landing-button-dark" href="/signup">Get GarageBook free <ArrowRight size={17} /></Link>
      </section>

      <footer className="landing-footer">
        <Brand /><p>Private vehicle ownership records, organized around the whole repair journey.</p>
        <div><Link href="/login">Log in</Link><Link href="/signup">Create account</Link></div>
      </footer>
    </main>
  );
}

function JourneyStep({ icon: Icon, label, detail }: { icon: React.ComponentType<{ size?: number }>; label: string; detail: string }) {
  return <li><span><Icon size={18} /></span><strong>{label}</strong><small>{detail}</small></li>;
}
