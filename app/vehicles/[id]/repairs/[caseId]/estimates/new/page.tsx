import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { EstimateForm } from "@/components/estimate-form";
import { PageHeader } from "@/components/page-header";
import { getRepairCase, getShops, getVehicle } from "@/lib/data/garage";

export default async function NewEstimatePage({params}:{params:Promise<{id:string;caseId:string}>}) {
  const {id,caseId}=await params;
  const [vehicle,repairCase,shops]=await Promise.all([getVehicle(id),getRepairCase(id,caseId),getShops()]);
  if(!vehicle||!repairCase)notFound();
  return <AppShell vehicleId={id}><div className="mx-auto max-w-5xl"><PageHeader title="Add repair estimate" description={`${repairCase.title} · ${vehicle.year} ${vehicle.make} ${vehicle.model}`}/><EstimateForm vehicleId={id} repairCaseId={caseId} shops={shops.map(({id:shopId,name})=>({id:shopId,name}))}/></div></AppShell>;
}
