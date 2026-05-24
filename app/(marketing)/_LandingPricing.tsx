"use client";

import { useState } from "react";
import Link from "next/link";
import { PLAN_ORDER, PLANS } from "@/lib/constants";

export default function LandingPricing() {
  const [annual, setAnnual] = useState(false);

  return (
    <div className="space-y-8">
      {/* Toggle */}
      <div className="flex items-center justify-center gap-4">
        <span
          className={`text-sm font-mono ${!annual ? "text-text-primary" : "text-text-muted"}`}
        >
          Monthly
        </span>
        <button
          onClick={() => setAnnual((v) => !v)}
          className={`relative w-10 h-5 rounded-full transition-colors ${
            annual ? "bg-accent" : "bg-border"
          }`}
          aria-label="Toggle annual billing"
        >
          <span
            className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
              annual ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
        <span
          className={`text-sm font-mono flex items-center gap-2 ${annual ? "text-text-primary" : "text-text-muted"}`}
        >
          Annual
          {annual && (
            <span className="text-success text-xs bg-success/10 border border-success/30 px-2 py-0.5 rounded-full">
              2 months free
            </span>
          )}
        </span>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {PLAN_ORDER.map((key) => {
          const plan = PLANS[key];
          const isFree = plan.price === 0;
          const price = annual ? plan.annualPrice : plan.price;
          const isStarter = key === "starter";

          return (
            <div
              key={key}
              className={`relative flex flex-col rounded-xl border p-5 ${
                isStarter
                  ? "border-accent bg-accent/5 shadow-[0_0_0_1px_theme(colors.accent)]"
                  : "border-border bg-card"
              }`}
            >
              {isStarter && (
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-accent text-white text-xs font-mono px-2.5 py-0.5 rounded-full whitespace-nowrap">
                  Most popular
                </span>
              )}

              {isFree && (
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-card border border-border text-text-muted text-xs font-mono px-2.5 py-0.5 rounded-full whitespace-nowrap">
                  Start here
                </span>
              )}

              <div className="mb-4">
                <h3 className="text-text-primary font-semibold">{plan.label}</h3>
                <div className="mt-1.5 flex items-baseline gap-1">
                  {isFree ? (
                    <span className="text-text-primary text-2xl font-bold font-mono">
                      Free
                    </span>
                  ) : (
                    <>
                      <span className="text-text-muted text-sm font-mono">₹</span>
                      <span className="text-text-primary text-2xl font-bold font-mono">
                        {price}
                      </span>
                      <span className="text-text-muted text-xs font-mono">/mo</span>
                    </>
                  )}
                </div>
                {!isFree && annual && (
                  <p className="text-success text-xs font-mono mt-0.5">
                    ₹{price * 12}/yr · 2 months free
                  </p>
                )}
                <p className="text-text-muted text-xs font-mono mt-1">
                  {plan.limit === -1
                    ? "Unlimited pages"
                    : `${plan.limit.toLocaleString()} pages/mo`}
                </p>
              </div>

              <ul className="flex-1 space-y-2 mb-5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <svg
                      className="w-3.5 h-3.5 text-success shrink-0 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="text-text-muted text-xs">{f}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/login"
                className={`block text-center py-2 rounded-lg text-sm font-medium transition-colors ${
                  isStarter
                    ? "bg-accent hover:bg-blue-700 text-white"
                    : isFree
                    ? "bg-bg hover:bg-border/50 text-text-primary border border-border"
                    : "bg-card hover:bg-border/30 text-text-primary border border-border"
                }`}
              >
                {isFree ? "Start free" : "Get started"}
              </Link>
            </div>
          );
        })}
      </div>

      <p className="text-center text-text-muted text-xs">
        No credit card required for free plan · Cancel anytime · All amounts in INR
      </p>
    </div>
  );
}
