import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function JobsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: jobs } = await supabase
    .from("jobs")
    .select("id, status, job_type, applicant_count, created_at")
    .eq("org_id", user.id)
    .order("created_at", { ascending: false });

  const statusColor: Record<string, string> = {
    complete: "text-success",
    processing: "text-warning",
    failed: "text-error",
    pending: "text-text-muted",
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
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
        <div className="bg-card border border-border rounded-xl p-10 text-center">
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
              <tr className="border-b border-border">
                <th className="text-left text-text-muted font-mono text-xs px-5 py-3">
                  Job ID
                </th>
                <th className="text-left text-text-muted font-mono text-xs px-5 py-3">
                  Type
                </th>
                <th className="text-left text-text-muted font-mono text-xs px-5 py-3">
                  Applicants
                </th>
                <th className="text-left text-text-muted font-mono text-xs px-5 py-3">
                  Status
                </th>
                <th className="text-left text-text-muted font-mono text-xs px-5 py-3">
                  Created
                </th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr
                  key={job.id}
                  className="border-b border-border last:border-0 hover:bg-bg/50 transition-colors"
                >
                  <td className="px-5 py-3">
                    <Link
                      href={`/app/jobs/${job.id}`}
                      className="text-accent hover:underline font-mono text-xs"
                    >
                      {job.id.slice(0, 8)}…
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-text-muted font-mono text-xs uppercase">
                    {job.job_type}
                  </td>
                  <td className="px-5 py-3 text-text-primary font-mono text-xs">
                    {job.applicant_count ?? 0}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`font-mono text-xs ${statusColor[job.status] ?? statusColor.pending}`}
                    >
                      {job.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-text-muted font-mono text-xs">
                    {new Date(job.created_at).toLocaleDateString("en-IN")}
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
