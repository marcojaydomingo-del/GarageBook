import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { AlertTriangle, ArrowRight, BellRing, Camera, Gauge, Pencil, Plus, Wrench } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { DocumentUpload } from "@/components/document-upload";
import { DocumentDeleteButton } from "@/components/document-delete-button";
import { PageHeader } from "@/components/page-header";
import { ReminderList } from "@/components/reminder-list";
import { VehicleTimeline } from "@/components/timeline";
import { getVehicle, getVehiclePhotos, getVehicleReminders, getVehicleRepairCases, getVehicleSummary, getVehicleTimeline } from "@/lib/data/garage";
import { formatCurrency, formatDate, formatMileage } from "@/lib/format";
import { isRepairCaseOpen, repairCaseLabels } from "@/lib/domain/repair-case";

export default async function VehiclePage({params}:{params:Promise<{id:string}>}) {
  const {id}=await params;
  const vehicle=await getVehicle(id);
  if(!vehicle)notFound();
  const [summary,timeline,repairCases,reminders,photos]=await Promise.all([getVehicleSummary(id),getVehicleTimeline(id),getVehicleRepairCases(id),getVehicleReminders(id,vehicle.current_mileage),getVehiclePhotos(id)]);
  if(!vehicle||!summary)notFound();
  const activeCases=repairCases.filter(({status})=>isRepairCaseOpen(status));

  return <AppShell vehicleId={id}>
    <PageHeader
      eyebrow="My garage"
      title={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
      description={`${vehicle.trim??""}${vehicle.color?` · ${vehicle.color}`:""}${vehicle.vin?` · VIN ${vehicle.vin}`:""}`}
      actions={<><Link className="btn btn-ghost" href={`/vehicles/${id}/edit`}><Pencil size={16}/>Edit vehicle</Link><Link className="btn btn-secondary" href={`/vehicles/${id}/symptoms/new`}><AlertTriangle size={16}/>Log symptom</Link><Link className="btn btn-primary" href={`/vehicles/${id}/maintenance/new`}><Plus size={16}/>Add record</Link></>}
    />

    <section className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <Stat label="Current mileage" value={`${formatMileage(vehicle.current_mileage)} mi`} icon={Gauge}/>
      <Stat label="Documented status" value={summary.status.label} icon={Wrench}/>
      <Stat label="Recorded spend" value={formatCurrency(summary.totalSpend)} icon={Wrench}/>
      <Stat label="Active repair cases" value={String(activeCases.length)} icon={AlertTriangle}/>
    </section>

    <section className="ride-photos mb-9" id="ride-photos" aria-labelledby="ride-photos-heading">
      <div className="ride-photo-copy"><h2 id="ride-photos-heading">Photos of your ride</h2><p>Add exterior, interior, modification, or condition photos. They stay private with the vehicle record.</p><DocumentUpload vehicleId={id} defaultType="photo" lockType photoOnly buttonLabel="Upload vehicle photo"/><Link className="btn btn-ghost mt-2 w-full" href={`/vehicles/${id}/photos`}>Open photo gallery <ArrowRight size={15}/></Link></div>
      <div className="ride-photo-gallery">
        {photos.length?photos.slice(0,5).map((photo,index)=><figure className={index===0?"featured":""} key={photo.id}><Link href={`/vehicles/${id}/photos`}><Image alt={`${vehicle.year} ${vehicle.make} ${vehicle.model} uploaded photo`} fill priority={index===0} sizes={index===0?"(max-width: 1024px) 100vw, 52vw":"(max-width: 640px) 50vw, 260px"} src={photo.url} unoptimized/></Link><figcaption><span>{index===0?"Latest photo":`Uploaded ${formatDate(photo.uploaded_at)}`}</span><DocumentDeleteButton compact documentId={photo.id} vehicleId={id} fileName={photo.file_name}/></figcaption></figure>):<div className="ride-photo-empty"><Camera size={28}/><strong>No vehicle photos yet</strong><span>Your latest photo will also appear on the dashboard.</span></div>}
      </div>
    </section>

    <section className="card mb-9 p-5 sm:p-6" aria-labelledby="vehicle-reminders-heading">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold" id="vehicle-reminders-heading">Service reminders</h2>
          <p className="mt-1 text-sm leading-6 text-muted">Keep upcoming maintenance visible before it becomes overdue.</p>
        </div>
        <Link className="btn btn-secondary" href={`/vehicles/${id}/reminders/new`}><BellRing size={16}/>Schedule service</Link>
      </div>
      <ReminderList reminders={reminders} vehicleId={id}/>
    </section>

    {repairCases.length > 0 && <section className="mb-9" aria-labelledby="repair-cases-heading">
      <div className="mb-4">
        <h2 className="text-xl font-semibold" id="repair-cases-heading">Repair journeys</h2>
        <p className="mt-1 text-sm text-muted">Follow each reported symptom from diagnosis through completed work.</p>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {repairCases.slice(0,4).map((repairCase)=><Link className="card flex min-h-32 items-start justify-between gap-4 p-5 transition hover:border-[#b9d7d1]" href={`/vehicles/${id}/repairs/${repairCase.id}`} key={repairCase.id}>
          <div><span className={`status ${isRepairCaseOpen(repairCase.status)?"status-watch":"status-good"}`}>{repairCaseLabels[repairCase.status]}</span><h3 className="mt-3 font-semibold">{repairCase.title}</h3><p className="mt-1 text-sm text-muted">Opened {formatDate(repairCase.opened_at)}</p></div><ArrowRight className="mt-1 shrink-0 text-teal" size={18}/>
        </Link>)}
      </div>
    </section>}

    <section className="grid gap-7 lg:grid-cols-[1fr_280px]">
      <div>
        <div className="mb-5"><h2 className="text-xl font-semibold">Vehicle timeline</h2><p className="mt-1 text-sm text-muted">One chronological record of your vehicle’s documented activity.</p></div>
        {timeline.length?<VehicleTimeline events={timeline}/>:<div className="card p-10 text-center text-sm text-muted">No vehicle history yet.</div>}
      </div>
      <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
        <div className="card p-5"><h3 className="font-semibold">Vehicle details</h3><dl className="mt-4 space-y-3 text-sm"><Row label="Model year" value={String(vehicle.year)}/><Row label="Trim" value={vehicle.trim??"Not set"}/><Row label="Color" value={vehicle.color??"Not set"}/><Row label="VIN" value={vehicle.vin??"Not set"}/></dl></div>
        <div className="card p-5" id="documents"><h3 className="font-semibold">Documents</h3><p className="mt-2 text-sm text-muted">{summary.documentCount} private file{summary.documentCount===1?"":"s"}</p><DocumentUpload vehicleId={id}/></div>
      </aside>
    </section>
  </AppShell>;
}

function Stat({label,value,icon:Icon}:{label:string;value:string;icon:React.ComponentType<{size?:number;className?:string}>}){return <div className="card p-5"><Icon className="text-teal" size={18}/><p className="mt-4 text-xs text-muted">{label}</p><p className="mt-1 font-semibold">{value}</p></div>}
function Row({label,value}:{label:string;value:string}){return <div className="flex justify-between gap-3"><dt className="text-muted">{label}</dt><dd className="text-right font-medium">{value}</dd></div>}
