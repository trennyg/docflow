import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import UploadFlow from "./UploadFlow";

export default async function UploadPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return <UploadFlow orgId={user.id} />;
}
