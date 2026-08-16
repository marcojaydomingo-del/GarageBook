export type VehicleHistoryTone="service"|"complete"|"attention"|"document"|"neutral";

export interface VehicleHistoryEvent{
  id:string;
  title:string;
  label:string;
  date:string;
  detail?:string;
  mileage?:number|null;
  tone:VehicleHistoryTone;
}

interface MaintenanceRow{id:string;title:string;record_type:string;performed_at:string;mileage:number|null;cost:number|null}
interface SymptomRow{id:string;title:string;status:string;first_noticed_at:string;mileage:number|null;severity:string}
interface DocumentRow{id:string;file_name:string;document_type:string;uploaded_at:string}
interface MileageRow{id:string;mileage:number;recorded_at:string;source:string}

export function buildVehicleHistory({maintenance,symptoms,documents,mileage}:{maintenance:MaintenanceRow[];symptoms:SymptomRow[];documents:DocumentRow[];mileage:MileageRow[]}):VehicleHistoryEvent[]{
  const events:VehicleHistoryEvent[]=[
    ...maintenance.map(record=>({
      id:`maintenance-${record.id}`,
      title:record.title,
      label:record.record_type==="repair"?"Repair":record.record_type==="inspection"?"Inspection":"Maintenance",
      date:record.performed_at,
      detail:record.cost===null?undefined:`$${Number(record.cost).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}`,
      mileage:record.mileage,
      tone:(record.record_type==="repair"?"complete":"service") as VehicleHistoryTone,
    })),
    ...symptoms.map(symptom=>({
      id:`symptom-${symptom.id}`,
      title:symptom.title,
      label:symptom.status==="resolved"?"Resolved symptom":"Symptom",
      date:symptom.first_noticed_at,
      detail:`${capitalize(symptom.severity)} severity · ${capitalize(symptom.status)}`,
      mileage:symptom.mileage,
      tone:(symptom.status==="resolved"?"complete":"attention") as VehicleHistoryTone,
    })),
    ...documents.map(document=>({
      id:`document-${document.id}`,
      title:document.file_name,
      label:capitalize(document.document_type),
      date:document.uploaded_at,
      tone:"document" as const,
    })),
    ...mileage.map(entry=>({
      id:`mileage-${entry.id}`,
      title:"Mileage updated",
      label:"Mileage",
      date:entry.recorded_at,
      detail:`${entry.mileage.toLocaleString()} miles · ${capitalize(entry.source)}`,
      mileage:entry.mileage,
      tone:"neutral" as const,
    })),
  ];
  return events.sort((a,b)=>Date.parse(b.date)-Date.parse(a.date));
}

export function formatHistoryDate(value:string){
  return new Intl.DateTimeFormat(undefined,{month:"short",day:"numeric",year:"numeric"}).format(new Date(value));
}

function capitalize(value:string){return value.charAt(0).toUpperCase()+value.slice(1).replaceAll("_"," ")}
