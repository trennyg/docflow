"use client";

import { useState } from "react";
import PlanCard from "./PlanCard";
import { PLAN_ORDER, PlanKey } from "@/lib/constants";

type Props = {
  currentPlan: PlanKey;
};

export default function PlanSelector({ currentPlan }: Props) {
  const [annual, setAnnual] = useState(false);

  return (
    <div className="space-y-5">
      {/* Billing toggle */}
      <div className="flex items-center justify-between">
        <h2 className="text-text-primary text-sm font-medium">Plans</h2>
        <div className="flex items-center gap-3">
          <span
            className={`text-xs font-mono ${!annual ? "text-text-primary" : "text-text-muted"}`}
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
            className={`text-xs font-mono flex items-center gap-1.5 ${annual ? "text-text-primary" : "text-text-muted"}`}
          >
            Annual
            {annual && (
              <span className="text-success text-xs font-mono bg-success/10 border border-success/30 px-1.5 py-0.5 rounded">
                2 months free
              </span>
            )}
          </span>
        </div>
      </div>

      {/* Plan cards */}
      <div className="grid grid-cols-4 gap-3">
        {PLAN_ORDER.map((key) => (
          <PlanCard
            key={key}
            planKey={key}
            currentPlan={currentPlan}
            annual={annual}
          />
        ))}
      </div>
    </div>
  );
}
