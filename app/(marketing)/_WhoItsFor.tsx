"use client";

import { useState } from "react";

const TABS = [
  {
    id: "travel",
    label: "Travel Agencies",
    title: "For travel agencies",
    description:
      "Process visa applications 10x faster. Extract data from Aadhaar, PAN, passport, and bank statements for every client — automatically.",
    docs: ["PAN Card", "Aadhaar Card", "Passport", "Bank Statement", "ITR"],
    callout: "What used to take 4 hours per batch now takes under 10 minutes.",
  },
  {
    id: "hr",
    label: "HR Firms",
    title: "For HR & staffing firms",
    description:
      "Onboard new employees without the paperwork. Extract identity, address, and income proof details from every hire's documents.",
    docs: ["Aadhaar Card", "PAN Card", "Payslip", "Form 16"],
    callout:
      "Process 50 new hires' documents in the time it used to take for 5.",
  },
  {
    id: "ca",
    label: "CA Firms",
    title: "For CA & tax firms",
    description:
      "Stop manually entering data from ITR forms, Form 16, and bank statements. Every field, extracted and ready for your Excel.",
    docs: ["ITR", "Form 16", "Bank Statement", "PAN Card"],
    callout: "Cut data entry time by 90% during tax season.",
  },
  {
    id: "realestate",
    label: "Real Estate",
    title: "For real estate brokers",
    description:
      "Verify buyer and tenant KYC before closings. Get clean, structured data from every document in your pipeline.",
    docs: ["Aadhaar Card", "PAN Card", "Bank Statement", "Electricity Bill"],
    callout: "Clear KYC in minutes, not days.",
  },
] as const;

export default function WhoItsFor() {
  const [active, setActive] = useState(0);
  const tab = TABS[active];

  return (
    <div className="space-y-6">
      {/* Tab buttons */}
      <div className="flex gap-1 bg-card border border-border rounded-xl p-1 w-fit mx-auto">
        {TABS.map((t, i) => (
          <button
            key={t.id}
            onClick={() => setActive(i)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              active === i
                ? "bg-accent text-white"
                : "text-text-muted hover:text-text-primary"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="bg-card border border-border rounded-xl p-8 max-w-3xl mx-auto">
        <h3 className="text-text-primary text-xl font-semibold mb-3">
          {tab.title}
        </h3>
        <p className="text-text-muted text-sm leading-relaxed mb-6">
          {tab.description}
        </p>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-text-muted text-xs font-mono uppercase tracking-wider mb-3">
              Documents handled
            </p>
            <ul className="space-y-2">
              {tab.docs.map((doc) => (
                <li key={doc} className="flex items-center gap-2">
                  <svg
                    className="w-3.5 h-3.5 text-success shrink-0"
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
                  <span className="text-text-primary text-sm">{doc}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-center">
            <div className="bg-bg border border-border rounded-xl p-5 w-full">
              <p className="text-text-muted text-xs font-mono uppercase tracking-wider mb-2">
                Result
              </p>
              <p className="text-text-primary text-sm leading-relaxed">
                {tab.callout}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
