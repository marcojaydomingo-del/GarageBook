import { AppShell } from "@/components/app-shell";
import { ShopForm } from "@/components/forms";
import { PageHeader } from "@/components/page-header";
import { getVehicles } from "@/lib/data/garage";

export default async function NewShopPage({searchParams}:{searchParams:Promise<{returnTo?:string}>}) {
  const [{returnTo},vehicles]=await Promise.all([searchParams,getVehicles()]);
  return <AppShell vehicleId={vehicles[0]?.id}><div className="mx-auto max-w-3xl"><PageHeader title="Add a repair shop" description="Save a shop once, then connect it to repair cases and maintenance records."/><ShopForm returnTo={returnTo}/></div></AppShell>;
}
