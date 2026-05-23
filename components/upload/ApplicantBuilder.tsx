"use client";

import { useState, useRef } from "react";
import FileQueue, { UploadFile } from "./FileQueue";
import { DocType } from "@/lib/constants";

export type Applicant = {
  id: string;
  label: string;
  fileIds: string[];
};

type Props = {
  files: Record<string, UploadFile>;
  applicants: Applicant[];
  onChange: (applicants: Applicant[]) => void;
  onRemoveFile: (fileId: string) => void;
  onDocTypeChange: (fileId: string, docType: DocType) => void;
};

export default function ApplicantBuilder({
  files,
  applicants,
  onChange,
  onRemoveFile,
  onDocTypeChange,
}: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dragState, setDragState] = useState<{
    fileId: string;
    fromApplicantId: string;
  } | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null);
  const editRef = useRef<HTMLInputElement>(null);

  function addApplicant() {
    onChange([
      ...applicants,
      {
        id: crypto.randomUUID(),
        label: `Applicant ${applicants.length + 1}`,
        fileIds: [],
      },
    ]);
  }

  function removeApplicant(id: string) {
    const target = applicants.find((a) => a.id === id);
    if (!target) return;
    // Orphaned files: move to first remaining group, or delete if none
    const remaining = applicants.filter((a) => a.id !== id);
    if (remaining.length > 0 && target.fileIds.length > 0) {
      onChange(
        remaining.map((a, i) =>
          i === 0 ? { ...a, fileIds: [...a.fileIds, ...target.fileIds] } : a
        )
      );
    } else {
      target.fileIds.forEach((fid) => onRemoveFile(fid));
      onChange(remaining);
    }
  }

  function renameApplicant(id: string, label: string) {
    onChange(applicants.map((a) => (a.id === id ? { ...a, label } : a)));
  }

  function handleDragStart(fileId: string, fromApplicantId: string) {
    setDragState({ fileId, fromApplicantId });
  }

  function handleDrop(toApplicantId: string) {
    if (!dragState) return;
    const { fileId, fromApplicantId } = dragState;
    if (fromApplicantId !== toApplicantId) {
      onChange(
        applicants.map((a) => {
          if (a.id === fromApplicantId)
            return { ...a, fileIds: a.fileIds.filter((id) => id !== fileId) };
          if (a.id === toApplicantId)
            return { ...a, fileIds: [...a.fileIds, fileId] };
          return a;
        })
      );
    }
    setDragState(null);
    setDropTarget(null);
  }

  return (
    <div className="space-y-3">
      {applicants.map((applicant, idx) => {
        const applicantFiles = applicant.fileIds
          .map((id) => files[id])
          .filter(Boolean) as UploadFile[];

        const isDropTarget = dropTarget === applicant.id && dragState?.fromApplicantId !== applicant.id;

        return (
          <div
            key={applicant.id}
            onDragOver={(e) => {
              e.preventDefault();
              setDropTarget(applicant.id);
            }}
            onDragLeave={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node))
                setDropTarget(null);
            }}
            onDrop={() => handleDrop(applicant.id)}
            className={`border rounded-xl p-4 transition-colors ${
              isDropTarget
                ? "border-accent bg-accent/5"
                : "border-border bg-card"
            }`}
          >
            {/* Header */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-text-muted text-xs font-mono w-6 shrink-0">
                {idx + 1}.
              </span>

              {editingId === applicant.id ? (
                <input
                  ref={editRef}
                  autoFocus
                  value={applicant.label}
                  onChange={(e) => renameApplicant(applicant.id, e.target.value)}
                  onBlur={() => setEditingId(null)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === "Escape")
                      setEditingId(null);
                  }}
                  className="flex-1 bg-bg border border-accent rounded px-2 py-0.5 text-text-primary text-sm font-medium focus:outline-none"
                />
              ) : (
                <button
                  onClick={() => setEditingId(applicant.id)}
                  className="flex-1 text-left text-text-primary text-sm font-medium group flex items-center gap-1.5"
                >
                  {applicant.label}
                  <svg
                    className="w-3 h-3 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                    />
                  </svg>
                </button>
              )}

              <span className="text-text-muted text-xs font-mono shrink-0">
                {applicantFiles.length} file{applicantFiles.length !== 1 ? "s" : ""}
              </span>

              {applicants.length > 1 && (
                <button
                  onClick={() => removeApplicant(applicant.id)}
                  className="text-text-muted hover:text-error text-xs transition-colors shrink-0"
                >
                  Remove
                </button>
              )}
            </div>

            {/* Files */}
            <FileQueue
              files={applicantFiles}
              applicantId={applicant.id}
              onRemove={onRemoveFile}
              onDocTypeChange={onDocTypeChange}
              onDragStart={handleDragStart}
            />

            {applicantFiles.length === 0 && (
              <div className="border border-dashed border-border rounded-lg py-5 text-center">
                <p className="text-text-muted text-xs">
                  {dragState ? "Drop here" : "No files — drag files here"}
                </p>
              </div>
            )}
          </div>
        );
      })}

      <button
        type="button"
        onClick={addApplicant}
        className="w-full border border-dashed border-border rounded-xl py-3 text-text-muted hover:text-text-primary hover:border-accent/40 text-sm transition-colors flex items-center justify-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add applicant group
      </button>
    </div>
  );
}
