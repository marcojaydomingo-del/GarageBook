import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { VehicleForm } from "@/components/forms";
import { PageHeader } from "@/components/page-header";
import { getVehicle } from "@/lib/data/garage";

export default async function EditVehiclePage({params}:{params:Promise<{id:string}>}){const {id}=await params;const vehicle=await getVehicle(id);if(!vehicle)notFound();return <AppShell vehicleId={id}><div className="mx-auto max-w-3xl"><PageHeader title="Edit vehicle details" description="Correct identifying details or update the current mileage."/><VehicleForm vehicle={{id:vehicle.id,year:vehicle.year,make:vehicle.make,model:vehicle.model,trim:vehicle.trim??"",mileage:vehicle.current_mileage,vin:vehicle.vin??"",color:vehicle.color??""}}/></div></AppShell>}
