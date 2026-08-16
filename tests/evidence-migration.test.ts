import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  new URL("../supabase/migrations/202608120002_repair_case_evidence.sql", import.meta.url),
  "utf8",
);

describe("repair evidence migration", () => {
  it("creates the shop function with an authenticated owner boundary", () => {
    expect(migration).toContain("security definer");
    expect(migration).toContain("auth.uid()");
    expect(migration).toContain("insert into public.user_shops (owner_id, shop_id)");
  });

  it("does not expose execution to anonymous callers", () => {
    expect(migration).toContain("revoke all on function public.create_user_shop");
    expect(migration).toContain("grant execute on function public.create_user_shop");
    expect(migration).toContain("to authenticated");
  });
});
