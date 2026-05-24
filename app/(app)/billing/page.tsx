import { requireUser } from "@/lib/server-auth";
import { PLANS, PlanKey } from "@/lib/constants";
import UsageBar from "@/components/dashboard/UsageBar";
import PlanSelector from "@/components/billing/PlanSelector";
import UsageHistory from "@/components/billing/UsageHistory";

export default async function BillingPage({
  searchParams,
}: {
  searchParams: { upgrade?: string };
}) {
  const { supabase, user } = await requireUser();

  const { data: org } = await supabase
    .from("organizations")
    .select("name, plan, credits_used, credits_limit")
    .eq("id", user.id)
    .maybeSingle();

  const plan = (org?.plan ?? "free") as PlanKey;
  const planLabel = PLANS[plan]?.label ?? "Free";
  const creditsUsed = org?.credits_used ?? 0;
  const creditsLimit = org?.credits_limit ?? 15;

  // Fetch invoices (empty until Razorpay is wired)
  const { data: invoices } = await supabase
    .from("invoices")
    .select("id, date, amount, plan, pdf_url")
    .eq("org_id", user.id)
    .order("date", { ascending: false })
    .limit(24);

  const limitReached = searchParams.upgrade === "1";

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-text-primary text-xl font-semibold">Billing</h1>
          <p className="text-text-muted text-sm mt-0.5">
            Manage your plan and usage
          </p>
        </div>
        <span
          className={`font-mono text-xs px-3 py-1.5 rounded-full border ${
            plan === "free"
              ? "border-border text-text-muted bg-card"
              : "border-accent text-accent bg-accent/10"
          }`}
        >
          {planLabel}
        </span>
      </div>

      {/* Upgrade prompt banner */}
      {limitReached && (
        <div className="bg-error/10 border border-error/30 rounded-xl px-5 py-4 flex items-center justify-between">
          <div>
            <p className="text-text-primary text-sm font-medium">
              Monthly limit reached
            </p>
            <p className="text-text-muted text-xs mt-0.5">
              {plan === "free"
                ? "Upgrade to Starter for ₹199/month to process up to 100 applicants."
                : "Upgrade your plan to process more applicants this month."}
            </p>
          </div>
          <svg
            className="w-5 h-5 text-error shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
            />
          </svg>
        </div>
      )}

      {/* Usage bar */}
      <UsageBar used={creditsUsed} limit={creditsLimit} plan={plan} />

      {/* Plan selector with toggle */}
      <PlanSelector currentPlan={plan} />

      {/* Invoice history */}
      <UsageHistory invoices={invoices ?? []} />
    </div>
  );
}
