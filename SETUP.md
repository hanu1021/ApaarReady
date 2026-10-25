# APAAR Ready — Supabase Database & Environment Setup (`SETUP.md`)

## 1. Environment Variables
APAAR Ready routes all data access through `/src/services/dataService.ts`. By default, `VITE_USE_SUPABASE` is `"false"` and the app runs 100% offline/in-memory with browser `IndexedDB` draft storage.

To switch to a live Supabase project, configure the following environment variables (never hardcode keys in source code):

```env
VITE_USE_SUPABASE="true"
VITE_SUPABASE_URL="https://your-project-ref.supabase.co"
VITE_SUPABASE_ANON_KEY="your-public-anon-key"
```

You can verify the active data mode and test connectivity at **`/dev/health`** (Admin / AICTE Monitoring role).

---

## 2. Exact SQL Tables Needed by Each Screen

| Screen / Module | Route | Required SQL Tables |
| :--- | :--- | :--- |
| **4-Step Login, Forgot/Reset Password & Change Password** | `/login/*`, `/teacher/settings` | `auth.users` (Supabase Auth), `institutions`, `user_role_assignments`, `audit_logs` |
| **School Dashboard & Data Quality Coach** | `/teacher` | `academic_years`, `students`, `programmes_intake`, `cwsn_profiles`, `school_certifications` |
| **Class & Section Management + Section Shift** | `/teacher/school/programmes`, `/teacher/section-shift` | `programmes_intake`, `classroom_sections`, `students`, `audit_logs` |
| **All Students Registry, NL Search & Printable Summary** | `/teacher/students`, `/teacher/students/:studentId/summary` | `students`, `cwsn_profiles`, `consent_tokens`, `audit_logs` |
| **Add New Student (4-Step Form) & Parent Consent Link** | `/teacher/students/new`, `/consent/:token` | `students`, `cwsn_profiles`, `consent_tokens`, `age_range_rules`, `audit_logs` |
| **Request Management & Student Name Update** | `/teacher/requests`, `/teacher/name-update` | `correction_requests`, `students`, `audit_logs` |
| **Duplicate Records Side-by-Side Review** | `/teacher/duplicates` | `duplicate_reviews`, `students`, `audit_logs` |
| **Academic Year Rollover Wizard** | `/teacher/settings` | `academic_years`, `academic_year_snapshots`, `students`, `classroom_sections`, `audit_logs` |
| **Help & Support Center** | `/teacher/help` | `support_tickets`, `faq_articles`, `audit_logs` |
| **College Management & AICTE Central Monitoring** | `/college`, `/aicte` | `institutions`, `programmes_intake`, `state_monitoring_rollups`, `audit_logs` |

---

## 3. PostgreSQL / Supabase Schema DDL

```sql
-- 1. Academic Years & Read-Only Snapshots
CREATE TABLE academic_years (
  code TEXT PRIMARY KEY, -- e.g. '2026-27' (current), '2025-26' (snapshot)
  label TEXT NOT NULL,
  start_date DATE NOT NULL, -- 2026-04-01
  end_date DATE NOT NULL,   -- 2027-03-31
  is_current BOOLEAN NOT NULL DEFAULT false,
  is_read_only_snapshot BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Institutions
CREATE TABLE institutions (
  id TEXT PRIMARY KEY,
  aishe_code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  state TEXT NOT NULL,
  district TEXT NOT NULL,
  institution_type TEXT NOT NULL,
  total_approved_intake INTEGER NOT NULL DEFAULT 0,
  total_enrolled INTEGER NOT NULL DEFAULT 0,
  apaar_readiness_pct NUMERIC(5,2) NOT NULL DEFAULT 0
);

-- 3. Programmes & Sanctioned Intake
CREATE TABLE programmes_intake (
  id TEXT PRIMARY KEY,
  institution_id TEXT NOT NULL REFERENCES institutions(id),
  academic_year TEXT NOT NULL REFERENCES academic_years(code),
  programme_name TEXT NOT NULL,
  department TEXT NOT NULL,
  approved_intake INTEGER NOT NULL,
  actual_enrolment INTEGER NOT NULL DEFAULT 0
);

-- 4. Managed Classroom Sections (Create, Rename, Capacity, Class Teacher, Archive)
CREATE TABLE classroom_sections (
  id TEXT PRIMARY KEY,
  programme_id TEXT NOT NULL REFERENCES programmes_intake(id),
  programme_name TEXT NOT NULL,
  section_name TEXT NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 60,
  class_teacher TEXT NOT NULL,
  is_archived BOOLEAN NOT NULL DEFAULT false,
  archived_at TIMESTAMPTZ
);

-- 5. Student Registry (PEN and APAAR masked in UI; never auto-merged or deleted)
CREATE TABLE students (
  id TEXT PRIMARY KEY,
  roll_no TEXT NOT NULL,
  full_name TEXT NOT NULL,
  name_as_per_aadhaar_sim TEXT,
  dob DATE NOT NULL,
  gender CHAR(1) NOT NULL CHECK (gender IN ('F', 'M', 'O')),
  pen_masked_or_tokenized TEXT NOT NULL,
  apaar_id_tokenized TEXT,
  institution_id TEXT NOT NULL REFERENCES institutions(id),
  programme TEXT NOT NULL,
  section TEXT NOT NULL DEFAULT 'Section A',
  academic_year TEXT NOT NULL REFERENCES academic_years(code),
  semester INTEGER NOT NULL DEFAULT 1,
  verification_status TEXT NOT NULL,
  student_status TEXT NOT NULL DEFAULT 'Active',
  consent_status TEXT NOT NULL DEFAULT 'pending',
  data_quality_score INTEGER NOT NULL DEFAULT 85,
  reviewed_status TEXT DEFAULT 'Unreviewed',
  last_updated DATE NOT NULL DEFAULT CURRENT_DATE
);

-- 6. CWSN Sensitive Profiles (Record status only — no medical file uploads; access audit-logged)
CREATE TABLE cwsn_profiles (
  student_id TEXT PRIMARY KEY REFERENCES students(id),
  is_cwsn BOOLEAN NOT NULL DEFAULT false,
  disability_category TEXT,
  certificate_status TEXT CHECK (
    certificate_status IN (
      'Available & Verified (Record Status Only)',
      'Applied / Pending Issuance',
      'Not Available'
    )
  ),
  support_needed TEXT[], -- e.g. ARRAY['ramp', 'special_educator', 'assistive_device', 'other']
  accommodation_note TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Single-Use 7-Day Parent Consent Tokens (Stores ONLY first name and class for public view)
CREATE TABLE consent_tokens (
  token TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  student_first_name TEXT NOT NULL,
  class_or_programme TEXT NOT NULL,
  masked_mobile TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'obtained', 'declined', 'expired')),
  used_once BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  responded_at TIMESTAMPTZ
);

-- 8. Non-Destructive Correction Requests
CREATE TABLE correction_requests (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL REFERENCES students(id),
  request_type TEXT NOT NULL,
  current_value TEXT NOT NULL,
  requested_value TEXT NOT NULL,
  reason TEXT NOT NULL,
  submitted_by TEXT NOT NULL,
  submitted_on DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL CHECK (status IN ('Open', 'Under Review', 'Approved', 'Rejected'))
);

-- 9. Support Tickets (Help & Support Center)
CREATE TABLE support_tickets (
  id TEXT PRIMARY KEY,
  subject TEXT NOT NULL,
  page TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('Low', 'Medium', 'High')),
  status TEXT NOT NULL CHECK (status IN ('Open', 'In Progress', 'Resolved')),
  submitted_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10. Longitudinal Education History (School AND College Stages, Linked to Student)
CREATE TABLE education_history (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL REFERENCES students(id),
  institution_name TEXT NOT NULL,
  institution_type TEXT NOT NULL CHECK (
    institution_type IN ('School', 'College', 'University', 'Polytechnic', 'Junior College')
  ),
  stage TEXT NOT NULL CHECK (
    stage IN ('Primary', 'Upper Primary', 'Secondary', 'Higher Secondary', 'Diploma', 'UG', 'PG')
  ),
  class_or_programme TEXT NOT NULL,
  start_year INTEGER NOT NULL,
  end_year INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (
    status IN ('Studying', 'Completed', 'Transferred', 'Dropped out')
  ),
  exit_reason TEXT NOT NULL,
  state TEXT NOT NULL,
  source_label TEXT NOT NULL CHECK (
    source_label IN ('Imported', 'Manually Entered', 'Demonstration Data')
  )
);

-- 11. Immutable Audit Log
CREATE TABLE audit_logs (
  id TEXT PRIMARY KEY,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  actor TEXT NOT NULL,
  role TEXT NOT NULL,
  action TEXT NOT NULL,
  target_student_id TEXT NOT NULL,
  details TEXT NOT NULL
);
```
