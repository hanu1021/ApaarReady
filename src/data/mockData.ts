import {
  CURRENT_ACADEMIC_YEAR,
  PREVIOUS_ACADEMIC_YEAR,
  CwsnStudentDetails,
} from '../config/academicYears';

export type UserRole = 'teacher' | 'college' | 'aicte';

export type InstitutionEntityType = 'School' | 'Junior College' | 'College';
export type WorkspaceCategory = 'school' | 'college';

export type VerificationStatus =
  | 'Simulated Verification'
  | 'Pending Official Verification'
  | 'Mismatch Flagged'
  | 'Missing APAAR ID';

export type EducationStageCode =
  | 'Primary'
  | 'Upper Primary'
  | 'Secondary'
  | 'Higher Secondary'
  | 'Diploma'
  | 'UG'
  | 'PG';

export type EducationHistoryStatus =
  | 'Studying'
  | 'Completed'
  | 'Transferred'
  | 'Dropped out'
  | 'Completed (Simulated)'
  | 'Currently Enrolled (Simulated)';

export type EducationSourceLabel = 'Imported' | 'Manually Entered' | 'Demonstration Data';

export interface EducationHistoryStage {
  id: string;
  studentId: string;
  stageId: string;
  stage: EducationStageCode;
  stageLabel: string;
  classOrProgramme: string;
  section: string;
  institutionName: string;
  institutionType: 'School' | 'College' | 'University' | 'Polytechnic' | 'Junior College';
  boardOrUniversity: string;
  startYear: string;
  endYear: string;
  academicYear: string;
  academicYears: string;
  rollNo: string;
  rollOrRegNo: string;
  status: EducationHistoryStatus;
  exitReason?: string;
  state: string;
  sourceLabel: EducationSourceLabel;
  gapYearNote?: string;
}

export interface StudentRecord {
  id: string;
  rollNo: string;
  fullName: string;
  dob: string;
  gender: 'F' | 'M' | 'O';
  pen: string; // 11-digit Permanent Education Number (masked by default: last 3 chars)
  apaarId: string | null; // 12-digit APAAR ID (masked by default: last 3 chars, or null if missing)
  institutionId: string;
  institutionName: string;
  institutionType?: InstitutionEntityType; // 'School' | 'Junior College' | 'College'
  workspaceType?: WorkspaceCategory; // 'school' | 'college'
  state: string;
  programme: string; // For schools: "Class 1".."Class 12"; For colleges: "B.Tech Computer Science & Engineering", etc.
  className?: string; // Explicit Class label for schools/junior colleges ("Class 1".."Class 12")
  medium?: string; // "English" | "Telugu" | "Hindi" | "Kannada" | "Marathi"
  midDayMealEligible?: 'Yes' | 'No'; // School workspace demo field
  academicYear: string;
  semester: number; // For colleges: 1..8; For schools: class number 1..12
  verificationStatus: VerificationStatus;
  dataQualityScore: number; // 0-100
  aiIssueNote?: string;
  duplicateCandidateId?: string;
  duplicateConfidence?: number;
  lastUpdated: string;
  reviewedStatus?:
    | 'Unreviewed'
    | 'Approved for Submission'
    | 'Kept Separate'
    | 'Flagged for Correction'
    | 'Possible Duplicate'
    | 'Under Review'
    | 'Confirmed'
    | 'Not a Duplicate'
    | 'Resolved';
  section?: string;
  studentStatus?: 'Active' | 'Inactive' | 'Dropped Out' | 'Transferred (TC Issued)';
  inactiveReason?: string;
  inactiveDate?: string;
  tcNumber?: string;
  consentStatus?: 'obtained' | 'pending' | 'not_required' | 'declined';
  nameAsPerAadhaarSim?: string;
  apaarCreationReady?: boolean;
  cwsnDetails?: CwsnStudentDetails;
}

export interface ProgrammeIntake {
  id: string;
  institutionId: string;
  institutionName: string;
  institutionType?: InstitutionEntityType;
  workspaceType?: WorkspaceCategory;
  state: string;
  programmeName: string; // Or "Class 1" .. "Class 12" for Schools
  department: string; // Or "Primary Wing" / "Middle Wing" / "Secondary Wing" / "Senior Secondary" for Schools
  approvedIntake: number;
  actualEnrolment: number;
  simulatedVerifiedCount: number;
  pendingVerificationCount: number;
  flaggedDuplicateCount: number;
}

export interface InstitutionSummary {
  id: string;
  aisheCode: string; // AISHE or UDISE+ Demo Code
  name: string;
  state: string;
  district: string;
  type:
    | 'State Technological University'
    | 'Autonomous Engineering College'
    | 'Government Polytechnic & Engineering'
    | 'Composite K-10 Public School'
    | 'State Secondary High School'
    | 'Model Integrated School'
    | 'Government Junior College (Classes 11-12)';
  entityType: InstitutionEntityType;
  institutionType?: InstitutionEntityType;
  workspaceType: WorkspaceCategory;
  totalApprovedIntake: number;
  totalEnrolled: number;
  apaarReadinessPct: number;
  overIntakeProgrammes: number;
  unresolvedFlags: number;
}

export interface StateMonitoringRow {
  stateCode: string;
  stateName: string;
  institutionsCount: number;
  approvedIntake: number;
  enrolledStudents: number;
  simulatedVerifiedPct: number;
  pendingVerificationPct: number;
  overIntakeAlerts: number;
  duplicateClustersFlagged: number;
}

export const INDIAN_STATES = [
  'Telangana',
  'Karnataka',
  'Maharashtra',
  'Tamil Nadu',
  'Gujarat',
  'Uttar Pradesh',
  'Rajasthan',
  'Delhi NCR',
  'Kerala',
  'West Bengal',
];

export const INSTITUTIONS: InstitutionSummary[] = [
  // =========================================================================
  // SCHOOLS & JUNIOR COLLEGES (School Workspace)
  // =========================================================================
  {
    id: 'INST-SCH-01',
    aisheCode: 'UDISE-360101',
    name: 'Demo Public School, Hyderabad',
    state: 'Telangana',
    district: 'Hyderabad',
    type: 'Composite K-10 Public School',
    entityType: 'School',
    workspaceType: 'school',
    totalApprovedIntake: 450,
    totalEnrolled: 462,
    apaarReadinessPct: 85.4,
    overIntakeProgrammes: 1,
    unresolvedFlags: 8,
  },
  {
    id: 'INST-SCH-02',
    aisheCode: 'UDISE-360204',
    name: 'Demo High School, Warangal',
    state: 'Telangana',
    district: 'Warangal',
    type: 'State Secondary High School',
    entityType: 'School',
    workspaceType: 'school',
    totalApprovedIntake: 400,
    totalEnrolled: 392,
    apaarReadinessPct: 82.1,
    overIntakeProgrammes: 0,
    unresolvedFlags: 6,
  },
  {
    id: 'INST-SCH-03',
    aisheCode: 'UDISE-360309',
    name: 'Demo Model School, Karimnagar',
    state: 'Telangana',
    district: 'Karimnagar',
    type: 'Model Integrated School',
    entityType: 'School',
    workspaceType: 'school',
    totalApprovedIntake: 360,
    totalEnrolled: 355,
    apaarReadinessPct: 87.6,
    overIntakeProgrammes: 0,
    unresolvedFlags: 5,
  },
  {
    id: 'INST-JC-01',
    aisheCode: 'UDISE-360118',
    name: 'Demo Junior College, Secunderabad',
    state: 'Telangana',
    district: 'Secunderabad',
    type: 'Government Junior College (Classes 11-12)',
    entityType: 'Junior College',
    workspaceType: 'school',
    totalApprovedIntake: 240,
    totalEnrolled: 249,
    apaarReadinessPct: 83.9,
    overIntakeProgrammes: 1,
    unresolvedFlags: 4,
  },
  {
    id: 'INST-SCH-KA-01',
    aisheCode: 'UDISE-290105',
    name: 'Demo Public School, Bengaluru',
    state: 'Karnataka',
    district: 'Bengaluru Urban',
    type: 'Composite K-10 Public School',
    entityType: 'School',
    workspaceType: 'school',
    totalApprovedIntake: 400,
    totalEnrolled: 390,
    apaarReadinessPct: 89.0,
    overIntakeProgrammes: 0,
    unresolvedFlags: 3,
  },
  {
    id: 'INST-SCH-MH-01',
    aisheCode: 'UDISE-270402',
    name: 'Demo Model High School, Nagpur',
    state: 'Maharashtra',
    district: 'Nagpur',
    type: 'State Secondary High School',
    entityType: 'School',
    workspaceType: 'school',
    totalApprovedIntake: 380,
    totalEnrolled: 374,
    apaarReadinessPct: 81.2,
    overIntakeProgrammes: 0,
    unresolvedFlags: 5,
  },

  // =========================================================================
  // TECHNICAL COLLEGES (College Workspace)
  // =========================================================================
  {
    id: 'INST-TS-01',
    aisheCode: 'C-41092',
    name: 'Deccan Institute of Engineering & Technology',
    state: 'Telangana',
    district: 'Hyderabad',
    type: 'Autonomous Engineering College',
    entityType: 'College',
    workspaceType: 'college',
    totalApprovedIntake: 420,
    totalEnrolled: 438,
    apaarReadinessPct: 84.2,
    overIntakeProgrammes: 1,
    unresolvedFlags: 7,
  },
  {
    id: 'INST-KA-02',
    aisheCode: 'C-28914',
    name: 'Sahyadri Visvesvaraya College of Technology',
    state: 'Karnataka',
    district: 'Bengaluru Urban',
    type: 'State Technological University',
    entityType: 'College',
    workspaceType: 'college',
    totalApprovedIntake: 360,
    totalEnrolled: 371,
    apaarReadinessPct: 88.5,
    overIntakeProgrammes: 1,
    unresolvedFlags: 5,
  },
  {
    id: 'INST-MH-03',
    aisheCode: 'C-53201',
    name: 'Vidarbha Government Institute of Applied Sciences',
    state: 'Maharashtra',
    district: 'Nagpur',
    type: 'Government Polytechnic & Engineering',
    entityType: 'College',
    workspaceType: 'college',
    totalApprovedIntake: 300,
    totalEnrolled: 294,
    apaarReadinessPct: 79.6,
    overIntakeProgrammes: 0,
    unresolvedFlags: 6,
  },
  {
    id: 'INST-TN-04',
    aisheCode: 'C-19402',
    name: 'Cauvery College of Engineering & Technology',
    state: 'Tamil Nadu',
    district: 'Coimbatore',
    type: 'Autonomous Engineering College',
    entityType: 'College',
    workspaceType: 'college',
    totalApprovedIntake: 360,
    totalEnrolled: 355,
    apaarReadinessPct: 91.0,
    overIntakeProgrammes: 0,
    unresolvedFlags: 3,
  },
  {
    id: 'INST-GJ-05',
    aisheCode: 'C-60218',
    name: 'Sabarmati Institute of Technology & Research',
    state: 'Gujarat',
    district: 'Ahmedabad',
    type: 'State Technological University',
    entityType: 'College',
    workspaceType: 'college',
    totalApprovedIntake: 300,
    totalEnrolled: 290,
    apaarReadinessPct: 85.4,
    overIntakeProgrammes: 0,
    unresolvedFlags: 4,
  },
  {
    id: 'INST-UP-06',
    aisheCode: 'C-71829',
    name: 'Gomti State Engineering College',
    state: 'Uttar Pradesh',
    district: 'Lucknow',
    type: 'Government Polytechnic & Engineering',
    entityType: 'College',
    workspaceType: 'college',
    totalApprovedIntake: 360,
    totalEnrolled: 348,
    apaarReadinessPct: 77.2,
    overIntakeProgrammes: 0,
    unresolvedFlags: 8,
  },
  {
    id: 'INST-RJ-07',
    aisheCode: 'C-81044',
    name: 'Aravalli College of Engineering & Sciences',
    state: 'Rajasthan',
    district: 'Jaipur',
    type: 'Autonomous Engineering College',
    entityType: 'College',
    workspaceType: 'college',
    totalApprovedIntake: 240,
    totalEnrolled: 232,
    apaarReadinessPct: 80.1,
    overIntakeProgrammes: 0,
    unresolvedFlags: 5,
  },
  {
    id: 'INST-DL-08',
    aisheCode: 'C-10938',
    name: 'Indraprastha Institute of Advanced Computing',
    state: 'Delhi NCR',
    district: 'New Delhi',
    type: 'State Technological University',
    entityType: 'College',
    workspaceType: 'college',
    totalApprovedIntake: 300,
    totalEnrolled: 298,
    apaarReadinessPct: 90.8,
    overIntakeProgrammes: 0,
    unresolvedFlags: 2,
  },
  {
    id: 'INST-KL-09',
    aisheCode: 'C-34812',
    name: 'Malabar Government Engineering Institute',
    state: 'Kerala',
    district: 'Kozhikode',
    type: 'Government Polytechnic & Engineering',
    entityType: 'College',
    workspaceType: 'college',
    totalApprovedIntake: 240,
    totalEnrolled: 238,
    apaarReadinessPct: 93.4,
    overIntakeProgrammes: 0,
    unresolvedFlags: 1,
  },
  {
    id: 'INST-WB-10',
    aisheCode: 'C-48920',
    name: 'Hooghly Institute of Technology & Management',
    state: 'West Bengal',
    district: 'Kolkata',
    type: 'Autonomous Engineering College',
    entityType: 'College',
    workspaceType: 'college',
    totalApprovedIntake: 300,
    totalEnrolled: 289,
    apaarReadinessPct: 81.5,
    overIntakeProgrammes: 0,
    unresolvedFlags: 4,
  },
];

export const PROGRAMME_INTAKES: ProgrammeIntake[] = [
  // =========================================================================
  // COLLEGE PROGRAMMES (8 Engineering Programmes)
  // =========================================================================
  {
    id: 'PRG-01',
    institutionId: 'INST-TS-01',
    institutionName: 'Deccan Institute of Engineering & Technology',
    institutionType: 'College',
    workspaceType: 'college',
    state: 'Telangana',
    programmeName: 'B.Tech Computer Science & Engineering',
    department: 'Computer Science',
    approvedIntake: 180,
    actualEnrolment: 198, // OVER INTAKE (+18)
    simulatedVerifiedCount: 164,
    pendingVerificationCount: 26,
    flaggedDuplicateCount: 8,
  },
  {
    id: 'PRG-02',
    institutionId: 'INST-TS-01',
    institutionName: 'Deccan Institute of Engineering & Technology',
    institutionType: 'College',
    workspaceType: 'college',
    state: 'Telangana',
    programmeName: 'B.Tech Electronics & Communication',
    department: 'Electronics',
    approvedIntake: 120,
    actualEnrolment: 120,
    simulatedVerifiedCount: 108,
    pendingVerificationCount: 10,
    flaggedDuplicateCount: 2,
  },
  {
    id: 'PRG-03',
    institutionId: 'INST-TS-01',
    institutionName: 'Deccan Institute of Engineering & Technology',
    institutionType: 'College',
    workspaceType: 'college',
    state: 'Telangana',
    programmeName: 'B.Tech Mechanical Engineering',
    department: 'Mechanical',
    approvedIntake: 120,
    actualEnrolment: 120,
    simulatedVerifiedCount: 97,
    pendingVerificationCount: 21,
    flaggedDuplicateCount: 2,
  },
  {
    id: 'PRG-04',
    institutionId: 'INST-KA-02',
    institutionName: 'Sahyadri Visvesvaraya College of Technology',
    institutionType: 'College',
    workspaceType: 'college',
    state: 'Karnataka',
    programmeName: 'B.E. Artificial Intelligence & Data Science',
    department: 'AI & Data Science',
    approvedIntake: 120,
    actualEnrolment: 131, // OVER INTAKE (+11)
    simulatedVerifiedCount: 112,
    pendingVerificationCount: 15,
    flaggedDuplicateCount: 4,
  },
  {
    id: 'PRG-05',
    institutionId: 'INST-KA-02',
    institutionName: 'Sahyadri Visvesvaraya College of Technology',
    institutionType: 'College',
    workspaceType: 'college',
    state: 'Karnataka',
    programmeName: 'B.E. Electrical & Electronics Engineering',
    department: 'Electrical',
    approvedIntake: 120,
    actualEnrolment: 120,
    simulatedVerifiedCount: 109,
    pendingVerificationCount: 11,
    flaggedDuplicateCount: 0,
  },
  {
    id: 'PRG-06',
    institutionId: 'INST-KA-02',
    institutionName: 'Sahyadri Visvesvaraya College of Technology',
    institutionType: 'College',
    workspaceType: 'college',
    state: 'Karnataka',
    programmeName: 'B.E. Civil & Infrastructure Engineering',
    department: 'Civil',
    approvedIntake: 120,
    actualEnrolment: 120,
    simulatedVerifiedCount: 107,
    pendingVerificationCount: 11,
    flaggedDuplicateCount: 2,
  },
  {
    id: 'PRG-07',
    institutionId: 'INST-MH-03',
    institutionName: 'Vidarbha Government Institute of Applied Sciences',
    institutionType: 'College',
    workspaceType: 'college',
    state: 'Maharashtra',
    programmeName: 'B.Tech Information Technology',
    department: 'Information Technology',
    approvedIntake: 180,
    actualEnrolment: 176,
    simulatedVerifiedCount: 142,
    pendingVerificationCount: 28,
    flaggedDuplicateCount: 6,
  },
  {
    id: 'PRG-08',
    institutionId: 'INST-MH-03',
    institutionName: 'Vidarbha Government Institute of Applied Sciences',
    institutionType: 'College',
    workspaceType: 'college',
    state: 'Maharashtra',
    programmeName: 'B.Tech Chemical Process Engineering',
    department: 'Chemical',
    approvedIntake: 120,
    actualEnrolment: 118,
    simulatedVerifiedCount: 92,
    pendingVerificationCount: 24,
    flaggedDuplicateCount: 2,
  },

  // =========================================================================
  // SCHOOL & JUNIOR COLLEGE CLASS INTAKES (Classes 1 to 12)
  // =========================================================================
  {
    id: 'SCH-CLS-01',
    institutionId: 'INST-SCH-01',
    institutionName: 'Demo Public School, Hyderabad',
    institutionType: 'School',
    workspaceType: 'school',
    state: 'Telangana',
    programmeName: 'Class 1',
    department: 'Primary Wing (Classes 1–5)',
    approvedIntake: 90,
    actualEnrolment: 88,
    simulatedVerifiedCount: 74,
    pendingVerificationCount: 12,
    flaggedDuplicateCount: 2,
  },
  {
    id: 'SCH-CLS-02',
    institutionId: 'INST-SCH-01',
    institutionName: 'Demo Public School, Hyderabad',
    institutionType: 'School',
    workspaceType: 'school',
    state: 'Telangana',
    programmeName: 'Class 2',
    department: 'Primary Wing (Classes 1–5)',
    approvedIntake: 90,
    actualEnrolment: 90,
    simulatedVerifiedCount: 79,
    pendingVerificationCount: 11,
    flaggedDuplicateCount: 0,
  },
  {
    id: 'SCH-CLS-03',
    institutionId: 'INST-SCH-01',
    institutionName: 'Demo Public School, Hyderabad',
    institutionType: 'School',
    workspaceType: 'school',
    state: 'Telangana',
    programmeName: 'Class 3',
    department: 'Primary Wing (Classes 1–5)',
    approvedIntake: 90,
    actualEnrolment: 86,
    simulatedVerifiedCount: 76,
    pendingVerificationCount: 10,
    flaggedDuplicateCount: 0,
  },
  {
    id: 'SCH-CLS-04',
    institutionId: 'INST-SCH-01',
    institutionName: 'Demo Public School, Hyderabad',
    institutionType: 'School',
    workspaceType: 'school',
    state: 'Telangana',
    programmeName: 'Class 4',
    department: 'Primary Wing (Classes 1–5)',
    approvedIntake: 90,
    actualEnrolment: 89,
    simulatedVerifiedCount: 80,
    pendingVerificationCount: 8,
    flaggedDuplicateCount: 1,
  },
  {
    id: 'SCH-CLS-05',
    institutionId: 'INST-SCH-01',
    institutionName: 'Demo Public School, Hyderabad',
    institutionType: 'School',
    workspaceType: 'school',
    state: 'Telangana',
    programmeName: 'Class 5',
    department: 'Primary Wing (Classes 1–5)',
    approvedIntake: 90,
    actualEnrolment: 98, // OVER INTAKE (+8)
    simulatedVerifiedCount: 81,
    pendingVerificationCount: 13,
    flaggedDuplicateCount: 4,
  },
  {
    id: 'SCH-CLS-06',
    institutionId: 'INST-SCH-02',
    institutionName: 'Demo High School, Warangal',
    institutionType: 'School',
    workspaceType: 'school',
    state: 'Telangana',
    programmeName: 'Class 6',
    department: 'Middle Wing (Classes 6–8)',
    approvedIntake: 90,
    actualEnrolment: 87,
    simulatedVerifiedCount: 75,
    pendingVerificationCount: 10,
    flaggedDuplicateCount: 2,
  },
  {
    id: 'SCH-CLS-07',
    institutionId: 'INST-SCH-02',
    institutionName: 'Demo High School, Warangal',
    institutionType: 'School',
    workspaceType: 'school',
    state: 'Telangana',
    programmeName: 'Class 7',
    department: 'Middle Wing (Classes 6–8)',
    approvedIntake: 90,
    actualEnrolment: 89,
    simulatedVerifiedCount: 78,
    pendingVerificationCount: 11,
    flaggedDuplicateCount: 0,
  },
  {
    id: 'SCH-CLS-08',
    institutionId: 'INST-SCH-02',
    institutionName: 'Demo High School, Warangal',
    institutionType: 'School',
    workspaceType: 'school',
    state: 'Telangana',
    programmeName: 'Class 8',
    department: 'Middle Wing (Classes 6–8)',
    approvedIntake: 90,
    actualEnrolment: 90,
    simulatedVerifiedCount: 82,
    pendingVerificationCount: 6,
    flaggedDuplicateCount: 2,
  },
  {
    id: 'SCH-CLS-09',
    institutionId: 'INST-SCH-03',
    institutionName: 'Demo Model School, Karimnagar',
    institutionType: 'School',
    workspaceType: 'school',
    state: 'Telangana',
    programmeName: 'Class 9',
    department: 'Secondary Wing (Classes 9–10)',
    approvedIntake: 90,
    actualEnrolment: 88,
    simulatedVerifiedCount: 77,
    pendingVerificationCount: 9,
    flaggedDuplicateCount: 2,
  },
  {
    id: 'SCH-CLS-10',
    institutionId: 'INST-SCH-03',
    institutionName: 'Demo Model School, Karimnagar',
    institutionType: 'School',
    workspaceType: 'school',
    state: 'Telangana',
    programmeName: 'Class 10',
    department: 'Secondary Wing (Classes 9–10)',
    approvedIntake: 90,
    actualEnrolment: 90,
    simulatedVerifiedCount: 81,
    pendingVerificationCount: 7,
    flaggedDuplicateCount: 2,
  },
  {
    id: 'SCH-CLS-11',
    institutionId: 'INST-JC-01',
    institutionName: 'Demo Junior College, Secunderabad',
    institutionType: 'Junior College',
    workspaceType: 'school',
    state: 'Telangana',
    programmeName: 'Class 11',
    department: 'Senior Secondary (MPC / BiPC)',
    approvedIntake: 120,
    actualEnrolment: 129, // OVER INTAKE (+9)
    simulatedVerifiedCount: 108,
    pendingVerificationCount: 17,
    flaggedDuplicateCount: 4,
  },
  {
    id: 'SCH-CLS-12',
    institutionId: 'INST-JC-01',
    institutionName: 'Demo Junior College, Secunderabad',
    institutionType: 'Junior College',
    workspaceType: 'school',
    state: 'Telangana',
    programmeName: 'Class 12',
    department: 'Senior Secondary (MPC / BiPC)',
    approvedIntake: 120,
    actualEnrolment: 120,
    simulatedVerifiedCount: 106,
    pendingVerificationCount: 12,
    flaggedDuplicateCount: 2,
  },
];

export const STATE_MONITORING_DATA: StateMonitoringRow[] = [
  {
    stateCode: 'TS',
    stateName: 'Telangana',
    institutionsCount: 248,
    approvedIntake: 118400,
    enrolledStudents: 116920,
    simulatedVerifiedPct: 86.4,
    pendingVerificationPct: 13.6,
    overIntakeAlerts: 9,
    duplicateClustersFlagged: 142,
  },
  {
    stateCode: 'KA',
    stateName: 'Karnataka',
    institutionsCount: 312,
    approvedIntake: 146800,
    enrolledStudents: 144110,
    simulatedVerifiedPct: 89.1,
    pendingVerificationPct: 10.9,
    overIntakeAlerts: 6,
    duplicateClustersFlagged: 118,
  },
  {
    stateCode: 'MH',
    stateName: 'Maharashtra',
    institutionsCount: 465,
    approvedIntake: 194500,
    enrolledStudents: 188940,
    simulatedVerifiedPct: 82.7,
    pendingVerificationPct: 17.3,
    overIntakeAlerts: 14,
    duplicateClustersFlagged: 236,
  },
  {
    stateCode: 'TN',
    stateName: 'Tamil Nadu',
    institutionsCount: 518,
    approvedIntake: 232000,
    enrolledStudents: 219850,
    simulatedVerifiedPct: 91.2,
    pendingVerificationPct: 8.8,
    overIntakeAlerts: 4,
    duplicateClustersFlagged: 94,
  },
  {
    stateCode: 'GJ',
    stateName: 'Gujarat',
    institutionsCount: 214,
    approvedIntake: 92400,
    enrolledStudents: 88120,
    simulatedVerifiedPct: 84.9,
    pendingVerificationPct: 15.1,
    overIntakeAlerts: 7,
    duplicateClustersFlagged: 89,
  },
  {
    stateCode: 'UP',
    stateName: 'Uttar Pradesh',
    institutionsCount: 482,
    approvedIntake: 186200,
    enrolledStudents: 174300,
    simulatedVerifiedPct: 76.8,
    pendingVerificationPct: 23.2,
    overIntakeAlerts: 19,
    duplicateClustersFlagged: 312,
  },
  {
    stateCode: 'RJ',
    stateName: 'Rajasthan',
    institutionsCount: 196,
    approvedIntake: 81500,
    enrolledStudents: 76400,
    simulatedVerifiedPct: 79.3,
    pendingVerificationPct: 20.7,
    overIntakeAlerts: 11,
    duplicateClustersFlagged: 164,
  },
  {
    stateCode: 'DL',
    stateName: 'Delhi NCR',
    institutionsCount: 118,
    approvedIntake: 58900,
    enrolledStudents: 58410,
    simulatedVerifiedPct: 90.4,
    pendingVerificationPct: 9.6,
    overIntakeAlerts: 5,
    duplicateClustersFlagged: 52,
  },
  {
    stateCode: 'KL',
    stateName: 'Kerala',
    institutionsCount: 168,
    approvedIntake: 67200,
    enrolledStudents: 64890,
    simulatedVerifiedPct: 93.5,
    pendingVerificationPct: 6.5,
    overIntakeAlerts: 2,
    duplicateClustersFlagged: 31,
  },
  {
    stateCode: 'WB',
    stateName: 'West Bengal',
    institutionsCount: 184,
    approvedIntake: 74600,
    enrolledStudents: 71200,
    simulatedVerifiedPct: 81.2,
    pendingVerificationPct: 18.8,
    overIntakeAlerts: 8,
    duplicateClustersFlagged: 127,
  },
];

// Strictly fictional Indian first and last names
const FIRST_NAMES_F = [
  'Aarohi', 'Ananya', 'Bhavya', 'Chaitra', 'Deepika', 'Esha', 'Gauri', 'Harini',
  'Ishita', 'Jhanvi', 'Kavya', 'Lavanya', 'Meera', 'Nandini', 'Ojaswini', 'Pranavi',
  'Rachana', 'Priya', 'Tanvi', 'Vaishnavi', 'Yamini', 'Zoya', 'Keerthana', 'Rutuja',
  'Shruti', 'Madhuri', 'Niharika', 'Pallavi', 'Roshni', 'Sneha',
];

const FIRST_NAMES_M = [
  'Aarav', 'Abhinav', 'Chaitanya', 'Devansh', 'Gautam', 'Harsha', 'Ishan', 'Karthik',
  'Lakshman', 'Manish', 'Nikhil', 'Omkar', 'Pranav', 'Raghav', 'Siddharth', 'Tarun',
  'Uday', 'Varun', 'Yashwanth', 'Zubin', 'Rahul', 'Aditya', 'Vikram', 'Surya',
  'Kiran', 'Naveen', 'Sandeep', 'Tejas', 'Vivek', 'Anirudh',
];

const LAST_NAMES = [
  'Reddy', 'Rao', 'Sharma', 'Kulkarni', 'Patil', 'Gowda', 'Hegde', 'Deshmukh',
  'Joshi', 'Nair', 'Iyer', 'Verma', 'Gupta', 'Chavan', 'Naidu', 'Varma',
  'Kamble', 'Shetty', 'Bhat', 'Menon', 'Kumar',
];

function buildInitialStudents(): StudentRecord[] {
  const list: StudentRecord[] = [
    // =======================================================================
    // 1. COLLEGE STUDENTS (STU-1001 to STU-1060) — 60 Fictional Students
    // =======================================================================
    {
      id: 'STU-1001',
      rollNo: '24DIET-CS-001',
      fullName: 'Priya Sharma',
      dob: '2005-03-19',
      gender: 'F',
      pen: '29481039481',
      apaarId: '482910384756',
      institutionId: 'INST-TS-01',
      institutionName: 'Deccan Institute of Engineering & Technology',
      institutionType: 'College',
      workspaceType: 'college',
      state: 'Telangana',
      programme: 'B.Tech Computer Science & Engineering',
      academicYear: CURRENT_ACADEMIC_YEAR,
      semester: 3,
      section: 'Section A',
      verificationStatus: 'Simulated Verification',
      dataQualityScore: 99,
      lastUpdated: '2026-10-22',
      reviewedStatus: 'Approved for Submission',
    },
    {
      id: 'STU-1002',
      rollNo: '24DIET-CS-002',
      fullName: 'Karthikeya Varma',
      dob: '2004-11-08',
      gender: 'M',
      pen: '29481039512',
      apaarId: '482910389102',
      institutionId: 'INST-TS-01',
      institutionName: 'Deccan Institute of Engineering & Technology',
      institutionType: 'College',
      workspaceType: 'college',
      state: 'Telangana',
      programme: 'B.Tech Computer Science & Engineering',
      academicYear: CURRENT_ACADEMIC_YEAR,
      semester: 3,
      section: 'Section A',
      verificationStatus: 'Mismatch Flagged',
      dataQualityScore: 68,
      aiIssueNote:
        'Phonetic & honorific variance: Academic transcript reads "K. Varma" while DigiLocker mock registry lists "Karthikeya Varma".',
      duplicateCandidateId: 'STU-1003',
      duplicateConfidence: 94,
      lastUpdated: '2026-10-23',
      reviewedStatus: 'Unreviewed',
    },
    {
      id: 'STU-1003',
      rollNo: '24DIET-CS-089',
      fullName: 'K. Varma',
      dob: '2004-11-08',
      gender: 'M',
      pen: '29481039512',
      apaarId: null,
      institutionId: 'INST-TS-01',
      institutionName: 'Deccan Institute of Engineering & Technology',
      institutionType: 'College',
      workspaceType: 'college',
      state: 'Telangana',
      programme: 'B.Tech Computer Science & Engineering',
      academicYear: CURRENT_ACADEMIC_YEAR,
      semester: 3,
      section: 'Section A',
      verificationStatus: 'Mismatch Flagged',
      dataQualityScore: 54,
      aiIssueNote:
        'Potential duplicate entry sharing identical PEN (ending 512) and Date of Birth with STU-1002.',
      duplicateCandidateId: 'STU-1002',
      duplicateConfidence: 94,
      lastUpdated: '2026-10-23',
      reviewedStatus: 'Unreviewed',
    },
    {
      id: 'STU-1004',
      rollNo: '24DIET-EC-014',
      fullName: 'ananya reddy',
      dob: '14/08/2005',
      gender: 'F',
      pen: '29481040119',
      apaarId: '591029384711',
      institutionId: 'INST-TS-01',
      institutionName: 'Deccan Institute of Engineering & Technology',
      institutionType: 'College',
      workspaceType: 'college',
      state: 'Telangana',
      programme: 'B.Tech Electronics & Communication',
      academicYear: CURRENT_ACADEMIC_YEAR,
      semester: 3,
      section: 'Section B',
      verificationStatus: 'Pending Official Verification',
      dataQualityScore: 76,
      aiIssueNote:
        'Lowercase name casing ("ananya reddy") and non-ISO DOB format ("14/08/2005"). Recommended: "Ananya Reddy" & "2005-08-14".',
      lastUpdated: '2026-10-21',
      reviewedStatus: 'Unreviewed',
    },
    {
      id: 'STU-1005',
      rollNo: '24SVCT-AI-007',
      fullName: 'Siddharth M. Gowda',
      dob: '2005-01-23',
      gender: 'M',
      pen: '31849201928',
      apaarId: '718293049581',
      institutionId: 'INST-KA-02',
      institutionName: 'Sahyadri Visvesvaraya College of Technology',
      institutionType: 'College',
      workspaceType: 'college',
      state: 'Karnataka',
      programme: 'B.E. Artificial Intelligence & Data Science',
      academicYear: CURRENT_ACADEMIC_YEAR,
      semester: 3,
      section: 'Section A',
      verificationStatus: 'Mismatch Flagged',
      dataQualityScore: 64,
      aiIssueNote:
        'Cross-programme duplicate alert: Student appears enrolled in both B.E. AI & Data Science and B.E. Electrical (STU-1006).',
      duplicateCandidateId: 'STU-1006',
      duplicateConfidence: 91,
      lastUpdated: '2026-10-24',
      reviewedStatus: 'Unreviewed',
    },
    {
      id: 'STU-1006',
      rollNo: '24SVCT-EE-042',
      fullName: 'Siddharth Gowda',
      dob: '2005-01-23',
      gender: 'M',
      pen: '31849201928',
      apaarId: '718293049581',
      institutionId: 'INST-KA-02',
      institutionName: 'Sahyadri Visvesvaraya College of Technology',
      institutionType: 'College',
      workspaceType: 'college',
      state: 'Karnataka',
      programme: 'B.E. Electrical & Electronics Engineering',
      academicYear: CURRENT_ACADEMIC_YEAR,
      semester: 3,
      section: 'Section B',
      verificationStatus: 'Mismatch Flagged',
      dataQualityScore: 62,
      aiIssueNote:
        'Residual seat-allotment record from Round 2 counselling not marked withdrawn after sliding to AI & DS.',
      duplicateCandidateId: 'STU-1005',
      duplicateConfidence: 91,
      lastUpdated: '2026-10-24',
      reviewedStatus: 'Unreviewed',
    },
    {
      id: 'STU-1007',
      rollNo: '24VGIA-IT-019',
      fullName: 'Rutuja Deshmukh',
      dob: '2005-06-30',
      gender: 'F',
      pen: '44910293817',
      apaarId: null,
      institutionId: 'INST-MH-03',
      institutionName: 'Vidarbha Government Institute of Applied Sciences',
      institutionType: 'College',
      workspaceType: 'college',
      state: 'Maharashtra',
      programme: 'B.Tech Information Technology',
      academicYear: CURRENT_ACADEMIC_YEAR,
      semester: 3,
      section: 'Section A',
      verificationStatus: 'Missing APAAR ID',
      dataQualityScore: 71,
      aiIssueNote:
        'APAAR ID not yet seeded; PEN verified in UDISE+ archive. Ready for simulated Aadhaar-based eKYC request.',
      lastUpdated: '2026-10-19',
      reviewedStatus: 'Unreviewed',
    },
    {
      id: 'STU-1008',
      rollNo: '24DIET-ME-031',
      fullName: 'MD. FARHAN AHMED',
      dob: '2004-09-12',
      gender: 'M',
      pen: '29481088231',
      apaarId: '482910992831',
      institutionId: 'INST-TS-01',
      institutionName: 'Deccan Institute of Engineering & Technology',
      institutionType: 'College',
      workspaceType: 'college',
      state: 'Telangana',
      programme: 'B.Tech Mechanical Engineering',
      academicYear: CURRENT_ACADEMIC_YEAR,
      semester: 3,
      section: 'Section C',
      verificationStatus: 'Pending Official Verification',
      dataQualityScore: 79,
      aiIssueNote:
        'Abbreviated prefix "MD." causes partial token mismatch against "Mohammed Farhan Ahmed" in ABC depository.',
      lastUpdated: '2026-10-20',
      reviewedStatus: 'Unreviewed',
    },
    {
      id: 'STU-1009',
      rollNo: '24DIET-CS-009',
      fullName: 'Rahul Kumar',
      dob: '2005-02-11',
      gender: 'M',
      pen: '29481049109',
      apaarId: null,
      institutionId: 'INST-TS-01',
      institutionName: 'Deccan Institute of Engineering & Technology',
      institutionType: 'College',
      workspaceType: 'college',
      state: 'Telangana',
      programme: 'B.Tech Computer Science & Engineering',
      academicYear: CURRENT_ACADEMIC_YEAR,
      semester: 3,
      section: 'Section A',
      verificationStatus: 'Missing APAAR ID',
      dataQualityScore: 74,
      consentStatus: 'pending',
      aiIssueNote:
        'CSE student with parent/student consent pending for APAAR generation.',
      lastUpdated: '2026-10-22',
      reviewedStatus: 'Unreviewed',
    },
  ];

  const collegeProgs = PROGRAMME_INTAKES.filter((p) => p.workspaceType === 'college');

  // Fill remaining 51 college students deterministically to total 60 college students
  for (let i = 10; i <= 60; i++) {
    const isFemale = i % 2 === 0;
    const fName = isFemale
      ? FIRST_NAMES_F[(i * 3) % FIRST_NAMES_F.length]
      : FIRST_NAMES_M[(i * 3) % FIRST_NAMES_M.length];
    const lName = LAST_NAMES[(i * 7) % LAST_NAMES.length];

    const prgIndex = i % collegeProgs.length;
    const prg = collegeProgs[prgIndex];

    const deptCode = prg.programmeName.includes('Computer')
      ? 'CS'
      : prg.programmeName.includes('Electronics & Comm')
      ? 'EC'
      : prg.programmeName.includes('Mechanical')
      ? 'ME'
      : prg.programmeName.includes('Artificial')
      ? 'AI'
      : prg.programmeName.includes('Electrical')
      ? 'EE'
      : prg.programmeName.includes('Civil')
      ? 'CE'
      : prg.programmeName.includes('Information')
      ? 'IT'
      : 'CH';

    const instPrefix =
      prg.institutionId === 'INST-TS-01'
        ? '24DIET'
        : prg.institutionId === 'INST-KA-02'
        ? '24SVCT'
        : '24VGIA';

    const penNum = String(21000000000 + i * 13579246).slice(0, 11);
    const hasApaar = i % 9 !== 0;
    const apaarNum = hasApaar ? String(410000000000 + i * 975318642).slice(0, 12) : null;

    let status: VerificationStatus = 'Simulated Verification';
    let score = 92 + (i % 8);
    let aiNote: string | undefined = undefined;

    if (!hasApaar) {
      status = 'Missing APAAR ID';
      score = 72;
      aiNote = 'Student PEN present, awaiting student consent token for APAAR generation.';
    } else if (i % 5 === 0) {
      status = 'Pending Official Verification';
      score = 84;
      aiNote = 'Queued for DigiLocker / Academic Bank of Credits batch handshake.';
    } else if (i % 13 === 0) {
      status = 'Mismatch Flagged';
      score = 66;
      aiNote =
        'Father/Guardian name initial placement differs between Class XII board mark sheet and college ERP.';
    }

    const month = String(((i * 5) % 12) + 1).padStart(2, '0');
    const day = String(((i * 7) % 28) + 1).padStart(2, '0');
    const year = i % 3 === 0 ? '2004' : '2005';
    const sectionName =
      i % 3 === 0 ? 'Section C' : i % 2 === 0 ? 'Section B' : 'Section A';

    list.push({
      id: `STU-${1000 + i}`,
      rollNo: `${instPrefix}-${deptCode}-${String(i).padStart(3, '0')}`,
      fullName: `${fName} ${lName}`,
      dob: `${year}-${month}-${day}`,
      gender: isFemale ? 'F' : 'M',
      pen: penNum,
      apaarId: apaarNum,
      institutionId: prg.institutionId,
      institutionName: prg.institutionName,
      institutionType: 'College',
      workspaceType: 'college',
      state: prg.state,
      programme: prg.programmeName,
      academicYear: CURRENT_ACADEMIC_YEAR,
      semester: (i % 2) * 2 + 1,
      section: sectionName,
      verificationStatus: status,
      dataQualityScore: score,
      aiIssueNote: aiNote,
      lastUpdated: `2026-10-${String(10 + (i % 14)).padStart(2, '0')}`,
      reviewedStatus:
        status === 'Simulated Verification' ? 'Approved for Submission' : 'Unreviewed',
    });
  }

  // =========================================================================
  // 2. SCHOOL & JUNIOR COLLEGE STUDENTS (STU-2001 to STU-2150) — 150 Students
  // Classes 1 to 10 across 3 Schools + Classes 11 and 12 in Junior College
  // Includes Ananya Reddy, Rahul Kumar, Priya Sharma, duplicates, CWSN, etc.
  // =========================================================================
  const schoolExplicitRecords: StudentRecord[] = [
    {
      id: 'STU-2001',
      rollNo: '26DPS-05A-001',
      fullName: 'Ananya Reddy',
      dob: '2016-05-14', // Class 5 (Age 10 on 1 April 2026)
      gender: 'F',
      pen: '36010150001',
      apaarId: '610293847501',
      institutionId: 'INST-SCH-01',
      institutionName: 'Demo Public School, Hyderabad',
      institutionType: 'School',
      workspaceType: 'school',
      state: 'Telangana',
      programme: 'Class 5',
      className: 'Class 5',
      medium: 'English',
      midDayMealEligible: 'Yes',
      academicYear: CURRENT_ACADEMIC_YEAR,
      semester: 5,
      section: 'Section A',
      verificationStatus: 'Simulated Verification',
      dataQualityScore: 98,
      consentStatus: 'obtained',
      lastUpdated: '2026-10-22',
      reviewedStatus: 'Approved for Submission',
    },
    {
      id: 'STU-2002',
      rollNo: '26DPS-05A-002',
      fullName: 'Rahul Kumar',
      dob: '2016-07-22', // Class 5 (Age 9-10)
      gender: 'M',
      pen: '36010150002',
      apaarId: null,
      institutionId: 'INST-SCH-01',
      institutionName: 'Demo Public School, Hyderabad',
      institutionType: 'School',
      workspaceType: 'school',
      state: 'Telangana',
      programme: 'Class 5',
      className: 'Class 5',
      medium: 'English',
      midDayMealEligible: 'Yes',
      academicYear: CURRENT_ACADEMIC_YEAR,
      semester: 5,
      section: 'Section A',
      verificationStatus: 'Missing APAAR ID',
      dataQualityScore: 74,
      consentStatus: 'pending',
      aiIssueNote:
        'Class 5 student with no APAAR ID recorded yet; parent consent request link pending.',
      lastUpdated: '2026-10-23',
      reviewedStatus: 'Unreviewed',
    },
    {
      id: 'STU-2003',
      rollNo: '26DHS-10B-003',
      fullName: 'Priya Sharma',
      dob: '2011-02-18', // Class 10 (Age 15)
      gender: 'F',
      pen: '36020410003',
      apaarId: '610293847503',
      institutionId: 'INST-SCH-02',
      institutionName: 'Demo High School, Warangal',
      institutionType: 'School',
      workspaceType: 'school',
      state: 'Telangana',
      programme: 'Class 10',
      className: 'Class 10',
      medium: 'English',
      midDayMealEligible: 'Yes',
      academicYear: CURRENT_ACADEMIC_YEAR,
      semester: 10,
      section: 'Section B',
      verificationStatus: 'Pending Official Verification',
      dataQualityScore: 78,
      consentStatus: 'obtained',
      aiIssueNote:
        'Incomplete Secondary Board pre-check: Mother/Father name spelling confirmation pending in Section B.',
      lastUpdated: '2026-10-21',
      reviewedStatus: 'Unreviewed',
    },
    {
      id: 'STU-2004',
      rollNo: '26DPS-05A-012',
      fullName: 'Aarav Kulkarni',
      dob: '2016-01-19',
      gender: 'M',
      pen: '36010150012',
      apaarId: null,
      institutionId: 'INST-SCH-01',
      institutionName: 'Demo Public School, Hyderabad',
      institutionType: 'School',
      workspaceType: 'school',
      state: 'Telangana',
      programme: 'Class 5',
      className: 'Class 5',
      medium: 'English',
      midDayMealEligible: 'No',
      academicYear: CURRENT_ACADEMIC_YEAR,
      semester: 5,
      section: 'Section A',
      verificationStatus: 'Missing APAAR ID',
      dataQualityScore: 70,
      consentStatus: 'obtained',
      apaarCreationReady: true,
      aiIssueNote:
        'Parent consent obtained; student marked Ready for APAAR creation (Simulated).',
      lastUpdated: '2026-10-24',
      reviewedStatus: 'Unreviewed',
    },
    {
      id: 'STU-2005',
      rollNo: '26DPS-05A-018',
      fullName: 'V. Chaitanya Rao',
      dob: '2016-03-09',
      gender: 'M',
      pen: '36010150018',
      apaarId: '610293847518',
      institutionId: 'INST-SCH-01',
      institutionName: 'Demo Public School, Hyderabad',
      institutionType: 'School',
      workspaceType: 'school',
      state: 'Telangana',
      programme: 'Class 5',
      className: 'Class 5',
      medium: 'Telugu',
      midDayMealEligible: 'Yes',
      academicYear: CURRENT_ACADEMIC_YEAR,
      semester: 5,
      section: 'Section A',
      verificationStatus: 'Mismatch Flagged',
      dataQualityScore: 63,
      duplicateCandidateId: 'STU-2006',
      duplicateConfidence: 93,
      nameAsPerAadhaarSim: 'Venkata Chaitanya Rao',
      aiIssueNote:
        'Possible duplicate & initial expansion variance in Class 5 Section A: matches STU-2006 on PEN and DOB.',
      lastUpdated: '2026-10-23',
      reviewedStatus: 'Unreviewed',
    },
    {
      id: 'STU-2006',
      rollNo: '26DPS-05A-044',
      fullName: 'Venkata Chaitanya Rao',
      dob: '2016-03-09',
      gender: 'M',
      pen: '36010150018',
      apaarId: null,
      institutionId: 'INST-SCH-01',
      institutionName: 'Demo Public School, Hyderabad',
      institutionType: 'School',
      workspaceType: 'school',
      state: 'Telangana',
      programme: 'Class 5',
      className: 'Class 5',
      medium: 'Telugu',
      midDayMealEligible: 'Yes',
      academicYear: CURRENT_ACADEMIC_YEAR,
      semester: 5,
      section: 'Section A',
      verificationStatus: 'Mismatch Flagged',
      dataQualityScore: 58,
      duplicateCandidateId: 'STU-2005',
      duplicateConfidence: 93,
      aiIssueNote:
        'Duplicate candidate with STU-2005 in Class 5 Section A (identical PEN ending 018 and birth date).',
      lastUpdated: '2026-10-23',
      reviewedStatus: 'Unreviewed',
    },
    {
      id: 'STU-2007',
      rollNo: '26DGJC-11A-003',
      fullName: 'Harini Nair',
      dob: '2010-06-11', // Class 11 (Age 15-16)
      gender: 'F',
      pen: '36011811003',
      apaarId: '610293847607',
      institutionId: 'INST-JC-01',
      institutionName: 'Demo Junior College, Secunderabad',
      institutionType: 'Junior College',
      workspaceType: 'school',
      state: 'Telangana',
      programme: 'Class 11',
      className: 'Class 11',
      medium: 'English',
      midDayMealEligible: 'No',
      academicYear: CURRENT_ACADEMIC_YEAR,
      semester: 11,
      section: 'Section A',
      verificationStatus: 'Simulated Verification',
      dataQualityScore: 96,
      consentStatus: 'obtained',
      lastUpdated: '2026-10-22',
      reviewedStatus: 'Approved for Submission',
    },
    {
      id: 'STU-2008',
      rollNo: '26DMS-10B-009',
      fullName: 'Devansh Joshi',
      dob: '2011-08-25', // Class 10
      gender: 'M',
      pen: '36030910009',
      apaarId: null,
      institutionId: 'INST-SCH-03',
      institutionName: 'Demo Model School, Karimnagar',
      institutionType: 'School',
      workspaceType: 'school',
      state: 'Telangana',
      programme: 'Class 10',
      className: 'Class 10',
      medium: 'English',
      midDayMealEligible: 'Yes',
      academicYear: CURRENT_ACADEMIC_YEAR,
      semester: 10,
      section: 'Section B',
      verificationStatus: 'Missing APAAR ID',
      dataQualityScore: 73,
      consentStatus: 'declined',
      aiIssueNote:
        'Incomplete Class 10 Section B record: Parent declined digital consent; physical consent verification required.',
      lastUpdated: '2026-10-20',
      reviewedStatus: 'Unreviewed',
    },
  ];

  list.push(...schoolExplicitRecords);

  const schoolInsts = [
    {
      id: 'INST-SCH-01',
      name: 'Demo Public School, Hyderabad',
      prefix: '26DPS',
      type: 'School' as InstitutionEntityType,
      state: 'Telangana',
      minClass: 1,
      maxClass: 10,
    },
    {
      id: 'INST-SCH-02',
      name: 'Demo High School, Warangal',
      prefix: '26DHS',
      type: 'School' as InstitutionEntityType,
      state: 'Telangana',
      minClass: 1,
      maxClass: 10,
    },
    {
      id: 'INST-SCH-03',
      name: 'Demo Model School, Karimnagar',
      prefix: '26DMS',
      type: 'School' as InstitutionEntityType,
      state: 'Telangana',
      minClass: 1,
      maxClass: 10,
    },
    {
      id: 'INST-JC-01',
      name: 'Demo Junior College, Secunderabad',
      prefix: '26DGJC',
      type: 'Junior College' as InstitutionEntityType,
      state: 'Telangana',
      minClass: 11,
      maxClass: 12,
    },
  ];

  // Generate remaining 142 school & junior college students (STU-2009 to STU-2150)
  for (let i = 9; i <= 150; i++) {
    const isFemale = i % 2 === 0;
    const fName = isFemale
      ? FIRST_NAMES_F[(i * 5) % FIRST_NAMES_F.length]
      : FIRST_NAMES_M[(i * 5) % FIRST_NAMES_M.length];
    const lName = LAST_NAMES[(i * 9) % LAST_NAMES.length];

    // Pick school or junior college
    const instObj = i % 7 === 0 ? schoolInsts[3] : schoolInsts[i % 3];
    const classNum =
      instObj.type === 'Junior College'
        ? 11 + (i % 2)
        : ((i - 1) % 10) + 1;
    const classLabel = `Class ${classNum}`;

    const secLetter = i % 3 === 0 ? 'C' : i % 2 === 0 ? 'B' : 'A';
    const sectionName = `Section ${secLetter}`;
    const rollNo = `${instObj.prefix}-${String(classNum).padStart(2, '0')}${secLetter}-${String(
      i
    ).padStart(3, '0')}`;

    // Realistic birth year for classNum in 2026-27 (Class 1 -> ~6 yrs old -> 2020; Class 10 -> ~15 yrs old -> 2011)
    const birthYear = 2021 - classNum;
    const month = String(((i * 3) % 12) + 1).padStart(2, '0');
    const day = String(((i * 7) % 28) + 1).padStart(2, '0');

    const penNum = String(36000000000 + i * 12468135).slice(0, 11);
    const hasApaar = i % 6 !== 0;
    const apaarNum = hasApaar ? String(610000000000 + i * 864213579).slice(0, 12) : null;

    let status: VerificationStatus = 'Simulated Verification';
    let score = 91 + (i % 9);
    let aiNote: string | undefined = undefined;
    let consent: StudentRecord['consentStatus'] = 'obtained';

    if (!hasApaar) {
      status = 'Missing APAAR ID';
      score = 73;
      consent = i % 12 === 0 ? 'declined' : i % 4 === 0 ? 'obtained' : 'pending';
      aiNote = `No APAAR ID recorded yet in ${classLabel} ${sectionName}; parent consent is ${consent}.`;
    } else if (i % 7 === 0) {
      status = 'Pending Official Verification';
      score = 81;
      aiNote = `Incomplete verification in ${classLabel} ${sectionName}: awaiting UDISE+ demographic sync.`;
    } else if (i % 14 === 0) {
      status = 'Mismatch Flagged';
      score = 65;
      aiNote = `Spelling variation between school admission register and simulated Aadhaar card in ${classLabel}.`;
    }

    const medium =
      i % 5 === 0 ? 'Telugu' : i % 11 === 0 ? 'Hindi' : 'English';
    const midDayMealEligible: 'Yes' | 'No' =
      instObj.type === 'School' && classNum <= 8 ? 'Yes' : i % 3 === 0 ? 'Yes' : 'No';

    list.push({
      id: `STU-${2000 + i}`,
      rollNo,
      fullName: `${fName} ${lName}`,
      dob: `${birthYear}-${month}-${day}`,
      gender: isFemale ? 'F' : 'M',
      pen: penNum,
      apaarId: apaarNum,
      institutionId: instObj.id,
      institutionName: instObj.name,
      institutionType: instObj.type,
      workspaceType: 'school',
      state: instObj.state,
      programme: classLabel,
      className: classLabel,
      medium,
      midDayMealEligible,
      academicYear: CURRENT_ACADEMIC_YEAR,
      semester: classNum,
      section: sectionName,
      verificationStatus: status,
      dataQualityScore: score,
      consentStatus: consent,
      aiIssueNote: aiNote,
      lastUpdated: `2026-10-${String(10 + (i % 15)).padStart(2, '0')}`,
      reviewedStatus:
        status === 'Simulated Verification' ? 'Approved for Submission' : 'Unreviewed',
    });
  }

  return list;
}

export const INITIAL_STUDENTS: StudentRecord[] = buildInitialStudents();
export { CURRENT_ACADEMIC_YEAR, PREVIOUS_ACADEMIC_YEAR };

/**
 * Masks PEN and APAAR IDs consistently everywhere in the application:
 * Shows ONLY the last 3 characters (e.g. •••• •••• 481 or •••• •••• •756).
 */
export function maskIdentifier(id: string | null, visibleDigits = 3): string {
  if (!id) return 'Not Assigned';
  const cleaned = id.replace(/\s+/g, '');
  const safeVisible = Math.min(visibleDigits, 3);
  if (cleaned.length <= safeVisible) return cleaned;
  const maskedPart = '•'.repeat(cleaned.length - safeVisible);
  const visiblePart = cleaned.slice(-safeVisible);
  const combined = maskedPart + visiblePart;
  return combined.replace(/(.{4})/g, '$1 ').trim();
}

export function formatUnmaskedIdentifier(id: string | null): string {
  if (!id) return 'Not Assigned';
  return id.replace(/(.{4})/g, '$1 ').trim();
}

/**
 * Generates a simulated longitudinal Education History timeline for a student (oldest first).
 * - School students: 1 to 3 earlier schools (Primary -> Upper Primary -> Secondary -> Higher Secondary),
 *   including transfers between institutions and gap-year notes for select records.
 * - College students: School -> Higher Secondary / Polytechnic Diploma -> College / University chain,
 *   including transfers and gap years.
 */
export function buildSimulatedEducationHistory(student: StudentRecord): EducationHistoryStage[] {
  const isSchool =
    student.workspaceType === 'school' ||
    student.institutionType === 'School' ||
    student.institutionType === 'Junior College' ||
    student.programme.startsWith('Class ');

  const numSuffix = parseInt(student.id.replace(/\D/g, ''), 10) || 1;
  const hasTransfer =
    student.studentStatus === 'Transferred (TC Issued)' ||
    numSuffix % 4 === 0 ||
    student.id === 'STU-2001' ||
    student.id === 'STU-1001';
  const hasGapYear = numSuffix % 7 === 0 || student.id === 'STU-2003' || student.id === 'STU-1004';

  if (isSchool) {
    const classNum =
      parseInt((student.className || student.programme).replace(/\D/g, ''), 10) || 5;
    const stages: EducationHistoryStage[] = [];

    if (classNum >= 4) {
      stages.push({
        id: `${student.id}-STG-1`,
        studentId: student.id,
        stageId: `${student.id}-STG-1`,
        stage: 'Primary',
        stageLabel: 'Primary Stage (Classes 1 to 3)',
        classOrProgramme: 'Classes 1–3 (Foundational)',
        section: 'Section A',
        institutionName:
          numSuffix % 2 === 0
            ? 'Demo Foundational Primary School, Karimnagar'
            : 'Demo Vidya Mandir Primary School, Secunderabad',
        institutionType: 'School',
        boardOrUniversity: 'State Department of School Education (UDISE+)',
        startYear: '2019-20',
        endYear: '2021-22',
        academicYear: '2019-20 to 2021-22',
        academicYears: '2019-20 to 2021-22',
        rollNo: `PR-${student.pen.slice(-4)}`,
        rollOrRegNo: `PR-${student.pen.slice(-4)}`,
        status: hasTransfer ? 'Transferred' : 'Completed',
        exitReason: hasTransfer
          ? 'Parent inter-district transfer; Transfer Certificate verified'
          : 'Completed foundational primary classes',
        state: student.state || 'Telangana',
        sourceLabel: 'Imported',
      });
    }

    if (classNum >= 7) {
      stages.push({
        id: `${student.id}-STG-2`,
        studentId: student.id,
        stageId: `${student.id}-STG-2`,
        stage: 'Upper Primary',
        stageLabel: 'Upper Primary Stage (Classes 4 to 7)',
        classOrProgramme: 'Classes 4–7 (Middle Wing)',
        section: 'Section B',
        institutionName: 'Demo Model School, Karimnagar',
        institutionType: 'School',
        boardOrUniversity: 'State School Education Board (UDISE+)',
        startYear: '2022-23',
        endYear: '2024-25',
        academicYear: '2022-23 to 2024-25',
        academicYears: '2022-23 to 2024-25',
        rollNo: `UP-${student.pen.slice(-4)}`,
        rollOrRegNo: `UP-${student.pen.slice(-4)}`,
        status: 'Completed',
        exitReason: 'Promoted to Secondary High School wing',
        state: student.state || 'Telangana',
        sourceLabel: 'Demonstration Data',
        gapYearNote: hasGapYear
          ? '1-year medical / family relocation break recorded before Secondary admission (Verified)'
          : undefined,
      });
    }

    if (classNum >= 11) {
      stages.push({
        id: `${student.id}-STG-3`,
        studentId: student.id,
        stageId: `${student.id}-STG-3`,
        stage: 'Secondary',
        stageLabel: 'Secondary High School Stage (Classes 8 to 10 · SSC)',
        classOrProgramme: 'Class 10 (SSC Board)',
        section: 'Section A',
        institutionName: 'Demo High School, Warangal',
        institutionType: 'School',
        boardOrUniversity: 'Board of Secondary Education (SSC)',
        startYear: '2024-25',
        endYear: PREVIOUS_ACADEMIC_YEAR,
        academicYear: `2024-25 to ${PREVIOUS_ACADEMIC_YEAR}`,
        academicYears: `2024-25 to ${PREVIOUS_ACADEMIC_YEAR}`,
        rollNo: `SSC-${student.pen.slice(-4)}`,
        rollOrRegNo: `SSC-${student.pen.slice(-4)}`,
        status: 'Completed',
        exitReason: 'Passed Class 10 Secondary Board Exam; TC issued for Junior College',
        state: student.state || 'Telangana',
        sourceLabel: 'Imported',
      });
    } else if (classNum > 1) {
      stages.push({
        id: `${student.id}-STG-PREV`,
        studentId: student.id,
        stageId: `${student.id}-STG-PREV`,
        stage: classNum <= 5 ? 'Primary' : classNum <= 8 ? 'Upper Primary' : 'Secondary',
        stageLabel: `Previous Academic Class (Class ${classNum - 1})`,
        classOrProgramme: `Class ${classNum - 1}`,
        section: student.section || 'Section A',
        institutionName: hasTransfer
          ? 'Demo High School, Warangal'
          : student.institutionName,
        institutionType: 'School',
        boardOrUniversity: 'State School Education Board (UDISE+)',
        startYear: PREVIOUS_ACADEMIC_YEAR,
        endYear: PREVIOUS_ACADEMIC_YEAR,
        academicYear: PREVIOUS_ACADEMIC_YEAR,
        academicYears: PREVIOUS_ACADEMIC_YEAR,
        rollNo: `${student.rollNo}-P`,
        rollOrRegNo: `${student.rollNo}-P`,
        status: hasTransfer ? 'Transferred' : 'Completed',
        exitReason: hasTransfer
          ? 'Transferred to current school with TC reconciliation'
          : `Promoted from Class ${classNum - 1} to Class ${classNum}`,
        state: student.state || 'Telangana',
        sourceLabel: hasTransfer ? 'Imported' : 'Demonstration Data',
        gapYearNote: hasGapYear
          ? 'Recorded 1-year academic gap due to inter-state family movement (Demo)'
          : undefined,
      });
    }

    const currentStageCode: EducationStageCode =
      classNum <= 5
        ? 'Primary'
        : classNum <= 8
        ? 'Upper Primary'
        : classNum <= 10
        ? 'Secondary'
        : 'Higher Secondary';

    const currentStatus: EducationHistoryStatus =
      student.studentStatus === 'Transferred (TC Issued)'
        ? 'Transferred'
        : student.studentStatus === 'Dropped Out'
        ? 'Dropped out'
        : 'Studying';

    stages.push({
      id: `${student.id}-STG-CUR`,
      studentId: student.id,
      stageId: `${student.id}-STG-CUR`,
      stage: currentStageCode,
      stageLabel: `Current Enrolment — ${student.className || student.programme} (${
        student.section || 'Section A'
      })`,
      classOrProgramme: student.className || student.programme,
      section: student.section || 'Section A',
      institutionName: student.institutionName,
      institutionType:
        student.institutionType === 'Junior College' ? 'Junior College' : 'School',
      boardOrUniversity:
        student.institutionType === 'Junior College'
          ? 'Board of Intermediate Education'
          : 'State School Education Registry (UDISE+)',
      startYear: student.academicYear || CURRENT_ACADEMIC_YEAR,
      endYear: 'Present',
      academicYear: student.academicYear || CURRENT_ACADEMIC_YEAR,
      academicYears: student.academicYear || CURRENT_ACADEMIC_YEAR,
      rollNo: student.rollNo,
      rollOrRegNo: student.rollNo,
      status: currentStatus,
      exitReason:
        currentStatus === 'Studying'
          ? 'Active in current academic session'
          : student.inactiveReason || 'Recorded movement in current session',
      state: student.state || 'Telangana',
      sourceLabel: 'Manually Entered',
    });

    return stages;
  }

  // College student: longitudinal timeline combining School -> Higher Secondary / Polytechnic -> College / University
  const isPolytechnicEntry = numSuffix % 5 === 0;
  const isPgProgramme =
    student.programme.startsWith('M.Tech') || student.programme.startsWith('MBA');

  const colStages: EducationHistoryStage[] = [
    {
      id: `${student.id}-COL-0`,
      studentId: student.id,
      stageId: `${student.id}-COL-0`,
      stage: 'Upper Primary',
      stageLabel: 'Upper Primary & Middle School (Classes 6 to 8)',
      classOrProgramme: 'Class 8 (Middle School)',
      section: 'Section A',
      institutionName: 'Demo Model School, Karimnagar',
      institutionType: 'School',
      boardOrUniversity: 'State Department of School Education (UDISE+)',
      startYear: '2018-19',
      endYear: '2020-21',
      academicYear: '2018-19 to 2020-21',
      academicYears: '2018-19 to 2020-21',
      rollNo: `MS-20-${student.pen.slice(-4)}`,
      rollOrRegNo: `MS-20-${student.pen.slice(-4)}`,
      status: 'Completed',
      exitReason: 'Promoted to Secondary High School wing',
      state: student.state || 'Telangana',
      sourceLabel: 'Demonstration Data',
    },
    {
      id: `${student.id}-COL-1`,
      studentId: student.id,
      stageId: `${student.id}-COL-1`,
      stage: 'Secondary',
      stageLabel: 'Secondary School Certificate (Class 10 / SSC)',
      classOrProgramme: 'Class 10 (SSC)',
      section: 'Section A',
      institutionName: 'Demo Public School, Hyderabad',
      institutionType: 'School',
      boardOrUniversity: 'Board of Secondary Education (UDISE+ Linked)',
      startYear: '2021-22',
      endYear: '2021-22',
      academicYear: '2021-22',
      academicYears: '2021-22',
      rollNo: `SSC-21-${student.pen.slice(-4)}`,
      rollOrRegNo: `SSC-21-${student.pen.slice(-4)}`,
      status: 'Completed',
      exitReason: 'Completed Secondary Board Certificate (SSC)',
      state: student.state || 'Telangana',
      sourceLabel: 'Imported',
    },
    isPolytechnicEntry
      ? {
          id: `${student.id}-COL-2`,
          studentId: student.id,
          stageId: `${student.id}-COL-2`,
          stage: 'Diploma',
          stageLabel: '3-Year Technical Polytechnic Diploma',
          classOrProgramme: 'Diploma in Computer & Electronics Engg.',
          section: 'Section A',
          institutionName: 'Government Polytechnic Institute, Masab Tank (Demo)',
          institutionType: 'Polytechnic',
          boardOrUniversity: 'State Board of Technical Education & Training (SBTET)',
          startYear: '2022-23',
          endYear: '2024-25',
          academicYear: '2022-23 to 2024-25',
          academicYears: '2022-23 to 2024-25',
          rollNo: `POLY-24-${student.pen.slice(-4)}`,
          rollOrRegNo: `POLY-24-${student.pen.slice(-4)}`,
          status: hasTransfer ? 'Transferred' : 'Completed',
          exitReason: 'Lateral Entry (ECET) transition to B.Tech Engineering degree',
          state: student.state || 'Telangana',
          sourceLabel: 'Imported',
        }
      : {
          id: `${student.id}-COL-2`,
          studentId: student.id,
          stageId: `${student.id}-COL-2`,
          stage: 'Higher Secondary',
          stageLabel: 'Higher Secondary / Intermediate (Classes 11 & 12)',
          classOrProgramme: 'Class 12 (MPC Stream)',
          section: 'Section A',
          institutionName: 'Demo Junior College, Secunderabad',
          institutionType: 'Junior College',
          boardOrUniversity: 'Board of Intermediate Education',
          startYear: '2022-23',
          endYear: '2023-24',
          academicYear: '2022-23 to 2023-24',
          academicYears: '2022-23 to 2023-24',
          rollNo: `IPE-24-${student.pen.slice(-4)}`,
          rollOrRegNo: `IPE-24-${student.pen.slice(-4)}`,
          status: hasTransfer ? 'Transferred' : 'Completed',
          exitReason: hasTransfer
            ? 'Transferred with migration certificate for state engineering counselling'
            : 'Completed Higher Secondary Board Examination',
          state: student.state || 'Telangana',
          sourceLabel: 'Imported',
          gapYearNote: hasGapYear
            ? '1-year entrance exam preparation gap year (2024-25) declared at admission'
            : undefined,
        },
    {
      id: `${student.id}-COL-3`,
      studentId: student.id,
      stageId: `${student.id}-COL-3`,
      stage: isPgProgramme ? 'UG' : 'UG',
      stageLabel: isPgProgramme
        ? 'Prior Undergraduate Degree (B.Tech / B.E.)'
        : 'Undergraduate Engineering — Previous Academic Year (Sem 1–2)',
      classOrProgramme: isPgProgramme
        ? 'B.Tech Computer Science (Graduated)'
        : `${student.programme} (Sem 1–2)`,
      section: student.section || 'Section A',
      institutionName: hasTransfer
        ? 'Kakatiya Technological University Campus (Demo)'
        : student.institutionName,
      institutionType: isPgProgramme ? 'University' : 'College',
      boardOrUniversity: 'AICTE / State Technological University (ABC Linked)',
      startYear: PREVIOUS_ACADEMIC_YEAR,
      endYear: PREVIOUS_ACADEMIC_YEAR,
      academicYear: PREVIOUS_ACADEMIC_YEAR,
      academicYears: PREVIOUS_ACADEMIC_YEAR,
      rollNo: `${student.rollNo}-Y1`,
      rollOrRegNo: `${student.rollNo}-Y1`,
      status: hasTransfer ? 'Transferred' : 'Completed',
      exitReason: hasTransfer
        ? 'Inter-institutional credit transfer via Academic Bank of Credits (ABC)'
        : 'Promoted to next academic year',
      state: student.state || 'Telangana',
      sourceLabel: 'Demonstration Data',
    },
    {
      id: `${student.id}-COL-4`,
      studentId: student.id,
      stageId: `${student.id}-COL-4`,
      stage: isPgProgramme ? 'PG' : 'UG',
      stageLabel: `Current Programme — ${student.programme} (Semester ${student.semester})`,
      classOrProgramme: `${student.programme} (Sem ${student.semester})`,
      section: student.section || 'Section A',
      institutionName: student.institutionName,
      institutionType: 'College',
      boardOrUniversity: 'AICTE / Academic Bank of Credits (ABC)',
      startYear: student.academicYear || CURRENT_ACADEMIC_YEAR,
      endYear: 'Present',
      academicYear: student.academicYear || CURRENT_ACADEMIC_YEAR,
      academicYears: student.academicYear || CURRENT_ACADEMIC_YEAR,
      rollNo: student.rollNo,
      rollOrRegNo: student.rollNo,
      status:
        student.studentStatus === 'Transferred (TC Issued)'
          ? 'Transferred'
          : student.studentStatus === 'Dropped Out'
          ? 'Dropped out'
          : 'Studying',
      exitReason:
        student.studentStatus && student.studentStatus !== 'Active'
          ? student.inactiveReason || student.studentStatus
          : 'Active in current semester',
      state: student.state || 'Telangana',
      sourceLabel: 'Manually Entered',
    },
  ];

  return colStages;
}
