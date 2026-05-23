"use client";

import { useRef, useState } from "react";

const ACCEPTED_MIME = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/heic",
  "image/heif",
]);
const MAX_MB = 10;
const MAX_FILES = 50;

type Props = {
  onFilesAdded: (files: File[]) => void;
  currentCount: number;
};

export default function DropZone({ onFilesAdded, currentCount }: Props) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function filterFiles(raw: FileList | File[]): File[] {
    const arr = Array.from(raw);
    const valid = arr.filter((f) => {
      const okType =
        ACCEPTED_MIME.has(f.type) || f.name.toLowerCase().endsWith(".heic");
      const okSize = f.size <= MAX_MB * 1024 * 1024;
      return okType && okSize;
    });
    const slots = MAX_FILES - currentCount;
    return valid.slice(0, Math.max(0, slots));
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    onFilesAdded(filterFiles(e.dataTransfer.files));
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) onFilesAdded(filterFiles(e.target.files));
    e.target.value = "";
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragging(false);
      }}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`relative border-2 border-dashed rounded-xl p-12 text-center cursor-pointer select-none transition-colors ${
        dragging
          ? "border-accent bg-accent/5"
          : "border-border hover:border-accent/40 hover:bg-card/50"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        accept=".pdf,.jpg,.jpeg,.png,.heic"
        className="hidden"
        onChange={handleChange}
      />
      <div className="flex flex-col items-center gap-3 pointer-events-none">
        <div className="w-12 h-12 rounded-full bg-card border border-border flex items-center justify-center">
          <svg
            className="w-5 h-5 text-text-muted"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
            />
          </svg>
        </div>
        <div>
          <p className="text-text-primary text-sm font-medium">
            Drop files here or{" "}
            <span className="text-accent">click to browse</span>
          </p>
          <p className="text-text-muted text-xs mt-1">
            PDF, JPG, PNG, HEIC · max {MAX_MB} MB each · up to {MAX_FILES} files
          </p>
        </div>
        {currentCount > 0 && (
          <p className="text-text-muted text-xs font-mono">
            {currentCount} file{currentCount !== 1 ? "s" : ""} added ·{" "}
            {MAX_FILES - currentCount} remaining
          </p>
        )}
      </div>
    </div>
  );
}
