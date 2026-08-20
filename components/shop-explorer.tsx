"use client";

import { importLibrary, setOptions } from "@googlemaps/js-api-loader";
import { ExternalLink, LocateFixed, Map as MapIcon, MapPin, Phone, Search, Star, Wrench } from "lucide-react";
import { FormEvent, useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveDiscoveredShop } from "@/app/actions";
import { isSavedShop, type DiscoveredShop } from "@/lib/domain/shop-discovery";

interface SavedShopSummary { googlePlaceId: string | null; name: string; address: string | null }
interface SearchResponse { shops?: DiscoveredShop[]; error?: string }
type SearchInput = { query: string; radiusMiles: number } | { latitude: number; longitude: number; radiusMiles: number };

let mapsPromise: Promise<[google.maps.MapsLibrary, google.maps.MarkerLibrary]> | null = null;
function loadGoogleMaps(key: string) {
  if (!mapsPromise) {
    setOptions({ key, v: "weekly" });
    mapsPromise = Promise.all([importLibrary("maps"), importLibrary("marker")]);
  }
  return mapsPromise;
}

export function ShopExplorer({ apiKey, savedShops }: { apiKey: string; savedShops: SavedShopSummary[] }) {
  const router = useRouter();
  const mapElement = useRef<HTMLDivElement>(null);
  const map = useRef<google.maps.Map | null>(null);
  const markers = useRef<google.maps.Marker[]>([]);
  const [mapReady, setMapReady] = useState(false);
  const [query, setQuery] = useState(savedShops[0]?.address ?? "");
  const [radiusMiles, setRadiusMiles] = useState(10);
  const [shops, setShops] = useState<DiscoveredShop[]>([]);
  const [selectedId, setSelectedId] = useState<string>();
  const [error, setError] = useState<string>();
  const [notice, setNotice] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [mobileView, setMobileView] = useState<"list" | "map">("list");
  const [savingId, startSaving] = useTransition();

  const runSearch = useCallback(async (input: SearchInput) => {
    setLoading(true); setError(undefined); setNotice(undefined);
    try {
      const response = await fetch("/api/shops/search", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) });
      const payload = await response.json() as SearchResponse;
      if (!response.ok || !payload.shops) throw new Error(payload.error ?? "Nearby shops could not be loaded.");
      setShops(payload.shops); setSelectedId(payload.shops[0]?.googlePlaceId);
      if (!payload.shops.length) setNotice("No repair shops were found here. Try a nearby city or a wider radius.");
    } catch (searchError) {
      setShops([]); setError(searchError instanceof Error ? searchError.message : "Nearby shops could not be loaded.");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (!apiKey || !mapElement.current || !shops.length || map.current) return;
    let active = true;
    loadGoogleMaps(apiKey).then(([{ Map }]) => {
      if (!active || !mapElement.current) return;
      map.current = new Map(mapElement.current, {
        center: { lat: 34.0522, lng: -118.2437 }, zoom: 10, mapTypeControl: false, streetViewControl: false,
        fullscreenControl: false, clickableIcons: false,
        styles: [{ featureType: "poi.business", stylers: [{ visibility: "off" }] }],
      });
      setMapReady(true);
    }).catch(() => setError("The map could not load. Check the browser key’s website and Maps JavaScript API restrictions."));
    return () => { active = false; };
  }, [apiKey, shops.length]);

  useEffect(() => {
    if (!mapReady || !map.current) return;
    markers.current.forEach((marker) => marker.setMap(null));
    markers.current = [];
    if (!shops.length) return;
    const bounds = new google.maps.LatLngBounds();
    shops.forEach((shop, index) => {
      const saved = isSavedShop(shop, savedShops);
      const marker = new google.maps.Marker({
        map: map.current, position: { lat: shop.latitude, lng: shop.longitude }, title: shop.name,
        label: { text: saved ? "✓" : String(index + 1), color: saved ? "#ffffff" : "#191c1d", fontWeight: "700", fontSize: "12px" },
        icon: { path: google.maps.SymbolPath.CIRCLE, fillColor: saved ? "#14897f" : "#f3bd3d", fillOpacity: 1, strokeColor: "#fffdf9", strokeWeight: 2, scale: saved ? 15 : 13 },
      });
      marker.addListener("click", () => { setSelectedId(shop.googlePlaceId); setMobileView("list"); });
      markers.current.push(marker); bounds.extend(marker.getPosition()!);
    });
    map.current.fitBounds(bounds, 58);
    google.maps.event.addListenerOnce(map.current, "idle", () => { if ((map.current?.getZoom() ?? 0) > 15) map.current?.setZoom(15); });
  }, [mapReady, shops, savedShops]);

  useEffect(() => {
    if (!mapReady || mobileView !== "map") return;
    const timer = window.setTimeout(() => {
      if (!map.current) return;
      google.maps.event.trigger(map.current, "resize");
      const selected = shops.find((shop) => shop.googlePlaceId === selectedId);
      if (selected) map.current.panTo({ lat: selected.latitude, lng: selected.longitude });
    }, 0);
    return () => window.clearTimeout(timer);
  }, [mapReady, mobileView, selectedId, shops]);

  function submitSearch(event: FormEvent) {
    event.preventDefault();
    if (query.trim().length < 2) { setError("Enter a city, ZIP code, or address."); return; }
    void runSearch({ query, radiusMiles });
  }
  function useCurrentLocation() {
    setError(undefined); setNotice("Waiting for your browser’s location permission…");
    if (!navigator.geolocation) { setError("This browser does not support location access. Search by ZIP code instead."); return; }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => { setNotice(undefined); void runSearch({ latitude: coords.latitude, longitude: coords.longitude, radiusMiles }); },
      () => { setNotice(undefined); setError("Location access was not granted. Search by city, ZIP code, or address instead."); },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
    );
  }
  function saveShop(shop: DiscoveredShop) {
    startSaving(async () => {
      const result = await saveDiscoveredShop(shop);
      setError(result.error); setNotice(result.success);
      if (result.success) router.refresh();
    });
  }

  const selected = shops.find((shop) => shop.googlePlaceId === selectedId);
  return <section className="shop-explorer" aria-labelledby="find-shops-heading">
    <div className="shop-search-bar">
      <div><h2 id="find-shops-heading">Find a mechanic nearby</h2><p>Search Google Maps, compare the area, then save only the shops you want in OTTOKO.</p></div>
      <form onSubmit={submitSearch}>
        <label className="sr-only" htmlFor="shop-location">City, ZIP code, or address</label>
        <span className="shop-search-input"><Search aria-hidden="true" size={17}/><input id="shop-location" value={query} onChange={(event)=>setQuery(event.target.value)} placeholder="City, ZIP code, or address"/></span>
        <label className="sr-only" htmlFor="shop-radius">Search radius</label>
        <select id="shop-radius" value={radiusMiles} onChange={(event)=>setRadiusMiles(Number(event.target.value))}>
          <option value={5}>5 miles</option><option value={10}>10 miles</option><option value={25}>25 miles</option>
        </select>
        <button className="btn btn-primary" disabled={loading} type="submit">{loading ? "Searching…" : "Search area"}</button>
      </form>
      <button className="btn btn-secondary shop-location-button" onClick={useCurrentLocation} type="button"><LocateFixed size={16}/>Use my location</button>
    </div>
    {(error||notice)&&<div className={error?"shop-message shop-message-error":"shop-message"} role={error?"alert":"status"}>{error??notice}</div>}
    <div className="shop-view-toggle" aria-label="Nearby shops view"><button aria-pressed={mobileView==="list"} onClick={()=>setMobileView("list")} type="button"><Wrench size={15}/>List</button><button aria-pressed={mobileView==="map"} onClick={()=>setMobileView("map")} type="button"><MapIcon size={15}/>Map</button></div>
    <div className="shop-discovery-layout">
      <div className={`shop-results ${mobileView==="map"?"shop-mobile-hidden":""}`}>
        <div className="shop-results-heading"><strong>{loading?"Searching…":shops.length?`${shops.length} shops nearby`:"Nearby results"}</strong><span>{savedShops.length} in My Shops</span></div>
        {!loading&&!shops.length&&!error&&<div className="shop-results-empty"><MapPin size={22}/><strong>Choose where to search</strong><p>Use your location or enter a city, ZIP code, or address.</p></div>}
        {shops.map((shop,index)=>{
          const saved=isSavedShop(shop,savedShops); const active=selectedId===shop.googlePlaceId;
          return <article className={`shop-result ${active?"shop-result-active":""}`} key={shop.googlePlaceId}>
            <button aria-label={`Show ${shop.name} on map`} className="shop-result-main" onClick={()=>setSelectedId(shop.googlePlaceId)} type="button">
              <span className={saved?"shop-pin shop-pin-saved":"shop-pin"}>{saved?"✓":index+1}</span>
              <span><strong>{shop.name}</strong><small>{shop.specialty??"Auto repair"}</small><small>{shop.address}</small></span>
            </button>
            <div className="shop-result-meta">{shop.rating&&<span><Star fill="currentColor" size={12}/>{shop.rating} {shop.ratingCount&&<small>({shop.ratingCount})</small>}</span>}{shop.openNow!==null&&<span className={shop.openNow?"shop-open":"shop-closed"}>{shop.openNow?"Open now":"Closed"}</span>}{saved&&<span className="shop-saved-label">Saved</span>}</div>
            {active&&<div className="shop-result-actions">
              {shop.phone&&<a href={`tel:${shop.phone}`}><Phone size={14}/>Call</a>}
              {shop.mapsUrl&&<a href={shop.mapsUrl} rel="noreferrer" target="_blank"><MapPin size={14}/>Directions</a>}
              {shop.website&&<a href={shop.website} rel="noreferrer" target="_blank"><ExternalLink size={14}/>Website</a>}
              {!saved&&<button disabled={savingId} onClick={(event)=>{event.stopPropagation();saveShop(shop)}} type="button">{savingId?"Saving…":"Save to My Shops"}</button>}
            </div>}
          </article>;
        })}
      </div>
      <div className={`shop-map-wrap ${mobileView==="list"?"shop-mobile-hidden":""}`}>
        <div className="shop-map" ref={mapElement}/>
        {!apiKey&&<div className="shop-map-overlay"><strong>Map setup needed</strong><p>Add the browser map key to `.env.local`, then restart OTTOKO.</p></div>}
        {apiKey&&!shops.length&&<div className="shop-map-overlay shop-map-idle"><MapIcon size={24}/><strong>Map appears after your search</strong><p>Enter a location or use your current location to find nearby repair shops.</p></div>}
        {selected&&<div className="shop-map-selection"><span>{isSavedShop(selected,savedShops)?"In My Shops":"Selected shop"}</span><strong>{selected.name}</strong><small>{selected.address}</small></div>}
        <small className="shop-map-credit">Shop data from Google Maps</small>
      </div>
    </div>
  </section>;
}
