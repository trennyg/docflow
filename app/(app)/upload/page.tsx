import { requireUser } from "@/lib/server-auth";
import UploadFlow from "./UploadFlow";

export default async function UploadPage() {
  const { user, devMode } = await requireUser();
  return <UploadFlow orgId={user.id} devMode={devMode} />;
}
