import { requireUser } from "@/lib/server-auth";
import UploadFlow from "./UploadFlow";

export default async function UploadPage() {
  const { supabase, user, devMode } = await requireUser();

  const [orgResult, storageResult] = await Promise.all([
    supabase
      .from("organizations")
      .select("credits_used, credits_limit, addon_pages")
      .eq("id", user.id)
      .maybeSingle(),
    supabase.storage
      .from("documents")
      .list(user.id, { search: "master_sheet.xlsx" }),
  ]);

  const hasMasterSheet = (storageResult.data ?? []).some(
    (f) => f.name === "master_sheet.xlsx"
  );
  const creditsUsed = orgResult.data?.credits_used ?? 0;
  const creditsLimit = orgResult.data?.credits_limit ?? 30;
  const addonPages = orgResult.data?.addon_pages ?? 0;

  return (
    <UploadFlow
      orgId={user.id}
      devMode={devMode}
      hasMasterSheet={hasMasterSheet}
      creditsUsed={creditsUsed}
      creditsLimit={creditsLimit}
      addonPages={addonPages}
    />
  );
}
