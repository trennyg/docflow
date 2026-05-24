import { requireUser } from "@/lib/server-auth";
import UploadFlow from "./UploadFlow";

export default async function UploadPage() {
  const { supabase, user, devMode } = await requireUser();

  const { data: org } = await supabase
    .from("organizations")
    .select("credits_used, credits_limit, addon_pages, has_master_sheet")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <UploadFlow
      orgId={user.id}
      devMode={devMode}
      hasMasterSheet={org?.has_master_sheet ?? false}
      creditsUsed={org?.credits_used ?? 0}
      creditsLimit={org?.credits_limit ?? 30}
      addonPages={org?.addon_pages ?? 0}
    />
  );
}
