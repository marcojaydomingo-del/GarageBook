import Link from "next/link";
import { ArrowRight, CheckCircle2, FileText, Wrench } from "lucide-react";
import { Brand } from "@/components/brand";
import { RecoveryRedirect } from "@/components/recovery-redirect";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f6f6f2]">
      <RecoveryRedirect />
      <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-6 lg:px-8">
        <Brand />
        <nav className="flex items-center gap-3" aria-label="Account">
          <Link className="btn btn-ghost" href="/login">Log in</Link>
          <Link className="btn btn-primary" href="/signup">Create account</Link>
        </nav>
      </header>
      <section className="mx-auto grid max-w-7xl gap-12 px-5 pb-20 pt-16 lg:grid-cols-[1.05fr_.95fr] lg:px-8 lg:pt-24">
        <div className="max-w-2xl">
          <span className="eyebrow">Your car’s complete story</span>
          <h1 className="mt-5 text-5xl font-semibold tracking-[-.055em] text-charcoal sm:text-6xl lg:text-7xl">Every repair.<br />One clear record.</h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-muted">GarageBook connects symptoms, shop visits, repairs, invoices, and warranties into a trusted vehicle history you can actually use.</p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link className="btn btn-primary btn-lg" href="/signup">Start your garage <ArrowRight size={17} /></Link>
            <Link className="btn btn-secondary btn-lg" href="/dashboard">View sample dashboard</Link>
          </div>
          <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3 text-sm text-muted">
            {['Free to start','No credit card','Built for real ownership'].map((item) => <span className="flex items-center gap-2" key={item}><CheckCircle2 className="text-teal" size={16} />{item}</span>)}
          </div>
        </div>
        <div className="relative rounded-[28px] border border-black/5 bg-[#202b2a] p-5 shadow-2xl shadow-teal/10 sm:p-7">
          <div className="mb-8 flex items-center justify-between text-white"><div><p className="text-xs uppercase tracking-[.18em] text-white/55">In your garage</p><p className="mt-1 font-medium">2014 MINI Cooper S Paceman</p></div><span className="status status-good">Healthy</span></div>
          <div className="rounded-2xl bg-[#eef2ed] p-6">
            <div className="flex items-end justify-between"><div><p className="text-sm text-muted">Current mileage</p><p className="mt-1 text-3xl font-semibold tracking-tight">121,450 <span className="text-base font-normal text-muted">mi</span></p></div><div className="health-ring">86</div></div>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <div className="mini-card"><Wrench size={18} /><div><p className="text-xs text-muted">Latest repair</p><p className="text-sm font-medium">Oil-pan gasket</p></div></div>
              <div className="mini-card"><FileText size={18} /><div><p className="text-xs text-muted">Records stored</p><p className="text-sm font-medium">12 documents</p></div></div>
            </div>
          </div>
          <p className="mt-5 text-center text-xs text-white/45">Symptom → Shop → Repair → Invoice → History</p>
        </div>
      </section>
    </main>
  );
}
