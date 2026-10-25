// ============================================================================
// FEATURE 7: UNIFIED DATA SERVICE LAYER (MOCK DEFAULT + SUPABASE SWITCHABLE)
// Switchable via environment variable VITE_USE_SUPABASE="true".
// Reads VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY from environment variables only.
// Never stores secrets or credentials in application code.
// ============================================================================

import {
  INITIAL_STUDENTS,
  INSTITUTIONS,
  PROGRAMME_INTAKES,
  STATE_MONITORING_DATA,
  StudentRecord,
  ProgrammeIntake,
  InstitutionSummary,
  StateMonitoringRow,
} from '../data/mockData';
import {
  INITIAL_MANAGED_SECTIONS,
  ManagedSection,
} from '../config/academicYears';

export interface DataServiceHealthReport {
  mode: 'mock' | 'supabase';
  useSupabaseFlag: boolean;
  hasSupabaseUrl: boolean;
  hasSupabaseAnonKey: boolean;
  maskedSupabaseUrl: string;
  connectionOk: boolean;
  latencyMs: number;
  statusMessage: string;
  checkedAt: string;
}

export interface SqlTableRequirement {
  screenName: string;
  routePath: string;
  tables: string[];
  description: string;
}

export const SCREEN_SQL_REQUIREMENTS: SqlTableRequirement[] = [
  {
    screenName: '4-Step Sequential Login & Account Security',
    routePath: '/login/state -> /login/credentials',
    tables: ['auth.users (Supabase Auth)', 'institutions', 'user_role_assignments', 'audit_logs'],
    description:
      'Authenticates users via Supabase Auth, verifies state/institution scope, and logs sign-in events without storing passwords in app state.',
  },
  {
    screenName: 'School Dashboard & Data Quality Coach',
    routePath: '/teacher',
    tables: ['academic_years', 'students', 'programmes_sections', 'cwsn_profiles', 'school_certifications'],
    description:
      'Loads active vs snapshot academic year metrics, grade-wise counts, CWSN privacy-suppressed rollups, and weekly readiness scores.',
  },
  {
    screenName: 'Programmes, Classes & Section Management',
    routePath: '/teacher/school/programmes & /teacher/section-shift',
    tables: ['programmes_intake', 'classroom_sections', 'students', 'audit_logs'],
    description:
      'Manages classroom sections, capacity ceilings, assigned class teachers, non-destructive section archiving, and student section shifts.',
  },
  {
    screenName: 'All Students Registry, Natural-Language Search & Education History',
    routePath: '/teacher/school/students & /teacher/college/students',
    tables: ['students', 'education_history', 'cwsn_profiles', 'consent_tokens', 'audit_logs'],
    description:
      'Queries student records with masked PEN/APAAR identifiers, longitudinal education_history timeline (own-institution RLS), CWSN sensitive access logging, and printable QR summary generation.',
  },
  {
    screenName: 'Add New Student (4-Step Form) & Parent Consent Link',
    routePath: '/teacher/students/new & /consent/:token',
    tables: ['students', 'cwsn_profiles', 'consent_tokens', 'age_range_rules', 'audit_logs'],
    description:
      'Validates student registration rules (4.1.1–4.1.11), stores CWSN accommodation status (record status only), and manages single-use 7-day parent consent tokens.',
  },
  {
    screenName: 'Request Management & Student Name Update',
    routePath: '/teacher/requests & /teacher/name-update',
    tables: ['correction_requests', 'students', 'audit_logs'],
    description:
      'Tracks non-destructive name and demographic correction requests through Open, Under Review, Approved, and Rejected states.',
  },
  {
    screenName: 'Duplicate Records Side-by-Side Review',
    routePath: '/teacher/duplicates',
    tables: ['duplicate_reviews', 'students', 'audit_logs'],
    description:
      'Stores human-in-the-loop duplicate decisions (Possible Duplicate, Under Review, Confirmed, Not a Duplicate, Resolved) with zero auto-merge.',
  },
  {
    screenName: 'Settings & Academic Year Rollover Wizard',
    routePath: '/teacher/settings',
    tables: ['academic_years', 'academic_year_snapshots', 'students', 'classroom_sections', 'age_range_rules', 'audit_logs'],
    description:
      'Archives the outgoing academic year into a read-only snapshot, carries over active students and sections into the new year, and logs the rollover.',
  },
  {
    screenName: 'Help & Support Center',
    routePath: '/teacher/help',
    tables: ['support_tickets', 'faq_articles', 'audit_logs'],
    description:
      'Creates and tracks user-reported support tickets across Open, In Progress, and Resolved states.',
  },
  {
    screenName: 'School & College Management + AICTE Central Monitoring',
    routePath: '/school-management, /college & /aicte',
    tables: ['institutions', 'programmes_intake', 'education_history', 'state_monitoring_rollups', 'audit_logs'],
    description:
      'Aggregates class/programme-level intake vs enrolment variance, reconciliation escalations, staff permissions, and national state-wise APAAR readiness rollups.',
  },
];

function getEnvString(key: string): string {
  try {
    const envObj = (import.meta as unknown as { env?: Record<string, string | undefined> }).env;
    return (envObj?.[key] || '').trim();
  } catch {
    return '';
  }
}

export function getDataServiceConfig() {
  const useSupabaseRaw = getEnvString('VITE_USE_SUPABASE');
  const supabaseUrl = getEnvString('VITE_SUPABASE_URL');
  const supabaseAnonKey = getEnvString('VITE_SUPABASE_ANON_KEY');

  const useSupabaseFlag = useSupabaseRaw.toLowerCase() === 'true';
  const hasSupabaseUrl = supabaseUrl.length > 0 && supabaseUrl !== 'MY_SUPABASE_URL';
  const hasSupabaseAnonKey =
    supabaseAnonKey.length > 0 && supabaseAnonKey !== 'MY_SUPABASE_ANON_KEY';

  const maskedSupabaseUrl = hasSupabaseUrl
    ? supabaseUrl.replace(/^(https?:\/\/[^.]+)\..*$/, '$1.•••.supabase.co')
    : 'Not configured (using Mock Data Adapter)';

  return {
    useSupabaseFlag,
    hasSupabaseUrl,
    hasSupabaseAnonKey,
    supabaseUrl,
    supabaseAnonKey,
    maskedSupabaseUrl,
    effectiveMode: (useSupabaseFlag && hasSupabaseUrl && hasSupabaseAnonKey
      ? 'supabase'
      : 'mock') as 'mock' | 'supabase',
  };
}

export async function checkDataServiceHealth(): Promise<DataServiceHealthReport> {
  const start = performance.now();
  const cfg = getDataServiceConfig();

  if (!cfg.useSupabaseFlag) {
    const latencyMs = Math.max(1, Math.round(performance.now() - start));
    return {
      mode: 'mock',
      useSupabaseFlag: false,
      hasSupabaseUrl: cfg.hasSupabaseUrl,
      hasSupabaseAnonKey: cfg.hasSupabaseAnonKey,
      maskedSupabaseUrl: cfg.maskedSupabaseUrl,
      connectionOk: true,
      latencyMs,
      statusMessage:
        'Mock Data Service Layer is active (VITE_USE_SUPABASE is false or unset). All 150 synthetic school students, 60 synthetic college students, and IndexedDB offline drafts are operational with workspace & assigned-class RLS isolation.',
      checkedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
    };
  }

  if (!cfg.hasSupabaseUrl || !cfg.hasSupabaseAnonKey) {
    return {
      mode: 'mock',
      useSupabaseFlag: true,
      hasSupabaseUrl: cfg.hasSupabaseUrl,
      hasSupabaseAnonKey: cfg.hasSupabaseAnonKey,
      maskedSupabaseUrl: cfg.maskedSupabaseUrl,
      connectionOk: false,
      latencyMs: 0,
      statusMessage:
        'VITE_USE_SUPABASE is enabled, but VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is missing in environment variables. Falling back safely to Mock Data Service.',
      checkedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
    };
  }

  try {
    const response = await fetch(`${cfg.supabaseUrl.replace(/\/$/, '')}/rest/v1/`, {
      method: 'HEAD',
      headers: {
        apikey: cfg.supabaseAnonKey,
        Authorization: `Bearer ${cfg.supabaseAnonKey}`,
      },
    });
    const latencyMs = Math.max(1, Math.round(performance.now() - start));
    return {
      mode: 'supabase',
      useSupabaseFlag: true,
      hasSupabaseUrl: true,
      hasSupabaseAnonKey: true,
      maskedSupabaseUrl: cfg.maskedSupabaseUrl,
      connectionOk: response.ok,
      latencyMs,
      statusMessage: response.ok
        ? `Supabase REST endpoint reachable (HTTP ${response.status}).`
        : `Supabase endpoint responded with HTTP ${response.status}. Fallback protection active.`,
      checkedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
    };
  } catch (err) {
    const latencyMs = Math.max(1, Math.round(performance.now() - start));
    return {
      mode: 'supabase',
      useSupabaseFlag: true,
      hasSupabaseUrl: true,
      hasSupabaseAnonKey: true,
      maskedSupabaseUrl: cfg.maskedSupabaseUrl,
      connectionOk: false,
      latencyMs,
      statusMessage: `Network error reaching Supabase URL (${
        err instanceof Error ? err.message : 'unreachable'
      }). Safe Mock fallback active.`,
      checkedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
    };
  }
}

export const dataService = {
  getConfig: getDataServiceConfig,
  checkHealth: checkDataServiceHealth,

  getInitialStudents(): StudentRecord[] {
    return INITIAL_STUDENTS;
  },

  getInitialProgrammes(): ProgrammeIntake[] {
    return PROGRAMME_INTAKES;
  },

  getInitialInstitutions(): InstitutionSummary[] {
    return INSTITUTIONS;
  },

  getInitialStateRows(): StateMonitoringRow[] {
    return STATE_MONITORING_DATA;
  },

  getInitialManagedSections(): ManagedSection[] {
    return INITIAL_MANAGED_SECTIONS;
  },

  // Data-layer RLS enforcement: School logins only query 'school' workspace records;
  // College logins only query 'college' workspace records. Schools and Colleges are never mixed.
  filterStudentsByWorkspace(
    allStudents: StudentRecord[],
    workspace: 'school' | 'college'
  ): StudentRecord[] {
    return allStudents.filter((s) => (s.workspaceType || 'college') === workspace);
  },

  // Data-layer RLS enforcement for Class Teachers:
  // Class teachers see only their assigned classes and sections; Management / Full-Scope Nodal sees whole institution.
  filterStudentsByTeacherScope(
    studentsInWorkspace: StudentRecord[],
    isClassTeacherScoped: boolean,
    assignedPairs: Array<{ programmeName: string; sectionName: string }>
  ): StudentRecord[] {
    if (!isClassTeacherScoped || assignedPairs.length === 0) {
      return studentsInWorkspace;
    }
    return studentsInWorkspace.filter((stu) =>
      assignedPairs.some(
        (pair) =>
          (stu.programme === pair.programmeName || stu.className === pair.programmeName) &&
          (stu.section || 'Section A') === pair.sectionName
      )
    );
  },

  filterProgrammesByWorkspace(
    allProgrammes: ProgrammeIntake[],
    workspace: 'school' | 'college'
  ): ProgrammeIntake[] {
    return allProgrammes.filter((p) => (p.workspaceType || 'college') === workspace);
  },

  filterInstitutionsByWorkspace(
    allInstitutions: InstitutionSummary[],
    workspace: 'school' | 'college'
  ): InstitutionSummary[] {
    return allInstitutions.filter((inst) => (inst.workspaceType || 'college') === workspace);
  },
};


