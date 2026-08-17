import {
  AlertTriangle,
  CalendarClock,
  Camera,
  CarFront,
  Check,
  FileText,
  History,
  LayoutDashboard,
  Plus,
  ReceiptText,
  Store,
  Wrench,
} from "lucide-react";

export function LandingDashboardPreview() {
  return (
    <div className="landing-device-pair" aria-label="GarageBook web and mobile dashboard previews">
      <div className="landing-laptop" aria-label="GarageBook web dashboard preview">
        <div className="landing-laptop-frame"><DesktopDashboardScreen /></div>
        <div className="landing-laptop-base" aria-hidden="true" />
      </div>
      <div className="landing-phone-wrap">
        <div className="landing-phone" aria-label="GarageBook mobile dashboard preview">
          <div className="landing-phone-speaker" aria-hidden="true" />
          <DashboardScreen />
        </div>
      </div>
    </div>
  );
}

function DesktopDashboardScreen() {
  return (
    <div className="landing-desktop-screen">
      <aside className="landing-desktop-sidebar">
        <strong>GarageBook</strong>
        <nav aria-label="Desktop dashboard preview navigation">
          <span className="active"><LayoutDashboard size={11} />Overview</span>
          <span><History size={11} />Timeline</span>
          <span><Wrench size={11} />Maintenance</span>
          <span><AlertTriangle size={11} />Symptoms</span>
          <span><ReceiptText size={11} />Documents</span>
          <span><Store size={11} />Shops</span>
        </nav>
        <small><Check size={9} /> Records up to date</small>
      </aside>
      <div className="landing-desktop-main">
        <header>
          <div><small>2014</small><h3>MINI Cooper S Paceman</h3></div>
          <span><Check size={9} /> Healthy</span>
        </header>
        <div className="landing-desktop-summary">
          <div><small>Current mileage</small><strong>121,450 <em>mi</em></strong></div>
          <div><small>Total spent</small><strong>$8,750</strong></div>
          <div><small>Records</small><strong>23</strong></div>
          <div><small>Open symptoms</small><strong>1</strong></div>
        </div>
        <div className="landing-desktop-columns">
          <DesktopPanel title="Recent activity" rows={["Oil-pan gasket replacement", "Invoice uploaded", "Mileage updated"]} />
          <DesktopPanel title="Upcoming reminders" rows={["Engine air filter", "Brake fluid flush", "Oil change"]} />
          <DesktopPanel title="Recent documents" rows={["Repair invoice", "Inspection photo", "Service receipt"]} />
        </div>
      </div>
    </div>
  );
}

function DesktopPanel({ title, rows }: { title: string; rows: string[] }) {
  return (
    <section className="landing-desktop-panel">
      <strong>{title}</strong>
      {rows.map((row) => <div key={row}><span /><small>{row}</small></div>)}
    </section>
  );
}

function DashboardScreen() {
  return (
    <div className="landing-phone-screen">
        <div className="landing-phone-bar">
          <span className="landing-phone-brand">GarageBook</span>
          <span className="landing-phone-avatar">JD</span>
        </div>
        <div className="landing-phone-intro">
          <p>Your MINI, one clear record.</p>
          <span className="landing-phone-status"><Check size={10} /> Up to date</span>
        </div>
        <div className="landing-phone-vehicle">
          <div><small>2014</small><strong>MINI Cooper S Paceman</strong></div>
          <Camera size={16} aria-hidden="true" />
        </div>
        <div className="landing-phone-mileage">
          <span>Current mileage</span>
          <strong>121,450 <small>mi</small></strong>
        </div>
        <div className="landing-phone-action"><Wrench size={14} /><span>Add service or repair</span></div>
        <div className="landing-phone-planner">
          <div><CalendarClock size={14} /><span>Next scheduled service</span><strong>Oil change</strong></div>
          <div><AlertTriangle size={14} /><span>Open symptoms</span><strong>1 awaiting follow-up</strong></div>
        </div>
        <div className="landing-phone-history">
          <div className="landing-phone-section-title"><strong>Recent vehicle history</strong><span>View all</span></div>
          <HistoryItem icon={Wrench} title="Oil-pan gasket replacement" meta="Repair · 121,110 mi" />
          <HistoryItem icon={FileText} title="Invoice uploaded" meta="Document · Bavarian Auto Works" />
        </div>
        <nav className="landing-phone-nav" aria-label="Dashboard preview navigation">
          <span><LayoutDashboard size={13} />Home</span>
          <span><CarFront size={13} />Vehicles</span>
          <span className="landing-phone-add"><Plus size={15} />Add</span>
          <span><Store size={13} />Shops</span>
        </nav>
      </div>
  );
}

function HistoryItem({ icon: Icon, title, meta }: { icon: React.ComponentType<{ size?: number }>; title: string; meta: string }) {
  return <div className="landing-phone-history-row"><span><Icon size={13} /></span><div><strong>{title}</strong><small>{meta}</small></div></div>;
}
