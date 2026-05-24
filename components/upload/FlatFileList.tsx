"use client";

import dynamic from "next/dynamic";
import { DOC_TYPES, DocType } from "@/lib/constants";

const PagePreview = dynamic(() => import("./PagePreview"), { ssr: false, loading: () => null });

export type UploadFile = {
  id: string;
  file: File;
  docType: DocType;
  pageCount?: number;        // total pages in PDF; undefined while counting
  removedPages: Set<number>; // 1-based pages the user has removed
};

export function isPdf(file: File) {
  return file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
}

export function selectedPageCount(uf: UploadFile): number {
  if (!isPdf(uf.file)) return 1;
  if (uf.pageCount === undefined) return 1;
  return Math.max(0, uf.pageCount - uf.removedPages.size);
}

type Props = {
  files: UploadFile[];
  onRemoveFile: (id: string) => void;
  onDocTypeChange: (id: string, docType: DocType) => void;
  onRemovePage: (fileId: string, page: number) => void;
};

function fmtSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function pageLabel(uf: UploadFile) {
  if (!isPdf(uf.file)) return "1 pg";
  if (uf.pageCount === undefined) return "counting…";
  const sel = selectedPageCount(uf);
  return uf.removedPages.size > 0
    ? `${sel} / ${uf.pageCount} pgs`
    : `${uf.pageCount} pg${uf.pageCount !== 1 ? "s" : ""}`;
}

function FileIcon({ filename }: { filename: string }) {
  const isPdfFile = filename.toLowerCase().endsWith(".pdf");
  return (
    <svg className={`w-4 h-4 shrink-0 ${isPdfFile ? "text-error" : "text-accent"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  );
}

export default function FlatFileList({ files, onRemoveFile, onDocTypeChange, onRemovePage }: Props) {
  if (files.length === 0) return null;

  return (
    <div className="space-y-2">
      {files.map((uf) => {
        const { id, file, docType } = uf;
        const showPreview = isPdf(file) && uf.pageCount !== undefined && uf.pageCount > 1;

        return (
          <div key={id} className="bg-bg border border-border rounded-lg overflow-hidden">
            {/* File row */}
            <div className="flex items-center gap-2.5 px-3 py-2 group">
              <FileIcon filename={file.name} />

              <span className="text-text-primary text-xs flex-1 truncate font-mono">{file.name}</span>

              <span className="text-text-muted text-xs font-mono shrink-0">{fmtSize(file.size)}</span>
              <span className={`text-xs font-mono shrink-0 ${uf.pageCount === undefined && isPdf(file) ? "text-text-muted animate-pulse" : "text-text-muted"}`}>
                {pageLabel(uf)}
              </span>

              <select
                value={docType}
                onChange={(e) => onDocTypeChange(id, e.target.value as DocType)}
                className={`bg-card text-xs rounded px-1.5 py-1 font-mono focus:outline-none focus:ring-1 shrink-0 max-w-[140px] ${
                  docType === "other"
                    ? "border border-warning text-warning focus:ring-warning"
                    : "border border-border text-text-muted focus:ring-accent"
                }`}
              >
                {docType === "other" && (
                  <option value="other" disabled>Select document type</option>
                )}
                {DOC_TYPES.filter(({ value }) => value !== "other").map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>

              <button
                onClick={() => onRemoveFile(id)}
                className="text-text-muted hover:text-error transition-colors opacity-0 group-hover:opacity-100 shrink-0"
                title="Remove file"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Inline page preview for multi-page PDFs */}
            {showPreview && (
              <div className="px-3 pb-3 border-t border-border/50 pt-2">
                <PagePreview
                  file={file}
                  pageCount={uf.pageCount!}
                  removedPages={uf.removedPages}
                  onRemovePage={(page) => onRemovePage(id, page)}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
