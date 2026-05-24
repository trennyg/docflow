import { PlanKey, PLANS } from "@/lib/constants";

type Props = {
  planKey: PlanKey;
  currentPlan: PlanKey;
  annual: boolean;
};

export default function PlanCard({ planKey, currentPlan, annual }: Props) {
  const plan = PLANS[planKey];
  const isCurrent = planKey === currentPlan;
  const isDowngrade =
    Object.keys(PLANS).indexOf(planKey) <
    Object.keys(PLANS).indexOf(currentPlan);

  const displayPrice = annual ? plan.annualPrice : plan.price;
  const isFree = plan.price === 0;

  return (
    <div
      className={`relative flex flex-col rounded-xl border p-5 transition-all ${
        isCurrent
          ? "border-accent bg-accent/5 shadow-[0_0_0_1px_theme(colors.accent)]"
          : "border-border bg-card hover:border-border/80"
      }`}
    >
      {isCurrent && (
        <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-accent text-white text-xs font-mono px-2.5 py-0.5 rounded-full">
          Current plan
        </span>
      )}

      {/* Name + price */}
      <div className="mb-4">
        <h3 className="text-text-primary font-semibold text-base">
          {plan.label}
        </h3>
        <div className="mt-1 flex items-baseline gap-1">
          {isFree ? (
            <span className="text-text-primary text-2xl font-bold font-mono">
              Free
            </span>
          ) : (
            <>
              <span className="text-text-muted text-sm font-mono">₹</span>
              <span className="text-text-primary text-2xl font-bold font-mono">
                {displayPrice}
              </span>
              <span className="text-text-muted text-xs font-mono">/mo</span>
            </>
          )}
        </div>
        {!isFree && annual && (
          <p className="text-success text-xs font-mono mt-0.5">
            Billed ₹{displayPrice * 12}/yr · 2 months free
          </p>
        )}
        <p className="text-text-muted text-xs font-mono mt-1">
          {plan.limit === -1
            ? "Unlimited pages"
            : `${plan.limit.toLocaleString()} pages/month`}
        </p>
      </div>

      {/* Feature list */}
      <ul className="flex-1 space-y-2 mb-5">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2">
            <svg
              className="w-3.5 h-3.5 text-success shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span className="text-text-muted text-xs">{f}</span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <button
        disabled={isCurrent || isDowngrade}
        className={`w-full py-2 rounded-lg text-sm font-medium transition-colors ${
          isCurrent
            ? "bg-accent/10 text-accent border border-accent cursor-default"
            : isDowngrade
            ? "bg-bg text-text-muted border border-border cursor-not-allowed opacity-40"
            : "bg-accent hover:bg-blue-700 text-white"
        }`}
      >
        {isCurrent
          ? "Current plan"
          : isDowngrade
          ? "Downgrade"
          : isFree
          ? "Free forever"
          : `Upgrade to ${plan.label}`}
      </button>
    </div>
  );
}
