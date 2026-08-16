import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  new URL("../supabase/migrations/202608120001_repair_case_workflow.sql", import.meta.url),
  "utf8",
);

describe("repair case migration", () => {
  it("backfills unresolved symptoms and prevents duplicate cases", () => {
    expect(migration).toContain("repair_cases_symptom_unique_idx");
    expect(migration).toContain("where s.status <> 'resolved'");
    expect(migration).toContain("on_symptom_created_open_repair_case");
  });

  it("keeps stage changes owner-scoped and ordered", () => {
    expect(migration).toContain("rc.owner_id = auth.uid()");
    expect(migration).toContain("enforce_repair_case_status_transition");
    expect(migration).toContain("old.status = 'diagnosing' and new.status = 'estimated'");
    expect(migration).toContain("grant execute on function public.transition_repair_case");
  });
});
