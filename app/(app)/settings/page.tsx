import { requireUser } from "@/lib/server-auth";
import SettingsClient from "./SettingsClient";

export default async function SettingsPage() {
  const { supabase, user } = await requireUser();

  const { data: org } = await supabase
    .from("organizations")
    .select("name, notify_on_complete, referral_code")
    .eq("id", user.id)
    .maybeSingle();

  // Count how many orgs signed up using this referral code
  const { count: referredCount } = await supabase
    .from("organizations")
    .select("id", { count: "exact", head: true })
    .eq("referred_by", org?.referral_code ?? "__none__");

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-text-primary text-xl font-semibold">Settings</h1>
        <p className="text-text-muted text-sm mt-0.5">
          Manage your organisation and preferences
        </p>
      </div>

      <SettingsClient
        orgId={user.id}
        initialName={org?.name ?? ""}
        email={user.email ?? ""}
        notifyOnComplete={org?.notify_on_complete ?? true}
        referralCode={org?.referral_code ?? null}
        referredCount={referredCount ?? 0}
      />
    </div>
  );
}
