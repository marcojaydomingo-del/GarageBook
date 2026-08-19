const localMode = process.argv.includes("--local");

const required = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "NEXT_PUBLIC_SITE_URL",
  "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY",
  "GOOGLE_PLACES_API_KEY",
];

const missing = required.filter((name) => {
  const value = process.env[name]?.trim();
  return !value || /your-|example/i.test(value);
});

if (missing.length) {
  console.error(`Missing required Netlify environment variables: ${missing.join(", ")}`);
  process.exit(1);
}

const siteUrl = new URL(process.env.NEXT_PUBLIC_SITE_URL);
const supabaseUrl = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL);

if (!localMode && siteUrl.protocol !== "https:") {
  console.error("NEXT_PUBLIC_SITE_URL must use HTTPS for a Netlify deployment.");
  process.exit(1);
}

if (!localMode && (siteUrl.hostname === "localhost" || siteUrl.hostname === "127.0.0.1")) {
  console.error("NEXT_PUBLIC_SITE_URL must use the public Netlify hostname, not localhost.");
  process.exit(1);
}

if (supabaseUrl.protocol !== "https:") {
  console.error("NEXT_PUBLIC_SUPABASE_URL must use HTTPS.");
  process.exit(1);
}

if (siteUrl.pathname !== "/" || siteUrl.search || siteUrl.hash) {
  console.error("NEXT_PUBLIC_SITE_URL must be an origin only, without a path, query, or fragment.");
  process.exit(1);
}

if (process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY === process.env.GOOGLE_PLACES_API_KEY) {
  console.error("Use separate browser-restricted and server-restricted Google API keys.");
  process.exit(1);
}

console.log(`Netlify environment preflight passed for ${siteUrl.origin}.`);
