"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSendOTP(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const digits = phone.replace(/\D/g, "");
    if (digits.length !== 10) {
      setError("Enter a valid 10-digit Indian mobile number.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: otpError } = await supabase.auth.signInWithOtp({
      phone: `+91${digits}`,
    });

    if (otpError) {
      setError(otpError.message);
      setLoading(false);
      return;
    }

    sessionStorage.setItem("docflow_phone", `+91${digits}`);
    router.push("/verify");
  }

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

        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-lg font-medium text-text-primary mb-1">Sign in</h2>
          <p className="text-text-muted text-sm mb-6">
            We&apos;ll send a one-time code to your mobile number.
          </p>

          <form onSubmit={handleSendOTP} className="space-y-4">
            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-text-muted mb-1.5 font-mono"
              >
                Mobile number
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-border bg-bg text-text-muted text-sm font-mono">
                  +91
                </span>
                <input
                  id="phone"
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                  placeholder="9876543210"
                  className="flex-1 bg-bg border border-border rounded-r-lg px-3 py-2.5 text-text-primary placeholder:text-text-muted text-sm font-mono focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                  required
                />
              </div>
            </div>

            {error && (
              <p className="text-error text-sm font-mono">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2.5 px-4 rounded-lg transition-colors text-sm"
            >
              {loading ? "Sending…" : "Send OTP"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
