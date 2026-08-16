import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { ShopPreferencesForm } from "@/components/forms";
import { PageHeader } from "@/components/page-header";
import { getShops, getVehicles } from "@/lib/data/garage";

export default async function EditShopPage({params}:{params:Promise<{id:string}>}){const {id}=await params;const [shops,vehicles]=await Promise.all([getShops(),getVehicles()]);const shop=shops.find(item=>item.id===id);if(!shop)notFound();return <AppShell vehicleId={vehicles[0]?.id}><div className="mx-auto max-w-3xl"><PageHeader title="Shop preferences" description="Update your private rating, preferred status, and notes."/><ShopPreferencesForm shop={shop}/></div></AppShell>}
