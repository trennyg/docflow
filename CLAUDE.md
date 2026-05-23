\# Docflow — Claude Code Instructions



\## Project

Document intelligence SaaS for Indian businesses.

Extracts structured data from KYC documents. Outputs Excel per applicant.



\## Tech Stack

\- Next.js 14 App Router, TypeScript, Tailwind CSS

\- Supabase (auth + database + storage)

\- FastAPI backend (not built yet — mock all backend calls for now)

\- Razorpay billing

\- Resend email



\## Colors (tailwind.config.ts)

bg: '#0A0A0A', card: '#111111', accent: '#2563EB'

success: '#16A34A', warning: '#D97706', error: '#DC2626'

text-primary: '#F9FAFB', text-muted: '#6B7280', border: '#1F2937'



\## Fonts

Inter (display/body) + DM Mono (labels, tags, numbers)



\## Folder Structure

app/(marketing)/ — public pages

app/(auth)/ — login, verify

app/(app)/ — protected: dashboard, upload, jobs, billing, settings

components/upload/, dashboard/, billing/, ui/

lib/supabase/, lib/api.ts, lib/constants.ts



\## Auth

Phone OTP only. No email. No password.

/login → phone input → send OTP

/verify → 6-digit OTP → redirect to /dashboard

Middleware protects all /app/\* routes.

On first login: auto-create org record in DB.



\## Database

Organizations table: id, name, phone, plan (default free), credits\_used (default 0), credits\_limit (default 15)

Users table: id, org\_id, role

Jobs table: id, org\_id, status, job\_type, applicant\_count, output\_path, created\_at

Applicants table: id, job\_id, org\_id, label, extracted, status

Documents table: id, applicant\_id, job\_id, org\_id, doc\_type, storage\_path, extracted, confidence, status



\## Critical Rules

\- Zero friction: no API keys from clients, no OAuth, no installs

\- Mock all FastAPI calls via lib/api.ts for now

\- Never expose public Supabase storage URLs — signed URLs only

\- Free plan = 15 applicants/month hard limit

\- All amounts in INR (₹)



\## Current Phase

Building Phase 1 — foundation only.

