\# Docflow — Claude Code Instructions (v2)



\---



\## CRITICAL — GIT \& DEPLOYMENT RULE

Separate repository from relentlessais.com. Never mix codebases.

All changes committed to Docflow repository only.

When making major changes: new branch → changes → merge into main.

Never run `git init` in the wrong directory.



\---



\## CRITICAL — LOW FRICTION PRINCIPLE

Every decision evaluated against: "Does this add any step, thought, or confusion for the client?"

If yes — remove it, automate it, or pre-fill it.



\---



\## CRITICAL — DEBUGGING WORKFLOW

Before fixing any bug:

1\. Print full contents of every relevant file

2\. Read the actual code — never diagnose from visual assumptions

3\. Only then write and apply the fix



\---



\## Product Overview



Docflow is a document intelligence SaaS for Indian businesses.

Extracts structured data from KYC and compliance documents.

Eliminates manual data entry entirely.



\*\*Core workflow:\*\*

ONE SUBMISSION = ONE APPLICANT = ONE ROW APPENDED TO MASTER SHEET



Client dumps all documents for one person → Docflow extracts data → 

one new row appended to their master Excel sheet → repeat for next person.



\*\*Docflow Basic\*\* — KYC \& Document Onboarding

Target: travel agencies, HR firms, CA firms, real estate agents.

Output: rows appended to client's master Excel sheet.



\*\*Docflow Pro\*\* — Loan Verification Reports (build after Basic)

Target: NBFCs, DSAs, lending firms.

Output: complete due diligence report (PDF + Excel) per loan application.



\---



\## Pricing



\### Billing unit: PAGES (not documents, not applicants)

\- Images (JPG/PNG/HEIC): always 1 page each

\- PDFs: actual page count

\- Rate: ₹1.50 per page effectively

\- Clients buy page allowances via plans or add-on packs



\### Docflow Basic Plans

| Plan | Price | Pages/month |

|------|-------|-------------|

| Free | ₹0 | 30 pages |

| Starter | ₹199/mo | 130 pages |

| Growth | ₹499/mo | 330 pages |

| Unlimited | ₹899/mo | 600 pages |

Annual: 2 months free on all paid plans.



\### Add-on Page Packs (never expire, stack on monthly plan)

| Pack | Price | Pages |

|------|-------|-------|

| Small | ₹75 | 50 pages |

| Medium | ₹199 | 130 pages |

| Large | ₹499 | 330 pages |

| Bulk | ₹999 | 666 pages |



\### Docflow Pro (build after Basic)

Credit packs (never expire):

| Pack | Price | Reports | Per Report |

|------|-------|---------|------------|

| Starter | ₹1,249 | 25 | ₹50 |

| Standard | ₹2,799 | 60 | ₹46 |

| Growth | ₹5,499 | 130 | ₹42 |

| Volume | ₹11,999 | 300 | ₹40 |



\---



\## Tech Stack

Frontend:    Next.js 14 (App Router) · TypeScript · Tailwind CSS

Backend:     FastAPI (Python 3.11) — Hetzner (not built yet, mock all calls)

Database:    Supabase (PostgreSQL + Auth + Storage)

Queue:       Redis + Celery (async processing)

OCR:         Tesseract (clean PDFs) + EasyOCR (card photos)

Extraction:  Regex (standard docs) + Groq/Llama 3 (variable docs)

AI Summary:  OpenAI GPT-4o (Pro only)

Billing:     Razorpay (subscriptions + credit packs)

Storage:     Supabase Storage

Deploy:      Vercel (Next.js) · Hetzner CPX31 (FastAPI)

Email:       Resend (transactional)

PDF Preview: PDF.js (client-side page thumbnails)



\---



\## Colors (tailwind.config.ts)

bg:             '#0A0A0A'

card:           '#111111'

accent:         '#2563EB'

success:        '#16A34A'

warning:        '#D97706'

error:          '#DC2626'

text-primary:   '#F9FAFB'

text-muted:     '#6B7280'

border:         '#1F2937'



\## Fonts

Inter (display/body) + DM Mono (labels, tags, numbers, code)



\---



\## Repository Structure

docflow/

├── app/

│   ├── (marketing)/

│   │   ├── page.tsx              ← Landing page

│   │   ├── pricing/page.tsx

│   │   ├── how-it-works/page.tsx

│   │   ├── ref/\[code]/page.tsx   ← Referral landing

│   │   └── layout.tsx

│   ├── (auth)/

│   │   ├── login/page.tsx        ← Email OTP entry

│   │   ├── verify/page.tsx       ← OTP verification

│   │   └── layout.tsx

│   ├── (app)/

│   │   ├── layout.tsx            ← Sidebar + header

│   │   ├── dashboard/page.tsx

│   │   ├── upload/

│   │   │   ├── page.tsx

│   │   │   └── UploadFlow.tsx

│   │   ├── jobs/

│   │   │   ├── page.tsx

│   │   │   └── \[id]/page.tsx

│   │   ├── billing/page.tsx

│   │   └── settings/page.tsx

│   ├── api/

│   │   ├── upload/route.ts

│   │   ├── jobs/route.ts

│   │   ├── dev-login/route.ts    ← Dev only

│   │   ├── billing/

│   │   │   ├── subscribe/route.ts

│   │   │   ├── credits/route.ts

│   │   │   └── portal/route.ts

│   │   └── webhooks/

│   │       └── razorpay/route.ts

│   ├── dev-login/page.tsx        ← Dev only, never in production

│   └── globals.css

├── components/

│   ├── upload/

│   │   ├── DropZone.tsx

│   │   ├── FlatFileList.tsx      ← Flat file list, no grouping

│   │   ├── PagePreview.tsx       ← PDF page thumbnails + removal

│   │   └── ProcessingStatus.tsx

│   ├── dashboard/

│   │   ├── UsageBar.tsx

│   │   ├── RecentJobs.tsx

│   │   └── QuickUpload.tsx

│   ├── billing/

│   │   ├── PlanCard.tsx

│   │   ├── AddonPacks.tsx

│   │   └── UsageHistory.tsx

│   └── ui/

│       ├── Button.tsx

│       ├── Badge.tsx

│       ├── Card.tsx

│       ├── Modal.tsx

│       ├── Toast.tsx

│       └── Spinner.tsx

├── lib/

│   ├── supabase/

│   │   ├── client.ts

│   │   ├── server.ts

│   │   └── middleware.ts

│   ├── razorpay.ts

│   ├── api.ts                    ← Typed fetch wrapper, mocks FastAPI

│   └── constants.ts              ← Plans, limits, pricing, mappings

├── backend/                      ← FastAPI (not built yet)

├── supabase/

│   └── migrations/               ← All SQL saved here

└── .env.local.example



\---



\## Database Schema



```sql

CREATE TABLE organizations (

&#x20; id                UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),

&#x20; name              TEXT,

&#x20; email             TEXT,

&#x20; phone             TEXT,

&#x20; plan              TEXT DEFAULT 'free',

&#x20; plan\_type         TEXT DEFAULT 'basic',

&#x20; billing\_cycle     TEXT DEFAULT 'monthly',

&#x20; credits\_used      INTEGER DEFAULT 0,      -- pages used this month

&#x20; credits\_limit     INTEGER DEFAULT 30,     -- pages allowed this month

&#x20; addon\_pages       INTEGER DEFAULT 0,      -- never resets

&#x20; column\_mapping    JSONB DEFAULT '{}',     -- client's Excel column mapping

&#x20; has\_master\_sheet  BOOLEAN DEFAULT false,  -- has uploaded their Excel

&#x20; razorpay\_customer\_id TEXT,

&#x20; razorpay\_subscription\_id TEXT,

&#x20; referral\_code     TEXT UNIQUE,

&#x20; referred\_by       TEXT,

&#x20; notify\_on\_complete BOOLEAN DEFAULT true,

&#x20; created\_at        TIMESTAMPTZ DEFAULT NOW(),

&#x20; reset\_at          TIMESTAMPTZ DEFAULT NOW()

);



CREATE TABLE users (

&#x20; id          UUID PRIMARY KEY REFERENCES auth.users(id),

&#x20; org\_id      UUID NOT NULL REFERENCES organizations(id),

&#x20; role        TEXT DEFAULT 'owner',

&#x20; created\_at  TIMESTAMPTZ DEFAULT NOW()

);



CREATE TABLE jobs (

&#x20; id            UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),

&#x20; org\_id        UUID NOT NULL REFERENCES organizations(id),

&#x20; status        TEXT DEFAULT 'queued',

&#x20; job\_type      TEXT DEFAULT 'basic',

&#x20; page\_count    INTEGER DEFAULT 0,          -- pages charged for this job

&#x20; output\_path   TEXT,

&#x20; error\_message TEXT,

&#x20; created\_at    TIMESTAMPTZ DEFAULT NOW(),

&#x20; completed\_at  TIMESTAMPTZ

);



CREATE TABLE applicants (

&#x20; id          UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),

&#x20; job\_id      UUID NOT NULL REFERENCES jobs(id),

&#x20; org\_id      UUID NOT NULL REFERENCES organizations(id),

&#x20; extracted   JSONB DEFAULT '{}',

&#x20; status      TEXT DEFAULT 'pending',

&#x20; created\_at  TIMESTAMPTZ DEFAULT NOW()

);



CREATE TABLE documents (

&#x20; id            UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),

&#x20; applicant\_id  UUID NOT NULL REFERENCES applicants(id),

&#x20; job\_id        UUID NOT NULL REFERENCES jobs(id),

&#x20; org\_id        UUID NOT NULL REFERENCES organizations(id),

&#x20; doc\_type      TEXT,

&#x20; storage\_path  TEXT NOT NULL,

&#x20; page\_count    INTEGER DEFAULT 1,

&#x20; ocr\_engine    TEXT,

&#x20; raw\_text      TEXT,

&#x20; extracted     JSONB DEFAULT '{}',

&#x20; confidence    FLOAT,

&#x20; status        TEXT DEFAULT 'pending',

&#x20; created\_at    TIMESTAMPTZ DEFAULT NOW()

);

```



\---



\## Core Logic



\### Upload Flow (current)



Client lands on /upload

If no master sheet: show Excel upload option at top

"Upload your existing Excel sheet — we'll match your columns"

Drop zone: "Drop all documents for this person"

Files appear as flat list — no grouping

PDFs: convert to page thumbnails via PDF.js



Client can remove individual pages

Show: "8 of 12 pages selected · 127 pages remaining"





Images: 1 page each

Each file has doc type dropdown (auto-detected, warning if unknown)

Process button disabled until all files have doc type selected

Before processing: show page count confirmation

"This upload uses 8 pages · 127 pages remaining after"

\[Confirm \& Extract →]

On complete: show extracted data + \[Download Master Sheet] + \[Add Another Person →]





\### Excel Master Sheet Logic



Master sheet stored at: org\_id/master\_sheet.xlsx in Supabase Storage

First time (client uploads their Excel):



Read column headers

Auto-map using matchColumn() from constants.ts

Save mapping to organizations.column\_mapping

Save as master sheet





First time (client skips Excel upload):



Create default sheet with standard columns on first extraction





Every extraction:



Append one row to master sheet

Use column\_mapping to place values in correct columns

Unmapped columns left blank

Our columns not in their sheet appended on the right









\### Page Counting



Images (JPG/PNG/HEIC): 1 page each

PDFs: actual page count via PDF.js (client-side)

Client can remove PDF pages before processing

Only selected pages uploaded and charged

credits\_used incremented by actual pages processed

Total available = credits\_limit - credits\_used + addon\_pages





\### Billing Model



credits\_used: pages used this month (resets 1st of month)

credits\_limit: plan page allowance

addon\_pages: purchased add-on pages (never resets)

Total pages available = credits\_limit - credits\_used + addon\_pages

Block upload if pages\_in\_upload > total\_pages\_available





\---



\## Document Types \& Fields



| Document | Fields Extracted |

|----------|-----------------|

| PAN Card | pan\_number, name, dob, father\_name |

| Aadhaar | aadhaar\_number, name, dob, gender, address |

| Passport | passport\_number, name, dob, expiry, nationality |

| Bank Statement | account\_number, account\_type, branch\_name, ifsc\_code, bank\_name |

| ITR | itr\_year, acknowledgment\_number, pan\_number, gross\_income |

| Form 16 | form16\_year, certificate\_number, employer, gross\_salary, tds |

| Index 2 | property\_address, buyer\_name, seller\_name, property\_value, registration\_date |

| Car Quotation | vehicle\_make, vehicle\_model, on\_road\_price, quotation\_amount, dealer\_name |

| Electricity Bill | consumer\_number, name, address, units\_consumed, electricity\_provider |

| Payslip | employer, employee\_id, gross\_salary, net\_salary, month |



\### Doc Type Detection (from filename)

```ts

pan / pan card → pan

aadhar / aadhaar → aadhaar

passport → passport

bank / statement / passbook → bank\_statement

itr / income tax / acknowledgment → itr

form16 / form 16 / tds certificate → form16

index 2 / index2 / registration → index2

quotation / car / vehicle → car\_quotation

electricity / bill / mseb / bescom / tneb → electricity

payslip / salary → payslip

anything else → unknown (show warning, block processing)

```



\---



\## Column Mappings (lib/constants.ts)



All matching is case-insensitive (normalize to lowercase before comparing).



```ts

COLUMN\_MAPPINGS = {

&#x20; name: \['full name', 'name', 'applicant name', 'customer name', 

&#x20;        'client name', 'candidate name', 'employee name', 'member name', 

&#x20;        'naam', 'poora naam'],

&#x20; 

&#x20; pan\_number: \['pan', 'pan no', 'pan no.', 'pan number', 'pan card',

&#x20;              'permanent account number', 'income tax pan', 'it pan'],

&#x20; 

&#x20; aadhaar\_number: \['aadhaar', 'aadhar', 'adhar', 'uid', 'uidai',

&#x20;                  'aadhaar no', 'aadhar number', 'aadhaar card', 'aadhaar id'],

&#x20; 

&#x20; dob: \['dob', 'date of birth', 'birth date', 'd.o.b', 'd.o.b.',

&#x20;       'birthdate', 'date of birth (dd/mm/yyyy)', 'janm tithi'],

&#x20; 

&#x20; phone: \['mobile', 'phone', 'contact', 'mobile no', 'phone no',

&#x20;         'contact no', 'mobile number', 'phone number', 'cell',

&#x20;         'mob', 'mob no', 'whatsapp', 'whatsapp no'],

&#x20; 

&#x20; address: \['address', 'residence', 'home address', 'residential address',

&#x20;           'current address', 'permanent address', 'full address',

&#x20;           'address (as per aadhaar)', 'pata'],

&#x20; 

&#x20; father\_name: \['father', 'father name', "father's name", 'f/n',

&#x20;               "father's full name", 'papa ka naam', 's/o', 'son of'],

&#x20; 

&#x20; gender: \['gender', 'sex', 'm/f', 'male/female', 'ling'],

&#x20; 

&#x20; passport\_number: \['passport', 'passport no', 'passport number',

&#x20;                   'pp no', 'travel document'],

&#x20; 

&#x20; account\_number: \['account number', 'acc number', 'acc no', 'account no',

&#x20;                  'a/c number', 'a/c no', 'bank account', 'bank acc'],

&#x20; 

&#x20; account\_type: \['account type', 'acc type', 'type of account',

&#x20;                'a/c type', 'savings/current'],

&#x20; 

&#x20; branch\_name: \['branch', 'branch name', 'bank branch', 'branch address'],

&#x20; 

&#x20; ifsc\_code: \['ifsc', 'ifsc code', 'ifsc no', 'bank code',

&#x20;             'rtgs code', 'neft code'],

&#x20; 

&#x20; itr\_year: \['itr year', 'assessment year', 'ay', 'financial year',

&#x20;            'fy', 'year of filing'],

&#x20; 

&#x20; acknowledgment\_number: \['acknowledgment number', 'ack number', 'ack no',

&#x20;                         'acknowledgement number', 'itr ack', 'receipt number'],

&#x20; 

&#x20; form16\_year: \['form 16 year', 'financial year', 'fy', 'assessment year', 'ay'],

&#x20; 

&#x20; certificate\_number: \['certificate number', 'cert no', 'certificate no',

&#x20;                      'tds certificate number'],

&#x20; 

&#x20; property\_address: \['property address', 'property location', 'site address',

&#x20;                    'flat address', 'plot address'],

&#x20; 

&#x20; buyer\_name: \['buyer', 'buyer name', 'purchaser', 'purchaser name'],

&#x20; 

&#x20; seller\_name: \['seller', 'seller name', 'vendor', 'vendor name'],

&#x20; 

&#x20; property\_value: \['property value', 'sale value', 'consideration amount',

&#x20;                  'sale price', 'market value', 'stamp duty value'],

&#x20; 

&#x20; registration\_date: \['registration date', 'reg date', 'date of registration',

&#x20;                     'execution date'],

&#x20; 

&#x20; vehicle\_make: \['make', 'manufacturer', 'brand', 'car brand', 'vehicle brand'],

&#x20; 

&#x20; vehicle\_model: \['model', 'car model', 'vehicle model', 'variant'],

&#x20; 

&#x20; on\_road\_price: \['on road price', 'on-road price', 'total price', 'road price',

&#x20;                 'final price', 'total on road', 'on road total'],

&#x20; 

&#x20; quotation\_amount: \['ex showroom price', 'ex-showroom', 'showroom price'],

&#x20; 

&#x20; dealer\_name: \['dealer', 'dealer name', 'showroom', 'showroom name', 'dealership'],

&#x20; 

&#x20; consumer\_number: \['consumer number', 'consumer no', 'ca number',

&#x20;                   'service number', 'meter number'],

&#x20; 

&#x20; units\_consumed: \['units consumed', 'units', 'energy consumed', 'kwh',

&#x20;                  'electricity units'],

&#x20; 

&#x20; electricity\_provider: \['provider', 'discom', 'electricity board', 'power company',

&#x20;                        'utility', 'mseb', 'bescom', 'tneb', 'bses',

&#x20;                        'tata power', 'adani electricity'],

&#x20; 

&#x20; employer: \['employer', 'company', 'organisation', 'organization',

&#x20;            'office', 'firm', 'company name', 'employer name'],

&#x20; 

&#x20; salary: \['salary', 'income', 'monthly salary', 'gross salary', 'net salary',

&#x20;          'ctc', 'monthly income', 'take home'],

&#x20; 

&#x20; email: \['email', 'email id', 'e-mail', 'mail', 'email address'],

&#x20; 

&#x20; pincode: \['pincode', 'pin', 'zip', 'pin code', 'postal code'],

&#x20; 

&#x20; city: \['city', 'town', 'sheher', 'district'],

&#x20; 

&#x20; state: \['state', 'pradesh', 'province']

}

```



\---



\## Environment Variables



\### .env.local (Next.js)

NEXT\_PUBLIC\_SUPABASE\_URL=https://fhqwbwcvgeivjqhnajso.supabase.co

NEXT\_PUBLIC\_SUPABASE\_ANON\_KEY=

SUPABASE\_SERVICE\_ROLE\_KEY=

NEXT\_PUBLIC\_RAZORPAY\_KEY\_ID=

RAZORPAY\_KEY\_SECRET=

RAZORPAY\_WEBHOOK\_SECRET=

BACKEND\_URL=http://localhost:8000

BACKEND\_SECRET=docflow\_dev\_secret\_123

RESEND\_API\_KEY=

NEXT\_PUBLIC\_APP\_URL=http://localhost:3000



\### .env (FastAPI backend)

SUPABASE\_URL=

SUPABASE\_SERVICE\_ROLE\_KEY=

OPENAI\_API\_KEY=

GROQ\_API\_KEY=

REDIS\_URL=redis://localhost:6379

BACKEND\_SECRET=

TESSERACT\_PATH=/usr/bin/tesseract



\---



\## Current Build Status



\### Complete ✅

\- Auth flow (email OTP)

\- Dashboard with usage bar

\- Upload flow (being redesigned)

\- Jobs list + job detail pages

\- Billing page with plan cards + addon packs UI

\- Settings page with referral system

\- Landing page

\- Column mapping logic (matchColumn, mapColumnsToFields)

\- Dev bypass for testing



\### In Progress ⏳

\- Upload flow redesign (one applicant at a time, flat file list)

\- PDF page preview + removal (PDF.js)

\- Page counting + confirmation before extraction

\- Excel master sheet with client column mapping

\- DNS verification for Resend SMTP



\### Not Started ❌

\- Razorpay payment integration

\- FastAPI backend (OCR + extraction)

\- Real Excel generation (currently mocked)

\- Admin dashboard

\- Email notifications (blocked on DNS)

\- Docflow Pro pipeline



\---



\## Low Friction Rules — Non-Negotiable

✗ NEVER ask for API keys from clients

✗ NEVER require OAuth

✗ NEVER make clients install anything

✗ NEVER require a sales call

✗ NEVER send clients to different domain to pay

✗ NEVER show loading with no progress indicator

✓ Email OTP only — fast auth

✓ Upload works immediately after OTP

✓ Doc types auto-detected from filename

✓ Master sheet persists — client never manages files

✓ Page count shown before extraction

✓ Client can remove unwanted PDF pages

✓ Upgrade happens inline

✓ Free trial: zero steps, immediate value



\---



\## Deployment



\### Vercel (Next.js)

Project: docflow-frontend

Domain: docflow.relentlessais.com

Repo: github.com/trennyg/docflow

Branch: main → auto-deploy



\### Hetzner CPX31 (FastAPI — not set up yet)

vCPU: 4 · RAM: 8GB · Storage: 80GB NVMe

Cost: \~₹830/month



\---



\*Docflow — Built by Relentless AIS · relentlessais.com · admin@relentlessais.com\*

