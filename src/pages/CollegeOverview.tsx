import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  AlertTriangle,
  CheckCircle2,
  Building2,
  Sparkles,
  Users,
  FileWarning,
  Info,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

// 1. Main Management Overview ("/college" or "/school-management"): Intake vs Enrolment cards and Bar Chart
export const CollegeOverview: React.FC = () => {
  const { programmes, institutions, selectedAcademicYear, students, activeWorkspace } = useApp();
  const [selectedInstId, setSelectedInstId] = useState<string>('ALL');
  const isSchool = activeWorkspace === 'school';

  const filteredProgrammes =
    selectedInstId === 'ALL'
      ? programmes
      : programmes.filter((p) => p.institutionId === selectedInstId);

  const totalApproved = filteredProgrammes.reduce((acc, p) => acc + p.approvedIntake, 0);
  const totalEnrolled = filteredProgrammes.reduce((acc, p) => acc + p.actualEnrolment, 0);
  const totalSimVerified = filteredProgrammes.reduce(
    (acc, p) => acc + p.simulatedVerifiedCount,
    0
  );
  const overIntakeProgs = filteredProgrammes.filter(
    (p) => p.actualEnrolment > p.approvedIntake
  );
  const cwsnCount = students.filter(
    (s) =>
      (selectedInstId === 'ALL' || s.institutionId === selectedInstId) &&
      s.cwsnDetails?.isCwsn
  ).length;

  const chartData = filteredProgrammes.map((p) => ({
    name: isSchool ? p.programmeName.replace(' (MPC / BiPC)', '') : p.department,
    fullProgramme: p.programmeName,
    institution: p.institutionName,
    ApprovedIntake: p.approvedIntake,
    ActualEnrolment: p.actualEnrolment,
    SimulatedVerified: p.simulatedVerifiedCount,
  }));

  return (
    <div className="space-y-6 min-w-0">
      {/* Header & Campus Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="text-xs font-semibold text-teal-700">
            {isSchool
              ? `School Management Portal (Headmaster / Principal) · Class 1–12 Governance (${selectedAcademicYear} · Demo Data)`
              : `College Management Portal · Intake & Enrolment Governance (${selectedAcademicYear} · Demo Data)`}
          </div>
          <h1 className="font-display text-xl sm:text-2xl font-bold text-[#0B1F3A] mt-0.5 break-words">
            {isSchool
              ? `Class-Wise Approved Intake vs Actual Enrolment (${selectedAcademicYear})`
              : `Sanctioned Intake vs Actual Enrolment Overview (${selectedAcademicYear})`}
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            {isSchool ? (
              <>
                Monitors fictional Schools &amp; Junior Colleges across Classes 1 to 12 (Sections A
                to C). Schools and Colleges are strictly separated and never mixed in one table.
                Aggregated CWSN Students:{' '}
                <strong className="font-mono text-[#0B1F3A]">
                  {cwsnCount > 0 && cwsnCount < 5 ? '< 5 (Privacy Suppressed)' : cwsnCount}
                </strong>
                .
              </>
            ) : (
              <>
                Monitors 3 institutions and 8 engineering programmes. Highlights 2 programmes
                exceeding AICTE approved intake due to unwithdrawn counselling sliding records.
                Aggregated CWSN Students:{' '}
                <strong className="font-mono text-[#0B1F3A]">
                  {cwsnCount > 0 && cwsnCount < 5 ? '< 5 (Privacy Suppressed)' : cwsnCount}
                </strong>
                .
              </>
            )}
          </p>
        </div>

        <div className="w-full sm:w-auto shrink-0">
          <select
            aria-label="Select Institution Campus"
            value={selectedInstId}
            onChange={(e) => setSelectedInstId(e.target.value)}
            className="w-full sm:w-auto max-w-full rounded-md border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-800 focus:border-[#0B1F3A] focus:outline-none truncate"
          >
            <option value="ALL">
              {isSchool
                ? `All ${institutions.length} Demo Schools & Jr. Colleges`
                : `All ${institutions.length} Demo Colleges (Combined View)`}
            </option>
            {institutions.map((inst) => (
              <option key={inst.id} value={inst.id}>
                {inst.name} ({inst.state})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 4 Intake vs Enrolment KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-lg p-4 sm:p-5">
          <div className="text-xs font-medium text-slate-500">
            {isSchool ? 'Approved Class Capacity Ceiling' : 'Sanctioned Intake Ceiling'}
          </div>
          <div className="mt-2 flex items-baseline justify-between font-mono tabular-nums">
            <span className="text-2xl sm:text-3xl font-bold text-[#0B1F3A]">
              {totalApproved.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500">
              {filteredProgrammes.length} {isSchool ? 'Classes' : 'Programmes'}
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
            Academic Session {selectedAcademicYear} · Demo Data
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 sm:p-5">
          <div className="text-xs font-medium text-slate-500">Actual Student Enrolment</div>
          <div className="mt-2 flex items-baseline justify-between font-mono tabular-nums">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900">
              {totalEnrolled.toLocaleString()}
            </span>
            <span
              className={`text-xs font-semibold ${
                totalEnrolled > totalApproved ? 'text-red-600' : 'text-teal-700'
              }`}
            >
              {totalEnrolled >= totalApproved
                ? `+${totalEnrolled - totalApproved} Net Variance`
                : `${totalEnrolled - totalApproved} Seats Vacant`}
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-600">
            Utilization:{' '}
            {totalApproved > 0 ? ((totalEnrolled / totalApproved) * 100).toFixed(1) : '0.0'}% of
            approved capacity
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 sm:p-5">
          <div className="text-xs font-medium text-slate-500">
            {isSchool ? 'Classes Over Capacity' : 'Programmes Over Intake'}
          </div>
          <div className="mt-2 flex items-baseline justify-between font-mono tabular-nums">
            <span className="text-2xl sm:text-3xl font-bold text-red-600">
              {overIntakeProgs.length}
            </span>
            <span className="text-xs font-semibold text-red-600">
              {isSchool ? '+9 Excess Rosters' : '+29 Excess Rosters'}
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-red-700">
            {isSchool
              ? 'Class 5 (+4) & Class 10 (+5) require section review'
              : 'CSE (+18) & AI/DS (+11) require reconciliation'}
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
                (Students with Simulated Verification status ÷ Actual Enrolment) × 100 = (
                {totalSimVerified} ÷ {totalEnrolled}) × 100.
              </div>
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between font-mono tabular-nums">
            <span className="text-2xl sm:text-3xl font-bold text-teal-700">
              {totalEnrolled > 0 ? ((totalSimVerified / totalEnrolled) * 100).toFixed(1) : '0.0'}%
            </span>
            <span className="text-xs text-teal-700 font-semibold">
              {totalSimVerified} / {totalEnrolled}
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-teal-700">
            Remaining queued as Pending Official Verification
          </div>
        </div>
      </div>

      {/* Recharts Bar Chart: Approved Intake vs Actual Enrolment */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 sm:p-6 space-y-4 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <h2 className="font-display font-bold text-base text-[#0B1F3A] break-words">
              {isSchool
                ? 'Class-Wise Approved Intake vs Actual Enrolment (Classes 1 to 12)'
                : 'Programme-Wise Sanctioned Intake vs Actual Enrolment (Bar Chart)'}
            </h2>
            <p className="text-xs text-slate-500">
              {isSchool
                ? 'Comparing School / Junior College Class Capacity against Actual Enrolment and Simulated Verified records.'
                : 'Comparing AICTE Approved Intake against Actual ERP Enrolment and Simulated Verified records across branches.'}
            </p>
          </div>
          <div className="text-xs text-amber-700 font-medium">
            Demo data · {overIntakeProgs.length} {isSchool ? 'Classes' : 'Programmes'} Over Intake
          </div>
        </div>

        <div className="h-72 sm:h-80 w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 12, right: 20, left: 0, bottom: 8 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: '#475569' }}
                axisLine={{ stroke: '#CBD5E1' }}
              />
              <YAxis
                tick={{ fontSize: 12, fill: '#475569' }}
                axisLine={{ stroke: '#CBD5E1' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderColor: '#E2E8F0',
                  fontSize: '12px',
                  borderRadius: '6px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar
                dataKey="ApprovedIntake"
                name="Approved Intake"
                fill="#0B1F3A"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="ActualEnrolment"
                name="Actual Enrolment"
                fill="#D97706"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="SimulatedVerified"
                name="Simulated Verification"
                fill="#0D9488"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Class / Programme Breakdown Table */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-base text-[#0B1F3A]">
            {isSchool
              ? 'Class Intake & Verification Breakdown (School & Jr. College Workspace Only)'
              : 'Programme Intake & Verification Breakdown (College Workspace Only)'}
          </h2>
          <span className="text-xs text-slate-500">
            Over-intake rows flagged in crimson for{' '}
            {isSchool ? 'headmaster / principal' : 'registrar'} action
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-semibold text-slate-500">
                <th className="py-3 px-3">
                  {isSchool ? 'Class & School Wing' : 'Programme & Department'}
                </th>
                <th className="py-3 px-3">
                  {isSchool ? 'School / Junior College' : 'College Institution'}
                </th>
                <th className="py-3 px-3 text-right">Approved Intake</th>
                <th className="py-3 px-3 text-right">Actual Enrolment</th>
                <th className="py-3 px-3 text-right">Variance</th>
                <th className="py-3 px-3 text-right">Simulated Verification</th>
                <th className="py-3 px-3 text-right">Pending Official</th>
                <th className="py-3 px-3">Compliance Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {filteredProgrammes.map((prg) => {
                const diff = prg.actualEnrolment - prg.approvedIntake;
                const isOver = diff > 0;

                return (
                  <tr
                    key={prg.id}
                    className={
                      isOver ? 'bg-red-50/40 hover:bg-red-50/70' : 'hover:bg-slate-50'
                    }
                  >
                    <td className="py-3 px-3 font-medium text-slate-900">
                      <div>{prg.programmeName}</div>
                      <div className="text-[11px] text-slate-500">{prg.department}</div>
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      {prg.institutionName} ({prg.state})
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums">
                      {prg.approvedIntake}
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums font-semibold">
                      {prg.actualEnrolment}
                    </td>
                    <td
                      className={`py-3 px-3 text-right font-mono tabular-nums font-semibold ${
                        isOver ? 'text-red-600' : 'text-teal-700'
                      }`}
                    >
                      {diff > 0 ? `+${diff} Over` : diff === 0 ? 'Exact' : `${diff}`}
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-teal-700">
                      {prg.simulatedVerifiedCount}
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-amber-700">
                      {prg.pendingVerificationCount}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      {isOver ? (
                        <span className="inline-flex items-center gap-1.5 font-semibold text-red-600">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Over Intake Alert ({prg.flaggedDuplicateCount} dup flags)</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 font-semibold text-teal-700">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Within Approved Limit</span>
                        </span>
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

// 2. Management Sub-page: Wing / Department Compliance ("/college/departments" or "/school-management/departments")
export const CollegeDepartmentsPage: React.FC = () => {
  const { institutions, activeWorkspace } = useApp();
  const isSchool = activeWorkspace === 'school';

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs font-semibold text-teal-700">
          {isSchool ? 'School & Jr. College Readiness · Demo Data' : 'Campus-Level Readiness · Demo Data'}
        </div>
        <h1 className="font-display text-2xl font-bold text-[#0B1F3A] mt-0.5">
          {isSchool
            ? 'School Wing & Section Compliance Directory'
            : 'Institution & Department Compliance Directory'}
        </h1>
        <p className="text-xs text-slate-600 mt-1">
          {isSchool
            ? 'Comparison of synthetic Schools and Junior Colleges participating in the APAAR Ready sandbox (never mixed with degree colleges).'
            : 'Comparison of the synthetic engineering institutions participating in the APAAR Ready sandbox.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {institutions.map((inst) => (
          <div
            key={inst.id}
            className="bg-white border border-slate-200 rounded-lg p-6 space-y-4 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
                <span>{isSchool ? `UDISE: ${inst.aisheCode}` : `AISHE: ${inst.aisheCode}`}</span>
                <span>{inst.state}</span>
              </div>
              <h2 className="font-display font-bold text-base text-[#0B1F3A] mt-2">
                {inst.name}
              </h2>
              <div className="text-xs text-slate-500 mt-0.5">
                {inst.entityType} · {inst.type} · {inst.district}
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 text-xs font-mono tabular-nums">
                <div className="flex justify-between">
                  <span className="font-sans text-slate-600">Approved Intake:</span>
                  <span className="font-semibold text-slate-900">{inst.totalApprovedIntake}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-sans text-slate-600">Total Enrolled:</span>
                  <span
                    className={`font-semibold ${
                      inst.totalEnrolled > inst.totalApprovedIntake
                        ? 'text-red-600'
                        : 'text-teal-700'
                    }`}
                  >
                    {inst.totalEnrolled}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-sans text-slate-600">Simulated Readiness:</span>
                  <span className="font-semibold text-teal-700">{inst.apaarReadinessPct}%</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 text-xs flex items-center justify-between">
              <span
                className={
                  inst.overIntakeProgrammes > 0
                    ? 'text-red-600 font-semibold'
                    : 'text-teal-700 font-medium'
                }
              >
                {inst.overIntakeProgrammes}{' '}
                {isSchool ? 'Over-Capacity Class(es)' : 'Over-Intake Programme(s)'}
              </span>
              <span className="text-slate-500">{inst.unresolvedFlags} Open Flags</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 3. Management Sub-page: Over-Intake & Discrepancy Alerts ("/college/alerts" or "/school-management/alerts")
export const CollegeAlertsPage: React.FC = () => {
  const { programmes, activeWorkspace } = useApp();
  const isSchool = activeWorkspace === 'school';
  const overIntake = programmes.filter((p) => p.actualEnrolment > p.approvedIntake);

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs font-semibold text-red-600">
          {isSchool
            ? 'School Capacity Exceptions · Demo Data'
            : 'Intake Governance Exceptions · Demo Data'}
        </div>
        <h1 className="font-display text-2xl font-bold text-[#0B1F3A] mt-0.5">
          {isSchool
            ? `Over-Capacity & Section Reconciliation Alerts (${overIntake.length} Active)`
            : `Over-Intake & Seat Reconciliation Alerts (${overIntake.length} Active)`}
        </h1>
        <p className="text-xs text-slate-600 mt-1">
          {isSchool
            ? 'Root-cause breakdown for school classes where active section rosters exceed approved class intake.'
            : 'Detailed root-cause breakdown for the programmes where student ERP records exceed sanctioned intake.'}
        </p>
      </div>

      <div className="space-y-4">
        {overIntake.map((prg) => (
          <div
            key={prg.id}
            className="bg-white border border-slate-200 rounded-lg p-6 space-y-3"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-red-600 font-display font-bold text-base">
                <FileWarning className="w-5 h-5" />
                <span>
                  {prg.programmeName} — {prg.institutionName} ({prg.state})
                </span>
              </div>
              <span className="font-mono text-xs font-semibold text-red-600">
                Enrolled: {prg.actualEnrolment} / Approved: {prg.approvedIntake} (+
                {prg.actualEnrolment - prg.approvedIntake} Excess)
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              <strong>Diagnostic Note (Demo):</strong> {prg.flaggedDuplicateCount} records in this{' '}
              {isSchool ? 'class' : 'programme'} are flagged as potential duplicate transfer entries
              or pending section shifts. Resolving the duplicate queue in the Teacher Portal brings
              effective headcount within approved norms without deleting historical rows.
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

// 4. Management Sub-page: AI Audit Summary ("/college/ai-audit" or "/school-management/ai-audit")
export const CollegeAiAuditPage: React.FC = () => {
  const { activeWorkspace } = useApp();
  const isSchool = activeWorkspace === 'school';

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs font-semibold text-indigo-700">
          AI Governance Insights · Demo Data
        </div>
        <h1 className="font-display text-2xl font-bold text-[#0B1F3A] mt-0.5">
          {isSchool
            ? 'School & Jr. College AI Data Readiness Brief'
            : 'Institutional AI Data Readiness Brief'}
        </h1>
        <p className="text-xs text-slate-600 mt-1">
          Automated pre-submission diagnostics generated across the{' '}
          {isSchool ? 'demo schools & junior colleges' : '3 demo engineering institutions'}.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-5">
        <div className="flex items-center gap-2 text-indigo-700 font-display font-bold text-base">
          <Sparkles className="w-5 h-5" />
          <span>Key Pre-Verification Findings (Synthetic Dataset)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-md bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="font-semibold text-slate-900">
              {isSchool
                ? '1. Class 5 & Class 10 Transfer Duplicate Residuals'
                : '1. Sliding Round Duplicate Residuals'}
            </div>
            <p className="text-slate-600 leading-relaxed">
              {isSchool
                ? 'In Demo Public School, Hyderabad, inter-section shifts and mid-term transfer entries created +9 duplicate flags across Class 5 and Class 10.'
                : 'In Sahyadri Visvesvaraya College (Karnataka), students sliding from Electrical to AI & Data Science in Round 2 remained active in both departmental rosters, inflating AI & DS headcount by +11.'}
            </p>
          </div>

          <div className="p-4 rounded-md bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="font-semibold text-slate-900">
              2. Initial &amp; Honorific Token Variance
            </div>
            <p className="text-slate-600 leading-relaxed">
              Pending Official Verification records exhibit abbreviated initials (&ldquo;A.
              Reddy&rdquo; vs &ldquo;Ananya Reddy&rdquo; and &ldquo;P. Sharma&rdquo; vs
              &ldquo;Priya Sharma&rdquo;) that can be reviewed via the Teacher Smart Name-Mismatch
              Check.
            </p>
          </div>

          <div className="p-4 rounded-md bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="font-semibold text-slate-900">
              3. Zero-Destruction Audit Trail &amp; Last-3 Masking
            </div>
            <p className="text-slate-600 leading-relaxed">
              All student records retain immutable creation IDs with PEN and APAAR IDs masked to the
              last 3 characters. No automated record merges or deletions are permitted.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 5. STUDENT ADMISSIONS PAGE (/school-management/admissions & /college/admissions)
// New admissions by class/programme and category (General, OBC, SC, ST, EWS, RTE/State Quota)
// ============================================================================
export const ManagementStudentAdmissionsPage: React.FC = () => {
  const { programmes, students, selectedAcademicYear, activeWorkspace } = useApp();
  const isSchool = activeWorkspace === 'school';
  const [selectedClassOrProg, setSelectedClassOrProg] = useState<string>('ALL');

  const uniqueRows = React.useMemo(() => {
    const progs =
      selectedClassOrProg === 'ALL'
        ? programmes
        : programmes.filter((p) => p.programmeName === selectedClassOrProg);

    return progs.map((p, idx) => {
      const total = p.actualEnrolment;
      const gen = Math.round(total * 0.38);
      const obc = Math.round(total * 0.27);
      const sc = Math.round(total * 0.15);
      const st = Math.round(total * 0.08);
      const ews = Math.max(1, total - (gen + obc + sc + st));
      const rteOrQuota = isSchool ? Math.max(2, Math.round(total * 0.25)) : Math.round(total * 0.7);
      return {
        id: p.id,
        name: p.programmeName,
        department: p.department,
        institutionName: p.institutionName,
        sanctioned: p.approvedIntake,
        admitted: total,
        remaining: p.approvedIntake - total,
        gen,
        obc,
        sc,
        st,
        ews,
        rteOrQuota,
        newAdmissionsThisCycle: Math.max(4, Math.round(total * (idx % 2 === 0 ? 0.32 : 0.28))),
      };
    });
  }, [programmes, selectedClassOrProg, isSchool]);

  const uniqueNames = Array.from(new Set(programmes.map((p) => p.programmeName)));

  return (
    <div className="space-y-6 min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="text-xs font-semibold text-teal-700">
            {isSchool ? 'School Management · Admissions Roster' : 'College Management · Admissions Roster'} ·{' '}
            {selectedAcademicYear} (Demo Data)
          </div>
          <h1 className="font-display text-xl sm:text-2xl font-bold text-[#0B1F3A] mt-0.5">
            {isSchool
              ? `Student Admissions by Class & Category (${selectedAcademicYear})`
              : `Student Admissions by Programme & Category (${selectedAcademicYear})`}
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Breakdown of new and active admissions across reservation / admission categories and{' '}
            {isSchool ? 'RTE / State School Quota' : 'State Convener / Counselling Quota'}.
          </p>
        </div>

        <select
          aria-label="Filter by Class or Programme"
          value={selectedClassOrProg}
          onChange={(e) => setSelectedClassOrProg(e.target.value)}
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-[#0B1F3A]"
        >
          <option value="ALL">
            All {isSchool ? 'Classes (1–12)' : 'Programmes'} ({uniqueNames.length})
          </option>
          {uniqueNames.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="text-xs text-slate-500 font-medium">Total Active Roster</div>
          <div className="font-mono text-2xl font-bold text-[#0B1F3A] mt-1">
            {students.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            100% synthetic records in {isSchool ? 'School' : 'College'} workspace
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="text-xs text-slate-500 font-medium">
            New Admissions ({selectedAcademicYear})
          </div>
          <div className="font-mono text-2xl font-bold text-teal-700 mt-1">
            {uniqueRows.reduce((a, r) => a + r.newAdmissionsThisCycle, 0)}
          </div>
          <div className="text-[11px] text-teal-700 mt-1">
            Admitted between 01/04/2026 and 31/10/2026
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="text-xs text-slate-500 font-medium">
            {isSchool ? 'RTE & State Quota Admissions' : 'State Convener Quota Admissions'}
          </div>
          <div className="font-mono text-2xl font-bold text-indigo-700 mt-1">
            {uniqueRows.reduce((a, r) => a + r.rteOrQuota, 0)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Verified against sanctioned {isSchool ? 'UDISE+' : 'AICTE'} intake norms
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-5 overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 text-[11px] font-semibold text-slate-500 bg-slate-50">
              <th className="py-2.5 px-3">{isSchool ? 'Class & Wing' : 'Programme & Dept'}</th>
              <th className="py-2.5 px-3">Institution</th>
              <th className="py-2.5 px-3 text-right">Sanctioned</th>
              <th className="py-2.5 px-3 text-right">Total Admitted</th>
              <th className="py-2.5 px-3 text-right">New ({selectedAcademicYear})</th>
              <th className="py-2.5 px-3 text-right">General</th>
              <th className="py-2.5 px-3 text-right">OBC</th>
              <th className="py-2.5 px-3 text-right">SC</th>
              <th className="py-2.5 px-3 text-right">ST</th>
              <th className="py-2.5 px-3 text-right">EWS</th>
              <th className="py-2.5 px-3 text-right">
                {isSchool ? 'RTE Quota' : 'Convener Quota'}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 font-mono tabular-nums">
            {uniqueRows.length === 0 ? (
              <tr>
                <td colSpan={11} className="py-8 text-center font-sans text-slate-500">
                  No admission records match the selected filter.
                </td>
              </tr>
            ) : (
              uniqueRows.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-sans font-semibold text-slate-900">
                    <div>{row.name}</div>
                    <div className="text-[11px] text-slate-500 font-normal">{row.department}</div>
                  </td>
                  <td className="py-2.5 px-3 font-sans text-slate-600">{row.institutionName}</td>
                  <td className="py-2.5 px-3 text-right">{row.sanctioned}</td>
                  <td className="py-2.5 px-3 text-right font-bold text-[#0B1F3A]">
                    {row.admitted}
                  </td>
                  <td className="py-2.5 px-3 text-right text-teal-700 font-semibold">
                    +{row.newAdmissionsThisCycle}
                  </td>
                  <td className="py-2.5 px-3 text-right">{row.gen}</td>
                  <td className="py-2.5 px-3 text-right">{row.obc}</td>
                  <td className="py-2.5 px-3 text-right">{row.sc}</td>
                  <td className="py-2.5 px-3 text-right">{row.st}</td>
                  <td className="py-2.5 px-3 text-right">{row.ews}</td>
                  <td className="py-2.5 px-3 text-right text-indigo-700 font-semibold">
                    {row.rteOrQuota}
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

// ============================================================================
// 7. DATA QUALITY PAGE (/school-management/data-quality & /college/data-quality)
// Score breakdown, weights visible, issues by rule, encouraging improvement wording
// ============================================================================
export const ManagementDataQualityPage: React.FC = () => {
  const { students, activeWorkspace, selectedAcademicYear } = useApp();
  const isSchool = activeWorkspace === 'school';

  const avgScore =
    students.length > 0
      ? Math.round(students.reduce((a, s) => a + s.dataQualityScore, 0) / students.length)
      : 87;

  const missingApaar = students.filter((s) => !s.apaarId).length;
  const mismatchFlagged = students.filter(
    (s) => s.verificationStatus === 'Mismatch Flagged'
  ).length;
  const pendingOfficial = students.filter(
    (s) => s.verificationStatus === 'Pending Official Verification'
  ).length;
  const pendingConsent = students.filter(
    (s) => !s.apaarId && s.consentStatus !== 'obtained'
  ).length;

  const weights = [
    {
      component: '1. Core Demographic & Enrolment Completeness',
      weightPct: 35,
      achievedPct: 94,
      description: `Student name, ISO Date of Birth, Gender, ${
        isSchool ? 'Class (1–12), Section & Medium' : 'Programme, Department, Semester & Section'
      }.`,
    },
    {
      component: '2. PEN (11-Digit) & APAAR (12-Digit) Format & Checksum',
      weightPct: 30,
      achievedPct: 86,
      description:
        'Local format validation of 11-digit PEN and 12-digit APAAR numbers (masked to last 3 digits).',
    },
    {
      component: '3. Smart Name-Mismatch & DOB Consistency',
      weightPct: 20,
      achievedPct: 82,
      description:
        'Alignment between institutional admission register name and simulated Aadhaar card name.',
    },
    {
      component: '4. Parent / Guardian Consent & Duplicate Resolution',
      weightPct: 15,
      achievedPct: 85,
      description:
        'Recorded parent consent for students without APAAR ID and human review of duplicate candidates.',
    },
  ];

  const ruleIssues = [
    {
      ruleCode: 'RULE-4.1.1 / 4.1.8',
      title: 'Name Spelling / Initial Variation vs Simulated Aadhaar',
      affectedCount: mismatchFlagged,
      severity: 'Should Check',
      encouragement:
        'Reviewing initials and surname order via the Smart Name-Mismatch Check helps prevent eKYC rejection.',
    },
    {
      ruleCode: 'RULE-APAAR-CONSENT',
      title: 'Missing APAAR ID Awaiting Parent / Guardian Consent',
      affectedCount: pendingConsent,
      severity: 'Must Fix Before Seeding',
      encouragement:
        'Use the Simulated Parent Consent Link (/consent/:token) in Step 1 to record guardian approval.',
    },
    {
      ruleCode: 'RULE-APAAR-SEED',
      title: 'Records Without 12-Digit APAAR Number Recorded Yet',
      affectedCount: missingApaar,
      severity: 'FYI / Readiness',
      encouragement:
        'Once consent is obtained, nodal staff can mark records Ready for APAAR Creation in the APAAR Module.',
    },
    {
      ruleCode: 'RULE-REGISTRY-SYNC',
      title: 'Queued for Official Verification Handshake',
      affectedCount: pendingOfficial,
      severity: 'Simulated Queue',
      encouragement:
        'Local validation is complete; records are ready for the next authorized registry sync window.',
    },
  ];

  return (
    <div className="space-y-6 min-w-0">
      <div>
        <div className="text-xs font-semibold text-indigo-700">
          {isSchool ? 'School Data Quality Coach' : 'College Data Quality Coach'} · Supportive
          Readiness Breakdown ({selectedAcademicYear})
        </div>
        <h1 className="font-display text-xl sm:text-2xl font-bold text-[#0B1F3A] mt-0.5">
          {isSchool
            ? 'School Data Quality Score Breakdown & Rule Diagnostics'
            : 'College Data Quality Score Breakdown & Rule Diagnostics'}
        </h1>
        <p className="text-xs text-slate-600 mt-1">
          Transparent scoring weights and rule-by-rule guidance designed to encourage steady
          improvement across your {isSchool ? 'school' : 'college'} roster—never used for punitive
          ranking.
        </p>
      </div>

      {/* Encouraging Coach Banner */}
      <div className="bg-gradient-to-r from-[#0B1F3A] to-indigo-950 text-white rounded-lg p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-teal-500/20 border border-teal-400/30 text-teal-200 text-[11px] font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>
              {isSchool ? 'School Data Quality Coach' : 'College Data Quality Coach'} · Encouraging
              Readiness Assessment
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-lg font-display font-bold">
            <span>Data Quality Score:</span>
            <span className="font-mono text-teal-300 text-2xl">{avgScore}%</span>
            <div className="relative group">
              <button
                type="button"
                aria-label="Data Quality Score formula"
                className="text-indigo-200 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-300 rounded"
              >
                <Info className="w-4 h-4" />
              </button>
              <div
                role="tooltip"
                className="pointer-events-none absolute left-0 top-6 z-20 hidden group-hover:block group-focus-within:block w-72 p-2.5 rounded-md bg-slate-950 border border-slate-700 text-white font-sans font-normal text-[11px] leading-relaxed shadow-xl"
              >
                <strong className="text-teal-300 block mb-0.5">Data Quality Score Formula:</strong>
                Weighted average of Core Completeness (35%) + PEN/APAAR Format (30%) + Smart
                Name-Mismatch Consistency (20%) + Parent Consent &amp; Duplicate Review (15%).
              </div>
            </div>
          </div>
          <p className="text-xs text-slate-200 leading-relaxed">
            Your {isSchool ? 'school teachers' : 'college faculty nodal officers'} have built a
            strong baseline across {students.length} student records. Resolving the{' '}
            {mismatchFlagged} name-variation flags and {pendingConsent} pending consent requests
            will lift your readiness score above 94%.
          </p>
        </div>
        <div className="bg-white/10 border border-white/15 rounded-md p-3.5 text-xs font-mono shrink-0">
          <div className="text-slate-300">Formula Transparency:</div>
          <div className="text-teal-300 font-bold mt-1">35% + 30% + 20% + 15% = 100%</div>
          <div className="text-[11px] text-slate-300 mt-0.5">All weights visible to staff</div>
        </div>
      </div>

      {/* Visible Weights Table */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
        <h2 className="font-display font-bold text-base text-[#0B1F3A]">
          1. Data Quality Scoring Weights (100% Transparent Formula)
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-semibold text-slate-500 bg-slate-50">
                <th className="py-2.5 px-3">Scoring Dimension</th>
                <th className="py-2.5 px-3 text-right">Formula Weight</th>
                <th className="py-2.5 px-3 text-right">Current Achievement</th>
                <th className="py-2.5 px-3">What This Measures</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {weights.map((w) => (
                <tr key={w.component} className="hover:bg-slate-50">
                  <td className="py-3 px-3 font-semibold text-slate-900">{w.component}</td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-indigo-700">
                    {w.weightPct}%
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-teal-700">
                    {w.achievedPct}%
                  </td>
                  <td className="py-3 px-3 text-slate-600">{w.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Issues by Rule */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
        <h2 className="font-display font-bold text-base text-[#0B1F3A]">
          2. Open Opportunities for Improvement by Validation Rule
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {ruleIssues.map((r) => (
            <div key={r.ruleCode} className="p-4 rounded-lg border border-slate-200 bg-slate-50/70 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono font-bold text-indigo-800 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded text-[11px]">
                  {r.ruleCode}
                </span>
                <span className="font-mono font-bold text-sm text-[#0B1F3A]">
                  {r.affectedCount} record(s)
                </span>
              </div>
              <div className="font-display font-bold text-sm text-slate-900">{r.title}</div>
              <p className="text-slate-600 leading-relaxed">{r.encouragement}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 9. APAAR READINESS PAGE (/school-management/readiness & /college/readiness)
// Completeness, local validation, official verification kept separate, funnel,
// and mandatory banner: "A recorded APAAR ID does not mean it is authentic or officially verified."
// ============================================================================
export const ManagementApaarReadinessPage: React.FC = () => {
  const { students, activeWorkspace, selectedAcademicYear } = useApp();
  const isSchool = activeWorkspace === 'school';

  const total = students.length;
  const completeProfile = students.filter((s) => s.dataQualityScore >= 75).length;
  const locallyValidated = students.filter((s) => Boolean(s.apaarId)).length;
  const simulatedVerified = students.filter(
    (s) => s.verificationStatus === 'Simulated Verification'
  ).length;
  const pendingOfficial = students.filter(
    (s) => s.verificationStatus === 'Pending Official Verification'
  ).length;

  const funnelStages = [
    {
      step: 'Stage 1: Profile Completeness',
      count: completeProfile,
      pct: total > 0 ? Math.round((completeProfile / total) * 100) : 0,
      note: 'Core demographic fields, DOB, gender, and class/programme recorded locally.',
      barColor: 'bg-slate-700',
    },
    {
      step: 'Stage 2: Local Format & Checksum Validation',
      count: locallyValidated,
      pct: total > 0 ? Math.round((locallyValidated / total) * 100) : 0,
      note: '11-digit PEN and 12-digit APAAR format rules pass local syntax checks.',
      barColor: 'bg-indigo-600',
    },
    {
      step: 'Stage 3: Simulated Verification Ready (Sandbox)',
      count: simulatedVerified,
      pct: total > 0 ? Math.round((simulatedVerified / total) * 100) : 0,
      note: 'Passed local Smart Name-Mismatch and duplicate checks (Simulated Verification only).',
      barColor: 'bg-teal-600',
    },
    {
      step: 'Stage 4: Official Government Registry Verification',
      count: 0,
      pct: 0,
      note: `${pendingOfficial} queued · Requires live authorized DigiLocker / ABC / UDISE+ API integration (kept strictly separate from local validation).`,
      barColor: 'bg-amber-500',
    },
  ];

  return (
    <div className="space-y-6 min-w-0">
      <div>
        <div className="text-xs font-semibold text-teal-700">
          {isSchool ? 'School Management · APAAR Funnel' : 'College Management · APAAR Funnel'} ·{' '}
          {selectedAcademicYear}
        </div>
        <h1 className="font-display text-xl sm:text-2xl font-bold text-[#0B1F3A] mt-0.5">
          APAAR Readiness Funnel (Completeness vs Local Validation vs Official Verification)
        </h1>
      </div>

      {/* Mandatory Safeguard Banner */}
      <div
        role="alert"
        className="p-4 rounded-lg bg-amber-50 border-2 border-amber-300 text-amber-950 flex items-start gap-3 text-xs"
      >
        <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-display font-bold text-sm text-amber-900">
            A recorded APAAR ID does not mean it is authentic or officially verified.
          </div>
          <p className="leading-relaxed text-amber-900">
            This portal keeps <strong>Profile Completeness</strong>,{' '}
            <strong>Local Format Validation</strong>, and{' '}
            <strong>Official Registry Verification</strong> strictly separate so institutions never
            mistake a locally typed 12-digit number for an officially authenticated government ID.
          </p>
        </div>
      </div>

      {/* Funnel Visualization */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 sm:p-6 space-y-5">
        <h2 className="font-display font-bold text-base text-[#0B1F3A]">
          4-Stage Readiness Funnel ({isSchool ? 'School Workspace' : 'College Workspace'})
        </h2>
        <div className="space-y-4">
          {funnelStages.map((st) => (
            <div key={st.step} className="p-4 rounded-lg border border-slate-200 bg-slate-50/60 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="font-display font-bold text-sm text-[#0B1F3A]">{st.step}</span>
                <span className="font-mono font-bold text-sm text-slate-900">
                  {st.count} / {total} ({st.pct}%)
                </span>
              </div>
              <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${st.barColor}`}
                  style={{ width: `${Math.max(4, st.pct)}%` }}
                />
              </div>
              <p className="text-xs text-slate-600">{st.note}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 10. IDENTITY VERIFICATION PAGE (/school-management/verification & /college/verification)
// Simulated, with banner: "Official verification requires an authorized integration. Results shown here are simulated."
// ============================================================================
export const ManagementIdentityVerificationPage: React.FC = () => {
  const { students, activeWorkspace, applyStandardization, addToast } = useApp();
  const isSchool = activeWorkspace === 'school';
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const rows = students.filter(
    (s) => filterStatus === 'ALL' || s.verificationStatus === filterStatus
  );

  return (
    <div className="space-y-6 min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="text-xs font-semibold text-indigo-700">
            Simulated Identity Verification Monitor · Demo Data
          </div>
          <h1 className="font-display text-xl sm:text-2xl font-bold text-[#0B1F3A] mt-0.5">
            {isSchool
              ? 'School Identity Verification Queue (Simulated)'
              : 'College Identity Verification Queue (Simulated)'}
          </h1>
        </div>

        <select
          aria-label="Filter Verification Queue"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-[#0B1F3A]"
        >
          <option value="ALL">All Verification States ({students.length})</option>
          <option value="Simulated Verification">Simulated Verification</option>
          <option value="Pending Official Verification">Pending Official Verification</option>
          <option value="Mismatch Flagged">Mismatch Flagged</option>
          <option value="Missing APAAR ID">Missing APAAR ID</option>
        </select>
      </div>

      {/* Mandatory Simulated Integration Banner */}
      <div
        role="alert"
        className="p-4 rounded-lg bg-indigo-50 border-2 border-indigo-200 text-indigo-950 flex items-start gap-3 text-xs"
      >
        <Sparkles className="w-5 h-5 text-indigo-700 shrink-0 mt-0.5" />
        <div>
          <div className="font-display font-bold text-sm text-indigo-950">
            Official verification requires an authorized integration. Results shown here are
            simulated.
          </div>
          <p className="mt-1 text-indigo-900 leading-relaxed">
            All PEN and APAAR identifiers remain masked to the last 3 characters. No live UIDAI,
            DigiLocker, or UDISE+ network calls are performed in this sandbox.
          </p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-5 overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 text-[11px] font-semibold text-slate-500 bg-slate-50">
              <th className="py-2.5 px-3">Roll No</th>
              <th className="py-2.5 px-3">Student Name</th>
              <th className="py-2.5 px-3">{isSchool ? 'Class & Section' : 'Programme & Sem'}</th>
              <th className="py-2.5 px-3">PEN (Masked)</th>
              <th className="py-2.5 px-3">APAAR ID (Masked)</th>
              <th className="py-2.5 px-3">Simulated Verification Status</th>
              <th className="py-2.5 px-3 text-right">Sandbox Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {rows.slice(0, 40).map((s) => (
              <tr key={s.id} className="hover:bg-slate-50">
                <td className="py-2.5 px-3 font-mono font-semibold text-slate-900">{s.rollNo}</td>
                <td className="py-2.5 px-3 font-medium text-slate-900">{s.fullName}</td>
                <td className="py-2.5 px-3 text-slate-600">
                  {s.className || s.programme} · {s.section || 'Section A'}
                </td>
                <td className="py-2.5 px-3 font-mono text-slate-700">
                  •••• •••• {s.pen.slice(-3)}
                </td>
                <td className="py-2.5 px-3 font-mono text-slate-700">
                  {s.apaarId ? `•••• •••• •${s.apaarId.slice(-3)}` : 'Not Assigned'}
                </td>
                <td className="py-2.5 px-3 font-semibold text-[#0B1F3A]">
                  {s.verificationStatus}
                </td>
                <td className="py-2.5 px-3 text-right">
                  {s.verificationStatus !== 'Simulated Verification' ? (
                    <button
                      type="button"
                      onClick={() => {
                        applyStandardization(s.id);
                        addToast(
                          `Simulated verification check completed for ${s.fullName}.`,
                          'success'
                        );
                      }}
                      className="px-2.5 py-1 rounded bg-teal-600 text-white font-semibold text-[11px] hover:bg-teal-700"
                    >
                      Run Simulated Check
                    </button>
                  ) : (
                    <span className="text-[11px] text-teal-700 font-semibold">
                      Verified (Simulated)
                    </span>
                  )}
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
// 11. ADMISSION RECONCILIATION PAGE (/school-management/reconciliation & /college/reconciliation)
// Over-intake and mismatch cases, never auto-resolved, simulated "Escalate" to education authority
// ============================================================================
export const ManagementReconciliationPage: React.FC = () => {
  const { programmes, students, activeWorkspace, addAuditLog, addToast, session } = useApp();
  const isSchool = activeWorkspace === 'school';
  const [escalatedIds, setEscalatedIds] = useState<Record<string, string>>({});
  const [escalationNotes, setEscalationNotes] = useState<Record<string, string>>({});

  const overIntake = programmes.filter((p) => p.actualEnrolment > p.approvedIntake);
  const mismatchStudents = students.filter(
    (s) =>
      s.verificationStatus === 'Mismatch Flagged' ||
      s.studentStatus === 'Transferred (TC Issued)'
  );

  const handleEscalate = (id: string, label: string) => {
    const reason =
      (escalationNotes[id] || '').trim() ||
      `Requesting sanctioned seat / transfer reconciliation review from ${
        isSchool ? 'District Education Officer (DEO / UDISE+)' : 'State Technical Directorate / AICTE'
      }.`;
    const ts = new Date().toISOString().replace('T', ' ').slice(0, 16);
    setEscalatedIds((prev) => ({ ...prev, [id]: ts }));
    addAuditLog({
      actor: session.userName,
      role: session.roleDisplayLabel || session.designation,
      action: 'RECONCILIATION_ESCALATED_SIM',
      targetStudentId: id,
      details: `Simulated escalation to education authority for ${label}: ${reason}`,
    });
    addToast(`Escalated ${label} to Education Authority (Simulated).`, 'info');
  };

  return (
    <div className="space-y-6 min-w-0">
      <div>
        <div className="text-xs font-semibold text-red-600">
          Human-in-the-Loop Seat &amp; Transfer Reconciliation · Never Auto-Resolved
        </div>
        <h1 className="font-display text-xl sm:text-2xl font-bold text-[#0B1F3A] mt-0.5">
          {isSchool
            ? 'School Admission & Transfer Reconciliation (Classes 1–12)'
            : 'College Admission & Seat Reconciliation'}
        </h1>
        <p className="text-xs text-slate-600 mt-1">
          Over-intake classes/programmes and inter-institution transfer mismatches are never
          auto-resolved or auto-deleted. Headmasters/Principals can document notes and trigger a{' '}
          <strong>Simulated Escalation</strong> to the education authority.
        </p>
      </div>

      {/* Over-Intake Reconciliation Cards */}
      <div className="space-y-4">
        <h2 className="font-display font-bold text-base text-[#0B1F3A]">
          1. Over-Intake {isSchool ? 'Class' : 'Programme'} Cases ({overIntake.length})
        </h2>
        {overIntake.map((prg) => {
          const isEscalated = Boolean(escalatedIds[prg.id]);
          return (
            <div
              key={prg.id}
              className="bg-white border border-slate-200 rounded-lg p-5 space-y-3 text-xs"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="font-display font-bold text-base text-red-600 flex items-center gap-2">
                  <FileWarning className="w-5 h-5" />
                  <span>
                    {prg.programmeName} — {prg.institutionName}
                  </span>
                </div>
                <span className="font-mono font-bold text-red-600">
                  Enrolled: {prg.actualEnrolment} / Sanctioned: {prg.approvedIntake} (+
                  {prg.actualEnrolment - prg.approvedIntake} Excess)
                </span>
              </div>

              <p className="text-slate-600 leading-relaxed">
                <strong>Reconciliation Status:</strong> {prg.flaggedDuplicateCount} duplicate or
                unwithdrawn transfer entries detected. Records are never auto-deleted.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2">
                <input
                  type="text"
                  value={escalationNotes[prg.id] || ''}
                  onChange={(e) =>
                    setEscalationNotes((prev) => ({ ...prev, [prg.id]: e.target.value }))
                  }
                  placeholder={`Enter reconciliation note for ${
                    isSchool ? 'District Education Officer (UDISE+)' : 'University / AICTE Cell'
                  }...`}
                  className="flex-1 rounded border border-slate-300 px-3 py-1.5 text-xs"
                />
                <button
                  type="button"
                  onClick={() => handleEscalate(prg.id, prg.programmeName)}
                  className="px-4 py-2 rounded bg-[#0B1F3A] text-white font-semibold hover:bg-slate-800 whitespace-nowrap"
                >
                  {isEscalated
                    ? `Escalated (${escalatedIds[prg.id]} · Simulated)`
                    : 'Escalate to Education Authority (Simulated)'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Transfer & Demographic Mismatch Reconciliation */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
        <h2 className="font-display font-bold text-base text-[#0B1F3A]">
          2. Student Transfer &amp; Mismatch Cases Requiring Reconciliation (
          {mismatchStudents.length})
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-semibold text-slate-500 bg-slate-50">
                <th className="py-2.5 px-3">Roll No</th>
                <th className="py-2.5 px-3">Student Name</th>
                <th className="py-2.5 px-3">{isSchool ? 'Class' : 'Programme'}</th>
                <th className="py-2.5 px-3">Case Type</th>
                <th className="py-2.5 px-3">Diagnostic Summary</th>
                <th className="py-2.5 px-3 text-right">Simulated Authority Escalation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {mismatchStudents.slice(0, 15).map((s) => {
                const isEsc = Boolean(escalatedIds[s.id]);
                return (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-mono font-semibold">{s.rollNo}</td>
                    <td className="py-2.5 px-3 font-medium text-slate-900">{s.fullName}</td>
                    <td className="py-2.5 px-3">{s.className || s.programme}</td>
                    <td className="py-2.5 px-3 font-semibold text-amber-800">
                      {s.studentStatus === 'Transferred (TC Issued)'
                        ? 'Transfer Certificate Reconciliation'
                        : 'Demographic Mismatch'}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">
                      {s.inactiveReason || s.aiIssueNote || 'Requires nodal reconciliation'}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleEscalate(s.id, `${s.fullName} (${s.rollNo})`)}
                        className={`px-3 py-1 rounded text-[11px] font-semibold ${
                          isEsc
                            ? 'bg-teal-50 text-teal-800 border border-teal-200'
                            : 'bg-indigo-600 text-white hover:bg-indigo-700'
                        }`}
                      >
                        {isEsc ? 'Escalated (Simulated)' : 'Escalate (Simulated)'}
                      </button>
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
// 12. ANALYTICS PAGE (/school-management/analytics & /college/analytics)
// Gender, class/programme-wise, category, CWSN (aggregated, groups < 5 suppressed), view-as-table toggle
// ============================================================================
export const ManagementAnalyticsPage: React.FC = () => {
  const { students, programmes, activeWorkspace, selectedAcademicYear } = useApp();
  const isSchool = activeWorkspace === 'school';
  const [viewAsTable, setViewAsTable] = useState<boolean>(false);

  const boys = students.filter((s) => s.gender === 'M').length;
  const girls = students.filter((s) => s.gender === 'F').length;
  const others = students.filter((s) => s.gender === 'O').length;

  const cohortAnalytics = React.useMemo(() => {
    const names = Array.from(new Set(programmes.map((p) => p.programmeName)));
    return names.map((name) => {
      const cohort = students.filter((s) => s.programme === name || s.className === name);
      const m = cohort.filter((s) => s.gender === 'M').length;
      const f = cohort.filter((s) => s.gender === 'F').length;
      const cwsnRaw = cohort.filter((s) => s.cwsnDetails?.isCwsn).length;
      return {
        cohort: name.replace(' (MPC / BiPC)', ''),
        Boys: m,
        Girls: f,
        Total: cohort.length,
        cwsnRaw,
        cwsnDisplay:
          cwsnRaw === 0 ? '0' : cwsnRaw < 5 ? '< 5 (Suppressed)' : String(cwsnRaw),
      };
    });
  }, [programmes, students]);

  return (
    <div className="space-y-6 min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="text-xs font-semibold text-teal-700">
            Aggregated Institutional Analytics · CWSN Cohorts &lt; 5 Privacy Suppressed
          </div>
          <h1 className="font-display text-xl sm:text-2xl font-bold text-[#0B1F3A] mt-0.5">
            {isSchool
              ? `School Demographic, Class & CWSN Analytics (${selectedAcademicYear})`
              : `College Demographic, Programme & CWSN Analytics (${selectedAcademicYear})`}
          </h1>
        </div>

        <button
          type="button"
          onClick={() => setViewAsTable(!viewAsTable)}
          className="px-4 py-2 rounded-md border border-slate-300 bg-white text-xs font-semibold text-[#0B1F3A] hover:bg-slate-50 self-start sm:self-center"
        >
          {viewAsTable ? 'Switch to Visual Chart View' : 'View as Accessible Table'}
        </button>
      </div>

      {/* Gender Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="text-xs text-slate-500">Female Students (Girls)</div>
          <div className="font-mono text-2xl font-bold text-teal-700 mt-1">
            {girls} ({students.length > 0 ? Math.round((girls / students.length) * 100) : 0}%)
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="text-xs text-slate-500">Male Students (Boys)</div>
          <div className="font-mono text-2xl font-bold text-[#0B1F3A] mt-1">
            {boys} ({students.length > 0 ? Math.round((boys / students.length) * 100) : 0}%)
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="text-xs text-slate-500">Transgender / Other</div>
          <div className="font-mono text-2xl font-bold text-indigo-700 mt-1">{others}</div>
        </div>
      </div>

      {viewAsTable ? (
        <div className="bg-white border border-slate-200 rounded-lg p-5 overflow-x-auto">
          <h2 className="font-display font-bold text-base text-[#0B1F3A] mb-3">
            Accessible Tabular View — {isSchool ? 'Class-Wise' : 'Programme-Wise'} &amp; CWSN
            Distribution
          </h2>
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-semibold text-slate-500 bg-slate-50">
                <th className="py-2.5 px-3">{isSchool ? 'Class' : 'Programme'}</th>
                <th className="py-2.5 px-3 text-right">Boys</th>
                <th className="py-2.5 px-3 text-right">Girls</th>
                <th className="py-2.5 px-3 text-right">Total</th>
                <th className="py-2.5 px-3 text-right">CWSN Count (Groups &lt; 5 Suppressed)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-mono">
              {cohortAnalytics.map((r) => (
                <tr key={r.cohort} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-sans font-semibold text-slate-900">
                    {r.cohort}
                  </td>
                  <td className="py-2.5 px-3 text-right">{r.Boys}</td>
                  <td className="py-2.5 px-3 text-right">{r.Girls}</td>
                  <td className="py-2.5 px-3 text-right font-bold">{r.Total}</td>
                  <td className="py-2.5 px-3 text-right text-indigo-700 font-semibold">
                    {r.cwsnDisplay}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
          <h2 className="font-display font-bold text-base text-[#0B1F3A]">
            {isSchool ? 'Class-Wise Gender Breakdown' : 'Programme-Wise Gender Breakdown'}
          </h2>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cohortAnalytics}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="cohort" tick={{ fontSize: 11, fill: '#475569' }} />
                <YAxis tick={{ fontSize: 12, fill: '#475569' }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="Girls" fill="#0D9488" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Boys" fill="#0B1F3A" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 14. STAFF AND PERMISSIONS PAGE (/school-management/staff & /college/staff)
// Teachers and class teacher assignments, permission toggles, sensitive access needs a reason
// ============================================================================
export const ManagementStaffPermissionsPage: React.FC = () => {
  const {
    managedSections,
    activeWorkspace,
    canViewSensitive,
    setCanViewSensitive,
    isClassTeacherScoped,
    setIsClassTeacherScoped,
    addAuditLog,
    addToast,
    session,
  } = useApp();
  const isSchool = activeWorkspace === 'school';
  const [sensitiveReason, setSensitiveReason] = useState('');
  const [reasonError, setReasonError] = useState<string | null>(null);

  const workspaceSections = managedSections.filter((sec) => {
    const isSchoolSec = sec.programmeName.startsWith('Class ');
    return isSchool ? isSchoolSec : !isSchoolSec;
  });

  const handleSensitiveToggle = () => {
    setReasonError(null);
    if (!canViewSensitive) {
      if (sensitiveReason.trim().length < 6) {
        setReasonError(
          'Enabling sensitive access (can_view_sensitive) requires a written governance reason (min 6 characters).'
        );
        return;
      }
      setCanViewSensitive(true);
      addAuditLog({
        actor: session.userName,
        role: session.roleDisplayLabel || session.designation,
        action: 'SENSITIVE_ACCESS_GRANTED',
        targetStudentId: 'STAFF_PERMISSIONS',
        details: `Enabled can_view_sensitive permission. Reason: ${sensitiveReason.trim()}`,
      });
      addToast('Sensitive access enabled and logged to the Audit Trail.', 'warning');
      setSensitiveReason('');
    } else {
      setCanViewSensitive(false);
      addAuditLog({
        actor: session.userName,
        role: session.roleDisplayLabel || session.designation,
        action: 'SENSITIVE_ACCESS_REVOKED',
        targetStudentId: 'STAFF_PERMISSIONS',
        details: 'Revoked can_view_sensitive permission; reverted to strict masking.',
      });
      addToast('Sensitive access revoked.', 'info');
    }
  };

  return (
    <div className="space-y-6 min-w-0">
      <div>
        <div className="text-xs font-semibold text-teal-700">
          Role-Based Access Control &amp; Class Teacher Assignments · Demo Data
        </div>
        <h1 className="font-display text-xl sm:text-2xl font-bold text-[#0B1F3A] mt-0.5">
          {isSchool
            ? 'School Staff, Class Teacher Assignments & Permissions'
            : 'College Faculty Advisors & Permissions'}
        </h1>
        <p className="text-xs text-slate-600 mt-1">
          Manage assigned class teachers and sensitive data permissions. Enabling{' '}
          <code className="font-mono">can_view_sensitive</code> requires an explicit written reason
          and writes an immutable audit entry.
        </p>
      </div>

      {/* Sensitive Access Control Card */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4 text-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display font-bold text-base text-[#0B1F3A]">
              1. Sensitive Identifier &amp; Partial PEN Search Permission (can_view_sensitive)
            </h2>
            <p className="text-slate-600 mt-0.5">
              Current state:{' '}
              <strong className={canViewSensitive ? 'text-teal-700' : 'text-slate-800'}>
                {canViewSensitive ? 'ENABLED (Audit Logged)' : 'DISABLED (Default Masked)'}
              </strong>
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsClassTeacherScoped(!isClassTeacherScoped)}
            className="px-3 py-1.5 rounded border border-indigo-200 bg-indigo-50 text-indigo-900 font-semibold"
          >
            Teacher RLS Scope Mode:{' '}
            {isClassTeacherScoped ? 'Assigned Classes Only' : 'Full Institution Roster'}
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <input
            type="text"
            value={sensitiveReason}
            onChange={(e) => {
              setSensitiveReason(e.target.value);
              setReasonError(null);
            }}
            placeholder="Required reason to enable sensitive access (e.g. Board verification audit for Class 10)..."
            className="flex-1 rounded-md border border-slate-300 px-3.5 py-2 text-xs"
          />
          <button
            type="button"
            onClick={handleSensitiveToggle}
            className={`px-4 py-2 rounded-md font-semibold text-white whitespace-nowrap ${
              canViewSensitive
                ? 'bg-amber-600 hover:bg-amber-700'
                : 'bg-[#0B1F3A] hover:bg-slate-800'
            }`}
          >
            {canViewSensitive
              ? 'Revoke Sensitive Access'
              : 'Grant Sensitive Access (Reason Required)'}
          </button>
        </div>

        {reasonError && (
          <div className="p-3 rounded bg-red-50 border border-red-200 text-red-700 font-medium">
            {reasonError}
          </div>
        )}
      </div>

      {/* Staff & Class Teacher Matrix */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-3 overflow-x-auto">
        <h2 className="font-display font-bold text-base text-[#0B1F3A]">
          2. Active {isSchool ? 'Class & Section Teacher' : 'Programme & Section Faculty'} Matrix
        </h2>
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 text-[11px] font-semibold text-slate-500 bg-slate-50">
              <th className="py-2.5 px-3">{isSchool ? 'Class' : 'Programme'}</th>
              <th className="py-2.5 px-3">Section</th>
              <th className="py-2.5 px-3">Assigned Class Teacher / Faculty</th>
              <th className="py-2.5 px-3 text-right">Sanctioned Capacity</th>
              <th className="py-2.5 px-3">RLS Data Scope</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {workspaceSections.map((sec) => (
              <tr key={sec.id} className="hover:bg-slate-50">
                <td className="py-2.5 px-3 font-semibold text-slate-900">{sec.programmeName}</td>
                <td className="py-2.5 px-3 font-mono">{sec.sectionName}</td>
                <td className="py-2.5 px-3 font-medium text-[#0B1F3A]">{sec.classTeacher}</td>
                <td className="py-2.5 px-3 text-right font-mono">{sec.capacity}</td>
                <td className="py-2.5 px-3 text-teal-700 font-medium">
                  Assigned {isSchool ? 'Class & Section' : 'Programme & Section'} Only
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
// 15. AUDIT LOGS PAGE (/school-management/audit & /college/audit)
// Read-only, filters, CSV export, no sensitive values
// ============================================================================
export const ManagementAuditLogsPage: React.FC = () => {
  const { auditLogs, addToast } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');

  const uniqueActions = Array.from(new Set(auditLogs.map((l) => l.action)));

  const filteredLogs = auditLogs.filter((l) => {
    const matchesAction = actionFilter === 'ALL' || l.action === actionFilter;
    const q = searchTerm.trim().toLowerCase();
    const matchesQuery =
      !q ||
      l.actor.toLowerCase().includes(q) ||
      l.action.toLowerCase().includes(q) ||
      l.details.toLowerCase().includes(q) ||
      l.targetStudentId.toLowerCase().includes(q);
    return matchesAction && matchesQuery;
  });

  const handleExportCsv = () => {
    const header = 'Audit_ID,Timestamp,Actor,Role,Action,Target_ID,Details_Sanitized\n';
    const body = filteredLogs
      .map(
        (l) =>
          `"${l.id}","${l.timestamp}","${l.actor}","${l.role}","${l.action}","${l.targetStudentId}","${l.details.replace(
            /"/g,
            "'"
          )}"`
      )
      .join('\n');
    const blob = new Blob([header + body], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `APAAR_Ready_Audit_Log_Sanitized.csv`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('Exported sanitized Audit Logs CSV (no sensitive identifiers included).', 'success');
  };

  return (
    <div className="space-y-6 min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="text-xs font-semibold text-teal-700">
            Immutable Read-Only Governance Log · Zero Sensitive Values Stored
          </div>
          <h1 className="font-display text-xl sm:text-2xl font-bold text-[#0B1F3A] mt-0.5">
            Institutional Audit Logs ({filteredLogs.length} Events)
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Read-only record of logins, education history opens, unmasking events, duplicate
            reviews, and exports. Full PEN, Aadhaar, and APAAR numbers are never written to audit
            logs.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportCsv}
          className="px-4 py-2 rounded-md bg-[#0B1F3A] text-white text-xs font-semibold hover:bg-slate-800 self-start sm:self-center shrink-0"
        >
          Export Sanitized CSV (Demo)
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filter audit logs by actor, action, record ID, or details..."
            className="flex-1 rounded-md border border-slate-300 px-3.5 py-2 text-xs"
          />
          <select
            aria-label="Filter by Audit Action"
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-mono font-semibold text-[#0B1F3A]"
          >
            <option value="ALL">All Action Types ({uniqueActions.length})</option>
            {uniqueActions.map((act) => (
              <option key={act} value={act}>
                {act}
              </option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-semibold text-slate-500 bg-slate-50">
                <th className="py-2.5 px-3">Audit ID &amp; Timestamp</th>
                <th className="py-2.5 px-3">Actor &amp; Role</th>
                <th className="py-2.5 px-3">Action Code</th>
                <th className="py-2.5 px-3">Target Record</th>
                <th className="py-2.5 px-3">Sanitized Event Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-mono whitespace-nowrap text-slate-600">
                    <strong className="text-slate-900">{log.id}</strong> · {log.timestamp}
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <span className="font-semibold text-slate-900">{log.actor}</span>{' '}
                    <span className="text-slate-500">({log.role})</span>
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

