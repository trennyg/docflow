"use client";

import { ADDON_PACKS } from "@/lib/constants";

export default function AddonPacks() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-text-primary text-sm font-medium">Buy extra pages — never expire</h2>
        <p className="text-text-muted text-xs mt-0.5">
          Add-on pages stack on top of your monthly plan and roll over indefinitely.
        </p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {ADDON_PACKS.map((pack) => (
          <div
            key={pack.id}
            className="bg-card border border-border rounded-xl p-4 flex flex-col gap-3 hover:border-accent/40 transition-colors"
          >
            <div>
              <p className="text-text-primary text-lg font-bold font-mono">
                {pack.pages.toLocaleString()}
                <span className="text-text-muted text-sm font-normal ml-1">pages</span>
              </p>
              <p className="text-text-muted text-xs font-mono mt-0.5">
                ₹{pack.price} · ₹{(pack.price / pack.pages).toFixed(2)}/page
              </p>
            </div>
            <button
              disabled
              title="Payments coming soon"
              className="w-full bg-accent/10 hover:bg-accent/20 border border-accent/30 text-accent text-xs font-medium py-1.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ₹{pack.price} — Buy now
            </button>
          </div>
        ))}
      </div>
      <p className="text-text-muted text-xs font-mono">
        Payments via Razorpay — coming soon
      </p>
    </div>
  );
}
