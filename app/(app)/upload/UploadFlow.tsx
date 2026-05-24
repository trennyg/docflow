"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import DropZone from "@/components/upload/DropZone";
import FlatFileList, { UploadFile, isPdf, selectedPageCount } from "@/components/upload/FlatFileList";
import { detectDocType, DocType } from "@/lib/constants";
import { processUpload, uploadExistingExcel, getMasterSheetUrl } from "./actions";
import Link from "next/link";

type Props = {
  orgId: string;
  devMode?: boolean;
  hasMasterSheet: boolean;
  creditsUsed: number;
  creditsLimit: number;
  addonPages: number;
};

type Stage = "upload" | "confirm" | "done";

// Binary-scan PDF page count — latin1 preserves raw bytes without errors
async function countPdfPages(file: File): Promise<number> {
  try {
    const buf = await file.arrayBuffer();
    const text = new TextDecoder("latin1").decode(buf);
    const m = text.match(/\/Count\s+(\d+)/);
    if (m) return parseInt(m[1], 10);
  } catch { /* ignore */ }
  return 1;
}

export default function UploadFlow({
  hasMasterSheet,
  creditsUsed,
  creditsLimit,
  addonPages,
}: Props) {
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
  const hasUndetected = fileList.some((f) => f.docType === "other");
  const totalSelectedPages = fileList.reduce((sum, uf) => sum + selectedPageCount(uf), 0);
  const remainingPages = Math.max(0, creditsLimit - creditsUsed) + addonPages;
  const overLimit = totalSelectedPages > remainingPages && creditsLimit !== -1;

  // Count pages for new PDFs as they arrive
  useEffect(() => {
    const uncounted = fileList.filter((uf) => isPdf(uf.file) && uf.pageCount === undefined);
    uncounted.forEach(async (uf) => {
      const count = await countPdfPages(uf.file);
      setFiles((prev) =>
        prev[uf.id] ? { ...prev, [uf.id]: { ...prev[uf.id], pageCount: count } } : prev
      );
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileList.length]);

  const handleFilesAdded = useCallback((newFiles: File[]) => {
    setFiles((prev) => {
      const next = { ...prev };
      newFiles.forEach((file) => {
        const id = crypto.randomUUID();
        next[id] = {
          id,
          file,
          docType: detectDocType(file.name),
          pageCount: isPdf(file) ? undefined : 1,
          removedPages: new Set(),
        };
      });
      return next;
    });
  }, []);

  function removeFile(id: string) {
    setFiles((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }

  function changeDocType(id: string, docType: DocType) {
    setFiles((prev) =>
      prev[id] ? { ...prev, [id]: { ...prev[id], docType } } : prev
    );
  }

  function removePage(fileId: string, page: number) {
    setFiles((prev) => {
      if (!prev[fileId]) return prev;
      const removed = new Set(prev[fileId].removedPages);
      removed.add(page);
      return { ...prev, [fileId]: { ...prev[fileId], removedPages: removed } };
    });
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
    setSubmitting(true);
    setError("");
    try {
      setProgress("Uploading files…");
      const fd = new FormData();
      const structure = fileList.map((uf, i) => ({
        fileKey: `file_${i}`,
        docType: uf.docType,
        pageCount: selectedPageCount(uf),
        pages: isPdf(uf.file)
          ? Array.from({ length: uf.pageCount ?? 1 }, (_, k) => k + 1).filter(
              (p) => !uf.removedPages.has(p)
            )
          : null,
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
      setStage("upload");
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

  // ── Done ─────────────────────────────────────────────────────────────────
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
            <h1 className="text-text-primary text-xl font-semibold">Row added to master sheet</h1>
            <p className="text-text-muted text-sm mt-0.5">Extracted data appended successfully.</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5 space-y-3">
          <h2 className="text-text-primary text-sm font-medium">Extracted fields</h2>
          {Object.keys(extracted).length === 0 ? (
            <p className="text-text-muted text-sm">No fields extracted.</p>
          ) : (
            <dl className="grid grid-cols-2 gap-x-6 gap-y-2.5">
              {Object.entries(extracted).map(([k, v]) => (
                <div key={k} className="min-w-0">
                  <dt className="text-text-muted text-xs font-mono truncate capitalize">{k.replace(/_/g, " ")}</dt>
                  <dd className="text-text-primary text-xs font-mono mt-0.5 truncate">{v}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>

        <div className="flex gap-3 flex-wrap">
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

  // ── Confirm ───────────────────────────────────────────────────────────────
  if (stage === "confirm") {
    const pagesAfter = remainingPages - totalSelectedPages;
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-text-primary text-xl font-semibold">Confirm extraction</h1>
          <p className="text-text-muted text-sm mt-1">Review page usage before processing.</p>
        </div>

        <div className={`rounded-xl border px-5 py-5 space-y-3 ${overLimit ? "bg-error/5 border-error/30" : "bg-card border-border"}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-primary text-sm font-medium">
                This upload uses{" "}
                <span className="font-mono font-bold">{totalSelectedPages}</span>{" "}
                page{totalSelectedPages !== 1 ? "s" : ""}
              </p>
              <p className={`text-xs font-mono mt-0.5 ${overLimit ? "text-error" : "text-text-muted"}`}>
                {overLimit
                  ? `Exceeds available pages. Deselect pages or buy more.`
                  : `${pagesAfter.toLocaleString()} pages remaining after this extraction`}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-text-muted text-xs font-mono">Available</p>
              <p className="text-text-primary font-mono font-bold text-lg">{remainingPages.toLocaleString()}</p>
            </div>
          </div>

          {/* File breakdown */}
          <div className="border-t border-border pt-3 space-y-1.5">
            {fileList.map((uf) => (
              <div key={uf.id} className="flex items-center justify-between">
                <span className="text-text-muted text-xs font-mono truncate flex-1">{uf.file.name}</span>
                <span className="text-text-primary text-xs font-mono shrink-0 ml-4">
                  {selectedPageCount(uf)} pg
                </span>
              </div>
            ))}
          </div>
        </div>

        {overLimit && (
          <div className="bg-error/5 border border-error/30 rounded-xl px-4 py-3 flex items-start gap-3">
            <svg className="w-4 h-4 text-error shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m9.303 3.376c.866 1.5-.217 3.374-1.948 3.374H4.645c-1.73 0-2.813-1.874-1.948-3.374l7.427-12.748c.866-1.5 3.032-1.5 3.898 0l7.427 12.748zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            <div>
              <p className="text-error text-sm font-medium">Not enough pages</p>
              <p className="text-text-muted text-xs mt-0.5">
                Go back and remove pages, or{" "}
                <Link href="/billing" className="text-accent hover:underline">buy extra pages</Link>
                {" "}that never expire.
              </p>
            </div>
          </div>
        )}

        {error && <p className="text-error text-sm font-mono">{error}</p>}

        <div className="flex gap-3">
          <button
            onClick={() => { setError(""); setStage("upload"); }}
            className="flex-1 bg-bg border border-border hover:border-accent/40 text-text-primary text-sm font-medium py-2.5 rounded-lg transition-colors"
          >
            ← Back
          </button>
          <button
            onClick={handleProcess}
            disabled={submitting || overLimit}
            className="flex-1 bg-accent hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg transition-colors text-sm flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                {progress}
              </>
            ) : (
              `Confirm & Extract →`
            )}
          </button>
        </div>
      </div>
    );
  }

  // ── Upload ────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-text-primary text-xl font-semibold">Upload Documents</h1>
        <p className="text-text-muted text-sm mt-1">
          Drop all documents for one person. We&apos;ll extract the data and add a row to your master sheet.
        </p>
      </div>

      {/* Excel upload section — only shown until master sheet exists */}
      {!excelDone && (
        <div className="bg-card border border-border rounded-xl p-5 space-y-3">
          <div>
            <h2 className="text-text-primary text-sm font-medium">Upload your existing Excel sheet <span className="text-text-muted font-normal">(optional)</span></h2>
            <p className="text-text-muted text-xs mt-1">
              We&apos;ll match your columns automatically and append new rows in your format.
              Skip this to use our default columns.
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
              className="flex items-center gap-2 bg-bg border border-border hover:border-accent/50 text-text-primary text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
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

      {/* Confirmation that Excel was just uploaded this session */}
      {excelDone && !hasMasterSheet && (
        <div className="flex items-center gap-2 text-success text-xs font-mono bg-success/5 border border-success/20 rounded-lg px-3 py-2">
          <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Your Excel has been saved. New rows will match your column format.
        </div>
      )}

      <DropZone onFilesAdded={handleFilesAdded} currentCount={fileList.length} />

      {fileList.length > 0 && (
        <>
          <FlatFileList
            files={fileList}
            onRemoveFile={removeFile}
            onDocTypeChange={changeDocType}
            onRemovePage={removePage}
          />

          {error && <p className="text-error text-sm font-mono">{error}</p>}

          <div className="flex items-center justify-between pt-1">
            <p className={`text-xs font-mono ${hasUndetected ? "text-warning" : "text-text-muted"}`}>
              {hasUndetected
                ? "Select document type for all files"
                : `${totalSelectedPages} page${totalSelectedPages !== 1 ? "s" : ""} · ${remainingPages.toLocaleString()} remaining`}
            </p>
            <button
              onClick={() => setStage("confirm")}
              disabled={hasUndetected || fileList.length === 0}
              title={hasUndetected ? "Select document type for all files first" : undefined}
              className="bg-accent hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium px-6 py-2.5 rounded-lg transition-colors text-sm"
            >
              Extract & Add to Sheet →
            </button>
          </div>
        </>
      )}
    </div>
  );
}
