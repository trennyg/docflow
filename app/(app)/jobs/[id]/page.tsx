import { notFound } from "next/navigation";
import Link from "next/link";
import { requireUser } from "@/lib/server-auth";
import { DOC_TYPES } from "@/lib/constants";
import ProcessingStatus from "@/components/upload/ProcessingStatus";

const DOC_LABEL = Object.fromEntries(
  DOC_TYPES.map(({ value, label }) => [value, label])
);

type JobStatus = "queued" | "processing" | "complete" | "failed";

type Document = {
  id: string;
  doc_type: string;
  confidence: number | null;
  extracted: Record<string, string> | null;
  status: string;
};

type Applicant = {
  id: string;
  label: string;
  status: string;
  extracted: Record<string, string> | null;
  documents: Document[];
};

function StatusBadge({ status }: { status: string }) {
  const cfg: Record<string, { cls: string; spin?: boolean }> = {
    queued: { cls: "border-border text-text-muted bg-card" },
    processing: { cls: "border-accent text-accent bg-accent/10", spin: true },
    complete: { cls: "border-success text-success bg-success/10" },
    failed: { cls: "border-error text-error bg-error/10" },
  };
  const { cls, spin } = cfg[status] ?? cfg.queued;
  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono text-xs px-2.5 py-1 rounded-full border ${cls}`}
    >
      {spin && (
        <svg className="w-2.5 h-2.5 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      )}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function ConfidencePip({ value }: { value: number | null }) {
  if (value === null) return null;
  const pct = Math.round(value * 100);
  const color =
    value >= 0.8
      ? "text-success bg-success/10 border-success/30"
      : value >= 0.7
      ? "text-warning bg-warning/10 border-warning/30"
      : "text-error bg-error/10 border-error/30";
  return (
    <span
      className={`font-mono text-xs px-1.5 py-0.5 rounded border ${color}`}
    >
      {pct}%
    </span>
  );
}

function FieldRow({
  label,
  value,
  confidence,
}: {
  label: string;
  value: string;
  confidence: number | null;
}) {
  const low = confidence !== null && confidence < 0.7;
  return (
    <div
      className={`px-4 py-3 ${
        low ? "bg-warning/5 border-l-2 border-warning" : "bg-card"
      }`}
    >
      <div className="flex items-center gap-2 mb-0.5">
        <p className="text-text-muted text-xs font-mono">
          {label.replace(/_/g, " ")}
        </p>
        <ConfidencePip value={confidence} />
      </div>
      <p className="text-text-primary text-sm font-mono break-all">{value}</p>
    </div>
  );
}

function ApplicantCard({ applicant }: { applicant: Applicant }) {
  // Build field list from documents to get per-document confidence
  type FieldEntry = { key: string; value: string; confidence: number | null };
  const fields: FieldEntry[] = [];
  const seen = new Set<string>();

  for (const doc of applicant.documents) {
    const conf = doc.confidence ?? null;
    const extracted = doc.extracted ?? {};
    for (const [key, value] of Object.entries(extracted)) {
      if (!seen.has(key)) {
        seen.add(key);
        fields.push({ key, value: String(value), confidence: conf });
      }
    }
  }

  // Fall back to applicant.extracted if no doc-level fields
  if (fields.length === 0 && applicant.extracted) {
    for (const [key, value] of Object.entries(applicant.extracted)) {
      fields.push({ key, value: String(value), confidence: null });
    }
  }

  const docTags = applicant.documents.map((d) => ({
    label: DOC_LABEL[d.doc_type] ?? d.doc_type,
    confidence: d.confidence,
  }));

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-border">
        <div className="flex items-center gap-3">
          <span className="text-text-primary text-sm font-medium">
            {applicant.label}
          </span>
          <StatusBadge status={applicant.status} />
        </div>
        <div className="flex items-center gap-1.5 flex-wrap justify-end">
          {docTags.map((tag, i) => (
            <span
              key={i}
              className="text-xs font-mono px-2 py-0.5 bg-bg border border-border rounded text-text-muted flex items-center gap-1"
            >
              {tag.label}
              {tag.confidence !== null && (
                <span
                  className={`${
                    (tag.confidence ?? 1) >= 0.8
                      ? "text-success"
                      : (tag.confidence ?? 1) >= 0.7
                      ? "text-warning"
                      : "text-error"
                  }`}
                >
                  · {Math.round((tag.confidence ?? 0) * 100)}%
                </span>
              )}
            </span>
          ))}
        </div>
      </div>

      {/* Fields */}
      {fields.length > 0 ? (
        <div className="grid grid-cols-2 gap-px bg-border">
          {fields.map(({ key, value, confidence }) => (
            <FieldRow
              key={key}
              label={key}
              value={value}
              confidence={confidence}
            />
          ))}
        </div>
      ) : (
        <p className="text-text-muted text-sm px-5 py-4 italic">
          No extracted data yet.
        </p>
      )}
    </div>
  );
}

export default async function JobPage({
  params,
}: {
  params: { id: string };
}) {
  const { supabase, user } = await requireUser();

  const { data: job } = await supabase
    .from("jobs")
    .select("*")
    .eq("id", params.id)
    .eq("org_id", user.id)
    .single();

  if (!job) notFound();

  const { data: applicants } = await supabase
    .from("applicants")
    .select("id, label, status, extracted")
    .eq("job_id", params.id)
    .order("created_at", { ascending: true });

  const applicantsWithDocs: Applicant[] = await Promise.all(
    (applicants ?? []).map(async (a) => {
      const { data: documents } = await supabase
        .from("documents")
        .select("id, doc_type, confidence, extracted, status")
        .eq("applicant_id", a.id)
        .order("created_at", { ascending: true });
      return { ...a, documents: (documents ?? []) as Document[] };
    })
  );

  const status = job.status as JobStatus;
  const isTerminal = status === "complete" || status === "failed";

  const createdAt = new Date(job.created_at).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const docCount = applicantsWithDocs.reduce(
    (sum, a) => sum + a.documents.length,
    0
  );

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Breadcrumb + header */}
      <div className="flex items-start justify-between">
        <div>
          <Link
            href="/jobs"
            className="text-text-muted hover:text-text-primary text-sm transition-colors"
          >
            ← Jobs
          </Link>
          <h1 className="text-text-primary text-xl font-semibold mt-1">
            Job{" "}
            <span className="font-mono text-text-muted text-base">
              {params.id.slice(0, 8)}…
            </span>
          </h1>
          <p className="text-text-muted text-sm mt-0.5">{createdAt}</p>
        </div>

        <div className="flex items-center gap-3">
          <StatusBadge status={status} />
          {status === "complete" && (
            <button
              disabled
              title="Excel download coming soon"
              className="border border-success text-success text-sm font-medium px-4 py-2 rounded-lg bg-success/10 opacity-50 cursor-not-allowed"
            >
              Download Excel
            </button>
          )}
          {status === "failed" && (
            <button className="border border-error text-error text-sm font-medium px-4 py-2 rounded-lg bg-error/10 hover:bg-error/20 transition-colors">
              Re-process
            </button>
          )}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Applicants", value: job.applicant_count ?? 0 },
          { label: "Documents", value: docCount },
          { label: "Type", value: (job.job_type ?? "kyc").toUpperCase() },
          { label: "Status", value: status },
        ].map(({ label, value }) => (
          <div key={label} className="bg-card border border-border rounded-xl p-4">
            <p className="text-text-muted text-xs font-mono mb-1">{label}</p>
            <p className="text-text-primary text-sm font-medium font-mono">
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Real-time status while in-flight */}
      {!isTerminal && (
        <ProcessingStatus
          jobId={params.id}
          initialStatus={status}
          applicantCount={job.applicant_count ?? 0}
        />
      )}

      {/* Results */}
      {status === "complete" && applicantsWithDocs.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-text-primary text-sm font-medium">
              Extracted Data
            </h2>
            <p className="text-text-muted text-xs">
              Fields highlighted in{" "}
              <span className="text-warning">yellow</span> have confidence below
              70%
            </p>
          </div>
          {applicantsWithDocs.map((applicant) => (
            <ApplicantCard key={applicant.id} applicant={applicant} />
          ))}
        </div>
      )}

      {status === "failed" && (
        <div className="bg-card border border-error/30 rounded-xl p-6 text-center">
          <p className="text-text-primary text-sm font-medium">
            Processing failed
          </p>
          <p className="text-text-muted text-xs mt-1">
            Click Re-process above to try again.
          </p>
        </div>
      )}
    </div>
  );
}
