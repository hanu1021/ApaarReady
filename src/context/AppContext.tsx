import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  InstitutionSummary,
  ProgrammeIntake,
  StateMonitoringRow,
  StudentRecord,
  UserRole,
  VerificationStatus,
} from '../data/mockData';
import {
  CURRENT_ACADEMIC_YEAR,
  PREVIOUS_ACADEMIC_YEAR,
  NEXT_ROLLOVER_ACADEMIC_YEAR,
  INITIAL_ACADEMIC_YEARS_META,
  AcademicYearMeta,
  ManagedSection,
  CwsnCertificateStatus,
  CwsnSupportId,
  SupportTicket,
  TicketPriority,
  TicketStatus,
} from '../config/academicYears';
import { dataService } from '../services/dataService';
import {
  OfflineStoredDraft,
  getAllOfflineDraftsFromIdb,
  clearAllOfflineDraftsFromIdb,
  deleteOfflineDraftFromIdb,
} from '../utils/indexedDbDrafts';
import { AssistantLanguage } from '../data/i18n';

export type DemoAccountKey =
  | 'school_teacher'
  | 'school_management'
  | 'college_teacher'
  | 'college_management'
  | 'aicte_state'
  | 'aicte_national'
  | 'auditor';

export interface AuthSession {
  state: string;
  role: UserRole;
  roleDisplayLabel?: string;
  isNationalLogin?: boolean;
  isAuditor?: boolean;
  userName: string;
  designation: string;
  institutionId: string;
  institutionName: string;
  workspaceType?: 'school' | 'college';
  institutionType?: 'School' | 'Junior College' | 'College';
}

export interface LoginFlowState {
  step1Completed: boolean;
  isNationalLogin: boolean;
  selectedState: string;
  step2Completed: boolean;
  selectedRole: UserRole | null;
  roleLabel: string;
  step3Completed: boolean;
  selectedInstitutionId: string;
  selectedInstitutionName: string;
  selectedWorkspaceType?: 'school' | 'college';
  selectedInstitutionType?: 'School' | 'Junior College' | 'College';
}

export interface TeacherContextFilter {
  institutionType: 'Show all' | 'School' | 'Junior College' | 'College';
  classOrProgramme: string; // 'Show all' or specific Class/Programme
  section: string; // 'Show all' or 'Section A' | 'Section B' | 'Section C'
  semester: string; // 'Show all' or '1'..'8'
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  role: string;
  action: string;
  targetStudentId: string;
  details: string;
}

export type RequestStatus = 'Open' | 'Under Review' | 'Approved' | 'Rejected';

export interface CorrectionRequestItem {
  id: string;
  studentId: string;
  rollNo: string;
  studentName: string;
  requestType: 'Name Change' | 'DOB / Demographic Correction' | 'Transfer / Section Shift';
  currentValue: string;
  requestedValue: string;
  reason: string;
  submittedBy: string;
  submittedOn: string;
  status: RequestStatus;
}

export interface PortalNotification {
  id: string;
  title: string;
  message: string;
  category: 'APAAR' | 'Intake' | 'Duplicate' | 'Certification';
  timestamp: string;
  isRead: boolean;
}

export interface SchoolCertificationState {
  isCertified: boolean;
  certifiedBy: string | null;
  certifiedAt: string | null;
  academicYear: string;
}

export interface StudentDraftData {
  // Step 1: Identity Check
  hasExistingApaar: 'yes' | 'no' | null;
  existingApaarId: string;
  checkAadhaarAvailability: boolean;
  aadhaarAvailabilityInput: string;
  aadhaarSimulatedResult: 'idle' | 'found' | 'not_found';
  consentStatus: 'not_required' | 'pending' | 'obtained' | 'declined';

  // Step 2: General Profile (4.1.1 - 4.1.11 + CWSN Details)
  studentNameSchool: string; // 4.1.1
  gender: 'F' | 'M' | 'O' | ''; // 4.1.2
  dob: string; // 4.1.3 (YYYY-MM-DD)
  motherName: string; // 4.1.4
  fatherName: string; // 4.1.5
  guardianName: string; // 4.1.6
  aadhaarOptional: string; // 4.1.7 (optional, masked, demo numbers only)
  studentNameAadhaar: string; // 4.1.8
  admissionDate: string; // 4.1.9 (DD/MM/YYYY)
  mobileNumber: string; // 4.1.10 (10 digits)
  isCwsn: 'yes' | 'no' | ''; // 4.1.11
  cwsnDisabilityCategory?: string;
  cwsnCertificateStatus?: CwsnCertificateStatus | '';
  cwsnSupportNeeded?: CwsnSupportId[];
  cwsnAccommodationNote?: string;

  // Step 3: Admission and Academic Details (Adaptive School vs College)
  programmeName: string;
  className?: string; // School: Class 1 to Class 12
  medium?: 'English' | 'Telugu' | 'Hindi' | 'Urdu' | 'Kannada' | 'Marathi'; // School
  midDayMealEligible?: 'Yes' | 'No'; // School (Yes/No demo field)
  semester?: number; // College: 1 to 8
  section: string;
  department: string;
  academicYear: string;
  admissionNumber: string;
  admissionCategory: string;
  previousInstitution: string;
  previousQualification: string;
  enrolmentStatus: string;
  lastSavedAt?: string;
}

export interface ConsentTokenRecord {
  token: string;
  studentId: string; // 'DRAFT' or student ID
  studentFirstName: string; // Strictly first name only
  classOrProgramme: string; // Class / Programme only
  maskedMobile: string;
  createdAt: string;
  expiresAt: string; // 7 days from creation
  status: 'pending' | 'obtained' | 'declined' | 'expired';
  respondedAt?: string;
  usedOnce: boolean;
}

export interface AgeRangeRule {
  id: string;
  classOrProgrammeLabel: string;
  matchKeyword: string;
  minAgeYears: number;
  maxAgeYears: number;
}

export type ToastTone = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  message: string;
  tone: ToastTone;
}

export const DEFAULT_AGE_RANGE_RULES: AgeRangeRule[] = [
  {
    id: 'AGE-UG-BTECH',
    classOrProgrammeLabel: 'B.Tech / Undergraduate Engineering (Year 1)',
    matchKeyword: 'B.Tech',
    minAgeYears: 17,
    maxAgeYears: 23,
  },
  {
    id: 'AGE-PG-MTECH',
    classOrProgrammeLabel: 'M.Tech / MBA / MCA Postgraduate',
    matchKeyword: 'M.Tech',
    minAgeYears: 20,
    maxAgeYears: 28,
  },
  {
    id: 'AGE-CLASS-5',
    classOrProgrammeLabel: 'Class 5 (Primary School Reference)',
    matchKeyword: 'Class 5',
    minAgeYears: 9,
    maxAgeYears: 11,
  },
  {
    id: 'AGE-CLASS-10',
    classOrProgrammeLabel: 'Class 10 / Secondary Board Reference',
    matchKeyword: 'Class 10',
    minAgeYears: 14,
    maxAgeYears: 17,
  },
  {
    id: 'AGE-DEFAULT',
    classOrProgrammeLabel: 'Default Institutional Programme Range',
    matchKeyword: 'DEFAULT',
    minAgeYears: 5,
    maxAgeYears: 25,
  },
];

interface AppContextType {
  session: AuthSession;
  setSession: React.Dispatch<React.SetStateAction<AuthSession>>;
  // Workspace Separation ('school' vs 'college') & Teacher Context Bar
  activeWorkspace: 'school' | 'college';
  switchWorkspaceDemo: (workspace: 'school' | 'college', targetRole?: UserRole) => void;
  signInDemoAccount: (accountKey: DemoAccountKey) => string;
  isClassTeacherScoped: boolean;
  setIsClassTeacherScoped: React.Dispatch<React.SetStateAction<boolean>>;
  assignedTeacherSections: ManagedSection[];
  assignedTeacherScopeLabel: string;
  teacherContext: TeacherContextFilter;
  setTeacherContext: React.Dispatch<React.SetStateAction<TeacherContextFilter>>;
  clearTeacherContext: () => void;
  canViewSensitive: boolean;
  setCanViewSensitive: React.Dispatch<React.SetStateAction<boolean>>;

  // 0. Academic Year Single Source of Truth & Read-Only Snapshot State
  selectedAcademicYear: string;
  setSelectedAcademicYear: React.Dispatch<React.SetStateAction<string>>;
  currentActiveAcademicYear: string;
  academicYearsMeta: Record<string, AcademicYearMeta>;
  isReadOnlySnapshot: boolean;
  executeAcademicYearRollover: (targetYear: string) => void;

  loginFlow: LoginFlowState;
  setLoginFlow: React.Dispatch<React.SetStateAction<LoginFlowState>>;
  resetLoginFlow: () => void;
  students: StudentRecord[];
  workspaceStudents: StudentRecord[];
  allInstitutionStudents: StudentRecord[];
  programmes: ProgrammeIntake[];
  institutions: InstitutionSummary[];
  allInstitutions: InstitutionSummary[];
  stateRows: StateMonitoringRow[];
  auditLogs: AuditLogEntry[];
  addAuditLog: (entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) => void;
  requests: CorrectionRequestItem[];
  updateRequestStatus: (id: string, status: RequestStatus) => void;
  submitNameUpdateRequest: (
    studentId: string,
    requestedName: string,
    reason: string
  ) => void;
  notifications: PortalNotification[];
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  certification: SchoolCertificationState;
  certifySchoolData: () => void;
  reopenSchoolCertification: () => void;
  shiftStudentSections: (studentIds: string[], targetSection: string) => void;
  inactivateStudent: (
    studentId: string,
    status: 'Inactive' | 'Dropped Out' | 'Transferred (TC Issued)',
    reason: string,
    date: string,
    tcNumber?: string
  ) => void;
  reactivateStudent: (studentId: string, reason: string) => void;
  bulkMarkReadyForApaar: (studentIds: string[]) => void;
  finalizePromotionBatch: (studentIds: string[]) => void;
  studentDraft: StudentDraftData;
  setStudentDraft: React.Dispatch<React.SetStateAction<StudentDraftData>>;
  resetStudentDraft: () => void;
  unmaskedRecordIds: Record<string, boolean>;
  toggleMaskRecord: (id: string) => void;
  globalUnmask: boolean;
  setGlobalUnmask: (val: boolean) => void;
  updateStudentRecord: (id: string, patch: Partial<StudentRecord>) => void;
  addStudentRecord: (
    student: Omit<StudentRecord, 'id' | 'lastUpdated'>,
    auditNote?: string
  ) => StudentRecord;
  applyStandardization: (id: string) => void;
  markDuplicateDecision: (
    primaryId: string,
    secondaryId: string,
    decision: NonNullable<StudentRecord['reviewedStatus']>
  ) => void;

  // Feature 2 (Previous): Parent Consent Link (Simulated)
  consentTokens: ConsentTokenRecord[];
  createSimulatedConsentRequest: (params: {
    studentId: string;
    fullName: string;
    classOrProgramme: string;
    mobileNumber: string;
    forceExpiredDemo?: boolean;
  }) => ConsentTokenRecord;
  respondToConsentToken: (
    token: string,
    decision: 'obtained' | 'declined'
  ) => { success: boolean; message: string };

  // Feature 4 (Previous): Offline Draft Mode (IndexedDB)
  isOnline: boolean;
  simulateOffline: boolean;
  setSimulateOffline: (val: boolean) => void;
  offlineDrafts: OfflineStoredDraft[];
  refreshOfflineDrafts: () => Promise<void>;
  syncOfflineDraftsToDb: (
    reenteredApaarByDraftId?: Record<string, string>
  ) => Promise<{ syncedCount: number; message: string }>;
  clearOfflineDrafts: () => Promise<void>;

  // Feature 5 (Previous): Configurable Age-vs-Class Rules
  ageRangeRules: AgeRangeRule[];
  updateAgeRangeRule: (id: string, minAgeYears: number, maxAgeYears: number) => void;
  resetAgeRangeRules: () => void;

  // Feature 6 (Previous): Natural-Language Search shared query
  activeNlQuery: string;
  setActiveNlQuery: (q: string) => void;

  // NEW Feature 2: Class & Section Management
  managedSections: ManagedSection[];
  createManagedSection: (params: {
    programmeName: string;
    department: string;
    sectionName: string;
    capacity: number;
    classTeacher: string;
  }) => void;
  renameManagedSection: (
    id: string,
    newSectionName: string,
    newProgrammeName?: string
  ) => void;
  updateManagedSectionMeta: (
    id: string,
    capacity: number,
    classTeacher: string
  ) => void;
  archiveManagedSection: (id: string) => { success: boolean; message: string };
  restoreManagedSection: (id: string) => void;

  // NEW Feature 3: CWSN Sensitive Access Masking & Audit Logging
  unmaskedCwsnIds: Record<string, boolean>;
  toggleUnmaskCwsn: (studentId: string) => void;

  // NEW Feature 5: Help & Support Tickets + Interactive Walkthrough Tour
  supportTickets: SupportTicket[];
  createSupportTicket: (params: {
    subject: string;
    page: string;
    description: string;
    priority: TicketPriority;
  }) => SupportTicket;
  updateSupportTicketStatus: (id: string, status: TicketStatus) => void;
  tourActive: boolean;
  setTourActive: (val: boolean) => void;
  tourStep: number;
  setTourStep: React.Dispatch<React.SetStateAction<number>>;

  // NEW Feature 6: Toast Notifications & Simulated Page Loading/Error States
  toasts: ToastMessage[];
  addToast: (message: string, tone?: ToastTone) => void;
  dismissToast: (id: string) => void;

  // NEW Feature 1: Session Timeout Simulation Trigger
  triggerSessionTimeoutWarningNow: () => void;
  sessionWarningRequested: boolean;
  clearSessionWarningRequest: () => void;

  // NEW Feature 8: Demo Mode for Judges & Reset Demo Data
  demoGuideOpen: boolean;
  setDemoGuideOpen: (val: boolean) => void;
  resetAllDemoData: () => Promise<void>;

  // Session-only App / Assistant Language, Unsaved Changes & Breadcrumb Suffix, Switch Role Sign-Out
  appLanguage: AssistantLanguage;
  setAppLanguage: (lang: AssistantLanguage) => void;
  hasUnsavedChanges: boolean;
  setHasUnsavedChanges: (val: boolean) => void;
  activeBreadcrumbSuffix: string | null;
  setActiveBreadcrumbSuffix: (val: string | null) => void;
  switchRoleSignOut: () => string;
}

const DEFAULT_SESSION: AuthSession = {
  state: 'Telangana',
  role: 'teacher',
  roleDisplayLabel: 'Teacher / Authorized Staff',
  isNationalLogin: false,
  userName: 'Dr. Kavitha Narayanan',
  designation: 'Faculty Nodal Officer (APAAR & AISHE)',
  institutionId: 'INST-SCH-01',
  institutionName: 'Demo Public School, Hyderabad',
  workspaceType: 'school',
  institutionType: 'School',
};

const INITIAL_LOGIN_FLOW: LoginFlowState = {
  step1Completed: false,
  isNationalLogin: false,
  selectedState: '',
  step2Completed: false,
  selectedRole: null,
  roleLabel: '',
  step3Completed: false,
  selectedInstitutionId: '',
  selectedInstitutionName: '',
  selectedWorkspaceType: 'school',
  selectedInstitutionType: 'School',
};

export const INITIAL_TEACHER_CONTEXT: TeacherContextFilter = {
  institutionType: 'Show all',
  classOrProgramme: 'Show all',
  section: 'Show all',
  semester: 'Show all',
};

const currentMeta = INITIAL_ACADEMIC_YEARS_META[CURRENT_ACADEMIC_YEAR];

export const INITIAL_STUDENT_DRAFT: StudentDraftData = {
  hasExistingApaar: null,
  existingApaarId: '',
  checkAadhaarAvailability: false,
  aadhaarAvailabilityInput: '',
  aadhaarSimulatedResult: 'idle',
  consentStatus: 'pending',

  studentNameSchool: '',
  gender: '',
  dob: '',
  motherName: '',
  fatherName: '',
  guardianName: '',
  aadhaarOptional: '',
  studentNameAadhaar: '',
  admissionDate: currentMeta.defaultAdmissionDateDisplay,
  mobileNumber: '',
  isCwsn: 'no',
  cwsnDisabilityCategory: '',
  cwsnCertificateStatus: '',
  cwsnSupportNeeded: [],
  cwsnAccommodationNote: '',

  programmeName: 'Class 5',
  className: 'Class 5',
  medium: 'English',
  midDayMealEligible: 'Yes',
  semester: 1,
  section: 'Section A',
  department: 'Primary Wing (Classes 1–5)',
  academicYear: CURRENT_ACADEMIC_YEAR,
  admissionNumber: `${currentMeta.admissionPrefix}-061`,
  admissionCategory: 'Regular / RTE & State Quota',
  previousInstitution: 'Demo Primary School, Hyderabad (Synthetic)',
  previousQualification: 'Previous Class Promoted — State Board',
  enrolmentStatus: 'Active — Current Academic Year',
};

const INITIAL_REQUESTS: CorrectionRequestItem[] = [
  {
    id: 'REQ-2041',
    studentId: 'STU-1002',
    rollNo: '24DIET-CS-002',
    studentName: 'Karthikeya Varma',
    requestType: 'Name Change',
    currentValue: 'K. Varma',
    requestedValue: 'Karthikeya Varma',
    reason: 'Expand initial "K." to match Class X & simulated Aadhaar record.',
    submittedBy: 'Dr. Kavitha Narayanan',
    submittedOn: '2026-10-22',
    status: 'Open',
  },
  {
    id: 'REQ-2042',
    studentId: 'STU-1004',
    rollNo: '24DIET-EC-014',
    studentName: 'ananya reddy',
    requestType: 'DOB / Demographic Correction',
    currentValue: 'ananya reddy (14/08/2005)',
    requestedValue: 'Ananya Reddy (2005-08-14)',
    reason: 'Title Case normalization and ISO date alignment for ABC registry.',
    submittedBy: 'Dr. Kavitha Narayanan',
    submittedOn: '2026-10-23',
    status: 'Under Review',
  },
  {
    id: 'REQ-2043',
    studentId: 'STU-1008',
    rollNo: '24DIET-ME-031',
    studentName: 'MD. FARHAN AHMED',
    requestType: 'Name Change',
    currentValue: 'MD. FARHAN AHMED',
    requestedValue: 'Mohammed Farhan Ahmed',
    reason: 'Expand abbreviated prefix "MD." per student affidavit (Simulated).',
    submittedBy: 'Prof. S. Kulkarni',
    submittedOn: '2026-10-23',
    status: 'Open',
  },
  {
    id: 'REQ-2044',
    studentId: 'STU-1015',
    rollNo: '24DIET-CS-015',
    studentName: 'Gauri Joshi',
    requestType: 'Transfer / Section Shift',
    currentValue: 'Section B',
    requestedValue: 'Section A',
    reason: 'Elective lab batch reallocation approved by HoD.',
    submittedBy: 'Dr. Kavitha Narayanan',
    submittedOn: '2026-10-20',
    status: 'Approved',
  },
  {
    id: 'REQ-2045',
    studentId: 'STU-2003',
    rollNo: '26DPS-10B-003',
    studentName: 'Priya Sarma',
    requestType: 'Name Change',
    currentValue: 'Priya Sarma',
    requestedValue: 'Priya Sharma',
    reason: 'Align surname spelling ("Sarma" -> "Sharma") with Class 10 board & simulated Aadhaar card.',
    submittedBy: 'Dr. Kavitha Narayanan',
    submittedOn: '2026-10-24',
    status: 'Open',
  },
];

const INITIAL_NOTIFICATIONS: PortalNotification[] = [
  {
    id: 'NOTIF-01',
    title: 'Duplicate Clusters Awaiting Nodal Review',
    message: `Potential duplicate student pairs require human review in Duplicate Records ${CURRENT_ACADEMIC_YEAR}.`,
    category: 'Duplicate',
    timestamp: '2026-10-24 10:15',
    isRead: false,
  },
  {
    id: 'NOTIF-02',
    title: 'Over-Intake Advisory Flagged',
    message:
      'Actual enrolment exceeds sanctioned capacity in 2 classes/programmes. Reconcile seats before certification.',
    category: 'Intake',
    timestamp: '2026-10-24 09:40',
    isRead: false,
  },
  {
    id: 'NOTIF-03',
    title: 'APAAR Consent Checklist Pending',
    message:
      'Fictional student records marked "Missing APAAR ID" await parent/guardian consent status.',
    category: 'APAAR',
    timestamp: '2026-10-23 16:20',
    isRead: false,
  },
  {
    id: 'NOTIF-04',
    title: `Institutional Certification Window Open (${CURRENT_ACADEMIC_YEAR})`,
    message:
      'Nodal officers can certify institutional rosters once blocking validation errors reach zero.',
    category: 'Certification',
    timestamp: '2026-10-22 11:00',
    isRead: true,
  },
  {
    id: 'NOTIF-05',
    title: 'Name Standardization Requests Queued',
    message:
      '4 student records have pending spelling/initial standardization requests in Request Management.',
    category: 'APAAR',
    timestamp: '2026-10-21 15:45',
    isRead: false,
  },
];

const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'AUD-101',
    timestamp: '2026-10-24 09:15:00',
    actor: 'Dr. Kavitha Narayanan',
    role: 'Teacher / Authorized Staff',
    action: 'RECORD_STANDARDIZED',
    targetStudentId: 'STU-1001',
    details:
      'Verified PEN format and marked Simulated Verification for Priya Sharma (Demo).',
  },
];

const INITIAL_SUPPORT_TICKETS: SupportTicket[] = [
  {
    id: 'TKT-101',
    subject: 'Parent consent link token expired after 7 days for STU-1009',
    page: '/teacher/students/new',
    description:
      'Parent opened the simulated consent link on day 8. Re-issued a new single-use token from Step 1.',
    priority: 'Medium',
    status: 'Resolved',
    createdAt: '2026-10-21 11:20',
    submittedBy: 'Dr. Kavitha Narayanan',
  },
  {
    id: 'TKT-102',
    subject: 'Clarification on CWSN small-cohort privacy suppression (< 5)',
    page: '/teacher',
    description:
      'Verified that classes/programmes with fewer than 5 CWSN students display "< 5 (Suppressed)" on summary tables.',
    priority: 'Low',
    status: 'In Progress',
    createdAt: '2026-10-23 14:45',
    submittedBy: 'Prof. S. Kulkarni',
  },
];

// Enrich initial students while preserving explicit school/college fields
function enrichStudents(raw: StudentRecord[]): StudentRecord[] {
  return raw.map((s, idx) => {
    const sections = ['Section A', 'Section B', 'Section C'];
    const sec = s.section || sections[idx % 3];
    const workspaceType: 'school' | 'college' = s.workspaceType || 'college';
    const institutionType: 'School' | 'Junior College' | 'College' =
      s.institutionType || (workspaceType === 'school' ? 'School' : 'College');

    let studentStatus: StudentRecord['studentStatus'] = s.studentStatus || 'Active';
    let inactiveReason: string | undefined = s.inactiveReason;
    let inactiveDate: string | undefined = s.inactiveDate;
    let tcNumber: string | undefined = s.tcNumber;

    if (s.id === 'STU-1058' || s.id === 'STU-2148') {
      studentStatus = 'Transferred (TC Issued)';
      inactiveReason =
        workspaceType === 'school'
          ? 'Parent relocated to Warangal district; Transfer Certificate issued (Simulated TC).'
          : 'Inter-university migration to Osmania University campus (Simulated TC).';
      inactiveDate = '2026-09-18';
      tcNumber = workspaceType === 'school' ? 'TC-DPS-2026-114' : 'TC-DIET-2026-088';
    } else if (s.id === 'STU-1059' || s.id === 'STU-2149') {
      studentStatus = 'Dropped Out';
      inactiveReason =
        workspaceType === 'school'
          ? 'Withdrew after admission to residential school (Demo).'
          : 'Withdrew admission after Round 3 JOSAA allotment (Demo).';
      inactiveDate = '2026-09-25';
    } else if (s.id === 'STU-1060' || s.id === 'STU-2150') {
      studentStatus = 'Inactive';
      inactiveReason = 'Medical leave approved by Head of Institution (Demo).';
      inactiveDate = '2026-10-04';
    }

    const consentStatus: StudentRecord['consentStatus'] =
      s.consentStatus ||
      (s.apaarId ? 'not_required' : idx % 2 === 0 ? 'obtained' : 'pending');

    const nameAsPerAadhaarSim =
      s.nameAsPerAadhaarSim ||
      (s.id === 'STU-1002'
        ? 'Karthikeya Varma'
        : s.id === 'STU-1004'
        ? 'Ananya Reddy'
        : s.id === 'STU-1008'
        ? 'Mohammed Farhan Ahmed'
        : s.fullName);

    // Seed CWSN details on specific students so B.Tech CSE (College) and Class 5 (School)
    // have >= 5 CWSN records (unsuppressed), while other classes/programmes have 1-2 (< 5 suppressed)
    const isCseCwsn =
      s.programme === 'B.Tech Computer Science & Engineering' && idx < 38 && idx % 6 === 0;
    const isSchoolClass5Cwsn =
      workspaceType === 'school' && s.programme === 'Class 5' && idx % 2 === 0;
    const isOtherCwsn = idx === 3 || idx === 11;
    const isCwsnFlag = Boolean(s.cwsnDetails?.isCwsn) || isCseCwsn || isSchoolClass5Cwsn || isOtherCwsn;

    const cwsnDetails: StudentRecord['cwsnDetails'] =
      s.cwsnDetails && s.cwsnDetails.isCwsn
        ? s.cwsnDetails
        : isCwsnFlag
        ? {
            isCwsn: true,
            disabilityCategory:
              idx % 2 === 0
                ? 'Locomotor Disability'
                : 'Visual Impairment (Low Vision / Blindness)',
            certificateStatus: 'Available & Verified (Record Status Only)',
            supportNeeded:
              idx % 2 === 0
                ? ['ramp', 'assistive_device']
                : ['assistive_device', 'special_educator'],
            accommodationNote:
              'Ground-floor classroom seating and assistive learning support assigned (Record status only — no medical files stored).',
          }
        : { isCwsn: false };

    return {
      ...s,
      workspaceType,
      institutionType,
      academicYear: s.academicYear || CURRENT_ACADEMIC_YEAR,
      section: sec,
      studentStatus,
      inactiveReason,
      inactiveDate,
      tcNumber,
      consentStatus,
      nameAsPerAadhaarSim,
      apaarCreationReady: !s.apaarId && consentStatus === 'obtained',
      cwsnDetails,
    };
  });
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<AuthSession>(DEFAULT_SESSION);
  const [canViewSensitive, setCanViewSensitive] = useState<boolean>(false);
  const [teacherContext, setTeacherContext] = useState<TeacherContextFilter>(
    INITIAL_TEACHER_CONTEXT
  );

  // 0. Academic Year Single Source of Truth (Default = 2026-27; Previous = 2025-26 Read-Only Snapshot)
  const [academicYearsMeta, setAcademicYearsMeta] = useState<Record<string, AcademicYearMeta>>(
    INITIAL_ACADEMIC_YEARS_META
  );
  const [currentActiveAcademicYear, setCurrentActiveAcademicYear] = useState<string>(
    CURRENT_ACADEMIC_YEAR
  );
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>(
    CURRENT_ACADEMIC_YEAR
  );

  const isReadOnlySnapshot =
    academicYearsMeta[selectedAcademicYear]?.isReadOnlySnapshot ??
    selectedAcademicYear !== currentActiveAcademicYear;

  const [loginFlow, setLoginFlow] = useState<LoginFlowState>(INITIAL_LOGIN_FLOW);
  const [allRawStudents, setStudents] = useState<StudentRecord[]>(() =>
    enrichStudents(dataService.getInitialStudents())
  );
  const [allRawProgrammes, setProgrammes] = useState<ProgrammeIntake[]>(() =>
    dataService.getInitialProgrammes()
  );
  const [allInstitutions, setInstitutions] = useState<InstitutionSummary[]>(() =>
    dataService.getInitialInstitutions()
  );
  const [stateRows] = useState<StateMonitoringRow[]>(() =>
    dataService.getInitialStateRows()
  );

  // Feature 2: Managed Classroom Sections (used for Teacher Scope by Assigned Class)
  const [managedSections, setManagedSections] = useState<ManagedSection[]>(() =>
    dataService.getInitialManagedSections()
  );

  // Teacher Scope by Assigned Class (Class teachers see only their assigned classes & sections)
  const [isClassTeacherScoped, setIsClassTeacherScoped] = useState<boolean>(false);

  // Active Workspace ('school' vs 'college') is strictly determined by the logged-in institution
  const matchedInst = allInstitutions.find((i) => i.id === session.institutionId);
  const activeWorkspace: 'school' | 'college' =
    session.role === 'aicte'
      ? 'college'
      : matchedInst?.workspaceType || session.workspaceType || 'school';

  // Sections assigned to the current teacher in the active workspace
  const assignedTeacherSections = React.useMemo(() => {
    const inWorkspace = managedSections.filter((sec) => {
      if (sec.isArchived) return false;
      const isSchoolSec = sec.programmeName.startsWith('Class ');
      return activeWorkspace === 'school' ? isSchoolSec : !isSchoolSec;
    });
    const exactMatches = inWorkspace.filter((sec) => sec.classTeacher === session.userName);
    return exactMatches.length > 0 ? exactMatches : inWorkspace.slice(0, 2);
  }, [managedSections, activeWorkspace, session.userName]);

  const assignedTeacherScopeLabel = React.useMemo(() => {
    if (session.role !== 'teacher') {
      return 'Full Institution Scope (Management / Oversight)';
    }
    if (!isClassTeacherScoped) {
      return `${assignedTeacherSections
        .map((s) => {
          const shortSec = s.sectionName.replace('Section ', '');
          const shortProg = s.programmeName
            .replace('B.Tech Computer Science & Engineering', 'B.Tech CSE')
            .replace('B.Tech Electronics & Communication', 'B.Tech ECE');
          return `${shortProg}-${shortSec}`;
        })
        .join(', ')} (Assigned) · Full Institution View Active`;
    }
    return assignedTeacherSections
      .map((s) => {
        const shortSec = s.sectionName.replace('Section ', '');
        const shortProg = s.programmeName
          .replace('B.Tech Computer Science & Engineering', 'B.Tech CSE')
          .replace('B.Tech Electronics & Communication', 'B.Tech ECE');
        return `${shortProg}-${shortSec}`;
      })
      .join(', ');
  }, [session.role, isClassTeacherScoped, assignedTeacherSections]);

  // Enforce workspace separation AND teacher assigned-class RLS at the data layer
  const rawWorkspaceStudents = React.useMemo(
    () => dataService.filterStudentsByWorkspace(allRawStudents, activeWorkspace),
    [allRawStudents, activeWorkspace]
  );

  const workspaceStudents = React.useMemo(
    () =>
      dataService.filterStudentsByTeacherScope(
        rawWorkspaceStudents,
        session.role === 'teacher' && isClassTeacherScoped,
        assignedTeacherSections.map((s) => ({
          programmeName: s.programmeName,
          sectionName: s.sectionName,
        }))
      ),
    [rawWorkspaceStudents, session.role, isClassTeacherScoped, assignedTeacherSections]
  );

  const programmes = React.useMemo(
    () => dataService.filterProgrammesByWorkspace(allRawProgrammes, activeWorkspace),
    [allRawProgrammes, activeWorkspace]
  );

  const institutions = React.useMemo(
    () => dataService.filterInstitutionsByWorkspace(allInstitutions, activeWorkspace),
    [allInstitutions, activeWorkspace]
  );

  // Apply Teacher Context Bar filters (Institution Type, Class/Programme, Section, Semester)
  const students = React.useMemo(() => {
    return workspaceStudents.filter((s) => {
      if (
        teacherContext.institutionType !== 'Show all' &&
        (s.institutionType || (activeWorkspace === 'school' ? 'School' : 'College')) !==
          teacherContext.institutionType
      ) {
        return false;
      }
      if (
        teacherContext.classOrProgramme !== 'Show all' &&
        s.programme !== teacherContext.classOrProgramme &&
        s.className !== teacherContext.classOrProgramme
      ) {
        return false;
      }
      if (
        teacherContext.section !== 'Show all' &&
        (s.section || 'Section A') !== teacherContext.section
      ) {
        return false;
      }
      if (
        teacherContext.semester !== 'Show all' &&
        String(s.semester) !== teacherContext.semester
      ) {
        return false;
      }
      return true;
    });
  }, [workspaceStudents, teacherContext, activeWorkspace]);

  const clearTeacherContext = useCallback(() => {
    setTeacherContext(INITIAL_TEACHER_CONTEXT);
  }, []);

  const switchWorkspaceDemo = useCallback(
    (targetWorkspace: 'school' | 'college', targetRole?: UserRole) => {
      const nextRole = targetRole || session.role;
      setTeacherContext(INITIAL_TEACHER_CONTEXT);
      if (targetWorkspace === 'school') {
        setSession((prev) => ({
          ...prev,
          role: nextRole === 'aicte' ? 'teacher' : nextRole,
          roleDisplayLabel:
            nextRole === 'college'
              ? 'Headmaster / Principal (School Management)'
              : 'School Teacher / UDISE+ Nodal Staff',
          designation:
            nextRole === 'college'
              ? 'Principal — School Management'
              : 'Class Teacher & APAAR Nodal Officer',
          institutionId: 'INST-SCH-01',
          institutionName: 'Demo Public School, Hyderabad',
          workspaceType: 'school',
          institutionType: 'School',
        }));
      } else {
        setSession((prev) => ({
          ...prev,
          role: nextRole,
          roleDisplayLabel:
            nextRole === 'college'
              ? 'College Management / Principal'
              : nextRole === 'aicte'
              ? 'AICTE Central Monitoring Officer'
              : 'College Faculty / Nodal Staff',
          designation:
            nextRole === 'college'
              ? 'Principal & AISHE Nodal Head'
              : nextRole === 'aicte'
              ? 'Central Regional Officer'
              : 'Faculty Nodal Officer (APAAR & AISHE)',
          institutionId: 'INST-TS-01',
          institutionName: 'Deccan Institute of Engineering & Technology',
          workspaceType: 'college',
          institutionType: 'College',
        }));
      }
    },
    [session.role]
  );

  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);
  const [requests, setRequests] = useState<CorrectionRequestItem[]>(INITIAL_REQUESTS);
  const [notifications, setNotifications] =
    useState<PortalNotification[]>(INITIAL_NOTIFICATIONS);
  const [certification, setCertification] = useState<SchoolCertificationState>({
    isCertified: false,
    certifiedBy: null,
    certifiedAt: null,
    academicYear: CURRENT_ACADEMIC_YEAR,
  });
  const [studentDraft, setStudentDraft] = useState<StudentDraftData>(INITIAL_STUDENT_DRAFT);
  const [unmaskedRecordIds, setUnmaskedRecordIds] = useState<Record<string, boolean>>({});
  const [globalUnmask, setGlobalUnmask] = useState<boolean>(false);

  // Pre-fill Add New Student draft from Teacher Context Bar & Active Workspace
  useEffect(() => {
    const defaultClassOrProg =
      teacherContext.classOrProgramme !== 'Show all'
        ? teacherContext.classOrProgramme
        : activeWorkspace === 'school'
        ? 'Class 5'
        : 'B.Tech Computer Science & Engineering';
    const defaultSec =
      teacherContext.section !== 'Show all' ? teacherContext.section : 'Section A';
    const defaultSem =
      teacherContext.semester !== 'Show all'
        ? parseInt(teacherContext.semester, 10) || 1
        : 1;

    setStudentDraft((prev) => ({
      ...prev,
      programmeName: defaultClassOrProg,
      className: activeWorkspace === 'school' ? defaultClassOrProg : prev.className,
      section: defaultSec,
      semester: activeWorkspace === 'college' ? defaultSem : prev.semester,
      academicYear: selectedAcademicYear,
      department:
        activeWorkspace === 'school'
          ? defaultClassOrProg === 'Class 11' || defaultClassOrProg === 'Class 12'
            ? 'Higher Secondary / Junior College (Classes 11–12)'
            : 'School Wing (Classes 1–10)'
          : prev.department || 'Computer Science',
    }));
  }, [
    teacherContext.classOrProgramme,
    teacherContext.section,
    teacherContext.semester,
    activeWorkspace,
    selectedAcademicYear,
  ]);

  // Feature 3: Unmasked CWSN Sensitive IDs
  const [unmaskedCwsnIds, setUnmaskedCwsnIds] = useState<Record<string, boolean>>({});

  // Feature 5: Support Tickets & Interactive Tour
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>(
    INITIAL_SUPPORT_TICKETS
  );
  const [tourActive, setTourActive] = useState<boolean>(false);
  const [tourStep, setTourStep] = useState<number>(0);

  // Feature 6: Toast Notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((message: string, tone: ToastTone = 'success') => {
    const id = `tst-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev.slice(-3), { id, message, tone }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Feature 1: Session Timeout Simulation Trigger
  const [sessionWarningRequested, setSessionWarningRequested] = useState(false);
  const triggerSessionTimeoutWarningNow = () => setSessionWarningRequested(true);
  const clearSessionWarningRequest = () => setSessionWarningRequested(false);

  // Feature 8: Judge Demo Guide Drawer state
  const [demoGuideOpen, setDemoGuideOpen] = useState<boolean>(false);

  // Session-only App Language (English, Hindi, Telugu)
  const [appLanguage, setAppLanguageState] = useState<AssistantLanguage>(() => {
    try {
      const saved = window.sessionStorage.getItem('apaar_session_lang');
      if (saved === 'en' || saved === 'hi' || saved === 'te') return saved;
    } catch {
      // ignore storage errors
    }
    return 'en';
  });

  const setAppLanguage = useCallback((lang: AssistantLanguage) => {
    setAppLanguageState(lang);
    try {
      window.sessionStorage.setItem('apaar_session_lang', lang);
    } catch {
      // ignore storage errors
    }
  }, []);

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [activeBreadcrumbSuffix, setActiveBreadcrumbSuffix] = useState<string | null>(null);

  // Simulated Parent Consent Tokens
  const [consentTokens, setConsentTokens] = useState<ConsentTokenRecord[]>(() => {
    try {
      const saved = window.localStorage.getItem('apaar_demo_consent_tokens');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore storage errors
    }
    return [
      {
        token: 'demo-token-active-101',
        studentId: 'STU-2001',
        studentFirstName: 'Ananya',
        classOrProgramme: 'Class 5',
        maskedMobile: '••••••3210',
        createdAt: '2026-10-24T09:00:00.000Z',
        expiresAt: '2026-10-31T09:00:00.000Z',
        status: 'pending',
        usedOnce: false,
      },
      {
        token: 'demo-token-expired-999',
        studentId: 'STU-1009',
        studentFirstName: 'Rahul',
        classOrProgramme: 'B.Tech Mechanical Engineering',
        maskedMobile: '••••••8899',
        createdAt: '2026-10-01T09:00:00.000Z',
        expiresAt: '2026-10-08T09:00:00.000Z',
        status: 'expired',
        usedOnce: false,
      },
    ];
  });

  useEffect(() => {
    try {
      window.localStorage.setItem('apaar_demo_consent_tokens', JSON.stringify(consentTokens));
    } catch {
      // ignore
    }
  }, [consentTokens]);

  // Online / Offline Mode & IndexedDB Drafts
  const [browserOnline, setBrowserOnline] = useState<boolean>(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [simulateOffline, setSimulateOffline] = useState<boolean>(false);
  const isOnline = browserOnline && !simulateOffline;
  const [offlineDrafts, setOfflineDrafts] = useState<OfflineStoredDraft[]>([]);

  const refreshOfflineDrafts = useCallback(async () => {
    try {
      const list = await getAllOfflineDraftsFromIdb();
      setOfflineDrafts(list);
    } catch {
      setOfflineDrafts([]);
    }
  }, []);

  useEffect(() => {
    refreshOfflineDrafts();
    const handleOnline = () => setBrowserOnline(true);
    const handleOffline = () => setBrowserOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [refreshOfflineDrafts]);

  // Configurable Age-vs-Class Rules
  const [ageRangeRules, setAgeRangeRules] = useState<AgeRangeRule[]>(DEFAULT_AGE_RANGE_RULES);

  // Natural-Language Search shared query
  const [activeNlQuery, setActiveNlQuery] = useState<string>('');

  const resetLoginFlow = () => {
    setLoginFlow(INITIAL_LOGIN_FLOW);
  };

  const resetStudentDraft = () => {
    const activeMeta =
      academicYearsMeta[currentActiveAcademicYear] ||
      INITIAL_ACADEMIC_YEARS_META[CURRENT_ACADEMIC_YEAR];
    const defaultClassOrProg =
      teacherContext.classOrProgramme !== 'Show all'
        ? teacherContext.classOrProgramme
        : activeWorkspace === 'school'
        ? 'Class 5'
        : 'B.Tech Computer Science & Engineering';
    const defaultSec =
      teacherContext.section !== 'Show all' ? teacherContext.section : 'Section A';
    setStudentDraft({
      ...INITIAL_STUDENT_DRAFT,
      programmeName: defaultClassOrProg,
      className: activeWorkspace === 'school' ? defaultClassOrProg : 'Class 5',
      section: defaultSec,
      academicYear: currentActiveAcademicYear,
      admissionDate: activeMeta.defaultAdmissionDateDisplay,
      admissionNumber: `${activeMeta.admissionPrefix}-${String(allRawStudents.length + 1).padStart(
        3,
        '0'
      )}`,
    });
  };

  const addAuditLog = (entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) => {
    const newEntry: AuditLogEntry = {
      ...entry,
      id: `AUD-${101 + auditLogs.length}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
    };
    setAuditLogs((prev) => [newEntry, ...prev]);
  };

  const updateRequestStatus = (id: string, status: RequestStatus) => {
    if (isReadOnlySnapshot) {
      addToast(`Read-only snapshot (${selectedAcademicYear}): Switch to ${currentActiveAcademicYear} to edit requests.`, 'warning');
      return;
    }
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r))
    );
    addAuditLog({
      actor: session.userName,
      role: session.roleDisplayLabel || session.designation,
      action: 'REQUEST_STATUS_UPDATED',
      targetStudentId: id,
      details: `Updated request ${id} status to "${status}".`,
    });
    addToast(`Request ${id} updated to "${status}".`, 'success');
  };

  const submitNameUpdateRequest = (
    studentId: string,
    requestedName: string,
    reason: string
  ) => {
    if (isReadOnlySnapshot) {
      addToast(`Read-only snapshot (${selectedAcademicYear}): Editing is disabled.`, 'warning');
      return;
    }
    const target = students.find((s) => s.id === studentId);
    if (!target) return;
    const newReq: CorrectionRequestItem = {
      id: `REQ-${2041 + requests.length}`,
      studentId: target.id,
      rollNo: target.rollNo,
      studentName: target.fullName,
      requestType: 'Name Change',
      currentValue: target.fullName,
      requestedValue: requestedName,
      reason,
      submittedBy: session.userName,
      submittedOn: '2026-10-24',
      status: 'Open',
    };
    setRequests((prev) => [newReq, ...prev]);
    addAuditLog({
      actor: session.userName,
      role: session.roleDisplayLabel || session.designation,
      action: 'NAME_CHANGE_REQUESTED',
      targetStudentId: target.id,
      details: `Submitted Name Update request (${newReq.id}) for ${target.rollNo}: "${target.fullName}" -> "${requestedName}" (Original name not overwritten).`,
    });
    addToast(`Name correction request ${newReq.id} queued for review.`, 'success');
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    addToast('Notification marked as read.', 'info');
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    addToast('All notifications marked as read.', 'success');
  };

  const certifySchoolData = () => {
    if (isReadOnlySnapshot) {
      addToast(`Cannot modify certification on read-only snapshot (${selectedAcademicYear}).`, 'warning');
      return;
    }
    const ts = '2026-10-24 15:30 IST';
    setCertification({
      isCertified: true,
      certifiedBy: `${session.userName} (${session.designation})`,
      certifiedAt: ts,
      academicYear: selectedAcademicYear,
    });
    addAuditLog({
      actor: session.userName,
      role: session.roleDisplayLabel || session.designation,
      action: 'SCHOOL_CERTIFIED_DEMO',
      targetStudentId: session.institutionId,
      details: `Certified school roster data (Demo) for ${selectedAcademicYear} at ${ts}.`,
    });
    addToast(`School roster certified (Demo) for ${selectedAcademicYear}.`, 'success');
  };

  const reopenSchoolCertification = () => {
    if (isReadOnlySnapshot) {
      addToast(`Read-only snapshot (${selectedAcademicYear}) cannot be reopened.`, 'warning');
      return;
    }
    setCertification({
      isCertified: false,
      certifiedBy: null,
      certifiedAt: null,
      academicYear: selectedAcademicYear,
    });
    addAuditLog({
      actor: session.userName,
      role: session.roleDisplayLabel || session.designation,
      action: 'CERTIFICATION_REOPENED',
      targetStudentId: session.institutionId,
      details: `Reopened school certification for ${selectedAcademicYear} to allow further edits.`,
    });
    addToast(`Certification reopened for ${selectedAcademicYear}.`, 'info');
  };

  const shiftStudentSections = (studentIds: string[], targetSection: string) => {
    if (isReadOnlySnapshot) {
      addToast(`Read-only snapshot (${selectedAcademicYear}): Section shift is disabled.`, 'warning');
      return;
    }
    setStudents((prev) =>
      prev.map((s) =>
        studentIds.includes(s.id)
          ? { ...s, section: targetSection, lastUpdated: '2026-10-24' }
          : s
      )
    );
    addAuditLog({
      actor: session.userName,
      role: session.roleDisplayLabel || session.designation,
      action: 'SECTION_SHIFT',
      targetStudentId: studentIds.join(', '),
      details: `Shifted ${studentIds.length} student(s) to ${targetSection}.`,
    });
    addToast(`Shifted ${studentIds.length} student(s) to ${targetSection}.`, 'success');
  };

  const inactivateStudent = (
    studentId: string,
    status: 'Inactive' | 'Dropped Out' | 'Transferred (TC Issued)',
    reason: string,
    date: string,
    tcNumber?: string
  ) => {
    if (isReadOnlySnapshot) {
      addToast(`Read-only snapshot (${selectedAcademicYear}): Editing is disabled.`, 'warning');
      return;
    }
    setStudents((prev) =>
      prev.map((s) =>
        s.id === studentId
          ? {
              ...s,
              studentStatus: status,
              inactiveReason: reason,
              inactiveDate: date,
              tcNumber: tcNumber || s.tcNumber,
              lastUpdated: '2026-10-24',
            }
          : s
      )
    );
    addAuditLog({
      actor: session.userName,
      role: session.roleDisplayLabel || session.designation,
      action: status === 'Transferred (TC Issued)' ? 'TC_ISSUED_DEMO' : 'STUDENT_INACTIVATED',
      targetStudentId: studentId,
      details: `Marked ${studentId} as "${status}" on ${date}. Reason: ${reason}${
        tcNumber ? ` (TC: ${tcNumber})` : ''
      }. No record deleted.`,
    });
    addToast(`Student ${studentId} marked as "${status}" (moved to Dropbox).`, 'success');
  };

  const reactivateStudent = (studentId: string, reason: string) => {
    if (isReadOnlySnapshot) {
      addToast(`Read-only snapshot (${selectedAcademicYear}): Editing is disabled.`, 'warning');
      return;
    }
    setStudents((prev) =>
      prev.map((s) =>
        s.id === studentId
          ? {
              ...s,
              studentStatus: 'Active',
              inactiveReason: undefined,
              inactiveDate: undefined,
              lastUpdated: '2026-10-24',
            }
          : s
      )
    );
    addAuditLog({
      actor: session.userName,
      role: session.roleDisplayLabel || session.designation,
      action: 'STUDENT_REACTIVATED',
      targetStudentId: studentId,
      details: `Reactivated student ${studentId} from Dropbox/Inactive list. Reason: ${reason}.`,
    });
    addToast(`Student ${studentId} reactivated to Active roster.`, 'success');
  };

  const bulkMarkReadyForApaar = (studentIds: string[]) => {
    if (isReadOnlySnapshot) {
      addToast(`Read-only snapshot (${selectedAcademicYear}): Editing is disabled.`, 'warning');
      return;
    }
    setStudents((prev) =>
      prev.map((s) =>
        studentIds.includes(s.id)
          ? {
              ...s,
              apaarCreationReady: true,
              verificationStatus: 'Pending Official Verification',
              aiIssueNote:
                'Marked Ready for APAAR creation (Simulated) — Information complete & consent obtained.',
              lastUpdated: '2026-10-24',
            }
          : s
      )
    );
    addAuditLog({
      actor: session.userName,
      role: session.roleDisplayLabel || session.designation,
      action: 'BULK_APAAR_READY_SIM',
      targetStudentId: `${studentIds.length} Students`,
      details: `Bulk marked ${studentIds.length} student(s) with complete profile & consent as "Ready for APAAR creation - simulated".`,
    });
    addToast(`Marked ${studentIds.length} student(s) ready for APAAR creation (Simulated).`, 'success');
  };

  const finalizePromotionBatch = (studentIds: string[]) => {
    if (isReadOnlySnapshot) {
      addToast(`Read-only snapshot (${selectedAcademicYear}): Progression is disabled.`, 'warning');
      return;
    }
    setStudents((prev) =>
      prev.map((s) =>
        studentIds.includes(s.id)
          ? {
              ...s,
              semester: Math.min(8, s.semester + 1),
              academicYear: currentActiveAcademicYear,
              lastUpdated: '2026-10-24',
            }
          : s
      )
    );
    addAuditLog({
      actor: session.userName,
      role: session.roleDisplayLabel || session.designation,
      action: 'PROGRESSION_FINALIZED',
      targetStudentId: `${studentIds.length} Students`,
      details: `Promoted ${studentIds.length} student(s) to next semester for Academic Year ${currentActiveAcademicYear} (Simulated).`,
    });
    addToast(`Promoted ${studentIds.length} students in ${currentActiveAcademicYear}.`, 'success');
  };

  const toggleMaskRecord = (id: string) => {
    setUnmaskedRecordIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const updateStudentRecord = (id: string, patch: Partial<StudentRecord>) => {
    if (isReadOnlySnapshot) {
      addToast(`Read-only snapshot (${selectedAcademicYear}): Editing is disabled.`, 'warning');
      return;
    }
    setStudents((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              ...patch,
              lastUpdated: '2026-10-24',
            }
          : s
      )
    );
    addToast(`Updated student record ${id}.`, 'success');
  };

  const addStudentRecord = (
    newStu: Omit<StudentRecord, 'id' | 'lastUpdated'>,
    auditNote?: string
  ): StudentRecord => {
    const nextNum = 3001 + allRawStudents.length;
    const isJrCollege =
      activeWorkspace === 'school' &&
      (newStu.programme === 'Class 11' || newStu.programme === 'Class 12');
    const created: StudentRecord = {
      ...newStu,
      id: `STU-${nextNum}`,
      workspaceType: newStu.workspaceType || activeWorkspace,
      institutionType:
        newStu.institutionType ||
        (activeWorkspace === 'school'
          ? isJrCollege
            ? 'Junior College'
            : 'School'
          : 'College'),
      className:
        newStu.className ||
        (activeWorkspace === 'school' ? newStu.programme : undefined),
      medium:
        newStu.medium ||
        (activeWorkspace === 'school' ? 'English' : undefined),
      midDayMealEligible:
        newStu.midDayMealEligible ||
        (activeWorkspace === 'school' ? (isJrCollege ? 'No' : 'Yes') : undefined),
      academicYear: newStu.academicYear || currentActiveAcademicYear,
      section: newStu.section || 'Section A',
      studentStatus: 'Active',
      consentStatus: newStu.apaarId ? 'not_required' : 'obtained',
      nameAsPerAadhaarSim: newStu.fullName,
      lastUpdated: '2026-10-24',
    };

    setStudents((prev) => [created, ...prev]);

    setProgrammes((prev) =>
      prev.map((p) => {
        if (
          p.programmeName === newStu.programme &&
          (p.institutionId === newStu.institutionId ||
            p.institutionName === newStu.institutionName)
        ) {
          const isSim = newStu.verificationStatus === 'Simulated Verification';
          return {
            ...p,
            actualEnrolment: p.actualEnrolment + 1,
            simulatedVerifiedCount: isSim
              ? p.simulatedVerifiedCount + 1
              : p.simulatedVerifiedCount,
            pendingVerificationCount: !isSim
              ? p.pendingVerificationCount + 1
              : p.pendingVerificationCount,
          };
        }
        return p;
      })
    );

    setInstitutions((prev) =>
      prev.map((inst) => {
        if (inst.id === newStu.institutionId) {
          return {
            ...inst,
            totalEnrolled: inst.totalEnrolled + 1,
          };
        }
        return inst;
      })
    );

    addAuditLog({
      actor: session.userName,
      role: session.roleDisplayLabel || session.designation,
      action: 'STUDENT_CREATED',
      targetStudentId: created.id,
      details:
        auditNote ||
        `Created student record ${created.fullName} (${created.rollNo}) in ${created.programme} (${created.academicYear}) with status "${created.verificationStatus}".`,
    });
    addToast(`Student ${created.fullName} (${created.id}) saved to ${created.academicYear} roster.`, 'success');

    return created;
  };

  const applyStandardization = (id: string) => {
    if (isReadOnlySnapshot) {
      addToast(`Read-only snapshot (${selectedAcademicYear}): Standardization is disabled.`, 'warning');
      return;
    }
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        const cleanedName = s.fullName
          .replace(/^MD\.\s*/i, 'Mohammed ')
          .split(' ')
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
          .join(' ');
        const cleanedDob = s.dob.includes('/')
          ? s.dob.split('/').reverse().join('-')
          : s.dob;
        const nextStatus: VerificationStatus = s.apaarId
          ? 'Simulated Verification'
          : 'Pending Official Verification';

        return {
          ...s,
          fullName: cleanedName,
          dob: cleanedDob,
          verificationStatus: nextStatus,
          dataQualityScore: Math.min(100, s.dataQualityScore + 20),
          aiIssueNote:
            'Standardized via AI Data Cleaning Assistant (Human-reviewed). Pending Official Verification.',
          reviewedStatus: 'Approved for Submission',
          lastUpdated: '2026-10-24',
        };
      })
    );
    addToast(`Standardized record ${id} (Simulated Verification).`, 'success');
  };

  const markDuplicateDecision = (
    primaryId: string,
    secondaryId: string,
    decision: NonNullable<StudentRecord['reviewedStatus']>
  ) => {
    if (isReadOnlySnapshot) {
      addToast(`Read-only snapshot (${selectedAcademicYear}): Duplicate review is read-only.`, 'warning');
      return;
    }
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === primaryId || s.id === secondaryId) {
          return {
            ...s,
            reviewedStatus: decision,
            lastUpdated: '2026-10-24',
          };
        }
        return s;
      })
    );
    addAuditLog({
      actor: session.userName,
      role: session.roleDisplayLabel || session.designation,
      action: 'DUPLICATE_REVIEW_UPDATED',
      targetStudentId: `${primaryId} & ${secondaryId}`,
      details: `Updated duplicate pair status to "${decision}" (Zero Auto-Merge enforced).`,
    });
    addToast(`Duplicate pair ${primaryId}/${secondaryId} marked as "${decision}".`, 'success');
  };

  // Feature 2 (New): Class and Section Management
  const createManagedSection = ({
    programmeName,
    department,
    sectionName,
    capacity,
    classTeacher,
  }: {
    programmeName: string;
    department: string;
    sectionName: string;
    capacity: number;
    classTeacher: string;
  }) => {
    if (isReadOnlySnapshot) {
      addToast(`Read-only snapshot (${selectedAcademicYear}): Cannot create sections.`, 'warning');
      return;
    }
    const newSec: ManagedSection = {
      id: `SEC-${Date.now().toString(36).toUpperCase()}`,
      programmeId: `PRG-CUSTOM`,
      programmeName: programmeName.trim(),
      department: department.trim() || 'Engineering',
      sectionName: sectionName.trim(),
      capacity: Math.max(10, capacity),
      classTeacher,
      isArchived: false,
    };
    setManagedSections((prev) => [...prev, newSec]);
    addAuditLog({
      actor: session.userName,
      role: session.roleDisplayLabel || session.designation,
      action: 'SECTION_CREATED',
      targetStudentId: newSec.id,
      details: `Created section "${newSec.sectionName}" under "${newSec.programmeName}" (Capacity: ${newSec.capacity}, Class Teacher: ${newSec.classTeacher}).`,
    });
    addToast(`Created ${newSec.sectionName} (${newSec.programmeName}).`, 'success');
  };

  const renameManagedSection = (
    id: string,
    newSectionName: string,
    newProgrammeName?: string
  ) => {
    if (isReadOnlySnapshot) {
      addToast(`Read-only snapshot (${selectedAcademicYear}): Cannot rename sections.`, 'warning');
      return;
    }
    const target = managedSections.find((s) => s.id === id);
    if (!target) return;
    const oldSecName = target.sectionName;
    const oldProgName = target.programmeName;
    const trimmedSec = newSectionName.trim() || oldSecName;
    const trimmedProg = newProgrammeName?.trim() || oldProgName;

    setManagedSections((prev) =>
      prev.map((sec) =>
        sec.id === id
          ? { ...sec, sectionName: trimmedSec, programmeName: trimmedProg }
          : sec
      )
    );

    // Keep enrolled students in sync with the renamed section/class
    setStudents((prev) =>
      prev.map((stu) => {
        if (stu.programme === oldProgName && (stu.section || 'Section A') === oldSecName) {
          return {
            ...stu,
            programme: trimmedProg,
            section: trimmedSec,
          };
        }
        return stu;
      })
    );

    addAuditLog({
      actor: session.userName,
      role: session.roleDisplayLabel || session.designation,
      action: 'SECTION_RENAMED',
      targetStudentId: id,
      details: `Renamed "${oldProgName} — ${oldSecName}" to "${trimmedProg} — ${trimmedSec}".`,
    });
    addToast(`Renamed section to "${trimmedSec}".`, 'success');
  };

  const updateManagedSectionMeta = (
    id: string,
    capacity: number,
    classTeacher: string
  ) => {
    if (isReadOnlySnapshot) {
      addToast(`Read-only snapshot (${selectedAcademicYear}): Cannot edit section settings.`, 'warning');
      return;
    }
    setManagedSections((prev) =>
      prev.map((sec) =>
        sec.id === id ? { ...sec, capacity: Math.max(1, capacity), classTeacher } : sec
      )
    );
    addAuditLog({
      actor: session.userName,
      role: session.roleDisplayLabel || session.designation,
      action: 'SECTION_META_UPDATED',
      targetStudentId: id,
      details: `Updated section ${id} capacity to ${capacity} and assigned Class Teacher: ${classTeacher}.`,
    });
    addToast(`Updated section capacity (${capacity}) & Class Teacher (${classTeacher}).`, 'success');
  };

  const archiveManagedSection = (id: string): { success: boolean; message: string } => {
    if (isReadOnlySnapshot) {
      const msg = `Read-only snapshot (${selectedAcademicYear}): Cannot archive sections.`;
      addToast(msg, 'warning');
      return { success: false, message: msg };
    }
    const target = managedSections.find((sec) => sec.id === id);
    if (!target) {
      return { success: false, message: 'Section not found.' };
    }

    const activeInSec = students.filter(
      (s) =>
        s.studentStatus === 'Active' &&
        s.programme === target.programmeName &&
        (s.section || 'Section A') === target.sectionName
    );

    if (activeInSec.length > 0) {
      const blockMsg = `Cannot archive "${target.sectionName}" (${target.programmeName}) because it still has ${activeInSec.length} active student(s). Archiving never deletes students—please move these students first using the Section Shift module.`;
      addToast(blockMsg, 'error');
      addAuditLog({
        actor: session.userName,
        role: session.roleDisplayLabel || session.designation,
        action: 'SECTION_ARCHIVE_BLOCKED',
        targetStudentId: id,
        details: `Blocked archiving "${target.programmeName} — ${target.sectionName}" (${activeInSec.length} active students present).`,
      });
      return { success: false, message: blockMsg };
    }

    const archivedAt = new Date().toISOString().slice(0, 10);
    setManagedSections((prev) =>
      prev.map((sec) =>
        sec.id === id ? { ...sec, isArchived: true, archivedAt } : sec
      )
    );
    const okMsg = `Archived section "${target.sectionName}" (${target.programmeName}). Zero student records were deleted.`;
    addAuditLog({
      actor: session.userName,
      role: session.roleDisplayLabel || session.designation,
      action: 'SECTION_ARCHIVED',
      targetStudentId: id,
      details: okMsg,
    });
    addToast(okMsg, 'success');
    return { success: true, message: okMsg };
  };

  const restoreManagedSection = (id: string) => {
    setManagedSections((prev) =>
      prev.map((sec) =>
        sec.id === id ? { ...sec, isArchived: false, archivedAt: undefined } : sec
      )
    );
    addToast('Section restored to active list.', 'success');
  };

  // Feature 3 (New): CWSN Sensitive Unmasking with Mandatory Audit Log
  const toggleUnmaskCwsn = (studentId: string) => {
    const currentlyUnmasked = !!unmaskedCwsnIds[studentId];
    setUnmaskedCwsnIds((prev) => ({
      ...prev,
      [studentId]: !currentlyUnmasked,
    }));
    if (!currentlyUnmasked) {
      addAuditLog({
        actor: session.userName,
        role: session.roleDisplayLabel || session.designation,
        action: 'CWSN_SENSITIVE_ACCESS',
        targetStudentId: studentId,
        details: `Permitted role (${session.roleDisplayLabel || session.role}) viewed sensitive CWSN accommodation status for ${studentId}.`,
      });
      addToast(`Sensitive CWSN accommodation details revealed for ${studentId} (Audit-logged).`, 'info');
    }
  };

  // Feature 4 (New): Academic Year Rollover Wizard
  const executeAcademicYearRollover = (targetYear: string) => {
    const outgoingYear = currentActiveAcademicYear;
    const nextMeta: AcademicYearMeta =
      academicYearsMeta[targetYear] || {
        code: targetYear,
        label: `${targetYear} (Current Academic Year)`,
        selectorLabel: `${targetYear} — Current Academic Year`,
        startDateDisplay: `01/04/${targetYear.slice(0, 4)}`,
        endDateDisplay: `31/03/20${targetYear.slice(-2)}`,
        aprilFirstIso: `${targetYear.slice(0, 4)}-04-01`,
        startYearNum: parseInt(targetYear.slice(0, 4), 10) || 2027,
        defaultAdmissionDateDisplay: `14/08/${targetYear.slice(0, 4)}`,
        admissionPrefix: `ADM-${targetYear.slice(0, 4)}`,
        batchCsvFilename: `DIET_Batch_${targetYear.replace('-', '_')}.csv`,
        isReadOnlySnapshot: false,
      };

    setAcademicYearsMeta((prev) => ({
      ...prev,
      [outgoingYear]: {
        ...prev[outgoingYear],
        label: `${outgoingYear} (Previous year snapshot)`,
        selectorLabel: `${outgoingYear} — Previous year (snapshot)`,
        isReadOnlySnapshot: true,
      },
      [targetYear]: {
        ...nextMeta,
        isReadOnlySnapshot: false,
      },
    }));

    setCurrentActiveAcademicYear(targetYear);
    setSelectedAcademicYear(targetYear);

    // Carry over continuing students; students not promoted stay and are flagged for review
    setStudents((prev) =>
      prev.map((s) => {
        if (s.studentStatus !== 'Active') return s;
        const hasUnresolvedIssue =
          s.verificationStatus === 'Mismatch Flagged' ||
          s.reviewedStatus === 'Possible Duplicate';
        return {
          ...s,
          academicYear: targetYear,
          semester: hasUnresolvedIssue ? s.semester : Math.min(8, s.semester + 1),
          aiIssueNote: hasUnresolvedIssue
            ? `Carried over from ${outgoingYear} without automatic promotion — listed for nodal review.`
            : s.aiIssueNote,
        };
      })
    );

    // Reset annual certification for the new academic year
    setCertification({
      isCertified: false,
      certifiedBy: null,
      certifiedAt: null,
      academicYear: targetYear,
    });

    addAuditLog({
      actor: session.userName,
      role: session.roleDisplayLabel || session.designation,
      action: 'ACADEMIC_YEAR_ROLLOVER',
      targetStudentId: `${outgoingYear} -> ${targetYear}`,
      details: `Completed Academic Year Rollover from ${outgoingYear} to ${targetYear}. ${outgoingYear} preserved as a read-only snapshot. Continuing students, classes, and sections carried over; zero records deleted.`,
    });

    addToast(
      `Rollover complete! ${targetYear} is now the active academic year and ${outgoingYear} is a read-only snapshot.`,
      'success'
    );
  };

  // Feature 5 (New): Help & Support Tickets
  const createSupportTicket = ({
    subject,
    page,
    description,
    priority,
  }: {
    subject: string;
    page: string;
    description: string;
    priority: TicketPriority;
  }): SupportTicket => {
    const newTicket: SupportTicket = {
      id: `TKT-${101 + supportTickets.length}`,
      subject: subject.trim(),
      page: page.trim(),
      description: description.trim(),
      priority,
      status: 'Open',
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      submittedBy: session.userName,
    };
    setSupportTickets((prev) => [newTicket, ...prev]);
    addAuditLog({
      actor: session.userName,
      role: session.roleDisplayLabel || session.designation,
      action: 'SUPPORT_TICKET_CREATED',
      targetStudentId: newTicket.id,
      details: `Reported support ticket ${newTicket.id} (${newTicket.priority}) on ${newTicket.page}: "${newTicket.subject}".`,
    });
    addToast(`Support ticket ${newTicket.id} created (Status: Open).`, 'success');
    return newTicket;
  };

  const updateSupportTicketStatus = (id: string, status: TicketStatus) => {
    setSupportTickets((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status } : t))
    );
    addToast(`Support ticket ${id} marked as "${status}".`, 'info');
  };

  // Parent Consent Link (Simulated)
  const createSimulatedConsentRequest = ({
    studentId,
    fullName,
    classOrProgramme,
    mobileNumber,
    forceExpiredDemo,
  }: {
    studentId: string;
    fullName: string;
    classOrProgramme: string;
    mobileNumber: string;
    forceExpiredDemo?: boolean;
  }): ConsentTokenRecord => {
    const firstNameOnly = (fullName.trim().split(/\s+/)[0] || 'Student').replace(
      /[^a-zA-Z]/g,
      ''
    );
    const cleanMob = mobileNumber.replace(/\D/g, '');
    const maskedMobile =
      cleanMob.length >= 4 ? `••••••${cleanMob.slice(-4)}` : '••••••0000';

    const now = new Date();
    const createdAt = now.toISOString();
    const expiresDate = new Date(
      now.getTime() + (forceExpiredDemo ? -86400000 : 7 * 24 * 60 * 60 * 1000)
    );
    const token = `cns-${Math.random().toString(36).slice(2, 8)}-${Date.now()
      .toString(36)
      .slice(-4)}`;

    const newRecord: ConsentTokenRecord = {
      token,
      studentId,
      studentFirstName: firstNameOnly || 'Student',
      classOrProgramme,
      maskedMobile,
      createdAt,
      expiresAt: expiresDate.toISOString(),
      status: forceExpiredDemo ? 'expired' : 'pending',
      usedOnce: false,
    };

    setConsentTokens((prev) => [newRecord, ...prev]);

    if (studentId === 'DRAFT') {
      setStudentDraft((prev) => ({
        ...prev,
        consentStatus: 'pending',
      }));
    } else {
      setStudents((prev) =>
        prev.map((s) =>
          s.id === studentId ? { ...s, consentStatus: 'pending', lastUpdated: '2026-10-25' } : s
        )
      );
    }

    addAuditLog({
      actor: session.userName,
      role: session.roleDisplayLabel || session.designation,
      action: 'CONSENT_LINK_GENERATED_SIM',
      targetStudentId: studentId,
      details: `Generated simulated 7-day single-use parent consent token (${token}) for ${firstNameOnly} (${classOrProgramme}) via masked contact ${maskedMobile}. No real SMS/WhatsApp sent.`,
    });
    addToast(`Simulated parent consent link generated for ${firstNameOnly}.`, 'info');

    return newRecord;
  };

  const respondToConsentToken = (
    token: string,
    decision: 'obtained' | 'declined'
  ): { success: boolean; message: string } => {
    const found = consentTokens.find((t) => t.token === token);
    if (!found) {
      return { success: false, message: 'Invalid or unknown consent token.' };
    }
    if (found.usedOnce || found.status === 'obtained' || found.status === 'declined') {
      return {
        success: false,
        message: 'This single-use consent link has already been used and cannot be submitted again.',
      };
    }
    const now = new Date();
    if (found.status === 'expired' || new Date(found.expiresAt) < now) {
      return {
        success: false,
        message: 'This consent link expired after 7 days. Please ask the school nodal officer for a new link.',
      };
    }

    const respondedAt = now.toISOString().replace('T', ' ').slice(0, 19);

    setConsentTokens((prev) =>
      prev.map((t) =>
        t.token === token
          ? {
              ...t,
              status: decision,
              respondedAt,
              usedOnce: true,
            }
          : t
      )
    );

    if (found.studentId === 'DRAFT') {
      setStudentDraft((prev) => ({
        ...prev,
        consentStatus: decision,
      }));
    } else {
      setStudents((prev) =>
        prev.map((s) =>
          s.id === found.studentId
            ? {
                ...s,
                consentStatus: decision,
                apaarCreationReady: decision === 'obtained' && !s.apaarId,
                lastUpdated: '2026-10-25',
              }
            : s
        )
      );
    }

    addAuditLog({
      actor: 'Parent / Guardian (Public Consent Link)',
      role: 'Parent / Guardian (Simulated)',
      action: decision === 'obtained' ? 'PARENT_CONSENT_OBTAINED' : 'PARENT_CONSENT_DECLINED',
      targetStudentId: found.studentId,
      details: `Parent/Guardian ${
        decision === 'obtained' ? 'AGREED (Obtained)' : 'DECLINED'
      } APAAR identity seeding consent via token ${token} at ${respondedAt}.`,
    });
    addToast(
      decision === 'obtained'
        ? 'Parent consent recorded as Obtained (Simulated).'
        : 'Parent consent recorded as Declined (Simulated).',
      decision === 'obtained' ? 'success' : 'warning'
    );

    return {
      success: true,
      message:
        decision === 'obtained'
          ? 'Thank you. Your consent has been recorded as Obtained (Simulated).'
          : 'Your decision to Decline consent has been recorded (Simulated).',
    };
  };

  // Sync Offline Drafts from IndexedDB to In-Memory Database
  const syncOfflineDraftsToDb = async (
    reenteredApaarByDraftId?: Record<string, string>
  ): Promise<{ syncedCount: number; message: string }> => {
    const drafts = await getAllOfflineDraftsFromIdb();
    if (drafts.length === 0) {
      return { syncedCount: 0, message: 'No offline drafts waiting to sync.' };
    }

    let syncedCount = 0;
    for (const item of drafts) {
      const d = item.nonSensitiveData;
      if (!d.studentNameSchool.trim() || !d.gender || !d.dob) {
        continue;
      }
      const reenteredApaar = reenteredApaarByDraftId?.[item.draftId]?.replace(/\D/g, '') || null;
      const generatedPen = String(29481060000 + Math.floor(Math.random() * 89999)).slice(0, 11);

      addStudentRecord(
        {
          rollNo: d.admissionNumber || `ADM-2026-SYNC-${syncedCount + 1}`,
          fullName: d.studentNameSchool.trim(),
          dob: d.dob,
          gender: (d.gender || 'F') as 'F' | 'M' | 'O',
          pen: generatedPen,
          apaarId: d.hasExistingApaar === 'yes' ? reenteredApaar : null,
          institutionId: session.institutionId,
          institutionName: session.institutionName,
          state: session.state,
          programme: d.programmeName,
          section: d.section || 'Section A',
          academicYear: d.academicYear || currentActiveAcademicYear,
          semester: 1,
          verificationStatus: 'Pending Official Verification',
          dataQualityScore: 90,
          aiIssueNote:
            'Synced from local IndexedDB Offline Draft after connection restored (Simulated).',
          reviewedStatus: 'Unreviewed',
          cwsnDetails:
            d.isCwsn === 'yes'
              ? {
                  isCwsn: true,
                  disabilityCategory: d.cwsnDisabilityCategory || 'Locomotor Disability',
                  certificateStatus:
                    (d.cwsnCertificateStatus as CwsnCertificateStatus) ||
                    'Applied / Pending Issuance',
                  supportNeeded: d.cwsnSupportNeeded || [],
                  accommodationNote: d.cwsnAccommodationNote || '',
                }
              : { isCwsn: false },
        },
        `Synced offline draft "${item.draftId}" (${d.studentNameSchool.trim()}) from IndexedDB to database.`
      );

      await deleteOfflineDraftFromIdb(item.draftId);
      syncedCount++;
    }

    await refreshOfflineDrafts();
    const msg =
      syncedCount > 0
        ? `Successfully validated and synced ${syncedCount} offline draft(s) to the school roster.`
        : 'Drafts require mandatory fields (Name, Gender, DOB) before final sync. Loaded into form.';
    addToast(msg, syncedCount > 0 ? 'success' : 'warning');
    return {
      syncedCount,
      message: msg,
    };
  };

  const clearOfflineDrafts = async () => {
    await clearAllOfflineDraftsFromIdb();
    await refreshOfflineDrafts();
    addAuditLog({
      actor: session.userName,
      role: session.roleDisplayLabel || session.designation,
      action: 'LOCAL_DRAFTS_CLEARED',
      targetStudentId: 'INDEXED_DB',
      details: 'Cleared all locally stored non-sensitive student drafts from browser IndexedDB.',
    });
    addToast('Cleared all local IndexedDB drafts.', 'info');
  };

  // Update Configurable Age-vs-Class Rules
  const updateAgeRangeRule = (id: string, minAgeYears: number, maxAgeYears: number) => {
    setAgeRangeRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, minAgeYears, maxAgeYears } : r))
    );
    addAuditLog({
      actor: session.userName,
      role: session.roleDisplayLabel || session.designation,
      action: 'AGE_RULE_CONFIG_UPDATED',
      targetStudentId: id,
      details: `Updated typical age range for ${id} to ${minAgeYears}–${maxAgeYears} years (as on 1 April).`,
    });
    addToast(`Updated age rule ${id} to ${minAgeYears}–${maxAgeYears} yrs.`, 'success');
  };

  const resetAgeRangeRules = () => {
    setAgeRangeRules(DEFAULT_AGE_RANGE_RULES);
    addToast('Reset Age-vs-Class rules to default.', 'info');
  };

  // Feature 8: Reset All Demo Data (restores 2026-27 as current year)
  const resetAllDemoData = async () => {
    await clearAllOfflineDraftsFromIdb();
    await refreshOfflineDrafts();
    setAcademicYearsMeta(INITIAL_ACADEMIC_YEARS_META);
    setCurrentActiveAcademicYear(CURRENT_ACADEMIC_YEAR);
    setSelectedAcademicYear(CURRENT_ACADEMIC_YEAR);
    setStudents(enrichStudents(dataService.getInitialStudents()));
    setProgrammes(dataService.getInitialProgrammes());
    setInstitutions(dataService.getInitialInstitutions());
    setManagedSections(dataService.getInitialManagedSections());
    setRequests(INITIAL_REQUESTS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setSupportTickets(INITIAL_SUPPORT_TICKETS);
    setCertification({
      isCertified: false,
      certifiedBy: null,
      certifiedAt: null,
      academicYear: CURRENT_ACADEMIC_YEAR,
    });
    setStudentDraft(INITIAL_STUDENT_DRAFT);
    setTeacherContext(INITIAL_TEACHER_CONTEXT);
    setCanViewSensitive(false);
    setUnmaskedRecordIds({});
    setUnmaskedCwsnIds({});
    setGlobalUnmask(false);
    setActiveNlQuery('');
    setSimulateOffline(false);

    const resetLog: AuditLogEntry = {
      id: 'AUD-RESET-100',
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      actor: session.userName,
      role: session.roleDisplayLabel || session.designation,
      action: 'DEMO_DATA_RESET',
      targetStudentId: CURRENT_ACADEMIC_YEAR,
      details: `Reset all synthetic demo data and restored ${CURRENT_ACADEMIC_YEAR} as the current active academic year.`,
    };
    setAuditLogs([resetLog, ...INITIAL_AUDIT_LOGS]);
    addToast(
      `Demo data reset complete! Restored ${CURRENT_ACADEMIC_YEAR} as the current academic year.`,
      'success'
    );
  };

  const signInDemoAccount = useCallback(
    (accountKey: DemoAccountKey): string => {
      setTeacherContext(INITIAL_TEACHER_CONTEXT);

      const logSignIn = (actor: string, roleLabel: string, workspaceLabel: string) => {
        const entry: AuditLogEntry = {
          id: `AUD-${Math.floor(1000 + Math.random() * 9000)}`,
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
          actor,
          role: roleLabel,
          action: 'DEMO_CREDENTIAL_SIGN_IN',
          targetStudentId: 'SESSION',
          details: `Signed in via /demo-credentials quick-login (${roleLabel} · Workspace: ${workspaceLabel} · Demo accounts only).`,
        };
        setAuditLogs((prev) => [entry, ...prev]);
      };

      if (accountKey === 'school_teacher') {
        setIsClassTeacherScoped(true);
        setSession({
          state: 'Telangana',
          role: 'teacher',
          roleDisplayLabel: 'School Teacher (Assigned Classes: 5-A, 5-B, 10-A)',
          isNationalLogin: false,
          isAuditor: false,
          userName: 'Dr. Kavitha Narayanan',
          designation: 'Class Teacher (Class 5-A, 5-B, 10-A) · Demo Public School',
          institutionId: 'INST-SCH-01',
          institutionName: 'Demo Public School, Hyderabad',
          workspaceType: 'school',
          institutionType: 'School',
        });
        logSignIn('Dr. Kavitha Narayanan', 'School Teacher', 'SCHOOL');
        return '/teacher/school';
      }

      if (accountKey === 'school_management') {
        setIsClassTeacherScoped(false);
        setSession({
          state: 'Telangana',
          role: 'college',
          roleDisplayLabel: 'School Management (Headmaster / Principal)',
          isNationalLogin: false,
          isAuditor: false,
          userName: 'Prof. Rajeshwar Rao',
          designation: 'Headmaster / Principal · Demo Public School, Hyderabad',
          institutionId: 'INST-SCH-01',
          institutionName: 'Demo Public School, Hyderabad',
          workspaceType: 'school',
          institutionType: 'School',
        });
        logSignIn('Prof. Rajeshwar Rao', 'School Management (Headmaster / Principal)', 'SCHOOL');
        return '/school-management';
      }

      if (accountKey === 'college_teacher') {
        setIsClassTeacherScoped(true);
        setSession({
          state: 'Telangana',
          role: 'teacher',
          roleDisplayLabel: 'College Teacher (Assigned: B.Tech CSE-A, CSE-B)',
          isNationalLogin: false,
          isAuditor: false,
          userName: 'Dr. Kavitha Narayanan',
          designation: 'Faculty Class Advisor (B.Tech CSE Sec A & B) · DIET',
          institutionId: 'INST-TS-01',
          institutionName: 'Deccan Institute of Engineering & Technology',
          workspaceType: 'college',
          institutionType: 'College',
        });
        logSignIn('Dr. Kavitha Narayanan', 'College Teacher', 'COLLEGE');
        return '/teacher/college';
      }

      if (accountKey === 'college_management') {
        setIsClassTeacherScoped(false);
        setSession({
          state: 'Telangana',
          role: 'college',
          roleDisplayLabel: 'College Management (Principal / Registrar)',
          isNationalLogin: false,
          isAuditor: false,
          userName: 'Prof. Rajeshwar Rao',
          designation: 'Principal & Registrar · Deccan Institute of Engineering & Technology',
          institutionId: 'INST-TS-01',
          institutionName: 'Deccan Institute of Engineering & Technology',
          workspaceType: 'college',
          institutionType: 'College',
        });
        logSignIn('Prof. Rajeshwar Rao', 'College Management', 'COLLEGE');
        return '/college';
      }

      if (accountKey === 'aicte_state') {
        setIsClassTeacherScoped(false);
        setSession({
          state: 'Telangana',
          role: 'aicte',
          roleDisplayLabel: 'AICTE State Officer (Telangana)',
          isNationalLogin: false,
          isAuditor: false,
          userName: 'Dr. S. Venugopal',
          designation: 'AICTE State Directorate Officer · Telangana',
          institutionId: 'AICTE-STATE-TS',
          institutionName: 'AICTE Telangana State Directorate',
          workspaceType: 'college',
          institutionType: 'College',
        });
        logSignIn('Dr. S. Venugopal', 'AICTE State Officer', 'COLLEGE');
        return '/aicte';
      }

      if (accountKey === 'aicte_national') {
        setIsClassTeacherScoped(false);
        setSession({
          state: 'All-India (National)',
          role: 'aicte',
          roleDisplayLabel: 'AICTE National Officer (All-India)',
          isNationalLogin: true,
          isAuditor: false,
          userName: 'Shri Arvind Krishnan',
          designation: 'AICTE National Central Monitoring Director',
          institutionId: 'NATIONAL-HQ',
          institutionName: 'AICTE Central Monitoring Cell (National)',
          workspaceType: 'college',
          institutionType: 'College',
        });
        logSignIn('Shri Arvind Krishnan', 'AICTE National Officer', 'COLLEGE');
        return '/aicte';
      }

      // 'auditor' account
      setIsClassTeacherScoped(false);
      setSession({
        state: 'Telangana',
        role: 'college',
        roleDisplayLabel: 'Institutional & Compliance Auditor (Read-Only)',
        isNationalLogin: false,
        isAuditor: true,
        userName: 'Smt. Padmaja Deshmukh, IA&AS (Sim.)',
        designation: 'Compliance & Audit Inspector · School Governance',
        institutionId: 'INST-SCH-01',
        institutionName: 'Demo Public School, Hyderabad',
        workspaceType: 'school',
        institutionType: 'School',
      });
      logSignIn('Smt. Padmaja Deshmukh', 'Auditor', 'SCHOOL');
      return '/school-management/audit';
    },
    []
  );

  const switchRoleSignOut = useCallback((): string => {
    const preservedState =
      session.state && session.state !== 'All-India (National)'
        ? session.state
        : 'Telangana';
    const wasNational = Boolean(session.isNationalLogin);

    const signOutEntry: AuditLogEntry = {
      id: `AUD-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      actor: session.userName,
      role: session.roleDisplayLabel || session.designation,
      action: 'ROLE_SWITCH_SIGN_OUT',
      targetStudentId: 'SESSION',
      details: `User signed out via Switch Role to log in again with another role (State preserved in app state: ${
        wasNational ? 'National' : preservedState
      }).`,
    };
    setAuditLogs((prev) => [signOutEntry, ...prev]);

    // Clear session-specific view & sensitive flags
    setTeacherContext(INITIAL_TEACHER_CONTEXT);
    setCanViewSensitive(false);
    setUnmaskedRecordIds({});
    setUnmaskedCwsnIds({});
    setGlobalUnmask(false);
    setHasUnsavedChanges(false);
    setActiveBreadcrumbSuffix(null);

    try {
      window.sessionStorage.removeItem('apaar_active_session');
    } catch {
      // ignore
    }

    // Keep chosen state in app state only and route to /login/role
    setLoginFlow({
      step1Completed: true,
      isNationalLogin: wasNational,
      selectedState: wasNational ? 'All-India (National)' : preservedState,
      step2Completed: false,
      selectedRole: null,
      roleLabel: '',
      step3Completed: false,
      selectedInstitutionId: '',
      selectedInstitutionName: '',
      selectedWorkspaceType: 'school',
      selectedInstitutionType: 'School',
    });

    addToast('Signed out. Please choose a role to sign in again.', 'info');
    return '/login/role';
  }, [session, addToast]);

  return (
    <AppContext.Provider
      value={{
        session,
        setSession,
        activeWorkspace,
        switchWorkspaceDemo,
        signInDemoAccount,
        isClassTeacherScoped,
        setIsClassTeacherScoped,
        assignedTeacherSections,
        assignedTeacherScopeLabel,
        teacherContext,
        setTeacherContext,
        clearTeacherContext,
        canViewSensitive,
        setCanViewSensitive,
        selectedAcademicYear,
        setSelectedAcademicYear,
        currentActiveAcademicYear,
        academicYearsMeta,
        isReadOnlySnapshot,
        executeAcademicYearRollover,
        loginFlow,
        setLoginFlow,
        resetLoginFlow,
        students,
        workspaceStudents,
        allInstitutionStudents: allRawStudents,
        programmes,
        institutions,
        allInstitutions,
        stateRows,
        auditLogs,
        addAuditLog,
        requests,
        updateRequestStatus,
        submitNameUpdateRequest,
        notifications,
        markNotificationRead,
        markAllNotificationsRead,
        certification,
        certifySchoolData,
        reopenSchoolCertification,
        shiftStudentSections,
        inactivateStudent,
        reactivateStudent,
        bulkMarkReadyForApaar,
        finalizePromotionBatch,
        studentDraft,
        setStudentDraft,
        resetStudentDraft,
        unmaskedRecordIds,
        toggleMaskRecord,
        globalUnmask,
        setGlobalUnmask,
        updateStudentRecord,
        addStudentRecord,
        applyStandardization,
        markDuplicateDecision,
        consentTokens,
        createSimulatedConsentRequest,
        respondToConsentToken,
        isOnline,
        simulateOffline,
        setSimulateOffline,
        offlineDrafts,
        refreshOfflineDrafts,
        syncOfflineDraftsToDb,
        clearOfflineDrafts,
        ageRangeRules,
        updateAgeRangeRule,
        resetAgeRangeRules,
        activeNlQuery,
        setActiveNlQuery,
        managedSections,
        createManagedSection,
        renameManagedSection,
        updateManagedSectionMeta,
        archiveManagedSection,
        restoreManagedSection,
        unmaskedCwsnIds,
        toggleUnmaskCwsn,
        supportTickets,
        createSupportTicket,
        updateSupportTicketStatus,
        tourActive,
        setTourActive,
        tourStep,
        setTourStep,
        toasts,
        addToast,
        dismissToast,
        triggerSessionTimeoutWarningNow,
        sessionWarningRequested,
        clearSessionWarningRequest,
        demoGuideOpen,
        setDemoGuideOpen,
        resetAllDemoData,
        appLanguage,
        setAppLanguage,
        hasUnsavedChanges,
        setHasUnsavedChanges,
        activeBreadcrumbSuffix,
        setActiveBreadcrumbSuffix,
        switchRoleSignOut,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return ctx;
};
export { CURRENT_ACADEMIC_YEAR, PREVIOUS_ACADEMIC_YEAR, NEXT_ROLLOVER_ACADEMIC_YEAR };
