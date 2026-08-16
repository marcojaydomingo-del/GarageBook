import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isProtectedPath } from "@/lib/domain/ownership";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: { getAll: () => request.cookies.getAll(), setAll(cookies) { cookies.forEach(({ name, value }) => request.cookies.set(name, value)); response = NextResponse.next({ request }); cookies.forEach(({ name, value, options }) => response.cookies.set(name, value, options)); } },
  });
  const { data: { user } } = await supabase.auth.getUser();
  if (isProtectedPath(request.nextUrl.pathname) && !user) { const url = request.nextUrl.clone(); url.pathname = "/login"; url.searchParams.set("next", request.nextUrl.pathname); return NextResponse.redirect(url); }
  if (user && (request.nextUrl.pathname === "/login" || request.nextUrl.pathname === "/signup")) { const url = request.nextUrl.clone(); url.pathname = user.user_metadata.onboarding_completed===true?"/dashboard":"/onboarding"; return NextResponse.redirect(url); }
  return response;
}
