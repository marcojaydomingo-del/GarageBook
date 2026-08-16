import { AppShell } from "@/components/app-shell";
import { SymptomForm } from "@/components/forms";
import { PageHeader } from "@/components/page-header";
import { getVehicle } from "@/lib/data/garage";
import { notFound } from "next/navigation";
export default async function NewSymptomPage({params,searchParams}:{params:Promise<{id:string}>;searchParams:Promise<{onboarding?:string}>}){const [{id},query]=await Promise.all([params,searchParams]);const vehicle=await getVehicle(id);if(!vehicle)notFound();const returnTo=query.onboarding==="1"?`/onboarding/complete?vehicle=${id}&added=symptom`:undefined;return <AppShell vehicleId={id}><div className="mx-auto max-w-3xl"><PageHeader eyebrow={`${vehicle.year} ${vehicle.make} ${vehicle.model}`} title="Log a symptom" description="Capture what you notice before a repair. This becomes the beginning of a traceable repair case."/><SymptomForm vehicleId={id} mileage={vehicle.current_mileage} returnTo={returnTo}/></div></AppShell>}
