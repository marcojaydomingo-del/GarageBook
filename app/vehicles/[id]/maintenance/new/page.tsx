import { notFound } from "next/navigation";
import { z } from "zod";
import { AppShell } from "@/components/app-shell";
import { MaintenanceForm } from "@/components/forms";
import { PageHeader } from "@/components/page-header";
import { getRepairCase, getShops, getVehicle } from "@/lib/data/garage";

export default async function NewMaintenancePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ case?: string; onboarding?:string }>;
}) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const repairCaseId = query.case;
  const returnTo=query.onboarding==="1"?`/onboarding/complete?vehicle=${id}&added=maintenance`:undefined;
  if (repairCaseId && !z.string().uuid().safeParse(repairCaseId).success) notFound();
  const [vehicle, shops, repairCase] = await Promise.all([
    getVehicle(id),
    getShops(),
    repairCaseId ? getRepairCase(id, repairCaseId) : Promise.resolve(null),
  ]);
  if (!vehicle || (repairCaseId && !repairCase)) notFound();

  return (
    <AppShell vehicleId={id}>
      <div className="mx-auto max-w-3xl">
        <PageHeader
          eyebrow={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
          title={repairCase ? "Add repair record" : "Add maintenance record"}
          description={repairCase
            ? "Record the completed work and cost. This entry will become part of the connected repair journey."
            : "Record service, repairs, inspections, costs, and the shop that performed the work."}
        />
        <MaintenanceForm
          vehicleId={id}
          mileage={vehicle.current_mileage}
          shops={shops.map(({ id: shopId, name }) => ({ id: shopId, name }))}
          repairCaseId={repairCase?.id}
          repairCaseTitle={repairCase?.title}
          defaultShopId={repairCase?.shop_id??undefined}
          returnTo={returnTo}
        />
      </div>
    </AppShell>
  );
}
