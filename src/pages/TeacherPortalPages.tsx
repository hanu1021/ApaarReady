import React, { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Building2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  FileSpreadsheet,
  Download,
  Upload,
  Search,
  Bell,
  ShieldCheck,
  UserCheck,
  ArrowLeftRight,
  TrendingUp,
  RotateCcw,
  FileWarning,
  BookOpen,
  Plus,
  Sparkles,
  Info,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';
import { useApp, RequestStatus } from '../context/AppContext';
import {
  maskIdentifier,
  formatUnmaskedIdentifier,
  buildSimulatedEducationHistory,
  StudentRecord,
} from '../data/mockData';
import { RULE_DICTIONARY_LIST } from './AddStudentWizard';
import { SmartNameComparisonCard } from '../utils/smartNameCheck';
import { CLASS_TEACHER_OPTIONS } from '../config/academicYears';

// ============================================================================
// 1. SCHOOL DASHBOARD (/teacher)
// Stat cards, grade-wise table (class/grade, boys, girls, transgender, total, incomplete students),
// status chips ("Data Entry Active", "Data Not Certified / Certified"),
// "Data last updated on" timestamp, and Academic Year switcher.
// ============================================================================
export const SchoolDashboardPage: React.FC = () => {
  const {
    students,
    programmes,
    selectedAcademicYear,
    setSelectedAcademicYear,
    academicYearsMeta,
    currentActiveAcademicYear,
    isReadOnlySnapshot,
    certification,
    activeWorkspace,
    session,
  } = useApp();

  const activeStudents = useMemo(
    () =>
      students.filter(
        (s) =>
          s.studentStatus !== 'Inactive' &&
          s.studentStatus !== 'Dropped Out' &&
          s.studentStatus !== 'Transferred (TC Issued)'
      ),
    [students]
  );

  // Scale snapshot slightly if previous year snapshot is selected
  const yearFactor = selectedAcademicYear === currentActiveAcademicYear ? 1 : 0.92;

  const gradeRows = useMemo(() => {
    const uniqueProgs = Array.from(new Set(programmes.map((p) => p.programmeName)));
    return uniqueProgs.map((progName, idx) => {
      const cohort = activeStudents.filter(
        (s) => s.programme === progName || s.className === progName
      );
      const boysRaw = cohort.filter((s) => s.gender === 'M').length;
      const girlsRaw = cohort.filter((s) => s.gender === 'F').length;
      const transRaw = cohort.filter((s) => s.gender === 'O').length;
      const cwsnRaw = cohort.filter((s) => s.cwsnDetails?.isCwsn).length;

      const boys = Math.max(1, Math.round(boysRaw * yearFactor));
      const girls = Math.max(1, Math.round(girlsRaw * yearFactor));
      const trans =
        selectedAcademicYear === currentActiveAcademicYear ? transRaw : idx % 3 === 0 ? 1 : 0;
      const total = boys + girls + trans;
      const incomplete =
        selectedAcademicYear === currentActiveAcademicYear
          ? cohort.filter((s) => s.verificationStatus !== 'Simulated Verification').length
          : Math.max(0, Math.floor(cohort.length * 0.05));

      return {
        progName,
        gradeLabel:
          activeWorkspace === 'school' ? progName : `Year ${(idx % 4) + 1} — ${progName}`,
        boys,
        girls,
        trans,
        total,
        incomplete,
        cwsnRaw,
      };
    });
  }, [
    activeStudents,
    programmes,
    selectedAcademicYear,
    currentActiveAcademicYear,
    yearFactor,
    activeWorkspace,
  ]);

  const totals = useMemo(() => {
    return gradeRows.reduce(
      (acc, r) => ({
        boys: acc.boys + r.boys,
        girls: acc.girls + r.girls,
        trans: acc.trans + r.trans,
        total: acc.total + r.total,
        incomplete: acc.incomplete + r.incomplete,
        cwsn: acc.cwsn + r.cwsnRaw,
      }),
      { boys: 0, girls: 0, trans: 0, total: 0, incomplete: 0, cwsn: 0 }
    );
  }, [gradeRows]);

  return (
    <div className="space-y-6 min-w-0">
      {/* Header with Status Chips, Timestamp, and Academic Year Switcher */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1.5 min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="font-semibold text-teal-800 bg-teal-50 border border-teal-200 px-2.5 py-0.5 rounded">
              Data Entry Active
            </span>
            <span
              className={`font-semibold px-2.5 py-0.5 rounded border ${
                certification.isCertified
                  ? 'bg-teal-50 border-teal-200 text-teal-800'
                  : 'bg-amber-50 border-amber-200 text-amber-800'
              }`}
            >
              {certification.isCertified ? 'Certified (Demo)' : 'Data Not Certified'}
            </span>
            <span className="text-slate-500 font-mono text-[11px]">
              Data last updated on: 24 Oct 2026, 14:20 IST
            </span>
          </div>

          <h1 className="font-display text-xl sm:text-2xl font-bold text-[#0B1F3A] break-words">
            {activeWorkspace === 'school'
              ? 'School Dashboard — Class 1–12 Enrolment & APAAR Readiness'
              : 'College Staff Dashboard — Programme Enrolment & APAAR Readiness'}
          </h1>
          <p className="text-xs text-slate-600">
            {session.institutionName} ({session.state}) ·{' '}
            {activeWorkspace === 'school' ? 'School Workspace' : 'College Workspace'} · Synthetic
            Demo Data
          </p>
        </div>

        {/* Academic Year Switcher */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <div className="text-xs">
            <label htmlFor="ay-switcher" className="block font-semibold text-slate-600 mb-1">
              Academic Year View
            </label>
            <select
              id="ay-switcher"
              value={selectedAcademicYear}
              onChange={(e) => setSelectedAcademicYear(e.target.value)}
              className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-mono font-semibold text-[#0B1F3A]"
            >
              {Object.values(academicYearsMeta).map((ay) => (
                <option key={ay.code} value={ay.code}>
                  {ay.selectorLabel}
                </option>
              ))}
            </select>
          </div>

          {!isReadOnlySnapshot ? (
            <Link
              to={
                activeWorkspace === 'school'
                  ? '/teacher/school/students/new'
                  : '/teacher/college/students/new'
              }
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-[#0B1F3A] text-white text-xs font-semibold hover:bg-slate-800"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Student</span>
            </Link>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-amber-100 border border-amber-300 text-amber-900 text-xs font-semibold">
              Snapshot · Editing Disabled
            </span>
          )}
        </div>
      </div>

      {/* 4 Responsive Stat Cards (1 col on phone, 2 on tablet, 4 on desktop) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-lg p-4 sm:p-5">
          <div className="text-xs font-medium text-slate-500">
            Total Active Students ({selectedAcademicYear})
          </div>
          <div className="mt-2 flex items-baseline justify-between font-mono tabular-nums">
            <span className="text-2xl sm:text-3xl font-bold text-[#0B1F3A]">
              {totals.total}
            </span>
            <span className="text-xs text-teal-700 font-semibold">
              {totals.boys}B · {totals.girls}G · {totals.trans}T
            </span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 text-xs text-slate-500">
            {activeWorkspace === 'school'
              ? 'Across Classes 1 to 12 & Sections A–C (Demo)'
              : 'Across engineering programmes & semesters (Demo)'}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 sm:p-5">
          <div className="flex items-center justify-between gap-1.5">
            <span className="text-xs font-semibold text-slate-700">
              Simulated Verification Ready
            </span>
            <div className="relative group">
              <button
                type="button"
                aria-label="Simulated Verification Ready formula"
                className="text-slate-400 hover:text-teal-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 rounded"
              >
                <Info className="w-3.5 h-3.5" />
              </button>
              <div
                role="tooltip"
                className="pointer-events-none absolute right-0 top-5 z-20 hidden group-hover:block group-focus-within:block w-64 p-2.5 rounded-md bg-[#0B1F3A] text-white text-[11px] leading-relaxed shadow-lg"
              >
                <strong className="text-teal-300 block mb-0.5">
                  Simulated Verification Ready Formula:
                </strong>
                (Students with Simulated Verification status ÷ Total Active Students) × 100 = (
                {totals.total - totals.incomplete} ÷ {totals.total}) × 100.
              </div>
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between font-mono tabular-nums">
            <span className="text-2xl sm:text-3xl font-bold text-teal-700">
              {totals.total > 0
                ? (((totals.total - totals.incomplete) / totals.total) * 100).toFixed(1)
                : 0}
              %
            </span>
            <span className="text-xs text-teal-700 font-semibold">
              {totals.total - totals.incomplete} / {totals.total} students
            </span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 text-xs text-teal-700">
            Complete &amp; Simulated Verified records
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 sm:p-5">
          <div className="text-xs font-medium text-slate-500">
            Incomplete / Pending Verification
          </div>
          <div className="mt-2 flex items-baseline justify-between font-mono tabular-nums">
            <span className="text-2xl sm:text-3xl font-bold text-amber-600">
              {totals.incomplete}
            </span>
            <span className="text-xs text-amber-700 font-semibold">Needs Review</span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 text-xs text-amber-700">
            Pending Official Verification or Missing APAAR
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 sm:p-5">
          <div className="text-xs font-medium text-slate-500">
            CWSN Inclusion &amp; Dropbox Roster
          </div>
          <div className="mt-2 flex items-baseline justify-between font-mono tabular-nums">
            <span className="text-2xl sm:text-3xl font-bold text-indigo-800">
              {totals.cwsn > 0 && totals.cwsn < 5 ? '< 5' : totals.cwsn}
            </span>
            <Link
              to={
                activeWorkspace === 'school'
                  ? '/teacher/school/dropbox'
                  : '/teacher/college/dropbox'
              }
              className="text-xs font-sans font-semibold text-indigo-700 hover:underline"
            >
              Dropbox ({students.length - activeStudents.length}) &rarr;
            </Link>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 text-xs text-slate-500">
            CWSN groups under 5 suppressed (&lt; 5) for privacy
          </div>
        </div>
      </div>

      {/* FEATURE 8: DATA QUALITY COACH CARD (Encouraging wording only, never ranks or shames) */}
      {(() => {
        const avgScore =
          activeStudents.length > 0
            ? Math.round(
                activeStudents.reduce((acc, s) => acc + s.dataQualityScore, 0) /
                  activeStudents.length
              )
            : 88;
        const missingApaarCount = activeStudents.filter((s) => !s.apaarId).length;
        const pendingConsentCount = activeStudents.filter(
          (s) => !s.apaarId && s.consentStatus !== 'obtained'
        ).length;
        const nameMismatchCount = activeStudents.filter(
          (s) => s.verificationStatus === 'Mismatch Flagged'
        ).length;

        const weeklyTrend = [
          { shortLabel: 'W1', fullLabel: 'Week 1 (Sep 20)', score: Math.max(70, avgScore - 9) },
          { shortLabel: 'W2', fullLabel: 'Week 2 (Sep 27)', score: Math.max(72, avgScore - 7) },
          { shortLabel: 'W3', fullLabel: 'Week 3 (Oct 04)', score: Math.max(75, avgScore - 5) },
          { shortLabel: 'W4', fullLabel: 'Week 4 (Oct 11)', score: Math.max(78, avgScore - 3) },
          { shortLabel: 'W5', fullLabel: 'Week 5 (Oct 18)', score: Math.max(80, avgScore - 1) },
          { shortLabel: 'W6', fullLabel: 'Week 6 (Current)', score: avgScore },
        ];

        return (
          <div className="bg-gradient-to-br from-indigo-950 via-[#0B1F3A] to-slate-900 text-white rounded-lg p-4 sm:p-6 border border-indigo-900/60 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              {/* Left: Score & Encouraging Plain-Language Explanation */}
              <div className="space-y-2 max-w-xl">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-[11px] font-semibold">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
                  <span>
                    {activeWorkspace === 'school'
                      ? 'School Data Quality Coach'
                      : 'College Data Quality Coach'}{' '}
                    · Supportive Self-Check
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-teal-200">
                    Data Quality Score
                  </span>
                  <div className="relative group">
                    <button
                      type="button"
                      aria-label="Data Quality Score formula"
                      className="text-indigo-200 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-300 rounded"
                    >
                      <Info className="w-3.5 h-3.5" />
                    </button>
                    <div
                      role="tooltip"
                      className="pointer-events-none absolute left-0 top-5 z-20 hidden group-hover:block group-focus-within:block w-72 p-2.5 rounded-md bg-slate-950 border border-slate-700 text-white text-[11px] leading-relaxed shadow-xl"
                    >
                      <strong className="text-teal-300 block mb-0.5">
                        Data Quality Score Formula:
                      </strong>
                      Mean weighted field completeness &amp; rule validation score across all active
                      students (Name 25% + DOB/Age 20% + PEN 20% + Consent/APAAR 20% + Class/Section
                      15%). Separate from Simulated Verification Ready %.
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap items-baseline gap-3">
                  <span className="font-mono text-3xl sm:text-4xl font-bold text-teal-300 tabular-nums">
                    {avgScore}%
                  </span>
                  <span className="text-sm font-semibold text-white">
                    Great steady progress this month! (+9% over 6 weeks)
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Your team has already completed strong foundational profiles for most students.
                  Completing a few remaining consent records and reviewing minor spelling variations
                  will help every student smoothly receive their academic registry benefits. This
                  coach is for your {activeWorkspace === 'school' ? 'school' : 'college'}&apos;s
                  internal readiness only—institutions are never ranked or compared punitively.
                </p>
              </div>

              {/* Middle: Top 3 Things to Fix with Direct Links */}
              <div className="flex-1 bg-white/5 border border-white/10 rounded-lg p-3.5 space-y-2.5">
                <div className="text-xs font-semibold text-indigo-200">
                  Top 3 Helpful Next Steps for Your Records
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between gap-2 bg-white/5 rounded px-3 py-2">
                    <div className="min-w-0">
                      <span className="font-semibold text-amber-300">
                        1. {missingApaarCount} students without an APAAR ID recorded yet
                      </span>
                      <div className="text-[11px] text-slate-300 truncate">
                        Check parent consent status ({pendingConsentCount} pending) and mark ready
                      </div>
                    </div>
                    <Link
                      to={
                        activeWorkspace === 'school'
                          ? '/teacher/school/apaar'
                          : '/teacher/college/apaar'
                      }
                      className="px-2.5 py-1 rounded bg-teal-600 hover:bg-teal-500 text-white font-semibold text-[11px] shrink-0"
                    >
                      Open APAAR Module &rarr;
                    </Link>
                  </div>

                  <div className="flex items-center justify-between gap-2 bg-white/5 rounded px-3 py-2">
                    <div className="min-w-0">
                      <span className="font-semibold text-indigo-200">
                        2. {nameMismatchCount} records with minor name or token variations
                      </span>
                      <div className="text-[11px] text-slate-300 truncate">
                        Use Smart Name-Mismatch Check to review initials or spelling order
                      </div>
                    </div>
                    <Link
                      to={
                        activeWorkspace === 'school'
                          ? '/teacher/school/name-update'
                          : '/teacher/college/name-update'
                      }
                      className="px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-[11px] shrink-0"
                    >
                      Review Names &rarr;
                    </Link>
                  </div>

                  <div className="flex items-center justify-between gap-2 bg-white/5 rounded px-3 py-2">
                    <div className="min-w-0">
                      <span className="font-semibold text-teal-200">
                        3. {totals.incomplete} records awaiting simulated verification
                      </span>
                      <div className="text-[11px] text-slate-300 truncate">
                        Filter incomplete records and standardize formatting in one click
                      </div>
                    </div>
                    <Link
                      to={
                        activeWorkspace === 'school'
                          ? '/teacher/school/students'
                          : '/teacher/college/students'
                      }
                      className="px-2.5 py-1 rounded bg-white/15 hover:bg-white/25 text-white font-semibold text-[11px] shrink-0"
                    >
                      Open Student List &rarr;
                    </Link>
                  </div>
                </div>
              </div>

              {/* Right: 6-Week Readiness Trend Bars (Abbreviated W1-W6, clear spacing, exact value tooltip) */}
              <div className="lg:w-64 bg-white/5 border border-white/10 rounded-lg p-4 flex flex-col justify-between shrink-0">
                <div className="flex items-center justify-between text-xs mb-3">
                  <span className="font-semibold text-indigo-200">6-Week Readiness Trend</span>
                  <TrendingUp className="w-4 h-4 text-teal-300" />
                </div>
                <div className="grid grid-cols-6 gap-2.5 items-end pt-1 pb-1">
                  {weeklyTrend.map((item, idx) => (
                    <div
                      key={item.shortLabel}
                      title={`${item.fullLabel}: ${item.score}% Simulated Readiness`}
                      className="flex flex-col items-center gap-1.5 cursor-help group"
                    >
                      <span className="font-mono text-[10px] font-semibold text-slate-200 leading-none group-hover:text-teal-300">
                        {item.score}%
                      </span>
                      <div className="w-full bg-white/10 rounded-t h-16 flex items-end overflow-hidden p-0.5">
                        <div
                          className={`w-full rounded-t transition-all ${
                            idx === weeklyTrend.length - 1 ? 'bg-teal-400' : 'bg-indigo-400/75'
                          }`}
                          style={{ height: `${Math.max(25, item.score)}%` }}
                        />
                      </div>
                      <span className="font-mono text-[10px] font-bold text-slate-300 leading-none pt-0.5">
                        {item.shortLabel}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-2.5 pt-2 border-t border-white/10 text-[10px] text-teal-300 text-center font-medium">
                  Hover bars for exact weekly figures · Demo data
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Grade-Wise / Programme-Wise Summary Table */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h2 className="font-display font-bold text-base text-[#0B1F3A]">
              {activeWorkspace === 'school'
                ? `Class-Wise Student Enrolment and Completeness Breakdown (${selectedAcademicYear})`
                : `Programme-Wise Student Enrolment and Completeness Breakdown (${selectedAcademicYear})`}
            </h2>
            <p className="text-xs text-slate-500">
              Boys, Girls, Transgender, Total Enrolled, and Incomplete / Pending Student Counts.
            </p>
          </div>
          <Link
            to={
              activeWorkspace === 'school'
                ? '/teacher/school/students'
                : '/teacher/college/students'
            }
            className="text-xs font-semibold text-indigo-700 hover:underline shrink-0"
          >
            Open Full Student List &rarr;
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-semibold text-slate-500 bg-slate-50">
                <th className="py-3 px-3">
                  {activeWorkspace === 'school' ? 'Class Cohort' : 'Programme Cohort'}
                </th>
                <th className="py-3 px-3 text-right">Boys</th>
                <th className="py-3 px-3 text-right">Girls</th>
                <th className="py-3 px-3 text-right">Transgender</th>
                <th className="py-3 px-3 text-right">Total Students</th>
                <th className="py-3 px-3 text-right">CWSN (Privacy Safe)</th>
                <th className="py-3 px-3 text-right">Incomplete / Pending</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-mono tabular-nums">
              {gradeRows.map((row) => (
                <tr key={row.gradeLabel} className="hover:bg-slate-50">
                  <td className="py-3 px-3 font-sans font-medium text-slate-900">
                    {row.gradeLabel}
                  </td>
                  <td className="py-3 px-3 text-right text-slate-700">{row.boys}</td>
                  <td className="py-3 px-3 text-right text-slate-700">{row.girls}</td>
                  <td className="py-3 px-3 text-right text-slate-700">{row.trans}</td>
                  <td className="py-3 px-3 text-right font-semibold text-[#0B1F3A]">
                    {row.total}
                  </td>
                  <td className="py-3 px-3 text-right text-indigo-800 font-semibold">
                    {row.cwsnRaw === 0 ? '0' : row.cwsnRaw < 5 ? '< 5' : row.cwsnRaw}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <span
                      className={`font-semibold ${
                        row.incomplete > 0 ? 'text-amber-700' : 'text-teal-700'
                      }`}
                    >
                      {row.incomplete}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-sans">
                    <Link
                      to={
                        activeWorkspace === 'school'
                          ? '/teacher/school/students'
                          : '/teacher/college/students'
                      }
                      className="text-indigo-700 hover:underline font-medium"
                    >
                      View Cohort
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-300 bg-slate-50 font-mono tabular-nums font-bold text-xs text-[#0B1F3A]">
                <td className="py-3 px-3 font-sans">Grand Total ({selectedAcademicYear})</td>
                <td className="py-3 px-3 text-right">{totals.boys}</td>
                <td className="py-3 px-3 text-right">{totals.girls}</td>
                <td className="py-3 px-3 text-right">{totals.trans}</td>
                <td className="py-3 px-3 text-right">{totals.total}</td>
                <td className="py-3 px-3 text-right text-indigo-800">
                  {totals.cwsn > 0 && totals.cwsn < 5 ? '< 5' : totals.cwsn}
                </td>
                <td className="py-3 px-3 text-right text-amber-700">{totals.incomplete}</td>
                <td className="py-3 px-3 text-right" />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 2. SCHOOL / COLLEGE DETAILS GROUP
// - Institution Profile (/teacher/school/profile & /school-management/profile)
// - Classes/Programmes and Sections (/teacher/school/programmes & /school-management/classes-sections)
// - Approved Intake (/teacher/school/intake & /school-management/approved-intake)
// ============================================================================
export const SchoolProfilePage: React.FC = () => {
  const { institutions, activeWorkspace, session } = useApp();
  const isSchool = activeWorkspace === 'school';
  const inst =
    institutions.find((i) => i.id === session.institutionId) || institutions[0];

  return (
    <div className="space-y-6 min-w-0">
      <div>
        <div className="text-xs font-semibold text-teal-700">
          {isSchool ? 'School Details · UDISE+ Sandbox' : 'College Details · AISHE Sandbox'} · Demo
          Data
        </div>
        <h1 className="font-display text-xl sm:text-2xl font-bold text-[#0B1F3A] break-words">
          Institution Profile &amp; Registration Attributes
        </h1>
        <p className="text-xs text-slate-600 mt-1">
          Displays fictional {isSchool ? 'UDISE+' : 'AISHE'} code with source attribution,
          instruction medium, management category, and nodal officer contact details.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-3 text-xs">
          <h2 className="font-display font-bold text-sm text-[#0B1F3A] border-b border-slate-100 pb-2">
            1. Primary Institutional Identifiers (Synthetic)
          </h2>
          <dl className="space-y-2.5">
            <div className="flex justify-between gap-2">
              <dt className="text-slate-500">
                {isSchool ? 'School Name:' : 'College Name:'}
              </dt>
              <dd className="font-semibold text-slate-900 text-right">{inst.name}</dd>
            </div>
            <div className="flex justify-between items-center gap-2">
              <dt className="text-slate-500">
                {isSchool ? 'UDISE Code (Fictional):' : 'AISHE Code (Fictional):'}
              </dt>
              <dd className="flex items-center gap-1.5">
                <span className="font-mono font-bold text-slate-900">{inst.aisheCode}</span>
                <span className="px-1.5 py-0.5 rounded bg-teal-50 border border-teal-200 text-teal-800 font-mono text-[10px] font-semibold">
                  Source: {isSchool ? 'UDISE+ Demo Seed' : 'AISHE Demo Seed'}
                </span>
              </dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-slate-500">Institution Type:</dt>
              <dd className="text-slate-900 text-right font-medium">{inst.type}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-slate-500">Management Type:</dt>
              <dd className="text-slate-900 text-right font-medium">
                {isSchool
                  ? 'Private Unaided / State Board Recognised (Demo)'
                  : 'State Autonomous / University Affiliated (Demo)'}
              </dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-slate-500">Medium of Instruction:</dt>
              <dd className="text-slate-900 text-right font-medium">
                {isSchool ? 'English, Telugu & Hindi' : 'English'}
              </dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-slate-500">State &amp; District:</dt>
              <dd className="text-slate-900 font-medium">
                {inst.district}, {inst.state}
              </dd>
            </div>
          </dl>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-3 text-xs">
          <h2 className="font-display font-bold text-sm text-[#0B1F3A] border-b border-slate-100 pb-2">
            2. APAAR &amp; Registry Nodal Governance (Demo)
          </h2>
          <dl className="space-y-2.5">
            <div className="flex justify-between gap-2">
              <dt className="text-slate-500">Head of Institution:</dt>
              <dd className="font-semibold text-slate-900">Prof. Rajeshwar Rao</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-slate-500">Nodal Officer:</dt>
              <dd className="font-semibold text-slate-900">Dr. Kavitha Narayanan</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-slate-500">Designation:</dt>
              <dd className="text-slate-900">
                {isSchool
                  ? 'Senior Teacher & UDISE+/APAAR Nodal Coordinator'
                  : 'Associate Professor & AISHE/ABC Nodal Coordinator'}
              </dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-slate-500">Official Sandbox Email:</dt>
              <dd className="font-mono text-slate-900">
                {isSchool ? 'nodal.dps.hyd@demo.edu.in' : 'nodal.diet.ts@demo.edu.in'}
              </dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-slate-500">Verification Mode:</dt>
              <dd className="text-teal-700 font-semibold">Simulated Verification Only</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
};

export const SchoolProgrammesSectionsPage: React.FC = () => {
  const {
    programmes,
    students,
    managedSections,
    createManagedSection,
    renameManagedSection,
    updateManagedSectionMeta,
    archiveManagedSection,
    restoreManagedSection,
    isReadOnlySnapshot,
    activeWorkspace,
  } = useApp();

  const isSchool = activeWorkspace === 'school';
  const [newProgId, setNewProgId] = useState(programmes[0]?.id || 'PRG-TS-CSE');
  const [newSectionName, setNewSectionName] = useState('');
  const [newCapacity, setNewCapacity] = useState(isSchool ? 40 : 60);
  const [newTeacher, setNewTeacher] = useState(CLASS_TEACHER_OPTIONS[0]);
  const [editingSecId, setEditingSecId] = useState<string | null>(null);
  const [renameDraft, setRenameDraft] = useState('');
  const [archiveErrorMsg, setArchiveErrorMsg] = useState<string | null>(null);

  const handleCreateSection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSectionName.trim() || isReadOnlySnapshot) return;
    const foundProg = programmes.find((p) => p.id === newProgId) || programmes[0];
    createManagedSection({
      programmeName: foundProg.programmeName,
      department: foundProg.department,
      sectionName: newSectionName.trim(),
      capacity: Math.max(10, Number(newCapacity) || 40),
      classTeacher: newTeacher,
    });
    setNewSectionName('');
    setArchiveErrorMsg(null);
  };

  const handleTryArchive = (sectionId: string) => {
    const res = archiveManagedSection(sectionId);
    if (!res.success) {
      setArchiveErrorMsg(res.message);
    } else {
      setArchiveErrorMsg(null);
    }
  };

  return (
    <div className="space-y-6 min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="text-xs font-semibold text-teal-700">
            {isSchool ? 'School Classes & Sections' : 'College Programmes & Sections'} · Demo Data
          </div>
          <h1 className="font-display text-xl sm:text-2xl font-bold text-[#0B1F3A] break-words">
            {isSchool
              ? 'Classes (1–12) and Classroom Sections Management'
              : 'Programmes and Classroom Sections Management'}
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Create, rename, and archive {isSchool ? 'classes' : 'programmes'} and sections, set
            section capacity, and assign a class teacher. Archiving never deletes students.
          </p>
        </div>
      </div>

      {archiveErrorMsg && (
        <div
          role="alert"
          className="p-4 rounded-lg bg-red-50 border border-red-200 text-xs text-red-900 flex items-start justify-between gap-3"
        >
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold">Section Archiving Blocked — Active Students Enrolled</div>
              <p className="mt-0.5">{archiveErrorMsg}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setArchiveErrorMsg(null)}
            className="underline font-semibold shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Create New Section Card */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 sm:p-5 space-y-3">
        <h2 className="font-display font-bold text-sm text-[#0B1F3A]">
          Create New Classroom Section
        </h2>
        <form
          onSubmit={handleCreateSection}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs items-end"
        >
          <div className="lg:col-span-2">
            <label className="block font-semibold text-slate-700 mb-1">
              {isSchool ? 'Class (1 to 12)' : 'Programme'}
            </label>
            <select
              value={newProgId}
              onChange={(e) => setNewProgId(e.target.value)}
              disabled={isReadOnlySnapshot}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs"
            >
              {programmes.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.programmeName} ({p.department})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Section Name</label>
            <input
              type="text"
              required
              disabled={isReadOnlySnapshot}
              value={newSectionName}
              onChange={(e) => setNewSectionName(e.target.value)}
              placeholder="e.g. Section D"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-xs"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Capacity &amp; Teacher</label>
            <div className="flex gap-1.5">
              <input
                type="number"
                min={10}
                max={180}
                disabled={isReadOnlySnapshot}
                value={newCapacity}
                onChange={(e) => setNewCapacity(Number(e.target.value))}
                className="w-20 rounded-md border border-slate-300 px-2 py-2 text-xs font-mono"
                title="Section Seat Capacity"
              />
              <select
                value={newTeacher}
                disabled={isReadOnlySnapshot}
                onChange={(e) => setNewTeacher(e.target.value)}
                className="flex-1 rounded-md border border-slate-300 bg-white px-2 py-2 text-xs truncate"
              >
                {CLASS_TEACHER_OPTIONS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isReadOnlySnapshot || !newSectionName.trim()}
              className="w-full px-4 py-2 rounded-md bg-[#0B1F3A] text-white font-semibold text-xs hover:bg-slate-800 disabled:opacity-40"
            >
              + Create Section
            </button>
          </div>
        </form>
      </div>

      {/* Managed Sections Table */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 sm:p-6 overflow-x-auto space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-sm text-[#0B1F3A]">
            Managed {isSchool ? 'Classes' : 'Programmes'} &amp; Sections ({managedSections.length})
          </h2>
          <span className="text-[11px] text-slate-500">
            Archiving never deletes students · Sections with active students cannot be archived
          </span>
        </div>

        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 text-[11px] font-semibold text-slate-500 bg-slate-50">
              <th className="py-3 px-3">{isSchool ? 'Class & Wing' : 'Programme & Dept'}</th>
              <th className="py-3 px-3">Section Name</th>
              <th className="py-3 px-3">Assigned Class Teacher</th>
              <th className="py-3 px-3 text-right">Section Capacity</th>
              <th className="py-3 px-3 text-right">Active Students</th>
              <th className="py-3 px-3">Status</th>
              <th className="py-3 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {managedSections.map((sec) => {
              const activeCount = students.filter(
                (s) =>
                  s.programme === sec.programmeName &&
                  (s.section || 'Section A') === sec.sectionName &&
                  s.studentStatus === 'Active'
              ).length;
              const isEditing = editingSecId === sec.id;

              return (
                <tr
                  key={sec.id}
                  className={sec.isArchived ? 'bg-slate-50 text-slate-400' : 'hover:bg-slate-50'}
                >
                  <td className="py-3 px-3 font-medium text-slate-900">
                    <div>{sec.programmeName}</div>
                    <div className="text-[11px] text-slate-500">{sec.department}</div>
                  </td>

                  <td className="py-3 px-3 font-semibold text-[#0B1F3A]">
                    {isEditing ? (
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          value={renameDraft}
                          onChange={(e) => setRenameDraft(e.target.value)}
                          className="rounded border border-slate-300 px-2 py-1 text-xs text-slate-900"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (renameDraft.trim()) {
                              renameManagedSection(sec.id, renameDraft.trim());
                            }
                            setEditingSecId(null);
                          }}
                          className="px-2 py-1 rounded bg-teal-700 text-white text-[11px]"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      sec.sectionName
                    )}
                  </td>

                  <td className="py-3 px-3">
                    <select
                      disabled={isReadOnlySnapshot || sec.isArchived}
                      value={sec.classTeacher}
                      onChange={(e) =>
                        updateManagedSectionMeta(sec.id, sec.capacity, e.target.value)
                      }
                      className="rounded border border-slate-200 bg-white px-2 py-1 text-xs text-slate-800"
                    >
                      {CLASS_TEACHER_OPTIONS.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td className="py-3 px-3 text-right font-mono">
                    <input
                      type="number"
                      min={10}
                      max={200}
                      disabled={isReadOnlySnapshot || sec.isArchived}
                      value={sec.capacity}
                      onChange={(e) =>
                        updateManagedSectionMeta(
                          sec.id,
                          Math.max(10, Number(e.target.value) || 40),
                          sec.classTeacher
                        )
                      }
                      className="w-16 text-right rounded border border-slate-200 px-2 py-1 text-xs font-mono text-slate-900"
                    />
                  </td>

                  <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                    {activeCount} / {sec.capacity}
                  </td>

                  <td className="py-3 px-3">
                    {sec.isArchived ? (
                      <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 text-[11px] font-semibold">
                        Archived
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-teal-50 border border-teal-200 text-teal-800 text-[11px] font-semibold">
                        Active
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-3 text-right whitespace-nowrap space-x-1.5">
                    {!sec.isArchived ? (
                      <>
                        <button
                          type="button"
                          disabled={isReadOnlySnapshot}
                          onClick={() => {
                            setEditingSecId(sec.id);
                            setRenameDraft(sec.sectionName);
                          }}
                          className="px-2.5 py-1 rounded border border-slate-300 text-slate-700 hover:bg-slate-100 text-[11px] font-semibold disabled:opacity-40"
                        >
                          Rename
                        </button>
                        <button
                          type="button"
                          disabled={isReadOnlySnapshot}
                          onClick={() => handleTryArchive(sec.id)}
                          className="px-2.5 py-1 rounded border border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100 text-[11px] font-semibold disabled:opacity-40"
                        >
                          Archive
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        disabled={isReadOnlySnapshot}
                        onClick={() => restoreManagedSection(sec.id)}
                        className="px-2.5 py-1 rounded bg-teal-700 text-white text-[11px] font-semibold"
                      >
                        Restore
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const SchoolApprovedIntakePage: React.FC = () => {
  const {
    programmes,
    activeWorkspace,
    selectedAcademicYear,
    session,
    addAuditLog,
    addToast,
    isReadOnlySnapshot,
  } = useApp();
  const isSchool = activeWorkspace === 'school';

  const [intakeOverrides, setIntakeOverrides] = useState<Record<string, number>>({});
  const [selectedProgId, setSelectedProgId] = useState<string>(programmes[0]?.id || '');
  const [proposedIntake, setProposedIntake] = useState<string>('45');
  const [changeReason, setChangeReason] = useState<string>('');
  const [changeHistory, setChangeHistory] = useState<
    Array<{
      id: string;
      timestamp: string;
      classOrProgramme: string;
      year: string;
      oldIntake: number;
      newIntake: number;
      reason: string;
      actor: string;
      sourceBadge: string;
    }>
  >([
    {
      id: 'ICH-26-01',
      timestamp: '2026-04-10 10:15',
      classOrProgramme: isSchool ? 'Class 5' : 'B.Tech Computer Science & Engineering',
      year: '2026-27',
      oldIntake: isSchool ? 35 : 150,
      newIntake: isSchool ? 40 : 180,
      reason: isSchool
        ? 'DEO section expansion sanction order for Academic Session 2026-27'
        : 'AICTE Extension of Approval (EoA) 2026-27 intake revision',
      actor: 'Prof. Rajeshwar Rao',
      sourceBadge: isSchool ? 'State DEO Order (Demo)' : 'AICTE EoA Seed (Demo)',
    },
  ]);

  const handleUpdateIntake = (e: React.FormEvent) => {
    e.preventDefault();
    if (!changeReason.trim()) {
      addToast('A reason is required to record an Approved Intake change.', 'warning');
      return;
    }
    const targetProg = programmes.find((p) => p.id === selectedProgId) || programmes[0];
    if (!targetProg) return;
    const oldVal = intakeOverrides[targetProg.id] ?? targetProg.approvedIntake;
    const newVal = Math.max(5, parseInt(proposedIntake, 10) || oldVal);

    setIntakeOverrides((prev) => ({ ...prev, [targetProg.id]: newVal }));
    const entry = {
      id: `ICH-26-0${changeHistory.length + 1}`,
      timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
      classOrProgramme: targetProg.programmeName,
      year: selectedAcademicYear,
      oldIntake: oldVal,
      newIntake: newVal,
      reason: changeReason.trim(),
      actor: session.userName,
      sourceBadge: 'Manually Entered (Audit Logged)',
    };
    setChangeHistory((prev) => [entry, ...prev]);
    addAuditLog({
      actor: session.userName,
      role: session.roleDisplayLabel || session.designation,
      action: 'APPROVED_INTAKE_UPDATED',
      targetStudentId: targetProg.id,
      details: `Updated approved intake for ${targetProg.programmeName} (${selectedAcademicYear}) from ${oldVal} to ${newVal}. Reason: "${changeReason.trim()}"`,
    });
    addToast(`Approved intake updated for ${targetProg.programmeName}.`, 'success');
    setChangeReason('');
  };

  return (
    <div className="space-y-6 min-w-0">
      <div>
        <div className="text-xs font-semibold text-teal-700">
          {isSchool ? 'School Sanctioned Class Capacity' : 'College Sanctioned Programme Intake'} ·{' '}
          {selectedAcademicYear} · Demo Data
        </div>
        <h1 className="font-display text-xl sm:text-2xl font-bold text-[#0B1F3A] break-words">
          Approved Intake per {isSchool ? 'Class' : 'Programme'} &amp; Change History (
          {selectedAcademicYear})
        </h1>
        <p className="text-xs text-slate-600 mt-1">
          Displays approved intake ceilings with source badges, flags over-intake cohorts, and
          records every revision with a mandatory governance reason.
        </p>
      </div>

      {/* Approved Intake Table with Source Badges */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 sm:p-6 overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 text-[11px] font-semibold text-slate-500 bg-slate-50">
              <th className="py-3 px-3">{isSchool ? 'Class' : 'Programme'}</th>
              <th className="py-3 px-3">Academic Year</th>
              <th className="py-3 px-3">Source Badge</th>
              <th className="py-3 px-3 text-right">Approved Intake</th>
              <th className="py-3 px-3 text-right">Actual Enrolment</th>
              <th className="py-3 px-3 text-right">Variance</th>
              <th className="py-3 px-3">Intake Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {programmes.map((p) => {
              const effectiveApproved = intakeOverrides[p.id] ?? p.approvedIntake;
              const diff = p.actualEnrolment - effectiveApproved;
              const hasOverride = intakeOverrides[p.id] !== undefined;
              return (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="py-3 px-3 font-semibold text-slate-900">{p.programmeName}</td>
                  <td className="py-3 px-3 font-mono text-slate-700">{selectedAcademicYear}</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 font-mono text-[10px] text-slate-700">
                      {hasOverride
                        ? 'Manually Updated (Audit)'
                        : isSchool
                        ? 'UDISE+ Sanction (Demo)'
                        : 'AICTE EoA Seed (Demo)'}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-mono tabular-nums font-bold text-[#0B1F3A]">
                    {effectiveApproved}
                  </td>
                  <td className="py-3 px-3 text-right font-mono tabular-nums font-semibold">
                    {p.actualEnrolment}
                  </td>
                  <td
                    className={`py-3 px-3 text-right font-mono tabular-nums font-semibold ${
                      diff > 0 ? 'text-red-600' : 'text-teal-700'
                    }`}
                  >
                    {diff > 0 ? `+${diff} Over` : diff === 0 ? 'Exact' : `${Math.abs(diff)} Left`}
                  </td>
                  <td className="py-3 px-3">
                    {diff > 0 ? (
                      <span className="text-red-600 font-semibold">
                        Over Sanctioned Intake (Alert)
                      </span>
                    ) : (
                      <span className="text-teal-700 font-semibold">Within Ceiling</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Record Intake Revision (Reason Required) + Change History Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-xs">
        <form
          onSubmit={handleUpdateIntake}
          className="lg:col-span-5 bg-white border border-slate-200 rounded-lg p-5 space-y-3"
        >
          <h2 className="font-display font-bold text-sm text-[#0B1F3A]">
            Record Approved Intake Revision (Reason Required)
          </h2>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Select {isSchool ? 'Class' : 'Programme'}
            </label>
            <select
              value={selectedProgId}
              disabled={isReadOnlySnapshot}
              onChange={(e) => setSelectedProgId(e.target.value)}
              className="w-full rounded border border-slate-300 bg-white px-3 py-2"
            >
              {programmes.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.programmeName} (Current: {intakeOverrides[p.id] ?? p.approvedIntake})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              New Approved Intake ({selectedAcademicYear})
            </label>
            <input
              type="number"
              min={5}
              max={500}
              required
              disabled={isReadOnlySnapshot}
              value={proposedIntake}
              onChange={(e) => setProposedIntake(e.target.value)}
              className="w-full rounded border border-slate-300 px-3 py-2 font-mono"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Mandatory Governance Reason / Sanction Reference
            </label>
            <textarea
              rows={2}
              required
              disabled={isReadOnlySnapshot}
              value={changeReason}
              onChange={(e) => setChangeReason(e.target.value)}
              placeholder="Enter DEO / Board / AICTE sanction order reference..."
              className="w-full rounded border border-slate-300 px-3 py-2"
            />
          </div>
          <button
            type="submit"
            disabled={isReadOnlySnapshot}
            className="w-full py-2 px-4 rounded bg-[#0B1F3A] text-white font-semibold hover:bg-slate-800 disabled:opacity-40"
          >
            Save Intake Revision &amp; Log Reason
          </button>
        </form>

        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-lg p-5 space-y-3 overflow-x-auto">
          <h2 className="font-display font-bold text-sm text-[#0B1F3A]">
            Approved Intake Change History ({changeHistory.length})
          </h2>
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-semibold text-slate-500 bg-slate-50">
                <th className="py-2 px-2.5">Timestamp &amp; Actor</th>
                <th className="py-2 px-2.5">{isSchool ? 'Class' : 'Programme'}</th>
                <th className="py-2 px-2.5">Change</th>
                <th className="py-2 px-2.5">Recorded Reason &amp; Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {changeHistory.map((ch) => (
                <tr key={ch.id}>
                  <td className="py-2.5 px-2.5 whitespace-nowrap">
                    <div className="font-mono font-semibold text-slate-900">{ch.timestamp}</div>
                    <div className="text-[11px] text-slate-500">{ch.actor}</div>
                  </td>
                  <td className="py-2.5 px-2.5 font-semibold text-[#0B1F3A]">
                    {ch.classOrProgramme} ({ch.year})
                  </td>
                  <td className="py-2.5 px-2.5 font-mono font-bold text-teal-800 whitespace-nowrap">
                    {ch.oldIntake} &rarr; {ch.newIntake}
                  </td>
                  <td className="py-2.5 px-2.5">
                    <div className="text-slate-800">{ch.reason}</div>
                    <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                      {ch.sourceBadge}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 3. REQUEST MANAGEMENT (/teacher/requests)
// List of requests (name change, correction, transfer) with status flow:
// Open -> Under Review -> Approved / Rejected
// ============================================================================
export const RequestManagementPage: React.FC = () => {
  const { requests, updateRequestStatus } = useApp();
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const filtered =
    filterStatus === 'ALL'
      ? requests
      : requests.filter((r) => r.status === filterStatus);

  return (
    <div className="space-y-6 min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="text-xs font-semibold text-teal-700">
            Nodal Workflow Queue · Demo Data
          </div>
          <h1 className="font-display text-xl sm:text-2xl font-bold text-[#0B1F3A] break-words">
            Request Management (Name Change, Correction &amp; Transfer)
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Review and transition student modification requests through Open, Under Review,
            Approved, or Rejected states (Simulated).
          </p>
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700"
        >
          <option value="ALL">All Requests ({requests.length})</option>
          <option value="Open">Open</option>
          <option value="Under Review">Under Review</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-4 sm:p-6 overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 text-[11px] font-semibold text-slate-500 bg-slate-50">
              <th className="py-3 px-3">Request ID &amp; Date</th>
              <th className="py-3 px-3">Student &amp; Roll No</th>
              <th className="py-3 px-3">Type</th>
              <th className="py-3 px-3">Current vs Requested Value</th>
              <th className="py-3 px-3">Status</th>
              <th className="py-3 px-3 text-right">Workflow Actions (Simulated)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filtered.map((req) => (
              <tr key={req.id} className="hover:bg-slate-50 align-top">
                <td className="py-3 px-3 font-mono whitespace-nowrap">
                  <div className="font-semibold text-slate-900">{req.id}</div>
                  <div className="text-[11px] text-slate-500">{req.submittedOn}</div>
                </td>
                <td className="py-3 px-3">
                  <div className="font-semibold text-slate-900">{req.studentName}</div>
                  <div className="font-mono text-[11px] text-slate-500">{req.rollNo}</div>
                </td>
                <td className="py-3 px-3 font-medium text-slate-800">{req.requestType}</td>
                <td className="py-3 px-3">
                  <div className="text-slate-500">
                    Current: <span className="text-slate-800 font-medium">{req.currentValue}</span>
                  </div>
                  <div className="text-teal-800 font-semibold mt-0.5">
                    Proposed: {req.requestedValue}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Reason: {req.reason}</div>
                </td>
                <td className="py-3 px-3 whitespace-nowrap font-semibold">
                  <span
                    className={
                      req.status === 'Approved'
                        ? 'text-teal-700'
                        : req.status === 'Rejected'
                        ? 'text-red-600'
                        : req.status === 'Under Review'
                        ? 'text-indigo-700'
                        : 'text-amber-700'
                    }
                  >
                    {req.status}
                  </span>
                </td>
                <td className="py-3 px-3 text-right whitespace-nowrap">
                  <div className="inline-flex flex-wrap justify-end gap-1">
                    {(['Open', 'Under Review', 'Approved', 'Rejected'] as RequestStatus[]).map(
                      (st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => updateRequestStatus(req.id, st)}
                          className={`px-2 py-1 rounded text-[11px] font-medium border transition-colors ${
                            req.status === st
                              ? 'bg-[#0B1F3A] text-white border-[#0B1F3A]'
                              : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                          }`}
                        >
                          {st}
                        </button>
                      )
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ============================================================================
// 4. STUDENT NAME UPDATE (/teacher/name-update)
// Search a student, show current name vs name as per Aadhaar (simulated),
// submit a correction request with a reason. Never overwrite the name directly.
// ============================================================================
export const StudentNameUpdatePage: React.FC = () => {
  const { students, submitNameUpdateRequest } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('STU-1002');
  const [proposedName, setProposedName] = useState('Karthikeya Varma');
  const [reason, setReason] = useState(
    'Align school admission register spelling with simulated Aadhaar card token.'
  );
  const [submittedNotice, setSubmittedNotice] = useState<string | null>(null);

  const matchingStudents = useMemo(() => {
    return students
      .filter(
        (s) =>
          s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.rollNo.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .slice(0, 12);
  }, [students, searchQuery]);

  const selectedStudent =
    students.find((s) => s.id === selectedStudentId) || students[0];

  const handleSelectStudent = (id: string) => {
    setSelectedStudentId(id);
    const found = students.find((s) => s.id === id);
    if (found) {
      setProposedName(found.nameAsPerAadhaarSim || found.fullName);
    }
    setSubmittedNotice(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !proposedName.trim() || !reason.trim()) return;
    submitNameUpdateRequest(selectedStudent.id, proposedName.trim(), reason.trim());
    setSubmittedNotice(
      `Submitted Name Update Request for ${selectedStudent.rollNo}. Current school record ("${selectedStudent.fullName}") was NOT overwritten directly and is queued in Request Management.`
    );
  };

  return (
    <div className="space-y-6 min-w-0">
      <div>
        <div className="text-xs font-semibold text-teal-700">
          Non-Destructive Name Governance · Demo Data
        </div>
        <h1 className="font-display text-xl sm:text-2xl font-bold text-[#0B1F3A] break-words">
          Student Name Update (Request-Only Workflow)
        </h1>
        <p className="text-xs text-slate-600 mt-1">
          Search a student, compare the School Record Name against the Name as per Aadhaar
          (Simulated), and submit a formal correction request. Never overwrites the name directly.
        </p>
      </div>

      {submittedNotice && (
        <div className="p-4 rounded-md bg-teal-50 border border-teal-200 text-xs text-teal-950 flex items-center justify-between gap-2">
          <span>{submittedNotice}</span>
          <Link to="/teacher/requests" className="font-semibold underline shrink-0">
            View in Request Management &rarr;
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Search & Pick Student */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-lg p-4 sm:p-5 space-y-3">
          <label className="block text-xs font-semibold text-slate-700">
            1. Search Student by Name or Roll No
          </label>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search student..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-md border border-slate-300"
            />
          </div>

          <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-md">
            {matchingStudents.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => handleSelectStudent(s.id)}
                className={`w-full text-left px-3 py-2.5 text-xs transition-colors flex items-center justify-between ${
                  s.id === selectedStudent.id
                    ? 'bg-[#0B1F3A] text-white'
                    : 'hover:bg-slate-50 text-slate-800'
                }`}
              >
                <div className="truncate pr-2">
                  <div className="font-semibold truncate">{s.fullName}</div>
                  <div
                    className={`font-mono text-[11px] ${
                      s.id === selectedStudent.id ? 'text-slate-300' : 'text-slate-500'
                    }`}
                  >
                    {s.rollNo} · PEN: {maskIdentifier(s.pen, 4)}
                  </div>
                </div>
                <span className="text-[11px] font-mono shrink-0">{s.id}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Side-by-Side Name Comparison & Request Submission */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-lg p-4 sm:p-6 space-y-5">
          <div className="border-b border-slate-200 pb-3">
            <div className="text-xs font-mono text-slate-500">
              Selected Student: {selectedStudent.rollNo} ({selectedStudent.id})
            </div>
            <h2 className="font-display font-bold text-base text-[#0B1F3A] mt-0.5">
              2. Compare Current Name vs Name as per Aadhaar (Simulated)
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-md bg-slate-50 border border-slate-200">
              <div className="text-slate-500 font-medium">
                Current Name (School Record 4.1.1)
              </div>
              <div className="font-display font-bold text-sm text-slate-900 mt-1">
                {selectedStudent.fullName}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Immutable until request is approved
              </div>
            </div>

            <div className="p-3.5 rounded-md bg-indigo-50/60 border border-indigo-200">
              <div className="text-indigo-800 font-medium">
                Name as per Aadhaar Card (Simulated 4.1.8)
              </div>
              <div className="font-display font-bold text-sm text-indigo-950 mt-1">
                {selectedStudent.nameAsPerAadhaarSim || selectedStudent.fullName}
              </div>
              <div className="text-[11px] text-indigo-700 mt-1">
                Simulated eKYC token reference
              </div>
            </div>
          </div>

          {/* FEATURE 1: SMART NAME-MISMATCH CHECK */}
          <SmartNameComparisonCard
            schoolName={selectedStudent.fullName}
            aadhaarName={proposedName || selectedStudent.nameAsPerAadhaarSim || selectedStudent.fullName}
            onOpenCorrectionRequest={() => {
              const inputEl = document.getElementById('proposed-name-input');
              if (inputEl) {
                inputEl.focus();
                inputEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
            }}
          />

          {/* Quick Demo Variants to Test Smart Name-Mismatch Check */}
          <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
            <span className="text-slate-500 font-semibold">Try demo comparison on proposed field:</span>
            <button
              type="button"
              onClick={() => setProposedName('K. Karthikeya Varma')}
              className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
            >
              Initials (K. Varma)
            </button>
            <button
              type="button"
              onClick={() =>
                setProposedName(
                  selectedStudent.fullName.split(' ').reverse().join(' ')
                )
              }
              className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
            >
              Surname-First Order
            </button>
            <button
              type="button"
              onClick={() => setProposedName(selectedStudent.fullName.replace(/y/gi, 'i'))}
              className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
            >
              Spelling Variant (y/i)
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label htmlFor="proposed-name-input" className="block font-semibold text-slate-700 mb-1">
                Proposed Corrected Name for Request Queue
              </label>
              <input
                id="proposed-name-input"
                type="text"
                required
                value={proposedName}
                onChange={(e) => setProposedName(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3.5 py-2 text-sm text-slate-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Reason &amp; Documentary Evidence Reference
              </label>
              <textarea
                rows={2}
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3.5 py-2 text-xs text-slate-900"
              />
            </div>

            <button
              type="submit"
              className="px-4 py-2.5 rounded-md bg-[#0B1F3A] text-white font-semibold text-xs hover:bg-slate-800"
            >
              Submit Name Correction Request (Do Not Overwrite Directly)
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 6. APAAR MODULE (/teacher/apaar)
// Students grouped by APAAR status (not recorded, recorded and pending official verification,
// simulated verified), consent status, a "no APAAR ID yet" checklist,
// bulk "Mark ready for APAAR creation" only for records with complete information and consent.
// ============================================================================
export const ApaarModulePage: React.FC = () => {
  const { students, bulkMarkReadyForApaar } = useApp();
  const [activeGroupTab, setActiveGroupTab] = useState<'not_recorded' | 'pending' | 'verified'>(
    'not_recorded'
  );
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkBanner, setBulkBanner] = useState<string | null>(null);

  const notRecordedList = students.filter((s) => !s.apaarId);
  const pendingOfficialList = students.filter(
    (s) => s.apaarId && s.verificationStatus !== 'Simulated Verification'
  );
  const simulatedVerifiedList = students.filter(
    (s) => s.verificationStatus === 'Simulated Verification'
  );

  const eligibleForBulkCreation = notRecordedList.filter(
    (s) => s.consentStatus === 'obtained' && s.dataQualityScore >= 70 && !s.apaarCreationReady
  );

  const handleSelectAllEligible = () => {
    setSelectedIds(eligibleForBulkCreation.map((s) => s.id));
  };

  const handleBulkAction = () => {
    if (selectedIds.length === 0) return;
    bulkMarkReadyForApaar(selectedIds);
    setBulkBanner(
      `Marked ${selectedIds.length} student record(s) with complete profile and parent consent as "Ready for APAAR creation - simulated".`
    );
    setSelectedIds([]);
  };

  const displayedStudents =
    activeGroupTab === 'not_recorded'
      ? notRecordedList
      : activeGroupTab === 'pending'
      ? pendingOfficialList
      : simulatedVerifiedList;

  return (
    <div className="space-y-6 min-w-0">
      <div>
        <div className="text-xs font-semibold text-teal-700">
          APAAR Identity Readiness · Demo Data
        </div>
        <h1 className="font-display text-xl sm:text-2xl font-bold text-[#0B1F3A] break-words">
          APAAR Module — Status Grouping &amp; Consent Checklist
        </h1>
        <p className="text-xs text-slate-600 mt-1">
          Never generates or verifies real APAAR IDs. Bulk readiness marking is enabled strictly
          for records with complete information and obtained parental consent.
        </p>
      </div>

      {/* "No APAAR ID Yet" Pre-Creation Checklist */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 sm:p-5 space-y-3">
        <h2 className="font-display font-bold text-sm text-[#0B1F3A]">
          Checklist for Students with &ldquo;No APAAR ID Yet&rdquo;
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded bg-slate-50 border border-slate-200">
            <div className="font-semibold text-slate-900">1. Demographic Completeness</div>
            <p className="text-slate-600 mt-1">
              Fields 4.1.1 (Name), 4.1.2 (Gender), and 4.1.3 (DOB) must match school admission
              records.
            </p>
          </div>
          <div className="p-3 rounded bg-slate-50 border border-slate-200">
            <div className="font-semibold text-slate-900">2. Parent / Guardian Consent</div>
            <p className="text-slate-600 mt-1">
              Signed parent/guardian consent must be recorded as <strong>Obtained</strong>.
            </p>
          </div>
          <div className="p-3 rounded bg-slate-50 border border-slate-200">
            <div className="font-semibold text-slate-900">3. Simulated Readiness Flag</div>
            <p className="text-slate-600 mt-1">
              Eligible students can be bulk marked <em>Ready for APAAR creation - simulated</em>.
            </p>
          </div>
        </div>
      </div>

      {bulkBanner && (
        <div className="p-3.5 rounded-md bg-teal-50 border border-teal-200 text-xs text-teal-900 flex items-center justify-between">
          <span>{bulkBanner}</span>
          <button
            type="button"
            onClick={() => setBulkBanner(null)}
            className="font-semibold underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Group Tabs + Bulk Action Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 sm:p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setActiveGroupTab('not_recorded')}
              className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
                activeGroupTab === 'not_recorded'
                  ? 'bg-[#0B1F3A] text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              1. APAAR Not Recorded ({notRecordedList.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveGroupTab('pending')}
              className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
                activeGroupTab === 'pending'
                  ? 'bg-[#0B1F3A] text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              2. Recorded — Pending Official Verification ({pendingOfficialList.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveGroupTab('verified')}
              className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
                activeGroupTab === 'verified'
                  ? 'bg-[#0B1F3A] text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              3. Simulated Verified ({simulatedVerifiedList.length})
            </button>
          </div>

          {activeGroupTab === 'not_recorded' && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleSelectAllEligible}
                className="px-3 py-1.5 rounded border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                Select Eligible ({eligibleForBulkCreation.length})
              </button>
              <button
                type="button"
                disabled={selectedIds.length === 0}
                onClick={handleBulkAction}
                className="px-3.5 py-1.5 rounded bg-teal-700 text-white text-xs font-semibold hover:bg-teal-800 disabled:opacity-40"
              >
                Mark Ready for APAAR Creation ({selectedIds.length})
              </button>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-semibold text-slate-500 bg-slate-50">
                {activeGroupTab === 'not_recorded' && <th className="py-2.5 px-3">Select</th>}
                <th className="py-2.5 px-3">Roll No &amp; Student</th>
                <th className="py-2.5 px-3">Masked PEN</th>
                <th className="py-2.5 px-3">Masked APAAR ID</th>
                <th className="py-2.5 px-3">Consent Status</th>
                <th className="py-2.5 px-3">Readiness / Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {displayedStudents.map((s) => {
                const isEligible =
                  !s.apaarId && s.consentStatus === 'obtained' && s.dataQualityScore >= 70;
                const isChecked = selectedIds.includes(s.id);

                return (
                  <tr key={s.id} className="hover:bg-slate-50">
                    {activeGroupTab === 'not_recorded' && (
                      <td className="py-2.5 px-3">
                        <input
                          type="checkbox"
                          disabled={!isEligible || s.apaarCreationReady}
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedIds((prev) => [...prev, s.id]);
                            } else {
                              setSelectedIds((prev) => prev.filter((id) => id !== s.id));
                            }
                          }}
                          title={
                            isEligible
                              ? 'Eligible for bulk APAAR creation readiness'
                              : 'Requires obtained consent and complete profile'
                          }
                        />
                      </td>
                    )}
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-slate-900">{s.fullName}</div>
                      <div className="font-mono text-[11px] text-slate-500">{s.rollNo}</div>
                    </td>
                    <td className="py-2.5 px-3 font-mono">{maskIdentifier(s.pen, 4)}</td>
                    <td className="py-2.5 px-3 font-mono">{maskIdentifier(s.apaarId, 4)}</td>
                    <td className="py-2.5 px-3 uppercase font-mono text-[11px]">
                      <span
                        className={
                          s.consentStatus === 'obtained'
                            ? 'text-teal-700 font-semibold'
                            : 'text-amber-700'
                        }
                      >
                        {s.consentStatus || 'pending'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      {s.apaarCreationReady ? (
                        <span className="text-teal-700 font-semibold">
                          Ready for APAAR creation - simulated
                        </span>
                      ) : (
                        <span className="text-slate-700">{s.verificationStatus}</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 7. SECTION SHIFT (/teacher/section-shift)
// Select students, choose a new section, confirm, audit-logged.
// ============================================================================
export const SectionShiftPage: React.FC = () => {
  const { students, shiftStudentSections, managedSections, isReadOnlySnapshot } = useApp();
  const activeSectionNames = useMemo(
    () =>
      Array.from(
        new Set(managedSections.filter((s) => !s.isArchived).map((s) => s.sectionName))
      ),
    [managedSections]
  );
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [targetSection, setTargetSection] = useState<string>(
    activeSectionNames[1] || activeSectionNames[0] || 'Section B'
  );
  const [confirmMessage, setConfirmMessage] = useState<string | null>(null);

  const activeList = students.slice(0, 15);

  const handleConfirmShift = () => {
    if (selectedIds.length === 0 || isReadOnlySnapshot) return;
    shiftStudentSections(selectedIds, targetSection);
    setConfirmMessage(
      `Shifted ${selectedIds.length} student(s) to ${targetSection}. Audit log entry recorded.`
    );
    setSelectedIds([]);
  };

  return (
    <div className="space-y-6 min-w-0">
      <div>
        <div className="text-xs font-semibold text-teal-700">
          Classroom Roster Management · Demo Data
        </div>
        <h1 className="font-display text-xl sm:text-2xl font-bold text-[#0B1F3A] break-words">
          Section Shift Module
        </h1>
        <p className="text-xs text-slate-600 mt-1">
          Select students, assign a new classroom section (configured in School Details &gt;
          Programmes and Sections), and log the reallocation in the audit trail.
        </p>
      </div>

      {confirmMessage && (
        <div className="p-3.5 rounded-md bg-teal-50 border border-teal-200 text-xs text-teal-900">
          {confirmMessage}
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-lg p-4 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-slate-700">Target Section:</span>
            <select
              value={targetSection}
              onChange={(e) => setTargetSection(e.target.value)}
              className="rounded border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold"
            >
              {activeSectionNames.map((secName) => (
                <option key={secName} value={secName}>
                  {secName}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            disabled={selectedIds.length === 0}
            onClick={handleConfirmShift}
            className="px-4 py-2 rounded-md bg-[#0B1F3A] text-white text-xs font-semibold hover:bg-slate-800 disabled:opacity-40"
          >
            Confirm Section Shift ({selectedIds.length} Selected)
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-semibold text-slate-500 bg-slate-50">
                <th className="py-2.5 px-3">Select</th>
                <th className="py-2.5 px-3">Roll No</th>
                <th className="py-2.5 px-3">Student Name</th>
                <th className="py-2.5 px-3">Programme</th>
                <th className="py-2.5 px-3">Current Section</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {activeList.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(s.id)}
                      onChange={(e) =>
                        setSelectedIds((prev) =>
                          e.target.checked
                            ? [...prev, s.id]
                            : prev.filter((id) => id !== s.id)
                        )
                      }
                    />
                  </td>
                  <td className="py-2.5 px-3 font-mono">{s.rollNo}</td>
                  <td className="py-2.5 px-3 font-medium text-slate-900">{s.fullName}</td>
                  <td className="py-2.5 px-3 text-slate-600">{s.programme}</td>
                  <td className="py-2.5 px-3 font-semibold text-teal-700">
                    {s.section || 'Section A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 8. STUDENT MOVEMENT AND PROGRESSION GROUP
// - Progression Activity (/teacher/progression)
// - Import Module (/teacher/import)
// - Dropbox / Inactive Student List (/teacher/dropbox)
// - Transfer Certificate Module / Mark Dropout (/teacher/transfer-certificate)
// - Inactivate Student Module (/teacher/inactivate)
// ============================================================================
export const ProgressionActivityPage: React.FC = () => {
  const { students, programmes, finalizePromotionBatch } = useApp();
  const [selectedProgramme, setSelectedProgramme] = useState(programmes[0].programmeName);
  const [step, setStep] = useState<'select' | 'review' | 'done'>('select');

  const cohort = students
    .filter((s) => s.programme === selectedProgramme && s.studentStatus === 'Active')
    .slice(0, 10);

  const handleFinalize = () => {
    finalizePromotionBatch(cohort.map((c) => c.id));
    setStep('done');
  };

  return (
    <div className="space-y-6 min-w-0">
      <div>
        <div className="text-xs font-semibold text-teal-700">
          Student Movement &amp; Progression · Demo Data
        </div>
        <h1 className="font-display text-xl sm:text-2xl font-bold text-[#0B1F3A] break-words">
          Progression Activity (Promote Cohort to Next Academic Year)
        </h1>
        <p className="text-xs text-slate-600 mt-1">
          Two-stage progression workflow: Review eligible cohort first, then Finalize Promotion
          (Simulated).
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-4 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-slate-700">Select Class / Programme:</span>
            <select
              value={selectedProgramme}
              onChange={(e) => {
                setSelectedProgramme(e.target.value);
                setStep('select');
              }}
              className="rounded border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold"
            >
              {Array.from(new Set(programmes.map((p) => p.programmeName))).map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            {step === 'select' && (
              <button
                type="button"
                onClick={() => setStep('review')}
                className="px-4 py-2 rounded-md bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700"
              >
                Step 1: Review Promotion List ({cohort.length} Students)
              </button>
            )}
            {step === 'review' && (
              <button
                type="button"
                onClick={handleFinalize}
                className="px-4 py-2 rounded-md bg-teal-700 text-white text-xs font-semibold hover:bg-teal-800"
              >
                Step 2: Finalize Promotion (Simulated)
              </button>
            )}
          </div>
        </div>

        {step === 'review' && (
          <div className="p-3.5 rounded bg-amber-50 border border-amber-200 text-xs text-amber-950">
            <strong>Review Step Active:</strong> Verify that all {cohort.length} students below
            meet credit thresholds before clicking <strong>Finalize Promotion</strong>.
          </div>
        )}

        {step === 'done' && (
          <div className="p-3.5 rounded bg-teal-50 border border-teal-200 text-xs text-teal-950">
            <strong>Promotion Finalized (Simulated):</strong> Promoted {cohort.length} students to
            the next semester for the active academic cycle and recorded an audit entry.
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-semibold text-slate-500 bg-slate-50">
                <th className="py-2.5 px-3">Roll No</th>
                <th className="py-2.5 px-3">Student Name</th>
                <th className="py-2.5 px-3">Current Sem</th>
                <th className="py-2.5 px-3">Promoted Sem (Preview)</th>
                <th className="py-2.5 px-3">Academic Year</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {cohort.map((s) => (
                <tr key={s.id}>
                  <td className="py-2.5 px-3 font-mono">{s.rollNo}</td>
                  <td className="py-2.5 px-3 font-medium text-slate-900">{s.fullName}</td>
                  <td className="py-2.5 px-3 font-mono">Sem {s.semester}</td>
                  <td className="py-2.5 px-3 font-mono font-semibold text-teal-700">
                    Sem {Math.min(8, s.semester + 1)}
                  </td>
                  <td className="py-2.5 px-3 font-mono">{s.academicYear}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export const ImportWizardPage: React.FC = () => {
  const { addAuditLog, addToast, session, selectedAcademicYear } = useApp();
  const [importStep, setImportStep] = useState<1 | 2 | 3>(1);
  const [simFileUploaded, setSimFileUploaded] = useState(false);
  const [dryRunVerified, setDryRunVerified] = useState(false);
  const [importConfirmed, setImportConfirmed] = useState(false);
  const [batchNote, setBatchNote] = useState(
    `Verified synthetic roster import for ${selectedAcademicYear} with automatic PEN/APAAR masking.`
  );
  const demoCsvFileName = `DIET_Batch_${selectedAcademicYear}.csv`;

  const handleSimulatedUpload = () => {
    setSimFileUploaded(true);
    addAuditLog({
      actor: session.userName,
      role: session.roleDisplayLabel || 'Teacher',
      action: 'BATCH_CSV_SELECTED_SIM',
      targetStudentId: demoCsvFileName,
      details: `Selected simulated CSV/Excel batch file (${selectedAcademicYear}) for pre-import check.`,
    });
    addToast(`Selected batch file ${demoCsvFileName} (Simulated).`, 'info');
  };

  const handleDryRunCheck = () => {
    setDryRunVerified(true);
    addAuditLog({
      actor: session.userName,
      role: session.roleDisplayLabel || 'Teacher',
      action: 'BATCH_CSV_VALIDATED_SIM',
      targetStudentId: demoCsvFileName,
      details: `Validated simulated CSV/Excel batch file (${selectedAcademicYear}) with default PEN/APAAR masking.`,
    });
    addToast(`Dry-run check passed for ${demoCsvFileName}: 60 fictional rows valid.`, 'success');
  };

  const handleFinishImport = () => {
    setImportConfirmed(true);
    addAuditLog({
      actor: session.userName,
      role: session.roleDisplayLabel || 'Teacher',
      action: 'BATCH_CSV_IMPORTED_SIM',
      targetStudentId: demoCsvFileName,
      details: `Finished simulated batch import (${selectedAcademicYear}). Note: ${batchNote}`,
    });
    addToast(`Completed simulated import of 60 masked student records (${selectedAcademicYear}).`, 'success');
  };

  return (
    <div className="space-y-6 min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="text-xs font-semibold text-teal-700">
            Bulk Ingestion Wizard ({selectedAcademicYear}) · Demo Data
          </div>
          <h1 className="font-display text-xl sm:text-2xl font-bold text-[#0B1F3A] break-words">
            Import Module — CSV / Excel Roster Validation ({selectedAcademicYear})
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            3-step simulated pre-check and ingestion wizard for bulk Excel/CSV student sheets with
            automatic PEN and APAAR masking.
          </p>
        </div>

        {/* Stepper Pills */}
        <div className="flex items-center gap-1.5 text-xs shrink-0">
          {[
            { step: 1 as const, label: '1. Select File' },
            { step: 2 as const, label: '2. Dry-Run Check' },
            { step: 3 as const, label: '3. Finish Import' },
          ].map((st) => (
            <button
              key={st.step}
              type="button"
              disabled={(st.step === 2 && !simFileUploaded) || (st.step === 3 && !dryRunVerified)}
              onClick={() => setImportStep(st.step)}
              className={`px-2.5 py-1.5 rounded font-semibold transition-colors disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B1F3A] ${
                importStep === st.step
                  ? 'bg-[#0B1F3A] text-white'
                  : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-5 text-xs">
        {/* STEP 1: SELECT / UPLOAD SIMULATED FILE */}
        {importStep === 1 && (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center space-y-3">
              <Upload className="w-8 h-8 text-teal-700 mx-auto" />
              <div className="font-display font-bold text-sm text-[#0B1F3A]">
                Step 1: Select Bulk CSV / Excel Roster ({selectedAcademicYear} · Demo Only)
              </div>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Required columns: Roll_No, Student_Name_4_1_1, Gender, DOB_YYYY_MM_DD, PEN_11_Digit,
                Programme_Code. Never upload real Aadhaar numbers.
              </p>
              <button
                type="button"
                onClick={handleSimulatedUpload}
                className="px-4 py-2 rounded-md bg-[#0B1F3A] text-white text-xs font-semibold hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
              >
                {simFileUploaded
                  ? `Selected: ${demoCsvFileName} (Click to Reload)`
                  : `Load Demo Batch File (${demoCsvFileName})`}
              </button>
            </div>

            {simFileUploaded && (
              <div className="p-3.5 rounded-md bg-teal-50 border border-teal-200 text-teal-950 flex items-center justify-between">
                <span>
                  <strong>File Loaded (Simulated):</strong>{' '}
                  <span className="font-mono">{demoCsvFileName}</span> (60 synthetic rows ready for
                  schema validation).
                </span>
                <span className="font-mono text-[11px] font-bold text-teal-800">Ready &rarr;</span>
              </div>
            )}
          </div>
        )}

        {/* STEP 2: DRY-RUN VALIDATION & MASKING PREVIEW */}
        {importStep === 2 && (
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="font-display font-bold text-sm text-[#0B1F3A]">
                  Step 2: Schema &amp; Identifier Masking Dry-Run ({demoCsvFileName})
                </div>
                <p className="text-slate-600 mt-0.5">
                  Verifies 11-digit PEN format, DD/MM/YYYY admission chronology, and masks all
                  identifiers to last 3 digits.
                </p>
              </div>
              <button
                type="button"
                onClick={handleDryRunCheck}
                className="px-4 py-2 rounded-md bg-indigo-600 text-white font-semibold hover:bg-indigo-700 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                {dryRunVerified ? 'Re-Run Dry-Run Check' : 'Run Simulated Dry-Run Import Check'}
              </button>
            </div>

            {dryRunVerified && (
              <div className="p-4 rounded-md bg-teal-50 border border-teal-200 text-teal-950 space-y-1">
                <div className="font-semibold">
                  Dry-Run Complete (Simulated): {demoCsvFileName}
                </div>
                <p>
                  60 fictional rows parsed for {selectedAcademicYear} · 100% PEN masked by default
                  (•••• •••• 104) · 0 blocking schema errors · 0 real identifiers stored.
                </p>
              </div>
            )}
          </div>
        )}

        {/* STEP 3: CONFIRM & FINISH IMPORT */}
        {importStep === 3 && (
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-blue-50 border border-blue-200 text-blue-950 space-y-1">
              <div className="font-display font-bold text-sm">
                Step 3: Confirm &amp; Finish Batch Import ({demoCsvFileName})
              </div>
              <p>
                Ready to commit 60 validated synthetic student rows into the {selectedAcademicYear}{' '}
                workspace roster. Existing records are never overwritten or auto-merged.
              </p>
            </div>

            <div>
              <label htmlFor="import-batch-note" className="block font-semibold text-slate-800 mb-1">
                Import Audit Log Note *
              </label>
              <input
                id="import-batch-note"
                type="text"
                value={batchNote}
                onChange={(e) => setBatchNote(e.target.value)}
                className="w-full rounded border border-slate-300 px-3 py-2 text-xs text-slate-900"
              />
            </div>

            {importConfirmed && (
              <div className="p-4 rounded-md bg-teal-50 border border-teal-300 text-teal-950 font-semibold">
                Batch Import Finished (Simulated): 60 masked student records verified and logged in
                the audit trail for {selectedAcademicYear}.
              </div>
            )}
          </div>
        )}

        {/* Consistent Multi-Step Footer with Back (Left Arrow) and Next / Finish (Right Arrow) */}
        <div className="pt-4 border-t border-slate-200 space-y-2">
          {importStep === 1 && !simFileUploaded && (
            <p role="status" className="text-[11px] font-medium text-amber-800 text-right">
              Load the demo CSV/Excel batch file above to enable Next.
            </p>
          )}
          {importStep === 2 && !dryRunVerified && (
            <p role="status" className="text-[11px] font-medium text-amber-800 text-right">
              Run the simulated dry-run check above to enable Next.
            </p>
          )}
          {importStep === 3 && !batchNote.trim() && (
            <p role="status" className="text-[11px] font-medium text-amber-800 text-right">
              Enter an import audit log note above to finish.
            </p>
          )}

          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              disabled={importStep === 1}
              onClick={() =>
                setImportStep((prev) => (prev > 1 ? ((prev - 1) as 1 | 2 | 3) : 1))
              }
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 min-h-[42px] rounded-md border border-slate-300 bg-white text-slate-700 font-semibold text-xs hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B1F3A]"
            >
              <ArrowLeft className="w-4 h-4 shrink-0" />
              <span>Back</span>
            </button>

            {importStep < 3 ? (
              <button
                type="button"
                disabled={
                  (importStep === 1 && !simFileUploaded) || (importStep === 2 && !dryRunVerified)
                }
                onClick={() =>
                  setImportStep((prev) => (prev < 3 ? ((prev + 1) as 1 | 2 | 3) : 3))
                }
                className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 min-h-[42px] rounded-md bg-[#0B1F3A] text-white font-semibold text-xs hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
              >
                <span>Next</span>
                <ArrowRight className="w-4 h-4 shrink-0" />
              </button>
            ) : (
              <button
                type="button"
                disabled={!batchNote.trim()}
                onClick={handleFinishImport}
                className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 min-h-[42px] rounded-md bg-teal-700 text-white font-semibold text-xs hover:bg-teal-800 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
              >
                <span>Finish Import</span>
                <ArrowRight className="w-4 h-4 shrink-0" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const DropboxInactivePage: React.FC = () => {
  const { students, reactivateStudent } = useApp();
  const [reasonMap, setReasonMap] = useState<Record<string, string>>({});

  const inactiveList = students.filter(
    (s) => s.studentStatus && s.studentStatus !== 'Active'
  );

  return (
    <div className="space-y-6 min-w-0">
      <div>
        <div className="text-xs font-semibold text-amber-700">
          Non-Destructive Archival · Demo Data
        </div>
        <h1 className="font-display text-xl sm:text-2xl font-bold text-[#0B1F3A] break-words">
          Dropbox / Inactive Student List
        </h1>
        <p className="text-xs text-slate-600 mt-1">
          Students marked Inactive, Dropped Out, or Transferred (TC Issued). Records are never
          deleted and can be reactivated with a documented reason.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-4 sm:p-6 overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 text-[11px] font-semibold text-slate-500 bg-slate-50">
              <th className="py-3 px-3">Roll No &amp; Name</th>
              <th className="py-3 px-3">Status</th>
              <th className="py-3 px-3">Reason &amp; Date</th>
              <th className="py-3 px-3">Reactivation Reason</th>
              <th className="py-3 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {inactiveList.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-500">
                  No students currently in Dropbox / Inactive list.
                </td>
              </tr>
            ) : (
              inactiveList.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50">
                  <td className="py-3 px-3">
                    <div className="font-semibold text-slate-900">{s.fullName}</div>
                    <div className="font-mono text-[11px] text-slate-500">{s.rollNo}</div>
                  </td>
                  <td className="py-3 px-3 font-semibold text-amber-800">{s.studentStatus}</td>
                  <td className="py-3 px-3 text-slate-600">
                    <div>{s.inactiveReason || 'Nodal action'}</div>
                    <div className="font-mono text-[11px] text-slate-400">
                      Date: {s.inactiveDate || '2026-10-24'} {s.tcNumber ? `· ${s.tcNumber}` : ''}
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <input
                      type="text"
                      value={reasonMap[s.id] || ''}
                      onChange={(e) =>
                        setReasonMap((prev) => ({ ...prev, [s.id]: e.target.value }))
                      }
                      placeholder="Enter reason to reactivate..."
                      className="rounded border border-slate-300 px-2.5 py-1 text-xs w-48"
                    />
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      type="button"
                      onClick={() =>
                        reactivateStudent(
                          s.id,
                          reasonMap[s.id]?.trim() || 'Re-admitted per Registrar order'
                        )
                      }
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-teal-700 text-white font-semibold hover:bg-teal-800"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reactivate</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const TransferCertificatePage: React.FC = () => {
  const { students, inactivateStudent } = useApp();
  const activeStudents = students.filter((s) => s.studentStatus === 'Active');

  const [selectedId, setSelectedId] = useState(activeStudents[0]?.id || 'STU-1010');
  const [actionMode, setActionMode] = useState<'Transferred (TC Issued)' | 'Dropped Out'>(
    'Transferred (TC Issued)'
  );
  const [reason, setReason] = useState(
    'Issued simulated Transfer Certificate for inter-college migration.'
  );
  const [effectiveDate, setEffectiveDate] = useState('2026-10-24');
  const [notice, setNotice] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tcNo =
      actionMode === 'Transferred (TC Issued)'
        ? `TC-DEMO-${Math.floor(1000 + Math.random() * 9000)}`
        : undefined;
    inactivateStudent(selectedId, actionMode, reason, effectiveDate, tcNo);
    setNotice(
      `Student ${selectedId} marked as "${actionMode}"${
        tcNo ? ` with Demo Certificate ${tcNo}` : ''
      }. Moved to Dropbox / Inactive Student List (nothing deleted).`
    );
  };

  return (
    <div className="space-y-6 min-w-0">
      <div>
        <div className="text-xs font-semibold text-teal-700">
          Transfer &amp; Dropout Governance · Demo Data
        </div>
        <h1 className="font-display text-xl sm:text-2xl font-bold text-[#0B1F3A] break-words">
          Transfer Certificate Module / Mark Dropout
        </h1>
        <p className="text-xs text-slate-600 mt-1">
          Issue a demo Transfer Certificate (TC) or record a student dropout with reason and date.
          The student moves to the Dropbox / Inactive list; no record is ever deleted.
        </p>
      </div>

      {notice && (
        <div className="p-4 rounded-md bg-teal-50 border border-teal-200 text-xs text-teal-950 flex items-center justify-between">
          <span>{notice}</span>
          <Link to="/teacher/dropbox" className="font-semibold underline">
            Open Dropbox List &rarr;
          </Link>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white border border-slate-200 rounded-lg p-5 space-y-4 max-w-2xl text-xs"
      >
        <div>
          <label className="block font-semibold text-slate-700 mb-1">
            Select Active Student
          </label>
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm"
          >
            {activeStudents.slice(0, 25).map((s) => (
              <option key={s.id} value={s.id}>
                {s.rollNo} — {s.fullName} ({s.programme})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Action Type</label>
            <select
              value={actionMode}
              onChange={(e) =>
                setActionMode(
                  e.target.value as 'Transferred (TC Issued)' | 'Dropped Out'
                )
              }
              className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm"
            >
              <option value="Transferred (TC Issued)">
                Issue Demo Transfer Certificate (TC)
              </option>
              <option value="Dropped Out">Mark Student Dropout</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Effective Date</label>
            <input
              type="date"
              value={effectiveDate}
              onChange={(e) => setEffectiveDate(e.target.value)}
              className="w-full rounded border border-slate-300 px-3 py-2 text-sm font-mono"
            />
          </div>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">
            Reason for TC / Dropout
          </label>
          <textarea
            rows={2}
            required
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full rounded border border-slate-300 px-3 py-2 text-xs"
          />
        </div>

        <button
          type="submit"
          className="px-4 py-2.5 rounded-md bg-[#0B1F3A] text-white font-semibold hover:bg-slate-800"
        >
          Confirm &amp; Move to Dropbox (Non-Destructive)
        </button>
      </form>
    </div>
  );
};

export const InactivateStudentPage: React.FC = () => {
  const { students, inactivateStudent } = useApp();
  const activeStudents = students.filter((s) => s.studentStatus === 'Active');

  const [selectedId, setSelectedId] = useState(activeStudents[1]?.id || 'STU-1011');
  const [reason, setReason] = useState('Approved semester medical leave / temporary absence.');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [doneMsg, setDoneMsg] = useState<string | null>(null);

  const handleConfirm = () => {
    inactivateStudent(selectedId, 'Inactive', reason, '2026-10-24');
    setShowConfirmDialog(false);
    setDoneMsg(
      `Student ${selectedId} marked Inactive (Reversible from Dropbox / Inactive Student List).`
    );
  };

  return (
    <div className="space-y-6 min-w-0">
      <div>
        <div className="text-xs font-semibold text-amber-700">
          Reversible Roster Status · Demo Data
        </div>
        <h1 className="font-display text-xl sm:text-2xl font-bold text-[#0B1F3A] break-words">
          Inactivate Student Module
        </h1>
        <p className="text-xs text-slate-600 mt-1">
          Temporarily mark a student record as Inactive with a confirmation dialog. Reversible at
          any time from the Dropbox list.
        </p>
      </div>

      {doneMsg && (
        <div className="p-4 rounded-md bg-amber-50 border border-amber-200 text-xs text-amber-950 flex items-center justify-between">
          <span>{doneMsg}</span>
          <Link to="/teacher/dropbox" className="font-semibold underline">
            Go to Dropbox to Reactivate &rarr;
          </Link>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4 max-w-xl text-xs">
        <div>
          <label className="block font-semibold text-slate-700 mb-1">Select Active Student</label>
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm"
          >
            {activeStudents.slice(0, 25).map((s) => (
              <option key={s.id} value={s.id}>
                {s.rollNo} — {s.fullName}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Inactivation Reason</label>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full rounded border border-slate-300 px-3 py-2 text-xs"
          />
        </div>

        <button
          type="button"
          onClick={() => setShowConfirmDialog(true)}
          className="px-4 py-2 rounded-md bg-amber-600 text-white font-semibold hover:bg-amber-700"
        >
          Mark Student Inactive...
        </button>
      </div>

      {showConfirmDialog && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-lg max-w-md w-full p-5 space-y-4 text-xs">
            <div className="font-display font-bold text-base text-[#0B1F3A]">
              Confirm Reversible Student Inactivation
            </div>
            <p className="text-slate-600 leading-relaxed">
              Are you sure you want to mark student <strong>{selectedId}</strong> as Inactive? The
              record will not be deleted and can be restored from the Dropbox / Inactive Student
              List.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmDialog(false)}
                className="px-3 py-1.5 rounded border border-slate-300 text-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="px-4 py-1.5 rounded bg-[#0B1F3A] text-white font-semibold"
              >
                Confirm Inactivation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 9. REPORTING MODULE (/teacher/reporting)
// Reports with filters and PDF/CSV/Excel export, no sensitive identifiers.
// ============================================================================
export const ReportingModulePage: React.FC = () => {
  const { programmes, students } = useApp();
  const [progFilter, setProgFilter] = useState('ALL');
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const filteredStudents =
    progFilter === 'ALL'
      ? students
      : students.filter((s) => s.programme === progFilter);

  const triggerExport = (format: 'PDF' | 'CSV' | 'Excel (.xlsx)') => {
    setExportNotice(
      `Generated ${format} Summary Report (${filteredStudents.length} records). Zero raw PEN or Aadhaar numbers included in export.`
    );
  };

  return (
    <div className="space-y-6 min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="text-xs font-semibold text-teal-700">
            Privacy-Safe Reporting · Demo Data
          </div>
          <h1 className="font-display text-xl sm:text-2xl font-bold text-[#0B1F3A] break-words">
            Reporting Module (PDF / CSV / Excel Export)
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Filter institutional readiness metrics and export sanitized summary reports containing
            no unmasked sensitive identifiers.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => triggerExport('PDF')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#0B1F3A] text-white text-xs font-semibold"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export PDF</span>
          </button>
          <button
            type="button"
            onClick={() => triggerExport('CSV')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-slate-300 bg-white text-slate-800 text-xs font-semibold"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            type="button"
            onClick={() => triggerExport('Excel (.xlsx)')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-slate-300 bg-white text-slate-800 text-xs font-semibold"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      {exportNotice && (
        <div className="p-3.5 rounded-md bg-teal-50 border border-teal-200 text-xs text-teal-950">
          {exportNotice}
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-lg p-4 sm:p-6 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold text-slate-700">Filter by Programme:</span>
          <select
            value={progFilter}
            onChange={(e) => setProgFilter(e.target.value)}
            className="rounded border border-slate-300 bg-white px-3 py-1.5 text-xs"
          >
            <option value="ALL">All Programmes ({students.length} records)</option>
            {Array.from(new Set(programmes.map((p) => p.programmeName))).map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-semibold text-slate-500 bg-slate-50">
                <th className="py-2.5 px-3">Roll No</th>
                <th className="py-2.5 px-3">Student Name</th>
                <th className="py-2.5 px-3">Programme &amp; Section</th>
                <th className="py-2.5 px-3">Verification Readiness</th>
                <th className="py-2.5 px-3 text-right">Quality Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredStudents.slice(0, 15).map((s) => (
                <tr key={s.id}>
                  <td className="py-2.5 px-3 font-mono">{s.rollNo}</td>
                  <td className="py-2.5 px-3 font-medium text-slate-900">{s.fullName}</td>
                  <td className="py-2.5 px-3 text-slate-600">
                    {s.programme} ({s.section || 'Section A'})
                  </td>
                  <td className="py-2.5 px-3">{s.verificationStatus}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-semibold">
                    {s.dataQualityScore}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 10. SCHOOL CERTIFICATION (/teacher/certification)
// Checklist of pending validation errors; certify data only when blocking errors are zero;
// show "Certified (demo)" with timestamp and the person who certified; certification can be reopened.
// ============================================================================
export const SchoolCertificationPage: React.FC = () => {
  const { students, certification, certifySchoolData, reopenSchoolCertification, applyStandardization } =
    useApp();

  const blockingRecords = students.filter(
    (s) => s.verificationStatus === 'Mismatch Flagged' && s.reviewedStatus === 'Unreviewed'
  );

  const canCertify = blockingRecords.length === 0;

  const handleResolveAllBlocking = () => {
    blockingRecords.forEach((r) => applyStandardization(r.id));
  };

  return (
    <div className="space-y-6 min-w-0">
      <div>
        <div className="text-xs font-semibold text-teal-700">
          Annual Roster Sign-Off · Demo Data
        </div>
        <h1 className="font-display text-xl sm:text-2xl font-bold text-[#0B1F3A] break-words">
          School Certification ({certification.academicYear})
        </h1>
        <p className="text-xs text-slate-600 mt-1">
          Certify institutional student data once all blocking validation discrepancies are
          resolved. Certification is labelled &ldquo;Certified (demo)&rdquo; and can be reopened.
        </p>
      </div>

      {/* Certification Status Banner */}
      <div
        className={`p-5 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
          certification.isCertified
            ? 'bg-teal-50 border-teal-200 text-teal-950'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        <div className="space-y-1">
          <div className="text-xs font-mono uppercase font-semibold">
            Current Institutional Status
          </div>
          {certification.isCertified ? (
            <>
              <div className="font-display text-lg font-bold text-teal-800">
                Certified (demo) — Academic Year {certification.academicYear}
              </div>
              <div className="text-xs text-teal-900">
                Certified by: <strong>{certification.certifiedBy}</strong> · Timestamp:{' '}
                <strong className="font-mono">{certification.certifiedAt}</strong>
              </div>
            </>
          ) : (
            <>
              <div className="font-display text-lg font-bold text-[#0B1F3A]">
                Data Not Certified — {blockingRecords.length} Blocking Error(s) Remaining
              </div>
              <div className="text-xs text-slate-600">
                Resolve all unreviewed mismatch flags below to unlock certification.
              </div>
            </>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {certification.isCertified ? (
            <button
              type="button"
              onClick={reopenSchoolCertification}
              className="px-4 py-2 rounded-md border border-teal-700 bg-white text-teal-900 text-xs font-semibold hover:bg-teal-100"
            >
              Reopen Certification for Edits
            </button>
          ) : (
            <>
              {blockingRecords.length > 0 && (
                <button
                  type="button"
                  onClick={handleResolveAllBlocking}
                  className="px-3.5 py-2 rounded-md bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700"
                >
                  Resolve All {blockingRecords.length} Blocking Flags (Simulated)
                </button>
              )}
              <button
                type="button"
                disabled={!canCertify}
                onClick={certifySchoolData}
                className="px-4 py-2 rounded-md bg-[#0B1F3A] text-white text-xs font-semibold hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Certify School Roster (Demo)
              </button>
            </>
          )}
        </div>
      </div>

      {/* Checklist Table */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 sm:p-6 space-y-3">
        <h2 className="font-display font-bold text-sm text-[#0B1F3A]">
          Pre-Certification Validation Checklist
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-semibold text-slate-500 bg-slate-50">
                <th className="py-2.5 px-3">Validation Check</th>
                <th className="py-2.5 px-3">Severity</th>
                <th className="py-2.5 px-3 text-right">Pending Count</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              <tr>
                <td className="py-3 px-3 font-medium text-slate-900">
                  Unreviewed Name / DOB Mismatch Flags
                </td>
                <td className="py-3 px-3 text-red-600 font-semibold">Blocking Error</td>
                <td className="py-3 px-3 text-right font-mono font-bold">
                  {blockingRecords.length}
                </td>
                <td className="py-3 px-3">
                  {blockingRecords.length === 0 ? (
                    <span className="text-teal-700 font-semibold">Passed (0 Blocking)</span>
                  ) : (
                    <span className="text-red-600 font-semibold">
                      Action Required Before Certification
                    </span>
                  )}
                </td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-medium text-slate-900">
                  11-Digit PEN Format &amp; Default Masking Check
                </td>
                <td className="py-3 px-3 text-red-600 font-semibold">Blocking Error</td>
                <td className="py-3 px-3 text-right font-mono font-bold">0</td>
                <td className="py-3 px-3 text-teal-700 font-semibold">Passed (100% Masked)</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-medium text-slate-900">
                  Pending Official Verification Queue (Advisory)
                </td>
                <td className="py-3 px-3 text-amber-700 font-semibold">Non-Blocking Warning</td>
                <td className="py-3 px-3 text-right font-mono font-bold">
                  {
                    students.filter(
                      (s) => s.verificationStatus === 'Pending Official Verification'
                    ).length
                  }
                </td>
                <td className="py-3 px-3 text-amber-700 font-medium">
                  Allowed with Advisory Note
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 12. GLOBAL STUDENT SEARCH (/teacher/global-search)
// Search across the user's permitted data by name, full 11-digit PEN (or partial PEN with can_view_sensitive),
// or admission/roll number across workspaces; cross-institution lookup is SIMULATED.
// ============================================================================
export const GlobalStudentSearchPage: React.FC = () => {
  const { allInstitutionStudents, canViewSensitive, setCanViewSensitive, session } = useApp();
  const [query, setQuery] = useState('');
  const [includeCrossCampusSim, setIncludeCrossCampusSim] = useState(true);
  const [workspaceScope, setWorkspaceScope] = useState<'ALL' | 'school' | 'college'>('ALL');
  const [historyDrawerStudent, setHistoryDrawerStudent] = useState<StudentRecord | null>(null);

  const penSearchBlocked = useMemo(() => {
    const q = query.trim();
    if (!q) return false;
    const digitsOnly = /^\d+$/.test(q);
    if (digitsOnly && q.length >= 3 && q.length < 11 && !canViewSensitive) {
      return true;
    }
    return false;
  }, [query, canViewSensitive]);

  const results = useMemo(() => {
    if (penSearchBlocked) return [];
    const basePool = allInstitutionStudents.filter((s) => {
      if (workspaceScope === 'school' && s.institutionType === 'College') return false;
      if (workspaceScope === 'college' && s.institutionType !== 'College') return false;
      if (!includeCrossCampusSim && s.institutionId !== session.institutionId) return false;
      return true;
    });

    const q = query.trim().toLowerCase();
    if (!q) return basePool.slice(0, 18);

    const digitsOnly = /^\d+$/.test(q);
    return basePool.filter((s) => {
      const penMatch = digitsOnly
        ? q.length === 11
          ? s.pen === q
          : canViewSensitive && s.pen.includes(q)
        : false;
      return (
        s.fullName.toLowerCase().includes(q) ||
        s.rollNo.toLowerCase().includes(q) ||
        (s.className || s.programme).toLowerCase().includes(q) ||
        s.institutionName.toLowerCase().includes(q) ||
        penMatch
      );
    });
  }, [
    allInstitutionStudents,
    query,
    penSearchBlocked,
    canViewSensitive,
    workspaceScope,
    includeCrossCampusSim,
    session.institutionId,
  ]);

  return (
    <div className="space-y-6 min-w-0">
      <div>
        <div className="text-xs font-semibold text-teal-700">
          Cross-Workspace Directory Lookup · Demo Data
        </div>
        <h1 className="font-display text-xl sm:text-2xl font-bold text-[#0B1F3A] break-words">
          Global Student Search (Across School &amp; College Workspaces)
        </h1>
        <p className="text-xs text-slate-600 mt-1">
          Find a student across workspaces within your institution and permissions by name, roll
          number, class, programme, or full 11-digit PEN. Identifiers are masked to the last 3
          characters.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-4 sm:p-6 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, roll number, class, programme or institution"
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-md border border-slate-300"
            />
          </div>

          <select
            value={workspaceScope}
            onChange={(e) => setWorkspaceScope(e.target.value as 'ALL' | 'school' | 'college')}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700"
          >
            <option value="ALL">All Workspaces (School + Jr. College + College)</option>
            <option value="school">Schools &amp; Junior Colleges Only</option>
            <option value="college">Colleges Only</option>
          </select>

          <label className="inline-flex items-center gap-2 text-xs text-slate-700 font-medium shrink-0">
            <input
              type="checkbox"
              checked={includeCrossCampusSim}
              onChange={(e) => setIncludeCrossCampusSim(e.target.checked)}
            />
            <span>Include Cross-Institution Lookup (Simulated)</span>
          </label>
        </div>

        {/* PEN Partial Search Guardrail Banner */}
        {penSearchBlocked && (
          <div className="p-3.5 rounded-md bg-red-50 border border-red-200 text-xs text-red-900 flex flex-wrap items-center justify-between gap-2">
            <div>
              <strong>Partial PEN Search Blocked (Permission Guardrail):</strong> Searching by PEN
              requires either the <strong>full 11-digit PEN</strong> or the{' '}
              <code className="font-mono bg-red-100 px-1 py-0.5 rounded">can_view_sensitive</code>{' '}
              permission. Partial PEN search is blocked for standard accounts to prevent identifier
              harvesting.
            </div>
            <button
              type="button"
              onClick={() => setCanViewSensitive(true)}
              className="px-2.5 py-1 rounded bg-red-700 text-white font-semibold text-[11px] hover:bg-red-800 shrink-0"
            >
              Grant can_view_sensitive (Demo)
            </button>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-semibold text-slate-500 bg-slate-50">
                <th className="py-2.5 px-3">Admission / Roll No</th>
                <th className="py-2.5 px-3">Student Name</th>
                <th className="py-2.5 px-3">Institution Type</th>
                <th className="py-2.5 px-3">Class / Programme &amp; Section</th>
                <th className="py-2.5 px-3">Masked PEN (Last 3)</th>
                <th className="py-2.5 px-3">Institution (Permitted Scope)</th>
                <th className="py-2.5 px-3 text-right">Education History</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {results.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-mono font-semibold">{s.rollNo}</td>
                  <td className="py-2.5 px-3 font-medium text-slate-900">{s.fullName}</td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${
                        s.institutionType === 'School'
                          ? 'bg-teal-50 border-teal-200 text-teal-800'
                          : s.institutionType === 'Junior College'
                          ? 'bg-amber-50 border-amber-200 text-amber-900'
                          : 'bg-indigo-50 border-indigo-200 text-indigo-800'
                      }`}
                    >
                      {s.institutionType}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-700">
                    <span className="font-semibold">{s.className || s.programme}</span> ·{' '}
                    <span className="font-mono text-[11px]">{s.section || 'Section A'}</span>
                  </td>
                  <td className="py-2.5 px-3 font-mono">{maskIdentifier(s.pen, 3)}</td>
                  <td className="py-2.5 px-3 text-slate-600">
                    {s.institutionName} ({s.state}) ·{' '}
                    <span className="text-indigo-700 font-mono text-[11px]">Simulated</span>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      type="button"
                      onClick={() => setHistoryDrawerStudent(s)}
                      className="px-2.5 py-1 rounded border border-indigo-200 bg-indigo-50 text-indigo-800 font-semibold text-[11px] hover:bg-indigo-100"
                    >
                      History Timeline
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Education History Drawer */}
      {historyDrawerStudent && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex justify-end"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white w-full max-w-lg h-full shadow-2xl border-l border-slate-200 flex flex-col justify-between overflow-y-auto">
            <div className="p-5 space-y-4">
              <div className="flex items-start justify-between gap-3 border-b border-slate-200 pb-3">
                <div>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-indigo-50 text-indigo-800 border border-indigo-200 font-semibold">
                    Education History Timeline · Simulated
                  </span>
                  <h3 className="font-display font-bold text-base text-[#0B1F3A] mt-1">
                    {historyDrawerStudent.fullName} ({historyDrawerStudent.rollNo})
                  </h3>
                  <p className="text-xs text-slate-500">
                    Current: {historyDrawerStudent.className || historyDrawerStudent.programme} ·{' '}
                    {historyDrawerStudent.institutionName}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setHistoryDrawerStudent(null)}
                  className="px-2.5 py-1 rounded border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Close
                </button>
              </div>

              <div className="relative pl-5 border-l-2 border-indigo-200 space-y-3">
                {buildSimulatedEducationHistory(historyDrawerStudent).map((stage) => (
                  <div
                    key={stage.stageId}
                    className="relative bg-slate-50 border border-slate-200 rounded-lg p-3.5 text-xs space-y-1"
                  >
                    <span className="absolute -left-[25px] top-4 w-3 h-3 rounded-full bg-indigo-600 border-2 border-white" />
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[11px] font-bold text-indigo-900">
                        {stage.academicYear}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-white border border-slate-200 text-slate-700">
                        {stage.institutionType} · {stage.status}
                      </span>
                    </div>
                    <div className="font-display font-bold text-sm text-[#0B1F3A]">
                      {stage.classOrProgramme} ({stage.section})
                    </div>
                    <div className="text-slate-600">{stage.institutionName}</div>
                    <div className="font-mono text-[11px] text-slate-500">
                      Roll No: {stage.rollNo}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 13. FORM FIELDS VALIDATION GUIDE (/teacher/validation-guide)
// Searchable table of every form field with its rule number (like 4.1.1),
// required or optional, format, and examples; "[Refer Rule: x]" links highlight the matching row.
// ============================================================================
export const ValidationGuidePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const highlightedRule = searchParams.get('rule') || '';
  const [query, setQuery] = useState(highlightedRule);

  const filteredRules = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return RULE_DICTIONARY_LIST;
    return RULE_DICTIONARY_LIST.filter(
      (r) =>
        r.code.toLowerCase().includes(q) ||
        r.title.toLowerCase().includes(q) ||
        r.whatItMeans.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <div className="space-y-6 min-w-0">
      <div>
        <div className="text-xs font-semibold text-teal-700">
          Schema &amp; Field Reference · Demo Data
        </div>
        <h1 className="font-display text-xl sm:text-2xl font-bold text-[#0B1F3A] break-words">
          Form Fields Validation Guide (Rules 4.1.1 – 4.1.11 &amp; Identity Checks)
        </h1>
        <p className="text-xs text-slate-600 mt-1">
          Searchable reference table for every student registration field, format standard, and
          remediation steps.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-4 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by rule number (e.g. 4.1.1, 4.1.9, R-1.2) or field name..."
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-md border border-slate-300"
            />
          </div>
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="text-xs font-semibold text-indigo-700 underline"
            >
              Show All Rules ({RULE_DICTIONARY_LIST.length})
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-semibold text-slate-500 bg-slate-50">
                <th className="py-3 px-3">Rule No.</th>
                <th className="py-3 px-3">Field Name</th>
                <th className="py-3 px-3">Requirement</th>
                <th className="py-3 px-3">Format &amp; Example</th>
                <th className="py-3 px-3">What It Means &amp; How to Fix</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 align-top">
              {filteredRules.map((r) => {
                const isHighlighted =
                  highlightedRule &&
                  r.code.toLowerCase() === highlightedRule.toLowerCase();
                return (
                  <tr
                    key={r.code}
                    className={
                      isHighlighted ? 'bg-indigo-50/80' : 'hover:bg-slate-50'
                    }
                  >
                    <td className="py-3 px-3 font-mono font-bold text-[#0B1F3A] whitespace-nowrap">
                      {r.code}
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-900">{r.title}</td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span
                        className={
                          r.required ? 'text-red-600 font-semibold' : 'text-slate-500'
                        }
                      >
                        {r.required ? 'Required' : 'Optional'}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-700">
                      <div>{r.format}</div>
                      <div className="text-teal-700 mt-0.5">Ex: {r.example}</div>
                    </td>
                    <td className="py-3 px-3 text-slate-600 space-y-1">
                      <div>
                        <strong className="text-slate-800">Meaning:</strong> {r.whatItMeans}
                      </div>
                      <div>
                        <strong className="text-indigo-800">How to fix:</strong> {r.howToFix}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 14. NOTIFICATIONS (/teacher/notifications)
// List with read/unread, filters, and "Mark all as read".
// ============================================================================
export const NotificationsPage: React.FC = () => {
  const { notifications, markNotificationRead, markAllNotificationsRead, addToast } = useApp();
  const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL');

  const list =
    filter === 'ALL'
      ? notifications
      : notifications.filter((n) => !n.isRead);

  return (
    <div className="space-y-6 min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="text-xs font-semibold text-teal-700">
            System &amp; Readiness Alerts · Demo Data
          </div>
          <h1 className="font-display text-xl sm:text-2xl font-bold text-[#0B1F3A] break-words">
            Notifications &amp; Action Advisories
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1.5 rounded text-xs font-semibold ${
              filter === 'ALL'
                ? 'bg-[#0B1F3A] text-white'
                : 'bg-white border border-slate-300 text-slate-700'
            }`}
          >
            All ({notifications.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('UNREAD')}
            className={`px-3 py-1.5 rounded text-xs font-semibold ${
              filter === 'UNREAD'
                ? 'bg-[#0B1F3A] text-white'
                : 'bg-white border border-slate-300 text-slate-700'
            }`}
          >
            Unread ({notifications.filter((n) => !n.isRead).length})
          </button>
          <button
            type="button"
            onClick={() => {
              markAllNotificationsRead();
              addToast('All notifications marked as read.', 'info');
            }}
            className="px-3.5 py-1.5 rounded bg-teal-700 text-white text-xs font-semibold hover:bg-teal-800"
          >
            Mark All as Read
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-200">
        {list.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No unread notifications remaining.
          </div>
        ) : (
          list.map((n) => (
            <div
              key={n.id}
              className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                !n.isRead ? 'bg-indigo-50/40' : ''
              }`}
            >
              <div className="flex items-start gap-2.5">
                <span
                  aria-label={!n.isRead ? 'Unread notification' : 'Read notification'}
                  className={`w-2.5 h-2.5 rounded-full shrink-0 mt-1.5 ${
                    !n.isRead ? 'bg-blue-600' : 'bg-slate-200'
                  }`}
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs">
                    {!n.isRead && (
                      <span className="px-1.5 py-0.5 rounded bg-red-600 text-white text-[10px] font-mono font-bold">
                        NEW
                      </span>
                    )}
                    <span className="font-mono text-slate-500">{n.category}</span>
                    <span>·</span>
                    <span className="font-mono text-slate-400">{n.timestamp}</span>
                  </div>
                  <div className="font-display font-bold text-sm text-[#0B1F3A]">
                    {n.title}
                  </div>
                  <p className="text-xs text-slate-600">{n.message}</p>
                </div>
              </div>

              {!n.isRead && (
                <button
                  type="button"
                  onClick={() => {
                    markNotificationRead(n.id);
                    addToast('Notification marked as read.', 'info');
                  }}
                  className="px-3 py-1.5 rounded border border-slate-300 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 shrink-0 self-start sm:self-center"
                >
                  Mark Read
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
