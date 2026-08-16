import {describe,expect,it} from "vitest";
import {parseRecoverySessionFragment} from "../lib/domain/auth-recovery";

describe("password recovery fragment",()=>{
  it("accepts a complete Supabase recovery session",()=>{
    expect(parseRecoverySessionFragment("#access_token=access-123&refresh_token=refresh-456&type=recovery")).toEqual({accessToken:"access-123",refreshToken:"refresh-456"});
  });
  it("ignores ordinary auth fragments and incomplete recovery sessions",()=>{
    expect(parseRecoverySessionFragment("#access_token=x&type=signup")).toBeNull();
    expect(parseRecoverySessionFragment("#access_token=x&type=recovery")).toBeNull();
  });
});
