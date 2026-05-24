"use client";

import { DOC_TYPES, DocType } from "@/lib/constants";

export type UploadFile = {
  id: string;
  file: File;
  docType: DocType;
  pageCount?: number; // undefined while PDF is being counted
};

type Props = {
  files: UploadFile[];
  onRemove: (fileId: string) => void;
  onDocTypeChange: (fileId: string, docType: DocType) => void;
};

function pageLabel(uf: UploadFile) {
  const isPdf = uf.file.type === "application/pdf" || uf.file.name.toLowerCase().endsWith(".pdf");
  if (!isPdf) return "1 pg";
  if (uf.pageCount === undefined) return "counting…";
  return `${uf.pageCount} pg${uf.pageCount !== 1 ? "s" : ""}`;
}

function fmtSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileIcon(filename: string) {
  const ext = filename.split(".").pop()?.toLowerCase();
  const color = ext === "pdf" ? "text-error" : "text-accent";
  return (
    <svg className={`w-4 h-4 shrink-0 ${color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  );
}

export default function FileList({ files, onRemove, onDocTypeChange }: Props) {
  if (files.length === 0) return null;
  return (
    <div className="space-y-1.5">
      {files.map((uf) => {
        const { id, file, docType } = uf;
        return (
        <div key={id} className="flex items-center gap-2.5 bg-bg border border-border rounded-lg px-3 py-2 group hover:border-border/80 transition-colors" data-file-id={id}>
          {fileIcon(file.name)}

          <span className="text-text-primary text-xs flex-1 truncate font-mono">{file.name}</span>

          <span className="text-text-muted text-xs font-mono shrink-0">{fmtSize(file.size)}</span>
          <span className="text-text-muted text-xs font-mono shrink-0">{pageLabel(uf)}</span>

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
            onClick={() => onRemove(id)}
            className="text-text-muted hover:text-error transition-colors opacity-0 group-hover:opacity-100 shrink-0"
            title="Remove file"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        );
      })}
    </div>
  );
}
