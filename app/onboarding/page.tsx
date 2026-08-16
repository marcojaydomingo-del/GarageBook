import Link from "next/link";
import { ArrowRight,Camera,Check,Clock3,Gauge,Wrench } from "lucide-react";
import { skipOnboarding } from "@/app/auth/actions";
import { Brand } from "@/components/brand";
import { VehicleForm } from "@/components/forms";
import { getVehicles,requireUser } from "@/lib/data/garage";

export default async function OnboardingPage(){
  const [vehicles,auth]=await Promise.all([getVehicles(),requireUser()]);
  const firstName=typeof auth.user.user_metadata.full_name==="string"?auth.user.user_metadata.full_name.trim().split(/\s+/)[0]:"there";
  return <main className="onboarding-shell">
    <header className="onboarding-header"><div><Brand/><span>Vehicle setup</span><form action={skipOnboarding}><button className="btn btn-ghost" type="submit">Skip for now</button></form></div></header>
    <div className="onboarding-grid">
      <section className="onboarding-intro">
        <div className="onboarding-progress"><span className="active">1</span><i/><span>2</span><small>Vehicle</small><small>Current state</small></div>
        <div className="onboarding-time"><Clock3 size={15}/>About two minutes</div>
        <h1>Give this vehicle an honest starting point.</h1>
        <p>Welcome, {firstName}. Older vehicles rarely arrive with a perfect history. Start with what you know today; GarageBook will keep future evidence connected from here.</p>
        <ul>
          <li><Gauge size={18}/><span><strong>Current mileage</strong><small>Anchors future maintenance, symptoms, and reminders.</small></span></li>
          <li><Wrench size={18}/><span><strong>Known history</strong><small>Add recent work when you have it. Unknown history can stay unknown.</small></span></li>
          <li><Camera size={18}/><span><strong>Current appearance</strong><small>A private vehicle photo gives the record useful visual context.</small></span></li>
        </ul>
      </section>

      <section className="onboarding-form-panel" aria-labelledby="vehicle-setup-heading">
        <div><span>Step 1 of 2</span><h2 id="vehicle-setup-heading">{vehicles.length?"Add another vehicle":"Add your vehicle"}</h2><p>Year, make, model, and current mileage are enough. Everything can be corrected later.</p></div>
        <VehicleForm onboarding/>
        {vehicles[0]&&<div className="onboarding-resume"><Check size={16}/><span><strong>Already added {vehicles[0].year} {vehicles[0].make} {vehicles[0].model}?</strong><small>Continue building its current-state snapshot.</small></span><Link href={`/onboarding/complete?vehicle=${vehicles[0].id}`}>Continue <ArrowRight size={15}/></Link></div>}
      </section>
    </div>
  </main>;
}
