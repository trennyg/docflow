"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DevLoginClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleEnter() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/dev-login", { method: "POST" });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Failed to create dev session");

      const maxAge = 60 * 60 * 8; // 8 hours
      document.cookie = `dev_bypass=true; path=/; max-age=${maxAge}; SameSite=Lax`;
      document.cookie = `dev_org_id=${body.orgId}; path=/; max-age=${maxAge}; SameSite=Lax`;

      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
      <div className="bg-[#111111] border border-[#D97706]/30 rounded-xl p-8 max-w-sm w-full text-center space-y-5">
        <div className="space-y-1.5">
          <p className="text-[#D97706] text-xs font-mono uppercase tracking-wider">
            Development only
          </p>
          <h1 className="text-[#F9FAFB] font-semibold text-lg">Dev Login</h1>
          <p className="text-[#6B7280] text-sm leading-relaxed">
            Bypasses Supabase auth and creates a test organisation. Never
            available in production.
          </p>
        </div>
        {error && (
          <p className="text-[#DC2626] text-sm font-mono">{error}</p>
        )}
        <button
          onClick={handleEnter}
          disabled={loading}
          className="w-full bg-[#2563EB] hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2.5 rounded-lg text-sm font-medium transition-colors"
        >
          {loading ? "Setting up…" : "Enter as Test User"}
        </button>
      </div>
    </div>
  );
}
