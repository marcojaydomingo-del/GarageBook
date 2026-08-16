import { z } from "zod";

export const shopSearchSchema = z.union([
  z.object({ query: z.string().trim().min(2).max(180), radiusMiles: z.number().min(1).max(25).default(10) }),
  z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    radiusMiles: z.number().min(1).max(25).default(10),
  }),
]);

export const discoveredShopSchema = z.object({
  googlePlaceId: z.string().trim().min(1).max(300),
  name: z.string().trim().min(2).max(160),
  specialty: z.string().trim().max(160).nullable(),
  address: z.string().trim().max(300).nullable(),
  phone: z.string().trim().max(40).nullable(),
  website: z.string().url().max(500).nullable(),
});

export interface ShopCoordinates { latitude: number; longitude: number }
export interface DiscoveredShop extends ShopCoordinates {
  googlePlaceId: string;
  name: string;
  specialty: string | null;
  address: string | null;
  phone: string | null;
  website: string | null;
  mapsUrl: string | null;
  rating: number | null;
  ratingCount: number | null;
  openNow: boolean | null;
}

interface GooglePlace {
  id?: string;
  displayName?: { text?: string };
  primaryTypeDisplayName?: { text?: string };
  formattedAddress?: string;
  location?: { latitude?: number; longitude?: number };
  nationalPhoneNumber?: string;
  websiteUri?: string;
  googleMapsUri?: string;
  rating?: number;
  userRatingCount?: number;
  regularOpeningHours?: { openNow?: boolean };
}

export function normalizeGooglePlaces(input: unknown): DiscoveredShop[] {
  if (!input || typeof input !== "object" || !("places" in input) || !Array.isArray(input.places)) return [];
  return (input.places as GooglePlace[]).flatMap((place) => {
    const latitude = place.location?.latitude;
    const longitude = place.location?.longitude;
    const googlePlaceId = place.id;
    const name = place.displayName?.text;
    if (typeof latitude !== "number" || typeof longitude !== "number" || !googlePlaceId || !name) return [];
    return [{
      googlePlaceId,
      name,
      specialty: place.primaryTypeDisplayName?.text ?? null,
      address: place.formattedAddress ?? null,
      phone: place.nationalPhoneNumber ?? null,
      website: place.websiteUri ?? null,
      mapsUrl: place.googleMapsUri ?? null,
      rating: typeof place.rating === "number" ? place.rating : null,
      ratingCount: typeof place.userRatingCount === "number" ? place.userRatingCount : null,
      openNow: typeof place.regularOpeningHours?.openNow === "boolean" ? place.regularOpeningHours.openNow : null,
      latitude,
      longitude,
    }];
  });
}

export function isSavedShop(
  place: Pick<DiscoveredShop, "googlePlaceId" | "name" | "address">,
  saved: Array<{ googlePlaceId: string | null; name: string; address: string | null }>,
) {
  const normalized = (value: string | null) => value?.toLocaleLowerCase().replace(/[^a-z0-9]/g, "") ?? "";
  return saved.some((shop) => shop.googlePlaceId === place.googlePlaceId ||
    (normalized(shop.name) === normalized(place.name) && normalized(shop.address) === normalized(place.address)));
}
