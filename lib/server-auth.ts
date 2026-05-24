import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const DEV_USER_ID = "00000000-0000-0000-0000-000000000001";
const DEV_USER_EMAIL = "dev@test.local";

/**
 * Returns the authenticated user + a Supabase client scoped to that user.
 * In development, if the dev_bypass cookie is set, returns a mock user instead
 * of requiring a real Supabase session. Never active in production.
 */
export async function requireUser() {
  const supabase = createClient();

  if (process.env.NODE_ENV === "development") {
    const cookieStore = cookies();
    if (cookieStore.get("dev_bypass")?.value === "true") {
      const orgId = cookieStore.get("dev_org_id")?.value ?? DEV_USER_ID;
      return {
        supabase: createAdminClient(),
        user: { id: orgId, email: DEV_USER_EMAIL as string | undefined },
        devMode: true as const,
      };
    }
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return {
    supabase,
    user: { id: user.id, email: user.email as string | undefined },
    devMode: false as const,
  };
}
