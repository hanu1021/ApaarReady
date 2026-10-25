import React, { useState } from 'react';
import {
  Globe,
  Building2,
  AlertTriangle,
  CheckCircle2,
  Search,
  SlidersHorizontal,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

// 1. Main AICTE Overview ("/aicte"): National KPIs and a State Table
export const AicteOverview: React.FC = () => {
  const { stateRows } = useApp();
  const [searchState, setSearchState] = useState('');

  const filteredStates = stateRows.filter(
    (st) =>
      st.stateName.toLowerCase().includes(searchState.toLowerCase()) ||
      st.stateCode.toLowerCase().includes(searchState.toLowerCase())
  );

  const totalInstitutions = stateRows.reduce((s, r) => s + r.institutionsCount, 0);
  const totalApprovedIntake = stateRows.reduce((s, r) => s + r.approvedIntake, 0);
  const totalEnrolled = stateRows.reduce((s, r) => s + r.enrolledStudents, 0);
  const totalOverIntakeAlerts = stateRows.reduce((s, r) => s + r.overIntakeAlerts, 0);
  const avgSimVerified =
    stateRows.reduce((s, r) => s + r.simulatedVerifiedPct, 0) / stateRows.length;

  return (
    <div className="space-y-6 min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="text-xs font-semibold text-teal-700">
            AICTE Central Monitoring Portal · National Macro View (Demo Data)
          </div>
          <h1 className="font-display text-xl sm:text-2xl font-bold text-[#0B1F3A] mt-0.5 break-words">
            National APAAR Readiness &amp; State-Wise Intake Surveillance
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Aggregated synthetic metrics across 10 states. All verification indicators represent
            Simulated Verification and Pending Official Verification.
          </p>
        </div>

        <div className="text-xs font-mono text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded self-start sm:self-center shrink-0">
          Demo data · Synthetic National Rollup
        </div>
      </div>

      {/* 4 National KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-lg p-4 sm:p-5">
          <div className="text-xs font-medium text-slate-500">
            Monitored Technical Institutions
          </div>
          <div className="mt-2 flex items-baseline justify-between font-mono tabular-nums">
            <span className="text-2xl sm:text-3xl font-bold text-[#0B1F3A]">
              {totalInstitutions.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500">10 States (Demo)</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
            Includes 3 detailed sandbox campuses
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 sm:p-5">
          <div className="text-xs font-medium text-slate-500">
            National Enrolment vs Intake
          </div>
          <div className="mt-2 flex items-baseline justify-between font-mono tabular-nums">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900">
              {(totalEnrolled / 100000).toFixed(2)}L
            </span>
            <span className="text-xs text-teal-700 font-semibold">
              of {(totalApprovedIntake / 100000).toFixed(2)}L Cap
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-600">
            95.8% National seat fill rate (Demo data)
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 sm:p-5">
          <div className="text-xs font-medium text-slate-500">
            National Simulated Verification
          </div>
          <div className="mt-2 flex items-baseline justify-between font-mono tabular-nums">
            <span className="text-2xl sm:text-3xl font-bold text-teal-700">
              {avgSimVerified.toFixed(1)}%
            </span>
            <span className="text-xs font-semibold text-amber-700">
              {(100 - avgSimVerified).toFixed(1)}% Pending
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-teal-700">
            Simulated Verification benchmark across states
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 sm:p-5">
          <div className="text-xs font-medium text-slate-500">
            Over-Intake &amp; Duplicate Clusters
          </div>
          <div className="mt-2 flex items-baseline justify-between font-mono tabular-nums">
            <span className="text-2xl sm:text-3xl font-bold text-red-600">{totalOverIntakeAlerts}</span>
            <span className="text-xs font-semibold text-red-600">Over-Intake Alerts</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-red-700">
            Flagged for state council reconciliation
          </div>
        </div>
      </div>

      {/* State-Wise Table */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-100">
          <div>
            <h2 className="font-display font-bold text-base text-[#0B1F3A] break-words">
              State-Wise APAAR Readiness &amp; Intake Compliance Table
            </h2>
            <p className="text-xs text-slate-500">
              Synthetic state rollup showing Simulated Verification vs Pending Official Verification
              and over-intake programme alerts.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchState}
              onChange={(e) => setSearchState(e.target.value)}
              placeholder="Filter state name or code..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-md border border-slate-300 focus:border-[#0B1F3A] focus:outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-semibold text-slate-500">
                <th className="py-3 px-3">State / UT</th>
                <th className="py-3 px-3 text-right">Institutions</th>
                <th className="py-3 px-3 text-right">Approved Intake</th>
                <th className="py-3 px-3 text-right">Enrolled Students</th>
                <th className="py-3 px-3 text-right">Simulated Verification %</th>
                <th className="py-3 px-3 text-right">Pending Official %</th>
                <th className="py-3 px-3 text-right">Duplicate Clusters</th>
                <th className="py-3 px-3 text-right">Over-Intake Alerts</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {filteredStates.map((row) => (
                <tr key={row.stateCode} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-3 font-medium text-slate-900">
                    <span className="font-mono text-xs text-slate-400 mr-2">
                      [{row.stateCode}]
                    </span>
                    <span>{row.stateName}</span>
                  </td>
                  <td className="py-3 px-3 text-right font-mono tabular-nums">
                    {row.institutionsCount}
                  </td>
                  <td className="py-3 px-3 text-right font-mono tabular-nums">
                    {row.approvedIntake.toLocaleString()}
                  </td>
                  <td className="py-3 px-3 text-right font-mono tabular-nums font-semibold">
                    {row.enrolledStudents.toLocaleString()}
                  </td>
                  <td className="py-3 px-3 text-right font-mono tabular-nums text-teal-700 font-semibold">
                    {row.simulatedVerifiedPct.toFixed(1)}%
                  </td>
                  <td className="py-3 px-3 text-right font-mono tabular-nums text-amber-700">
                    {row.pendingVerificationPct.toFixed(1)}%
                  </td>
                  <td className="py-3 px-3 text-right font-mono tabular-nums text-indigo-700">
                    {row.duplicateClustersFlagged}
                  </td>
                  <td className="py-3 px-3 text-right font-mono tabular-nums">
                    <span
                      className={`font-semibold ${
                        row.overIntakeAlerts >= 10 ? 'text-red-600' : 'text-amber-700'
                      }`}
                    >
                      {row.overIntakeAlerts} Alerts
                    </span>
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

// 2. AICTE Sub-page: Institution Directory ("/aicte/institutions")
export const AicteInstitutionsPage: React.FC = () => {
  const { institutions, programmes } = useApp();

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs font-semibold text-teal-700">
          AICTE Sandbox Inspection · Demo Data
        </div>
        <h1 className="font-display text-2xl font-bold text-[#0B1F3A] mt-0.5">
          Deep-Dive Sandbox Institutions (3 Campuses)
        </h1>
        <p className="text-xs text-slate-600 mt-1">
          Inspect the 3 detailed demo institutions and their 8 underlying engineering programmes.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-[11px] font-semibold text-slate-500 bg-slate-50">
              <th className="py-3 px-4">AISHE Code</th>
              <th className="py-3 px-4">Institution Name</th>
              <th className="py-3 px-4">State &amp; District</th>
              <th className="py-3 px-4 text-right">Sanctioned Intake</th>
              <th className="py-3 px-4 text-right">Actual Enrolled</th>
              <th className="py-3 px-4 text-right">Simulated Readiness</th>
              <th className="py-3 px-4">Intake Governance Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-xs">
            {institutions.map((inst) => {
              const instProgs = programmes.filter((p) => p.institutionId === inst.id);
              return (
                <tr key={inst.id} className="hover:bg-slate-50">
                  <td className="py-3.5 px-4 font-mono font-semibold text-slate-800">
                    {inst.aisheCode}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-900">{inst.name}</div>
                    <div className="text-[11px] text-slate-500">
                      {inst.type} · {instProgs.length} Programmes
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    {inst.district}, {inst.state}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono tabular-nums">
                    {inst.totalApprovedIntake}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono tabular-nums font-semibold">
                    {inst.totalEnrolled}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono tabular-nums text-teal-700 font-semibold">
                    {inst.apaarReadinessPct}%
                  </td>
                  <td className="py-3.5 px-4">
                    {inst.overIntakeProgrammes > 0 ? (
                      <span className="inline-flex items-center gap-1.5 text-red-600 font-semibold">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>{inst.overIntakeProgrammes} Programme Over Intake</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-teal-700 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Compliant</span>
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
  );
};

// 3. AICTE Sub-page: Intake Governance Advisories ("/aicte/advisories")
export const AicteAdvisoriesPage: React.FC = () => {
  const { programmes } = useApp();
  const overIntakeList = programmes.filter((p) => p.actualEnrolment > p.approvedIntake);

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs font-semibold text-amber-700">
          Regulatory Compliance Advisories · Demo Data
        </div>
        <h1 className="font-display text-2xl font-bold text-[#0B1F3A] mt-0.5">
          Over-Intake &amp; Duplicate Enrolment Advisories
        </h1>
        <p className="text-xs text-slate-600 mt-1">
          Simulated advisories issued to institutions where enrolled student rosters exceed
          sanctioned intake.
        </p>
      </div>

      <div className="space-y-4">
        {overIntakeList.map((prg) => (
          <div
            key={prg.id}
            className="bg-white border border-slate-200 rounded-lg p-6 space-y-2"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-mono font-semibold text-red-600">
                ADVISORY-DEMO-{prg.id} · {prg.state.toUpperCase()}
              </span>
              <span className="text-xs text-slate-500">
                Status: Pending Registrar Clarification (Simulated)
              </span>
            </div>
            <h2 className="font-display font-bold text-base text-[#0B1F3A]">
              {prg.institutionName} — {prg.programmeName}
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Sanctioned Intake: <strong className="font-mono">{prg.approvedIntake}</strong> ·
              Submitted Roster: <strong className="font-mono">{prg.actualEnrolment}</strong> (Excess
              of <strong className="font-mono">+{prg.actualEnrolment - prg.approvedIntake}</strong>{' '}
              records). Institution Nodal Officer is advised to review {prg.flaggedDuplicateCount}{' '}
              duplicate/sliding-round flags in the Teacher Portal without deleting historical audit
              records.
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

// 4. AICTE Sub-page: Policy & Schema Standards ("/aicte/standards")
export const AicteStandardsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs font-semibold text-teal-700">
          Sandbox Architecture &amp; Safeguards · Demo Data
        </div>
        <h1 className="font-display text-2xl font-bold text-[#0B1F3A] mt-0.5">
          Data Governance, Privacy &amp; Non-Destructive Rules
        </h1>
        <p className="text-xs text-slate-600 mt-1">
          Core architectural rules enforced across all three portals of APAAR Ready.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-2">
          <div className="flex items-center gap-2 font-display font-bold text-sm text-[#0B1F3A]">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            <span>1. Simulated Verification Terminology Only</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            This demo never claims official UIDAI, DigiLocker, or NAD verification. All verification
            states are explicitly labelled <strong>Simulated Verification</strong> or{' '}
            <strong>Pending Official Verification</strong>.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-2">
          <div className="flex items-center gap-2 font-display font-bold text-sm text-[#0B1F3A]">
            <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
            <span>2. Default Masking of PEN &amp; APAAR Identifiers</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            11-digit Permanent Education Numbers (PEN) and 12-digit APAAR IDs are masked by default
            (showing only the trailing 4 digits) to prevent shoulder-surfing and unauthorized bulk
            exposure.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-2">
          <div className="flex items-center gap-2 font-display font-bold text-sm text-[#0B1F3A]">
            <CheckCircle2 className="w-4 h-4 text-teal-600" />
            <span>3. Strict Zero Auto-Merge &amp; Zero Deletion Policy</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            AI duplicate detection only flags candidate pairs for human nodal officers. The system
            never automatically merges or deletes student records.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-2">
          <div className="flex items-center gap-2 font-display font-bold text-sm text-[#0B1F3A]">
            <Globe className="w-4 h-4 text-amber-600" />
            <span>4. 100% Synthetic Demo Dataset</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Populated with 60 fictional students, 3 fictional institutions, and 8 programmes (with 2
            programmes intentionally configured over intake for governance demonstration).
          </p>
        </div>
      </div>
    </div>
  );
};
