"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import DropZone from "@/components/upload/DropZone";
import ApplicantBuilder, { Applicant } from "@/components/upload/ApplicantBuilder";
import { UploadFile } from "@/components/upload/FileQueue";
import { detectDocType, detectApplicantName, DocType } from "@/lib/constants";
import { DUMMY_EXTRACTED } from "@/lib/api";
import { createClient } from "@/lib/supabase/client";
import { devProcessUpload } from "./actions";

type Props = { orgId: string; devMode?: boolean };

export default function UploadFlow({ orgId, devMode = false }: Props) {
  const router = useRouter();
  const [files, setFiles] = useState<Record<string, UploadFile>>({});
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");

  const totalFiles = Object.keys(files).length;

  const handleFilesAdded = useCallback((newFiles: File[]) => {
    const nextFiles: Record<string, UploadFile> = {};
    // applicant name → file ids
    const nameMap: Record<string, string[]> = {};

    newFiles.forEach((file) => {
      const id = crypto.randomUUID();
      nextFiles[id] = { id, file, docType: detectDocType(file.name) };
      const name = detectApplicantName(file.name);
      if (!nameMap[name]) nameMap[name] = [];
      nameMap[name].push(id);
    });

    setFiles((prev) => ({ ...prev, ...nextFiles }));

    setApplicants((prev) => {
      const next = prev.map((a) => ({ ...a, fileIds: [...a.fileIds] }));
      Object.entries(nameMap).forEach(([name, ids]) => {
        const existing = next.find((a) => a.label === name);
        if (existing) {
          existing.fileIds.push(...ids);
        } else {
          next.push({ id: crypto.randomUUID(), label: name, fileIds: ids });
        }
      });
      return next;
    });
  }, []);

  function removeFile(fileId: string) {
    setFiles((prev) => {
      const next = { ...prev };
      delete next[fileId];
      return next;
    });
    setApplicants((prev) =>
      prev.map((a) => ({ ...a, fileIds: a.fileIds.filter((id) => id !== fileId) }))
    );
  }

  function changeDocType(fileId: string, docType: DocType) {
    setFiles((prev) =>
      prev[fileId] ? { ...prev, [fileId]: { ...prev[fileId], docType } } : prev
    );
  }

  async function handleProcess() {
    const activeApplicants = applicants.filter((a) => a.fileIds.length > 0);
    if (activeApplicants.length === 0) {
      setError("Add at least one file before processing.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      if (devMode) {
        await handleProcessDev(activeApplicants);
      } else {
        await handleProcessProd(activeApplicants);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSubmitting(false);
      setProgress("");
    }
  }

  async function handleProcessDev(activeApplicants: Applicant[]) {
    setProgress("Preparing upload…");
    const formData = new FormData();

    const structure = activeApplicants.map((applicant, i) => ({
      label: applicant.label,
      fileKeys: applicant.fileIds
        .map((id, j) => (files[id] ? `file_${i}_${j}` : null))
        .filter(Boolean) as string[],
      docTypes: applicant.fileIds
        .map((id) => files[id]?.docType)
        .filter(Boolean) as DocType[],
    }));

    formData.append("applicants", JSON.stringify(structure));

    activeApplicants.forEach((applicant, i) => {
      applicant.fileIds.forEach((fileId, j) => {
        const uf = files[fileId];
        if (uf) formData.append(`file_${i}_${j}`, uf.file, uf.file.name);
      });
    });

    setProgress("Processing (dev mode)…");
    const { jobId } = await devProcessUpload(formData);
    router.push(`/jobs/${jobId}`);
  }

  async function handleProcessProd(activeApplicants: Applicant[]) {
    const supabase = createClient();

    // 1. Create job
    setProgress("Creating job…");
    const { data: job, error: jobErr } = await supabase
      .from("jobs")
      .insert({
        org_id: orgId,
        status: "processing",
        job_type: "kyc",
        applicant_count: activeApplicants.length,
      })
      .select("id")
      .single();

    if (jobErr || !job) throw new Error(jobErr?.message ?? "Failed to create job");
    const jobId: string = job.id;

    // 2. Per applicant: insert record, upload files, insert documents
    for (const applicant of activeApplicants) {
      setProgress(`Uploading ${applicant.label}…`);

      const { data: appRecord, error: appErr } = await supabase
        .from("applicants")
        .insert({ job_id: jobId, org_id: orgId, label: applicant.label, status: "pending" })
        .select("id")
        .single();

      if (appErr || !appRecord) continue;
      const applicantId: string = appRecord.id;
      const extractedData: Record<string, string> = {};

      for (const fileId of applicant.fileIds) {
        const uf = files[fileId];
        if (!uf) continue;

        const storagePath = `${orgId}/${jobId}/${applicantId}/${uf.file.name}`;
        const { error: uploadErr } = await supabase.storage
          .from("documents")
          .upload(storagePath, uf.file, { upsert: true });

        if (!uploadErr) {
          await supabase.from("documents").insert({
            applicant_id: applicantId,
            job_id: jobId,
            org_id: orgId,
            doc_type: uf.docType,
            storage_path: storagePath,
            status: "complete",
            confidence: 0.95,
            extracted: DUMMY_EXTRACTED[uf.docType] ?? DUMMY_EXTRACTED.other,
          });
          Object.assign(extractedData, DUMMY_EXTRACTED[uf.docType] ?? {});
        }
      }

      await supabase
        .from("applicants")
        .update({ status: "complete", extracted: extractedData })
        .eq("id", applicantId);
    }

    // 3. Mark job complete
    await supabase.from("jobs").update({ status: "complete" }).eq("id", jobId);
    router.push(`/jobs/${jobId}`);
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-text-primary text-xl font-semibold">Upload Documents</h1>
        <p className="text-text-muted text-sm mt-1">
          Drop KYC documents below. We&apos;ll auto-detect document types and group by applicant.
        </p>
      </div>

      <DropZone onFilesAdded={handleFilesAdded} currentCount={totalFiles} />

      {totalFiles > 0 && (
        <>
          <div className="flex items-center justify-between">
            <h2 className="text-text-primary text-sm font-medium">
              {totalFiles} file{totalFiles !== 1 ? "s" : ""} ·{" "}
              {applicants.filter((a) => a.fileIds.length > 0).length} applicant
              {applicants.filter((a) => a.fileIds.length > 0).length !== 1 ? "s" : ""}
            </h2>
            <p className="text-text-muted text-xs">
              Drag files between groups to reorganise
            </p>
          </div>

          <ApplicantBuilder
            files={files}
            applicants={applicants}
            onChange={setApplicants}
            onRemoveFile={removeFile}
            onDocTypeChange={changeDocType}
          />

          {error && (
            <p className="text-error text-sm font-mono">{error}</p>
          )}

          <div className="flex items-center justify-between pt-2">
            <p className="text-text-muted text-xs font-mono">
              {submitting ? progress : "Ready to process"}
            </p>
            <button
              onClick={handleProcess}
              disabled={submitting}
              className="bg-accent hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium px-6 py-2.5 rounded-lg transition-colors text-sm flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Processing…
                </>
              ) : (
                "Process Documents →"
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
