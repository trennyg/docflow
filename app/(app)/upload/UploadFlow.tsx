"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import DropZone from "@/components/upload/DropZone";
import FileList, { UploadFile } from "@/components/upload/FileList";
import PdfPagePicker from "@/components/upload/PdfPagePicker";
import { detectDocType, DocType } from "@/lib/constants";
import { processUpload, uploadExistingExcel, getMasterSheetUrl } from "./actions";

type Props = {
  orgId: string;
  devMode?: boolean;
  hasMasterSheet: boolean;
  creditsUsed: number;
  creditsLimit: number;
  addonPages: number;
};

type Stage = "upload" | "confirm" | "done";

// Count pages in a PDF by scanning the binary for /Count N in the page tree
async function countPdfPages(file: File): Promise<number> {
  try {
    const buffer = await file.arrayBuffer();
    // latin1 preserves raw bytes without throwing on binary content
    const text = new TextDecoder("latin1").decode(buffer);
    const match = text.match(/\/Count\s+(\d+)/);
    if (match) return parseInt(match[1], 10);
  } catch {
    // ignore
  }
  return 1;
}

function isPdf(file: File) {
  return file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
}

export default function UploadFlow({
  hasMasterSheet,
  creditsUsed,
  creditsLimit,
  addonPages,
}: Props) {
  const [files, setFiles] = useState<Record<string, UploadFile>>({});
  // PDF page selections: fileId → Set of 1-based page numbers that are checked
  const [pdfPages, setPdfPages] = useState<Record<string, Set<number>>>({});
  const [stage, setStage] = useState<Stage>("upload");
  const [extracted, setExtracted] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");
  const [masterSheetUrl, setMasterSheetUrl] = useState<string | null>(null);

  const [excelUploading, setExcelUploading] = useState(false);
  const [excelDone, setExcelDone] = useState(hasMasterSheet);
  const [excelError, setExcelError] = useState("");
  const excelInputRef = useRef<HTMLInputElement>(null);

  const fileList = Object.values(files);
  const totalFiles = fileList.length;
  const hasUndetected = fileList.some((f) => f.docType === "other");

  // Total selected pages: PDFs use pdfPages selections, images are always 1
  const totalSelectedPages = fileList.reduce((sum, uf) => {
    if (isPdf(uf.file)) {
      return sum + (pdfPages[uf.id]?.size ?? uf.pageCount ?? 1);
    }
    return sum + 1;
  }, 0);

  const remainingPages = Math.max(0, creditsLimit - creditsUsed) + addonPages;
  const overLimit = totalSelectedPages > remainingPages;

  // When a new PDF is added, count its pages and initialise all pages as checked
  useEffect(() => {
    const uncounted = fileList.filter(
      (uf) => isPdf(uf.file) && uf.pageCount === undefined
    );
    if (uncounted.length === 0) return;

    uncounted.forEach(async (uf) => {
      const count = await countPdfPages(uf.file);
      setFiles((prev) =>
        prev[uf.id] ? { ...prev, [uf.id]: { ...prev[uf.id], pageCount: count } } : prev
      );
      // Initialise all pages as selected
      setPdfPages((prev) => ({
        ...prev,
        [uf.id]: new Set(Array.from({ length: count }, (_, i) => i + 1)),
      }));
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalFiles]);

  const handleFilesAdded = useCallback((newFiles: File[]) => {
    const next: Record<string, UploadFile> = {};
    newFiles.forEach((file) => {
      const id = crypto.randomUUID();
      // pageCount undefined until counted asynchronously for PDFs
      next[id] = {
        id,
        file,
        docType: detectDocType(file.name),
        pageCount: isPdf(file) ? undefined : 1,
      };
    });
    setFiles((prev) => ({ ...prev, ...next }));
  }, []);

  function removeFile(fileId: string) {
    setFiles((prev) => {
      const next = { ...prev };
      delete next[fileId];
      return next;
    });
    setPdfPages((prev) => {
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

  function togglePdfPage(fileId: string, page: number, checked: boolean) {
    setPdfPages((prev) => {
      const current = new Set(prev[fileId] ?? []);
      if (checked) current.add(page);
      else current.delete(page);
      return { ...prev, [fileId]: current };
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

  function handleReview() {
    if (totalFiles === 0) {
      setError("Add at least one file before processing.");
      return;
    }
    setError("");
    setStage("confirm");
  }

  async function handleProcess() {
    setSubmitting(true);
    setError("");

    try {
      setProgress("Uploading files…");
      const fd = new FormData();

      // For PDFs, only pass selected pages. For images, pass the whole file.
      // Since we can't slice PDF pages client-side without pdfjs rendering,
      // we pass the full PDF and the selected page indices to the server.
      const structure = fileList.map((uf, i) => ({
        fileKey: `file_${i}`,
        docType: uf.docType,
        pages: isPdf(uf.file) ? Array.from(pdfPages[uf.id] ?? []).sort((a, b) => a - b) : null,
        pageCount: isPdf(uf.file) ? (pdfPages[uf.id]?.size ?? 1) : 1,
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
    setPdfPages({});
    setExtracted({});
    setMasterSheetUrl(null);
    setError("");
    setStage("upload");
  }

  // ── Done screen ───────────────────────────────────────────────────────────
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
            <p className="text-text-muted text-sm mt-0.5">Extracted data appended to your master sheet.</p>
          </div>
        </div>

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

  // ── Confirmation screen ───────────────────────────────────────────────────
  if (stage === "confirm") {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-text-primary text-xl font-semibold">Confirm extraction</h1>
          <p className="text-text-muted text-sm mt-1">Review page selections before processing.</p>
        </div>

        {/* Page count summary */}
        <div className={`rounded-xl border px-5 py-4 flex items-center justify-between ${
          overLimit ? "bg-error/5 border-error/30" : "bg-card border-border"
        }`}>
          <div>
            <p className="text-text-primary text-sm font-medium">
              {totalSelectedPages} page{totalSelectedPages !== 1 ? "s" : ""} selected
            </p>
            <p className={`text-xs font-mono mt-0.5 ${overLimit ? "text-error" : "text-text-muted"}`}>
              {overLimit
                ? `Exceeds your ${remainingPages} remaining page${remainingPages !== 1 ? "s" : ""}. Deselect pages or buy more.`
                : `${remainingPages} pages remaining → ${remainingPages - totalSelectedPages} after this extraction`}
            </p>
          </div>
          <p className="text-text-primary text-2xl font-bold font-mono shrink-0">
            {totalSelectedPages}
            <span className="text-text-muted text-sm font-normal ml-1">/ {remainingPages}</span>
          </p>
        </div>

        {/* Per-file breakdown with PDF page pickers */}
        <div className="space-y-3">
          {fileList.map((uf) => {
            const filePages = isPdf(uf.file) ? (pdfPages[uf.id]?.size ?? uf.pageCount ?? 1) : 1;
            return (
              <div key={uf.id} className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
                  <span className="text-text-primary text-xs font-mono flex-1 truncate">{uf.file.name}</span>
                  <span className="text-text-muted text-xs font-mono shrink-0">
                    {filePages} page{filePages !== 1 ? "s" : ""}
                  </span>
                </div>
                {isPdf(uf.file) && uf.pageCount && uf.pageCount > 1 && (
                  <div className="p-4">
                    <PdfPagePicker
                      file={uf.file}
                      pageCount={uf.pageCount}
                      selected={pdfPages[uf.id] ?? new Set()}
                      onToggle={(page, checked) => togglePdfPage(uf.id, page, checked)}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {overLimit && (
          <div className="bg-error/5 border border-error/30 rounded-xl px-4 py-3">
            <p className="text-error text-sm font-medium">Not enough pages remaining</p>
            <p className="text-text-muted text-xs mt-0.5">
              Deselect pages above, or{" "}
              <a href="/billing" className="text-accent hover:underline">buy extra pages</a>
              {" "}that never expire.
            </p>
          </div>
        )}

        {error && <p className="text-error text-sm font-mono">{error}</p>}

        <div className="flex gap-3">
          <button
            onClick={() => setStage("upload")}
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
              `Extract ${totalSelectedPages} page${totalSelectedPages !== 1 ? "s" : ""} →`
            )}
          </button>
        </div>
      </div>
    );
  }

  // ── Upload screen ─────────────────────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-text-primary text-xl font-semibold">Upload Documents</h1>
        <p className="text-text-muted text-sm mt-1">
          Drop all documents for this person. We&apos;ll extract the data and add a row to your master sheet.
        </p>
      </div>

      {/* Excel upload — only if no master sheet yet */}
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
          Your Excel has been saved. New rows will match your column format.
        </div>
      )}

      <DropZone onFilesAdded={handleFilesAdded} currentCount={totalFiles} />

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
              {hasUndetected
                ? "Select document type for all files"
                : `${totalSelectedPages} page${totalSelectedPages !== 1 ? "s" : ""} · ${remainingPages} remaining`}
            </p>
            <span
              title={hasUndetected ? "Please select document type for all files" : undefined}
              className="inline-block"
            >
              <button
                onClick={handleReview}
                disabled={hasUndetected}
                className="bg-accent hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium px-6 py-2.5 rounded-lg transition-colors text-sm"
              >
                Extract & Add to Sheet →
              </button>
            </span>
          </div>
        </>
      )}
    </div>
  );
}
