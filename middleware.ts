import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const { supabaseResponse, user, supabase } = await updateSession(request);

  const { pathname } = request.nextUrl;

  // Dev bypass: skip all auth logic when cookie is present (development only)
  if (
    process.env.NODE_ENV === "development" &&
    request.cookies.get("dev_bypass")?.value === "true"
  ) {
    return supabaseResponse;
  }

  // Auth guard: protect all app routes (route group (app) strips the /app prefix)
  const isAppRoute = /^\/(dashboard|upload|jobs|billing|settings)(\/|$)/.test(pathname);
  if (isAppRoute && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Skip login/verify if already authenticated
  if ((pathname === "/login" || pathname === "/verify") && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // Usage limit check: block access to /upload when at limit
  if (pathname === "/upload" && user) {
    const { data: org } = await supabase
      .from("organizations")
      .select("credits_used, credits_limit")
      .eq("id", user.id)
      .maybeSingle();

    const atLimit =
      org &&
      org.credits_limit !== -1 &&
      org.credits_used >= org.credits_limit;

    if (atLimit) {
      const url = request.nextUrl.clone();
      url.pathname = "/billing";
      url.searchParams.set("upgrade", "1");
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
