import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { DEV_USER_ID } from "@/lib/server-auth";

async function enterDevMode() {
  "use server";
  if (process.env.NODE_ENV !== "development") return;

  const supabase = createClient();

  // Ensure the test org exists — safe to call repeatedly
  await supabase.from("organizations").upsert(
    {
      id: DEV_USER_ID,
      name: "Dev Org",
      plan: "starter",
      credits_used: 3,
      credits_limit: 100,
      notify_on_complete: true,
    },
    { onConflict: "id", ignoreDuplicates: true }
  );

  cookies().set("dev_bypass", "true", {
    path: "/",
    maxAge: 60 * 60 * 8, // 8 hours
    sameSite: "lax",
    httpOnly: false,
  });

  redirect("/dashboard");
}

export default function DevLoginPage() {
  if (process.env.NODE_ENV !== "development") notFound();

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
      <div className="bg-[#111111] border border-[#D97706]/30 rounded-xl p-8 max-w-sm w-full text-center space-y-5">
        <div className="space-y-1.5">
          <p className="text-[#D97706] text-xs font-mono uppercase tracking-wider">
            Development only
          </p>
          <h1 className="text-[#F9FAFB] font-semibold text-lg">Dev Login</h1>
          <p className="text-[#6B7280] text-sm leading-relaxed">
            Bypasses Supabase auth and creates a test organisation. Never
            available in production.
          </p>
        </div>
        <form action={enterDevMode}>
          <button
            type="submit"
            className="w-full bg-[#2563EB] hover:bg-blue-700 text-white py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
            Enter as Test User
          </button>
        </form>
      </div>
    </div>
  );
}
