import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { DEV_USER_ID } from "@/lib/server-auth";
import { PLANS } from "@/lib/constants";

export async function POST() {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Not available" }, { status: 404 });
  }

  const supabase = createAdminClient();

  const { error } = await supabase.from("organizations").upsert(
    {
      id: DEV_USER_ID,
      email: "dev@docflow.test",
      name: "Dev Org",
      plan: "starter",
      credits_used: 3,
      credits_limit: PLANS.starter.limit,
      notify_on_complete: true,
    },
    { onConflict: "id", ignoreDuplicates: true }
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ orgId: DEV_USER_ID });
}
