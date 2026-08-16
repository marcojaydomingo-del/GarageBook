import {
  AlertTriangle,
  CalendarClock,
  Camera,
  CarFront,
  Check,
  FileText,
  LayoutDashboard,
  Plus,
  Store,
  Wrench,
} from "lucide-react";

export function LandingDashboardPreview() {
  return (
    <div className="landing-phone" aria-label="GarageBook mobile dashboard preview">
      <div className="landing-phone-speaker" aria-hidden="true" />
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
    </div>
  );
}

function HistoryItem({ icon: Icon, title, meta }: { icon: React.ComponentType<{ size?: number }>; title: string; meta: string }) {
  return <div className="landing-phone-history-row"><span><Icon size={13} /></span><div><strong>{title}</strong><small>{meta}</small></div></div>;
}
