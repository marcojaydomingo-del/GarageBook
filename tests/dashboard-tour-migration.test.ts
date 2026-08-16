import { readFileSync } from "node:fs";
import { describe,expect,it } from "vitest";

const migration=readFileSync(new URL("../supabase/migrations/202608150005_dashboard_tour.sql",import.meta.url),"utf8");
const initialSchema=readFileSync(new URL("../supabase/migrations/202608080001_initial_schema.sql",import.meta.url),"utf8");

describe("dashboard tour migration",()=>{
  it("stores a non-negative version on the owner-scoped profile",()=>{
    expect(migration).toMatch(/add column if not exists dashboard_tour_version smallint not null default 0/i);
    expect(migration).toMatch(/check \(dashboard_tour_version >= 0\)/i);
    expect(initialSchema).toMatch(/profiles_owner[\s\S]*using \(id = auth\.uid\(\)\)[\s\S]*with check \(id = auth\.uid\(\)\)/i);
  });
});
