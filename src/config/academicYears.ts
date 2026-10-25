// ============================================================================
// SINGLE SOURCE OF TRUTH FOR ACADEMIC YEARS, SNAPSHOTS, SECTIONS & CWSN CONFIG
// Current Academic Year = 2026-27 (01/04/2026 to 31/03/2027)
// Previous Academic Year = 2025-26 (Read-Only Snapshot: 01/04/2025 to 31/03/2026)
// Rollover Target Year   = 2027-28 (01/04/2027 to 31/03/2028)
// Nothing else in the app may hardcode an academic year string.
// ============================================================================

export type AcademicYearCode = string;

export const CURRENT_ACADEMIC_YEAR = '2026-27';
export const PREVIOUS_ACADEMIC_YEAR = '2025-26';
export const NEXT_ROLLOVER_ACADEMIC_YEAR = '2027-28';

export interface AcademicYearMeta {
  code: string;
  label: string;
  selectorLabel: string;
  startDateDisplay: string; // DD/MM/YYYY
  endDateDisplay: string; // DD/MM/YYYY
  aprilFirstIso: string; // YYYY-04-01 for Age on 1 April calculation
  startYearNum: number;
  defaultAdmissionDateDisplay: string; // DD/MM/YYYY
  admissionPrefix: string;
  batchCsvFilename: string;
  isReadOnlySnapshot: boolean;
}

export const INITIAL_ACADEMIC_YEARS_META: Record<string, AcademicYearMeta> = {
  [CURRENT_ACADEMIC_YEAR]: {
    code: CURRENT_ACADEMIC_YEAR,
    label: `${CURRENT_ACADEMIC_YEAR} (Current Academic Year)`,
    selectorLabel: `${CURRENT_ACADEMIC_YEAR} — Current Academic Year`,
    startDateDisplay: '01/04/2026',
    endDateDisplay: '31/03/2027',
    aprilFirstIso: '2026-04-01',
    startYearNum: 2026,
    defaultAdmissionDateDisplay: '14/08/2026',
    admissionPrefix: 'ADM-2026',
    batchCsvFilename: 'DIET_Batch_2026_27.csv',
    isReadOnlySnapshot: false,
  },
  [PREVIOUS_ACADEMIC_YEAR]: {
    code: PREVIOUS_ACADEMIC_YEAR,
    label: `${PREVIOUS_ACADEMIC_YEAR} (Previous year snapshot)`,
    selectorLabel: `${PREVIOUS_ACADEMIC_YEAR} — Previous year (snapshot)`,
    startDateDisplay: '01/04/2025',
    endDateDisplay: '31/03/2026',
    aprilFirstIso: '2025-04-01',
    startYearNum: 2025,
    defaultAdmissionDateDisplay: '14/08/2025',
    admissionPrefix: 'ADM-2025',
    batchCsvFilename: 'DIET_Batch_2025_26_Snapshot.csv',
    isReadOnlySnapshot: true,
  },
  [NEXT_ROLLOVER_ACADEMIC_YEAR]: {
    code: NEXT_ROLLOVER_ACADEMIC_YEAR,
    label: `${NEXT_ROLLOVER_ACADEMIC_YEAR} (Next Rollover Cycle)`,
    selectorLabel: `${NEXT_ROLLOVER_ACADEMIC_YEAR} — Rolled Over Active Cycle`,
    startDateDisplay: '01/04/2027',
    endDateDisplay: '31/03/2028',
    aprilFirstIso: '2027-04-01',
    startYearNum: 2027,
    defaultAdmissionDateDisplay: '14/08/2027',
    admissionPrefix: 'ADM-2027',
    batchCsvFilename: 'DIET_Batch_2027_28.csv',
    isReadOnlySnapshot: false,
  },
};

// ============================================================================
// FEATURE 2: CLASS AND SECTION MANAGEMENT MODELS & INITIAL DATA
// ============================================================================
export interface ManagedSection {
  id: string;
  programmeId: string;
  programmeName: string;
  department: string;
  sectionName: string; // e.g., 'Section A'
  capacity: number;
  classTeacher: string;
  isArchived: boolean;
  archivedAt?: string;
}

export const CLASS_TEACHER_OPTIONS = [
  'Dr. Kavitha Narayanan',
  'Prof. S. Kulkarni',
  'Dr. Rameshwar Reddy',
  'Prof. Meenakshi Iyer',
  'Dr. Anirudh Deshmukh',
  'Prof. Farzana Begum',
  'Dr. Vigneshwar Gowda',
  'Prof. Harini Nair',
];

export const INITIAL_MANAGED_SECTIONS: ManagedSection[] = [
  {
    id: 'SEC-CS-A',
    programmeId: 'PRG-01',
    programmeName: 'B.Tech Computer Science & Engineering',
    department: 'Computer Science',
    sectionName: 'Section A',
    capacity: 60,
    classTeacher: 'Dr. Kavitha Narayanan',
    isArchived: false,
  },
  {
    id: 'SEC-CS-B',
    programmeId: 'PRG-01',
    programmeName: 'B.Tech Computer Science & Engineering',
    department: 'Computer Science',
    sectionName: 'Section B',
    capacity: 60,
    classTeacher: 'Dr. Kavitha Narayanan',
    isArchived: false,
  },
  {
    id: 'SEC-CS-C',
    programmeId: 'PRG-01',
    programmeName: 'B.Tech Computer Science & Engineering',
    department: 'Computer Science',
    sectionName: 'Section C',
    capacity: 60,
    classTeacher: 'Dr. Rameshwar Reddy',
    isArchived: false,
  },
  {
    id: 'SEC-CS-D-EMPTY',
    programmeId: 'PRG-01',
    programmeName: 'B.Tech Computer Science & Engineering',
    department: 'Computer Science',
    sectionName: 'Section D (Evening Lab)',
    capacity: 40,
    classTeacher: 'Prof. Meenakshi Iyer',
    isArchived: false,
  },
  {
    id: 'SEC-EC-A',
    programmeId: 'PRG-02',
    programmeName: 'B.Tech Electronics & Communication',
    department: 'Electronics & Comm.',
    sectionName: 'Section A',
    capacity: 60,
    classTeacher: 'Dr. Anirudh Deshmukh',
    isArchived: false,
  },
  {
    id: 'SEC-EC-B',
    programmeId: 'PRG-02',
    programmeName: 'B.Tech Electronics & Communication',
    department: 'Electronics & Comm.',
    sectionName: 'Section B',
    capacity: 60,
    classTeacher: 'Prof. Farzana Begum',
    isArchived: false,
  },
  {
    id: 'SEC-ME-A',
    programmeId: 'PRG-03',
    programmeName: 'B.Tech Mechanical Engineering',
    department: 'Mechanical Engg.',
    sectionName: 'Section A',
    capacity: 60,
    classTeacher: 'Dr. Vigneshwar Gowda',
    isArchived: false,
  },
  {
    id: 'SEC-AI-A',
    programmeId: 'PRG-04',
    programmeName: 'B.E. Artificial Intelligence & Data Science',
    department: 'AI & Data Science',
    sectionName: 'Section A',
    capacity: 60,
    classTeacher: 'Prof. Harini Nair',
    isArchived: false,
  },
  // School Workspace Sections (Classes 1 to 12)
  {
    id: 'SEC-SCH-05A',
    programmeId: 'SCH-CLS-05',
    programmeName: 'Class 5',
    department: 'Primary Wing (Classes 1–5)',
    sectionName: 'Section A',
    capacity: 35,
    classTeacher: 'Dr. Kavitha Narayanan',
    isArchived: false,
  },
  {
    id: 'SEC-SCH-05B',
    programmeId: 'SCH-CLS-05',
    programmeName: 'Class 5',
    department: 'Primary Wing (Classes 1–5)',
    sectionName: 'Section B',
    capacity: 35,
    classTeacher: 'Dr. Kavitha Narayanan',
    isArchived: false,
  },
  {
    id: 'SEC-SCH-05C',
    programmeId: 'SCH-CLS-05',
    programmeName: 'Class 5',
    department: 'Primary Wing (Classes 1–5)',
    sectionName: 'Section C',
    capacity: 35,
    classTeacher: 'Prof. Harini Nair',
    isArchived: false,
  },
  {
    id: 'SEC-SCH-10A',
    programmeId: 'SCH-CLS-10',
    programmeName: 'Class 10',
    department: 'High School Wing (Classes 9–10)',
    sectionName: 'Section A',
    capacity: 40,
    classTeacher: 'Dr. Kavitha Narayanan',
    isArchived: false,
  },
  {
    id: 'SEC-SCH-10B',
    programmeId: 'SCH-CLS-10',
    programmeName: 'Class 10',
    department: 'High School Wing (Classes 9–10)',
    sectionName: 'Section B',
    capacity: 40,
    classTeacher: 'Prof. S. Kulkarni',
    isArchived: false,
  },
  {
    id: 'SEC-SCH-10C-EMPTY',
    programmeId: 'SCH-CLS-10',
    programmeName: 'Class 10',
    department: 'High School Wing (Classes 9–10)',
    sectionName: 'Section D (Remedial Batch)',
    capacity: 30,
    classTeacher: 'Prof. Farzana Begum',
    isArchived: false,
  },
  {
    id: 'SEC-JC-11A',
    programmeId: 'SCH-CLS-11',
    programmeName: 'Class 11',
    department: 'Higher Secondary / Junior College (Classes 11–12)',
    sectionName: 'Section A',
    capacity: 60,
    classTeacher: 'Dr. Anirudh Deshmukh',
    isArchived: false,
  },
  {
    id: 'SEC-JC-11B',
    programmeId: 'SCH-CLS-11',
    programmeName: 'Class 11',
    department: 'Higher Secondary / Junior College (Classes 11–12)',
    sectionName: 'Section B',
    capacity: 60,
    classTeacher: 'Dr. Vigneshwar Gowda',
    isArchived: false,
  },
];

// ============================================================================
// FEATURE 3: CWSN (CHILDREN / STUDENTS WITH SPECIAL NEEDS) MODELS & OPTIONS
// ============================================================================
export const DISABILITY_CATEGORIES = [
  'Locomotor Disability',
  'Visual Impairment (Low Vision / Blindness)',
  'Hearing Impairment (Deaf and Hard of Hearing)',
  'Speech and Language Disability',
  'Specific Learning Disabilities (Dyslexia / Dyscalculia)',
  'Autism Spectrum Disorder',
  'Intellectual Disability',
  'Multiple Disabilities',
] as const;

export type DisabilityCategory = (typeof DISABILITY_CATEGORIES)[number];

export type CwsnCertificateStatus =
  | 'Available & Verified (Record Status Only)'
  | 'Applied / Pending Issuance'
  | 'Not Available';

export const CWSN_SUPPORT_OPTIONS = [
  { id: 'ramp', label: 'Ramp / Ground-Floor Classroom' },
  { id: 'special_educator', label: 'Special Educator / Faculty Mentor' },
  { id: 'assistive_device', label: 'Assistive Device / Screen Reader' },
  { id: 'other', label: 'Other Exam / Lab Accommodation' },
] as const;

export type CwsnSupportId = (typeof CWSN_SUPPORT_OPTIONS)[number]['id'];

export interface CwsnStudentDetails {
  isCwsn: boolean;
  disabilityCategory?: string;
  certificateStatus?: CwsnCertificateStatus;
  supportNeeded?: CwsnSupportId[];
  accommodationNote?: string;
}

// ============================================================================
// FEATURE 5: HELP & SUPPORT TICKET MODEL
// ============================================================================
export type TicketStatus = 'Open' | 'In Progress' | 'Resolved';
export type TicketPriority = 'Low' | 'Medium' | 'High';

export interface SupportTicket {
  id: string;
  subject: string;
  page: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  createdAt: string;
  submittedBy: string;
}
