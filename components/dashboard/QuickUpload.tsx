import Link from "next/link";

export default function QuickUpload() {
  return (
    <Link
      href="/app/upload"
      className="group flex items-center gap-4 bg-card border border-border hover:border-accent/50 rounded-xl px-6 py-5 transition-colors"
    >
      <div className="w-10 h-10 rounded-full bg-accent/10 group-hover:bg-accent/20 flex items-center justify-center shrink-0 transition-colors">
        <svg
          className="w-5 h-5 text-accent"
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
      <div className="flex-1">
        <p className="text-text-primary text-sm font-medium group-hover:text-accent transition-colors">
          Upload documents
        </p>
        <p className="text-text-muted text-xs mt-0.5">
          PDF, JPG, PNG, HEIC · KYC extraction
        </p>
      </div>
      <svg
        className="w-4 h-4 text-text-muted group-hover:text-accent transition-colors"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5l7 7-7 7"
        />
      </svg>
    </Link>
  );
}
