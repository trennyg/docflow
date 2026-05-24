"use client";

import { useState, useCallback, useRef } from "react";
import DropZone from "@/components/upload/DropZone";
import FileList, { UploadFile } from "@/components/upload/FileList";
import { detectDocType, DocType } from "@/lib/constants";
import { processUpload, uploadExistingExcel, getMasterSheetUrl } from "./actions";

type Props = {
  orgId: string;
  devMode?: boolean;
  hasMasterSheet: boolean;
};

type Stage = "upload" | "done";

export default function UploadFlow({ hasMasterSheet }: Props) {
  const [files, setFiles] = useState<Record<string, UploadFile>>({});
  const [stage, setStage] = useState<Stage>("upload");
  const [extracted, setExtracted] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");
  const [masterSheetUrl, setMasterSheetUrl] = useState<string | null>(null);

  // Excel upload state
  const [excelUploading, setExcelUploading] = useState(false);
  const [excelDone, setExcelDone] = useState(hasMasterSheet);
  const [excelError, setExcelError] = useState("");
  const excelInputRef = useRef<HTMLInputElement>(null);

  const fileList = Object.values(files);
  const totalFiles = fileList.length;
  const hasUndetected = fileList.some((f) => f.docType === "other");

  const handleFilesAdded = useCallback((newFiles: File[]) => {
    const next: Record<string, UploadFile> = {};
    newFiles.forEach((file) => {
      const id = crypto.randomUUID();
      next[id] = { id, file, docType: detectDocType(file.name) };
    });
    setFiles((prev) => ({ ...prev, ...next }));
  }, []);

  function removeFile(fileId: string) {
    setFiles((prev) => {
      const next = { ...prev };
      delete next[fileId];
      return next;
    });
  }

  function changeDocType(fileId: string, docType: DocType) {
    setFiles((prev) =>
      prev[fileId] ? { ...prev, [fileId]: { ...prev[fileId], docType } } : prev
    );
  }

  async function handleExcelUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setExcelUploading(true);
    setExcelError("");
    try {
      const fd = new FormData();
      fd.append("excel", file);
      await uploadExistingExcel(fd);
      setExcelDone(true);
    } catch (err) {
      setExcelError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setExcelUploading(false);
      if (excelInputRef.current) excelInputRef.current.value = "";
    }
  }

  async function handleProcess() {
    if (totalFiles === 0) {
      setError("Add at least one file before processing.");
      return;
    }
    setSubmitting(true);
    setError("");

    try {
      setProgress("Uploading files…");
      const fd = new FormData();

      const structure = fileList.map((uf, i) => ({
        fileKey: `file_${i}`,
        docType: uf.docType,
      }));
      fd.append("files", JSON.stringify(structure));
      fileList.forEach((uf, i) => fd.append(`file_${i}`, uf.file, uf.file.name));

      setProgress("Extracting data…");
      const result = await processUpload(fd);

      setProgress("Getting download link…");
      const url = await getMasterSheetUrl();

      setExtracted(result.extracted);
      setMasterSheetUrl(url);
      setStage("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
      setProgress("");
    }
  }

  function handleAddAnother() {
    setFiles({});
    setExtracted({});
    setMasterSheetUrl(null);
    setError("");
    setStage("upload");
  }

  if (stage === "done") {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h1 className="text-text-primary text-xl font-semibold">Row added to sheet</h1>
            <p className="text-text-muted text-sm mt-0.5">Extracted data has been appended to your master sheet.</p>
          </div>
        </div>

        {/* Extracted data review */}
        <div className="bg-card border border-border rounded-xl p-5 space-y-3">
          <h2 className="text-text-primary text-sm font-medium">Extracted fields</h2>
          {Object.keys(extracted).length === 0 ? (
            <p className="text-text-muted text-sm">No fields extracted.</p>
          ) : (
            <dl className="grid grid-cols-2 gap-x-6 gap-y-2">
              {Object.entries(extracted).map(([k, v]) => (
                <div key={k} className="min-w-0">
                  <dt className="text-text-muted text-xs font-mono truncate">{k.replace(/_/g, " ")}</dt>
                  <dd className="text-text-primary text-xs font-mono mt-0.5 truncate">{v}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          {masterSheetUrl && (
            <a
              href={masterSheetUrl}
              download="master_sheet.xlsx"
              className="flex items-center gap-2 bg-success/10 hover:bg-success/20 border border-success/30 text-success text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              Download Master Sheet
            </a>
          )}
          <button
            onClick={handleAddAnother}
            className="flex items-center gap-2 bg-accent hover:bg-blue-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
          >
            Add Another Person →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-text-primary text-xl font-semibold">Upload Documents</h1>
        <p className="text-text-muted text-sm mt-1">
          Drop all documents for this person. We&apos;ll extract the data and add a row to your master sheet.
        </p>
      </div>

      {/* Excel upload — only shown if no master sheet exists yet */}
      {!excelDone && (
        <div className="bg-card border border-border rounded-xl p-5 space-y-3">
          <div>
            <h2 className="text-text-primary text-sm font-medium">Upload your existing Excel sheet (optional)</h2>
            <p className="text-text-muted text-xs mt-1">
              We&apos;ll append new rows to your existing format. Skip this to use our default columns.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <input
              ref={excelInputRef}
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={handleExcelUpload}
            />
            <button
              onClick={() => excelInputRef.current?.click()}
              disabled={excelUploading}
              className="flex items-center gap-2 bg-bg border border-border hover:border-accent/50 text-text-primary text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {excelUploading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Uploading…
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                  Upload Excel
                </>
              )}
            </button>
            <span className="text-text-muted text-xs">.xlsx and .xls only</span>
          </div>
          {excelError && <p className="text-error text-xs font-mono">{excelError}</p>}
        </div>
      )}

      {excelDone && !hasMasterSheet && (
        <div className="flex items-center gap-2 text-success text-xs font-mono bg-success/5 border border-success/20 rounded-lg px-3 py-2">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Your Excel has been saved as the master sheet. New rows will match your column format.
        </div>
      )}

      {/* Drop zone */}
      <DropZone onFilesAdded={handleFilesAdded} currentCount={totalFiles} />

      {/* File list */}
      {totalFiles > 0 && (
        <>
          <FileList
            files={fileList}
            onRemove={removeFile}
            onDocTypeChange={changeDocType}
          />

          {error && <p className="text-error text-sm font-mono">{error}</p>}

          <div className="flex items-center justify-between pt-1">
            <p className={`text-xs font-mono ${hasUndetected ? "text-warning" : "text-text-muted"}`}>
              {submitting
                ? progress
                : hasUndetected
                ? "Select document type for all files"
                : `${totalFiles} file${totalFiles !== 1 ? "s" : ""} ready`}
            </p>
            <span
              title={hasUndetected ? "Please select document type for all files" : undefined}
              className="inline-block"
            >
              <button
                onClick={handleProcess}
                disabled={submitting || hasUndetected}
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
                  "Extract & Add to Sheet →"
                )}
              </button>
            </span>
          </div>
        </>
      )}
    </div>
  );
}
