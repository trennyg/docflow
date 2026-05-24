export const PLANS: Record<string, { label: string; limit: number; price: number; annualPrice: number; features: string[] }> = {
  free: {
    label: "Free",
    limit: 30,
    price: 0,
    annualPrice: 0,
    features: [
      "30 pages / month",
      "PDF, JPG, PNG, HEIC",
      "KYC extraction",
      "Excel export",
    ],
  },
  starter: {
    label: "Starter",
    limit: 130,
    price: 199,
    annualPrice: 166,
    features: [
      "130 pages / month",
      "Everything in Free",
      "Priority processing",
      "Email support",
    ],
  },
  growth: {
    label: "Growth",
    limit: 330,
    price: 499,
    annualPrice: 415,
    features: [
      "330 pages / month",
      "Everything in Starter",
      "API access (coming soon)",
      "Phone support",
    ],
  },
  unlimited: {
    label: "Unlimited",
    limit: 600,
    price: 899,
    annualPrice: 749,
    features: [
      "600 pages / month",
      "Everything in Growth",
      "Dedicated account manager",
      "Custom integrations",
    ],
  },
};

export type PlanKey = "free" | "starter" | "growth" | "unlimited";

export const PLAN_ORDER: PlanKey[] = ["free", "starter", "growth", "unlimited"];

export const ADDON_PACKS = [
  { id: "small",  pages: 50,  price: 75  },
  { id: "medium", pages: 130, price: 199 },
  { id: "large",  pages: 330, price: 499 },
  { id: "bulk",   pages: 666, price: 999 },
] as const;

export type AddonPackId = (typeof ADDON_PACKS)[number]["id"];

export const DOC_TYPES = [
  { value: "pan",           label: "PAN Card" },
  { value: "aadhaar",       label: "Aadhaar Card" },
  { value: "passport",      label: "Passport" },
  { value: "payslip",       label: "Payslip" },
  { value: "bank_statement",label: "Bank Statement" },
  { value: "itr",           label: "ITR" },
  { value: "form16",        label: "Form 16" },
  { value: "electricity",   label: "Electricity Bill" },
  { value: "index2",        label: "Index 2" },
  { value: "car_quotation", label: "Car Quotation" },
  { value: "other",         label: "Other" },
] as const;

export type DocType = (typeof DOC_TYPES)[number]["value"];

export function detectDocType(filename: string): DocType {
  const n = filename.toLowerCase();
  if (n.includes("pan")) return "pan";
  if (n.includes("aadhar") || n.includes("aadhaar")) return "aadhaar";
  if (n.includes("passport")) return "passport";
  if (n.includes("payslip") || n.includes("salary")) return "payslip";
  if (n.includes("bank") || n.includes("statement") || n.includes("passbook")) return "bank_statement";
  if (n.includes("itr") || n.includes("income tax") || n.includes("acknowledgment")) return "itr";
  if (/form[\s_-]?16/.test(n) || n.includes("tds certificate")) return "form16";
  if (n.includes("index 2") || n.includes("index2") || n.includes("registration")) return "index2";
  if (n.includes("quotation") || n.includes("vehicle") || n.includes("car insurance")) return "car_quotation";
  if (n.includes("electricity") || n.includes("mseb") || n.includes("bescom") || n.includes("tneb") || n.includes("bill")) return "electricity";
  return "other";
}

// Returns null when the filename looks generic (WhatsApp upload, camera timestamp, etc.)
export function detectApplicantName(filename: string): string | null {
  const base = filename.replace(/\.[^.]+$/, "");

  if (/whatsapp/i.test(base)) return null;
  if (/^(img|image|photo|screenshot|pano|pic|dsc|copy|scan)[\s_\-]?\d/i.test(base)) return null;
  if (/^\d{4}[\-_.]?\d{2}[\-_.]?\d{2}/.test(base)) return null;

  const parts = base.split(/[_\-\s]+/).filter(Boolean);
  const docKw = [
    "pan", "aadhar", "aadhaar", "passport", "payslip", "salary",
    "bank", "statement", "itr", "form", "electricity", "bill",
    "kyc", "doc", "scan", "img", "image", "file", "photo", "whatsapp",
    "index", "quotation", "vehicle", "registration",
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

export type FieldKey =
  | "name" | "pan_number" | "aadhaar_number" | "dob" | "phone"
  | "address" | "father_name" | "gender" | "passport_number"
  | "employer" | "salary" | "email" | "pincode" | "city" | "state"
  // bank
  | "account_number" | "account_type" | "branch_name" | "ifsc_code"
  // itr
  | "itr_year" | "acknowledgment_number"
  // form 16
  | "form16_year" | "certificate_number"
  // index 2
  | "property_address" | "buyer_name" | "seller_name" | "property_value" | "registration_date"
  // car quotation
  | "vehicle_make" | "vehicle_model" | "quotation_amount" | "on_road_price" | "dealer_name"
  // electricity
  | "consumer_number" | "units_consumed" | "electricity_provider";

export const COLUMN_MAPPINGS: Record<FieldKey, string[]> = {
  // Core KYC fields
  name:                ["full name", "name", "applicant name", "customer name", "client name", "candidate name", "employee name", "member name", "naam", "poora naam"],
  pan_number:          ["pan", "pan no", "pan no.", "pan number", "pan card", "permanent account number", "income tax pan", "it pan"],
  aadhaar_number:      ["aadhaar", "aadhar", "adhar", "uid", "uidai", "aadhaar no", "aadhar number", "aadhaar card", "aadhaar id"],
  dob:                 ["dob", "date of birth", "birth date", "d.o.b", "d.o.b.", "birthdate", "date of birth (dd/mm/yyyy)", "janm tithi"],
  phone:               ["mobile", "phone", "contact", "mobile no", "phone no", "contact no", "mobile number", "phone number", "cell", "mob", "mob no", "whatsapp", "whatsapp no"],
  address:             ["address", "residence", "home address", "residential address", "current address", "permanent address", "full address", "address (as per aadhaar)", "pata"],
  father_name:         ["father", "father name", "father's name", "f/n", "father's full name", "papa ka naam", "s/o", "son of"],
  gender:              ["gender", "sex", "m/f", "male/female", "ling"],
  passport_number:     ["passport", "passport no", "passport number", "pp no", "travel document"],
  employer:            ["employer", "company", "organisation", "organization", "office", "firm", "company name", "employer name"],
  salary:              ["salary", "income", "monthly salary", "gross salary", "net salary", "ctc", "monthly income", "take home"],
  email:               ["email", "email id", "e-mail", "mail", "email address"],
  pincode:             ["pincode", "pin", "zip", "pin code", "postal code"],
  city:                ["city", "town", "sheher", "district"],
  state:               ["state", "pradesh", "province"],
  // Bank fields
  account_number:      ["account number", "acc number", "acc no", "account no", "a/c number", "a/c no", "bank account", "bank acc"],
  account_type:        ["account type", "acc type", "type of account", "a/c type", "savings/current"],
  branch_name:         ["branch", "branch name", "bank branch", "branch address"],
  ifsc_code:           ["ifsc", "ifsc code", "ifsc no", "bank code", "rtgs code", "neft code"],
  // ITR fields
  itr_year:            ["itr year", "assessment year", "ay", "financial year", "fy", "year of filing"],
  acknowledgment_number: ["acknowledgment number", "ack number", "ack no", "acknowledgement number", "itr ack", "receipt number"],
  // Form 16 fields
  form16_year:         ["form 16 year", "financial year", "fy", "assessment year", "ay"],
  certificate_number:  ["certificate number", "cert no", "certificate no", "tds certificate number"],
  // Index 2 fields
  property_address:    ["property address", "property location", "site address", "flat address", "plot address"],
  buyer_name:          ["buyer", "buyer name", "purchaser", "purchaser name"],
  seller_name:         ["seller", "seller name", "vendor", "vendor name"],
  property_value:      ["property value", "sale value", "consideration amount", "sale price", "market value", "stamp duty value"],
  registration_date:   ["registration date", "reg date", "date of registration", "execution date"],
  // Car quotation fields
  vehicle_make:        ["make", "manufacturer", "brand", "car brand", "vehicle brand"],
  vehicle_model:       ["model", "car model", "vehicle model", "variant"],
  quotation_amount:    ["ex showroom price", "ex-showroom", "showroom price"],
  on_road_price:       ["on road price", "on-road price", "total price", "road price", "final price", "total on road", "on road total"],
  dealer_name:         ["dealer", "dealer name", "showroom", "showroom name", "dealership"],
  // Electricity fields
  consumer_number:     ["consumer number", "consumer no", "ca number", "service number", "meter number"],
  units_consumed:      ["units consumed", "units", "energy consumed", "kwh", "electricity units"],
  electricity_provider:["provider", "discom", "electricity board", "power company", "utility", "mseb", "bescom", "tneb", "bses", "tata power", "adani electricity"],
};

// Reverse lookup: normalized alias → field key (built once at module load)
const _reverseMap: Record<string, FieldKey> = {};
for (const [field, aliases] of Object.entries(COLUMN_MAPPINGS) as [FieldKey, string[]][]) {
  for (const alias of aliases) {
    _reverseMap[alias] = field;
  }
}

export function matchColumn(header: string): FieldKey | null {
  return _reverseMap[header.toLowerCase().trim()] ?? null;
}

export function mapColumnsToFields(headers: string[]): Record<string, FieldKey> {
  const result: Record<string, FieldKey> = {};
  for (const header of headers) {
    const field = matchColumn(header);
    if (field) result[header] = field;
  }
  return result;
}
