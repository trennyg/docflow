import { requireUser } from "@/lib/server-auth";
import UsageBar from "@/components/dashboard/UsageBar";
import RecentJobs from "@/components/dashboard/RecentJobs";
import QuickUpload from "@/components/dashboard/QuickUpload";
import MasterSheetButton from "@/components/dashboard/MasterSheetButton";

export default async function DashboardPage() {
  const { supabase, user } = await requireUser();

  const { data: org } = await supabase
    .from("organizations")
    .select("name, plan, credits_used, credits_limit, addon_pages")
    .eq("id", user.id)
    .maybeSingle();

  const { data: jobs } = await supabase
    .from("jobs")
    .select("id, status, created_at, applicants(label, extracted)")
    .eq("org_id", user.id)
    .order("created_at", { ascending: false })
    .limit(10);

  // Check if master sheet exists for the download button
  const { data: storageFiles } = await supabase.storage
    .from("documents")
    .list(user.id, { search: "master_sheet.xlsx" });
  const hasMasterSheet = (storageFiles ?? []).some((f) => f.name === "master_sheet.xlsx");

  const orgName = org?.name ?? user.email ?? "your organisation";
  const plan = org?.plan ?? "free";
  const creditsUsed = org?.credits_used ?? 0;
  const creditsLimit = org?.credits_limit ?? 30;
  const addonPages = org?.addon_pages ?? 0;
  const firstName = orgName.split(/[\s@]/)[0];
  const peopleThisMonth = creditsUsed;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Welcome */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-text-primary text-xl font-semibold">
            Welcome back, {firstName}
          </h1>
          <p className="text-text-muted text-sm mt-0.5">
            {peopleThisMonth > 0
              ? `${peopleThisMonth.toLocaleString()} document${peopleThisMonth !== 1 ? "s" : ""} processed this month`
              : "No documents processed yet this month"}
          </p>
        </div>
        {hasMasterSheet && <MasterSheetButton />}
      </div>

      {/* Usage */}
      <UsageBar used={creditsUsed} limit={creditsLimit} plan={plan} addonPages={addonPages} />

      {/* Quick upload */}
      <QuickUpload />

      {/* Recent extractions */}
      <RecentJobs jobs={jobs ?? []} />
    </div>
  );
}
