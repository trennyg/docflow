import Link from "next/link";

type Job = {
  id: string;
  status: string;
  applicant_count: number | null;
  created_at: string;
};

type Props = {
  jobs: Job[];
};

const STATUS_STYLE: Record<string, string> = {
  complete: "text-success bg-success/10 border-success/30",
  processing: "text-accent bg-accent/10 border-accent/30",
  queued: "text-text-muted bg-card border-border",
  failed: "text-error bg-error/10 border-error/30",
};

export default function RecentJobs({ jobs }: Props) {
  if (jobs.length === 0) {
    return (
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
        <p className="text-text-muted text-sm">No jobs yet.</p>
        <Link
          href="/upload"
          className="mt-2 inline-block text-accent text-sm hover:underline"
        >
          Upload your first documents →
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-border">
        <h3 className="text-text-primary text-sm font-medium">Recent jobs</h3>
        <Link
          href="/jobs"
          className="text-accent text-xs hover:underline font-mono"
        >
          View all →
        </Link>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-bg/20">
            {["Date", "Applicants", "Status", ""].map((h) => (
              <th
                key={h}
                className="text-left text-text-muted font-mono text-xs font-medium px-5 py-2.5"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {jobs.map((job) => (
            <tr key={job.id} className="hover:bg-bg/40 transition-colors">
              <td className="px-5 py-3 text-text-muted font-mono text-xs">
                {new Date(job.created_at).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                })}
              </td>
              <td className="px-5 py-3 text-text-primary font-mono text-xs">
                {job.applicant_count ?? 0}
              </td>
              <td className="px-5 py-3">
                <span
                  className={`font-mono text-xs px-2 py-0.5 rounded-full border ${
                    STATUS_STYLE[job.status] ?? STATUS_STYLE.queued
                  }`}
                >
                  {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                </span>
              </td>
              <td className="px-5 py-3 text-right">
                <Link
                  href={`/jobs/${job.id}`}
                  className="text-accent text-xs hover:underline font-mono"
                >
                  View →
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
