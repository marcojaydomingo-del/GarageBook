import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { MaintenanceForm } from "@/components/forms";
import { PageHeader } from "@/components/page-header";
import { getMaintenanceRecord, getShops, getVehicle } from "@/lib/data/garage";

export default async function EditMaintenancePage({params}:{params:Promise<{id:string;recordId:string}>}){const {id,recordId}=await params;const [vehicle,record,shops]=await Promise.all([getVehicle(id),getMaintenanceRecord(id,recordId),getShops()]);if(!vehicle||!record)notFound();return <AppShell vehicleId={id}><div className="mx-auto max-w-3xl"><PageHeader title="Edit maintenance record" description="Correct the documented work, date, mileage, cost, or shop without creating a duplicate history entry."/><MaintenanceForm vehicleId={id} mileage={vehicle.current_mileage} shops={shops.map(({id:shopId,name})=>({id:shopId,name}))} repairCaseTitle={record.repair_case_title??undefined} record={{id:record.id,type:record.record_type,title:record.title,date:record.performed_at,mileage:record.mileage??vehicle.current_mileage,shopId:record.shop_id??"",cost:Number(record.cost??0),notes:record.description??"",repairCaseId:record.repair_case_id??"",invoiceNumber:record.invoice_number??"",invoiceDate:record.invoice_date??""}}/></div></AppShell>}
