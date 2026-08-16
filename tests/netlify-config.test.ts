import { readFileSync } from "node:fs";
import { describe,expect,it } from "vitest";

const config=readFileSync(new URL("../netlify.toml",import.meta.url),"utf8");
const packageJson=JSON.parse(readFileSync(new URL("../package.json",import.meta.url),"utf8")) as {scripts?:Record<string,string>};

describe("Netlify configuration",()=>{
  it("uses the maintained automatic Next.js adapter configuration",()=>{
    expect(config).toMatch(/command = "npm run netlify:build"/);
    expect(config).toMatch(/publish = "\.next"/);
    expect(config).toMatch(/NODE_VERSION = "22"/);
    expect(config).not.toMatch(/@netlify\/plugin-nextjs|NEXT_PUBLIC_.*=/);
  });

  it("runs the environment preflight before the build",()=>{
    expect(packageJson.scripts?.["netlify:build"]).toBe("node scripts/netlify-preflight.mjs && next build --webpack");
  });
});
