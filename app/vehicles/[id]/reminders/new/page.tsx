import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { ReminderForm } from "@/components/reminder-form";
import { getVehicle } from "@/lib/data/garage";

export default async function NewReminderPage({ params,searchParams }: { params: Promise<{ id: string }>;searchParams:Promise<{onboarding?:string}> }) {
  const [{ id },query] = await Promise.all([params,searchParams]);
  const vehicle = await getVehicle(id);
  if (!vehicle) notFound();

  return <AppShell vehicleId={id}>
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Schedule service"
        description={`Set the next service reminder for your ${vehicle.year} ${vehicle.make} ${vehicle.model}.`}
      />
      <ReminderForm vehicleId={id} currentMileage={vehicle.current_mileage} returnTo={query.onboarding==="1"?`/onboarding/complete?vehicle=${id}&added=reminder`:undefined}/>
    </div>
  </AppShell>;
}
