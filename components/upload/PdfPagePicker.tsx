"use client";

import { useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";

// Use the bundled worker from node_modules
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.mjs",
  import.meta.url
).toString();

type Props = {
  file: File;
  pageCount: number;
  selected: Set<number>;
  onToggle: (page: number, checked: boolean) => void;
};

type ThumbnailState = Record<number, string>; // page → data URL

export default function PdfPagePicker({ file, pageCount, selected, onToggle }: Props) {
  const [thumbnails, setThumbnails] = useState<ThumbnailState>({});
  const taskRef = useRef<AbortController | null>(null);

  useEffect(() => {
    taskRef.current?.abort();
    const controller = new AbortController();
    taskRef.current = controller;

    async function renderThumbnails() {
      try {
        const buffer = await file.arrayBuffer();
        if (controller.signal.aborted) return;
        const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
        if (controller.signal.aborted) return;

        for (let i = 1; i <= pdf.numPages; i++) {
          if (controller.signal.aborted) return;
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 0.4 });
          const canvas = document.createElement("canvas");
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const ctx = canvas.getContext("2d");
          if (!ctx) continue;
          await page.render({ canvasContext: ctx, viewport, canvas }).promise;
          const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
          if (controller.signal.aborted) return;
          setThumbnails((prev) => ({ ...prev, [i]: dataUrl }));
        }
      } catch {
        // Silently fail — checkboxes still work without thumbnails
      }
    }

    renderThumbnails();
    return () => controller.abort();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file]);

  const selectedCount = selected.size;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-text-muted text-xs font-mono">
          {selectedCount} of {pageCount} page{pageCount !== 1 ? "s" : ""} selected
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => Array.from({ length: pageCount }, (_, i) => i + 1).forEach((p) => !selected.has(p) && onToggle(p, true))}
            className="text-accent text-xs hover:underline"
          >
            Select all
          </button>
          <button
            onClick={() => Array.from(selected).forEach((p) => onToggle(p, false))}
            className="text-text-muted text-xs hover:underline"
          >
            Deselect all
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
        {Array.from({ length: pageCount }, (_, i) => i + 1).map((page) => {
          const thumb = thumbnails[page];
          const isChecked = selected.has(page);
          return (
            <label
              key={page}
              className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-colors select-none ${
                isChecked ? "border-accent" : "border-border opacity-50"
              }`}
            >
              <input
                type="checkbox"
                checked={isChecked}
                onChange={(e) => onToggle(page, e.target.checked)}
                className="sr-only"
              />
              {thumb ? (
                <img src={thumb} alt={`Page ${page}`} className="w-full aspect-[3/4] object-cover bg-bg" />
              ) : (
                <div className="w-full aspect-[3/4] bg-bg flex items-center justify-center">
                  <svg className="w-4 h-4 text-text-muted/40 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25" />
                  </svg>
                </div>
              )}
              <div className={`absolute bottom-0 left-0 right-0 text-center text-xs font-mono py-0.5 ${isChecked ? "bg-accent text-white" : "bg-bg/80 text-text-muted"}`}>
                {page}
              </div>
              {isChecked && (
                <div className="absolute top-1 right-1 w-4 h-4 bg-accent rounded-full flex items-center justify-center">
                  <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </label>
          );
        })}
      </div>
    </div>
  );
}
