import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { VehicleForm } from "@/components/forms";
export default function NewVehiclePage(){return <AppShell><div className="mx-auto max-w-3xl"><PageHeader eyebrow="My garage" title="Add a vehicle" description="Start with the basics. You can add documents, service history, and more afterward."/><VehicleForm/></div></AppShell>}
