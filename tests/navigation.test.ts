import { describe,expect,it } from "vitest";
import { safeInternalPath } from "../lib/domain/navigation";

describe("safe internal redirects",()=>{
  it("keeps valid application paths",()=>{expect(safeInternalPath("/vehicles/abc?tab=history")).toBe("/vehicles/abc?tab=history")});
  it("rejects external and protocol-relative redirects",()=>{expect(safeInternalPath("https://example.com")).toBe("/dashboard");expect(safeInternalPath("//example.com")).toBe("/dashboard")});
});
