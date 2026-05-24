"use client";

import { useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.mjs",
  import.meta.url
).toString();

type Props = {
  file: File;
  pageCount: number;
  removedPages: Set<number>; // 1-based page numbers
  onRemovePage: (page: number) => void;
};

export default function PagePreview({ file, pageCount, removedPages, onRemovePage }: Props) {
  const [thumbnails, setThumbnails] = useState<Record<number, string>>({});
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setThumbnails({});

    (async () => {
      try {
        const buffer = await file.arrayBuffer();
        if (controller.signal.aborted) return;
        const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;

        for (let i = 1; i <= pdf.numPages; i++) {
          if (controller.signal.aborted) return;
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 0.35 });
          const canvas = document.createElement("canvas");
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const ctx = canvas.getContext("2d")!;
          await page.render({ canvasContext: ctx, viewport, canvas }).promise;
          if (controller.signal.aborted) return;
          setThumbnails((prev) => ({ ...prev, [i]: canvas.toDataURL("image/jpeg", 0.6) }));
        }
      } catch {
        // Silently fall back — page counts still work, just no thumbnails
      }
    })();

    return () => controller.abort();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file]);

  const visiblePages = Array.from({ length: pageCount }, (_, i) => i + 1).filter(
    (p) => !removedPages.has(p)
  );
  const selectedCount = visiblePages.length;
  const canRemove = selectedCount > 1; // prevent removing the last page

  if (selectedCount === 0) {
    return (
      <p className="text-warning text-xs font-mono py-2">
        All pages removed — this file won&apos;t be processed. Remove the file or add fewer exclusions.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-text-muted text-xs font-mono">
        {selectedCount} of {pageCount} page{pageCount !== 1 ? "s" : ""} selected
      </p>
      <div className="flex flex-wrap gap-2">
        {visiblePages.map((page) => (
          <div key={page} className="relative group/thumb">
            {thumbnails[page] ? (
              <img
                src={thumbnails[page]}
                alt={`Page ${page}`}
                className="h-20 w-auto rounded border border-border object-cover bg-bg"
              />
            ) : (
              <div className="h-20 w-14 rounded border border-border bg-bg flex items-center justify-center">
                <span className="text-text-muted text-xs font-mono">{page}</span>
              </div>
            )}
            {/* Page number badge */}
            <span className="absolute bottom-0 left-0 right-0 text-center text-xs font-mono bg-black/50 text-white rounded-b py-0.5 leading-none">
              {page}
            </span>
            {/* Remove button — only when >1 page remaining */}
            {canRemove && (
              <button
                onClick={() => onRemovePage(page)}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-error rounded-full flex items-center justify-center opacity-0 group-hover/thumb:opacity-100 transition-opacity shadow-sm"
                title={`Remove page ${page}`}
              >
                <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
