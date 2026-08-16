import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration=readFileSync(new URL("../supabase/migrations/202608130001_structured_estimates.sql",import.meta.url),"utf8");

describe("structured estimates migration",()=>{
  it("keeps estimate writes owner scoped and approvals atomic",()=>{
    expect(migration).toContain("current_owner uuid := auth.uid()");
    expect(migration).toContain("estimates_one_approved_per_case_idx");
    expect(migration).toContain("decide_repair_estimate");
    expect(migration).toContain("update public.repair_cases set status = 'approved'");
  });
  it("locks decided history and requires estimate evidence for case stages",()=>{
    expect(migration).toContain("Decided estimates are locked");
    expect(migration).toContain("A received estimate is required");
    expect(migration).toContain("An approved estimate is required");
  });
  it("limits RPC execution to authenticated users",()=>{
    expect(migration).toContain("revoke all on function public.upsert_repair_estimate");
    expect(migration).toContain("grant execute on function public.decide_repair_estimate");
    expect(migration).toContain("to authenticated");
  });
});
