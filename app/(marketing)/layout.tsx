import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Docflow — Document intelligence for Indian businesses",
  description:
    "Upload your client documents. Get a structured Excel file in under 2 minutes. ₹199/month. First 15 clients free.",
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-bg">
      <nav className="border-b border-border sticky top-0 z-50 bg-bg/95 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link
            href="/"
            className="text-text-primary font-semibold tracking-tight"
          >
            Docflow
          </Link>
          <Link
            href="/login"
            className="text-text-muted hover:text-text-primary text-sm transition-colors"
          >
            Sign in →
          </Link>
        </div>
      </nav>
      {children}
    </div>
  );
}
