"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Progress = { completed: number; total: number };

type JobStatus = "queued" | "processing" | "complete" | "failed";

type Props = {
  jobId: string;
  initialStatus: JobStatus;
  applicantCount: number;
};

const POLL_MS = 3000;

export default function ProcessingStatus({
  jobId,
  initialStatus,
  applicantCount,
}: Props) {
  const router = useRouter();
  const [status, setStatus] = useState<JobStatus>(initialStatus);
  const [progress, setProgress] = useState<Progress>({
    completed: 0,
    total: applicantCount,
  });
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (status === "complete" || status === "failed") return;

    async function poll() {
      try {
        const res = await fetch(`/api/jobs?id=${jobId}`, { cache: "no-store" });
        if (!res.ok) return;
        const json = await res.json();
        const nextStatus: JobStatus = json.job?.status ?? status;
        setProgress(json.progress ?? { completed: 0, total: applicantCount });
        setStatus(nextStatus);

        if (nextStatus === "complete" || nextStatus === "failed") {
          if (intervalRef.current) clearInterval(intervalRef.current);
          // Re-render server component to load full results
          if (nextStatus === "complete") router.refresh();
        }
      } catch {
        // network hiccup — keep polling
      }
    }

    poll();
    intervalRef.current = setInterval(poll, POLL_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId]);

  if (status === "complete") {
    return (
      <div className="bg-card border border-success/30 rounded-xl p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center shrink-0">
            <svg
              className="w-4 h-4 text-success"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <div>
            <p className="text-text-primary text-sm font-medium">
              Processing complete
            </p>
            <p className="text-text-muted text-xs">
              {progress.total} applicant{progress.total !== 1 ? "s" : ""}{" "}
              processed — loading results…
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            disabled
            className="border border-success text-success text-xs font-medium px-3 py-1.5 rounded-lg bg-success/10 opacity-50 cursor-not-allowed"
          >
            Download Excel
          </button>
        </div>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="bg-card border border-error/30 rounded-xl p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-error/10 flex items-center justify-center shrink-0">
            <svg
              className="w-4 h-4 text-error"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <div>
            <p className="text-text-primary text-sm font-medium">
              Processing failed
            </p>
            <p className="text-text-muted text-xs">
              Something went wrong — you can retry below
            </p>
          </div>
        </div>
        <button
          onClick={() => router.refresh()}
          className="border border-error text-error text-xs font-medium px-3 py-1.5 rounded-lg bg-error/10 hover:bg-error/20 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  const pct =
    progress.total > 0
      ? Math.round((progress.completed / progress.total) * 100)
      : 0;

  const progressLabel =
    status === "queued"
      ? "Queued — waiting to start…"
      : progress.completed === 0
      ? "Starting processing…"
      : `Processing applicant ${progress.completed + 1} of ${progress.total}…`;

  return (
    <div className="bg-card border border-accent/20 rounded-xl p-5 space-y-4">
      <div className="flex items-center gap-3">
        <svg
          className="w-5 h-5 text-accent animate-spin shrink-0"
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
        <div>
          <p className="text-text-primary text-sm font-medium">
            {progressLabel}
          </p>
          <p className="text-text-muted text-xs">
            Auto-updating every {POLL_MS / 1000}s
          </p>
        </div>
      </div>

      {progress.total > 0 && (
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-mono text-text-muted">
            <span>
              {progress.completed} of {progress.total} applicants done
            </span>
            <span>{pct}%</span>
          </div>
          <div className="h-1 bg-bg rounded-full overflow-hidden">
            <div
              className="h-full bg-accent rounded-full transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
