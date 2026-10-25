import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ShieldCheck,
  KeyRound,
  Lock,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Clock,
  HelpCircle,
  Search,
  Printer,
  BookOpen,
  Play,
  RotateCcw,
  Calendar,
  ArrowRight,
  ArrowLeft,
  Database,
  Sparkles,
  X,
  RefreshCw,
  FileWarning,
  SlidersHorizontal,
  Info,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  CURRENT_ACADEMIC_YEAR,
  PREVIOUS_ACADEMIC_YEAR,
  NEXT_ROLLOVER_ACADEMIC_YEAR,
  TicketPriority,
  TicketStatus,
} from '../config/academicYears';
import {
  checkDataServiceHealth,
  DataServiceHealthReport,
  SCREEN_SQL_REQUIREMENTS,
} from '../services/dataService';

// ============================================================================
// PASSWORD STRENGTH METER HELPER (Shared by Reset Password & Change Password)
// ============================================================================
export function evaluatePasswordStrength(pw: string) {
  const hasMinLen = pw.length >= 8;
  const hasUpper = /[A-Z]/.test(pw);
  const hasLower = /[a-z]/.test(pw);
  const hasNumber = /\d/.test(pw);
  const hasSpecial = /[^A-Za-z0-9]/.test(pw);

  const passedCount = [hasMinLen, hasUpper, hasLower, hasNumber, hasSpecial].filter(
    Boolean
  ).length;

  const label =
    pw.length === 0
      ? 'Enter password'
      : passedCount <= 2
      ? 'Weak'
      : passedCount === 3
      ? 'Fair'
      : passedCount === 4
      ? 'Good'
      : 'Strong';

  const colorClass =
    passedCount <= 2
      ? 'bg-red-500'
      : passedCount === 3
      ? 'bg-amber-500'
      : passedCount === 4
      ? 'bg-teal-500'
      : 'bg-teal-600';

  return {
    score: passedCount,
    label,
    colorClass,
    checks: { hasMinLen, hasUpper, hasLower, hasNumber, hasSpecial },
  };
}

// ============================================================================
// FEATURE 1A: FORGOT PASSWORD SCREEN (/login/forgot-password)
// Enter email, show a "Simulated, no email is sent" confirmation, link to Reset page
// ============================================================================
export const ForgotPasswordPage: React.FC = () => {
  const { addAuditLog, addToast } = useApp();
  const [email, setEmail] = useState('nodal.faculty@diet-demo.edu.in');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
    addAuditLog({
      actor: email.trim(),
      role: 'Account Recovery (Simulated)',
      action: 'PASSWORD_RESET_REQUESTED_SIM',
      targetStudentId: 'AUTH_ACCOUNT',
      details: `Requested simulated password reset link for ${email.trim()}. Simulated, no email is sent.`,
    });
    addToast('Simulated password recovery link generated (no email sent).', 'info');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between">
      <div className="bg-[#0B1F3A] text-slate-200 px-4 py-2 text-xs border-b border-slate-800 flex items-center justify-between">
        <span className="font-semibold text-amber-300">
          Demo data · Simulated Account Recovery
        </span>
        <Link to="/login/state" className="text-teal-300 hover:underline font-medium">
          Back to Login &rarr;
        </Link>
      </div>

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-lg p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <Link
              to="/login/state"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#0B1F3A]"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Sign In</span>
            </Link>
            <span className="text-[11px] font-mono text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
              Simulated Auth
            </span>
          </div>

          <div>
            <h1 className="font-display text-xl font-bold text-[#0B1F3A]">
              Forgot Password
            </h1>
            <p className="text-xs text-slate-600 mt-1">
              Enter your institutional email address to preview the simulated password recovery
              workflow.
            </p>
          </div>

          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label
                  htmlFor="forgot-email-input"
                  className="block font-semibold text-slate-700 mb-1"
                >
                  Official Email Address
                </label>
                <input
                  id="forgot-email-input"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nodal.faculty@diet-demo.edu.in"
                  className="w-full rounded-md border border-slate-300 px-3.5 py-2.5 text-sm font-mono text-slate-900 focus:border-[#0B1F3A] focus:outline-none"
                />
              </div>

              <div className="p-3 rounded bg-slate-50 border border-slate-200 text-[11px] text-slate-600">
                <strong>Note:</strong> In production, password recovery is handled by Supabase Auth
                email dispatch. In this demo environment, no external email is sent.
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-md bg-[#0B1F3A] text-white font-semibold text-xs hover:bg-slate-800 transition-colors"
              >
                Send Password Reset Link (Simulated)
              </button>
            </form>
          ) : (
            <div className="space-y-4 text-xs">
              <div
                role="status"
                className="p-4 rounded-md bg-amber-50 border border-amber-200 text-amber-950 space-y-2"
              >
                <div className="flex items-center gap-2 font-bold text-sm text-amber-900">
                  <CheckCircle2 className="w-4 h-4 text-teal-700 shrink-0" />
                  <span>Simulated, no email is sent</span>
                </div>
                <p className="leading-relaxed">
                  A simulated recovery request has been logged for{' '}
                  <strong className="font-mono">{email}</strong>. Because this is a demo sandbox,
                  no real email was dispatched. Use the button below to open the simulated Reset
                  Password screen directly.
                </p>
              </div>

              <Link
                to="/login/reset-password"
                className="w-full py-2.5 px-4 rounded-md bg-indigo-600 text-white font-semibold text-xs hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
              >
                <KeyRound className="w-4 h-4" />
                <span>Open Simulated Password Reset Page &rarr;</span>
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

// ============================================================================
// FEATURE 1B: RESET PASSWORD SCREEN (/login/reset-password)
// Strength meter and confirm field; never stores password in app state
// ============================================================================
export const ResetPasswordPage: React.FC = () => {
  const { addAuditLog, addToast } = useApp();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const strength = evaluatePasswordStrength(newPassword);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (newPassword.length < 8) {
      setErrorMsg('Password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg('New password and confirmation do not match.');
      return;
    }

    // Clear sensitive inputs immediately — never store passwords in app code or state
    setNewPassword('');
    setConfirmPassword('');
    setDone(true);

    addAuditLog({
      actor: 'Nodal User (Simulated Reset)',
      role: 'Account Recovery',
      action: 'PASSWORD_RESET_COMPLETED_SIM',
      targetStudentId: 'AUTH_ACCOUNT',
      details:
        'Completed simulated password reset flow. Real password hashing is handled by Supabase Auth; no password stored in app state.',
    });
    addToast('Password reset simulated! You can now sign in.', 'success');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between">
      <div className="bg-[#0B1F3A] text-slate-200 px-4 py-2 text-xs border-b border-slate-800 flex items-center justify-between">
        <span className="font-semibold text-amber-300">
          Demo data · Simulated Password Reset
        </span>
        <Link to="/login/state" className="text-teal-300 hover:underline font-medium">
          Back to Login &rarr;
        </Link>
      </div>

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-lg p-6 shadow-xs space-y-5">
          <div>
            <div className="text-xs font-semibold text-indigo-700">
              Simulated Recovery Token Verified
            </div>
            <h1 className="font-display text-xl font-bold text-[#0B1F3A] mt-0.5">
              Set a New Password (Simulated)
            </h1>
            <p className="text-xs text-slate-600 mt-1">
              Real password handling is performed by Supabase Auth — passwords are never stored in
              app code or state.
            </p>
          </div>

          {done ? (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-md bg-teal-50 border border-teal-200 text-teal-950 space-y-1.5">
                <div className="font-bold text-sm text-teal-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-700" />
                  <span>Password Reset Complete (Simulated)</span>
                </div>
                <p>
                  Your simulated password reset was verified and cleared from memory. Click below
                  to return to the login portal.
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/login/state')}
                className="w-full py-2.5 px-4 rounded-md bg-[#0B1F3A] text-white font-semibold text-xs hover:bg-slate-800"
              >
                Proceed to Login Portal &rarr;
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label
                  htmlFor="reset-new-pw"
                  className="block font-semibold text-slate-700 mb-1"
                >
                  New Password
                </label>
                <div className="relative">
                  <input
                    id="reset-new-pw"
                    type={showPw ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password (8+ chars)"
                    className="w-full rounded-md border border-slate-300 pl-3.5 pr-16 py-2 text-sm text-slate-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-2.5 top-2 text-xs text-slate-600 hover:text-slate-900"
                  >
                    {showPw ? 'Hide' : 'Show'}
                  </button>
                </div>

                {/* Live Strength Meter */}
                <div className="mt-2 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Password Strength:</span>
                    <span className="font-semibold text-slate-800">{strength.label}</span>
                  </div>
                  <div className="grid grid-cols-5 gap-1 h-1.5">
                    {[1, 2, 3, 4, 5].map((bar) => (
                      <div
                        key={bar}
                        className={`rounded-full transition-colors ${
                          strength.score >= bar ? strength.colorClass : 'bg-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                  <ul className="grid grid-cols-2 gap-1 text-[10px] text-slate-500 pt-1">
                    <li className={strength.checks.hasMinLen ? 'text-teal-700 font-semibold' : ''}>
                      ✓ 8+ characters
                    </li>
                    <li className={strength.checks.hasUpper ? 'text-teal-700 font-semibold' : ''}>
                      ✓ Uppercase letter
                    </li>
                    <li className={strength.checks.hasNumber ? 'text-teal-700 font-semibold' : ''}>
                      ✓ Number (0-9)
                    </li>
                    <li className={strength.checks.hasSpecial ? 'text-teal-700 font-semibold' : ''}>
                      ✓ Symbol (!@#$)
                    </li>
                  </ul>
                </div>
              </div>

              <div>
                <label
                  htmlFor="reset-confirm-pw"
                  className="block font-semibold text-slate-700 mb-1"
                >
                  Confirm New Password
                </label>
                <input
                  id="reset-confirm-pw"
                  type={showPw ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full rounded-md border border-slate-300 px-3.5 py-2 text-sm text-slate-900"
                />
              </div>

              {errorMsg && (
                <div className="p-3 rounded bg-red-50 border border-red-200 text-red-700 font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-md bg-[#0B1F3A] text-white font-semibold text-xs hover:bg-slate-800"
              >
                Update Password (Simulated)
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
};

// ============================================================================
// FEATURE 1C: SESSION TIMEOUT WARNING MODAL (Mounted in PortalLayout)
// Tracks inactivity or manual simulation trigger; "Stay signed in" + auto sign-out
// ============================================================================
export const SessionTimeoutWatcher: React.FC = () => {
  const {
    sessionWarningRequested,
    clearSessionWarningRequest,
    addToast,
    addAuditLog,
    session,
  } = useApp();
  const navigate = useNavigate();
  const [warningOpen, setWarningOpen] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(45);

  // Open warning when triggered from Settings / Top Bar OR after 10 minutes of idle time
  useEffect(() => {
    if (sessionWarningRequested) {
      setSecondsLeft(45);
      setWarningOpen(true);
      clearSessionWarningRequest();
    }
  }, [sessionWarningRequested, clearSessionWarningRequest]);

  useEffect(() => {
    let idleTimer: number;
    const resetIdle = () => {
      window.clearTimeout(idleTimer);
      idleTimer = window.setTimeout(() => {
        setSecondsLeft(45);
        setWarningOpen(true);
      }, 10 * 60 * 1000); // 10 minutes idle
    };
    resetIdle();
    window.addEventListener('mousemove', resetIdle);
    window.addEventListener('keydown', resetIdle);
    return () => {
      window.clearTimeout(idleTimer);
      window.removeEventListener('mousemove', resetIdle);
      window.removeEventListener('keydown', resetIdle);
    };
  }, []);

  useEffect(() => {
    if (!warningOpen) return;
    if (secondsLeft <= 0) {
      setWarningOpen(false);
      addAuditLog({
        actor: session.userName,
        role: session.roleDisplayLabel || session.designation,
        action: 'SESSION_AUTO_SIGNOUT',
        targetStudentId: 'SESSION',
        details: 'Automatic sign-out triggered after session inactivity countdown expired.',
      });
      addToast('Signed out automatically due to session inactivity.', 'warning');
      navigate('/login/state');
      return;
    }
    const timer = window.setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [warningOpen, secondsLeft, addAuditLog, addToast, navigate, session]);

  if (!warningOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Session timeout warning"
      className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4"
    >
      <div className="bg-white border border-slate-200 rounded-lg max-w-md w-full p-5 shadow-xl space-y-4 text-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 font-display font-bold text-base text-[#0B1F3A]">
            <Clock className="w-5 h-5 text-amber-600" />
            <span>Session Timeout Warning</span>
          </div>
          <span className="font-mono font-bold text-sm text-red-600 bg-red-50 border border-red-200 px-2.5 py-0.5 rounded">
            {secondsLeft}s
          </span>
        </div>

        <p className="text-slate-600 leading-relaxed">
          For student privacy and portal security, your session will automatically sign out in{' '}
          <strong className="font-mono text-slate-900">{secondsLeft} seconds</strong> due to
          inactivity. Unsaved form fields are protected in local IndexedDB drafts.
        </p>

        <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={() => {
              setWarningOpen(false);
              addToast('Signed out of portal.', 'info');
              navigate('/login/state');
            }}
            className="px-3.5 py-2 rounded border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50"
          >
            Sign Out Now
          </button>
          <button
            type="button"
            onClick={() => {
              setWarningOpen(false);
              addToast('Session extended. You remain signed in.', 'success');
            }}
            className="px-4 py-2 rounded bg-[#0B1F3A] text-white font-semibold hover:bg-slate-800"
          >
            Stay signed in
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// FEATURE 1 & 4: SETTINGS & ACADEMIC YEAR ROLLOVER PAGE (/teacher/settings)
// - Change Password (current, new, confirm + Supabase Auth note)
// - Academic Year Rollover Wizard (2026-27 -> 2027-28, preview carry-over/reset, checklist, confirm)
// - Age-vs-Class Rules Configuration
// ============================================================================
export const SettingsAndRolloverPage: React.FC = () => {
  const {
    currentActiveAcademicYear,
    selectedAcademicYear,
    executeAcademicYearRollover,
    students,
    managedSections,
    requests,
    ageRangeRules,
    updateAgeRangeRule,
    resetAgeRangeRules,
    triggerSessionTimeoutWarningNow,
    addAuditLog,
    addToast,
    session,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'rollover' | 'password' | 'age_rules'>('rollover');

  // Change password state
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwNotice, setPwNotice] = useState<string | null>(null);
  const [pwError, setPwError] = useState<string | null>(null);
  const strength = evaluatePasswordStrength(newPw);

  // Rollover Wizard state (3-step flow with preserved values)
  const [rolloverStep, setRolloverStep] = useState<1 | 2 | 3>(1);
  const [targetRolloverYear, setTargetRolloverYear] = useState(NEXT_ROLLOVER_ACADEMIC_YEAR);
  const [rolloverChecklistConfirmed, setRolloverChecklistConfirmed] = useState(true);
  const [rolloverAuditReason, setRolloverAuditReason] = useState(
    'Annual academic cycle transition reviewed and approved by institutional head.'
  );
  const [confirmRolloverOpen, setConfirmRolloverOpen] = useState(false);

  const activeStudents = students.filter((s) => s.studentStatus === 'Active');
  const activeSections = managedSections.filter((s) => !s.isArchived);
  const unpromotedOrFlagged = activeStudents.filter(
    (s) =>
      s.verificationStatus === 'Mismatch Flagged' ||
      s.reviewedStatus === 'Possible Duplicate'
  );
  const openRequests = requests.filter(
    (r) => r.status === 'Open' || r.status === 'Under Review'
  );

  const handlePasswordChangeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPwError(null);
    setPwNotice(null);
    if (!currentPw || !newPw || !confirmPw) {
      setPwError('All password fields are required.');
      return;
    }
    if (newPw.length < 8) {
      setPwError('New password must be at least 8 characters.');
      return;
    }
    if (newPw !== confirmPw) {
      setPwError('New password and confirmation do not match.');
      return;
    }
    // Clear immediately — never store passwords in app state
    setCurrentPw('');
    setNewPw('');
    setConfirmPw('');
    setPwNotice(
      'Password update verified (Simulated). Real password handling and credential hashing are done by Supabase Auth, never stored in app code.'
    );
    addAuditLog({
      actor: session.userName,
      role: session.roleDisplayLabel || session.designation,
      action: 'PASSWORD_CHANGED_SIM',
      targetStudentId: 'AUTH_ACCOUNT',
      details:
        'Changed account password via Settings (Simulated). Real password handling delegated to Supabase Auth.',
    });
    addToast('Password updated (Simulated via Supabase Auth policy).', 'success');
  };

  return (
    <div className="space-y-6 min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="text-xs font-semibold text-teal-700">
            Institutional Configuration &amp; Governance · {selectedAcademicYear}
          </div>
          <h1 className="font-display text-xl sm:text-2xl font-bold text-[#0B1F3A] break-words">
            Settings, Account Security &amp; Academic Year Rollover
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Manage Academic Year Rollover, Change Password, Session Timeout testing, and
            Age-vs-Class validation thresholds.
          </p>
        </div>

        <button
          type="button"
          onClick={triggerSessionTimeoutWarningNow}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md border border-amber-300 bg-amber-50 text-amber-900 text-xs font-semibold hover:bg-amber-100 self-start sm:self-center shrink-0"
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Test Session Timeout Warning</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('rollover')}
          className={`px-3.5 py-2 rounded-md text-xs font-semibold transition-colors ${
            activeTab === 'rollover'
              ? 'bg-[#0B1F3A] text-white'
              : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
          }`}
        >
          1. Academic Year Rollover Wizard ({currentActiveAcademicYear} &rarr;{' '}
          {NEXT_ROLLOVER_ACADEMIC_YEAR})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('password')}
          className={`px-3.5 py-2 rounded-md text-xs font-semibold transition-colors ${
            activeTab === 'password'
              ? 'bg-[#0B1F3A] text-white'
              : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
          }`}
        >
          2. Account &amp; Change Password
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('age_rules')}
          className={`px-3.5 py-2 rounded-md text-xs font-semibold transition-colors ${
            activeTab === 'age_rules'
              ? 'bg-[#0B1F3A] text-white'
              : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
          }`}
        >
          3. Age-vs-Class Rules (1 April)
        </button>
      </div>

      {/* TAB 1: ACADEMIC YEAR ROLLOVER WIZARD (3-Step Multi-Step Flow with Back & Next/Finish) */}
      {activeTab === 'rollover' && (
        <div className="bg-white border border-slate-200 rounded-lg p-5 sm:p-6 space-y-6 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="font-display font-bold text-base text-[#0B1F3A]">
                Academic Year Rollover Wizard (Step {rolloverStep} of 3)
              </h2>
              <p className="text-slate-600 mt-0.5">
                Transition from the current active academic year (
                <strong className="font-mono">{currentActiveAcademicYear}</strong>) to the next
                academic cycle. Nothing is ever deleted; outgoing years become read-only snapshots.
              </p>
            </div>

            {/* Stepper Pills */}
            <div className="flex items-center gap-1.5 shrink-0">
              {[
                { step: 1 as const, label: '1. Target Cycle' },
                { step: 2 as const, label: '2. Review Checklist' },
                { step: 3 as const, label: '3. Confirm & Finish' },
              ].map((st) => (
                <button
                  key={st.step}
                  type="button"
                  onClick={() => setRolloverStep(st.step)}
                  className={`px-2.5 py-1.5 rounded font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B1F3A] ${
                    rolloverStep === st.step
                      ? 'bg-[#0B1F3A] text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          {/* STEP 1: SELECT TARGET ACADEMIC YEAR & SCOPE */}
          {rolloverStep === 1 && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div>
                  <label
                    htmlFor="target-rollover-select"
                    className="block font-semibold text-slate-800 mb-1"
                  >
                    Select Target New Academic Year *
                  </label>
                  <select
                    id="target-rollover-select"
                    value={targetRolloverYear}
                    onChange={(e) => setTargetRolloverYear(e.target.value)}
                    className="w-full rounded border border-slate-300 bg-white px-3 py-2 font-mono font-bold text-[#0B1F3A]"
                  >
                    <option value="">-- Choose Target Year --</option>
                    <option value={NEXT_ROLLOVER_ACADEMIC_YEAR}>
                      {NEXT_ROLLOVER_ACADEMIC_YEAR} (Next after {CURRENT_ACADEMIC_YEAR})
                    </option>
                    <option value="2028-29">2028-29 (Future Cycle)</option>
                  </select>
                </div>

                <div className="space-y-1 text-slate-600">
                  <div>
                    Outgoing Active Year:{' '}
                    <strong className="font-mono text-[#0B1F3A]">
                      {currentActiveAcademicYear}
                    </strong>{' '}
                    (becomes read-only snapshot)
                  </div>
                  <div>
                    Active Students Eligible:{' '}
                    <strong className="font-mono text-teal-800">{activeStudents.length}</strong> ·
                    Active Sections:{' '}
                    <strong className="font-mono text-indigo-800">{activeSections.length}</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: 3-COLUMN PREVIEW & CHECKLIST */}
          {rolloverStep === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-teal-50/70 border border-teal-200 space-y-2">
                  <div className="font-display font-bold text-sm text-teal-950 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-teal-700" />
                    <span>What Carries Over to {targetRolloverYear || 'Next Year'}</span>
                  </div>
                  <ul className="space-y-1.5 text-teal-900">
                    <li>
                      • <strong>{activeStudents.length} continuing active students</strong> (PEN
                      &amp; APAAR IDs preserved, masked by default)
                    </li>
                    <li>
                      • <strong>{activeSections.length} active classroom sections</strong> and
                      their assigned Class Teachers
                    </li>
                    <li>
                      • <strong>8 institutional programmes</strong> and CWSN accommodation profiles
                    </li>
                    <li>
                      • <strong>Outgoing year ({currentActiveAcademicYear})</strong> is preserved
                      intact as a read-only snapshot
                    </li>
                  </ul>
                </div>

                <div className="p-4 rounded-lg bg-indigo-50/70 border border-indigo-200 space-y-2">
                  <div className="font-display font-bold text-sm text-indigo-950 flex items-center gap-1.5">
                    <RotateCcw className="w-4 h-4 text-indigo-700" />
                    <span>What Resets for {targetRolloverYear || 'Next Year'}</span>
                  </div>
                  <ul className="space-y-1.5 text-indigo-900">
                    <li>
                      • <strong>Annual School Certification status</strong> resets to &ldquo;Data
                      Not Certified&rdquo; for the new cycle
                    </li>
                    <li>
                      • <strong>New-admission serial counters</strong> switch to prefix{' '}
                      <span className="font-mono">
                        ADM-{(targetRolloverYear || '2027').slice(0, 4)}-001
                      </span>
                    </li>
                    <li>
                      • <strong>Age-on-1-April calculation</strong> automatically advances to{' '}
                      <span className="font-mono">
                        01/04/{(targetRolloverYear || '2027').slice(0, 4)}
                      </span>
                    </li>
                  </ul>
                </div>

                <div className="p-4 rounded-lg bg-amber-50/70 border border-amber-200 space-y-2">
                  <div className="font-display font-bold text-sm text-amber-950 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-700" />
                    <span>Unresolved Items &amp; Non-Promoted Policy</span>
                  </div>
                  <ul className="space-y-1.5 text-amber-900">
                    <li>
                      • <strong>{unpromotedOrFlagged.length} students with unresolved flags</strong>{' '}
                      are <strong>not auto-promoted</strong>—they stay in their current semester
                      and are listed for nodal review
                    </li>
                    <li>
                      • <strong>{openRequests.length} open correction requests</strong> remain in
                      the Request Management queue
                    </li>
                    <li>
                      • <strong>Zero records deleted:</strong> Dropbox / Inactive students remain
                      archived safely
                    </li>
                  </ul>
                </div>
              </div>

              <label className="flex items-start gap-2.5 p-3.5 rounded-lg border border-slate-200 bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rolloverChecklistConfirmed}
                  onChange={(e) => setRolloverChecklistConfirmed(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#0B1F3A]"
                />
                <span className="text-slate-800 font-medium">
                  I have reviewed the carry-over rules and confirm that{' '}
                  <strong>{unpromotedOrFlagged.length} flagged records</strong> will remain held for
                  manual review without auto-promotion or deletion.
                </span>
              </label>
            </div>
          )}

          {/* STEP 3: AUDIT REASON & FINAL EXECUTION */}
          {rolloverStep === 3 && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-blue-50 border border-blue-200 text-blue-950 space-y-1.5">
                <div className="font-display font-bold text-sm">
                  Ready to Roll Over: {currentActiveAcademicYear} &rarr; {targetRolloverYear}
                </div>
                <p className="leading-relaxed">
                  Outgoing cycle <strong>{currentActiveAcademicYear}</strong> will be locked as a
                  read-only snapshot. All {activeStudents.length} active students and{' '}
                  {activeSections.length} classroom sections will transition into{' '}
                  <strong>{targetRolloverYear}</strong>.
                </p>
              </div>

              <div>
                <label
                  htmlFor="rollover-audit-reason"
                  className="block font-semibold text-slate-800 mb-1"
                >
                  Rollover Authorization Note (Logged in Audit Trail) *
                </label>
                <input
                  id="rollover-audit-reason"
                  type="text"
                  value={rolloverAuditReason}
                  onChange={(e) => setRolloverAuditReason(e.target.value)}
                  placeholder="Enter authorization reason for audit log..."
                  className="w-full rounded border border-slate-300 px-3 py-2 text-xs text-slate-900"
                />
              </div>
            </div>
          )}

          {/* Consistent Multi-Step Footer with Back (Left Arrow) and Next / Finish (Right Arrow) */}
          <div className="pt-4 border-t border-slate-200 space-y-2">
            {rolloverStep === 1 && !targetRolloverYear && (
              <p role="status" className="text-[11px] font-medium text-amber-800 text-right">
                Select a target academic year above to continue.
              </p>
            )}
            {rolloverStep === 1 && currentActiveAcademicYear === targetRolloverYear && (
              <p role="status" className="text-[11px] font-medium text-amber-800 text-right">
                Already rolled over to {targetRolloverYear}. Choose a future cycle to continue.
              </p>
            )}
            {rolloverStep === 2 && !rolloverChecklistConfirmed && (
              <p role="status" className="text-[11px] font-medium text-amber-800 text-right">
                Check the confirmation box above to proceed to Step 3.
              </p>
            )}
            {rolloverStep === 3 && !rolloverAuditReason.trim() && (
              <p role="status" className="text-[11px] font-medium text-amber-800 text-right">
                Enter an authorization note above to finish the rollover.
              </p>
            )}

            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                disabled={rolloverStep === 1}
                onClick={() =>
                  setRolloverStep((prev) => (prev > 1 ? ((prev - 1) as 1 | 2 | 3) : 1))
                }
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 min-h-[42px] rounded-md border border-slate-300 bg-white text-slate-700 font-semibold text-xs hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B1F3A]"
              >
                <ArrowLeft className="w-4 h-4 shrink-0" />
                <span>Back</span>
              </button>

              {rolloverStep < 3 ? (
                <button
                  type="button"
                  disabled={
                    (rolloverStep === 1 &&
                      (!targetRolloverYear || currentActiveAcademicYear === targetRolloverYear)) ||
                    (rolloverStep === 2 && !rolloverChecklistConfirmed)
                  }
                  onClick={() =>
                    setRolloverStep((prev) => (prev < 3 ? ((prev + 1) as 1 | 2 | 3) : 3))
                  }
                  className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 min-h-[42px] rounded-md bg-[#0B1F3A] text-white font-semibold text-xs hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
                >
                  <span>Next</span>
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </button>
              ) : (
                <button
                  type="button"
                  disabled={
                    !targetRolloverYear ||
                    currentActiveAcademicYear === targetRolloverYear ||
                    !rolloverAuditReason.trim()
                  }
                  onClick={() => setConfirmRolloverOpen(true)}
                  className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 min-h-[42px] rounded-md bg-teal-700 text-white font-semibold text-xs hover:bg-teal-800 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
                >
                  <span>Finish &amp; Confirm Rollover</span>
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </button>
              )}
            </div>
          </div>

          {confirmRolloverOpen && (
            <div
              role="dialog"
              aria-modal="true"
              className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4"
            >
              <div className="bg-white border border-slate-200 rounded-lg max-w-md w-full p-5 shadow-xl space-y-4">
                <div className="font-display font-bold text-base text-[#0B1F3A]">
                  Confirm Academic Year Rollover ({currentActiveAcademicYear} &rarr;{' '}
                  {targetRolloverYear})
                </div>
                <p className="text-slate-600 leading-relaxed">
                  This will make <strong className="font-mono">{currentActiveAcademicYear}</strong>{' '}
                  a read-only snapshot and activate{' '}
                  <strong className="font-mono">{targetRolloverYear}</strong>. All{' '}
                  {activeStudents.length} active students and {activeSections.length} sections carry
                  over; {unpromotedOrFlagged.length} flagged students remain listed for review. No
                  records are deleted.
                </p>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setConfirmRolloverOpen(false)}
                    className="px-3.5 py-2 rounded border border-slate-300 text-slate-700 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      executeAcademicYearRollover(targetRolloverYear);
                      setConfirmRolloverOpen(false);
                    }}
                    className="px-4 py-2 rounded bg-teal-700 text-white font-semibold hover:bg-teal-800"
                  >
                    Confirm Rollover &amp; Log Audit Entry
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: CHANGE PASSWORD INSIDE SETTINGS */}
      {activeTab === 'password' && (
        <div className="bg-white border border-slate-200 rounded-lg p-5 sm:p-6 max-w-xl space-y-4 text-xs">
          <div>
            <h2 className="font-display font-bold text-base text-[#0B1F3A]">
              Change Account Password
            </h2>
            <p className="text-slate-600 mt-0.5">
              Update credentials for <strong>{session.userName}</strong>.
            </p>
          </div>

          <div className="p-3.5 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-950 flex items-start gap-2.5">
            <Lock className="w-4 h-4 text-indigo-700 shrink-0 mt-0.5" />
            <div>
              <strong>Supabase Auth Security Architecture:</strong> Real password handling, hashing,
              and token rotation are performed exclusively by <strong>Supabase Auth</strong>—passwords
              are never stored in application code, React state, or browser storage.
            </div>
          </div>

          {pwNotice && (
            <div className="p-3.5 rounded-md bg-teal-50 border border-teal-200 text-teal-950 font-medium">
              {pwNotice}
            </div>
          )}

          {pwError && (
            <div className="p-3.5 rounded-md bg-red-50 border border-red-200 text-red-700 font-medium">
              {pwError}
            </div>
          )}

          <form onSubmit={handlePasswordChangeSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="settings-cur-pw"
                className="block font-semibold text-slate-700 mb-1"
              >
                Current Password
              </label>
              <input
                id="settings-cur-pw"
                type="password"
                required
                value={currentPw}
                onChange={(e) => setCurrentPw(e.target.value)}
                placeholder="Enter current password"
                className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="settings-new-pw"
                className="block font-semibold text-slate-700 mb-1"
              >
                New Password
              </label>
              <input
                id="settings-new-pw"
                type="password"
                required
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                placeholder="Enter new password (8+ characters)"
                className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
              />
              <div className="mt-1.5 flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Strength: {strength.label}</span>
                <span className="font-mono text-slate-500">{strength.score}/5 checks</span>
              </div>
            </div>

            <div>
              <label
                htmlFor="settings-conf-pw"
                className="block font-semibold text-slate-700 mb-1"
              >
                Confirm New Password
              </label>
              <input
                id="settings-conf-pw"
                type="password"
                required
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
                placeholder="Confirm new password"
                className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
              />
            </div>

            <button
              type="submit"
              className="px-4 py-2 rounded-md bg-[#0B1F3A] text-white font-semibold hover:bg-slate-800"
            >
              Update Password (Simulated)
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: AGE-VS-CLASS RULES */}
      {activeTab === 'age_rules' && (
        <div className="bg-white border border-slate-200 rounded-lg p-5 sm:p-6 space-y-4 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h2 className="font-display font-bold text-base text-[#0B1F3A]">
                Age-vs-Class Validation Rules (Calculated on 01/04/
                {selectedAcademicYear.slice(0, 4)})
              </h2>
              <p className="text-slate-600">
                Outliers are flagged as non-blocking &ldquo;Should check&rdquo; warnings, never
                auto-rejected.
              </p>
            </div>
            <button
              type="button"
              onClick={resetAgeRangeRules}
              className="px-3 py-1.5 rounded border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50"
            >
              Reset Defaults
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {ageRangeRules.map((rule) => (
              <div
                key={rule.id}
                className="p-3.5 rounded border border-slate-200 bg-slate-50/60 flex items-center justify-between gap-3"
              >
                <div>
                  <div className="font-semibold text-slate-900">
                    {rule.classOrProgrammeLabel}
                  </div>
                  <div className="font-mono text-[11px] text-slate-500">
                    Keyword: {rule.matchKeyword}
                  </div>
                </div>
                <div className="flex items-center gap-2 font-mono">
                  <input
                    type="number"
                    min={4}
                    max={40}
                    aria-label={`Min age for ${rule.classOrProgrammeLabel}`}
                    value={rule.minAgeYears}
                    onChange={(e) =>
                      updateAgeRangeRule(
                        rule.id,
                        parseInt(e.target.value, 10) || rule.minAgeYears,
                        rule.maxAgeYears
                      )
                    }
                    className="w-14 rounded border border-slate-300 bg-white px-2 py-1 text-center font-bold"
                  />
                  <span>to</span>
                  <input
                    type="number"
                    min={5}
                    max={50}
                    aria-label={`Max age for ${rule.classOrProgrammeLabel}`}
                    value={rule.maxAgeYears}
                    onChange={(e) =>
                      updateAgeRangeRule(
                        rule.id,
                        rule.minAgeYears,
                        parseInt(e.target.value, 10) || rule.maxAgeYears
                      )
                    }
                    className="w-14 rounded border border-slate-300 bg-white px-2 py-1 text-center font-bold"
                  />
                  <span>yrs</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// FEATURE 5: HELP AND SUPPORT PAGE (/teacher/help)
// - Searchable FAQ
// - "Report a problem" ticket form + Ticket History (Open, In Progress, Resolved)
// - Downloadable User Guide as a printable page
// - Link to Form Fields Validation Guide
// - "Take a tour" walkthrough trigger
// ============================================================================
const FAQ_ITEMS = [
  {
    q: `Why does the app show ${CURRENT_ACADEMIC_YEAR} as the current academic year and ${PREVIOUS_ACADEMIC_YEAR} as a snapshot?`,
    a: `All active student admissions, intake ceilings, and age-on-1-April calculations belong to the ${CURRENT_ACADEMIC_YEAR} academic session (01/04/2026 to 31/03/2027). Selecting ${PREVIOUS_ACADEMIC_YEAR} opens the read-only previous-year snapshot where editing is disabled.`,
    category: 'Academic Year',
  },
  {
    q: 'What should I do if a student does not have an APAAR ID yet?',
    a: 'In Add New Student Step 1, select "No". You can send a simulated 7-day single-use Parent Consent Link (/consent/:token) that shows only the student’s first name and class, or record physical consent status.',
    category: 'APAAR & Consent',
  },
  {
    q: 'Why is section archiving blocked for some classroom sections?',
    a: 'Archiving never deletes student records. If a section still has active students enrolled, archiving is blocked with an explanation until you move those students to another section via the Section Shift module.',
    category: 'Sections',
  },
  {
    q: 'How are CWSN (Children With Special Needs) records protected?',
    a: 'When CWSN is Yes, we record disability category, certificate status (record status only — no medical file uploads), and support checkboxes. In lists, CWSN details are masked by default, visible only to permitted roles, audit-logged on access, and suppressed in dashboard charts when a group has fewer than 5 students.',
    category: 'Privacy & CWSN',
  },
  {
    q: 'What is stored on my device in Offline Draft Mode?',
    a: 'Browser IndexedDB stores only non-sensitive form fields while typing. Full Aadhaar, PEN, and APAAR numbers are stripped before saving to device storage and requested again at sync time if needed.',
    category: 'Offline Mode',
  },
];

export const HelpAndSupportPage: React.FC = () => {
  const {
    supportTickets,
    createSupportTicket,
    updateSupportTicketStatus,
    setTourActive,
    setTourStep,
    selectedAcademicYear,
  } = useApp();

  const [faqQuery, setFaqQuery] = useState('');
  const [subject, setSubject] = useState('');
  const [pagePath, setPagePath] = useState('/teacher/students/new');
  const [priority, setPriority] = useState<TicketPriority>('Medium');
  const [description, setDescription] = useState('');
  const [showPrintableGuide, setShowPrintableGuide] = useState(false);

  const filteredFaqs = useMemo(() => {
    const q = faqQuery.trim().toLowerCase();
    if (!q) return FAQ_ITEMS;
    return FAQ_ITEMS.filter(
      (item) =>
        item.q.toLowerCase().includes(q) ||
        item.a.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
    );
  }, [faqQuery]);

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) return;
    createSupportTicket({
      subject,
      page: pagePath,
      description,
      priority,
    });
    setSubject('');
    setDescription('');
  };

  return (
    <div className="space-y-6 min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="text-xs font-semibold text-teal-700">
            Nodal Officer Help Center · {selectedAcademicYear}
          </div>
          <h1 className="font-display text-xl sm:text-2xl font-bold text-[#0B1F3A] break-words">
            Help, Support Tickets &amp; Guided Walkthrough
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Search the FAQ, report a problem ticket, print the User Guide, or launch the interactive
            product tour.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              setTourStep(0);
              setTourActive(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Take a Tour (Walkthrough)</span>
          </button>

          <button
            type="button"
            onClick={() => setShowPrintableGuide(!showPrintableGuide)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md border border-slate-300 bg-white text-slate-800 text-xs font-semibold hover:bg-slate-50"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{showPrintableGuide ? 'Hide Printable User Guide' : 'Printable User Guide'}</span>
          </button>

          <Link
            to="/teacher/validation-guide"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-[#0B1F3A] text-white text-xs font-semibold hover:bg-slate-800"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Form Fields Validation Guide &rarr;</span>
          </Link>
        </div>
      </div>

      {/* Downloadable / Printable User Guide Section */}
      {showPrintableGuide && (
        <div className="bg-white border-2 border-[#0B1F3A] rounded-lg p-6 space-y-4 text-xs print:border-0">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h2 className="font-display font-bold text-lg text-[#0B1F3A]">
                APAAR Ready — Nodal Officer Printable User Guide ({CURRENT_ACADEMIC_YEAR})
              </h2>
              <p className="text-slate-500">
                Official Reference Manual · Synthetic Demo Environment
              </p>
            </div>
            <button
              type="button"
              onClick={() => window.print()}
              className="px-3.5 py-2 rounded bg-[#0B1F3A] text-white font-semibold inline-flex items-center gap-1.5 print:hidden"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save as PDF</span>
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 leading-relaxed text-slate-700">
            <div className="space-y-1.5">
              <h3 className="font-bold text-[#0B1F3A]">1. Academic Year &amp; Read-Only Snapshots</h3>
              <p>
                The active academic cycle is <strong>{CURRENT_ACADEMIC_YEAR}</strong> (01/04/2026 to
                31/03/2027). Selecting <strong>{PREVIOUS_ACADEMIC_YEAR}</strong> switches the
                portal into Read-Only Snapshot mode where historical counts can be inspected safely.
              </p>
              <h3 className="font-bold text-[#0B1F3A] pt-2">
                2. Adding Students &amp; Simulated Parent Consent
              </h3>
              <p>
                Use the 4-Step Add Student form (`/teacher/students/new`). When a student has no
                APAAR ID, generate a simulated 7-day single-use consent link (`/consent/:token`)
                that displays only the student&apos;s first name and class.
              </p>
            </div>
            <div className="space-y-1.5">
              <h3 className="font-bold text-[#0B1F3A]">
                3. CWSN Sensitivity &amp; Identifier Masking
              </h3>
              <p>
                PEN and APAAR IDs are masked by default (`••••••••4829`). CWSN records store
                certificate status only (never medical files), are masked in student lists, log an
                audit event on access, and suppress aggregate counts below 5 (`&lt; 5`).
              </p>
              <h3 className="font-bold text-[#0B1F3A] pt-2">
                4. Non-Destructive Governance
              </h3>
              <p>
                Records are never auto-merged, auto-rejected, or deleted. Duplicate pairs are
                reviewed side-by-side, and sections with active students cannot be archived until
                students are shifted.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Searchable FAQ */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="font-display font-bold text-base text-[#0B1F3A]">
            Searchable Frequently Asked Questions (FAQ)
          </h2>
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={faqQuery}
              onChange={(e) => setFaqQuery(e.target.value)}
              placeholder="Search FAQ topics..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-md border border-slate-300"
            />
          </div>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {filteredFaqs.length === 0 ? (
            <div className="py-6 text-center text-slate-500">
              No FAQ entries match &ldquo;{faqQuery}&rdquo;. Try clearing your search or submit a
              support ticket below.
            </div>
          ) : (
            filteredFaqs.map((item) => (
              <div key={item.q} className="py-3 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-display font-bold text-sm text-[#0B1F3A]">{item.q}</span>
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 shrink-0">
                    {item.category}
                  </span>
                </div>
                <p className="text-slate-600 leading-relaxed">{item.a}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Report a Problem Form + Ticket History */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-xs">
        <form
          onSubmit={handleCreateTicket}
          className="lg:col-span-5 bg-white border border-slate-200 rounded-lg p-5 space-y-4"
        >
          <h2 className="font-display font-bold text-base text-[#0B1F3A]">
            Report a Problem (Create Support Ticket)
          </h2>

          <div>
            <label htmlFor="tkt-subject" className="block font-semibold text-slate-700 mb-1">
              Issue Subject
            </label>
            <input
              id="tkt-subject"
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Brief summary of the issue..."
              className="w-full rounded border border-slate-300 px-3 py-2 text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="tkt-page" className="block font-semibold text-slate-700 mb-1">
                Affected Page / Module
              </label>
              <select
                id="tkt-page"
                value={pagePath}
                onChange={(e) => setPagePath(e.target.value)}
                className="w-full rounded border border-slate-300 bg-white px-2.5 py-2 text-xs"
              >
                <option value="/teacher">School Dashboard (/teacher)</option>
                <option value="/teacher/students/new">Add New Student (/teacher/students/new)</option>
                <option value="/teacher/school/programmes">Class &amp; Section Management</option>
                <option value="/teacher/duplicates">Duplicate Records Review</option>
                <option value="/teacher/import">Import Module</option>
                <option value="/teacher/settings">Settings &amp; Rollover</option>
              </select>
            </div>

            <div>
              <label htmlFor="tkt-priority" className="block font-semibold text-slate-700 mb-1">
                Priority
              </label>
              <select
                id="tkt-priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as TicketPriority)}
                className="w-full rounded border border-slate-300 bg-white px-2.5 py-2 text-xs"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="tkt-desc" className="block font-semibold text-slate-700 mb-1">
              Detailed Description
            </label>
            <textarea
              id="tkt-desc"
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what happened and steps to reproduce (never include real Aadhaar numbers)..."
              className="w-full rounded border border-slate-300 px-3 py-2 text-xs"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-4 rounded-md bg-[#0B1F3A] text-white font-semibold hover:bg-slate-800"
          >
            Submit Support Ticket
          </button>
        </form>

        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-lg p-5 space-y-4 overflow-x-auto">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-base text-[#0B1F3A]">
              Ticket History ({supportTickets.length})
            </h2>
            <span className="text-[11px] text-slate-500">
              Status Flow: Open &rarr; In Progress &rarr; Resolved
            </span>
          </div>

          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-semibold text-slate-500 bg-slate-50">
                <th className="py-2.5 px-3">Ticket ID</th>
                <th className="py-2.5 px-3">Subject &amp; Page</th>
                <th className="py-2.5 px-3">Priority</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Update Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 align-top">
              {supportTickets.map((tkt) => (
                <tr key={tkt.id} className="hover:bg-slate-50">
                  <td className="py-3 px-3 font-mono whitespace-nowrap">
                    <div className="font-bold text-slate-900">{tkt.id}</div>
                    <div className="text-[10px] text-slate-500">{tkt.createdAt}</div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-semibold text-slate-900">{tkt.subject}</div>
                    <div className="font-mono text-[11px] text-indigo-700">{tkt.page}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{tkt.description}</div>
                  </td>
                  <td className="py-3 px-3 font-semibold">
                    <span
                      className={
                        tkt.priority === 'High'
                          ? 'text-red-600'
                          : tkt.priority === 'Medium'
                          ? 'text-amber-700'
                          : 'text-slate-600'
                      }
                    >
                      {tkt.priority}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-semibold whitespace-nowrap">
                    <span
                      className={
                        tkt.status === 'Resolved'
                          ? 'text-teal-700'
                          : tkt.status === 'In Progress'
                          ? 'text-indigo-700'
                          : 'text-amber-700'
                      }
                    >
                      {tkt.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right whitespace-nowrap">
                    <div className="inline-flex gap-1">
                      {(['Open', 'In Progress', 'Resolved'] as TicketStatus[]).map((st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => updateSupportTicketStatus(tkt.id, st)}
                          className={`px-2 py-1 rounded text-[10px] font-semibold border ${
                            tkt.status === st
                              ? 'bg-[#0B1F3A] text-white border-[#0B1F3A]'
                              : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
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
// FEATURE 5B: INTERACTIVE WALKTHROUGH TOUR OVERLAY (Skippable, Restartable)
// ============================================================================
const TOUR_STEPS = [
  {
    title: '1. Academic Year & Read-Only Snapshot Switcher',
    body: `The top bar defaults to ${CURRENT_ACADEMIC_YEAR} (Current Academic Year: 01/04/2026 to 31/03/2027). You can switch to ${PREVIOUS_ACADEMIC_YEAR} at any time to view the read-only previous-year snapshot.`,
    route: '/teacher',
  },
  {
    title: '2. Structured Role Sidebar & Class/Section Governance',
    body: 'Use the left navigation (or mobile drawer on phones) to manage School Details, create/rename/archive Classroom Sections, review Duplicate Records, and run Academic Year Rollover.',
    route: '/teacher/school/programmes',
  },
  {
    title: '3. 4-Step Student Registration, CWSN & Validation Coach',
    body: 'Add New Student includes Smart Name-Mismatch checks, Simulated Parent Consent links (/consent/:token), CWSN sensitive accommodation fields, and the live "Fix Before You Submit" Coach.',
    route: '/teacher/students/new',
  },
  {
    title: '4. Natural-Language Search, Offline Drafts & Judge Demo Guide',
    body: 'Search in plain English from the top bar, test IndexedDB Offline Drafts without storing sensitive IDs on-device, or open the Judge Demo Guide for a 3-minute end-to-end walkthrough.',
    route: '/teacher/students',
  },
];

export const InteractiveTourOverlay: React.FC = () => {
  const { tourActive, setTourActive, tourStep, setTourStep } = useApp();
  const navigate = useNavigate();

  if (!tourActive) return null;
  const current = TOUR_STEPS[tourStep] || TOUR_STEPS[0];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Interactive product walkthrough"
      className="fixed inset-0 z-50 bg-slate-950/55 flex items-end sm:items-center justify-center p-4"
    >
      <div className="bg-white border-2 border-indigo-600 rounded-lg max-w-lg w-full p-5 shadow-2xl space-y-4 text-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded">
            Guided Walkthrough · Step {tourStep + 1} of {TOUR_STEPS.length}
          </span>
          <button
            type="button"
            onClick={() => setTourActive(false)}
            className="text-slate-500 hover:text-slate-900 font-semibold"
          >
            Skip Tour
          </button>
        </div>

        <div className="space-y-1.5">
          <h3 className="font-display font-bold text-base text-[#0B1F3A]">{current.title}</h3>
          <p className="text-slate-600 leading-relaxed">{current.body}</p>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-100 gap-3">
          <button
            type="button"
            disabled={tourStep === 0}
            onClick={() => {
              const prevIdx = Math.max(0, tourStep - 1);
              setTourStep(prevIdx);
              navigate(TOUR_STEPS[prevIdx].route);
            }}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 min-h-[40px] rounded-md border border-slate-300 bg-white text-slate-700 font-semibold hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
          >
            <ArrowLeft className="w-4 h-4 shrink-0" />
            <span>Back</span>
          </button>

          <div className="flex items-center gap-2">
            {tourStep < TOUR_STEPS.length - 1 ? (
              <button
                type="button"
                onClick={() => {
                  const nextIdx = tourStep + 1;
                  setTourStep(nextIdx);
                  navigate(TOUR_STEPS[nextIdx].route);
                }}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 min-h-[40px] rounded-md bg-indigo-600 text-white font-semibold hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
              >
                <span>Next</span>
                <ArrowRight className="w-4 h-4 shrink-0" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setTourActive(false)}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 min-h-[40px] rounded-md bg-teal-700 text-white font-semibold hover:bg-teal-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
              >
                <span>Finish</span>
                <ArrowRight className="w-4 h-4 shrink-0" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// FEATURE 7: SUPABASE READINESS HEALTH PAGE (/dev/health)
// Admin only (shows NotPermittedPage if not Admin/AICTE)
// ============================================================================
export const DevHealthPage: React.FC = () => {
  const { session } = useApp();
  const [health, setHealth] = useState<DataServiceHealthReport | null>(null);
  const [loading, setLoading] = useState(true);

  const runCheck = async () => {
    setLoading(true);
    const res = await checkDataServiceHealth();
    setHealth(res);
    setLoading(false);
  };

  useEffect(() => {
    runCheck();
  }, []);

  // Admin / Central Monitoring check
  if (session.role !== 'aicte') {
    return (
      <NotPermittedPage requiredRoleLabel="Admin / AICTE Central Monitoring" />
    );
  }

  return (
    <div className="space-y-6 min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="text-xs font-semibold text-indigo-700">
            Admin System Diagnostics · Supabase Readiness
          </div>
          <h1 className="font-display text-xl sm:text-2xl font-bold text-[#0B1F3A] break-words">
            Data Service Layer &amp; Supabase Connection Health (/dev/health)
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Displays which data adapter is active (`VITE_USE_SUPABASE`), connection health, and the
            exact SQL tables required by each screen (also documented in `SETUP.md`).
          </p>
        </div>

        <button
          type="button"
          onClick={runCheck}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-[#0B1F3A] text-white text-xs font-semibold hover:bg-slate-800 disabled:opacity-50 self-start sm:self-center shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Re-test Connection</span>
        </button>
      </div>

      {loading || !health ? (
        <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-3 animate-pulse">
          <div className="h-5 bg-slate-200 rounded w-1/3" />
          <div className="h-4 bg-slate-100 rounded w-2/3" />
          <div className="h-20 bg-slate-100 rounded w-full" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-2">
            <div className="text-slate-500 font-medium">Active Data Service Adapter</div>
            <div className="font-display text-xl font-bold text-[#0B1F3A] flex items-center gap-2">
              <Database className="w-5 h-5 text-teal-600" />
              <span>
                {health.mode === 'supabase'
                  ? 'Supabase PostgreSQL Mode'
                  : 'Mock + IndexedDB Mode (Default)'}
              </span>
            </div>
            <div className="font-mono text-[11px] text-slate-500">
              VITE_USE_SUPABASE = {String(health.useSupabaseFlag)}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-2">
            <div className="text-slate-500 font-medium">Environment Variable Check</div>
            <div className="space-y-1 font-mono text-[11px]">
              <div>
                VITE_SUPABASE_URL:{' '}
                <strong className={health.hasSupabaseUrl ? 'text-teal-700' : 'text-amber-700'}>
                  {health.hasSupabaseUrl ? 'Configured' : 'Not set (Mock Fallback)'}
                </strong>
              </div>
              <div>
                VITE_SUPABASE_ANON_KEY:{' '}
                <strong className={health.hasSupabaseAnonKey ? 'text-teal-700' : 'text-amber-700'}>
                  {health.hasSupabaseAnonKey ? 'Configured (Masked)' : 'Not set (Mock Fallback)'}
                </strong>
              </div>
              <div className="text-slate-500 truncate">Endpoint: {health.maskedSupabaseUrl}</div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-2">
            <div className="text-slate-500 font-medium">Health Probe &amp; Latency</div>
            <div className="flex items-center gap-2 font-display text-lg font-bold">
              {health.connectionOk ? (
                <span className="text-teal-700 flex items-center gap-1.5">
                  <CheckCircle2 className="w-5 h-5" /> Healthy ({health.latencyMs} ms)
                </span>
              ) : (
                <span className="text-amber-700 flex items-center gap-1.5">
                  <AlertTriangle className="w-5 h-5" /> Fallback Active
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-600">{health.statusMessage}</p>
          </div>
        </div>
      )}

      {/* SQL Tables Required Per Screen */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
        <div>
          <h2 className="font-display font-bold text-base text-[#0B1F3A]">
            Exact SQL Tables Required Per Screen (Matches SETUP.md)
          </h2>
          <p className="text-xs text-slate-500">
            Full DDL `CREATE TABLE` statements are provided in `/SETUP.md` at the project root.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-semibold text-slate-500 bg-slate-50">
                <th className="py-2.5 px-3">Screen / Workflow</th>
                <th className="py-2.5 px-3">Route</th>
                <th className="py-2.5 px-3">Required SQL Tables</th>
                <th className="py-2.5 px-3">Data Responsibility</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 align-top">
              {SCREEN_SQL_REQUIREMENTS.map((row) => (
                <tr key={row.screenName} className="hover:bg-slate-50">
                  <td className="py-3 px-3 font-semibold text-slate-900">{row.screenName}</td>
                  <td className="py-3 px-3 font-mono text-[11px] text-indigo-700">
                    {row.routePath}
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex flex-wrap gap-1">
                      {row.tables.map((tbl) => (
                        <span
                          key={tbl}
                          className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-800"
                        >
                          {tbl}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-3 text-slate-600">{row.description}</td>
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
// FEATURE 8: "WHAT IS SIMULATED" TRANSPARENCY PAGE (/what-is-simulated)
// ============================================================================
export const WhatIsSimulatedPage: React.FC = () => {
  const simulatedItems = [
    {
      item: '1. APAAR ID & PEN Official Registry Verification',
      inThisDemo:
        'Validates 11-digit PEN and 12-digit APAAR formats, masks identifiers by default, and labels records as "Simulated Verification" or "Pending Official Verification".',
      inProduction:
        'Connects via authorized DigiLocker / Academic Bank of Credits (ABC) & UDISE+ APIs under government gateway credentials.',
    },
    {
      item: '2. Aadhaar Availability & Smart Name-Mismatch Check',
      inThisDemo:
        'Runs a client-side format check and rule-based phonetic/initial/surname-order comparison against synthetic Aadhaar names without ever storing or transmitting real Aadhaar numbers.',
      inProduction:
        'Uses UIDAI-compliant tokenized eKYC demographic verification through authorized state/central nodal gateways.',
    },
    {
      item: '3. Parent / Guardian Consent SMS & WhatsApp Dispatch (/consent/:token)',
      inThisDemo:
        'Generates a real 7-day single-use token link and shows an in-app preview of the SMS/WhatsApp message labelled "Simulated, no message is actually sent". Parents can open /consent/:token (which shows only first name and class) to Agree or Decline.',
      inProduction:
        'Dispatches DLT-registered SMS / official WhatsApp templates to the parent’s verified mobile number.',
    },
    {
      item: '4. Longitudinal Education History & Cross-Institution Lookup',
      inThisDemo:
        'Displays a simulated longitudinal timeline (Primary -> Secondary -> Higher Secondary -> UG) linked via masked PEN without unmasking the PEN, and logs every lookup to the audit trail.',
      inProduction:
        'Queries state/national registry indexes with inter-institutional consent handshakes.',
    },
    {
      item: '5. APAAR Ready AI Assistant & Natural-Language Search',
      inThisDemo:
        '100% offline, deterministic, rule-based intent matcher and plain-English filter parser (English, Hindi, Telugu). Never modifies records or exposes student PII.',
      inProduction:
        'Remains strictly read-only and guardrail-bound so AI never auto-merges, auto-deletes, or fabricates verification statuses.',
    },
    {
      item: '6. Account Password Reset Emails & Supabase Database Sync',
      inThisDemo:
        'Shows a "Simulated, no email is sent" confirmation with a direct link to the Reset Password screen, and defaults to the in-memory + IndexedDB data service unless VITE_USE_SUPABASE="true" is set.',
      inProduction:
        'Uses Supabase Auth SMTP recovery emails and live PostgreSQL Row-Level Security (RLS) tables defined in SETUP.md.',
    },
  ];

  return (
    <div className="space-y-6 min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="text-xs font-semibold text-amber-700">
            Judge &amp; Auditor Transparency Reference · {CURRENT_ACADEMIC_YEAR}
          </div>
          <h1 className="font-display text-xl sm:text-2xl font-bold text-[#0B1F3A] break-words">
            What Is Simulated in APAAR Ready
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Honest disclosure of every simulated boundary, synthetic dataset rule, and safety
            guardrail in this demonstration environment.
          </p>
        </div>

        <Link
          to="/demo-credentials"
          className="px-3.5 py-2 rounded-md bg-[#0B1F3A] text-white text-xs font-semibold hover:bg-slate-800 self-start sm:self-center shrink-0"
        >
          Demo Accounts Directory &rarr;
        </Link>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 text-[11px] font-semibold text-slate-500 bg-slate-50">
              <th className="py-3 px-4">Feature / Integration Boundary</th>
              <th className="py-3 px-4">How It Works in This Demo (Simulated)</th>
              <th className="py-3 px-4">Production Architecture Equivalent</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 align-top">
            {simulatedItems.map((row) => (
              <tr key={row.item} className="hover:bg-slate-50">
                <td className="py-3.5 px-4 font-display font-bold text-slate-900">{row.item}</td>
                <td className="py-3.5 px-4 text-slate-700 leading-relaxed">{row.inThisDemo}</td>
                <td className="py-3.5 px-4 text-slate-600 leading-relaxed">{row.inProduction}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ============================================================================
// FEATURE 8B: TOGGLEABLE "DEMO GUIDE" PANEL FOR JUDGES (Mounted in PortalLayout)
// Numbered 3-minute scenario linking to each step + Reset Demo Data (confirm dialog)
// ============================================================================
export const JudgeDemoGuideDrawer: React.FC = () => {
  const {
    demoGuideOpen,
    setDemoGuideOpen,
    resetAllDemoData,
    currentActiveAcademicYear,
    signInDemoAccount,
  } = useApp();
  const navigate = useNavigate();
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);

  if (!demoGuideOpen) return null;

  const steps = [
    {
      num: '1',
      time: '0:00 – 0:30',
      title: `Demo Accounts Directory & Login Flow (/demo-credentials · ${CURRENT_ACADEMIC_YEAR})`,
      desc: 'Roles and workspaces come strictly from the login flow. Open /demo-credentials to see quick-login buttons for all 7 demo accounts (School Teacher, School Management, College Teacher, College Management, AICTE State/National, Auditor).',
      actionLabel: 'Open Demo Logins (/demo-credentials)',
      onGo: () => {
        navigate('/demo-credentials');
        setDemoGuideOpen(false);
      },
    },
    {
      num: '2',
      time: '0:30 – 1:10',
      title: 'School Teacher: Context Bar, Assigned Scope & Clickable Masked PEN History',
      desc: 'Sign in as School Teacher (/teacher/school/students). See "You can see: Class 5-A, 5-B, 10-A" in the Context Bar, and click any masked PEN cell to open the "Education history" timeline drawer without unmasking the PEN.',
      actionLabel: 'Sign in: School Teacher',
      onGo: () => {
        const dest = signInDemoAccount('school_teacher');
        navigate(`${dest}/students`);
        setDemoGuideOpen(false);
      },
    },
    {
      num: '3',
      time: '1:10 – 1:45',
      title: 'School Management Portal (/school-management): Full 16-Item Governance Menu',
      desc: 'Sign in as Headmaster/Principal to inspect all 16 School Management screens: Overview, Institution Profile, Classes & Sections, Approved Intake, Admissions, Student Records, Data Quality, Duplicates, APAAR Readiness, Verification, Reconciliation, Analytics, Reports, Staff, Audit Logs & Settings.',
      actionLabel: 'Sign in: School Management',
      onGo: () => {
        const dest = signInDemoAccount('school_management');
        navigate(dest);
        setDemoGuideOpen(false);
      },
    },
    {
      num: '4',
      time: '1:45 – 2:20',
      title: 'College Teacher: School-to-College Longitudinal Education History',
      desc: 'Sign in as College Teacher (/teacher/college/students). Click a masked PEN cell to view earlier School (Primary, Secondary, Higher Secondary) + current College (UG) stages together, including transfer reconciliation and gap-year notes.',
      actionLabel: 'Sign in: College Teacher',
      onGo: () => {
        const dest = signInDemoAccount('college_teacher');
        navigate(`${dest}/students`);
        setDemoGuideOpen(false);
      },
    },
    {
      num: '5',
      time: '2:20 – 2:45',
      title: 'College Management Portal (/college): Full 16-Item Governance Menu',
      desc: 'Sign in as College Management to review programme intake vs enrolment, admission reconciliation with "Escalate" workflow, and staff permissions.',
      actionLabel: 'Sign in: College Management',
      onGo: () => {
        const dest = signInDemoAccount('college_management');
        navigate(dest);
        setDemoGuideOpen(false);
      },
    },
    {
      num: '6',
      time: '2:45 – 3:00',
      title: 'AICTE Central Monitoring & Strict Workspace Route Guard',
      desc: 'Sign in as AICTE National Officer (/aicte) or test URL route protection—trying to open a School URL from a College session immediately shows the "Not permitted" screen.',
      actionLabel: 'Sign in: AICTE National Officer',
      onGo: () => {
        const dest = signInDemoAccount('aicte_national');
        navigate(dest);
        setDemoGuideOpen(false);
      },
    },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="3-Minute Judge Demo Guide"
      className="fixed inset-0 z-50 flex justify-end bg-slate-950/50 backdrop-blur-[1px]"
    >
      <div className="w-full max-w-md bg-white h-full shadow-2xl border-l border-slate-200 flex flex-col justify-between overflow-hidden text-xs">
        <div className="p-4 sm:p-5 bg-[#0B1F3A] text-white flex items-center justify-between">
          <div>
            <div className="text-[11px] font-mono text-teal-300 uppercase">
              Judge Evaluation Walkthrough
            </div>
            <h2 className="font-display font-bold text-base">
              3-Minute Demo Guide ({currentActiveAcademicYear})
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setDemoGuideOpen(false)}
            aria-label="Close Demo Guide"
            className="p-1.5 rounded text-slate-300 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          <div className="p-3 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-950 flex items-center justify-between gap-2">
            <span>Want to see every simulated boundary in one table?</span>
            <Link
              to="/what-is-simulated"
              onClick={() => setDemoGuideOpen(false)}
              className="font-semibold text-indigo-700 underline shrink-0"
            >
              What is simulated &rarr;
            </Link>
          </div>

          {steps.map((st) => (
            <div
              key={st.num}
              className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/70 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-xs text-white bg-[#0B1F3A] px-2 py-0.5 rounded">
                  Step {st.num}
                </span>
                <span className="font-mono text-[11px] text-teal-700 font-semibold">
                  {st.time}
                </span>
              </div>
              <div className="font-display font-bold text-sm text-[#0B1F3A]">{st.title}</div>
              <p className="text-slate-600 leading-relaxed">{st.desc}</p>
              <button
                type="button"
                onClick={st.onGo}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-indigo-600 text-white font-semibold text-[11px] hover:bg-indigo-700"
              >
                <span>{st.actionLabel}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-2">
          <Link
            to="/demo-credentials"
            onClick={() => setDemoGuideOpen(false)}
            className="text-xs font-semibold text-slate-700 hover:underline"
          >
            All 7 Demo Accounts
          </Link>

          <button
            type="button"
            onClick={() => setConfirmResetOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-red-600 text-white font-semibold text-xs hover:bg-red-700"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset demo data</span>
          </button>
        </div>

        {confirmResetOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded-lg max-w-sm w-full p-5 shadow-xl space-y-4">
              <div className="font-display font-bold text-base text-[#0B1F3A]">
                Confirm Reset Demo Data?
              </div>
              <p className="text-slate-600 leading-relaxed">
                This will restore all synthetic school and college students, reset sections,
                tickets, and requests, clear IndexedDB drafts, and restore{' '}
                <strong className="font-mono">{CURRENT_ACADEMIC_YEAR}</strong> as the current
                academic year.
              </p>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmResetOpen(false)}
                  className="px-3 py-1.5 rounded border border-slate-300 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    await resetAllDemoData();
                    setConfirmResetOpen(false);
                    setDemoGuideOpen(false);
                  }}
                  className="px-4 py-1.5 rounded bg-red-600 text-white font-semibold hover:bg-red-700"
                >
                  Confirm Reset ({CURRENT_ACADEMIC_YEAR})
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// FEATURE 6: TOAST NOTIFICATION CONTAINER, 404 PAGE & NOT PERMITTED PAGE
// ============================================================================
export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useApp();
  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="fixed bottom-18 sm:bottom-6 left-4 z-50 flex flex-col gap-2 max-w-sm w-[calc(100vw-2rem)] pointer-events-none"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          role={t.tone === 'error' ? 'alert' : 'status'}
          className={`pointer-events-auto p-3.5 rounded-lg border shadow-lg text-xs font-medium flex items-start justify-between gap-2.5 transition-all ${
            t.tone === 'error'
              ? 'bg-red-50 text-red-950 border-red-300'
              : t.tone === 'warning'
              ? 'bg-amber-50 text-amber-950 border-amber-300'
              : t.tone === 'info'
              ? 'bg-blue-50 text-blue-950 border-blue-300'
              : 'bg-teal-50 text-teal-950 border-teal-300'
          }`}
        >
          <div className="flex items-start gap-2 min-w-0">
            {t.tone === 'error' ? (
              <AlertTriangle className="w-4 h-4 text-red-700 shrink-0 mt-0.5" />
            ) : t.tone === 'warning' ? (
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            ) : t.tone === 'info' ? (
              <Info className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
            )}
            <span className="leading-snug break-words">{t.message}</span>
          </div>
          <button
            type="button"
            onClick={() => dismissToast(t.id)}
            aria-label="Dismiss notification"
            className="p-0.5 rounded text-slate-500 hover:text-slate-900 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};

export const NotFound404Page: React.FC = () => {
  const location = useLocation();
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-lg p-6 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center mx-auto font-mono font-bold text-lg">
          404
        </div>
        <h1 className="font-display text-xl font-bold text-[#0B1F3A]">
          Page Not Found
        </h1>
        <p className="text-xs text-slate-600 leading-relaxed">
          The route <code className="font-mono bg-slate-100 px-1.5 py-0.5 rounded">{location.pathname}</code>{' '}
          does not exist in APAAR Ready ({CURRENT_ACADEMIC_YEAR}).
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          <Link
            to="/demo-credentials"
            className="px-4 py-2 rounded-md bg-[#0B1F3A] text-white text-xs font-semibold hover:bg-slate-800"
          >
            Demo Accounts Directory
          </Link>
          <Link
            to="/"
            className="px-4 py-2 rounded-md border border-slate-300 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50"
          >
            Public Landing Page
          </Link>
        </div>
      </div>
    </div>
  );
};

export const NotPermittedPage: React.FC<{
  requiredRoleLabel?: string;
}> = ({ requiredRoleLabel = 'Authorized Workspace & Role' }) => {
  const { session, activeWorkspace } = useApp();
  const location = useLocation();

  const permittedHomePath =
    session.role === 'aicte'
      ? '/aicte'
      : session.role === 'college'
      ? activeWorkspace === 'school'
        ? '/school-management'
        : '/college'
      : activeWorkspace === 'school'
      ? '/teacher/school'
      : '/teacher/college';

  return (
    <div className="min-h-[65vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white border border-red-200 rounded-lg p-6 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-red-50 border border-red-200 text-red-600 flex items-center justify-center mx-auto">
          <Lock className="w-5 h-5" />
        </div>
        <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-red-700">
          Not Permitted · Workspace &amp; Role Boundary Enforced
        </div>
        <h1 className="font-display text-xl font-bold text-[#0B1F3A]">
          Not Permitted for Your Current Login
        </h1>
        <p className="text-xs text-slate-600 leading-relaxed">
          You are signed in as <strong>{session.userName}</strong> (
          <span className="font-mono">{session.designation}</span> ·{' '}
          <strong>{activeWorkspace === 'school' ? 'School' : 'College'} Workspace</strong>). Opening{' '}
          <code className="font-mono bg-slate-100 px-1.5 py-0.5 rounded">{location.pathname}</code>{' '}
          is blocked because a user cannot access another workspace or role by changing the URL (
          {requiredRoleLabel}).
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          <Link
            to={permittedHomePath}
            className="px-4 py-2 rounded-md bg-[#0B1F3A] text-white text-xs font-semibold hover:bg-slate-800"
          >
            Return to Your Permitted Workspace
          </Link>
          <Link
            to="/demo-credentials"
            className="px-4 py-2 rounded-md border border-slate-300 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50"
          >
            Log In with Another Demo Account
          </Link>
        </div>
      </div>
    </div>
  );
};
