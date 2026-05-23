import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import UsageBar from "@/components/dashboard/UsageBar";
import RecentJobs from "@/components/dashboard/RecentJobs";
import QuickUpload from "@/components/dashboard/QuickUpload";

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: org } = await supabase
    .from("organizations")
    .select("name, plan, credits_used, credits_limit")
    .eq("id", user.id)
    .maybeSingle();

  const { data: jobs } = await supabase
    .from("jobs")
    .select("id, status, applicant_count, created_at")
    .eq("org_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5);

  const orgName = org?.name ?? user.email ?? "your organisation";
  const plan = org?.plan ?? "free";
  const creditsUsed = org?.credits_used ?? 0;
  const creditsLimit = org?.credits_limit ?? 15;
  const firstName = orgName.split(/[\s@]/)[0];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-text-primary text-xl font-semibold">
          Welcome back, {firstName}
        </h1>
        <p className="text-text-muted text-sm mt-0.5">
          Here&apos;s what&apos;s happening with your documents.
        </p>
      </div>

      {/* Usage */}
      <UsageBar used={creditsUsed} limit={creditsLimit} plan={plan} />

      {/* Quick upload */}
      <QuickUpload />

      {/* Recent jobs */}
      <RecentJobs jobs={jobs ?? []} />
    </div>
  );
}
