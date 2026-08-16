import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { SymptomForm } from "@/components/forms";
import { PageHeader } from "@/components/page-header";
import { getSymptom, getVehicle } from "@/lib/data/garage";

export default async function EditSymptomPage({params}:{params:Promise<{id:string;symptomId:string}>}){const {id,symptomId}=await params;const [vehicle,symptom]=await Promise.all([getVehicle(id),getSymptom(id,symptomId)]);if(!vehicle||!symptom)notFound();return <AppShell vehicleId={id}><div className="mx-auto max-w-3xl"><PageHeader title="Edit symptom" description="Correct what you observed while preserving its connected repair journey."/><SymptomForm vehicleId={id} mileage={vehicle.current_mileage} symptom={{id:symptom.id,title:symptom.title,firstNoticed:symptom.first_noticed_at,mileage:symptom.mileage??vehicle.current_mileage,severity:symptom.severity,frequency:symptom.frequency,description:symptom.description??"",warningLight:symptom.warning_light}}/></div></AppShell>}
