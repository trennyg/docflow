import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { DOC_TYPES } from "@/lib/constants";

const DOC_LABEL: Record<string, string> = Object.fromEntries(
  DOC_TYPES.map(({ value, label }) => [value, label])
);

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    complete: "border-success text-success bg-success/10",
    processing: "border-warning text-warning bg-warning/10",
    failed: "border-error text-error bg-error/10",
    pending: "border-border text-text-muted bg-card",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono text-xs px-2.5 py-1 rounded-full border ${
        styles[status] ?? styles.pending
      }`}
    >
      {status === "processing" && (
        <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      )}
      {status}
    </span>
  );
}

export default async function JobPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: job } = await supabase
    .from("jobs")
    .select("*")
    .eq("id", params.id)
    .eq("org_id", user.id)
    .single();

  if (!job) notFound();

  const { data: applicants } = await supabase
    .from("applicants")
    .select("*, documents(*)")
    .eq("job_id", params.id)
    .order("created_at", { ascending: true });

  const createdAt = new Date(job.created_at).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/app/jobs"
              className="text-text-muted hover:text-text-primary text-sm transition-colors"
            >
              ← Jobs
            </Link>
          </div>
          <h1 className="text-text-primary text-xl font-semibold">
            Job{" "}
            <span className="font-mono text-text-muted text-base">
              {params.id.slice(0, 8)}…
            </span>
          </h1>
          <p className="text-text-muted text-sm mt-0.5">{createdAt}</p>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={job.status} />
          {job.status === "complete" && (
            <button
              disabled
              title="Excel download coming soon"
              className="bg-success/10 border border-success text-success text-sm font-medium px-4 py-2 rounded-lg opacity-50 cursor-not-allowed"
            >
              Download Excel
            </button>
          )}
        </div>
      </div>

      {/* Summary bar */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Applicants", value: job.applicant_count ?? 0 },
          { label: "Type", value: job.job_type?.toUpperCase() ?? "KYC" },
          { label: "Status", value: job.status },
        ].map(({ label, value }) => (
          <div key={label} className="bg-card border border-border rounded-xl p-4">
            <p className="text-text-muted text-xs font-mono mb-1">{label}</p>
            <p className="text-text-primary text-sm font-medium font-mono">{value}</p>
          </div>
        ))}
      </div>

      {/* Processing state */}
      {job.status === "processing" && (
        <div className="bg-card border border-warning/30 rounded-xl p-6 text-center">
          <svg className="w-8 h-8 animate-spin text-warning mx-auto mb-3" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <p className="text-text-primary text-sm font-medium">Processing documents…</p>
          <p className="text-text-muted text-xs mt-1">This usually takes under a minute. Refresh to check status.</p>
        </div>
      )}

      {/* Applicant results */}
      {job.status === "complete" && applicants && applicants.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-text-primary text-sm font-medium">
            Extracted Data
          </h2>
          {applicants.map((applicant: {
            id: string;
            label: string;
            status: string;
            extracted: Record<string, string> | null;
            documents: Array<{ id: string; doc_type: string; status: string; confidence: number }>;
          }) => (
            <div
              key={applicant.id}
              className="bg-card border border-border rounded-xl overflow-hidden"
            >
              {/* Applicant header */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-border">
                <span className="text-text-primary text-sm font-medium">
                  {applicant.label}
                </span>
                <div className="flex items-center gap-2">
                  {applicant.documents?.map((doc) => (
                    <span
                      key={doc.id}
                      className="text-xs font-mono px-2 py-0.5 bg-bg border border-border rounded text-text-muted"
                    >
                      {DOC_LABEL[doc.doc_type] ?? doc.doc_type}
                      {doc.confidence
                        ? ` · ${Math.round(doc.confidence * 100)}%`
                        : ""}
                    </span>
                  ))}
                </div>
              </div>

              {/* Extracted key-value grid */}
              {applicant.extracted &&
              Object.keys(applicant.extracted).length > 0 ? (
                <div className="grid grid-cols-2 gap-px bg-border">
                  {Object.entries(applicant.extracted).map(([key, value]) => (
                    <div key={key} className="bg-card px-4 py-3">
                      <p className="text-text-muted text-xs font-mono mb-0.5">
                        {key.replace(/_/g, " ")}
                      </p>
                      <p className="text-text-primary text-sm font-mono break-all">
                        {String(value)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-text-muted text-sm px-5 py-4">
                  No extracted data.
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
