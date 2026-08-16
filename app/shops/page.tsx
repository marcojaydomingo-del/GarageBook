import Link from "next/link";
import { MapPin, Pencil, Phone, Plus, Star, Wrench } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { EmptyState } from "@/components/states";
import { PageHeader } from "@/components/page-header";
import { ShopExplorer } from "@/components/shop-explorer";
import { getShops, getVehicles } from "@/lib/data/garage";

export default async function ShopsPage() {
  const [shops, vehicles] = await Promise.all([getShops(), getVehicles()]);
  return (
    <AppShell vehicleId={vehicles[0]?.id}>
      <PageHeader
        title="Repair shops"
        description="Find mechanics around you and keep a private shortlist connected to your vehicle history."
        actions={<Link className="btn btn-primary" href="/shops/new"><Plus size={16}/>Add repair shop</Link>}
      />
      <ShopExplorer
        apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY??""}
        savedShops={shops.map(({googlePlaceId,name,address})=>({googlePlaceId,name,address}))}
      />
      <div className="saved-shops-heading">
        <div><h2>My Shops</h2><p>Only the shops you save appear here and in your repair records.</p></div>
        <span>{shops.length} saved</span>
      </div>
      {shops.length ? (
        <div className="saved-shops-grid">
          {shops.map((shop) => (
            <article className="saved-shop" key={shop.id}>
              <div className="flex justify-between gap-4">
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-[#e7f3f0] text-teal"><Wrench size={20}/></span>
                {shop.preferred && <span className="status status-good h-fit"><Star className="mr-1" size={12}/>Preferred</span>}
              </div>
              <h3 className="mt-5 text-lg font-semibold">{shop.name}</h3>
              <p className="mt-1 text-sm text-muted">{shop.specialty ?? "General automotive service"}</p>
              <div className="mt-5 space-y-2 text-sm text-muted">
                {shop.address && <p className="flex gap-2"><MapPin className="mt-0.5 shrink-0" size={16}/>{shop.address}</p>}
                {shop.phone && <p className="flex gap-2"><Phone className="mt-0.5 shrink-0" size={16}/>{shop.phone}</p>}
              </div>
              {shop.privateNotes && <p className="mt-5 border-t pt-4 text-sm text-muted">Private note: {shop.privateNotes}</p>}
              <div className="saved-shop-actions"><Link className="btn btn-secondary" href={`/shops/${shop.id}/edit`}><Pencil size={15}/>Edit preferences</Link>{shop.address&&<a className="btn btn-ghost" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(shop.address)}`} rel="noreferrer" target="_blank"><MapPin size={15}/>Directions</a>}</div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No repair shops saved"
          description="Add the first shop you use, then connect it to repair journeys and service records."
          action={<Link className="btn btn-primary" href="/shops/new"><Plus size={16}/>Add repair shop</Link>}
        />
      )}
    </AppShell>
  );
}
