export const PLANS = {
  free: {
    label: "Free",
    limit: 15,
    price: 0,
    annualPrice: 0,
    features: [
      "15 applicants / month",
      "PDF, JPG, PNG, HEIC",
      "KYC extraction",
      "Excel export",
    ],
  },
  starter: {
    label: "Starter",
    limit: 100,
    price: 199,
    annualPrice: 166,
    features: [
      "100 applicants / month",
      "Everything in Free",
      "Priority processing",
      "Email support",
    ],
  },
  growth: {
    label: "Growth",
    limit: 350,
    price: 499,
    annualPrice: 415,
    features: [
      "350 applicants / month",
      "Everything in Starter",
      "API access (coming soon)",
      "Phone support",
    ],
  },
  unlimited: {
    label: "Unlimited",
    limit: -1,
    price: 899,
    annualPrice: 749,
    features: [
      "Unlimited applicants",
      "Everything in Growth",
      "Dedicated account manager",
      "Custom integrations",
    ],
  },
} as const;

export type PlanKey = keyof typeof PLANS;

export const PLAN_ORDER: PlanKey[] = ["free", "starter", "growth", "unlimited"];

export const DOC_TYPES = [
  { value: "pan", label: "PAN Card" },
  { value: "aadhaar", label: "Aadhaar Card" },
  { value: "passport", label: "Passport" },
  { value: "payslip", label: "Payslip" },
  { value: "bank_statement", label: "Bank Statement" },
  { value: "itr", label: "ITR" },
  { value: "form16", label: "Form 16" },
  { value: "electricity", label: "Electricity Bill" },
  { value: "other", label: "Other" },
] as const;

export type DocType = (typeof DOC_TYPES)[number]["value"];

export function detectDocType(filename: string): DocType {
  const n = filename.toLowerCase();
  if (n.includes("pan")) return "pan";
  if (n.includes("aadhar") || n.includes("aadhaar")) return "aadhaar";
  if (n.includes("passport")) return "passport";
  if (n.includes("payslip") || n.includes("salary")) return "payslip";
  if (n.includes("bank") || n.includes("statement")) return "bank_statement";
  if (n.includes("itr")) return "itr";
  if (/form[\s_-]?16/.test(n)) return "form16";
  if (n.includes("electricity") || n.includes("bill")) return "electricity";
  return "other";
}

export function detectApplicantName(filename: string): string {
  const base = filename.replace(/\.[^.]+$/, "");
  const parts = base.split(/[_\-\s]+/).filter(Boolean);
  const docKw = [
    "pan", "aadhar", "aadhaar", "passport", "payslip", "salary",
    "bank", "statement", "itr", "form", "electricity", "bill",
    "kyc", "doc", "scan", "img", "image", "file",
  ];
  const name = parts.find(
    (p) => p.length >= 2 && !docKw.some((k) => p.toLowerCase().startsWith(k))
  );
  if (!name) return "Applicant 1";
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
}
