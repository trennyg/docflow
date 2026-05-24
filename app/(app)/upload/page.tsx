import { requireUser } from "@/lib/server-auth";
import UploadFlow from "./UploadFlow";

export default async function UploadPage() {
  const { supabase, user, devMode } = await requireUser();

  const { data: files } = await supabase.storage
    .from("documents")
    .list(user.id, { search: "master_sheet.xlsx" });
  const hasMasterSheet = (files ?? []).some((f) => f.name === "master_sheet.xlsx");

  return <UploadFlow orgId={user.id} devMode={devMode} hasMasterSheet={hasMasterSheet} />;
}
