import type { Metadata } from "next";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { AlertTriangle, ArrowRight, CalendarClock, Camera, Check, FileText, Gauge, LockKeyhole, Wrench } from "lucide-react";
import { PublicSiteShell } from "@/components/public-site-shell";
import { VehicleTimeline } from "@/components/timeline";
import { formatCurrency, formatMileage } from "@/lib/format";
import { sampleVehicle, timelineEvents } from "@/lib/sample-data";

export const metadata: Metadata = {
  title: "Sample Garage",
  description: "Explore a populated, read-only OTTOKO vehicle history before creating an account.",
};

export default function DemoPage() {
  return <PublicSiteShell><div className="demo-shell">
    <section className="demo-intro">
      <div><span className="demo-readonly"><LockKeyhole size={14}/>Read-only sample</span><h1>See the complete record before adding your own.</h1><p>This garage uses fictional sample data for a 2014 MINI Cooper S Paceman. Nothing here is connected to a real owner.</p></div>
      <Link className="btn btn-primary btn-lg" href="/signup">Start your garage <ArrowRight size={16}/></Link>
    </section>

    <section className="demo-cockpit" aria-labelledby="demo-vehicle-name">
      <div className="demo-vehicle">
        <div><span>2014</span><h2 id="demo-vehicle-name">MINI Cooper S Paceman</h2><p>ALL4 · Oxford Green</p></div>
        <span className="status status-good"><Check size={13}/>No open items</span>
        <div className="demo-mileage"><small>Current mileage</small><strong>{formatMileage(sampleVehicle.mileage)} <em>mi</em></strong></div>
      </div>
      <div className="demo-summary">
        <DemoFact icon={Gauge} label="Current mileage" value={`${formatMileage(sampleVehicle.mileage)} mi`} />
        <DemoFact icon={Wrench} label="Recorded spending" value={formatCurrency(sampleVehicle.totalSpend)} />
        <DemoFact icon={CalendarClock} label="Next service" value={sampleVehicle.nextService} />
        <DemoFact icon={AlertTriangle} label="Open symptoms" value="1 being monitored" />
        <DemoFact icon={FileText} label="Supporting records" value="Invoice and diagnosis" />
        <DemoFact icon={Camera} label="Vehicle photos" value="Private gallery ready" />
      </div>
    </section>

    <section className="demo-journey"><div><h2>The repair story stays connected.</h2><p>Symptom → shop → estimate → approval → repair → invoice → warranty → history</p></div><span>Sample journey complete</span></section>

    <section className="demo-history">
      <header><div><h2>Chronological vehicle history</h2><p>Maintenance, repairs, symptoms, documents, and shop visits share one record.</p></div><span>{timelineEvents.length} sample events</span></header>
      <VehicleTimeline events={timelineEvents}/>
    </section>
  </div></PublicSiteShell>;
}

function DemoFact({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return <div><Icon aria-hidden="true" size={18}/><span>{label}</span><strong>{value}</strong></div>;
}
