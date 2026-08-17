import Link from "next/link";
import {
  AlertTriangle,ArrowRight,CalendarClock,Camera,Check,ChevronDown,
  CircleDollarSign,FileText,Gauge,MapPin,Plus,Receipt,Store,Wrench,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { EmptyState } from "@/components/states";
import { VehicleTimeline } from "@/components/timeline";
import { ReminderList } from "@/components/reminder-list";
import { DashboardTour,DashboardTourReplay } from "@/components/dashboard-tour";
import {
  getVehiclePhotos,getVehicleReminders,getVehicleSummary,getVehicleTimeline,getVehicles,
  requireUser,type VehicleRecord,
} from "@/lib/data/garage";
import { formatCurrency,formatDate,formatMileage } from "@/lib/format";
import { getRepairJourneyStep,repairCaseLabels,repairJourneySteps,type RepairCaseStatus } from "@/lib/domain/repair-case";

interface DashboardProps{searchParams:Promise<{vehicle?:string}>}

export default async function Dashboard({searchParams}:DashboardProps){
  const [{vehicle:requestedVehicleId},vehicles,auth]=await Promise.all([searchParams,getVehicles(),requireUser()]);
  const fullName=auth.user.user_metadata.full_name;
  const name=typeof fullName==="string"&&fullName.trim()?fullName.trim().split(/\s+/)[0]:"there";
  const vehicle=vehicles.find(({id})=>id===requestedVehicleId)??vehicles[0];

  if(!vehicle)return <AppShell><div className="dashboard-heading"><div><h1>Welcome, {name}</h1><p>Add your first vehicle to begin a trustworthy maintenance history.</p></div></div><EmptyState title="Your garage is ready for its first vehicle" description="Start with the vehicle and current mileage. You can add maintenance, symptoms, receipts, and shop visits afterward." action={<Link className="btn btn-primary" href="/vehicles/new"><Plus size={16}/>Add your first vehicle</Link>}/></AppShell>;

  const [summary,timeline,reminders,photos]=await Promise.all([
    getVehicleSummary(vehicle.id),getVehicleTimeline(vehicle.id),getVehicleReminders(vehicle.id,vehicle.current_mileage),getVehiclePhotos(vehicle.id,1),
  ]);
  if(!summary)throw new Error("Unable to load vehicle summary");
  const lastMileageDate=timeline.find(({type})=>type==="mileage_update")?.date;
  const openSymptom=timeline.find(({type,status})=>type==="symptom"&&status!=="completed");
  const statusClass=summary.status.label==="Up to date"?"status-good":summary.status.label==="Attention soon"?"status-watch":"status-action";
  const activeCase=summary.activeRepairCase;
  const {data:tourProfile}=await auth.supabase.from("profiles").select("dashboard_tour_version").eq("id",auth.user.id).maybeSingle();
  const completedTourVersion=typeof tourProfile?.dashboard_tour_version==="number"?tourProfile.dashboard_tour_version:0;

  return <AppShell vehicleId={vehicle.id}>
    <DashboardTour initialOpen={completedTourVersion<1}/>
    <div className="dashboard-heading">
      <div><h1>Your MINI, one clear record.</h1><p>Welcome back, {name}. Here’s what needs attention and what is already documented.</p></div>
      <div className="dashboard-heading-actions"><DashboardTourReplay/><Link className="btn btn-secondary" href="/vehicles/new"><Plus size={16}/>Add vehicle</Link></div>
    </div>

    <section className="cockpit" aria-labelledby="selected-vehicle" data-tour="vehicle">
      <div className="vehicle-command" style={photos[0]?{"--vehicle-photo":`url(${photos[0].url})`} as React.CSSProperties:undefined}>
        <div className="vehicle-command-shade"/>
        <div className="vehicle-command-content">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div><p className="vehicle-year">{vehicle.year}</p><h2 id="selected-vehicle">{vehicle.make} {vehicle.model}</h2><p>{vehicle.trim??"Vehicle record"}</p></div>
            <span className={`status ${statusClass}`}>{summary.status.label}</span>
          </div>
          {vehicles.length>1&&<VehicleSwitcher vehicles={vehicles} selected={vehicle}/>}
          <div className="vehicle-mileage"><span>Current mileage</span><strong>{formatMileage(vehicle.current_mileage)} <small>mi</small></strong><p>{lastMileageDate?`Recorded ${formatDate(lastMileageDate)}`:"Recorded when this vehicle was added"}</p></div>
          <div className="vehicle-command-actions" data-tour="actions">
            <Link className="dashboard-primary-action" href={`/vehicles/${vehicle.id}/maintenance/new`}><Wrench size={17}/>Add service or repair<ArrowRight size={16}/></Link>
            <Link href={`/vehicles/${vehicle.id}/symptoms/new`}><AlertTriangle size={16}/>Log a problem</Link>
            <Link href={photos.length?`/vehicles/${vehicle.id}/photos`:`/vehicles/${vehicle.id}#ride-photos`}><Camera size={16}/>{photos.length?"Open photo gallery":"Add vehicle photo"}</Link>
          </div>
        </div>
      </div>

      <div className="service-planner">
        <PlannerRow icon={CalendarClock} tone="amber" label="Next scheduled service" value={reminders[0]?.title??"No service scheduled"} href={`/vehicles/${vehicle.id}/reminders/new`} action={reminders[0]?"Review plan":"Schedule service"}/>
        <PlannerRow icon={AlertTriangle} tone="orange" label="Open symptoms" value={openSymptom?.title??"No symptoms awaiting follow-up"} href={`/vehicles/${vehicle.id}/symptoms/new`} action={summary.openSymptoms?"Review problem":"Log a problem"}/>
      </div>
    </section>

    <RepairRibbon status={activeCase?.status??null} title={activeCase?.title??openSymptom?.title} vehicleId={vehicle.id} caseId={activeCase?.id}/>

    <section className="dashboard-workspace">
      <div className="history-panel" data-tour="history">
        <div className="panel-heading"><div><h2>Recent vehicle history</h2><p>The latest evidence across maintenance, repairs, symptoms, mileage, and documents.</p></div><Link href={`/vehicles/${vehicle.id}`}>View full history <ArrowRight size={15}/></Link></div>
        {timeline.length?<VehicleTimeline compact events={timeline.slice(0,5)}/>:<EmptyState title="No vehicle activity yet" description="Add maintenance or log a problem to begin this vehicle’s history."/>}
      </div>

      <aside className="service-sidecar">
        <section data-tour="reminders"><div className="sidecar-heading"><h2>Service reminders</h2><Link href={`/vehicles/${vehicle.id}/reminders/new`} aria-label="Add reminder"><Plus size={16}/></Link></div><ReminderList limit={2} reminders={reminders} vehicleId={vehicle.id}/></section>
        <section className="record-overview"><h2>Record overview</h2><dl><OverviewRow icon={CircleDollarSign} label="Recorded spend" value={formatCurrency(summary.totalSpend)}/><OverviewRow icon={FileText} label="Documents" value={String(summary.documentCount)}/><OverviewRow icon={Wrench} label="Active cases" value={String(summary.unresolvedRepairCases)}/><OverviewRow icon={AlertTriangle} label="Open symptoms" value={String(summary.openSymptoms)}/></dl></section>
        <section className="quick-links"><h2>More actions</h2><Link href={`/onboarding/complete?vehicle=${vehicle.id}`}><Gauge size={16}/>Current-state setup<ArrowRight size={15}/></Link><Link href={`/vehicles/${vehicle.id}#documents`}><FileText size={16}/>Upload receipt<ArrowRight size={15}/></Link><Link href="/shops"><MapPin size={16}/>Repair shops<ArrowRight size={15}/></Link><Link href={`/vehicles/${vehicle.id}`}><ArrowRight size={16}/>Vehicle details<ArrowRight size={15}/></Link></section>
      </aside>
    </section>
  </AppShell>;
}

function PlannerRow({icon:Icon,tone,label,value,href,action}:{icon:React.ComponentType<{size?:number}>;tone:"amber"|"orange";label:string;value:string;href:string;action:string}){return <article className={`planner-row planner-${tone}`}><span className="planner-icon"><Icon size={21}/></span><div><p>{label}</p><h3>{value}</h3></div><Link href={href}>{action}<ArrowRight size={16}/></Link></article>}

function RepairRibbon({status,title,vehicleId,caseId}:{status:RepairCaseStatus|null;title?:string;vehicleId:string;caseId?:string}){
  const current=status?getRepairJourneyStep(status):-1;
  const stepIcons=[AlertTriangle,Store,FileText,Wrench,Receipt];
  return <section className="repair-ribbon" aria-label="Connected repair journey" data-tour="journey">
    <div className="repair-ribbon-title"><span>{status?repairCaseLabels[status]:"Repair journey"}</span><strong>{title??"No active repair journey"}</strong></div>
    <ol>{repairJourneySteps.map((step,index)=>{const StepIcon=stepIcons[index]??Gauge;const complete=status==="completed"||index<current;const active=index===current&&status!=="completed";return <li className={complete?"complete":active?"active":""} key={step}><span>{complete?<Check size={14}/>:<StepIcon size={14}/>}</span><small>{step}</small></li>})}</ol>
    <Link href={caseId?`/vehicles/${vehicleId}/repairs/${caseId}`:`/vehicles/${vehicleId}/symptoms/new`}>{caseId?"Open journey":"Start with a symptom"}<ArrowRight size={15}/></Link>
  </section>;
}

function VehicleSwitcher({vehicles,selected}:{vehicles:VehicleRecord[];selected:VehicleRecord}){return <details className="vehicle-switcher relative mt-5 w-fit"><summary className="flex min-h-11 cursor-pointer items-center gap-2 rounded-lg px-3 text-sm font-semibold">Switch vehicle <ChevronDown size={16}/></summary><div className="vehicle-switcher-menu">{vehicles.map(vehicle=>{const active=vehicle.id===selected.id;return <Link className={active?"active":""} href={`/dashboard?vehicle=${vehicle.id}`} aria-current={active?"true":undefined} key={vehicle.id}><span>{vehicle.year} {vehicle.make} {vehicle.model}</span>{active&&<Check size={16}/>}</Link>})}</div></details>}

function OverviewRow({icon:Icon,label,value}:{icon:React.ComponentType<{size?:number}>;label:string;value:string}){return <div><Icon size={17}/><dt>{label}</dt><dd>{value}</dd></div>}
