import Link from "next/link";
import { requireUser } from "@/lib/server-auth";

type JobStatus = "queued" | "processing" | "complete" | "failed";

function StatusBadge({ status }: { status: JobStatus }) {
  const cfg: Record<JobStatus, { label: string; cls: string; spin?: boolean }> =
    {
      queued: {
        label: "Queued",
        cls: "border-border text-text-muted bg-card",
      },
      processing: {
        label: "Processing",
        cls: "border-accent text-accent bg-accent/10",
        spin: true,
      },
      complete: {
        label: "Complete",
        cls: "border-success text-success bg-success/10",
      },
      failed: {
        label: "Failed",
        cls: "border-error text-error bg-error/10",
      },
    };

  const { label, cls, spin } = cfg[status] ?? cfg.queued;

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono text-xs px-2 py-0.5 rounded-full border ${cls}`}
    >
      {spin && (
        <svg
          className="w-2.5 h-2.5 animate-spin"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8H4z"
          />
        </svg>
      )}
      {label}
    </span>
  );
}

export default async function JobsPage() {
  const { supabase, user } = await requireUser();

  const { data: jobs } = await supabase
    .from("jobs")
    .select("id, status, job_type, applicant_count, created_at")
    .eq("org_id", user.id)
    .order("created_at", { ascending: false });

  // Fetch document counts for all jobs in one query
  const jobIds = (jobs ?? []).map((j) => j.id);
  let docCountMap: Record<string, number> = {};
  if (jobIds.length > 0) {
    const { data: docRows } = await supabase
      .from("documents")
      .select("job_id")
      .in("job_id", jobIds);
    docCountMap = (docRows ?? []).reduce<Record<string, number>>((acc, row) => {
      acc[row.job_id] = (acc[row.job_id] ?? 0) + 1;
      return acc;
    }, {});
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-text-primary text-xl font-semibold">Jobs</h1>
        <Link
          href="/app/upload"
          className="bg-accent hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          New upload →
        </Link>
      </div>

      {!jobs || jobs.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <svg
            className="w-10 h-10 text-text-muted mx-auto mb-3"
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
            href="/app/upload"
            className="mt-3 inline-block text-accent text-sm hover:underline"
          >
            Upload your first documents →
          </Link>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-bg/30">
                {[
                  "Date",
                  "Applicants",
                  "Documents",
                  "Status",
                  "Download",
                  "View",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left text-text-muted font-mono text-xs font-medium px-4 py-3"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {jobs.map((job) => {
                const status = job.status as JobStatus;
                const docCount = docCountMap[job.id] ?? 0;
                const isComplete = status === "complete";
                const isFailed = status === "failed";

                return (
                  <tr
                    key={job.id}
                    className="hover:bg-bg/40 transition-colors group"
                  >
                    {/* Date */}
                    <td className="px-4 py-3">
                      <p className="text-text-primary text-xs font-mono">
                        {new Date(job.created_at).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                      <p className="text-text-muted text-xs font-mono">
                        {new Date(job.created_at).toLocaleTimeString("en-IN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </td>

                    {/* Applicants */}
                    <td className="px-4 py-3">
                      <span className="text-text-primary font-mono text-xs">
                        {job.applicant_count ?? 0}
                      </span>
                    </td>

                    {/* Documents */}
                    <td className="px-4 py-3">
                      <span className="text-text-primary font-mono text-xs">
                        {docCount}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={status} />
                        {isFailed && (
                          <button className="text-error text-xs font-mono hover:underline">
                            Retry
                          </button>
                        )}
                      </div>
                    </td>

                    {/* Download */}
                    <td className="px-4 py-3">
                      <button
                        disabled={!isComplete}
                        title={
                          isComplete
                            ? "Download Excel"
                            : "Available when complete"
                        }
                        className={`text-xs font-medium px-2.5 py-1 rounded border transition-colors ${
                          isComplete
                            ? "border-success text-success bg-success/10 hover:bg-success/20"
                            : "border-border text-text-muted opacity-40 cursor-not-allowed"
                        }`}
                      >
                        Excel
                      </button>
                    </td>

                    {/* View */}
                    <td className="px-4 py-3">
                      <Link
                        href={`/app/jobs/${job.id}`}
                        className="text-accent hover:underline font-mono text-xs"
                      >
                        {job.id.slice(0, 8)}… →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
