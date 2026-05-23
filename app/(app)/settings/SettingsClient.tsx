"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { referralUrl } from "@/lib/referral";

type Props = {
  orgId: string;
  initialName: string;
  email: string;
  notifyOnComplete: boolean;
  referralCode: string | null;
  referredCount: number;
};

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative w-10 h-5 rounded-full transition-colors ${
        checked ? "bg-accent" : "bg-border"
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

function SaveFeedback({ state }: { state: "idle" | "saving" | "saved" | "error" }) {
  if (state === "idle") return null;
  if (state === "saving") return <span className="text-text-muted text-xs font-mono">Saving…</span>;
  if (state === "saved") return <span className="text-success text-xs font-mono">Saved</span>;
  return <span className="text-error text-xs font-mono">Error saving</span>;
}

export default function SettingsClient({
  orgId,
  initialName,
  email,
  notifyOnComplete: initialNotify,
  referralCode,
  referredCount,
}: Props) {
  const [name, setName] = useState(initialName);
  const [nameSave, setNameSave] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [notify, setNotify] = useState(initialNotify);
  const [copied, setCopied] = useState(false);

  const refLink = referralCode ? referralUrl(referralCode) : null;
  const monthsEarned = Math.floor(referredCount / 3);

  async function saveName() {
    const trimmed = name.trim();
    if (!trimmed) return;
    setNameSave("saving");
    const supabase = createClient();
    const { error } = await supabase
      .from("organizations")
      .update({ name: trimmed })
      .eq("id", orgId);
    setNameSave(error ? "error" : "saved");
    setTimeout(() => setNameSave("idle"), 2500);
  }

  async function handleNotifyToggle(val: boolean) {
    setNotify(val);
    const supabase = createClient();
    await supabase
      .from("organizations")
      .update({ notify_on_complete: val })
      .eq("id", orgId);
  }

  function copyLink() {
    if (!refLink) return;
    navigator.clipboard.writeText(refLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="space-y-6">
      {/* Profile */}
      <section className="bg-card border border-border rounded-xl divide-y divide-border">
        <div className="px-6 py-4">
          <h2 className="text-text-primary text-sm font-medium">Profile</h2>
        </div>

        {/* Org name */}
        <div className="px-6 py-5 flex items-end gap-4">
          <div className="flex-1">
            <label className="block text-text-muted text-xs font-mono mb-1.5">
              Organisation name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && saveName()}
              placeholder="My Company"
              className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-text-primary text-sm font-mono focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2 pb-0.5">
            <SaveFeedback state={nameSave} />
            <button
              onClick={saveName}
              disabled={nameSave === "saving"}
              className="bg-accent hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Save
            </button>
          </div>
        </div>

        {/* Email */}
        <div className="px-6 py-5">
          <label className="block text-text-muted text-xs font-mono mb-1.5">
            Email address
          </label>
          <p className="text-text-primary text-sm font-mono">{email}</p>
          <p className="text-text-muted text-xs mt-1">
            Email cannot be changed. Contact support if needed.
          </p>
        </div>
      </section>

      {/* Notifications */}
      <section className="bg-card border border-border rounded-xl divide-y divide-border">
        <div className="px-6 py-4">
          <h2 className="text-text-primary text-sm font-medium">
            Notifications
          </h2>
        </div>
        <div className="px-6 py-5 flex items-center justify-between">
          <div>
            <p className="text-text-primary text-sm">Email on job complete</p>
            <p className="text-text-muted text-xs mt-0.5">
              Receive an email when a processing job finishes.
            </p>
          </div>
          <Toggle checked={notify} onChange={handleNotifyToggle} />
        </div>
      </section>

      {/* Referral */}
      <section className="bg-card border border-border rounded-xl divide-y divide-border">
        <div className="px-6 py-4">
          <h2 className="text-text-primary text-sm font-medium">Referrals</h2>
        </div>

        <div className="px-6 py-5 space-y-4">
          <p className="text-text-muted text-sm">
            Share your referral link. Earn 1 free month for every 3 people who
            sign up.
          </p>

          {refLink ? (
            <div className="flex items-center gap-2">
              <input
                readOnly
                value={refLink}
                className="flex-1 bg-bg border border-border rounded-lg px-3 py-2 text-text-muted text-xs font-mono focus:outline-none"
              />
              <button
                onClick={copyLink}
                className={`shrink-0 px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  copied
                    ? "border-success text-success bg-success/10"
                    : "border-border text-text-muted hover:border-accent hover:text-accent"
                }`}
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          ) : (
            <p className="text-text-muted text-xs font-mono">
              Referral code not generated yet. Sign out and back in to generate.
            </p>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-bg border border-border rounded-xl p-4">
              <p className="text-text-muted text-xs font-mono mb-1">
                People referred
              </p>
              <p className="text-text-primary text-2xl font-bold font-mono">
                {referredCount}
              </p>
            </div>
            <div className="bg-bg border border-border rounded-xl p-4">
              <p className="text-text-muted text-xs font-mono mb-1">
                Months earned
              </p>
              <p className="text-text-primary text-2xl font-bold font-mono">
                {monthsEarned}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
