# APAAR Ready

   **AI-assisted student data management, record reconciliation, APAAR readiness and institutional analytics.**

Smart India Hackathon 2026 · Problem Statement ID: SIH26263 · Team: SKYJAD

> **Demonstration build.** All data is synthetic. This project is not connected to the real APAAR, UDISE+, Aadhaar, DigiLocker or any other official system, and it is not an official government portal.
## Website : https://apaar-ready-1.ai.studio
---

## What it does

APAAR Ready helps schools, colleges and AICTE keep student records clean and ready for APAAR, without replacing any official system. It replaces totals-only reporting with student-level records, and it keeps people in control of every decision: **nothing is auto-merged, auto-rejected or auto-deleted.**

### Workspaces and portals

| Portal | Who uses it | What they see |
|---|---|---|
| **School Teacher** (`/teacher/school`) | Class teachers, school staff | Classes 1 to 12, sections, school wording, their own classes only |
| **College Teacher** (`/teacher/college`) | College staff | Programmes, departments, semesters |
| **School Management** (`/school-management`) | Headmaster, principal | Intake vs enrolment by class, data quality, reports |
| **College Management** (`/college`) | College admin | Intake vs enrolment, approvals, reconciliation, reports |
| **AICTE** (`/aicte`) | National and state officers, auditors | Aggregated data only, no student-level data |

School and college data never mix. A user can only open the workspace of the institution they logged into.

### Key features

- **4-step login:** state, role, institution, credentials (national login adds a simulated OTP)
- **4-step Add New Student form** in the style of a school portal, with rule links on every field
- **Validation engine** that explains each problem in plain language: what was found, why it matters, what to check, how to fix it, and whether approval is needed
- **CSV / Excel import wizard** with column mapping, preview, row status and a correction report
- **Duplicate detection** with side-by-side comparison and human approval (a name match alone is never "High")
- **Smart name-mismatch check** (initials, spelling variants, name order)
- **Parent consent link** (simulated) with Pending, Obtained and Declined status
- **"Fix before you submit" coach** and a **Data Quality Coach** card
- **Education history timeline** across schools and colleges (simulated)
- **Intake vs enrolment** monitoring with over-intake alerts and reconciliation cases
- **APAAR readiness** with three separate layers: information completeness, local validation, official verification
- **Offline drafts** saved on the device (no sensitive values stored) and synced later
- **Natural-language search**, for example "students in class 5 with no APAAR ID"
- **Anomaly alerts and escalations** between colleges and AICTE
- **Rule-based AI assistant** in English, Hindi and Telugu (explains the app, never changes records)
- **Audit logs**, masked identifiers, and small-group suppression in analytics
- **Printable record summary** with a demo QR code

---

## What is simulated

Be clear about this when you review or demo the project:

- Aadhaar availability check (fictional numbers only)
- APAAR and PEN verification (status is recorded only; the app never generates or verifies real IDs)
- Parent consent message and link (no SMS or WhatsApp is sent)
- Cross-institution duplicate checks, education history lookup and AICTE intake verification
- The AI assistant is rule-based and offline unless an optional Edge Function is switched on
- All institutions, students and intake figures are synthetic demonstration data

Real use would need authorised integrations, a security audit and lawful data sharing.

---

## Tech stack

- **Frontend:** React, Vite, TypeScript, Tailwind CSS, React Router, Recharts, lucide-react, react-i18next
- **Backend:** Supabase (PostgreSQL, Auth, Row Level Security, Edge Functions)
- **Data tools:** PapaParse and SheetJS (CSV / Excel), jsPDF (reports), a QR code library
- **Device storage:** IndexedDB for offline drafts only
- **Languages:** English, Hindi, Telugu

The app runs in two modes behind one data service layer:

1. **Demo mode (default):** in-memory mock data plus IndexedDB. No backend needed.
2. **Supabase mode:** set `VITE_USE_SUPABASE=true` and provide your project URL and publishable (anon) key.

---

## Getting started

### 1. Clone and install

```bash
git clone <your-repo-url>
cd <your-repo-folder>
npm install
```

### 2. Run in demo mode

```bash
npm run dev
```

Open the local address shown in the terminal. Use **Quick-Login Demo Accounts** (`/demo-credentials`) to sign in as any role. These accounts are for demonstration only.

### 3. Connect Supabase (optional)

1. Create a project at [supabase.com](https://supabase.com).
2. Open **SQL Editor** and run the schema script from the `supabase/` folder (tables, views, RLS policies and synthetic seed data).
3. In **Project Settings, then API**, copy the **Project URL** and the **publishable (anon) key**.
4. Copy `.env.example` to `.env` and fill in your own values:

```bash
VITE_USE_SUPABASE="true"
VITE_SUPABASE_URL="https://YOUR-PROJECT-REF.supabase.co"
VITE_SUPABASE_ANON_KEY="YOUR_PUBLISHABLE_KEY"
```

5. Deploy and run the `seed-demo-users` Edge Function once to create the demo logins.
6. Restart the dev server and open `/dev/health` to confirm the connection.

> **Never commit your `.env` file.** Make sure `.env` is listed in `.gitignore`. Only `.env.example` with placeholder values belongs in the repository.
> **Never put a `service_role` or `sb_secret_...` key in frontend code.** Only the publishable (anon) key is safe in the browser. Row Level Security is what protects the data.

### 4. Build for production

```bash
npm run build
```

Deploy the output to Vercel or Netlify and add the same environment variables there.

---



## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`


## Security and privacy

- Synthetic data only, with fictional names and identifiers
- Sensitive identifiers (PEN, APAAR ID, Aadhaar-related) are masked by default (last 3 characters); revealing needs permission, a confirmation and an audit entry
- Row Level Security on every table; AICTE roles get aggregated views only
- Audit logs are insert-only and never store sensitive values
- No passwords or sensitive student data in localStorage or sessionStorage
- Designed to support the principles of the Digital Personal Data Protection Act, 2023. This is not a compliance certification.

---

## Project status

**Built (on synthetic data):** School, College and AICTE portals, 4-step login, Add Student, import wizard, validation, duplicates, consent link, education history, dashboards, reports, assistant, multilingual UI, offline drafts.

**In progress:** live Supabase connection and Edge Functions.

**Planned (needs authorisation):** official APAAR, DigiLocker and AICTE API integration, verifiable QR records, load test for about 100,000 records, native-speaker review of Hindi and Telugu text, independent security review.

---

## Documentation and links

- Presentation: 

## Disclaimer

APAAR Ready is a hackathon prototype. It complements official systems and does not replace them. It does not claim access to any government database and never shows "Officially Verified" without an authorised source.

