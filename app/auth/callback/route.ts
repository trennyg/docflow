import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { generateReferralCode } from "@/lib/referral";
import { PLANS } from "@/lib/constants";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(`${origin}/login`);
  }

  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    return NextResponse.redirect(`${origin}/login`);
  }

  const user = data.user;

  // Provision org row for new Google sign-ups (idempotent — skips if already exists)
  const { data: existingOrg } = await supabase
    .from("organizations")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (!existingOrg) {
    await supabase.from("organizations").insert({
      id: user.id,
      email: user.email,
      plan: "free",
      credits_used: 0,
      credits_limit: PLANS.free.limit,
      referral_code: generateReferralCode(),
      notify_on_complete: true,
    });
  }

  return NextResponse.redirect(`${origin}/dashboard`);
}
