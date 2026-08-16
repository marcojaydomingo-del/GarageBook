import { NextResponse } from "next/server";
import { normalizeGooglePlaces, shopSearchSchema } from "@/lib/domain/shop-discovery";
import { createClient } from "@/lib/supabase/server";

const fieldMask = [
  "places.id", "places.displayName", "places.primaryTypeDisplayName", "places.formattedAddress", "places.location",
  "places.nationalPhoneNumber", "places.websiteUri", "places.googleMapsUri", "places.rating",
  "places.userRatingCount", "places.regularOpeningHours.openNow",
].join(",");

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in to search for repair shops." }, { status: 401 });
  const key = process.env.GOOGLE_PLACES_API_KEY;
  if (!key) return NextResponse.json({ error: "Nearby shop search has not been configured yet." }, { status: 503 });

  const parsed = shopSearchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Enter a location or allow location access to search nearby." }, { status: 400 });
  let endpoint: string;
  let body: object;
  if ("latitude" in parsed.data) {
    endpoint = "https://places.googleapis.com/v1/places:searchNearby";
    body = {
      includedTypes: ["car_repair"], maxResultCount: 20, rankPreference: "DISTANCE",
      locationRestriction: { circle: {
        center: { latitude: parsed.data.latitude, longitude: parsed.data.longitude },
        radius: Math.round(parsed.data.radiusMiles * 1609.344),
      } },
    };
  } else {
    endpoint = "https://places.googleapis.com/v1/places:searchText";
    body = { textQuery: `auto repair shops near ${parsed.data.query}`, maxResultCount: 20 };
  }

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Goog-Api-Key": key, "X-Goog-FieldMask": fieldMask },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    if (!response.ok) {
      const error = response.status === 403
        ? "Google Places rejected this request. Check that Places API (New), billing, and the server key restriction are active."
        : "Nearby shops could not be loaded. Try another location.";
      return NextResponse.json({ error }, { status: 502 });
    }
    return NextResponse.json({ shops: normalizeGooglePlaces(await response.json()) }, { headers: { "Cache-Control": "private, no-store" } });
  } catch {
    return NextResponse.json({ error: "GarageBook could not reach the shop directory. Try again." }, { status: 502 });
  }
}
