"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function RefPage() {
  const router = useRouter();
  const params = useParams();
  const code = Array.isArray(params.code) ? params.code[0] : params.code;

  useEffect(() => {
    if (code) {
      // Store for 30 days; verify page reads and clears it on first login
      document.cookie = `docflow_ref=${encodeURIComponent(code)}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;
    }
    router.replace("/login");
  }, [code, router]);

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <p className="text-text-muted text-sm font-mono">Redirecting…</p>
    </div>
  );
}
