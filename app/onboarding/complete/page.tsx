import Link from "next/link";
import { AlertTriangle,ArrowLeft,ArrowRight,BellRing,Camera,Check,FileText,Gauge,Wrench } from "lucide-react";
import { notFound } from "next/navigation";
import { completeOnboarding } from "@/app/auth/actions";
import { Brand } from "@/components/brand";
import { DocumentUpload } from "@/components/document-upload";
import { getVehicle,getVehiclePhotos,getVehicleSummary } from "@/lib/data/garage";

const addedCopy={maintenance:"Recent maintenance added to the starting history.",symptom:"Current symptom added and connected to a repair journey.",reminder:"Upcoming service added to the starting snapshot."} as const;

export default async function OnboardingCompletePage({searchParams}:{searchParams:Promise<{vehicle?:string;added?:keyof typeof addedCopy}>}){
  const {vehicle:vehicleId,added}=await searchParams;if(!vehicleId)notFound();
  const [vehicle,summary,photos]=await Promise.all([getVehicle(vehicleId),getVehicleSummary(vehicleId),getVehiclePhotos(vehicleId,1)]);if(!vehicle||!summary)notFound();
  const savedFacts=1+Number(photos.length>0)+Number(summary.maintenanceCount>0)+Number(summary.openSymptoms>0)+Number(summary.reminderCount>0);
  return <main className="onboarding-shell">
    <header className="onboarding-header"><div><Brand/><span>Current-state setup</span></div></header>
    <div className="baseline-wrap">
      <div className="onboarding-progress baseline-progress"><span className="done"><Check size={14}/></span><i/><span className="active">2</span><small>Vehicle</small><small>Current state</small></div>
      {added&&addedCopy[added]&&<p className="baseline-success"><Check size={16}/>{addedCopy[added]}</p>}
      <div className="baseline-heading"><div><span>Step 2 of 2</span><h1>Record what is true today.</h1><p>You do not need a complete service history. Add the facts you know now and leave the rest open until evidence appears.</p></div><div className="baseline-vehicle"><small>Starting vehicle</small><strong>{vehicle.year} {vehicle.make} {vehicle.model}</strong><span><Gauge size={15}/>{vehicle.current_mileage.toLocaleString()} miles</span><Link href="/onboarding"><ArrowLeft size={14}/>Change vehicle details</Link></div></div>

      <div className="baseline-facts" aria-label={`${savedFacts} starting facts saved`}>
        <p><strong>{savedFacts} starting {savedFacts===1?"fact":"facts"} saved</strong><span>These describe the record you have—not the vehicle&apos;s mechanical condition.</span></p>
        <BaselineFact label="Mileage" complete/>
        <BaselineFact label="Photo" complete={photos.length>0}/>
        <BaselineFact label="History" complete={summary.maintenanceCount>0}/>
        <BaselineFact label="Symptom" complete={summary.openSymptoms>0}/>
        <BaselineFact label="Next service" complete={summary.reminderCount>0}/>
      </div>

      <section className="baseline-grid" aria-label="Vehicle current state setup">
        <article className="baseline-photo">
          <div className="baseline-card-heading"><span><Camera size={19}/></span><div><h2>Add a current photo</h2><p>{photos.length?"A vehicle photo is saved. Add another angle if useful.":"Document how the vehicle looks today. The newest photo personalizes the dashboard."}</p></div></div>
          {photos[0]&&<div className="baseline-photo-preview" style={{backgroundImage:`url(${photos[0].url})`}}/>}
          <DocumentUpload vehicleId={vehicle.id} defaultType="photo" lockType photoOnly buttonLabel={photos.length?"Add another photo":"Upload vehicle photo"}/>
        </article>

        <div className="baseline-actions">
          <BaselineAction icon={Wrench} title="Add recent maintenance" description="Record the most recent service or repair you can verify." href={`/vehicles/${vehicle.id}/maintenance/new?onboarding=1`} count={summary.maintenanceCount?`${summary.maintenanceCount} saved`:undefined}/>
          <BaselineAction icon={AlertTriangle} title="Log a current symptom" description="Capture a noise, leak, warning light, or other symptom before diagnosis." href={`/vehicles/${vehicle.id}/symptoms/new?onboarding=1`} count={summary.openSymptoms?`${summary.openSymptoms} open`:undefined}/>
          <BaselineAction icon={BellRing} title="Schedule the next service" description="Add a known due date, mileage, or both." href={`/vehicles/${vehicle.id}/reminders/new?onboarding=1`}/>
          <BaselineAction icon={FileText} title="Add existing documents later" description="Receipts and invoices can be attached from the vehicle record when convenient." href={`/vehicles/${vehicle.id}#documents`}/>
        </div>
      </section>

      <div className="baseline-finish"><div><strong>Your starting snapshot can stay incomplete.</strong><p>OTTOKO separates documented facts from unknown history and never treats missing records as proof of mechanical condition.</p></div><form action={completeOnboarding}><button className="btn btn-primary btn-lg" type="submit">Finish and open dashboard <ArrowRight size={17}/></button></form></div>
    </div>
  </main>;
}

function BaselineAction({icon:Icon,title,description,href,count}:{icon:React.ComponentType<{size?:number}>;title:string;description:string;href:string;count?:string}){return <Link className="baseline-action" href={href}><span><Icon size={19}/></span><div><div>{count&&<small>{count}</small>}<h2>{title}</h2></div><p>{description}</p></div><ArrowRight size={17}/></Link>}

function BaselineFact({label,complete}:{label:string;complete:boolean}){return <span className={complete?"complete":undefined}><i aria-hidden="true">{complete?<Check size={12}/>:null}</i>{label}</span>}
