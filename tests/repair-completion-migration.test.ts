import { readFileSync } from "node:fs";
import { describe,expect,it } from "vitest";

const migration=readFileSync(new URL("../supabase/migrations/202608150001_repair_completion.sql",import.meta.url),"utf8");

describe("repair completion migration",()=>{
  it("adds optional invoice metadata without requiring warranty data",()=>{
    expect(migration).toContain("invoice_number");
    expect(migration).toContain("invoice_date");
    expect(migration).not.toContain("warranty_id");
  });
  it("requires an owner-matched repair record before completion",()=>{
    expect(migration).toContain("A completed repair record is required");
    expect(migration).toContain("mr.owner_id = new.owner_id");
    expect(migration).toContain("mr.record_type = 'repair'");
  });
});
