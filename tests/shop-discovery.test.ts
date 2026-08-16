import { describe, expect, it } from "vitest";
import { isSavedShop, normalizeGooglePlaces } from "../lib/domain/shop-discovery";

describe("shop discovery", () => {
  it("normalizes complete Google Places results and ignores unusable entries", () => {
    const result = normalizeGooglePlaces({ places: [
      { id: "place-1", displayName: { text: "Paceman Motor Works" }, formattedAddress: "123 Main St", location: { latitude: 34.1, longitude: -118.2 }, rating: 4.8 },
      { id: "missing-location", displayName: { text: "Incomplete Shop" } },
    ] });
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ googlePlaceId: "place-1", name: "Paceman Motor Works", latitude: 34.1, rating: 4.8 });
  });

  it("matches a saved shop by provider id or normalized name and address", () => {
    const place = { googlePlaceId: "place-1", name: "Paceman Motor Works", address: "123 Main St." };
    expect(isSavedShop(place, [{ googlePlaceId: "place-1", name: "Different", address: null }])).toBe(true);
    expect(isSavedShop(place, [{ googlePlaceId: null, name: "PACEMAN MOTOR WORKS", address: "123 Main St" }])).toBe(true);
  });
});
