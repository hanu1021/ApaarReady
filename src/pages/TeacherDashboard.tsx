import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Eye,
  EyeOff,
  Sparkles,
  GitCompare,
  Download,
  CheckCircle2,
  AlertTriangle,
  Clock,
  XCircle,
  Plus,
  FileSpreadsheet,
  Printer,
  X,
  ChevronDown,
  ChevronRight,
  History,
  Lock,
  Building2,
  ArrowRightLeft,
  User,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  formatUnmaskedIdentifier,
  maskIdentifier,
  VerificationStatus,
  StudentRecord,
  buildSimulatedEducationHistory,
} from '../data/mockData';
import {
  parseNaturalLanguageQuery,
  applyNaturalSearchFilters,
  SCHOOL_NL_SEARCH_EXAMPLES,
  COLLEGE_NL_SEARCH_EXAMPLES,
  NaturalSearchFilterState,
} from '../utils/naturalLanguageSearch';
import { PrintableStudentSummaryModal } from './PublicConsentPage';

// Shared Longitudinal Education History Timeline Component (Used in Drawer & Student Profile Tab)
export const EducationHistoryTimelineView: React.FC<{
  student: StudentRecord;
  onOpenTransferReconciliation: (student: StudentRecord, fromInst: string) => void;
}> = ({ student, onOpenTransferReconciliation }) => {
  const { session, activeWorkspace, canViewSensitive } = useApp();
  const isSchoolWorkspace = activeWorkspace === 'school';

  // Access Rule: AICTE users never see individual education history
  if (session.role === 'aicte') {
    return (
      <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-xs text-red-900">
        National / State AICTE officers are restricted to aggregated anonymised analytics and never
        view individual student education histories.
      </div>
    );
  }

  // Own-institution access rule
  const isOwnInstitution =
    student.institutionId === session.institutionId ||
    (isSchoolWorkspace &&
      (student.institutionId === 'INST-SCH-01' || student.institutionId === 'INST-JC-01')) ||
    canViewSensitive;

  if (!isOwnInstitution) {
    return (
      <div className="p-4 rounded-lg bg-amber-50 border border-amber-300 text-xs text-amber-950 space-y-2">
        <div className="font-bold flex items-center gap-2">
          <Lock className="w-4 h-4 text-amber-800 shrink-0" />
          <span>Institution Scope Restriction (RLS Enforced)</span>
        </div>
        <p className="leading-relaxed">
          Education History is accessible only for students enrolled in your own institution (
          <strong>{session.institutionName}</strong>). This student belongs to{' '}
          <strong>{student.institutionName}</strong>.
        </p>
      </div>
    );
  }

  const stages = buildSimulatedEducationHistory(student);
  const transferredStage = stages.find((st) => st.status === 'Transferred');

  return (
    <div className="space-y-4">
      {/* Mandatory Simulated Banner */}
      <div
        role="note"
        className="p-3 rounded-md bg-amber-50 border border-amber-300 text-amber-950 text-xs font-medium leading-relaxed"
      >
        Simulated demo history. Cross-institution lookup needs an authorized integration in real
        use.
      </div>

      {/* Student Header Summary Card (Masked PEN only) */}
      <div className="p-3.5 rounded-md bg-slate-50 border border-slate-200 text-xs grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <div>
          <div className="text-[11px] text-slate-500">Student Name &amp; Roll No</div>
          <div className="font-display font-bold text-sm text-[#0B1F3A]">
            {student.fullName} ({student.rollNo})
          </div>
        </div>
        <div>
          <div className="text-[11px] text-slate-500">Masked PEN (Click never unmasks)</div>
          <div className="font-mono font-bold text-sm text-slate-900">
            {maskIdentifier(student.pen, 3)}
          </div>
        </div>
        <div>
          <div className="text-[11px] text-slate-500">Current Class / Programme</div>
          <div className="font-semibold text-slate-800">
            {student.className || student.programme} · {student.section || 'Section A'}
          </div>
        </div>
        <div>
          <div className="text-[11px] text-slate-500">Current Institution</div>
          <div className="font-semibold text-slate-800 truncate">{student.institutionName}</div>
        </div>
      </div>

      {/* Transfer Reconciliation Action Banner when a Transfer is recorded */}
      {transferredStage && (
        <div className="p-3 rounded-md bg-indigo-50/90 border border-indigo-200 text-xs flex flex-wrap items-center justify-between gap-2">
          <div className="space-y-0.5">
            <div className="font-semibold text-indigo-950 flex items-center gap-1.5">
              <ArrowRightLeft className="w-3.5 h-3.5 text-indigo-700 shrink-0" />
              <span>Inter-Institution Transfer Recorded ({transferredStage.academicYear})</span>
            </div>
            <div className="text-[11px] text-indigo-800">
              Transferred from {transferredStage.institutionName}. Verify TC &amp;PEN continuity.
            </div>
          </div>
          <button
            type="button"
            onClick={() =>
              onOpenTransferReconciliation(student, transferredStage.institutionName)
            }
            className="px-3 py-1.5 rounded bg-indigo-600 text-white font-semibold text-[11px] hover:bg-indigo-700 shrink-0"
          >
            Open transfer reconciliation
          </button>
        </div>
      )}

      {/* Vertical Timeline (Oldest First, Current Institution Highlighted at the End) */}
      <ol className="relative border-l-2 border-teal-600 ml-3 space-y-5 pl-5 py-1">
        {stages.map((stage, idx) => {
          const isCurrent = idx === stages.length - 1 || stage.status === 'Studying';

          return (
            <li
              key={stage.id}
              className={`relative rounded-lg p-3.5 border transition-colors ${
                isCurrent
                  ? 'bg-teal-50/50 border-teal-400 shadow-2xs'
                  : 'bg-white border-slate-200'
              }`}
            >
              <span
                className={`absolute -left-[29px] top-4 w-4 h-4 rounded-full border-2 border-white ${
                  isCurrent
                    ? 'bg-teal-600 ring-2 ring-teal-300'
                    : stage.status === 'Transferred'
                    ? 'bg-amber-500'
                    : 'bg-slate-600'
                }`}
              />

              {/* Gap Year Indicator if present before this stage */}
              {stage.gapYearNote && (
                <div className="mb-2.5 p-2 rounded bg-amber-50 border border-amber-200 text-[11px] text-amber-900 font-medium">
                  <strong>Academic Continuity Note:</strong> {stage.gapYearNote}
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  {/* Stage Badge */}
                  <span className="px-2 py-0.5 rounded bg-[#0B1F3A] text-white font-mono text-[10px] font-bold">
                    {stage.stage}
                  </span>
                  <span className="font-mono text-xs font-bold text-[#0B1F3A]">
                    {stage.startYear}–{stage.endYear} ({stage.academicYear})
                  </span>
                  {isCurrent && (
                    <span className="px-2 py-0.5 rounded bg-teal-700 text-white text-[10px] font-semibold">
                      Current Institution
                    </span>
                  )}
                </div>

                {/* Status Chip */}
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                    stage.status === 'Studying'
                      ? 'bg-teal-100 text-teal-900 border-teal-300'
                      : stage.status === 'Transferred'
                      ? 'bg-amber-100 text-amber-900 border-amber-300'
                      : stage.status === 'Dropped out'
                      ? 'bg-red-100 text-red-900 border-red-300'
                      : 'bg-slate-100 text-slate-800 border-slate-300'
                  }`}
                >
                  {stage.status}
                </span>
              </div>

              <div className="mt-2 space-y-1 text-xs">
                <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>{stage.institutionName}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 border border-slate-200 text-slate-700">
                    {stage.institutionType}
                  </span>
                </div>

                <div className="text-slate-700 font-medium">
                  Class / Programme: <strong>{stage.classOrProgramme}</strong> · State:{' '}
                  <strong>{stage.state}</strong>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-slate-500">
                  <span>
                    Exit / Transition: <strong>{stage.exitReason}</strong> (Roll: {stage.rollNo})
                  </span>
                  <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                    Source: {stage.sourceLabel}
                  </span>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
};

// 1. Main Teacher Dashboard & All Students Registry
export const TeacherDashboard: React.FC = () => {
  const {
    session,
    activeWorkspace,
    canViewSensitive,
    students,
    institutions,
    unmaskedRecordIds,
    toggleMaskRecord,
    unmaskedCwsnIds,
    toggleUnmaskCwsn,
    globalUnmask,
    applyStandardization,
    auditLogs,
    addAuditLog,
    addToast,
    activeNlQuery,
    setActiveNlQuery,
    selectedAcademicYear,
    teacherContext,
    clearTeacherContext,
    setActiveBreadcrumbSuffix,
  } = useApp();
  const navigate = useNavigate();

  const isSchoolWorkspace = activeWorkspace === 'school';
  const teacherBase = isSchoolWorkspace ? '/teacher/school' : '/teacher/college';
  const workspaceExamples = isSchoolWorkspace
    ? SCHOOL_NL_SEARCH_EXAMPLES
    : COLLEGE_NL_SEARCH_EXAMPLES;

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [instTypeFilter, setInstTypeFilter] = useState<string>('ALL');
  const [institutionFilter, setInstitutionFilter] = useState<string>('ALL');
  const [programmeFilter, setProgrammeFilter] = useState<string>('ALL');
  const [sectionFilter, setSectionFilter] = useState<string>('ALL');
  const [yearFilter, setYearFilter] = useState<string>('ALL');
  const [removedChipKeys, setRemovedChipKeys] = useState<(keyof NaturalSearchFilterState)[]>([]);
  const [printStudentId, setPrintStudentId] = useState<string | null>(null);
  const [expandedRowIds, setExpandedRowIds] = useState<Record<string, boolean>>({});
  const [historyStudent, setHistoryStudent] = useState<StudentRecord | null>(null);
  const [profileStudent, setProfileStudent] = useState<StudentRecord | null>(null);
  const [profileTab, setProfileTab] = useState<'profile' | 'history'>('profile');

  React.useEffect(() => {
    if (historyStudent || (profileStudent && profileTab === 'history')) {
      setActiveBreadcrumbSuffix('Education History');
    } else if (profileStudent) {
      setActiveBreadcrumbSuffix('Student Profile');
    } else {
      setActiveBreadcrumbSuffix(null);
    }
    return () => setActiveBreadcrumbSuffix(null);
  }, [historyStudent, profileStudent, profileTab, setActiveBreadcrumbSuffix]);

  const toggleExpandRow = (id: string) => {
    setExpandedRowIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Every open of Education History writes an entry to the audit log without unmasking PEN
  const handleOpenEducationHistory = (stu: StudentRecord) => {
    setHistoryStudent(stu);
    addAuditLog({
      actor: session.userName,
      role: session.roleDisplayLabel || session.designation,
      action: 'EDUCATION_HISTORY_VIEWED',
      targetStudentId: stu.id,
      details: `Opened longitudinal Education History drawer for ${stu.fullName} (${stu.rollNo}). PEN remained masked (${maskIdentifier(
        stu.pen,
        3
      )}).`,
    });
  };

  const handleOpenStudentProfile = (stu: StudentRecord, initialTab: 'profile' | 'history') => {
    setProfileStudent(stu);
    setProfileTab(initialTab);
    if (initialTab === 'history') {
      addAuditLog({
        actor: session.userName,
        role: session.roleDisplayLabel || session.designation,
        action: 'EDUCATION_HISTORY_VIEWED',
        targetStudentId: stu.id,
        details: `Viewed Education History tab in Student Profile for ${stu.fullName} (${stu.rollNo}).`,
      });
    }
  };

  const handleOpenTransferReconciliation = (stu: StudentRecord, fromInst: string) => {
    addAuditLog({
      actor: session.userName,
      role: session.roleDisplayLabel || session.designation,
      action: 'TRANSFER_RECONCILIATION_OPENED',
      targetStudentId: stu.id,
      details: `Initiated simulated transfer reconciliation for ${stu.fullName} from ${fromInst}.`,
    });
    addToast(
      `Opened transfer reconciliation for ${stu.fullName} (Previous: ${fromInst}).`,
      'info'
    );
    setHistoryStudent(null);
    setProfileStudent(null);
    if (session.role === 'college') {
      navigate(
        isSchoolWorkspace
          ? '/school-management/reconciliation'
          : '/college/reconciliation'
      );
    } else {
      navigate(`${teacherBase}/transfer-certificate`);
    }
  };

  const nlParseResult = useMemo(() => {
    if (!activeNlQuery.trim()) return null;
    return parseNaturalLanguageQuery(activeNlQuery);
  }, [activeNlQuery]);

  const effectiveNlFilters = useMemo<NaturalSearchFilterState>(() => {
    if (!nlParseResult || !nlParseResult.understood) return {};
    const next = { ...nlParseResult.filters };
    for (const key of removedChipKeys) {
      delete next[key];
    }
    return next;
  }, [nlParseResult, removedChipKeys]);

  const activeNlChips = useMemo(() => {
    if (!nlParseResult || !nlParseResult.understood) return [];
    return nlParseResult.chips.filter((c) => !removedChipKeys.includes(c.key));
  }, [nlParseResult, removedChipKeys]);

  const uniqueProgrammes = useMemo(() => {
    return Array.from(new Set(students.map((s) => s.programme)));
  }, [students]);

  // PEN Search Guardrail: Searching by PEN requires either the full 11-digit PEN
  // or the can_view_sensitive permission; block partial PEN search for users without that permission.
  const trimmedSearch = searchQuery.trim();
  const isDigitsOnlySearch = /^\d+$/.test(trimmedSearch);
  const isPartialPenBlocked =
    isDigitsOnlySearch &&
    trimmedSearch.length > 0 &&
    trimmedSearch.length < 11 &&
    !canViewSensitive;

  const filteredStudents = useMemo(() => {
    if (isPartialPenBlocked) {
      return [];
    }

    const baseList =
      activeNlChips.length > 0
        ? applyNaturalSearchFilters(students, effectiveNlFilters)
        : students;

    const qLower = trimmedSearch.toLowerCase();

    return baseList.filter((s) => {
      const matchesPen =
        trimmedSearch.length === 11
          ? s.pen === trimmedSearch
          : canViewSensitive && trimmedSearch.length > 0
          ? s.pen.includes(trimmedSearch)
          : false;

      const matchesSearch =
        !trimmedSearch ||
        s.fullName.toLowerCase().includes(qLower) ||
        s.rollNo.toLowerCase().includes(qLower) ||
        s.programme.toLowerCase().includes(qLower) ||
        (s.className || '').toLowerCase().includes(qLower) ||
        s.institutionName.toLowerCase().includes(qLower) ||
        matchesPen;

      const matchesStatus =
        statusFilter === 'ALL' || s.verificationStatus === statusFilter;

      const stuInstType =
        s.institutionType || (isSchoolWorkspace ? 'School' : 'College');
      const matchesInstType =
        instTypeFilter === 'ALL' || stuInstType === instTypeFilter;

      const matchesInst =
        institutionFilter === 'ALL' || s.institutionId === institutionFilter;

      const matchesProg =
        programmeFilter === 'ALL' || s.programme === programmeFilter;

      const matchesSection =
        sectionFilter === 'ALL' || (s.section || 'Section A') === sectionFilter;

      const matchesYear =
        yearFilter === 'ALL' || (s.academicYear || selectedAcademicYear) === yearFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesInstType &&
        matchesInst &&
        matchesProg &&
        matchesSection &&
        matchesYear
      );
    });
  }, [
    students,
    trimmedSearch,
    isPartialPenBlocked,
    canViewSensitive,
    statusFilter,
    instTypeFilter,
    institutionFilter,
    programmeFilter,
    sectionFilter,
    yearFilter,
    selectedAcademicYear,
    isSchoolWorkspace,
    activeNlChips.length,
    effectiveNlFilters,
  ]);

  // Summary metrics
  const totalCount = students.length;
  const simulatedVerifiedCount = students.filter(
    (s) => s.verificationStatus === 'Simulated Verification'
  ).length;
  const pendingOfficialCount = students.filter(
    (s) => s.verificationStatus === 'Pending Official Verification'
  ).length;
  const mismatchCount = students.filter(
    (s) => s.verificationStatus === 'Mismatch Flagged'
  ).length;
  const missingApaarCount = students.filter(
    (s) => s.verificationStatus === 'Missing APAAR ID'
  ).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-teal-700">
            {isSchoolWorkspace
              ? 'School & Junior College Workspace (Classes 1–12) · Demo Data'
              : 'College Technical Workspace (Programmes & Semesters) · Demo Data'}
          </div>
          <h1 className="font-display text-2xl font-bold text-[#0B1F3A] mt-0.5">
            {isSchoolWorkspace
              ? 'School Student Identity Readiness & Registry'
              : 'College Student Identity Readiness & Registry'}
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Inspect {totalCount} fictional {isSchoolWorkspace ? 'school' : 'college'} student
            records for {selectedAcademicYear}. Click any masked PEN or History icon to view
            longitudinal Education History without unmasking the PEN.
          </p>
        </div>

        {session.role === 'teacher' && (
          <div className="flex items-center gap-3 shrink-0">
            <Link
              to={`${teacherBase}/students/new`}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#0B1F3A] rounded-md hover:bg-slate-800 transition-colors whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Student (4-Step Form)</span>
            </Link>
          </div>
        )}
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <div className="text-xs font-medium text-slate-500">
            Total Fictional {isSchoolWorkspace ? 'School' : 'College'} Students
          </div>
          <div className="mt-2 flex items-baseline justify-between font-mono tabular-nums">
            <span className="text-3xl font-bold text-[#0B1F3A]">{totalCount}</span>
            <span className="text-xs text-slate-500">
              {institutions.length} {isSchoolWorkspace ? 'Schools / Jr. Colleges' : 'Colleges'}
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
            100% PEN assigned · Masked (last 3 digits only)
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <div className="text-xs font-medium text-slate-500">Simulated Verification</div>
          <div className="mt-2 flex items-baseline justify-between font-mono tabular-nums">
            <span className="text-3xl font-bold text-teal-700">{simulatedVerifiedCount}</span>
            <span className="text-xs font-semibold text-teal-700">
              {totalCount > 0 ? ((simulatedVerifiedCount / totalCount) * 100).toFixed(1) : '0.0'}%
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-teal-700">
            Schema &amp; token format validated (Simulated)
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <div className="text-xs font-medium text-slate-500">Pending Official Verification</div>
          <div className="mt-2 flex items-baseline justify-between font-mono tabular-nums">
            <span className="text-3xl font-bold text-amber-600">{pendingOfficialCount}</span>
            <span className="text-xs font-semibold text-amber-700">
              +{missingApaarCount} Missing APAAR
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-amber-700">
            Awaiting sandbox eKYC / ABC handshake
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <div className="text-xs font-medium text-slate-500">AI Flags &amp; Mismatches</div>
          <div className="mt-2 flex items-baseline justify-between font-mono tabular-nums">
            <span className="text-3xl font-bold text-red-600">{mismatchCount}</span>
            <span className="text-xs font-semibold text-indigo-700">AI Assist Active</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-red-700">
            Human review required · Zero auto-merge
          </div>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-4">
        <div className="flex flex-col gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, roll number, class, programme or institution"
              className="w-full pl-10 pr-4 py-2 text-sm rounded-md border border-slate-300 focus:border-[#0B1F3A] focus:outline-none"
            />
          </div>

          {/* PEN Partial Search Guardrail Banner */}
          {isPartialPenBlocked && (
            <div
              role="alert"
              className="p-3 rounded-md bg-amber-50 border border-amber-300 text-xs text-amber-950 flex flex-wrap items-center justify-between gap-2"
            >
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-800 shrink-0" />
                <span>
                  <strong>Partial PEN Search Blocked:</strong> Searching by PEN requires either the{' '}
                  <strong>full 11-digit PEN</strong> or the <code className="font-mono">can_view_sensitive</code>{' '}
                  permission. You entered {trimmedSearch.length} digit(s).
                </span>
              </div>
              <span className="font-mono text-[11px] text-amber-800">
                Permission: can_view_sensitive = OFF
              </span>
            </div>
          )}

          {/* Dropdown Filters: Institution Type, Class/Programme, Section, Academic Year, Status */}
          <div className="flex flex-wrap items-center gap-2.5">
            <select
              aria-label="Filter by Institution Type"
              value={instTypeFilter}
              onChange={(e) => setInstTypeFilter(e.target.value)}
              className="rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:border-[#0B1F3A] focus:outline-none"
            >
              <option value="ALL">
                All Institution Types ({isSchoolWorkspace ? 'School & Jr. College' : 'College'})
              </option>
              {isSchoolWorkspace ? (
                <>
                  <option value="School">School (Classes 1–10)</option>
                  <option value="Junior College">Junior College (Classes 11–12)</option>
                </>
              ) : (
                <option value="College">College (UG / PG)</option>
              )}
            </select>

            <select
              aria-label="Filter by Class or Programme"
              value={programmeFilter}
              onChange={(e) => setProgrammeFilter(e.target.value)}
              className="rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:border-[#0B1F3A] focus:outline-none max-w-[200px] truncate"
            >
              <option value="ALL">
                All {isSchoolWorkspace ? 'Classes' : 'Programmes'} ({uniqueProgrammes.length})
              </option>
              {uniqueProgrammes.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>

            <select
              aria-label="Filter by Section"
              value={sectionFilter}
              onChange={(e) => setSectionFilter(e.target.value)}
              className="rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:border-[#0B1F3A] focus:outline-none"
            >
              <option value="ALL">All Sections (A–C)</option>
              <option value="Section A">Section A</option>
              <option value="Section B">Section B</option>
              <option value="Section C">Section C</option>
            </select>

            <select
              aria-label="Filter by Academic Year"
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:border-[#0B1F3A] focus:outline-none"
            >
              <option value="ALL">All Academic Years ({selectedAcademicYear})</option>
              <option value="2026-27">2026-27 (Current)</option>
              <option value="2025-26">2025-26 (Snapshot)</option>
            </select>

            <select
              aria-label="Filter by Institution"
              value={institutionFilter}
              onChange={(e) => setInstitutionFilter(e.target.value)}
              className="rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:border-[#0B1F3A] focus:outline-none max-w-[210px] truncate"
            >
              <option value="ALL">
                All {isSchoolWorkspace ? 'Schools / Jr. Colleges' : 'Colleges'}
              </option>
              {institutions.map((inst) => (
                <option key={inst.id} value={inst.id}>
                  {inst.name}
                </option>
              ))}
            </select>

            <select
              aria-label="Filter by Verification Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:border-[#0B1F3A] focus:outline-none"
            >
              <option value="ALL">All Statuses ({students.length})</option>
              <option value="Simulated Verification">Simulated Verification</option>
              <option value="Pending Official Verification">Pending Official Verification</option>
              <option value="Mismatch Flagged">Mismatch Flagged</option>
              <option value="Missing APAAR ID">Missing APAAR ID</option>
            </select>

            {(searchQuery ||
              statusFilter !== 'ALL' ||
              instTypeFilter !== 'ALL' ||
              institutionFilter !== 'ALL' ||
              programmeFilter !== 'ALL' ||
              sectionFilter !== 'ALL' ||
              yearFilter !== 'ALL' ||
              activeNlQuery) && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('ALL');
                  setInstTypeFilter('ALL');
                  setInstitutionFilter('ALL');
                  setProgrammeFilter('ALL');
                  setSectionFilter('ALL');
                  setYearFilter('ALL');
                  setActiveNlQuery('');
                  setRemovedChipKeys([]);
                }}
                className="px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 underline whitespace-nowrap"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>

        {/* NATURAL-LANGUAGE SEARCH BAR + REMOVABLE FILTER CHIPS */}
        <div className="pt-2 border-t border-slate-100 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-900">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>
                Natural-Language Examples ({isSchoolWorkspace ? 'School' : 'College'}):
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {workspaceExamples.map((ex) => (
                <button
                  key={ex}
                  type="button"
                  onClick={() => {
                    setRemovedChipKeys([]);
                    setActiveNlQuery(ex);
                  }}
                  className={`px-2 py-0.5 rounded text-[11px] border transition-colors ${
                    activeNlQuery === ex
                      ? 'bg-indigo-600 text-white border-indigo-600 font-semibold'
                      : 'bg-indigo-50/70 hover:bg-indigo-100 text-indigo-800 border-indigo-200'
                  }`}
                >
                  &ldquo;{ex}&rdquo;
                </button>
              ))}
            </div>
          </div>

          {nlParseResult && (
            <div className="p-3 rounded-md bg-indigo-50/70 border border-indigo-200 text-xs space-y-2">
              {nlParseResult.understood ? (
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="font-semibold text-indigo-950">
                      Interpreted Filters for &ldquo;{activeNlQuery}&rdquo;:
                    </span>
                    {activeNlChips.length === 0 ? (
                      <span className="text-slate-500 italic">All chips removed</span>
                    ) : (
                      activeNlChips.map((chip) => (
                        <span
                          key={chip.key}
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-white border border-indigo-300 text-indigo-900 font-medium shadow-2xs"
                        >
                          <span>{chip.label}</span>
                          <button
                            type="button"
                            onClick={() =>
                              setRemovedChipKeys((prev) => [...prev, chip.key])
                            }
                            aria-label={`Remove filter ${chip.label}`}
                            className="text-indigo-500 hover:text-red-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveNlQuery('');
                      setRemovedChipKeys([]);
                    }}
                    className="text-[11px] text-indigo-700 hover:underline font-semibold"
                  >
                    Clear NL Search
                  </button>
                </div>
              ) : (
                <div className="space-y-1.5 text-amber-950">
                  <div className="font-semibold flex items-center justify-between">
                    <span>
                      I didn&apos;t understand &ldquo;{activeNlQuery}&rdquo;. Try one of these
                      plain-English queries:
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveNlQuery('')}
                      className="text-[11px] underline"
                    >
                      Dismiss
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {workspaceExamples.map((ex) => (
                      <button
                        key={ex}
                        type="button"
                        onClick={() => {
                          setRemovedChipKeys([]);
                          setActiveNlQuery(ex);
                        }}
                        className="px-2 py-0.5 rounded bg-white border border-amber-300 text-amber-900 font-medium text-[11px]"
                      >
                        {ex}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* All Students Table (Compact Rows + Clickable Masked PEN for Education History Drawer) */}
        <div className="overflow-x-auto border-t border-slate-200 pt-2">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-semibold text-slate-500">
                <th className="py-2.5 px-3">Roll No &amp; ID</th>
                <th className="py-2.5 px-3">Student Name &amp; DOB</th>
                <th className="py-2.5 px-3">Institution Type</th>
                <th className="py-2.5 px-3">
                  {isSchoolWorkspace ? 'Class' : 'Programme'}
                </th>
                <th className="py-2.5 px-3">Section</th>
                <th className="py-2.5 px-3">Academic Year</th>
                <th className="py-2.5 px-3">PEN (Click for History) &amp; APAAR</th>
                <th className="py-2.5 px-3">Verification (Simulated)</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-slate-500 space-y-2">
                    <div>
                      {isPartialPenBlocked
                        ? 'Enter a full 11-digit PEN or enable can_view_sensitive permission to search by partial PEN.'
                        : 'No student records match your current class/section context or filter criteria.'}
                    </div>
                    {(teacherContext.classOrProgramme !== 'Show all' ||
                      teacherContext.section !== 'Show all') && (
                      <button
                        type="button"
                        onClick={clearTeacherContext}
                        className="px-3 py-1.5 rounded bg-[#0B1F3A] text-white text-xs font-semibold hover:bg-slate-800"
                      >
                        Clear Context Bar Selection (Show All)
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                filteredStudents.map((stu) => {
                  const isUnmasked = globalUnmask || !!unmaskedRecordIds[stu.id];
                  const isExpanded = !!expandedRowIds[stu.id];
                  const badgeType =
                    stu.institutionType || (isSchoolWorkspace ? 'School' : 'College');
                  const hasNotesOrCwsn = Boolean(stu.aiIssueNote || stu.cwsnDetails?.isCwsn);

                  return (
                    <React.Fragment key={stu.id}>
                      <tr className="hover:bg-slate-50/90 transition-colors align-middle">
                        <td className="py-2.5 px-3 font-mono tabular-nums whitespace-nowrap">
                          <div className="font-semibold text-slate-900">{stu.rollNo}</div>
                          <div className="text-[11px] text-slate-500">{stu.id}</div>
                        </td>

                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <div className="font-medium text-slate-900 flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenStudentProfile(stu, 'profile')}
                              className="text-left font-semibold text-[#0B1F3A] hover:text-indigo-700 hover:underline"
                              title="Open Student Profile & Education History"
                            >
                              {stu.fullName}
                            </button>
                            {stu.cwsnDetails?.isCwsn && (
                              <span className="px-1.5 py-0.2 rounded bg-indigo-50 border border-indigo-200 text-[10px] font-mono text-indigo-800">
                                CWSN
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono tabular-nums flex items-center gap-2">
                            <span>DOB: {stu.dob}</span>
                            {hasNotesOrCwsn && (
                              <button
                                type="button"
                                onClick={() => toggleExpandRow(stu.id)}
                                className="inline-flex items-center gap-0.5 text-[10px] font-sans font-semibold text-indigo-700 hover:underline"
                              >
                                {isExpanded ? (
                                  <ChevronDown className="w-3 h-3" />
                                ) : (
                                  <ChevronRight className="w-3 h-3" />
                                )}
                                <span>{isExpanded ? 'Hide notes' : 'View notes'}</span>
                              </button>
                            )}
                          </div>
                        </td>

                        {/* Institution Type Badge */}
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-semibold border ${
                              badgeType === 'School'
                                ? 'bg-teal-50 text-teal-800 border-teal-200'
                                : badgeType === 'Junior College'
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : 'bg-indigo-50 text-indigo-800 border-indigo-200'
                            }`}
                          >
                            {badgeType}
                          </span>
                          <div className="text-[11px] text-slate-500 truncate max-w-[165px] mt-0.5">
                            {stu.institutionName}
                          </div>
                        </td>

                        {/* Class or Programme */}
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <div className="font-semibold text-slate-800 max-w-[170px] truncate">
                            {stu.className || stu.programme}
                          </div>
                          {!isSchoolWorkspace && (
                            <div className="text-[11px] text-slate-500 font-mono">
                              Sem {stu.semester}
                            </div>
                          )}
                          {isSchoolWorkspace && stu.medium && (
                            <div className="text-[11px] text-slate-500">
                              Medium: {stu.medium}
                            </div>
                          )}
                        </td>

                        {/* Section */}
                        <td className="py-2.5 px-3 whitespace-nowrap font-mono text-slate-700">
                          {stu.section || 'Section A'}
                        </td>

                        {/* Academic Year */}
                        <td className="py-2.5 px-3 whitespace-nowrap font-mono text-slate-700">
                          {stu.academicYear || selectedAcademicYear}
                        </td>

                        {/* Clickable Masked PEN (Opens Education History without unmasking PEN) */}
                        <td className="py-2.5 px-3 font-mono tabular-nums whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => handleOpenEducationHistory(stu)}
                            title="View education history"
                            className="group inline-flex items-center gap-1.5 text-left text-slate-900 hover:text-indigo-700 font-semibold focus:outline-none"
                          >
                            <span>
                              PEN:{' '}
                              {isUnmasked
                                ? formatUnmaskedIdentifier(stu.pen)
                                : maskIdentifier(stu.pen, 3)}
                            </span>
                            <History className="w-3.5 h-3.5 text-indigo-600 group-hover:scale-110 transition-transform shrink-0" />
                          </button>
                          <div
                            className={
                              stu.apaarId
                                ? 'text-slate-600 text-[11px]'
                                : 'text-amber-700 font-sans text-[11px]'
                            }
                          >
                            APAAR:{' '}
                            {isUnmasked
                              ? formatUnmaskedIdentifier(stu.apaarId)
                              : maskIdentifier(stu.apaarId, 3)}
                          </div>
                        </td>

                        {/* Verification Status */}
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <StatusLine status={stu.verificationStatus} />
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            Quality: <strong className="font-mono">{stu.dataQualityScore}%</strong>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-2.5 px-3 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleOpenEducationHistory(stu)}
                              className="px-2 py-1 text-[11px] font-medium rounded border border-slate-300 text-slate-700 hover:bg-slate-100 inline-flex items-center gap-1"
                              title="View education history"
                            >
                              <History className="w-3 h-3 text-indigo-600" />
                              <span>History</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => toggleMaskRecord(stu.id)}
                              className="px-2 py-1 text-[11px] font-medium rounded border border-slate-300 text-slate-700 hover:bg-slate-100 inline-flex items-center gap-1"
                              title={
                                isUnmasked
                                  ? 'Mask PEN & APAAR'
                                  : 'Reveal PEN & APAAR (Audit Logged)'
                              }
                            >
                              {isUnmasked ? (
                                <EyeOff className="w-3 h-3 text-amber-600" />
                              ) : (
                                <Eye className="w-3 h-3 text-slate-500" />
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() => setPrintStudentId(stu.id)}
                              className="px-2 py-1 text-[11px] font-medium rounded border border-slate-300 text-slate-700 hover:bg-slate-100 inline-flex items-center gap-1"
                              title="Open Printable Record Summary (Demo)"
                            >
                              <Printer className="w-3 h-3 text-slate-600" />
                            </button>

                            {stu.verificationStatus !== 'Simulated Verification' && (
                              <button
                                type="button"
                                onClick={() => applyStandardization(stu.id)}
                                className="px-2 py-1 text-[11px] font-medium rounded bg-indigo-50 text-indigo-700 hover:bg-indigo-100 inline-flex items-center gap-1"
                              >
                                <Sparkles className="w-3 h-3" />
                                <span>Clean</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>

                      {/* Expandable Detail Row for Long Notes, CWSN, and School Fields */}
                      {isExpanded && (
                        <tr className="bg-slate-50/90 border-b border-slate-200">
                          <td colSpan={9} className="px-4 py-3 text-xs space-y-2">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="font-semibold text-[#0B1F3A]">
                                Detailed Notes &amp; Attributes for {stu.fullName} ({stu.rollNo})
                              </div>
                              <button
                                type="button"
                                onClick={() => toggleExpandRow(stu.id)}
                                className="text-[11px] text-slate-500 hover:text-slate-800 underline"
                              >
                                Collapse
                              </button>
                            </div>

                            {stu.aiIssueNote && (
                              <div className="p-2.5 rounded bg-indigo-50/80 border border-indigo-200 text-indigo-900 flex items-start gap-2">
                                <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                                <span>
                                  <strong>AI Data Quality Note:</strong> {stu.aiIssueNote}
                                </span>
                              </div>
                            )}

                            {stu.cwsnDetails?.isCwsn && (
                              <div className="p-2.5 rounded bg-white border border-slate-200 flex flex-wrap items-center justify-between gap-2">
                                <div>
                                  {unmaskedCwsnIds[stu.id] ? (
                                    <span className="text-indigo-900 font-medium">
                                      <strong>CWSN Record Status:</strong>{' '}
                                      {stu.cwsnDetails.disabilityCategory} · Certificate:{' '}
                                      {stu.cwsnDetails.certificateStatus || 'Verified'} · Support:{' '}
                                      {(stu.cwsnDetails.supportNeeded || []).join(', ')}
                                    </span>
                                  ) : (
                                    <span className="font-mono text-slate-600">
                                      CWSN Accommodation Status: [Sensitive · Masked by Default]
                                    </span>
                                  )}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => toggleUnmaskCwsn(stu.id)}
                                  className="text-[11px] font-semibold text-indigo-700 hover:underline"
                                >
                                  {unmaskedCwsnIds[stu.id]
                                    ? 'Mask CWSN Status'
                                    : 'Reveal CWSN Status (Audit Logged)'}
                                </button>
                              </div>
                            )}

                            {isSchoolWorkspace && (
                              <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-600">
                                <span>
                                  <strong>Medium of Instruction:</strong> {stu.medium || 'English'}
                                </span>
                                <span>
                                  <strong>Mid-Day Meal Eligible (Demo):</strong>{' '}
                                  {stu.midDayMealEligible || 'Yes'}
                                </span>
                                <span>
                                  <strong>Parent Consent Status:</strong>{' '}
                                  {stu.consentStatus || 'not_required'}
                                </span>
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
          <div>
            Showing <strong className="font-mono">{filteredStudents.length}</strong> of{' '}
            <strong className="font-mono">{students.length}</strong> synthetic{' '}
            {isSchoolWorkspace ? 'school' : 'college'} records (Demo data)
          </div>
          <div>
            Guardrail: Identifiers masked to last 3 chars. Records are never auto-merged or deleted.
          </div>
        </div>
      </div>

      {/* PRINTABLE RECORD SUMMARY MODAL */}
      {printStudentId && (
        <PrintableStudentSummaryModal
          student={students.find((s) => s.id === printStudentId) || null}
          onClose={() => setPrintStudentId(null)}
        />
      )}

      {/* STUDENT PROFILE MODAL WITH "Education History" TAB */}
      {profileStudent && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Student Profile for ${profileStudent.fullName}`}
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-[1px] flex items-center justify-center p-4 overflow-y-auto"
        >
          <div className="bg-white border border-slate-200 rounded-lg shadow-2xl max-w-2xl w-full p-5 sm:p-6 space-y-4 my-auto">
            <div className="flex items-start justify-between gap-3 border-b border-slate-200 pb-3">
              <div>
                <div className="text-xs font-semibold text-teal-700 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  <span>Student Profile &amp; Longitudinal Record · Demo Data</span>
                </div>
                <h2 className="font-display text-lg font-bold text-[#0B1F3A] mt-0.5">
                  {profileStudent.fullName} ({profileStudent.rollNo})
                </h2>
                <p className="text-xs text-slate-500 font-mono">
                  PEN: {maskIdentifier(profileStudent.pen, 3)} · APAAR:{' '}
                  {maskIdentifier(profileStudent.apaarId, 3)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setProfileStudent(null)}
                className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Tabs: Profile & Readiness vs Education History */}
            <div className="flex items-center gap-2 border-b border-slate-200">
              <button
                type="button"
                onClick={() => setProfileTab('profile')}
                className={`px-3.5 py-2 text-xs font-semibold border-b-2 transition-colors ${
                  profileTab === 'profile'
                    ? 'border-[#0B1F3A] text-[#0B1F3A]'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Profile &amp; Readiness
              </button>
              <button
                type="button"
                onClick={() => {
                  setProfileTab('history');
                  addAuditLog({
                    actor: session.userName,
                    role: session.roleDisplayLabel || session.designation,
                    action: 'EDUCATION_HISTORY_VIEWED',
                    targetStudentId: profileStudent.id,
                    details: `Switched to Education History tab in Student Profile for ${profileStudent.fullName}.`,
                  });
                }}
                className={`px-3.5 py-2 text-xs font-semibold border-b-2 transition-colors inline-flex items-center gap-1.5 ${
                  profileTab === 'history'
                    ? 'border-indigo-600 text-indigo-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <History className="w-3.5 h-3.5" />
                <span>Education History</span>
              </button>
            </div>

            {profileTab === 'profile' ? (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-4 rounded-md border border-slate-200">
                  <div>
                    <span className="text-slate-500 block">Institution:</span>
                    <strong className="text-slate-900">{profileStudent.institutionName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Class / Programme &amp; Section:</span>
                    <strong className="text-slate-900">
                      {profileStudent.className || profileStudent.programme} ·{' '}
                      {profileStudent.section || 'Section A'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Date of Birth &amp; Gender:</span>
                    <strong className="font-mono text-slate-900">
                      {profileStudent.dob} · {profileStudent.gender}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Verification Status:</span>
                    <strong className="text-teal-800">{profileStudent.verificationStatus}</strong>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setProfileTab('history')}
                    className="px-3.5 py-2 rounded bg-indigo-600 text-white font-semibold hover:bg-indigo-700 inline-flex items-center gap-1.5"
                  >
                    <History className="w-3.5 h-3.5" />
                    <span>View Education History Timeline &rarr;</span>
                  </button>
                </div>
              </div>
            ) : (
              <EducationHistoryTimelineView
                student={profileStudent}
                onOpenTransferReconciliation={handleOpenTransferReconciliation}
              />
            )}
          </div>
        </div>
      )}

      {/* EDUCATION HISTORY DRAWER (Titled "Education history" - Side drawer on desktop, full page on phones) */}
      {historyStudent && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Education history"
          className="fixed inset-0 z-50 flex justify-end"
        >
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-[1px]"
            onClick={() => setHistoryStudent(null)}
            aria-hidden="true"
          />
          <aside className="relative z-10 w-full sm:max-w-lg bg-white h-full shadow-2xl border-l border-slate-200 flex flex-col justify-between overflow-y-auto">
            <div className="p-5 sm:p-6 space-y-4">
              <div className="flex items-start justify-between gap-3 border-b border-slate-200 pb-4">
                <div>
                  <div className="text-xs font-semibold text-indigo-700 flex items-center gap-1.5">
                    <History className="w-3.5 h-3.5" />
                    <span>Longitudinal Academic Continuity · Audit Logged</span>
                  </div>
                  <h2 className="font-display text-lg font-bold text-[#0B1F3A] mt-0.5">
                    Education history
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setHistoryStudent(null)}
                  className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                  aria-label="Close Education history drawer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <EducationHistoryTimelineView
                student={historyStudent}
                onOpenTransferReconciliation={handleOpenTransferReconciliation}
              />
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
              <span className="text-slate-500">
                PEN remains masked · Open logged in Audit Trail
              </span>
              <button
                type="button"
                onClick={() => setHistoryStudent(null)}
                className="px-4 py-1.5 rounded bg-[#0B1F3A] text-white font-semibold hover:bg-slate-800"
              >
                Close Drawer
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Recent Audit Log Entries Section */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div>
            <h2 className="font-display font-bold text-sm text-[#0B1F3A]">
              Recent Nodal Officer &amp; Registration Audit Log
            </h2>
            <p className="text-xs text-slate-500">
              Immutable audit trail of student registrations, education history lookups, draft
              saves, and standardization events (Demo data).
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500">
            {auditLogs.length} Logged Event(s)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-semibold text-slate-500">
                <th className="py-2 px-3">Audit ID &amp; Timestamp</th>
                <th className="py-2 px-3">Actor &amp; Role</th>
                <th className="py-2 px-3">Action</th>
                <th className="py-2 px-3">Target Record</th>
                <th className="py-2 px-3">Summary Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {auditLogs.slice(0, 6).map((log) => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-mono whitespace-nowrap text-slate-600">
                    <span className="font-semibold text-slate-800">{log.id}</span> · {log.timestamp}
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <span className="font-medium text-slate-900">{log.actor}</span>
                    <span className="text-slate-400"> ({log.role})</span>
                  </td>
                  <td className="py-2.5 px-3 font-mono font-semibold text-teal-700 whitespace-nowrap">
                    {log.action}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-800 whitespace-nowrap">
                    {log.targetStudentId}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Clean unboxed status label with icon + text (Zero-Pill compliant)
const StatusLine: React.FC<{ status: VerificationStatus }> = ({ status }) => {
  if (status === 'Simulated Verification') {
    return (
      <span className="inline-flex items-center gap-1.5 font-semibold text-teal-700">
        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
        <span>Simulated Verification</span>
      </span>
    );
  }
  if (status === 'Pending Official Verification') {
    return (
      <span className="inline-flex items-center gap-1.5 font-semibold text-amber-700">
        <Clock className="w-3.5 h-3.5 shrink-0" />
        <span>Pending Official Verification</span>
      </span>
    );
  }
  if (status === 'Mismatch Flagged') {
    return (
      <span className="inline-flex items-center gap-1.5 font-semibold text-red-600">
        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
        <span>Mismatch Flagged</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 font-semibold text-amber-700">
      <XCircle className="w-3.5 h-3.5 shrink-0" />
      <span>Missing APAAR ID</span>
    </span>
  );
};

// 2. Teacher Sub-page: AI Data Cleaning Lab ("/teacher/cleaning")
export const TeacherCleaningPage: React.FC = () => {
  const { students, applyStandardization } = useApp();
  const candidates = students.filter(
    (s) => s.aiIssueNote && s.reviewedStatus !== 'Approved for Submission'
  );

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs font-semibold text-indigo-700">
          AI Data Quality Assistant · Demo Data
        </div>
        <h1 className="font-display text-2xl font-bold text-[#0B1F3A] mt-0.5">
          AI Data Cleaning &amp; Name/DOB Standardization Lab
        </h1>
        <p className="text-xs text-slate-600 mt-1">
          Review AI-detected formatting discrepancies (honorifics, initials, date format). Changes
          require explicit human approval and never overwrite official government registries.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-200">
        {candidates.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-600">
            All flagged student records have been reviewed and standardized for Simulated
            Verification!
          </div>
        ) : (
          candidates.map((stu) => (
            <div
              key={stu.id}
              className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                  <span>{stu.rollNo}</span>
                  <span>·</span>
                  <span>PEN: {maskIdentifier(stu.pen, 4)}</span>
                  <span>·</span>
                  <span className="font-sans text-slate-700">{stu.programme}</span>
                </div>
                <div className="font-display font-semibold text-base text-slate-900">
                  Current Entry: &ldquo;{stu.fullName}&rdquo; (DOB: {stu.dob})
                </div>
                <div className="text-xs text-indigo-700 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 shrink-0" />
                  <span>{stu.aiIssueNote}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => applyStandardization(stu.id)}
                  className="px-4 py-2 text-xs font-semibold rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition-colors whitespace-nowrap"
                >
                  Approve AI Standardization
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// 3. Teacher Sub-page: Non-Destructive Duplicate Review Queue ("/teacher/duplicates")
export const TeacherDuplicatesPage: React.FC = () => {
  const { students, markDuplicateDecision, selectedAcademicYear } = useApp();

  const duplicatePairs = useMemo(() => {
    const pairs: Array<{ primary: (typeof students)[0]; secondary: (typeof students)[0] }> = [];
    const seen = new Set<string>();
    for (const s of students) {
      if (s.duplicateCandidateId && !seen.has(s.id)) {
        const partner = students.find((p) => p.id === s.duplicateCandidateId);
        if (partner) {
          pairs.push({ primary: s, secondary: partner });
          seen.add(s.id);
          seen.add(partner.id);
        }
      }
    }
    return pairs;
  }, [students]);

  const statusButtons: Array<
    'Possible Duplicate' | 'Under Review' | 'Confirmed' | 'Not a Duplicate' | 'Resolved'
  > = ['Possible Duplicate', 'Under Review', 'Confirmed', 'Not a Duplicate', 'Resolved'];

  return (
    <div className="space-y-6 min-w-0">
      <div>
        <div className="text-xs font-semibold text-purple-700">
          Human-in-the-Loop Deduplication · Demo Data
        </div>
        <h1 className="font-display text-xl sm:text-2xl font-bold text-[#0B1F3A] mt-0.5 break-words">
          Duplicate Records {selectedAcademicYear} (Side-by-Side Review)
        </h1>
        <p className="text-xs text-slate-600 mt-1">
          Strict Policy: APAAR Ready <strong>never auto-merges or deletes student records</strong>.
          Transition candidate pairs through Possible Duplicate, Under Review, Confirmed, Not a
          Duplicate, or Resolved.
        </p>
      </div>

      <div className="space-y-4">
        {duplicatePairs.map(({ primary, secondary }) => (
          <div
            key={primary.id}
            className="bg-white border border-slate-200 rounded-lg p-4 sm:p-6 space-y-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200">
              <div className="flex flex-wrap items-center gap-2">
                <GitCompare className="w-4 h-4 text-purple-700 shrink-0" />
                <span className="font-display font-semibold text-sm text-slate-900">
                  AI Similarity Confidence: {primary.duplicateConfidence}%
                </span>
                <span className="text-xs text-slate-500">
                  · Current Status:{' '}
                  <strong className="text-[#0B1F3A]">
                    {primary.reviewedStatus === 'Unreviewed'
                      ? 'Possible Duplicate'
                      : primary.reviewedStatus}
                  </strong>
                </span>
              </div>
              <span className="text-xs text-slate-500">
                Both records preserved in database (Zero Auto-Merge)
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-md bg-slate-50 border border-slate-200 space-y-1 text-xs">
                <div className="font-mono text-slate-500">{primary.rollNo} · Record A</div>
                <div className="font-display font-bold text-sm text-slate-900">
                  {primary.fullName}
                </div>
                <div className="text-slate-600">Programme: {primary.programme}</div>
                <div className="font-mono text-slate-700">
                  PEN: {maskIdentifier(primary.pen, 4)} · DOB: {primary.dob}
                </div>
                <div className="text-indigo-700 pt-1">{primary.aiIssueNote}</div>
              </div>

              <div className="p-4 rounded-md bg-slate-50 border border-slate-200 space-y-1 text-xs">
                <div className="font-mono text-slate-500">{secondary.rollNo} · Record B</div>
                <div className="font-display font-bold text-sm text-slate-900">
                  {secondary.fullName}
                </div>
                <div className="text-slate-600">Programme: {secondary.programme}</div>
                <div className="font-mono text-slate-700">
                  PEN: {maskIdentifier(secondary.pen, 4)} · DOB: {secondary.dob}
                </div>
                <div className="text-indigo-700 pt-1">{secondary.aiIssueNote}</div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
              <span className="text-xs font-semibold text-slate-600">
                Set Review Status (No Auto-Merge):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {statusButtons.map((statusOption) => {
                  const isCurrent =
                    primary.reviewedStatus === statusOption ||
                    (primary.reviewedStatus === 'Unreviewed' &&
                      statusOption === 'Possible Duplicate');
                  return (
                    <button
                      key={statusOption}
                      type="button"
                      onClick={() =>
                        markDuplicateDecision(primary.id, secondary.id, statusOption)
                      }
                      className={`px-3 py-1.5 text-xs font-medium rounded border transition-colors ${
                        isCurrent
                          ? 'bg-[#0B1F3A] text-white border-[#0B1F3A]'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {statusOption}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 4. Teacher Sub-page: Batch Readiness Export ("/teacher/export")
export const TeacherExportPage: React.FC = () => {
  const { students } = useApp();
  const [exportedMessage, setExportedMessage] = useState<string | null>(null);

  const handleSimulatedExport = (type: string) => {
    setExportedMessage(
      `Generated ${type} with ${students.length} fictional records (PEN & APAAR masked). Ready for local inspection.`
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs font-semibold text-teal-700">
          Pre-Submission Packaging · Demo Data
        </div>
        <h1 className="font-display text-2xl font-bold text-[#0B1F3A] mt-0.5">
          Batch Readiness &amp; Masked Audit Export
        </h1>
        <p className="text-xs text-slate-600 mt-1">
          Generate pre-validated CSV / JSON packets for Academic Bank of Credits (ABC) dry-run
          testing.
        </p>
      </div>

      {exportedMessage && (
        <div className="p-4 rounded-md bg-teal-50 border border-teal-200 text-xs text-teal-900 flex items-center justify-between">
          <span>{exportedMessage}</span>
          <button
            type="button"
            onClick={() => setExportedMessage(null)}
            className="font-semibold underline ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-4">
          <FileSpreadsheet className="w-6 h-6 text-teal-700" />
          <h2 className="font-display font-bold text-base text-slate-900">
            Masked Student Readiness Roster (CSV)
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Exports all {students.length} demo students with masked PENs, Simulated Verification
            statuses, and data quality scores for nodal committee sign-off.
          </p>
          <button
            type="button"
            onClick={() => handleSimulatedExport('Masked_Readiness_Roster_Demo.csv')}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded bg-[#0B1F3A] text-white hover:bg-slate-800"
          >
            <Download className="w-4 h-4" />
            <span>Prepare Masked CSV Packet (Demo)</span>
          </button>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-4">
          <Sparkles className="w-6 h-6 text-indigo-600" />
          <h2 className="font-display font-bold text-base text-slate-900">
            AI Exception &amp; Duplicate Audit Log (JSON)
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Exports only records marked &ldquo;Mismatch Flagged&rdquo; or &ldquo;Pending Official
            Verification&rdquo; along with human reviewer decisions.
          </p>
          <button
            type="button"
            onClick={() => handleSimulatedExport('AI_Exception_Audit_Demo.json')}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded border border-slate-300 text-slate-800 hover:bg-slate-50"
          >
            <Download className="w-4 h-4" />
            <span>Prepare Exception Report (Demo)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
