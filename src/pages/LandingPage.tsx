import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Sparkles,
  GitCompare,
  BarChart3,
  ArrowRight,
  Lock,
  CheckCircle2,
  Building2,
  Users,
  FileCheck2,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  React.useEffect(() => {
    document.title = 'APAAR Ready — Student Identity & Intake Governance Portal';
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900">
      {/* Demo Environment Notice Strip */}
      <div className="bg-[#0B1F3A] text-slate-200 px-6 py-2 text-xs border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-amber-300">Demo data</span>
            <span aria-hidden="true">·</span>
            <span>
              Sandbox prototype using 60 fictional student records and 3 fictional institutions.
            </span>
          </div>
          <div className="text-slate-300">
            Uses &ldquo;Simulated Verification&rdquo; &amp; &ldquo;Pending Official Verification&rdquo; — No live UIDAI / DigiLocker connection
          </div>
        </div>
      </div>

      {/* Top Navigation Bar (Strict 3-Zone Contract: Brand — 4 nav links — 1 primary CTA) */}
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
          <Link
            to="/"
            className="text-lg font-display font-bold tracking-tight text-[#0B1F3A] whitespace-nowrap shrink-0"
          >
            APAAR Ready
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <a
              href="#capabilities"
              className="hover:text-[#0B1F3A] transition-colors whitespace-nowrap shrink-0"
            >
              Capabilities
            </a>
            <a
              href="#workflow"
              className="hover:text-[#0B1F3A] transition-colors whitespace-nowrap shrink-0"
            >
              Workflow
            </a>
            <a
              href="#portals"
              className="hover:text-[#0B1F3A] transition-colors whitespace-nowrap shrink-0"
            >
              Role Portals
            </a>
            <a
              href="#safeguards"
              className="hover:text-[#0B1F3A] transition-colors whitespace-nowrap shrink-0"
            >
              Data Safeguards
            </a>
          </nav>

          <div className="flex items-center shrink-0">
            <Link
              to="/login"
              className="px-4 py-2 text-xs font-medium text-white bg-[#0B1F3A] rounded-md hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
            >
              Login to Portal
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-white border-b border-slate-200 py-16 lg:py-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
          <div className="lg:col-span-7 flex flex-col justify-between">
            <div>
              <div className="text-xs font-semibold text-teal-700 mb-3">
                Higher Education Identity &amp; Enrolment Readiness Sandbox · Demo Data
              </div>
              <h1
                className="font-display text-4xl sm:text-5xl font-bold text-[#0B1F3A] tracking-tight leading-[1.12]"
                style={{ textWrap: 'balance' }}
              >
                Smarter Student Records. Better Data Quality.
              </h1>
              <p className="mt-5 text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
                Prepare institutional student rosters for Academic Bank of Credits (ABC) and APAAR
                seeding before official submission. Standardize demographic formatting, detect
                cross-programme duplicates, and monitor approved vs actual intake across Teacher,
                College Management, and AICTE portals.
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 flex flex-wrap items-center gap-4">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-[#0B1F3A] rounded-md hover:bg-slate-800 transition-colors whitespace-nowrap"
              >
                <span>Login to Portal</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/demo-credentials"
                className="inline-flex items-center gap-2 px-4 py-3 text-sm font-semibold text-teal-800 bg-teal-50 border border-teal-200 rounded-md hover:bg-teal-100 transition-colors whitespace-nowrap"
              >
                <span>Quick-Login Demo Accounts (7 Roles)</span>
              </Link>
              <div className="text-xs text-slate-500 w-full sm:w-auto sm:ml-2">
                School &amp; College Workspaces · 2026-27 Academic Year · Demo accounts only
              </div>
            </div>
          </div>

          {/* Right Preview Panel: Clean Enterprise Readiness Snapshot */}
          <div className="lg:col-span-5 bg-[#0B1F3A] text-white rounded-lg p-6 border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <div className="text-xs text-slate-400">Live Sandbox Dataset Summary</div>
                  <div className="font-display font-semibold text-base text-white mt-0.5">
                    Pre-Submission Verification Simulation
                  </div>
                </div>
                <span className="text-xs text-amber-300 font-mono">Demo data</span>
              </div>

              <div className="mt-5 space-y-3">
                <div className="bg-slate-900/90 border border-slate-800 rounded-md p-3.5 flex items-center justify-between">
                  <div>
                    <div className="text-xs text-slate-400">Simulated Verification Ready</div>
                    <div className="text-sm font-medium text-slate-200 mt-0.5">
                      Format &amp; PEN checksum validated
                    </div>
                  </div>
                  <div className="text-right font-mono tabular-nums">
                    <div className="text-lg font-bold text-teal-400">71.7%</div>
                    <div className="text-[11px] text-slate-400">43 / 60 records</div>
                  </div>
                </div>

                <div className="bg-slate-900/90 border border-slate-800 rounded-md p-3.5 flex items-center justify-between">
                  <div>
                    <div className="text-xs text-slate-400">AI Standardization &amp; Duplicate Flags</div>
                    <div className="text-sm font-medium text-slate-200 mt-0.5">
                      Honorific variance &amp; dual seat allotment
                    </div>
                  </div>
                  <div className="text-right font-mono tabular-nums">
                    <div className="text-lg font-bold text-indigo-400">8 Cases</div>
                    <div className="text-[11px] text-slate-400">Human review required</div>
                  </div>
                </div>

                <div className="bg-slate-900/90 border border-slate-800 rounded-md p-3.5 flex items-center justify-between">
                  <div>
                    <div className="text-xs text-slate-400">Intake Governance Alerts</div>
                    <div className="text-sm font-medium text-slate-200 mt-0.5">
                      Programmes exceeding sanctioned intake
                    </div>
                  </div>
                  <div className="text-right font-mono tabular-nums">
                    <div className="text-lg font-bold text-red-400">2 Programmes</div>
                    <div className="text-[11px] text-slate-400">+29 excess seats</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
              <span>PEN Masked by Default: •••• •••9 481</span>
              <span className="text-teal-300">Zero Auto-Merge Policy</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Feature Cards Section */}
      <section id="capabilities" className="py-16 px-6 max-w-7xl mx-auto w-full">
        <div className="max-w-2xl mb-10">
          <div className="text-xs font-semibold text-teal-700 mb-2">
            Core Platform Capabilities
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#0B1F3A] tracking-tight">
            Built for Pre-Verification Readiness and Intake Governance
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Four specialized modules linking classroom nodal officers, university registrars, and
            national technical councils.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <div className="bg-white border border-slate-200 rounded-lg p-6 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-md bg-indigo-50 text-indigo-700 flex items-center justify-center mb-4">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-display font-semibold text-base text-slate-900">
                01. AI Record Standardization
              </h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Detects initials, honorific prefixes (&ldquo;MD.&rdquo;, &ldquo;Kumari&rdquo;),
                lowercase names, and non-ISO dates of birth before batch handshake with registry
                sandbox endpoints.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-slate-100 text-xs text-indigo-700 font-medium">
              AI Assist · Teacher Portal
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white border border-slate-200 rounded-lg p-6 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-md bg-purple-50 text-purple-700 flex items-center justify-center mb-4">
                <GitCompare className="w-5 h-5" />
              </div>
              <h3 className="font-display font-semibold text-base text-slate-900">
                02. Non-Destructive Duplicate Detection
              </h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Surfaces fuzzy phonetic matches and shared PEN numbers across counselling rounds.
                Never auto-merges or deletes records—nodal officers review and annotate every pair.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-slate-100 text-xs text-purple-700 font-medium">
              Human-in-the-Loop Safeguard
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white border border-slate-200 rounded-lg p-6 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-md bg-teal-50 text-teal-700 flex items-center justify-center mb-4">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="font-display font-semibold text-base text-slate-900">
                03. Privacy-First PEN &amp; APAAR Masking
              </h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                11-digit Permanent Education Numbers (PEN) and 12-digit APAAR IDs are masked by
                default across all tables. Explicit audit-logged toggle reveals single rows when
                needed.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-slate-100 text-xs text-teal-700 font-medium">
              Simulated Verification Ready
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-white border border-slate-200 rounded-lg p-6 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-md bg-amber-50 text-amber-700 flex items-center justify-center mb-4">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="font-display font-semibold text-base text-slate-900">
                04. Sanctioned Intake vs Enrolment Watch
              </h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Reconciles programme-level student rosters against AICTE sanctioned intake ceilings,
                highlighting over-enrolment anomalies and unwithdrawn sliding seats in real time.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-slate-100 text-xs text-amber-700 font-medium">
              College &amp; AICTE Portals
            </div>
          </div>
        </div>
      </section>

      {/* Workflow Strip */}
      <section id="workflow" className="bg-white border-y border-slate-200 py-14 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <div className="text-xs font-semibold text-teal-700 mb-1">
                4-Stage Governance Pipeline
              </div>
              <h2 className="font-display text-2xl font-bold text-[#0B1F3A]">
                End-to-End Readiness Workflow
              </h2>
            </div>
            <div className="text-xs text-slate-500">
              All stages operate on synthetic Demo Data · Zero destructive mutations
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-lg bg-[#F8FAFC] border border-slate-200">
              <div className="text-xs font-mono font-semibold text-slate-400">STEP 01</div>
              <div className="font-display font-semibold text-slate-900 mt-1">
                Roster Ingestion &amp; Masking
              </div>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Import institutional ERP records with automatic default masking of PEN and APAAR
                identifiers.
              </p>
            </div>

            <div className="p-5 rounded-lg bg-[#F8FAFC] border border-slate-200">
              <div className="text-xs font-mono font-semibold text-indigo-600">STEP 02 · AI</div>
              <div className="font-display font-semibold text-slate-900 mt-1">
                AI Normalization &amp; Dedup Check
              </div>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Flag name token mismatches, date formatting errors, and cross-branch duplicate
                candidates.
              </p>
            </div>

            <div className="p-5 rounded-lg bg-[#F8FAFC] border border-slate-200">
              <div className="text-xs font-mono font-semibold text-teal-700">STEP 03</div>
              <div className="font-display font-semibold text-slate-900 mt-1">
                Simulated Verification Handshake
              </div>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Assign &ldquo;Simulated Verification&rdquo; or &ldquo;Pending Official
                Verification&rdquo; status after human sign-off.
              </p>
            </div>

            <div className="p-5 rounded-lg bg-[#F8FAFC] border border-slate-200">
              <div className="text-xs font-mono font-semibold text-amber-700">STEP 04</div>
              <div className="font-display font-semibold text-slate-900 mt-1">
                College &amp; AICTE Intake Audit
              </div>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Aggregate verified headcounts against approved programme intake across states.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Role Portals Quick Access */}
      <section id="portals" className="py-16 px-6 max-w-7xl mx-auto w-full">
        <div className="mb-8">
          <div className="text-xs font-semibold text-teal-700 mb-1">Three Role-Based Views</div>
          <h2 className="font-display text-2xl font-bold text-[#0B1F3A]">
            Explore the Demo Portals
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-200 rounded-lg p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
                <span>Portal 01</span>
                <span>60 Student Records</span>
              </div>
              <h3 className="font-display text-lg font-bold text-[#0B1F3A] flex items-center gap-2">
                <Users className="w-5 h-5 text-teal-600" />
                <span>Teacher / Nodal Officer</span>
              </h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Search and filter student rosters, toggle individual masked PENs, apply AI formatting
                suggestions, and resolve duplicate alerts without deleting records.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100">
              <Link
                to="/teacher"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0B1F3A] hover:text-teal-700"
              >
                <span>Open Teacher Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
                <span>Portal 02</span>
                <span>8 Programmes · 2 Over Intake</span>
              </div>
              <h3 className="font-display text-lg font-bold text-[#0B1F3A] flex items-center gap-2">
                <Building2 className="w-5 h-5 text-amber-600" />
                <span>College Management</span>
              </h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Compare approved intake vs actual enrolment by engineering branch, inspect
                over-intake alerts (+18 in CSE, +11 in AI&amp;DS), and track campus APAAR readiness.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100">
              <Link
                to="/college"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0B1F3A] hover:text-teal-700"
              >
                <span>Open College Overview</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
                <span>Portal 03</span>
                <span>10 States · 3 Demo Campuses</span>
              </div>
              <h3 className="font-display text-lg font-bold text-[#0B1F3A] flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-indigo-600" />
                <span>AICTE Central Monitoring</span>
              </h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                National KPIs, state-wise simulated verification rates, duplicate cluster counts, and
                sanctioned intake compliance across technical institutions.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100">
              <Link
                to="/aicte"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0B1F3A] hover:text-teal-700"
              >
                <span>Open AICTE Monitoring</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="safeguards" className="mt-auto bg-[#0B1F3A] text-slate-300 py-10 px-6 border-t border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="font-display font-bold text-white text-base">
              APAAR Ready — Higher Education Data Readiness Sandbox
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Disclaimer: All student records, PEN numbers, APAAR IDs, and institutional statistics
              are synthetic (&ldquo;Demo data&rdquo;). Verification statuses strictly denote
              &ldquo;Simulated Verification&rdquo; or &ldquo;Pending Official Verification&rdquo;.
            </p>
          </div>
          <div className="flex items-center gap-6 text-xs">
            <Link to="/login" className="text-white hover:underline font-medium">
              Login to Portal
            </Link>
            <Link to="/teacher" className="text-slate-300 hover:text-white">
              Teacher View
            </Link>
            <Link to="/college" className="text-slate-300 hover:text-white">
              College View
            </Link>
            <Link to="/aicte" className="text-slate-300 hover:text-white">
              AICTE View
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
