import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="bg-card border border-border rounded-xl p-10 max-w-md w-full">
        <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-6 h-6 text-accent"
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
        </div>
        <h2 className="text-text-primary font-semibold text-lg mb-2">
          No documents yet
        </h2>
        <p className="text-text-muted text-sm mb-6">
          Extract structured data from KYC documents in seconds.
        </p>
        <Link
          href="/app/upload"
          className="inline-flex items-center gap-2 bg-accent hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-lg transition-colors text-sm"
        >
          Upload your first documents →
        </Link>
      </div>
    </div>
  );
}
