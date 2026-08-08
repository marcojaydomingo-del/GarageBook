import { AppShell } from "@/components/app-shell";
import { MaintenanceForm } from "@/components/forms";
import { PageHeader } from "@/components/page-header";
export default function NewMaintenancePage(){return <AppShell><div className="mx-auto max-w-3xl"><PageHeader eyebrow="2014 MINI Cooper S Paceman" title="Add maintenance record" description="Record service, repairs, inspections, costs, and the shop that performed the work."/><MaintenanceForm/></div></AppShell>}
