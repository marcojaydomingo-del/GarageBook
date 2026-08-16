import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(new URL("../supabase/migrations/202608150004_shop_discovery.sql", import.meta.url), "utf8");

describe("shop discovery migration", () => {
  it("keeps shared place data behind an authenticated owner relationship", () => {
    expect(migration).toContain("security definer");
    expect(migration).toContain("auth.uid()");
    expect(migration).toContain("insert into public.user_shops (owner_id, shop_id)");
  });

  it("does not expose the save function to anonymous callers", () => {
    expect(migration).toContain("revoke all on function public.save_discovered_shop");
    expect(migration).toContain("grant execute on function public.save_discovered_shop");
    expect(migration).toContain("to authenticated");
  });
});
