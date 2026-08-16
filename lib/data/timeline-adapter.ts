import type { TimelineEvent } from "@/lib/types";

export interface MaintenanceTimelineRow { id:string; vehicle_id?:string; record_type:"maintenance"|"repair"|"inspection"; title:string; description:string|null; performed_at:string; mileage:number|null; cost:number|null; shops?:{name:string}|null }
export interface SymptomTimelineRow { id:string; vehicle_id?:string; title:string; description:string|null; first_noticed_at:string; mileage:number|null; status:"open"|"monitoring"|"resolved" }
export interface VisitTimelineRow { id:string; visited_at:string; mileage:number|null; purpose:string|null; notes:string|null; shops?:{name:string}|null }
export interface DocumentTimelineRow { id:string; uploaded_at:string; file_name:string; document_type:string }
export interface MileageTimelineRow { id:string; recorded_at:string; mileage:number; source:string }
export function buildTimeline(input:{maintenance:MaintenanceTimelineRow[];symptoms:SymptomTimelineRow[];visits:VisitTimelineRow[];documents:DocumentTimelineRow[];mileage:MileageTimelineRow[]}):TimelineEvent[]{
  const events:TimelineEvent[]=[
    ...input.maintenance.map((row)=>({id:`maintenance-${row.id}`,type:row.record_type==="repair"?"repair" as const:"maintenance" as const,title:row.title,date:row.performed_at,mileage:row.mileage??undefined,description:row.description??"Service record",cost:row.cost??undefined,status:"completed" as const,shop:row.shops?.name,href:row.vehicle_id?`/vehicles/${row.vehicle_id}/maintenance/${row.id}/edit`:undefined,actionLabel:"Edit record"})),
    ...input.symptoms.map((row)=>({id:`symptom-${row.id}`,type:"symptom" as const,title:row.title,date:row.first_noticed_at,mileage:row.mileage??undefined,description:row.description??"Symptom logged",status:row.status==="resolved"?"completed" as const:row.status,href:row.vehicle_id?`/vehicles/${row.vehicle_id}/symptoms/${row.id}/edit`:undefined,actionLabel:"Edit symptom"})),
    ...input.visits.map((row)=>({id:`visit-${row.id}`,type:"shop_visit" as const,title:row.purpose??"Shop visit",date:row.visited_at,mileage:row.mileage??undefined,description:row.notes??"Vehicle visited repair shop",shop:row.shops?.name,status:"completed" as const})),
    ...input.documents.map((row)=>({id:`document-${row.id}`,type:"document_upload" as const,title:`${row.document_type[0]?.toUpperCase()}${row.document_type.slice(1)} uploaded`,date:row.uploaded_at,description:row.file_name,status:"completed" as const,href:`/documents/${row.id}`,actionLabel:"View document"})),
    ...input.mileage.map((row)=>({id:`mileage-${row.id}`,type:"mileage_update" as const,title:"Mileage updated",date:row.recorded_at,mileage:row.mileage,description:`Recorded from ${row.source}`,status:"completed" as const})),
  ];
  return events.sort((a,b)=>new Date(b.date).getTime()-new Date(a.date).getTime());
}
