export const PLANS = {
  free: {
    label: "Free",
    limit: 45,
    price: 0,
    annualPrice: 0,
    features: [
      "45 documents / month",
      "PDF, JPG, PNG, HEIC",
      "KYC extraction",
      "Excel export",
    ],
  },
  starter: {
    label: "Starter",
    limit: 300,
    price: 199,
    annualPrice: 166,
    features: [
      "300 documents / month",
      "Everything in Free",
      "Priority processing",
      "Email support",
    ],
  },
  growth: {
    label: "Growth",
    limit: 1050,
    price: 499,
    annualPrice: 415,
    features: [
      "1,050 documents / month",
      "Everything in Starter",
      "API access (coming soon)",
      "Phone support",
    ],
  },
  unlimited: {
    label: "Unlimited",
    limit: 15000,
    price: 899,
    annualPrice: 749,
    features: [
      "15,000 documents / month",
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

// Returns null when the filename looks generic (WhatsApp upload, camera timestamp, etc.)
// so UploadFlow can assign "Applicant N" numbering instead.
export function detectApplicantName(filename: string): string | null {
  const base = filename.replace(/\.[^.]+$/, "");

  // WhatsApp exports: "WhatsApp Image 2024-01-15 at 10.30.45"
  if (/whatsapp/i.test(base)) return null;

  // Phone camera / app patterns: IMG_20240115_103045, Screenshot_2024-01-15, PANO_…
  if (/^(img|image|photo|screenshot|pano|pic|dsc|copy|scan)[\s_\-]?\d/i.test(base)) return null;

  // Bare date or timestamp filenames: 20240115_103045 or 2024-01-15
  if (/^\d{4}[\-_.]?\d{2}[\-_.]?\d{2}/.test(base)) return null;

  const parts = base.split(/[_\-\s]+/).filter(Boolean);
  const docKw = [
    "pan", "aadhar", "aadhaar", "passport", "payslip", "salary",
    "bank", "statement", "itr", "form", "electricity", "bill",
    "kyc", "doc", "scan", "img", "image", "file", "photo", "whatsapp",
  ];

  const name = parts.find(
    (p) =>
      p.length >= 2 &&
      !docKw.some((k) => p.toLowerCase().startsWith(k)) &&
      !/^\d+$/.test(p)
  );

  if (!name) return null;
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
}
