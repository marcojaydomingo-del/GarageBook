import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { EstimateForm } from "@/components/estimate-form";
import { PageHeader } from "@/components/page-header";
import { getEstimate, getRepairCase, getShops, getVehicle } from "@/lib/data/garage";
import type { EstimateFields } from "@/lib/validation";

export default async function EditEstimatePage({params}:{params:Promise<{id:string;caseId:string;estimateId:string}>}) {
  const {id,caseId,estimateId}=await params;
  const [vehicle,repairCase,estimate,shops]=await Promise.all([getVehicle(id),getRepairCase(id,caseId),getEstimate(id,caseId,estimateId),getShops()]);
  if(!vehicle||!repairCase||!estimate||!(["draft","received"] as const).includes(estimate.status as "draft"|"received"))notFound();
  const initialValues:EstimateFields={shopId:estimate.shop_id,status:estimate.status as "draft"|"received",estimateDate:estimate.estimate_date??new Date().toISOString().slice(0,10),expiresAt:estimate.expires_at??"",notes:estimate.notes??"",items:estimate.items.map(item=>({description:item.description,category:item.category??"",partsCost:Number(item.parts_cost),laborCost:Number(item.labor_cost),quantity:Number(item.quantity)}))};
  return <AppShell vehicleId={id}><div className="mx-auto max-w-5xl"><PageHeader title="Edit repair estimate" description={`${repairCase.title} · ${vehicle.year} ${vehicle.make} ${vehicle.model}`}/><EstimateForm vehicleId={id} repairCaseId={caseId} estimateId={estimateId} shops={shops.map(({id:shopId,name})=>({id:shopId,name}))} initialValues={initialValues}/></div></AppShell>;
}
