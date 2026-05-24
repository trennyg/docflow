type Props = {
  used: number;
  limit: number;
  plan: string;
  addonPages?: number;
};

function daysUntilReset(): number {
  const now = new Date();
  const first = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return Math.ceil((first.getTime() - now.getTime()) / 86_400_000);
}

export default function UsageBar({ used, limit, plan, addonPages = 0 }: Props) {
  const unlimited = limit === -1;
  const pct = unlimited ? 0 : Math.min(100, Math.round((used / limit) * 100));
  const days = daysUntilReset();

  const barColor =
    pct >= 100 ? "bg-error" : pct >= 80 ? "bg-warning" : "bg-success";

  const textColor =
    pct >= 100 ? "text-error" : pct >= 80 ? "text-warning" : "text-text-muted";

  return (
    <div className="bg-card border border-border rounded-xl p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-text-primary text-sm font-medium">Page usage</p>
          <p className={`text-xs font-mono mt-0.5 ${textColor}`}>
            {unlimited
              ? "Unlimited pages"
              : `${used.toLocaleString()} of ${limit.toLocaleString()} pages used this month`}
            {addonPages > 0 && (
              <span className="text-success ml-2">· {addonPages.toLocaleString()} bonus pages remaining</span>
            )}
          </p>
        </div>
        <div className="text-right">
          <span className="text-xs font-mono text-text-muted capitalize">
            {plan} plan
          </span>
          <p className="text-xs font-mono text-text-muted mt-0.5">
            Resets in {days} day{days !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {!unlimited && (
        <div className="space-y-1">
          <div className="h-2 bg-bg rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${barColor}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="flex justify-between text-xs font-mono text-text-muted">
            <span>{pct}% used</span>
            <span>
              {limit - used > 0
                ? `${(limit - used).toLocaleString()} remaining`
                : "Monthly limit reached"}
            </span>
          </div>
        </div>
      )}

      {pct >= 100 && (
        <p className="text-error text-xs font-mono">
          Monthly limit reached.{addonPages > 0 ? ` You have ${addonPages.toLocaleString()} bonus pages available.` : " Upgrade or buy extra pages to continue."}
        </p>
      )}
    </div>
  );
}
