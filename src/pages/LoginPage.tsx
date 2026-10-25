import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import {
  Search,
  ArrowLeft,
  ArrowRight,
  Globe,
  Users,
  Building2,
  ShieldCheck,
  Eye,
  EyeOff,
  Lock,
  KeyRound,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { INDIAN_STATES, UserRole } from '../data/mockData';
import { useApp } from '../context/AppContext';

// Shared Layout Wrapper for the 4-Step Sequential Login Flow
const LoginStepShell: React.FC<{
  stepNumber: 1 | 2 | 3 | 4;
  stepTitle: string;
  stepSubtitle: string;
  onBack: () => void;
  backLabel?: string;
  children: React.ReactNode;
}> = ({ stepNumber, stepTitle, stepSubtitle, onBack, backLabel = 'Back', children }) => {
  const { loginFlow } = useApp();

  useEffect(() => {
    document.title = `${stepTitle} (Step ${stepNumber} of 4) - APAAR Ready`;
  }, [stepNumber, stepTitle]);

  const steps = [
    { num: 1, label: 'State / Scope' },
    { num: 2, label: 'Role' },
    { num: 3, label: 'Institution' },
    { num: 4, label: 'Credentials' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900 overflow-x-hidden">
      {/* Persistent Synthetic Data & Safety Notice (Collapsed to 1 line on phones) */}
      <div className="bg-[#0B1F3A] text-slate-200 px-4 sm:px-6 py-1.5 text-xs border-b border-slate-800">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="font-semibold text-amber-300 shrink-0">Demo data</span>
            <span className="shrink-0">·</span>
            <span className="truncate">
              Simulated Auth (No passwords stored)
            </span>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link to="/demo-credentials" className="text-amber-300 hover:underline font-semibold">
              Quick Demo Accounts
            </Link>
            <Link to="/" className="text-teal-300 hover:underline">
              Home
            </Link>
          </div>
        </div>
      </div>

      {/* Main Centered Single-Question Step Card */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6">
        <div className="max-w-xl w-full space-y-4 min-w-0">
          {/* Top Bar: Back Button + Step Indicator (X of 4) */}
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#0B1F3A] transition-colors truncate focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B1F3A] rounded px-1 py-0.5"
            >
              <ArrowLeft className="w-4 h-4 shrink-0" />
              <span className="truncate">{backLabel}</span>
            </button>

            <div className="text-xs font-mono font-semibold text-[#0B1F3A] bg-white border border-slate-200 px-2.5 py-1 rounded-md shrink-0">
              Step {stepNumber} of 4
            </div>
          </div>

          {/* 4-Step Visual Progress Bar */}
          <div className="grid grid-cols-4 gap-1.5 sm:gap-2 bg-white border border-slate-200 rounded-lg p-2.5 sm:p-3">
            {steps.map((s) => {
              const isCurrent = s.num === stepNumber;
              const isDone = s.num < stepNumber;
              const isSkipped =
                s.num === 3 &&
                (loginFlow.selectedRole === 'aicte' || loginFlow.isNationalLogin);

              return (
                <div key={s.num} className="space-y-1 min-w-0">
                  <div
                    className={`h-1.5 rounded-full transition-colors ${
                      isCurrent
                        ? 'bg-[#0B1F3A]'
                        : isDone
                        ? 'bg-teal-600'
                        : 'bg-slate-200'
                    }`}
                  />
                  <div className="flex items-center justify-between text-[10px] sm:text-[11px] min-w-0">
                    <span
                      className={`font-medium truncate ${
                        isCurrent
                          ? 'text-[#0B1F3A] font-semibold'
                          : isDone
                          ? 'text-teal-700'
                          : 'text-slate-400'
                      }`}
                    >
                      {s.num}. {s.label}
                    </span>
                    {isSkipped && (
                      <span className="hidden sm:inline text-[10px] text-slate-400 font-mono">
                        Skip
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Prior Step Context Summary Breadcrumb (if step > 1) */}
          {stepNumber > 1 && (
            <div className="bg-slate-100 border border-slate-200 rounded-md px-3.5 py-2 text-xs text-slate-600 flex flex-wrap items-center gap-1.5">
              <span className="font-semibold text-slate-700">Scope:</span>
              <span>
                {loginFlow.isNationalLogin
                  ? 'National Level Login'
                  : `State: ${loginFlow.selectedState}`}
              </span>
              {stepNumber > 2 && loginFlow.roleLabel && (
                <>
                  <span>·</span>
                  <span>{loginFlow.roleLabel}</span>
                </>
              )}
              {stepNumber > 3 && loginFlow.selectedInstitutionName && (
                <>
                  <span>·</span>
                  <span className="truncate max-w-[200px]">
                    {loginFlow.selectedInstitutionName}
                  </span>
                </>
              )}
            </div>
          )}

          {/* Active Question Card */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 sm:p-8 space-y-5">
            <div className="border-b border-slate-200 pb-4 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-xs font-semibold text-teal-700">
                  APAAR Ready · Step {stepNumber} of 4
                </div>
                <h1 className="font-display text-xl sm:text-2xl font-bold text-[#0B1F3A] mt-0.5 break-words">
                  {stepTitle}
                </h1>
                <p className="text-xs text-slate-500 mt-1">{stepSubtitle}</p>
              </div>
              <span className="text-[11px] font-medium text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded shrink-0">
                Demo only
              </span>
            </div>

            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// STEP 1 OF 4: /login/state
// "Select your state" (searchable list) + Next. Separate "National Level Login" option here.
// ============================================================================
export const LoginStateStep: React.FC = () => {
  const { loginFlow, setLoginFlow } = useApp();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [chosenState, setChosenState] = useState<string>(
    loginFlow.selectedState && loginFlow.selectedState !== 'All-India (National)'
      ? loginFlow.selectedState
      : 'Telangana'
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const filteredStates = useMemo(() => {
    return INDIAN_STATES.filter((st) =>
      st.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const isStep1Valid = Boolean(chosenState && filteredStates.length > 0);

  const handleNextState = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chosenState) {
      setErrorMsg('Please select a State / UT to continue.');
      return;
    }
    // Preserve earlier role/institution choices when going back and forth
    setLoginFlow((prev) => ({
      ...prev,
      step1Completed: true,
      isNationalLogin: false,
      selectedState: chosenState,
    }));
    navigate('/login/role');
  };

  const handleNationalLevelLogin = () => {
    setLoginFlow((prev) => ({
      ...prev,
      step1Completed: true,
      isNationalLogin: true,
      selectedState: 'All-India (National)',
      step2Completed: true,
      selectedRole: 'aicte',
      roleLabel: 'AICTE National Central Monitoring',
      step3Completed: true,
      selectedInstitutionId: 'NATIONAL-HQ',
      selectedInstitutionName: 'AICTE Central Monitoring Cell (National)',
    }));
    navigate('/login/role');
  };

  return (
    <LoginStepShell
      stepNumber={1}
      stepTitle="Select your state"
      stepSubtitle="Choose your State / UT jurisdiction from the searchable directory below, or proceed with National Level Login."
      onBack={() => navigate('/')}
      backLabel="Back to Landing Page"
    >
      <form onSubmit={handleNextState} className="space-y-5">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search state or union territory (e.g. Telangana, Karnataka, Maharashtra)..."
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-md border border-slate-300 focus:border-[#0B1F3A] focus:outline-none"
          />
        </div>

        {/* Searchable State Radio List */}
        <div className="max-h-56 overflow-y-auto border border-slate-200 rounded-md divide-y divide-slate-100">
          {filteredStates.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500">
              No matching states found for &ldquo;{searchQuery}&rdquo;.
            </div>
          ) : (
            filteredStates.map((st) => {
              const isSelected = chosenState === st;
              return (
                <label
                  key={st}
                  className={`flex items-center justify-between px-4 py-3 text-sm cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-[#0B1F3A]/5 text-[#0B1F3A] font-semibold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="stateChoice"
                      value={st}
                      checked={isSelected}
                      onChange={() => {
                        setChosenState(st);
                        setErrorMsg(null);
                      }}
                      className="text-[#0B1F3A] focus:ring-[#0B1F3A]"
                    />
                    <span>{st}</span>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">State Portal</span>
                </label>
              );
            })
          )}
        </div>

        {errorMsg && (
          <div className="text-xs text-red-600 flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {!isStep1Valid && (
          <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded px-3 py-2">
            Missing: Select a valid State or Union Territory from the list above to enable Next.
          </div>
        )}

        {/* Standardized Step Footer: Back (disabled on Step 1) and Next with Arrow Icons */}
        <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <button
            type="button"
            disabled
            aria-disabled="true"
            className="min-h-[42px] px-4 py-2.5 rounded-md border border-slate-200 bg-slate-100 text-slate-400 font-display font-semibold text-xs sm:text-sm inline-flex items-center justify-center gap-2 cursor-not-allowed opacity-60"
          >
            <ArrowLeft className="w-4 h-4 shrink-0" />
            <span>Back</span>
          </button>

          <button
            type="submit"
            disabled={!isStep1Valid}
            className="min-h-[42px] px-5 py-2.5 rounded-md bg-[#0B1F3A] text-white font-display font-semibold text-xs sm:text-sm hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors inline-flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B1F3A] focus-visible:ring-offset-2"
          >
            <span>Next ({chosenState})</span>
            <ArrowRight className="w-4 h-4 shrink-0" />
          </button>
        </div>

        {/* Separate National Level Login Option + Quick Demo Accounts Link */}
        <div className="pt-4 border-t border-slate-200 space-y-2.5">
          <div className="text-xs text-slate-500 text-center">
            Central Council / All-India Oversight Officials &amp; Evaluator Quick Access
          </div>
          <button
            type="button"
            onClick={handleNationalLevelLogin}
            className="w-full py-2.5 px-4 rounded-md border border-indigo-200 bg-indigo-50/70 text-indigo-900 font-display font-semibold text-xs hover:bg-indigo-100 transition-colors flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
          >
            <Globe className="w-4 h-4 text-indigo-700" />
            <span>National Level Login (Requires Simulated OTP Verification)</span>
          </button>
          <Link
            to="/demo-credentials"
            className="w-full py-2.5 px-4 rounded-md border border-teal-200 bg-teal-50/80 text-teal-900 font-display font-semibold text-xs hover:bg-teal-100 transition-colors flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
          >
            <KeyRound className="w-4 h-4 text-teal-700" />
            <span>Open Quick-Login Demo Accounts Directory (/demo-credentials) &rarr;</span>
          </Link>
        </div>
      </form>
    </LoginStepShell>
  );
};

// ============================================================================
// STEP 2 OF 4: /login/role
// "Select your role": Teacher / Authorized Staff, College Management, AICTE State Officer.
// Redirects to /login/state if Step 1 was not completed.
// ============================================================================
export const LoginRoleStep: React.FC = () => {
  const { loginFlow, setLoginFlow } = useApp();
  const navigate = useNavigate();

  const [chosenRole, setChosenRole] = useState<UserRole>(
    loginFlow.selectedRole || (loginFlow.isNationalLogin ? 'aicte' : 'teacher')
  );

  // Guard: If someone opens /login/role directly without completing Step 1, send them back to Step 1
  if (!loginFlow.step1Completed) {
    return <Navigate to="/login/state" replace />;
  }

  const roleOptions: Array<{
    role: UserRole;
    title: string;
    description: string;
    icon: React.FC<{ className?: string }>;
  }> = [
    {
      role: 'teacher',
      title: 'Teacher / Authorized Staff',
      description:
        'Manage student identity readiness, 4-step new student registration, PEN masking, and AI data cleaning.',
      icon: Users,
    },
    {
      role: 'college',
      title: 'Institution Management (Headmaster / Principal)',
      description:
        'Review class or programme-level approved intake vs actual enrolment, readiness compliance, and over-intake alerts.',
      icon: Building2,
    },
    {
      role: 'aicte',
      title: loginFlow.isNationalLogin
        ? 'AICTE National Officer (All-India)'
        : 'AICTE State Officer',
      description:
        'Monitor state and national technical college KPIs, duplicate clusters, and institutional intake governance advisories.',
      icon: ShieldCheck,
    },
  ];

  const handleBackFromRole = () => {
    const matched = roleOptions.find((r) => r.role === chosenRole);
    setLoginFlow((prev) => ({
      ...prev,
      selectedRole: chosenRole,
      roleLabel: matched ? matched.title : prev.roleLabel,
    }));
    navigate('/login/state');
  };

  const handleNextRole = (e: React.FormEvent) => {
    e.preventDefault();
    const matched = roleOptions.find((r) => r.role === chosenRole)!;

    if (chosenRole === 'aicte') {
      // Skip institution step for AICTE roles as required
      setLoginFlow((prev) => ({
        ...prev,
        step2Completed: true,
        selectedRole: 'aicte',
        roleLabel: matched.title,
        step3Completed: true,
        selectedInstitutionId: 'AICTE-STATE-CELL',
        selectedInstitutionName: prev.isNationalLogin
          ? 'AICTE Central Monitoring Cell (National)'
          : `AICTE ${prev.selectedState} State Directorate`,
        selectedWorkspaceType: 'college',
        selectedInstitutionType: 'College',
      }));
      navigate('/login/credentials');
    } else {
      setLoginFlow((prev) => ({
        ...prev,
        isNationalLogin: false, // Teacher/Management roles operate at state/institution level
        step2Completed: true,
        selectedRole: chosenRole,
        roleLabel: matched.title,
      }));
      navigate('/login/institution');
    }
  };

  return (
    <LoginStepShell
      stepNumber={2}
      stepTitle="Select your role"
      stepSubtitle="Choose your operational role. AICTE roles proceed directly to credentials without institution selection."
      onBack={handleBackFromRole}
      backLabel="Back to State Selection"
    >
      <form onSubmit={handleNextRole} className="space-y-4">
        <div className="space-y-3">
          {roleOptions.map((opt) => {
            const Icon = opt.icon;
            const isSelected = chosenRole === opt.role;
            return (
              <label
                key={opt.role}
                className={`block p-4 rounded-lg border cursor-pointer transition-colors ${
                  isSelected
                    ? 'border-[#0B1F3A] bg-[#0B1F3A]/5'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <input
                    type="radio"
                    name="roleChoice"
                    value={opt.role}
                    checked={isSelected}
                    onChange={() => setChosenRole(opt.role)}
                    className="mt-1 text-[#0B1F3A] focus:ring-[#0B1F3A]"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-display font-bold text-sm text-[#0B1F3A] flex items-center gap-2">
                        <Icon className="w-4 h-4 text-teal-700" />
                        <span>{opt.title}</span>
                      </span>
                      {opt.role === 'aicte' && (
                        <span className="text-[11px] font-mono text-indigo-700">
                          Skips Step 3
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {opt.description}
                    </p>
                  </div>
                </div>
              </label>
            );
          })}
        </div>

        {/* Standardized Step Footer: Back and Next with Arrow Icons */}
        <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={handleBackFromRole}
            className="min-h-[42px] px-4 py-2.5 rounded-md border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 font-display font-semibold text-xs sm:text-sm inline-flex items-center justify-center gap-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B1F3A]"
          >
            <ArrowLeft className="w-4 h-4 shrink-0" />
            <span>Back</span>
          </button>

          <button
            type="submit"
            disabled={!chosenRole}
            className="min-h-[42px] px-5 py-2.5 rounded-md bg-[#0B1F3A] text-white font-display font-semibold text-xs sm:text-sm hover:bg-slate-800 disabled:opacity-50 transition-colors inline-flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B1F3A] focus-visible:ring-offset-2"
          >
            <span>
              {chosenRole === 'aicte' ? 'Next: Credentials' : 'Next: Institution'}
            </span>
            <ArrowRight className="w-4 h-4 shrink-0" />
          </button>
        </div>
      </form>
    </LoginStepShell>
  );
};

// ============================================================================
// STEP 3 OF 4: /login/institution
// Two tabs: "Schools" and "Colleges", then searchable list of institutions of that type for the selected state.
// Choosing one sets the workspace ('school' vs 'college') after login.
// ============================================================================
export const LoginInstitutionStep: React.FC = () => {
  const { loginFlow, setLoginFlow, allInstitutions } = useApp();
  const navigate = useNavigate();

  // Guards: If earlier steps are missing, redirect to /login/state
  if (!loginFlow.step1Completed || !loginFlow.step2Completed || !loginFlow.selectedRole) {
    return <Navigate to="/login/state" replace />;
  }

  // If role is AICTE, skip directly to credentials
  if (loginFlow.selectedRole === 'aicte') {
    return <Navigate to="/login/credentials" replace />;
  }

  const [activeTab, setActiveTab] = useState<'school' | 'college'>(
    loginFlow.selectedWorkspaceType || 'school'
  );
  const [searchInst, setSearchInst] = useState('');

  const tabInstitutions = useMemo(() => {
    const byType = allInstitutions.filter(
      (inst) => (inst.workspaceType || 'college') === activeTab
    );
    const inState = byType.filter((inst) => inst.state === loginFlow.selectedState);
    return inState.length > 0 ? inState : byType;
  }, [allInstitutions, activeTab, loginFlow.selectedState]);

  const [chosenInstId, setChosenInstId] = useState<string>(
    loginFlow.selectedInstitutionId || (tabInstitutions[0]?.id ?? '')
  );

  useEffect(() => {
    if (!tabInstitutions.some((i) => i.id === chosenInstId)) {
      setChosenInstId(tabInstitutions[0]?.id ?? '');
    }
  }, [tabInstitutions, chosenInstId]);

  const filteredInstitutions = useMemo(() => {
    return tabInstitutions.filter(
      (inst) =>
        inst.name.toLowerCase().includes(searchInst.toLowerCase()) ||
        inst.aisheCode.toLowerCase().includes(searchInst.toLowerCase()) ||
        inst.district.toLowerCase().includes(searchInst.toLowerCase())
    );
  }, [tabInstitutions, searchInst]);

  const isStep3Valid = filteredInstitutions.length > 0 && Boolean(chosenInstId);

  const handleBackFromInstitution = () => {
    const found = tabInstitutions.find((i) => i.id === chosenInstId);
    if (found) {
      setLoginFlow((prev) => ({
        ...prev,
        selectedInstitutionId: found.id,
        selectedInstitutionName: found.name,
        selectedWorkspaceType: found.workspaceType || activeTab,
        selectedInstitutionType:
          found.institutionType || (activeTab === 'school' ? 'School' : 'College'),
      }));
    }
    navigate('/login/role');
  };

  const handleNextInstitution = (e: React.FormEvent) => {
    e.preventDefault();
    const found =
      tabInstitutions.find((i) => i.id === chosenInstId) || tabInstitutions[0];
    if (!found) return;

    setLoginFlow((prev) => ({
      ...prev,
      step3Completed: true,
      selectedInstitutionId: found.id,
      selectedInstitutionName: found.name,
      selectedWorkspaceType: found.workspaceType || activeTab,
      selectedInstitutionType:
        found.institutionType || (activeTab === 'school' ? 'School' : 'College'),
    }));
    navigate('/login/credentials');
  };

  return (
    <LoginStepShell
      stepNumber={3}
      stepTitle="Select your institution"
      stepSubtitle={`Switch between Schools and Colleges in ${loginFlow.selectedState}. Your choice determines your workspace after login (Demo data).`}
      onBack={handleBackFromInstitution}
      backLabel="Back to Role Selection"
    >
      <form onSubmit={handleNextInstitution} className="space-y-4">
        {/* Two Tabs: Schools vs Colleges */}
        <div
          role="tablist"
          aria-label="Institution Workspace Type"
          className="grid grid-cols-2 gap-2 p-1 bg-slate-100 border border-slate-200 rounded-lg"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'school'}
            onClick={() => {
              setActiveTab('school');
              setSearchInst('');
            }}
            className={`py-2.5 px-3 rounded-md text-xs sm:text-sm font-display font-bold transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'school'
                ? 'bg-[#0B1F3A] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Schools &amp; Jr. Colleges</span>
            <span
              className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                activeTab === 'school'
                  ? 'bg-teal-500/20 text-teal-200'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              Classes 1–12
            </span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'college'}
            onClick={() => {
              setActiveTab('college');
              setSearchInst('');
            }}
            className={`py-2.5 px-3 rounded-md text-xs sm:text-sm font-display font-bold transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'college'
                ? 'bg-[#0B1F3A] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Colleges</span>
            <span
              className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                activeTab === 'college'
                  ? 'bg-indigo-500/20 text-indigo-200'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              UG / PG
            </span>
          </button>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchInst}
            onChange={(e) => setSearchInst(e.target.value)}
            placeholder={
              activeTab === 'school'
                ? `Search schools or junior colleges in ${loginFlow.selectedState} by name, UDISE code, or district...`
                : `Search colleges in ${loginFlow.selectedState} by name, AISHE code, or district...`
            }
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-md border border-slate-300 focus:border-[#0B1F3A] focus:outline-none"
          />
        </div>

        <div className="max-h-60 overflow-y-auto border border-slate-200 rounded-md divide-y divide-slate-100">
          {filteredInstitutions.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500">
              No {activeTab === 'school' ? 'schools' : 'colleges'} match &ldquo;{searchInst}&rdquo; in {loginFlow.selectedState}.
            </div>
          ) : (
            filteredInstitutions.map((inst) => {
              const isSelected = chosenInstId === inst.id;
              const badgeType =
                inst.institutionType || (activeTab === 'school' ? 'School' : 'College');
              return (
                <label
                  key={inst.id}
                  className={`flex items-start justify-between p-4 cursor-pointer transition-colors ${
                    isSelected ? 'bg-[#0B1F3A]/5' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="institutionChoice"
                      value={inst.id}
                      checked={isSelected}
                      onChange={() => setChosenInstId(inst.id)}
                      className="mt-1 text-[#0B1F3A] focus:ring-[#0B1F3A]"
                    />
                    <div>
                      <div className="font-display font-semibold text-sm text-[#0B1F3A] flex flex-wrap items-center gap-2">
                        <span>{inst.name}</span>
                        <span
                          className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                            badgeType === 'School'
                              ? 'bg-teal-50 text-teal-800 border-teal-200'
                              : badgeType === 'Junior College'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-indigo-50 text-indigo-800 border-indigo-200'
                          }`}
                        >
                          {badgeType}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {inst.type} · District: {inst.district}
                      </div>
                    </div>
                  </div>
                  <span className="font-mono text-xs text-slate-500 shrink-0">
                    {activeTab === 'school' ? 'UDISE' : 'AISHE'}: {inst.aisheCode}
                  </span>
                </label>
              );
            })
          )}
        </div>

        {!isStep3Valid && (
          <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded px-3 py-2">
            Missing: Select a valid {activeTab === 'school' ? 'school' : 'college'} from the list above to continue.
          </div>
        )}

        {/* Standardized Step Footer: Back and Next with Arrow Icons */}
        <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={handleBackFromInstitution}
            className="min-h-[42px] px-4 py-2.5 rounded-md border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 font-display font-semibold text-xs sm:text-sm inline-flex items-center justify-center gap-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B1F3A]"
          >
            <ArrowLeft className="w-4 h-4 shrink-0" />
            <span>Back</span>
          </button>

          <button
            type="submit"
            disabled={!isStep3Valid}
            className="min-h-[42px] px-5 py-2.5 rounded-md bg-[#0B1F3A] text-white font-display font-semibold text-xs sm:text-sm hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors inline-flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B1F3A] focus-visible:ring-offset-2"
          >
            <span>
              Next: Credentials ({activeTab === 'school' ? 'School' : 'College'})
            </span>
            <ArrowRight className="w-4 h-4 shrink-0" />
          </button>
        </div>
      </form>
    </LoginStepShell>
  );
};

// ============================================================================
// STEP 4 OF 4: /login/credentials
// Username/email, password with show/hide, Demo CAPTCHA, Submit/Login.
// National login adds a SIMULATED OTP screen after this.
// ============================================================================
interface CaptchaChallenge {
  mode: 'text' | 'math';
  displayPrompt: string;
  accessibleText: string;
  expectedAnswer: string;
}

function generateInMemoryCaptcha(mode: 'text' | 'math'): CaptchaChallenge {
  if (mode === 'math') {
    const a = Math.floor(Math.random() * 7) + 2;
    const b = Math.floor(Math.random() * 6) + 2;
    return {
      mode: 'math',
      displayPrompt: `${a} + ${b} = ?`,
      accessibleText: `Accessible maths question: What is ${a} plus ${b}? Enter the numeric sum.`,
      expectedAnswer: String(a + b),
    };
  }
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return {
    mode: 'text',
    displayPrompt: code,
    accessibleText: `Accessible text alternative: Type the 5 characters ${code.split('').join(' ')} (case-insensitive).`,
    expectedAnswer: code,
  };
}

export const LoginCredentialsStep: React.FC = () => {
  const { loginFlow, setSession, addAuditLog, clearTeacherContext, addToast } = useApp();
  const navigate = useNavigate();

  // Guard: If someone opens /login/credentials directly without completing earlier steps, send them back to Step 1
  if (
    !loginFlow.step1Completed ||
    !loginFlow.step2Completed ||
    !loginFlow.step3Completed ||
    !loginFlow.selectedRole
  ) {
    return <Navigate to="/login/state" replace />;
  }

  const chosenWorkspace = loginFlow.selectedWorkspaceType || 'school';

  const defaultEmail =
    loginFlow.selectedRole === 'teacher'
      ? chosenWorkspace === 'school'
        ? 'class.teacher@dps-hyderabad-demo.edu.in'
        : 'nodal.faculty@diet-demo.edu.in'
      : loginFlow.selectedRole === 'college'
      ? chosenWorkspace === 'school'
        ? 'headmaster@dps-hyderabad-demo.edu.in'
        : 'registrar@campus-demo.edu.in'
      : loginFlow.isNationalLogin
      ? 'national.director@aicte-sandbox.gov.in'
      : 'state.officer@aicte-sandbox.gov.in';

  const [username, setUsername] = useState(defaultEmail);
  const [password, setPassword] = useState('demo-portal-auth');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Demo CAPTCHA state (held strictly in transient React memory — never in localStorage or sessionStorage)
  const [captchaMode, setCaptchaMode] = useState<'text' | 'math'>('text');
  const [notRobotChecked, setNotRobotChecked] = useState(false);
  const [captchaChallenge, setCaptchaChallenge] = useState<CaptchaChallenge>(() =>
    generateInMemoryCaptcha('text')
  );
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaPassed, setCaptchaPassed] = useState(false);
  const [captchaError, setCaptchaError] = useState<string | null>(null);
  const [showAccessibleAlt, setShowAccessibleAlt] = useState(false);

  // Simulated OTP Sub-screen state for National Level Login
  const [awaitingSimulatedOtp, setAwaitingSimulatedOtp] = useState(false);
  const [otpCode, setOtpCode] = useState('482910');

  useEffect(() => {
    setUsername(defaultEmail);
  }, [defaultEmail]);

  const refreshCaptchaChallenge = useCallback(
    (nextMode?: 'text' | 'math', keepError = false) => {
      const m = nextMode || captchaMode;
      setCaptchaChallenge(generateInMemoryCaptcha(m));
      setCaptchaInput('');
      setCaptchaPassed(false);
      if (!keepError) {
        setCaptchaError(null);
      }
    },
    [captchaMode]
  );

  const handleVerifyCaptchaChallenge = () => {
    if (!notRobotChecked) {
      setCaptchaError('Please tick the "I\'m not a robot" checkbox first.');
      addToast('Please tick "I\'m not a robot" before verifying the CAPTCHA.', 'warning');
      return;
    }
    const cleanInput = captchaInput.trim().toUpperCase();
    const expected = captchaChallenge.expectedAnswer.trim().toUpperCase();
    if (!cleanInput || cleanInput !== expected) {
      const errMsg = 'Incorrect CAPTCHA answer. A new challenge has been loaded.';
      setCaptchaError(errMsg);
      refreshCaptchaChallenge(captchaMode, true);
      addToast(errMsg, 'error');
      return;
    }
    setCaptchaError(null);
    setCaptchaPassed(true);
    addToast('Demo CAPTCHA passed (simulated). You may now submit login.', 'success');
  };

  const completeLoginAndRedirect = () => {
    const role = loginFlow.selectedRole!;
    const workspaceType: 'school' | 'college' =
      role === 'aicte' ? 'college' : loginFlow.selectedWorkspaceType || 'school';
    const institutionType: 'School' | 'Junior College' | 'College' =
      role === 'aicte'
        ? 'College'
        : loginFlow.selectedInstitutionType ||
          (workspaceType === 'school' ? 'School' : 'College');

    const roleProfile: Record<UserRole, { name: string; designation: string }> = {
      teacher: {
        name: 'Dr. Kavitha Narayanan',
        designation:
          workspaceType === 'school'
            ? 'School Teacher & UDISE+/APAAR Nodal Officer'
            : 'College Faculty / Authorized Staff (APAAR Nodal)',
      },
      college: {
        name: 'Prof. Rajeshwar Rao',
        designation:
          workspaceType === 'school'
            ? 'Headmaster / Principal (School Management)'
            : 'College Management & Registrar',
      },
      aicte: {
        name: loginFlow.isNationalLogin
          ? 'Shri Arvind Krishnan (National Monitor)'
          : 'Dr. S. Venugopal (AICTE State Officer)',
        designation: loginFlow.isNationalLogin
          ? 'National Level Central Monitoring'
          : `AICTE State Officer (${loginFlow.selectedState})`,
      },
    };

    clearTeacherContext();

    // Never store password in app state or localStorage
    setSession({
      state: loginFlow.selectedState,
      role,
      roleDisplayLabel:
        role === 'college'
          ? workspaceType === 'school'
            ? 'School Management (Headmaster / Principal)'
            : 'College Management'
          : loginFlow.roleLabel,
      isNationalLogin: loginFlow.isNationalLogin,
      userName: roleProfile[role].name,
      designation: roleProfile[role].designation,
      institutionId:
        loginFlow.selectedInstitutionId ||
        (workspaceType === 'school' ? 'INST-SCH-01' : 'INST-TS-01'),
      institutionName:
        loginFlow.selectedInstitutionName ||
        (workspaceType === 'school'
          ? 'Demo Public School, Hyderabad'
          : 'Deccan Institute of Engineering & Technology'),
      workspaceType,
      institutionType,
    });

    addAuditLog({
      actor: roleProfile[role].name,
      role: loginFlow.roleLabel,
      action: 'PORTAL_SIGN_IN',
      targetStudentId: 'SESSION',
      details: `Signed in via 4-step flow (${loginFlow.selectedState} · Workspace: ${workspaceType.toUpperCase()} · ${
        loginFlow.isNationalLogin ? 'Simulated OTP Verified' : 'Demo CAPTCHA & Auth Verified'
      }).`,
    });

    addToast(
      `Signed in as ${roleProfile[role].name} (${workspaceType === 'school' ? 'School' : 'College'} Workspace).`,
      'success'
    );

    if (role === 'teacher') {
      navigate(workspaceType === 'school' ? '/teacher/school' : '/teacher/college');
    } else if (role === 'college') {
      navigate(workspaceType === 'school' ? '/school-management' : '/college');
    } else if (role === 'aicte') {
      navigate('/aicte');
    }
  };

  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (!captchaPassed) {
      const errMsg = 'Please complete the Demo CAPTCHA challenge before signing in.';
      setCaptchaError(errMsg);
      addToast(errMsg, 'warning');
      return;
    }

    // Supabase Auth check simulation & generic error message
    const trimmedUser = username.trim().toLowerCase();
    if (
      !trimmedUser ||
      !password ||
      password.length < 4 ||
      trimmedUser === 'invalid' ||
      trimmedUser.includes('unauthorized')
    ) {
      setAuthError('Invalid credentials or access not permitted');
      addToast('Invalid credentials or access not permitted', 'error');
      return;
    }

    // Clear password from local component state before transitioning (no passwords stored)
    setPassword('');

    if (loginFlow.isNationalLogin) {
      setAwaitingSimulatedOtp(true);
      addToast('Credentials verified. Enter the 6-digit simulated OTP.', 'info');
      return;
    }

    completeLoginAndRedirect();
  };

  const handleOtpVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.trim().length !== 6) {
      setAuthError('Invalid credentials or access not permitted');
      addToast('Invalid credentials or access not permitted', 'error');
      return;
    }
    completeLoginAndRedirect();
  };

  // Validation message for Step 4 Next/Submit button
  const step4MissingReasons: string[] = [];
  if (!username.trim()) step4MissingReasons.push('Official Username/Email');
  if (!password || password.length < 4) step4MissingReasons.push('Password (4+ chars)');
  if (!notRobotChecked) step4MissingReasons.push('"I\'m not a robot" checkbox');
  if (!captchaPassed) step4MissingReasons.push('Demo CAPTCHA verification');
  const isStep4Ready = step4MissingReasons.length === 0;

  // If National Level Login is active and credentials passed, render the SIMULATED OTP screen
  if (awaitingSimulatedOtp) {
    return (
      <LoginStepShell
        stepNumber={4}
        stepTitle="National Level Login — Simulated OTP Verification"
        stepSubtitle="Second-factor verification for All-India National Monitoring access (Simulated — no SMS or email sent)."
        onBack={() => setAwaitingSimulatedOtp(false)}
        backLabel="Back to Credentials"
      >
        <form onSubmit={handleOtpVerifySubmit} className="space-y-5">
          <div className="p-4 rounded-md bg-indigo-50 border border-indigo-200 text-xs text-indigo-950 flex items-start gap-2.5">
            <KeyRound className="w-4 h-4 text-indigo-700 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold">Simulated OTP Dispatch (Demo Only)</div>
              <p className="mt-0.5 text-indigo-800">
                A fictional 6-digit verification code (<strong className="font-mono">482910</strong>
                ) has been pre-filled for this national-level login simulation. Any 6-digit code
                is accepted.
              </p>
            </div>
          </div>

          <div>
            <label
              htmlFor="simulated-otp-input"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              Enter 6-Digit Simulated OTP
            </label>
            <input
              id="simulated-otp-input"
              type="text"
              maxLength={6}
              value={otpCode}
              onChange={(e) => {
                setOtpCode(e.target.value.replace(/\D/g, ''));
                setAuthError(null);
              }}
              className="w-full rounded-md border border-slate-300 px-4 py-2.5 text-base font-mono tracking-widest text-slate-900 focus:border-[#0B1F3A] focus:outline-none"
            />
          </div>

          {otpCode.trim().length !== 6 && (
            <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded px-3 py-2">
              Missing: Enter a 6-digit numeric OTP code to enable Submit.
            </div>
          )}

          {authError && (
            <div className="p-3 rounded-md bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setAwaitingSimulatedOtp(false)}
              className="min-h-[42px] px-4 py-2.5 rounded-md border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 font-display font-semibold text-xs sm:text-sm inline-flex items-center justify-center gap-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B1F3A]"
            >
              <ArrowLeft className="w-4 h-4 shrink-0" />
              <span>Back</span>
            </button>

            <button
              type="submit"
              disabled={otpCode.trim().length !== 6}
              className="min-h-[42px] px-5 py-2.5 rounded-md bg-[#0B1F3A] text-white font-display font-semibold text-xs sm:text-sm hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors inline-flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B1F3A] focus-visible:ring-offset-2"
            >
              <span>Submit &amp; Enter National Portal</span>
              <ArrowRight className="w-4 h-4 shrink-0" />
            </button>
          </div>
        </form>
      </LoginStepShell>
    );
  }

  return (
    <LoginStepShell
      stepNumber={4}
      stepTitle="Enter your credentials"
      stepSubtitle="Simulated Supabase Auth check. Passwords are never stored in browser or application state."
      onBack={() =>
        navigate(
          loginFlow.selectedRole === 'aicte' ? '/login/role' : '/login/institution'
        )
      }
      backLabel={
        loginFlow.selectedRole === 'aicte'
          ? 'Back to Role Selection'
          : 'Back to Institution Selection'
      }
    >
      <form onSubmit={handleCredentialsSubmit} className="space-y-5">
        <div>
          <label
            htmlFor="login-username"
            className="block text-xs font-semibold text-slate-700 mb-1.5"
          >
            Official Username / Email ID
          </label>
          <input
            id="login-username"
            type="text"
            required
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setAuthError(null);
            }}
            placeholder="Enter official email or username"
            className="w-full rounded-md border border-slate-300 px-3.5 py-2.5 text-sm font-mono text-slate-900 focus:border-[#0B1F3A] focus:outline-none"
          />
          <p className="text-[11px] text-slate-400 mt-1">
            Tip: Type &ldquo;invalid&rdquo; as the username to test the generic auth error banner.
          </p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="login-password"
              className="block text-xs font-semibold text-slate-700"
            >
              Password (Demo only — any 4+ character password works)
            </label>
            <Link
              to="/login/forgot-password"
              className="text-xs font-semibold text-indigo-700 hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setAuthError(null);
              }}
              placeholder="Enter password"
              className="w-full rounded-md border border-slate-300 pl-3.5 pr-20 py-2.5 text-sm text-slate-900 focus:border-[#0B1F3A] focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2.5 top-2 px-2 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 inline-flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B1F3A] rounded"
            >
              {showPassword ? (
                <>
                  <EyeOff className="w-3.5 h-3.5" />
                  <span>Hide</span>
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5" />
                  <span>Show</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* ===================================================================
            DEMO CAPTCHA (Placed right after Password and before Login/Submit)
            - "I'm not a robot" checkbox + short challenge (5-char distorted text or small maths question)
            - Refresh button to get a new challenge
            - Clear label: "Demo CAPTCHA (simulated). Real use needs a server-verified CAPTCHA."
            - Keyboard accessible + accessible text alternative
            - Never stored in localStorage or sessionStorage
           =================================================================== */}
        <div
          role="group"
          aria-labelledby="demo-captcha-heading"
          className="rounded-lg border border-slate-300 bg-slate-50/90 p-4 space-y-3.5"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
            <span
              id="demo-captcha-heading"
              className="text-xs font-semibold text-[#0B1F3A] flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4 text-teal-700 shrink-0" />
              <span>Demo CAPTCHA (simulated). Real use needs a server-verified CAPTCHA.</span>
            </span>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  const next = captchaMode === 'text' ? 'math' : 'text';
                  setCaptchaMode(next);
                  refreshCaptchaChallenge(next);
                }}
                className="px-2 py-1 rounded border border-slate-300 bg-white text-[11px] font-semibold text-slate-700 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B1F3A]"
              >
                {captchaMode === 'text' ? 'Switch to Maths Question' : 'Switch to 5-Char Text'}
              </button>
              <button
                type="button"
                onClick={() => setShowAccessibleAlt((prev) => !prev)}
                aria-expanded={showAccessibleAlt}
                className="px-2 py-1 rounded border border-indigo-200 bg-indigo-50 text-[11px] font-semibold text-indigo-800 hover:bg-indigo-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
              >
                {showAccessibleAlt ? 'Hide Text Alternative' : 'Accessible Text Alternative'}
              </button>
            </div>
          </div>

          {/* Step A: "I'm not a robot" Checkbox */}
          <label className="flex items-center justify-between gap-3 p-3 rounded-md bg-white border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors">
            <span className="inline-flex items-center gap-2.5 text-sm font-semibold text-slate-800">
              <input
                type="checkbox"
                checked={notRobotChecked}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setNotRobotChecked(checked);
                  setCaptchaError(null);
                  if (!checked) {
                    setCaptchaPassed(false);
                  }
                }}
                className="w-4 h-4 rounded text-[#0B1F3A] focus:ring-[#0B1F3A]"
              />
              <span>I&apos;m not a robot</span>
            </span>
            {captchaPassed ? (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 bg-teal-50 border border-teal-200 px-2.5 py-0.5 rounded">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>CAPTCHA Passed</span>
              </span>
            ) : (
              <span className="text-[11px] font-mono text-slate-500">
                Verification Required
              </span>
            )}
          </label>

          {/* Accessible Text Alternative Box for Screen Readers & Keyboard Users */}
          <div
            aria-live="polite"
            className={
              showAccessibleAlt
                ? 'p-2.5 rounded bg-indigo-50 border border-indigo-200 text-xs text-indigo-950 font-medium'
                : 'sr-only'
            }
          >
            {captchaChallenge.accessibleText}
          </div>

          {/* Step B: Short Challenge (5-Character Distorted Text OR Small Maths Question) + Refresh */}
          <div className="space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
              {/* Visual Distorted Challenge Box */}
              <div
                aria-hidden="true"
                className="flex items-center justify-between gap-2 px-3.5 py-2 rounded-md border border-slate-300 bg-gradient-to-r from-slate-100 via-white to-slate-200 select-none shrink-0"
              >
                <span
                  className={`font-mono font-bold text-base tracking-[0.28em] text-[#0B1F3A] ${
                    captchaChallenge.mode === 'text' ? 'italic -skew-x-12 line-through decoration-slate-400/50' : ''
                  }`}
                >
                  {captchaChallenge.displayPrompt}
                </span>
                <button
                  type="button"
                  onClick={() => refreshCaptchaChallenge()}
                  aria-label="Refresh CAPTCHA challenge"
                  title="Get a new CAPTCHA challenge"
                  className="p-1.5 rounded text-slate-600 hover:text-[#0B1F3A] hover:bg-slate-200/70 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B1F3A]"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 flex items-center gap-2">
                <label htmlFor="demo-captcha-input" className="sr-only">
                  {captchaChallenge.accessibleText}
                </label>
                <input
                  id="demo-captcha-input"
                  type="text"
                  value={captchaInput}
                  disabled={captchaPassed}
                  onChange={(e) => {
                    setCaptchaInput(e.target.value);
                    setCaptchaError(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleVerifyCaptchaChallenge();
                    }
                  }}
                  placeholder={
                    captchaChallenge.mode === 'math'
                      ? 'Enter maths answer (e.g. 9)'
                      : 'Enter 5-char code above'
                  }
                  className="flex-1 min-w-0 rounded-md border border-slate-300 bg-white px-3 py-2 text-xs sm:text-sm font-mono text-slate-900 focus:border-[#0B1F3A] focus:outline-none disabled:bg-slate-100"
                />
                {!captchaPassed ? (
                  <button
                    type="button"
                    onClick={handleVerifyCaptchaChallenge}
                    className="px-3.5 py-2 rounded-md bg-teal-700 text-white text-xs font-semibold hover:bg-teal-800 transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
                  >
                    Verify
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => refreshCaptchaChallenge()}
                    className="px-3 py-2 rounded-md border border-slate-300 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B1F3A]"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>

            {captchaError && (
              <div
                role="alert"
                className="p-2.5 rounded bg-red-50 border border-red-200 text-xs text-red-700 font-medium flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{captchaError}</span>
              </div>
            )}
          </div>
        </div>

        {authError && (
          <div
            role="alert"
            className="p-3.5 rounded-md bg-red-50 border border-red-200 text-xs font-medium text-red-700 flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{authError}</span>
          </div>
        )}

        {!isStep4Ready && (
          <div className="p-2.5 rounded bg-amber-50 border border-amber-200 text-xs text-amber-900">
            <strong>Complete to enable Login:</strong> {step4MissingReasons.join(' · ')}
          </div>
        )}

        <div className="p-3.5 rounded-md bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
          <Lock className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
          <div>
            <strong>Security &amp; Privacy Notice:</strong> Choices from earlier steps and CAPTCHA
            answers are held in transient memory only (never in localStorage or sessionStorage). No
            passwords are stored.
          </div>
        </div>

        {/* Standardized Step Footer: Back and Submit/Login with Arrow Icons */}
        <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={() =>
              navigate(
                loginFlow.selectedRole === 'aicte' ? '/login/role' : '/login/institution'
              )
            }
            className="min-h-[42px] px-4 py-2.5 rounded-md border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 font-display font-semibold text-xs sm:text-sm inline-flex items-center justify-center gap-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B1F3A]"
          >
            <ArrowLeft className="w-4 h-4 shrink-0" />
            <span>Back</span>
          </button>

          <button
            type="submit"
            disabled={!isStep4Ready}
            className="min-h-[42px] px-5 py-2.5 rounded-md bg-[#0B1F3A] text-white font-display font-semibold text-xs sm:text-sm hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors inline-flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B1F3A] focus-visible:ring-offset-2"
          >
            <span>
              {loginFlow.isNationalLogin
                ? 'Submit & Proceed to Simulated OTP'
                : 'Submit & Login to Portal'}
            </span>
            <ArrowRight className="w-4 h-4 shrink-0" />
          </button>
        </div>
      </form>
    </LoginStepShell>
  );
};

// ============================================================================
// /demo-credentials: QUICK-LOGIN BUTTONS FOR ALL 7 DEMO ACCOUNTS
// Each labelled "Demo accounts only" and signs in through normal login logic.
// ============================================================================
export const DemoCredentialsPage: React.FC = () => {
  const { signInDemoAccount, addToast } = useApp();
  const navigate = useNavigate();

  const demoAccounts: Array<{
    key:
      | 'school_teacher'
      | 'school_management'
      | 'college_teacher'
      | 'college_management'
      | 'aicte_state'
      | 'aicte_national'
      | 'auditor';
    title: string;
    workspaceBadge: 'School' | 'College';
    person: string;
    email: string;
    institution: string;
    scopeSummary: string;
    targetRoute: string;
  }> = [
    {
      key: 'school_teacher',
      title: '1. School Teacher',
      workspaceBadge: 'School',
      person: 'Dr. Kavitha Narayanan (Class Teacher)',
      email: 'class.teacher@dps-hyderabad-demo.edu.in',
      institution: 'Demo Public School, Hyderabad (UDISE-360101)',
      scopeSummary:
        'Scoped to assigned classes (Class 5-A, Class 5-B, Class 10-A) · Full 14-item School Teacher menu',
      targetRoute: '/teacher/school',
    },
    {
      key: 'school_management',
      title: '2. School Management (Headmaster / Principal)',
      workspaceBadge: 'School',
      person: 'Prof. Rajeshwar Rao (Headmaster / Principal)',
      email: 'headmaster@dps-hyderabad-demo.edu.in',
      institution: 'Demo Public School, Hyderabad (UDISE-360101)',
      scopeSummary:
        'Full school institution scope (Classes 1–12) · Full 16-item School Management governance portal',
      targetRoute: '/school-management',
    },
    {
      key: 'college_teacher',
      title: '3. College Teacher',
      workspaceBadge: 'College',
      person: 'Dr. Kavitha Narayanan (Faculty Class Advisor)',
      email: 'nodal.faculty@diet-demo.edu.in',
      institution: 'Deccan Institute of Engineering & Technology (AISHE C-41092)',
      scopeSummary:
        'Scoped to assigned sections (B.Tech CSE Section A & B) · Full 14-item College Teacher menu',
      targetRoute: '/teacher/college',
    },
    {
      key: 'college_management',
      title: '4. College Management',
      workspaceBadge: 'College',
      person: 'Prof. Rajeshwar Rao (Principal & Registrar)',
      email: 'registrar@diet-demo.edu.in',
      institution: 'Deccan Institute of Engineering & Technology (AISHE C-41092)',
      scopeSummary:
        'Full college institution scope (8 programmes) · Full 16-item College Management governance portal',
      targetRoute: '/college',
    },
    {
      key: 'aicte_state',
      title: '5. AICTE State officer',
      workspaceBadge: 'College',
      person: 'Dr. S. Venugopal (AICTE State Officer)',
      email: 'state.officer@aicte-sandbox.gov.in',
      institution: 'AICTE Telangana State Directorate',
      scopeSummary:
        'State-level technical college oversight, intake advisories, and readiness monitoring',
      targetRoute: '/aicte',
    },
    {
      key: 'aicte_national',
      title: '6. AICTE National officer',
      workspaceBadge: 'College',
      person: 'Shri Arvind Krishnan (AICTE National Monitor)',
      email: 'national.director@aicte-sandbox.gov.in',
      institution: 'AICTE Central Monitoring Cell (All-India)',
      scopeSummary:
        'All-India 10-state technical education rollups, policy standards, and system diagnostics',
      targetRoute: '/aicte',
    },
    {
      key: 'auditor',
      title: '7. Auditor',
      workspaceBadge: 'School',
      person: 'Smt. Padmaja Deshmukh, IA&AS (Sim.)',
      email: 'compliance.auditor@sandbox-oversight.edu.in',
      institution: 'Institutional Audit & Compliance Cell (Demo Public School)',
      scopeSummary:
        'Read-only audit log inspection, CSV audit export, reconciliation review, and privacy verification',
      targetRoute: '/school-management/audit',
    },
  ];

  const handleQuickSignIn = (acc: (typeof demoAccounts)[0]) => {
    const dest = signInDemoAccount(acc.key);
    addToast(
      `Signed in as ${acc.title} (${acc.workspaceBadge} Workspace · Demo accounts only).`,
      'success'
    );
    navigate(dest);
  };

  useEffect(() => {
    document.title = 'Demo Accounts Directory - APAAR Ready';
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900">
      <div className="bg-[#0B1F3A] text-slate-200 px-4 sm:px-6 py-2 text-xs border-b border-slate-800">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-amber-300">Demo accounts only</span>
            <span>·</span>
            <span>
              No role switcher exists inside the app — role and workspace are set strictly at login
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login/state" className="text-teal-300 hover:underline font-medium">
              4-Step Login Flow &rarr;
            </Link>
            <Link to="/" className="text-slate-300 hover:text-white">
              Landing Page
            </Link>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-8 space-y-6">
        <div className="bg-white border border-slate-200 rounded-lg p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded">
              <KeyRound className="w-3.5 h-3.5" />
              <span>Demo accounts only · Synthetic Sandbox Credentials</span>
            </div>
            <h1 className="font-display text-xl sm:text-2xl font-bold text-[#0B1F3A] mt-1">
              Quick-Login Demo Credentials Directory
            </h1>
            <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
              Select any of the 7 pre-configured accounts below to sign in through the standard
              session and route-guard logic. School users are strictly isolated to the{' '}
              <strong>School</strong> workspace and cannot open College routes by changing the URL
              (and vice versa).
            </p>
          </div>

          <Link
            to="/login/state"
            className="px-4 py-2.5 rounded-md border border-slate-300 bg-white text-xs font-semibold text-[#0B1F3A] hover:bg-slate-50 shrink-0 self-start sm:self-center"
          >
            Use 4-Step Sequential Login Instead &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {demoAccounts.map((acc) => (
            <div
              key={acc.key}
              className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col justify-between gap-4 hover:border-slate-300 transition-colors"
            >
              <div className="space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-display font-bold text-base text-[#0B1F3A]">
                    {acc.title}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                        acc.workspaceBadge === 'School'
                          ? 'bg-teal-50 text-teal-800 border-teal-200'
                          : 'bg-indigo-50 text-indigo-800 border-indigo-200'
                      }`}
                    >
                      {acc.workspaceBadge} Workspace
                    </span>
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200">
                      Demo accounts only
                    </span>
                  </div>
                </div>

                <div className="text-xs text-slate-700 space-y-1 font-mono bg-slate-50 border border-slate-200 rounded p-3">
                  <div>
                    <span className="text-slate-500 font-sans">Officer:</span>{' '}
                    <strong className="text-slate-900 font-sans">{acc.person}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 font-sans">Login ID:</span> {acc.email}
                  </div>
                  <div>
                    <span className="text-slate-500 font-sans">Institution:</span>{' '}
                    <span className="font-sans">{acc.institution}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-sans">Landing Route:</span>{' '}
                    <span className="text-indigo-700">{acc.targetRoute}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{acc.scopeSummary}</p>
              </div>

              <button
                type="button"
                onClick={() => handleQuickSignIn(acc)}
                className="w-full py-2.5 px-4 rounded-md bg-[#0B1F3A] text-white font-display font-semibold text-xs hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
              >
                <span>Sign In as {acc.title} (Demo accounts only)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

