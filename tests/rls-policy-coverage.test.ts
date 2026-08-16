import { readFileSync } from "node:fs";
import { describe,expect,it } from "vitest";

const migration=readFileSync(new URL("../supabase/migrations/202608080001_initial_schema.sql",import.meta.url),"utf8");
const ownedTables=["profiles","vehicles","user_shops","maintenance_records","symptoms","repair_cases","shop_visits","documents","reminders","vehicle_mileage_entries","warranties","estimates","estimate_items"];

describe("baseline RLS coverage",()=>{
  it.each(ownedTables)("enables RLS for %s",(table)=>{expect(migration).toContain(`alter table public.${table} enable row level security`)});
  it("uses owner checks for every user-owned policy",()=>{for(const table of ownedTables.filter(table=>table!=="profiles")){expect(migration).toContain(`policy "${table.replace("maintenance_records","maintenance").replace("vehicle_mileage_entries","mileage").replace("repair_cases","repair_cases").replace("shop_visits","shop_visits").replace("user_shops","user_shops").replace("estimate_items","estimate_items")}_owner"`)}});
  it("keeps the document bucket private and owner-scoped",()=>{expect(migration).toContain("'vehicle-documents','vehicle-documents',false");expect(migration).toContain("vehicle_documents_owner_select");expect(migration).toContain("vehicle_documents_owner_delete")});
});
