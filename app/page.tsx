import Link from "next/link";
import {
  ArrowRight,
  Bot,
  Check,
  CirclePlus,
  FileCheck2,
  FileText,
  FolderLock,
  History,
  ImageIcon,
  LockKeyhole,
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

const comparisonFeatures = [
  "Vehicle profiles",
  "Maintenance & repair history",
  "Reminders & notifications",
  "Document storage",
  "Shops & contacts",
  "Mobile & desktop access",
  "Export your data",
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
            <a href="#compare">Compare</a>
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
            <span className="landing-hero-flag" aria-label="GarageBook">
              <span><b>Garage</b></span><span><b>Book</b></span>
            </span>
            <h1 id="landing-title">Everything about <span>your car.<br />One garage.</span></h1>
            <p>Maintenance, repairs, symptoms, receipts, and history—together.</p>
            <div className="landing-hero-actions">
              <Link className="landing-button landing-button-dark" href="/signup">Get GarageBook free <ArrowRight size={17} /></Link>
              <a className="landing-button landing-button-ghost" href="#how-it-works">See how it works <ArrowRight size={17} /></a>
            </div>
          </div>
        </div>
      </section>

      <div className="landing-editorial" id="features">
        <section className="landing-white-section landing-garage-section">
          <SectionIntro number="1" title="Your entire garage, organized." description="Add every vehicle you own. Switch between profiles to see everything in one place." />
          <div className="landing-vehicle-comparison">
            <VehicleCard className="landing-vehicle-paceman" year="2014" name="MINI Cooper S Paceman" mileage="121,450 mi" />
            <VehicleCard className="landing-vehicle-gt3" year="2023" name="Porsche 911 GT3 RS" mileage="8,420 mi" />
            <Link className="landing-add-vehicle" href="/vehicles/new"><CirclePlus size={26} /><span>Add vehicle</span></Link>
          </div>
        </section>

        <section className="landing-white-section landing-service-section" id="how-it-works">
          <SectionIntro number="2" title="Never forget another service." description="Keep up with maintenance and upcoming tasks so your car stays in top shape." />
          <div className="landing-service-list">
            <ServiceLine tone="complete" title="Oil change" detail="118,650 mi · Feb 10, 2026" status="Completed" />
            <ServiceLine tone="due" title="Brake fluid flush" detail="Recommended every 2 years" status="Due in 30 days" />
            <ServiceLine tone="future" title="Spark plugs" detail="Recommended every 40,000 mi" status="Due in 8,550 mi" />
          </div>
        </section>

        <section className="landing-smart-band">
          <h2><span>3.</span> Smarter tools for every car owner.</h2>
          <div className="landing-smart-grid">
            <PlannedTool icon={Bot} title="GarageBook AI" description="Ask questions and understand your car’s recorded history like never before." />
            <PlannedTool icon={ScanLine} title="Snap a receipt" description="Upload a photo, review extracted details, and file it to your vehicle." />
            <PlannedTool icon={Sparkles} title="Know what’s coming" description="Forecast maintenance and costs so you can plan ahead with confidence." />
          </div>
        </section>

        <section className="landing-white-section landing-glovebox-section">
          <SectionIntro number="4" title="Your digital glovebox." description="All your important documents, receipts, and records in one secure place." />
          <div className="landing-glovebox-board">
            <GloveboxItem icon={FileCheck2} title="Registration" detail="Expires Oct 2026" />
            <GloveboxItem icon={ShieldCheck} title="Insurance" detail="Policy #GBK-123456" />
            <GloveboxItem icon={Wrench} title="Warranty" detail="Active until 4/28/2028" />
            <GloveboxItem icon={ReceiptText} title="Receipts" detail="Store and search" />
            <GloveboxItem icon={FileText} title="Invoices" detail="Organize and track" />
            <GloveboxItem icon={ImageIcon} title="Photos" detail="Keep everything safe" />
            <div className="landing-folder-visual" aria-hidden="true"><FolderLock size={40} /><span>Vehicle files</span></div>
          </div>
        </section>

        <section className="landing-white-section landing-history-section">
          <SectionIntro number="5" title="A history you can trust." description="Every entry is recorded in a connected timeline with a clear record of what happened and when." />
          <div className="landing-history-table">
            <HistoryLine tone="owner" title="Oil change" source="Owner reported" date="Feb 10, 2026" mileage="118,650 mi" />
            <HistoryLine tone="receipt" title="Front brake pads" source="Receipt documented" date="Nov 28, 2025" mileage="115,200 mi" />
            <HistoryLine tone="amended" title="Air filter replacement" source="Amended" date="Aug 15, 2024" mileage="102,450 mi" />
            <HistoryLine tone="void" title="Coolant flush" source="Voided" date="Jun 02, 2024" mileage="98,120 mi" />
          </div>
        </section>

        <section className="landing-everywhere-band" aria-labelledby="landing-everywhere-title">
          <div className="landing-everywhere-inner">
            <div className="landing-everywhere-copy">
              <h2 id="landing-everywhere-title"><span>6.</span> Your garage,<br />on every screen.</h2>
              <p>Review the complete vehicle story on desktop. Capture mileage, symptoms, photos, and receipts when you’re with the car.</p>
              <small>Web available · Native iOS and Android in development</small>
            </div>
            <div className="landing-everywhere-devices"><LandingDashboardPreview /></div>
          </div>
        </section>

        <section className="landing-comparison-section" id="compare">
          <div className="landing-comparison-table">
            <div className="landing-comparison-title"><strong>GarageBook at a glance</strong><span>Free</span><span>Plus<small>Coming soon</small></span></div>
            {comparisonFeatures.map((feature) => <div className="landing-comparison-row" key={feature}><span>{feature}</span><Check size={15} /><small>Coming soon</small></div>)}
          </div>
          <div className="landing-pricing-inline" id="pricing">
            <h2>Simple pricing.</h2>
            <div>
              <article>
                <h3>Free</h3><span>Always</span><strong>{pricing.free.price}</strong><p>Everything you need to get started.</p>
                <Link className="landing-button landing-button-dark" href="/signup">Get GarageBook free <ArrowRight size={16} /></Link>
              </article>
              <article className="landing-plus-card">
                <h3>Plus</h3><span>Coming soon</span><strong>{pricing.plus.price}<small>{pricing.plus.cadence} target</small></strong><p>Unlock smarter tools and planned capabilities.</p>
                <button disabled type="button">Coming soon</button>
              </article>
            </div>
          </div>
        </section>
      </div>

      <section className="landing-final-cta">
        <div><h2>Everything about your car. One garage.</h2><p>Keep every vehicle and record in one organized place.</p></div>
        <Link className="landing-button landing-button-dark" href="/signup">Get GarageBook free <ArrowRight size={17} /></Link>
      </section>

      <footer className="landing-footer">
        <Brand /><p>Your cars. Your records. All in one place.</p>
        <div><Link href="#features">Features</Link><Link href="#compare">Compare</Link><Link href="/login">Log in</Link></div>
      </footer>
    </main>
  );
}

function SectionIntro({ number, title, description }: { number: string; title: string; description: string }) {
  return <div className="landing-section-intro"><h2><span>{number}.</span> {title}</h2><p>{description}</p></div>;
}

function VehicleCard({ className, year, name, mileage }: { className: string; year: string; name: string; mileage: string }) {
  return <article className={`landing-vehicle-card ${className}`}><div><span>{year}</span><strong>{name}</strong><small>{mileage}</small></div><Check size={17} /></article>;
}

function ServiceLine({ tone, title, detail, status }: { tone: string; title: string; detail: string; status: string }) {
  return <div className={`landing-service-line landing-service-${tone}`}><span><Wrench size={15} /></span><div><strong>{title}</strong><small>{detail}</small></div><b>{status}</b></div>;
}

function PlannedTool({ icon: Icon, title, description }: { icon: React.ComponentType<{ size?: number }>; title: string; description: string }) {
  return <article><Icon size={32} /><div><span>Coming soon</span><h3>{title}</h3><p>{description}</p></div></article>;
}

function GloveboxItem({ icon: Icon, title, detail }: { icon: React.ComponentType<{ size?: number }>; title: string; detail: string }) {
  return <div><Icon size={21} /><span><strong>{title}</strong><small>{detail}</small></span></div>;
}

function HistoryLine({ tone, title, source, date, mileage }: { tone: string; title: string; source: string; date: string; mileage: string }) {
  const Icon = tone === "owner" ? Check : tone === "receipt" ? ReceiptText : tone === "void" ? History : MapPin;
  return <div className={`landing-history-line landing-history-${tone}`}><span><Icon size={14} /></span><strong>{title}</strong><em>{source}</em><small>{date}<br />{mileage}</small><LockKeyhole size={15} /></div>;
}
