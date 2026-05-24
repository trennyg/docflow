import { requireUser } from "@/lib/server-auth";
import UsageBar from "@/components/dashboard/UsageBar";
import RecentJobs from "@/components/dashboard/RecentJobs";
import QuickUpload from "@/components/dashboard/QuickUpload";
import MasterSheetButton from "@/components/dashboard/MasterSheetButton";

export default async function DashboardPage() {
  const { supabase, user } = await requireUser();

  const { data: org } = await supabase
    .from("organizations")
    .select("name, plan, credits_used, credits_limit, addon_pages, has_master_sheet")
    .eq("id", user.id)
    .maybeSingle();

  const { data: jobs } = await supabase
    .from("jobs")
    .select("id, status, page_count, created_at, applicants(extracted)")
    .eq("org_id", user.id)
    .order("created_at", { ascending: false })
    .limit(10);

  const orgName = org?.name ?? user.email ?? "your organisation";
  const plan = org?.plan ?? "free";
  const creditsUsed = org?.credits_used ?? 0;
  const creditsLimit = org?.credits_limit ?? 30;
  const addonPages = org?.addon_pages ?? 0;
  const hasMasterSheet = org?.has_master_sheet ?? false;
  const firstName = orgName.split(/[\s@]/)[0];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-text-primary text-xl font-semibold">
            Welcome back, {firstName}
          </h1>
          <p className="text-text-muted text-sm mt-0.5">
            {creditsUsed > 0
              ? `${creditsUsed.toLocaleString()} page${creditsUsed !== 1 ? "s" : ""} processed this month`
              : "No pages processed yet this month"}
          </p>
        </div>
        {hasMasterSheet && <MasterSheetButton />}
      </div>

      <UsageBar used={creditsUsed} limit={creditsLimit} plan={plan} addonPages={addonPages} />

      <QuickUpload />

      <RecentJobs jobs={jobs ?? []} />
    </div>
  );
}
