import { headers } from "next/headers";

function normalizeOrigin(value: string | undefined) {
  if (!value) return undefined;

  try {
    return new URL(value).origin;
  } catch {
    return undefined;
  }
}

function isLocalOrigin(origin: string) {
  const hostname = new URL(origin).hostname;
  return hostname === "localhost" || hostname === "127.0.0.1";
}

/**
 * Returns the public origin used in authentication emails.
 *
 * A deployed request must never inherit a localhost URL from a copied local
 * environment file. The configured production origin remains authoritative;
 * otherwise Netlify's forwarded request headers provide the current origin.
 */
export async function getAuthSiteOrigin() {
  const requestHeaders = await headers();
  const forwardedHost = requestHeaders.get("x-forwarded-host")?.split(",")[0]?.trim();
  const host = forwardedHost ?? requestHeaders.get("host")?.split(",")[0]?.trim();
  const forwardedProtocol = requestHeaders.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const protocol = forwardedProtocol ?? (host?.startsWith("localhost") || host?.startsWith("127.0.0.1") ? "http" : "https");
  const requestOrigin = normalizeOrigin(host ? `${protocol}://${host}` : undefined);
  const configuredOrigin = normalizeOrigin(process.env.NEXT_PUBLIC_SITE_URL);

  if (configuredOrigin && (!isLocalOrigin(configuredOrigin) || !requestOrigin || isLocalOrigin(requestOrigin))) {
    return configuredOrigin;
  }

  return requestOrigin ?? "http://localhost:3000";
}
