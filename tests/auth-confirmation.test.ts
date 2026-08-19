import {describe,expect,it} from "vitest";
import {readFileSync} from "node:fs";
import {resolve} from "node:path";

describe("signup confirmation resend",()=>{
  const actions=readFileSync(resolve(process.cwd(),"app/auth/actions.ts"),"utf8");

  it("resends signup confirmation through the public callback",()=>{
    expect(actions).toContain('supabase.auth.resend({type:"signup"');
    expect(actions).toContain('emailRedirectTo:`${siteUrl}/auth/callback');
  });

  it("does not reveal whether an account exists",()=>{
    expect(actions).toContain("If an unconfirmed account exists for that email");
  });
});
