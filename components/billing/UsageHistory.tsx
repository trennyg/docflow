type Invoice = {
  id: string;
  date: string;
  amount: number;
  plan: string;
  pdf_url: string | null;
};

type Props = {
  invoices: Invoice[];
};

export default function UsageHistory({ invoices }: Props) {
  return (
    <div className="space-y-3">
      <h2 className="text-text-primary text-sm font-medium">Invoice history</h2>

      {invoices.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-8 text-center">
          <svg
            className="w-8 h-8 text-text-muted mx-auto mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="text-text-muted text-sm">No invoices yet.</p>
          <p className="text-text-muted text-xs mt-1">
            Invoices will appear here after your first payment.
          </p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-bg/30">
                {["Date", "Plan", "Amount", "Download"].map((h) => (
                  <th
                    key={h}
                    className="text-left text-text-muted font-mono text-xs font-medium px-5 py-3"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-bg/40 transition-colors">
                  <td className="px-5 py-3 text-text-primary font-mono text-xs">
                    {new Date(inv.date).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-5 py-3 text-text-primary text-xs capitalize">
                    {inv.plan}
                  </td>
                  <td className="px-5 py-3 text-text-primary font-mono text-xs">
                    ₹{inv.amount.toLocaleString("en-IN")}
                  </td>
                  <td className="px-5 py-3">
                    {inv.pdf_url ? (
                      <a
                        href={inv.pdf_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent hover:underline text-xs font-mono"
                      >
                        PDF →
                      </a>
                    ) : (
                      <span className="text-text-muted text-xs font-mono opacity-50">
                        —
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
