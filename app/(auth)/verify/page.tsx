"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { generateReferralCode } from "@/lib/referral";

function VerifyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (!emailParam) {
      router.replace("/login");
      return;
    }
    setEmail(emailParam);
    inputRefs.current[0]?.focus();
  }, [router, searchParams]);

  function handleChange(index: number, value: string) {
    if (!/^\d*$/.test(value)) return;
    const next = [...otp];
    next[index] = value.slice(-1);
    setOtp(next);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    const digits = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (digits.length === 6) {
      setOtp(digits.split(""));
      inputRefs.current[5]?.focus();
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    const token = otp.join("");
    if (token.length !== 6) {
      setError("Enter all 6 digits.");
      return;
    }

    setLoading(true);
    setError("");
    const supabase = createClient();

    const { data, error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "email",
    });

    if (verifyError) {
      setError(verifyError.message);
      setLoading(false);
      return;
    }

    const user = data.user;
    if (user) {
      const { data: existingOrg } = await supabase
        .from("organizations")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();

      if (!existingOrg) {
        const refCookie = document.cookie
          .split("; ")
          .find((r) => r.startsWith("docflow_ref="))
          ?.split("=")[1] ?? null;

        await supabase.from("organizations").insert({
          id: user.id,
          email,
          plan: "free",
          credits_used: 0,
          credits_limit: 15,
          referral_code: generateReferralCode(),
          notify_on_complete: true,
          referred_by: refCookie,
        });

        // Clear ref cookie after use
        if (refCookie) {
          document.cookie = "docflow_ref=; path=/; max-age=0";
        }
      }
    }

    router.replace("/dashboard");
  }

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <h2 className="text-lg font-medium text-text-primary mb-1">
        Enter OTP
      </h2>
      <p className="text-text-muted text-sm mb-6">
        We sent a 6-digit code to{" "}
        <span className="text-text-primary font-mono">{email}</span>
      </p>

      <form onSubmit={handleVerify} className="space-y-6">
        <div className="flex gap-2 justify-between" onPaste={handlePaste}>
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className="w-12 h-12 text-center text-lg font-mono text-text-primary bg-bg border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
            />
          ))}
        </div>

        {error && (
          <p className="text-error text-sm font-mono">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-accent hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2.5 px-4 rounded-lg transition-colors text-sm"
        >
          {loading ? "Verifying…" : "Verify"}
        </button>
      </form>

      <button
        onClick={() => router.push("/login")}
        className="w-full mt-3 text-text-muted hover:text-text-primary text-sm transition-colors"
      >
        ← Back to login
      </button>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold text-text-primary tracking-tight">
            Docflow
          </h1>
          <p className="text-text-muted text-sm mt-1">
            Document intelligence for Indian businesses
          </p>
        </div>
        <Suspense fallback={<div className="bg-card border border-border rounded-xl p-6 text-text-muted text-sm">Loading…</div>}>
          <VerifyForm />
        </Suspense>
      </div>
    </div>
  );
}
