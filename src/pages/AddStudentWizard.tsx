import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Save,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Info,
  X,
  Edit3,
  FileCheck2,
  Send,
  SlidersHorizontal,
  Database,
  Crosshair,
  ExternalLink,
} from 'lucide-react';
import { useApp, ConsentTokenRecord } from '../context/AppContext';
import { maskIdentifier, VerificationStatus } from '../data/mockData';
import { compareStudentNames, SmartNameComparisonCard } from '../utils/smartNameCheck';
import { saveOfflineDraftToIdb } from '../utils/indexedDbDrafts';
import {
  CURRENT_ACADEMIC_YEAR,
  DISABILITY_CATEGORIES,
  CWSN_SUPPORT_OPTIONS,
  CwsnCertificateStatus,
} from '../config/academicYears';

// ============================================================================
// RULE REFERENCE DICTIONARY FOR "[Refer Rule: x]" POPOVERS
// Each rule includes: What it means, Why it matters, How to fix
// ============================================================================
interface RuleExplanation {
  code: string;
  title: string;
  whatItMeans: string;
  whyItMatters: string;
  howToFix: string;
}

const RULE_DICTIONARY: Record<string, RuleExplanation> = {
  'R-1.1': {
    code: 'R-1.1',
    title: 'Existing APAAR ID Pre-Check',
    whatItMeans:
      'Checks whether the student already holds a 12-digit Automated Permanent Academic Account Registry (APAAR) identifier from a prior school or board.',
    whyItMatters:
      'Prevents duplicate APAAR generation requests and links existing Academic Bank of Credits (ABC) depository records without creating orphan profiles.',
    howToFix:
      'Select Yes if the student presents an existing 12-digit APAAR card; select No to mark the student for pre-requisite collection.',
  },
  'R-1.2': {
    code: 'R-1.2',
    title: '12-Digit APAAR Format Standard',
    whatItMeans:
      'Validates that a recorded APAAR ID consists of exactly 12 numeric digits (format check only; never claims live official verification).',
    whyItMatters:
      'Malformed alphanumeric strings or 10-digit roll numbers cause immediate batch rejection during registry handshakes.',
    howToFix:
      'Enter exactly 12 digits without spaces or hyphens. Status will be recorded as "Recorded - Pending Official Verification".',
  },
  'R-1.3': {
    code: 'R-1.3',
    title: 'Simulated Aadhaar Availability Check',
    whatItMeans:
      'Performs a simulated format and availability lookup using a fictional 12-digit demo number without storing or logging the raw identifier.',
    whyItMatters:
      'Verifies whether demographic seeding prerequisites exist before initiating parental consent workflows.',
    howToFix:
      'Tick the checkbox, enter any 12-digit fictional number (e.g. ending in even digits for "found", odd for "not found"), and click Go.',
  },
  'R-1.4': {
    code: 'R-1.4',
    title: 'Parent / Guardian Consent Status',
    whatItMeans:
      'Tracks whether explicit informed consent has been obtained from the student or parent/guardian for APAAR identity seeding.',
    whyItMatters:
      'APAAR creation strictly requires documented parent/guardian consent under data protection guidelines; records without consent cannot be submitted for creation.',
    howToFix:
      'Collect the signed consent form from the parent/guardian and update the status to "Obtained" before final APAAR readiness submission.',
  },
  '4.1.1': {
    code: '4.1.1',
    title: "Student's Name (As per School / Institutional Record)",
    whatItMeans:
      'Full legal name of the student exactly as entered in the institutional Admission Register and Class XII qualifying certificate.',
    whyItMatters:
      'Serves as the primary anchor for academic transcripts and cross-comparison against identity documents.',
    howToFix:
      'Use full expanded names in Title Case without honorific prefixes (avoid "Mr.", "Ms.", "Kumari") or trailing punctuation.',
  },
  '4.1.2': {
    code: '4.1.2',
    title: 'Student Gender Classification',
    whatItMeans:
      'Standard demographic gender marker (Male, Female, or Other/Transgender) recorded in the admission register.',
    whyItMatters:
      'Required for demographic parity match during simulated registry verification and statutory AICTE/AISHE reporting.',
    howToFix:
      'Select the gender option matching the student’s official qualifying certificate and identity card.',
  },
  '4.1.3': {
    code: '4.1.3',
    title: 'Date of Birth (Chronological Baseline)',
    whatItMeans:
      'Student’s birth date as recorded in the High School / Class X matriculation certificate.',
    whyItMatters:
      'Used alongside Name and Gender for 3-factor demographic matching and must precede the Admission Date.',
    howToFix:
      'Enter a valid past date matching the Class X certificate. Ensure the Admission Date (4.1.9) occurs after this birth date.',
  },
  '4.1.4': {
    code: '4.1.4',
    title: "Mother's Full Name",
    whatItMeans:
      'Full name of the student’s mother as recorded in the official institutional admission register.',
    whyItMatters:
      'Mandatory family linkage field used to disambiguate students sharing identical names and birth dates within the same cohort.',
    howToFix:
      'Enter the mother’s full name without titles ("Smt.", "Late"). If unavailable, ensure Guardian’s Name (4.1.6) is populated.',
  },
  '4.1.5': {
    code: '4.1.5',
    title: "Father's Full Name",
    whatItMeans:
      'Full name of the student’s father as recorded in the qualifying board mark sheet.',
    whyItMatters:
      'Prevents false-positive duplicate flags when two students share the same first and last name.',
    howToFix:
      'Enter the father’s full name without prefixes ("Shri", "Dr.", "MD."). Expand initials wherever documented.',
  },
  '4.1.6': {
    code: '4.1.6',
    title: "Guardian's Name (Optional / Conditional)",
    whatItMeans:
      'Legal guardian’s full name where applicable or when parent details require supplementary guardianship documentation.',
    whyItMatters:
      'Provides authorized signatory linkage for consent verification when parents are unavailable.',
    howToFix:
      'Enter the legal guardian’s name if applicable, or leave blank if both Mother’s and Father’s names are recorded.',
  },
  '4.1.7': {
    code: '4.1.7',
    title: 'Aadhaar Number of Student (Optional · Masked Demo Only)',
    whatItMeans:
      'Optional 12-digit synthetic identifier used strictly for local format simulation; automatically masked in UI and audit logs.',
    whyItMatters:
      'Allows pre-checking demographic alignment while enforcing strict privacy masking (only trailing 4 digits shown).',
    howToFix:
      'Enter a 12-digit fictional demo number (never enter a real Aadhaar number) or leave blank.',
  },
  '4.1.8': {
    code: '4.1.8',
    title: 'Name of Student as per Aadhaar Card',
    whatItMeans:
      'Exact spelling of the student’s name printed on their identity card for cross-field comparison against Field 4.1.1.',
    whyItMatters:
      'Any spelling or initial variance between 4.1.1 (School Record) and 4.1.8 (Identity Card) triggers a demographic mismatch in APAAR seeding.',
    howToFix:
      'Enter the exact name on the card. If a mismatch warning appears, initiate name standardization or document the variance before submission.',
  },
  '4.1.9': {
    code: '4.1.9',
    title: 'Institutional Admission Date (DD/MM/YYYY)',
    whatItMeans:
      'Formal date of admission into the current academic programme in DD/MM/YYYY format.',
    whyItMatters:
      'Establishes cohort seniority and must chronologically follow the student’s Date of Birth (4.1.3).',
    howToFix:
      'Enter the date in strict DD/MM/YYYY format (e.g., 14/08/2026) and verify it is after the Date of Birth.',
  },
  '4.1.10': {
    code: '4.1.10',
    title: 'Primary Mobile Number (10 Digits)',
    whatItMeans:
      '10-digit primary contact mobile number of the student or parent/guardian (no alternate mobile field is permitted).',
    whyItMatters:
      'Used for DigiLocker / ABC token notifications and student consent confirmation.',
    howToFix:
      'Enter a valid 10-digit numeric mobile number starting with 6, 7, 8, or 9 without country code prefixes.',
  },
  '4.1.11': {
    code: '4.1.11',
    title: 'Children With Special Needs (CWSN) Indicator',
    whatItMeans:
      'Binary indicator (Yes / No) recording whether the student is enrolled under CWSN / PwD provisions.',
    whyItMatters:
      'Ensures accurate reservation quota accounting and examination accommodation readiness.',
    howToFix:
      'Select Yes or No based on verified medical/disability certification on file.',
  },
  'R-3.1': {
    code: 'R-3.1',
    title: 'Programme & Sanctioned Intake Ceiling Check',
    whatItMeans:
      'Links the student to an AICTE-approved engineering programme and checks real-time enrolment against the sanctioned intake limit.',
    whyItMatters:
      'Enrolling students beyond sanctioned intake without supernumerary tags triggers an AICTE Over-Intake Compliance Alert.',
    howToFix:
      'Verify the selected programme and review any live over-intake warning before finalizing admission.',
  },
  'R-3.2': {
    code: 'R-3.2',
    title: 'Section & Departmental Roster Mapping',
    whatItMeans:
      'Assigns the student to a specific classroom section and academic department for faculty nodal tracking.',
    whyItMatters:
      'Enables section-wise readiness audits and prevents duplicate roll assignments across parallel sections.',
    howToFix:
      'Select the assigned Section (e.g. Section A/B) and confirm the parent Department.',
  },
  'R-3.3': {
    code: 'R-3.3',
    title: 'Academic Year & Unique Admission Number',
    whatItMeans: `Records the admission cohort session (e.g. ${CURRENT_ACADEMIC_YEAR}) and the institution’s unique Admission Register serial number.`,
    whyItMatters:
      'Admission Number is the immutable institutional primary key linking ERP records to national registries.',
    howToFix:
      'Ensure Admission Number is non-empty and unique within the current Academic Year.',
  },
  'R-3.4': {
    code: 'R-3.4',
    title: 'Admission Quota, Feeder Institution & Enrolment Status',
    whatItMeans:
      'Captures seat allotment category (Convener / Management / Supernumerary), feeder Class XII institution, and active semester state.',
    whyItMatters:
      'Distinguishes regular sanctioned seats from supernumerary EWS/TFW seats during intake audits.',
    howToFix:
      'Select the allotment category, enter the qualifying feeder college, and set Enrolment Status.',
  },
  'R-AGE': {
    code: 'R-AGE',
    title: 'Age-vs-Class Baseline Check (As on 1 April of Academic Year)',
    whatItMeans:
      'Compares the student’s age calculated on 1 April of the academic year against the typical age range configured for the selected class or programme.',
    whyItMatters:
      'Identifies possible Date of Birth data-entry typos (e.g. wrong birth decade) while allowing genuine younger/older students after review.',
    howToFix:
      'Verify the Date of Birth against the Class X / birth certificate. Outliers are flagged only as a warning for review — never a block or rejection.',
  },
};

export interface ValidationRuleGuideRow extends RuleExplanation {
  required: boolean;
  format: string;
  example: string;
}

export const RULE_DICTIONARY_LIST: ValidationRuleGuideRow[] = Object.values(RULE_DICTIONARY).map(
  (r) => ({
    ...r,
    required: !['R-1.3', '4.1.6', '4.1.7', '4.1.8'].includes(r.code),
    format:
      r.code === 'R-1.2' || r.code === '4.1.7'
        ? '12 Numeric Digits'
        : r.code === '4.1.9'
        ? 'DD/MM/YYYY (After DOB)'
        : r.code === '4.1.10'
        ? '10 Numeric Digits'
        : r.code === '4.1.3'
        ? 'YYYY-MM-DD'
        : 'Standard Text / Selection',
    example:
      r.code === 'R-1.2'
        ? '482910384756'
        : r.code === '4.1.1'
        ? 'Pranav Kulkarni'
        : r.code === '4.1.7'
        ? '•••• •••• 4829'
        : r.code === '4.1.9'
        ? '14/08/2026'
        : r.code === '4.1.10'
        ? '9848012345'
        : 'Valid Roster Entry',
  })
);

// Reusable Field Header with Number, Label, and "[Refer Rule: x]" Popover Trigger
const FieldCardHeader: React.FC<{
  fieldNumber?: string;
  label: string;
  ruleCode: string;
  required?: boolean;
  activeRule: string | null;
  setActiveRule: (code: string | null) => void;
}> = ({ fieldNumber, label, ruleCode, required, activeRule, setActiveRule }) => {
  const rule = RULE_DICTIONARY[ruleCode];
  const isOpen = activeRule === ruleCode;

  return (
    <div className="relative mb-2">
      <div className="flex items-start justify-between gap-2">
        <label className="text-xs font-semibold text-slate-800 leading-snug">
          {fieldNumber && (
            <span className="font-mono text-[#0B1F3A] font-bold mr-1.5">{fieldNumber}</span>
          )}
          <span>{label}</span>
          {required && <span className="text-red-600 ml-0.5">*</span>}
        </label>

        <button
          type="button"
          onClick={() => setActiveRule(isOpen ? null : ruleCode)}
          className="text-[11px] font-mono font-medium text-indigo-700 hover:text-indigo-900 hover:underline shrink-0 inline-flex items-center gap-0.5"
        >
          <span>[Refer Rule: {ruleCode}]</span>
        </button>
      </div>

      {/* Rule Explanation Popover */}
      {isOpen && rule && (
        <div className="mt-2 p-3.5 rounded-md bg-[#0B1F3A] text-white text-xs space-y-2 border border-slate-700 z-20 relative">
          <div className="flex items-center justify-between border-b border-slate-700 pb-1.5">
            <span className="font-mono font-semibold text-teal-300">
              Rule {rule.code}: {rule.title}
            </span>
            <button
              type="button"
              onClick={() => setActiveRule(null)}
              className="text-slate-400 hover:text-white"
              aria-label="Close rule explanation"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div>
            <span className="font-semibold text-amber-300">What it means: </span>
            <span className="text-slate-200">{rule.whatItMeans}</span>
          </div>
          <div>
            <span className="font-semibold text-teal-300">Why it matters: </span>
            <span className="text-slate-200">{rule.whyItMatters}</span>
          </div>
          <div>
            <span className="font-semibold text-indigo-300">How to fix: </span>
            <span className="text-slate-200">{rule.howToFix}</span>
          </div>
          <div className="pt-1 border-t border-slate-700/80 flex justify-end">
            <Link
              to={`/teacher/validation-guide?rule=${encodeURIComponent(rule.code)}`}
              className="text-[11px] font-mono text-teal-300 hover:underline"
            >
              Open in Form Fields Validation Guide &rarr;
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

// Five-Part Validation Item Structure for Step 4 & "Fix Before You Submit" Coach
interface ValidationFinding {
  id: string;
  severity: 'blocking' | 'warning' | 'info';
  ruleCode: string;
  fieldLabel: string;
  whatFailed: string;
  whyItMatters: string;
  howToFix: string;
  targetStep: 1 | 2 | 3;
  fieldCardId: string;
}

// Helper to parse DD/MM/YYYY into a Date object
function parseDdMmYyyy(str: string): Date | null {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(str.trim());
  if (!match) return null;
  const day = parseInt(match[1], 10);
  const month = parseInt(match[2], 10) - 1;
  const year = parseInt(match[3], 10);
  const d = new Date(year, month, day);
  if (d.getFullYear() !== year || d.getMonth() !== month || d.getDate() !== day) {
    return null;
  }
  return d;
}

export const AddStudentWizard: React.FC = () => {
  const {
    session,
    programmes,
    studentDraft,
    setStudentDraft,
    resetStudentDraft,
    addStudentRecord,
    addAuditLog,
    createSimulatedConsentRequest,
    refreshOfflineDrafts,
    ageRangeRules,
    updateAgeRangeRule,
    resetAgeRangeRules,
    managedSections,
    academicYearsMeta,
    isReadOnlySnapshot,
    activeWorkspace,
    addToast,
  } = useApp();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [activeRule, setActiveRule] = useState<string | null>(null);
  const [draftSavedBanner, setDraftSavedBanner] = useState<string | null>(null);
  const [highlightedFieldId, setHighlightedFieldId] = useState<string | null>(null);

  // Feature 2: Simulated Parent Consent SMS/WhatsApp Preview Modal state
  const [consentMobileInput, setConsentMobileInput] = useState(
    studentDraft.mobileNumber || '9848012345'
  );
  const [generatedConsentToken, setGeneratedConsentToken] = useState<ConsentTokenRecord | null>(
    null
  );

  // Feature 4: IndexedDB Auto-Save Status while typing
  const [idbAutoSaveTime, setIdbAutoSaveTime] = useState<string | null>(null);

  // Feature 5: Configurable Age-vs-Class Settings Modal state
  const [ageSettingsOpen, setAgeSettingsOpen] = useState(false);

  // Local transient input for simulated Aadhaar availability check so full number is never stored in app state or logs
  const [transientAadhaarCheckInput, setTransientAadhaarCheckInput] = useState('');

  // Auto-save sanitized non-sensitive fields to IndexedDB while typing
  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        const draftKey = studentDraft.admissionNumber || 'DRAFT-CURRENT';
        const saved = await saveOfflineDraftToIdb(studentDraft, draftKey, currentStep);
        setIdbAutoSaveTime(saved.updatedAt);
        await refreshOfflineDrafts();
      } catch {
        // ignore if IndexedDB is unavailable
      }
    }, 450);
    return () => clearTimeout(timer);
  }, [studentDraft, currentStep, refreshOfflineDrafts]);

  // Helper to jump to a specific field card from the "Fix Before You Submit" Coach
  const handleTakeMeToField = (step: 1 | 2 | 3, fieldCardId: string) => {
    setCurrentStep(step);
    setHighlightedFieldId(fieldCardId);
    setTimeout(() => {
      const el = document.getElementById(fieldCardId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
    setTimeout(() => {
      setHighlightedFieldId((prev) => (prev === fieldCardId ? null : prev));
    }, 3200);
  };

  // Selected programme object for live over-intake check
  const selectedProgrammeObj = useMemo(() => {
    return (
      programmes.find(
        (p) =>
          p.programmeName === studentDraft.programmeName &&
          (p.institutionId === session.institutionId ||
            p.institutionName === session.institutionName)
      ) || programmes.find((p) => p.programmeName === studentDraft.programmeName) || programmes[0]
    );
  }, [programmes, studentDraft.programmeName, session.institutionId, session.institutionName]);

  // Save Draft Handler (Always available across all 4 steps)
  const handleSaveDraft = () => {
    const nowTime = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    setStudentDraft((prev) => ({
      ...prev,
      lastSavedAt: nowTime,
    }));
    addAuditLog({
      actor: session.userName,
      role: session.roleDisplayLabel || 'Teacher / Authorized Staff',
      action: 'DRAFT_SAVED',
      targetStudentId: studentDraft.admissionNumber || 'DRAFT',
      details: `Saved in-memory student registration draft at Step ${currentStep} (${
        studentDraft.studentNameSchool || 'Unnamed Student'
      }).`,
    });
    setDraftSavedBanner(
      `Draft saved in memory at ${nowTime} (Step ${currentStep} of 4). Sensitive numbers remain masked.`
    );
    addToast(`Draft saved at Step ${currentStep} of 4.`, 'info');
  };

  // Simulated Aadhaar Availability "Go" Handler (Step 1)
  const handleSimulatedAadhaarGo = () => {
    const cleaned = transientAadhaarCheckInput.replace(/\D/g, '');
    if (cleaned.length !== 12) {
      setStudentDraft((prev) => ({
        ...prev,
        aadhaarSimulatedResult: 'not_found',
      }));
      return;
    }
    const lastDigit = parseInt(cleaned.slice(-1), 10);
    const isFound = lastDigit % 2 === 0;
    // Never store or log the full number in the check; clear transient input immediately
    setTransientAadhaarCheckInput('');
    setStudentDraft((prev) => ({
      ...prev,
      aadhaarAvailabilityInput: `•••• •••• ${cleaned.slice(-4)}`,
      aadhaarSimulatedResult: isFound ? 'found' : 'not_found',
    }));
  };

  // Feature 1: Smart Name-Mismatch check between 4.1.1 and 4.1.8
  const smartNameResult = useMemo(() => {
    if (!studentDraft.studentNameSchool.trim() || !studentDraft.studentNameAadhaar.trim()) {
      return null;
    }
    return compareStudentNames(studentDraft.studentNameSchool, studentDraft.studentNameAadhaar);
  }, [studentDraft.studentNameSchool, studentDraft.studentNameAadhaar]);

  const hasNameMismatch = useMemo(() => {
    if (!smartNameResult) return false;
    return smartNameResult.verdict !== 'match';
  }, [smartNameResult]);

  // Feature 5: Age-vs-Class Check on 1 April of the academic year
  const ageVsClassEvaluation = useMemo(() => {
    if (!studentDraft.dob) return null;
    const startYearStr = (studentDraft.academicYear || CURRENT_ACADEMIC_YEAR).slice(0, 4);
    const startYear = parseInt(startYearStr, 10) || 2026;
    const aprilFirst = new Date(startYear, 3, 1); // 1 April of academic year
    const dobDate = new Date(studentDraft.dob);
    if (isNaN(dobDate.getTime())) return null;

    let ageYears = aprilFirst.getFullYear() - dobDate.getFullYear();
    const mDiff = aprilFirst.getMonth() - dobDate.getMonth();
    if (mDiff < 0 || (mDiff === 0 && aprilFirst.getDate() < dobDate.getDate())) {
      ageYears--;
    }

    const matchedRule =
      ageRangeRules.find(
        (r) =>
          r.matchKeyword !== 'DEFAULT' &&
          studentDraft.programmeName.toLowerCase().includes(r.matchKeyword.toLowerCase())
      ) ||
      ageRangeRules.find((r) => r.matchKeyword === 'DEFAULT') ||
      ageRangeRules[0];

    const isOutlier =
      ageYears < matchedRule.minAgeYears || ageYears > matchedRule.maxAgeYears;

    return {
      ageOnApril1: ageYears,
      aprilFirstLabel: `1 April ${startYear}`,
      rule: matchedRule,
      isOutlier,
    };
  }, [studentDraft.dob, studentDraft.academicYear, studentDraft.programmeName, ageRangeRules]);

  // Comprehensive Validation Engine for Step 4 & "Fix Before You Submit" Coach
  const validationFindings: ValidationFinding[] = useMemo(() => {
    const list: ValidationFinding[] = [];

    // Step 1 checks
    if (!studentDraft.hasExistingApaar) {
      list.push({
        id: 'VAL-101',
        severity: 'blocking',
        ruleCode: 'R-1.1',
        fieldLabel: '1.1 Existing APAAR ID Question',
        whatFailed: 'Selection for whether the student already has an APAAR ID is missing.',
        whyItMatters:
          'The portal cannot determine whether to validate an existing 12-digit identifier or initiate pre-requisite collection.',
        howToFix: 'Select either Yes or No in Field 1.1.',
        targetStep: 1,
        fieldCardId: 'field-card-1-1',
      });
    } else if (studentDraft.hasExistingApaar === 'yes') {
      const cleanedApaar = studentDraft.existingApaarId.replace(/\D/g, '');
      if (cleanedApaar.length !== 12) {
        list.push({
          id: 'VAL-102',
          severity: 'blocking',
          ruleCode: 'R-1.2',
          fieldLabel: '1.2 Existing APAAR ID Format',
          whatFailed: `Entered APAAR ID has ${cleanedApaar.length} digits instead of the required 12 digits.`,
          whyItMatters:
            'APAAR identifiers follow a strict 12-digit numeric schema; malformed entries fail simulated verification.',
          howToFix: 'Enter a 12-digit numeric fictional APAAR ID in Field 1.2.',
          targetStep: 1,
          fieldCardId: 'field-card-1-2',
        });
      }
    } else if (studentDraft.hasExistingApaar === 'no') {
      if (studentDraft.consentStatus !== 'obtained') {
        list.push({
          id: 'VAL-103',
          severity: 'warning',
          ruleCode: 'R-1.4',
          fieldLabel: '1.4 Parent / Guardian Consent Status',
          whatFailed: `Consent status is currently "${studentDraft.consentStatus.toUpperCase()}" for a student requiring new APAAR creation.`,
          whyItMatters:
            'New APAAR creation requires documented parent/guardian consent; record will be saved as "APAAR prerequisites pending".',
          howToFix:
            'Send a simulated parent consent link or update Consent Status in Field 1.4 to "Obtained".',
          targetStep: 1,
          fieldCardId: 'field-card-1-4',
        });
      }
    }

    // Step 2 checks (4.1.1 - 4.1.11)
    if (!studentDraft.studentNameSchool.trim()) {
      list.push({
        id: 'VAL-201',
        severity: 'blocking',
        ruleCode: '4.1.1',
        fieldLabel: "4.1.1 Student's Name (school record)",
        whatFailed: "Student's primary school record name is blank.",
        whyItMatters:
          'Every student record requires a legal primary name to anchor academic credits.',
        howToFix: "Enter the student's full name in Field 4.1.1.",
        targetStep: 2,
        fieldCardId: 'field-card-4-1-1',
      });
    }

    if (!studentDraft.gender) {
      list.push({
        id: 'VAL-202',
        severity: 'blocking',
        ruleCode: '4.1.2',
        fieldLabel: '4.1.2 Gender',
        whatFailed: 'Gender selection is missing.',
        whyItMatters: 'Mandatory demographic attribute for registry parity checks.',
        howToFix: 'Select Male, Female, or Other in Field 4.1.2.',
        targetStep: 2,
        fieldCardId: 'field-card-4-1-2',
      });
    }

    if (!studentDraft.dob) {
      list.push({
        id: 'VAL-203',
        severity: 'blocking',
        ruleCode: '4.1.3',
        fieldLabel: '4.1.3 Date of Birth',
        whatFailed: 'Date of Birth is not provided.',
        whyItMatters:
          'Date of Birth is required for age verification and chronological admission validation.',
        howToFix: 'Enter a valid Date of Birth in Field 4.1.3.',
        targetStep: 2,
        fieldCardId: 'field-card-4-1-3',
      });
    } else if (ageVsClassEvaluation && ageVsClassEvaluation.isOutlier) {
      list.push({
        id: 'VAL-AGE-OUTLIER',
        severity: 'warning',
        ruleCode: 'R-AGE',
        fieldLabel: '4.1.3 Age-vs-Class Check (As on 1 April)',
        whatFailed: `Calculated age on ${ageVsClassEvaluation.aprilFirstLabel} is ${ageVsClassEvaluation.ageOnApril1} years, which is outside the typical range (${ageVsClassEvaluation.rule.minAgeYears}–${ageVsClassEvaluation.rule.maxAgeYears} years) for ${ageVsClassEvaluation.rule.classOrProgrammeLabel}.`,
        whyItMatters:
          'Flags potential Date of Birth typing errors while allowing genuine accelerated/mature admissions.',
        howToFix:
          'Verify DOB against Class X / birth certificate or adjust class age range in Settings. This is a warning only and never blocks submission.',
        targetStep: 2,
        fieldCardId: 'field-card-4-1-3',
      });
    }

    if (
      !studentDraft.motherName.trim() &&
      !studentDraft.fatherName.trim() &&
      !studentDraft.guardianName.trim()
    ) {
      list.push({
        id: 'VAL-204',
        severity: 'blocking',
        ruleCode: '4.1.4',
        fieldLabel: '4.1.4 – 4.1.6 Parent / Guardian Names',
        whatFailed: "Neither Mother's Name, Father's Name, nor Guardian's Name has been provided.",
        whyItMatters:
          'At least one parent or legal guardian name is mandatory for student identity disambiguation and consent.',
        howToFix:
          "Populate Mother's Name (4.1.4), Father's Name (4.1.5), or Guardian's Name (4.1.6).",
        targetStep: 2,
        fieldCardId: 'field-card-4-1-4',
      });
    }

    if (studentDraft.aadhaarOptional.trim()) {
      const cleanedOpt = studentDraft.aadhaarOptional.replace(/\D/g, '');
      if (cleanedOpt.length !== 12) {
        list.push({
          id: 'VAL-205',
          severity: 'blocking',
          ruleCode: '4.1.7',
          fieldLabel: '4.1.7 Aadhaar Number of Student (Optional Demo)',
          whatFailed: `Optional demo Aadhaar number contains ${cleanedOpt.length} digits instead of 12.`,
          whyItMatters:
            'If provided, the synthetic Aadhaar number must conform to the 12-digit length standard.',
          howToFix: 'Enter a 12-digit fictional number or clear Field 4.1.7.',
          targetStep: 2,
          fieldCardId: 'field-card-4-1-7',
        });
      }
    }

    if (smartNameResult && smartNameResult.verdict !== 'match') {
      list.push({
        id: 'VAL-206',
        severity: 'warning',
        ruleCode: '4.1.8',
        fieldLabel: `4.1.8 Smart Name-Mismatch (${smartNameResult.chipLabel})`,
        whatFailed: `${smartNameResult.differences.map((d) => d.part).join('; ')}.`,
        whyItMatters:
          'Token or spelling differences between school records and identity cards cause demographic mismatch flags during APAAR seeding.',
        howToFix: smartNameResult.suggestedNextStep,
        targetStep: 2,
        fieldCardId: 'field-card-4-1-8',
      });
    }

    const parsedAdmission = parseDdMmYyyy(studentDraft.admissionDate);
    if (!parsedAdmission) {
      list.push({
        id: 'VAL-207',
        severity: 'blocking',
        ruleCode: '4.1.9',
        fieldLabel: '4.1.9 Admission Date (DD/MM/YYYY)',
        whatFailed: `Admission Date "${studentDraft.admissionDate}" is not a valid DD/MM/YYYY calendar date.`,
        whyItMatters: 'Institutional registries require strict DD/MM/YYYY date formatting.',
        howToFix: 'Enter Admission Date as DD/MM/YYYY (e.g. 14/08/2026) in Field 4.1.9.',
        targetStep: 2,
        fieldCardId: 'field-card-4-1-9',
      });
    } else if (studentDraft.dob) {
      const dobDate = new Date(studentDraft.dob);
      if (parsedAdmission <= dobDate) {
        list.push({
          id: 'VAL-208',
          severity: 'blocking',
          ruleCode: '4.1.9',
          fieldLabel: '4.1.9 Admission Date Chronology Check',
          whatFailed: `Admission Date (${studentDraft.admissionDate}) is on or before Date of Birth (${studentDraft.dob}).`,
          whyItMatters: 'A student cannot be admitted on or prior to their birth date.',
          howToFix:
            'Ensure Admission Date (4.1.9) is chronologically after Date of Birth (4.1.3).',
          targetStep: 2,
          fieldCardId: 'field-card-4-1-9',
        });
      }
    }

    const cleanedMobile = studentDraft.mobileNumber.replace(/\D/g, '');
    if (cleanedMobile.length !== 10) {
      list.push({
        id: 'VAL-209',
        severity: 'blocking',
        ruleCode: '4.1.10',
        fieldLabel: '4.1.10 Mobile Number (10 digits)',
        whatFailed: `Mobile Number has ${cleanedMobile.length} digits instead of the required 10 digits.`,
        whyItMatters:
          'A valid 10-digit primary mobile number is mandatory for student communication.',
        howToFix: 'Enter a 10-digit mobile number in Field 4.1.10.',
        targetStep: 2,
        fieldCardId: 'field-card-4-1-10',
      });
    }

    if (!studentDraft.isCwsn) {
      list.push({
        id: 'VAL-210',
        severity: 'blocking',
        ruleCode: '4.1.11',
        fieldLabel: '4.1.11 Whether CWSN?',
        whatFailed: 'CWSN radio selection (Yes / No) is missing.',
        whyItMatters: 'Required for statutory inclusion reporting.',
        howToFix: 'Select Yes or No for Field 4.1.11.',
        targetStep: 2,
        fieldCardId: 'field-card-4-1-11',
      });
    } else if (studentDraft.isCwsn === 'yes') {
      if (!studentDraft.cwsnDisabilityCategory) {
        list.push({
          id: 'VAL-211',
          severity: 'blocking',
          ruleCode: '4.1.11',
          fieldLabel: '4.1.11a CWSN Disability Category',
          whatFailed: 'When CWSN is Yes, selecting a standard Disability Category is required.',
          whyItMatters: 'Required to plan appropriate classroom accommodations and statutory CWSN reporting.',
          howToFix: 'Choose the student Disability Category in Field 4.1.11.',
          targetStep: 2,
          fieldCardId: 'field-card-4-1-11',
        });
      }
      if (!studentDraft.cwsnCertificateStatus) {
        list.push({
          id: 'VAL-212',
          severity: 'blocking',
          ruleCode: '4.1.11',
          fieldLabel: '4.1.11b CWSN Certificate Availability Status',
          whatFailed: 'Certificate availability status is required when CWSN is Yes.',
          whyItMatters: 'Records certificate availability status only (no document files are uploaded or stored).',
          howToFix: 'Select Certificate Availability Status in Field 4.1.11.',
          targetStep: 2,
          fieldCardId: 'field-card-4-1-11',
        });
      }
      if ((studentDraft.cwsnSupportNeeded || []).length === 0) {
        list.push({
          id: 'VAL-213',
          severity: 'blocking',
          ruleCode: '4.1.11',
          fieldLabel: '4.1.11c CWSN Support Needed',
          whatFailed: 'At least one Support Needed checkbox must be selected when CWSN is Yes.',
          whyItMatters: 'Ensures assistive devices, ramps, or special educator support are arranged.',
          howToFix: 'Check at least one Support Needed option in Field 4.1.11.',
          targetStep: 2,
          fieldCardId: 'field-card-4-1-11',
        });
      }
    }

    // Step 3 checks
    if (!studentDraft.admissionNumber.trim()) {
      list.push({
        id: 'VAL-301',
        severity: 'blocking',
        ruleCode: 'R-3.3',
        fieldLabel: '3.3 Admission Number',
        whatFailed: 'Institutional Admission Number is empty.',
        whyItMatters: 'Required to uniquely index the student in the college roster.',
        howToFix: 'Enter a valid Admission Number in Field 3.3.',
        targetStep: 3,
        fieldCardId: 'field-card-3-3',
      });
    }

    if (
      selectedProgrammeObj &&
      selectedProgrammeObj.actualEnrolment + 1 > selectedProgrammeObj.approvedIntake
    ) {
      list.push({
        id: 'VAL-302',
        severity: 'warning',
        ruleCode: 'R-3.1',
        fieldLabel: '3.1 Sanctioned Intake Ceiling Warning',
        whatFailed: `Saving this student increases ${selectedProgrammeObj.programmeName} enrolment to ${
          selectedProgrammeObj.actualEnrolment + 1
        }, exceeding approved intake (${selectedProgrammeObj.approvedIntake}).`,
        whyItMatters:
          'Exceeding AICTE sanctioned intake triggers a governance alert on the College and AICTE dashboards.',
        howToFix:
          'Confirm whether this student is admitted under a supernumerary quota (EWS/TFW) or verify branch seat availability.',
        targetStep: 3,
        fieldCardId: 'field-card-3-1',
      });
    }

    // Informational confirmation
    list.push({
      id: 'VAL-INFO-01',
      severity: 'info',
      ruleCode: 'R-1.3',
      fieldLabel: 'IndexedDB Offline Draft & Privacy Guardrail',
      whatFailed:
        'Non-sensitive fields are backed up locally in IndexedDB; PEN, APAAR, and Aadhaar numbers are never stored on device.',
      whyItMatters:
        'Protects your work against lost connections while enforcing strict identifier privacy.',
      howToFix: 'No action needed — automatic masking and local draft backup are active.',
      targetStep: 1,
      fieldCardId: 'field-card-1-3',
    });

    return list;
  }, [studentDraft, smartNameResult, ageVsClassEvaluation, selectedProgrammeObj]);

  const blockingErrors = validationFindings.filter((f) => f.severity === 'blocking');
  const warnings = validationFindings.filter((f) => f.severity === 'warning');
  const infos = validationFindings.filter((f) => f.severity === 'info');

  const step1Blocking = blockingErrors.filter((f) => f.targetStep === 1);
  const step2Blocking = blockingErrors.filter((f) => f.targetStep === 2);
  const step3Blocking = blockingErrors.filter((f) => f.targetStep === 3);

  // Progress score (0 to 100) for the "Fix Before You Submit" Coach progress ring
  const coachProgressPercent = useMemo(() => {
    const totalChecks = 8;
    const passed = Math.max(0, totalChecks - blockingErrors.length);
    const base = Math.round((passed / totalChecks) * 90);
    const bonus = warnings.length === 0 ? 10 : Math.max(0, 10 - warnings.length * 3);
    return Math.min(100, base + bonus);
  }, [blockingErrors.length, warnings.length]);

  // APAAR Readiness Determination for Step 4
  const isInformationComplete = blockingErrors.length === 0;
  const apaarReadinessBanner = useMemo(() => {
    if (!isInformationComplete) {
      return {
        completeness: 'Information Incomplete',
        statusText: 'Resolve blocking errors before saving student record',
        tone: 'red' as const,
      };
    }
    if (studentDraft.hasExistingApaar === 'yes') {
      return {
        completeness: 'Information Complete',
        statusText: 'Recorded - Pending Official Verification',
        tone: 'teal' as const,
      };
    }
    if (studentDraft.consentStatus === 'obtained') {
      return {
        completeness: 'Information Complete',
        statusText: 'Ready for APAAR creation - simulated',
        tone: 'teal' as const,
      };
    }
    return {
      completeness: 'Information Complete (Consent Pending)',
      statusText: 'APAAR prerequisites pending — Parent/Guardian consent required for creation',
      tone: 'amber' as const,
    };
  }, [isInformationComplete, studentDraft.hasExistingApaar, studentDraft.consentStatus]);

  // Final Submit Handler (Step 4)
  const handleFinalSaveStudent = () => {
    if (blockingErrors.length > 0) return;

    const generatedPen = String(29481060000 + Math.floor(Math.random() * 89999)).slice(0, 11);
    const cleanedExistingApaar =
      studentDraft.hasExistingApaar === 'yes'
        ? studentDraft.existingApaarId.replace(/\D/g, '')
        : null;

    let verificationStatus: VerificationStatus = 'Pending Official Verification';
    let aiNote = 'Added via 4-Step Portal Form — Recorded - Pending Official Verification.';
    let score = 94;

    if (hasNameMismatch) {
      verificationStatus = 'Mismatch Flagged';
      aiNote = `Name variance flagged between 4.1.1 School Record ("${studentDraft.studentNameSchool}") and 4.1.8 Aadhaar Card ("${studentDraft.studentNameAadhaar}").`;
      score = 72;
    } else if (studentDraft.hasExistingApaar === 'no') {
      verificationStatus =
        studentDraft.consentStatus === 'obtained'
          ? 'Pending Official Verification'
          : 'Missing APAAR ID';
      aiNote =
        studentDraft.consentStatus === 'obtained'
          ? 'Ready for APAAR creation - simulated (Parent/Guardian consent obtained).'
          : 'APAAR prerequisites pending (Consent status: ' + studentDraft.consentStatus + ').';
      score = studentDraft.consentStatus === 'obtained' ? 91 : 78;
    }

    const isJrCollegeClass =
      activeWorkspace === 'school' &&
      (studentDraft.className?.includes('11') ||
        studentDraft.className?.includes('12') ||
        studentDraft.programmeName.includes('11') ||
        studentDraft.programmeName.includes('12'));

    const created = addStudentRecord(
      {
        rollNo: studentDraft.admissionNumber.trim(),
        fullName: studentDraft.studentNameSchool.trim(),
        dob: studentDraft.dob,
        gender: (studentDraft.gender || 'F') as 'F' | 'M' | 'O',
        pen: generatedPen,
        apaarId: cleanedExistingApaar,
        institutionId: selectedProgrammeObj?.institutionId || session.institutionId,
        institutionName: selectedProgrammeObj?.institutionName || session.institutionName,
        institutionType:
          activeWorkspace === 'school'
            ? isJrCollegeClass
              ? 'Junior College'
              : 'School'
            : 'College',
        state: selectedProgrammeObj?.state || session.state,
        programme:
          activeWorkspace === 'school'
            ? studentDraft.className || studentDraft.programmeName
            : studentDraft.programmeName,
        className:
          activeWorkspace === 'school'
            ? studentDraft.className || studentDraft.programmeName
            : undefined,
        medium:
          activeWorkspace === 'school' ? studentDraft.medium || 'English' : undefined,
        midDayMealEligible:
          activeWorkspace === 'school'
            ? studentDraft.midDayMealEligible || 'Yes'
            : undefined,
        academicYear: studentDraft.academicYear,
        semester: activeWorkspace === 'school' ? 1 : studentDraft.semester || 1,
        section: studentDraft.section,
        verificationStatus,
        dataQualityScore: score,
        aiIssueNote: aiNote,
        reviewedStatus: 'Unreviewed',
        cwsnDetails: {
          isCwsn: studentDraft.isCwsn === 'yes',
          disabilityCategory:
            studentDraft.isCwsn === 'yes' ? studentDraft.cwsnDisabilityCategory : undefined,
          certificateStatus:
            studentDraft.isCwsn === 'yes' && studentDraft.cwsnCertificateStatus
              ? studentDraft.cwsnCertificateStatus
              : undefined,
          supportNeeded:
            studentDraft.isCwsn === 'yes' ? studentDraft.cwsnSupportNeeded || [] : [],
          accommodationNote:
            studentDraft.isCwsn === 'yes'
              ? (studentDraft.cwsnAccommodationNote || '').trim()
              : undefined,
        },
      },
      `Saved new student "${studentDraft.studentNameSchool.trim()}" (${
        studentDraft.admissionNumber
      }) in ${
        activeWorkspace === 'school'
          ? studentDraft.className || studentDraft.programmeName
          : studentDraft.programmeName
      } (${studentDraft.section}, ${
        studentDraft.academicYear
      }). Readiness: ${apaarReadinessBanner.statusText}.`
    );

    addToast(
      `Saved new student "${studentDraft.studentNameSchool.trim()}" (${studentDraft.admissionNumber}) and wrote audit log.`,
      hasNameMismatch ? 'warning' : 'success'
    );
    resetStudentDraft();
    navigate(
      activeWorkspace === 'school' ? '/teacher/school/students' : '/teacher/college/students',
      { state: { newlyAddedStudentId: created.id } }
    );
  };

  return (
    <div className="space-y-5">
      {/* Top Info Bar (Light Blue) with Class, Section, Academic Year, Back button, and Save Draft */}
      <div className="bg-sky-50 border border-sky-200 rounded-lg px-5 py-3.5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <button
            type="button"
            onClick={() => navigate('/teacher')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white border border-sky-300 text-[#0B1F3A] font-semibold hover:bg-sky-100 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Student Roster</span>
          </button>

          <div className="flex flex-wrap items-center gap-2 text-slate-700 font-medium">
            <span>
              <strong className="text-[#0B1F3A]">Class / Programme:</strong>{' '}
              {studentDraft.programmeName}
            </span>
            <span aria-hidden="true">·</span>
            <span>
              <strong className="text-[#0B1F3A]">Section:</strong> {studentDraft.section}
            </span>
            <span aria-hidden="true">·</span>
            <span>
              <strong className="text-[#0B1F3A]">Academic Year:</strong>{' '}
              <span className="font-mono">{studentDraft.academicYear}</span>
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {idbAutoSaveTime && (
            <span
              className="text-[11px] font-mono text-indigo-800 bg-white border border-indigo-200 px-2.5 py-1 rounded inline-flex items-center gap-1"
              title="Non-sensitive fields saved to browser IndexedDB. Full Aadhaar/APAAR/PEN are never stored locally."
            >
              <Database className="w-3 h-3 text-indigo-600 shrink-0" />
              <span>IndexedDB draft: {idbAutoSaveTime} (Non-sensitive only)</span>
            </span>
          )}
          <button
            type="button"
            onClick={() => setAgeSettingsOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white border border-sky-300 text-xs font-semibold text-slate-700 hover:bg-sky-100 transition-colors"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-600" />
            <span>Age-vs-Class Settings</span>
          </button>
          <button
            type="button"
            onClick={handleSaveDraft}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-white border border-sky-300 text-xs font-semibold text-sky-950 hover:bg-sky-100 transition-colors"
          >
            <Save className="w-3.5 h-3.5 text-sky-700" />
            <span>Save Draft</span>
          </button>
        </div>
      </div>

      {/* Configurable Age-vs-Class Settings Modal */}
      {ageSettingsOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Configure Age-vs-Class Validation Ranges"
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-[1px] flex items-center justify-center p-4"
        >
          <div className="bg-white border border-slate-200 rounded-lg shadow-xl max-w-xl w-full p-5 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h2 className="font-display font-bold text-base text-[#0B1F3A]">
                  Age-vs-Class Validation Settings (As on 1 April)
                </h2>
                <p className="text-slate-500 mt-0.5">
                  Configure typical age ranges. Outliers are flagged strictly as a warning for
                  review — never a block or rejection.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAgeSettingsOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
                aria-label="Close settings"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {ageRangeRules.map((rule) => (
                <div
                  key={rule.id}
                  className="p-3 rounded-md border border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="font-semibold text-slate-900">
                      {rule.classOrProgrammeLabel}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      Rule ID: {rule.id} · Keyword: {rule.matchKeyword}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <label className="text-[11px] text-slate-600">
                      Min:
                      <input
                        type="number"
                        min={3}
                        max={40}
                        value={rule.minAgeYears}
                        onChange={(e) =>
                          updateAgeRangeRule(
                            rule.id,
                            parseInt(e.target.value, 10) || 15,
                            rule.maxAgeYears
                          )
                        }
                        className="ml-1 w-14 rounded border border-slate-300 bg-white px-2 py-1 font-mono text-xs"
                      />
                    </label>
                    <label className="text-[11px] text-slate-600">
                      Max:
                      <input
                        type="number"
                        min={4}
                        max={60}
                        value={rule.maxAgeYears}
                        onChange={(e) =>
                          updateAgeRangeRule(
                            rule.id,
                            rule.minAgeYears,
                            parseInt(e.target.value, 10) || 25
                          )
                        }
                        className="ml-1 w-14 rounded border border-slate-300 bg-white px-2 py-1 font-mono text-xs"
                      />
                    </label>
                    <span className="text-[11px] text-slate-500">yrs</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={resetAgeRangeRules}
                className="px-3 py-1.5 rounded border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold"
              >
                Reset to Defaults
              </button>
              <button
                type="button"
                onClick={() => setAgeSettingsOpen(false)}
                className="px-4 py-1.5 rounded bg-[#0B1F3A] text-white font-semibold hover:bg-slate-800"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {draftSavedBanner && (
        <div className="bg-teal-50 border border-teal-200 rounded-md px-4 py-2.5 text-xs text-teal-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-teal-700 shrink-0" />
            <span>{draftSavedBanner}</span>
          </div>
          <button
            type="button"
            onClick={() => setDraftSavedBanner(null)}
            className="text-xs font-semibold underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 4-Step Indicator Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-100">
          <div>
            <div className="text-xs font-semibold text-teal-700">
              New Student Registration &amp; APAAR Readiness Form · Demo Data
            </div>
            <h1 className="font-display text-xl font-bold text-[#0B1F3A]">
              Step {currentStep} of 4:{' '}
              {currentStep === 1
                ? 'Identity & APAAR Pre-Check'
                : currentStep === 2
                ? 'General Profile (Section 4.1.1 – 4.1.11)'
                : currentStep === 3
                ? 'Admission & Academic Details'
                : 'Review, Validation & Submit'}
            </h1>
          </div>
          <div className="text-xs text-slate-500">
            Click any <span className="font-mono text-indigo-700">[Refer Rule: x]</span> link for
            validation guidance
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
          {[
            { num: 1 as const, title: 'Step 1: Identity Check' },
            { num: 2 as const, title: 'Step 2: General Profile' },
            { num: 3 as const, title: 'Step 3: Admission Details' },
            { num: 4 as const, title: 'Step 4: Review & Submit' },
          ].map((st) => {
            const isActive = currentStep === st.num;
            const isPast = currentStep > st.num;
            return (
              <button
                key={st.num}
                type="button"
                onClick={() => setCurrentStep(st.num)}
                className={`text-left p-2.5 rounded-md border transition-colors ${
                  isActive
                    ? 'border-[#0B1F3A] bg-[#0B1F3A] text-white'
                    : isPast
                    ? 'border-teal-200 bg-teal-50/60 text-teal-900 hover:bg-teal-50'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div className="text-xs font-semibold truncate">{st.title}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main 2-Column Layout: Left = Active Step Form (8 cols), Right = "Fix Before You Submit" Coach Side Panel (4 cols) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        <div className="xl:col-span-8 space-y-5 min-w-0">
          {/* =====================================================================
              STEP 1: IDENTITY CHECK (2-Column Grid of White Field Cards)
             ===================================================================== */}
          {currentStep === 1 && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Card 1.1: Does the student already have an APAAR ID? */}
                <div
                  id="field-card-1-1"
                  className={`bg-white border rounded-lg p-5 transition-all ${
                    highlightedFieldId === 'field-card-1-1'
                      ? 'border-indigo-600 ring-4 ring-indigo-200'
                      : 'border-slate-200'
                  }`}
                >
                  <FieldCardHeader
                    fieldNumber="1.1"
                    label="Does the student already have an APAAR ID?"
                    ruleCode="R-1.1"
                    required
                    activeRule={activeRule}
                    setActiveRule={setActiveRule}
                  />

                  <div className="flex items-center gap-6 mt-3">
                    <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-800 cursor-pointer">
                      <input
                        type="radio"
                        name="hasExistingApaar"
                        checked={studentDraft.hasExistingApaar === 'yes'}
                        onChange={() =>
                          setStudentDraft((prev) => ({
                            ...prev,
                            hasExistingApaar: 'yes',
                            consentStatus: 'not_required',
                          }))
                        }
                        className="text-[#0B1F3A]"
                      />
                      <span>Yes</span>
                    </label>

                    <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-800 cursor-pointer">
                      <input
                        type="radio"
                        name="hasExistingApaar"
                        checked={studentDraft.hasExistingApaar === 'no'}
                        onChange={() =>
                          setStudentDraft((prev) => ({
                            ...prev,
                            hasExistingApaar: 'no',
                            existingApaarId: '',
                            consentStatus:
                              prev.consentStatus === 'not_required'
                                ? 'pending'
                                : prev.consentStatus,
                          }))
                        }
                        className="text-[#0B1F3A]"
                      />
                      <span>No</span>
                    </label>
                  </div>

                  {studentDraft.hasExistingApaar === 'no' && (
                    <div className="mt-4 p-3.5 rounded-md bg-amber-50 border border-amber-200 text-xs text-amber-950 space-y-1">
                      <div className="font-semibold text-amber-900 flex items-center gap-1.5">
                        <Info className="w-4 h-4 text-amber-700 shrink-0" />
                        <span>Status: APAAR prerequisites pending</span>
                      </div>
                      <p>
                        This student will need APAAR creation. Please collect the details in the
                        next steps.
                      </p>
                    </div>
                  )}
                </div>

                {/* Card 1.2: Existing APAAR ID Input OR Prerequisite Status Card */}
                <div
                  id="field-card-1-2"
                  className={`bg-white border rounded-lg p-5 transition-all ${
                    highlightedFieldId === 'field-card-1-2'
                      ? 'border-indigo-600 ring-4 ring-indigo-200'
                      : 'border-slate-200'
                  }`}
                >
                  <FieldCardHeader
                    fieldNumber="1.2"
                    label="Existing 12-Digit APAAR ID (Format Check Only)"
                    ruleCode="R-1.2"
                    required={studentDraft.hasExistingApaar === 'yes'}
                    activeRule={activeRule}
                    setActiveRule={setActiveRule}
                  />

                  {studentDraft.hasExistingApaar === 'yes' ? (
                    <div className="space-y-2.5">
                      <input
                        type="text"
                        maxLength={14}
                        value={studentDraft.existingApaarId}
                        onChange={(e) =>
                          setStudentDraft((prev) => ({
                            ...prev,
                            existingApaarId: e.target.value,
                          }))
                        }
                        placeholder="Enter 12-digit fictional APAAR ID (e.g. 482910384756)"
                        className="w-full rounded-md border border-slate-300 px-3.5 py-2 text-sm font-mono text-slate-900 focus:border-[#0B1F3A] focus:outline-none"
                      />
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-teal-700 font-semibold">
                          Status: Recorded - Pending Official Verification
                        </span>
                        <span className="font-mono text-slate-500">
                          {studentDraft.existingApaarId.replace(/\D/g, '').length}/12 digits
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-md bg-slate-50 border border-slate-200 text-xs text-slate-600">
                      {studentDraft.hasExistingApaar === 'no'
                        ? 'Not applicable — Student marked as "APAAR prerequisites pending" for new simulated creation.'
                        : 'Select "Yes" in Field 1.1 if the student already holds an APAAR ID.'}
                    </div>
                  )}
                </div>

                {/* Card 1.3: Check AADHAAR Number Availability (Simulated) */}
                <div
                  id="field-card-1-3"
                  className={`bg-white border rounded-lg p-5 transition-all ${
                    highlightedFieldId === 'field-card-1-3'
                      ? 'border-indigo-600 ring-4 ring-indigo-200'
                      : 'border-slate-200'
                  }`}
                >
              <FieldCardHeader
                fieldNumber="1.3"
                label="Check AADHAAR Number Availability (Simulated)"
                ruleCode="R-1.3"
                activeRule={activeRule}
                setActiveRule={setActiveRule}
              />

              <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer mb-3">
                <input
                  type="checkbox"
                  checked={studentDraft.checkAadhaarAvailability}
                  onChange={(e) =>
                    setStudentDraft((prev) => ({
                      ...prev,
                      checkAadhaarAvailability: e.target.checked,
                    }))
                  }
                  className="rounded text-[#0B1F3A]"
                />
                <span>Check AADHAAR Number Availability</span>
              </label>

              {studentDraft.checkAadhaarAvailability && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      maxLength={12}
                      value={transientAadhaarCheckInput}
                      onChange={(e) =>
                        setTransientAadhaarCheckInput(e.target.value.replace(/\D/g, ''))
                      }
                      placeholder="Enter 12-digit fictional number (never stored)"
                      className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-xs font-mono text-slate-900 focus:border-[#0B1F3A] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleSimulatedAadhaarGo}
                      className="px-4 py-2 rounded-md bg-[#0B1F3A] text-white text-xs font-semibold hover:bg-slate-800 transition-colors shrink-0"
                    >
                      Go
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-500">
                    Use fictional demo numbers only. Full number is cleared immediately on click and
                    never stored or logged.
                  </p>

                  {studentDraft.aadhaarSimulatedResult !== 'idle' && (
                    <div
                      className={`p-3 rounded-md border text-xs font-medium flex items-center justify-between ${
                        studentDraft.aadhaarSimulatedResult === 'found'
                          ? 'bg-teal-50 border-teal-200 text-teal-900'
                          : 'bg-amber-50 border-amber-200 text-amber-900'
                      }`}
                    >
                      <span>
                        {studentDraft.aadhaarSimulatedResult === 'found'
                          ? 'Aadhaar-linked record found (simulated)'
                          : 'Aadhaar-linked record not found (simulated)'}
                      </span>
                      {studentDraft.aadhaarAvailabilityInput && (
                        <span className="font-mono text-[11px]">
                          Checked: {studentDraft.aadhaarAvailabilityInput}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

                {/* Card 1.4: Parent / Guardian Consent Status + Simulated Parent Consent Link */}
                <div
                  id="field-card-1-4"
                  className={`bg-white border rounded-lg p-5 transition-all ${
                    highlightedFieldId === 'field-card-1-4'
                      ? 'border-indigo-600 ring-4 ring-indigo-200'
                      : 'border-slate-200'
                  }`}
                >
                  <FieldCardHeader
                    fieldNumber="1.4"
                    label="Parent / Guardian Consent Status"
                    ruleCode="R-1.4"
                    required
                    activeRule={activeRule}
                    setActiveRule={setActiveRule}
                  />

                  <select
                    value={studentDraft.consentStatus}
                    onChange={(e) =>
                      setStudentDraft((prev) => ({
                        ...prev,
                        consentStatus: e.target.value as typeof prev.consentStatus,
                      }))
                    }
                    className="w-full rounded-md border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-[#0B1F3A] focus:outline-none"
                  >
                    <option value="not_required">Not Required (Existing APAAR ID Recorded)</option>
                    <option value="pending">Pending Parent / Guardian Signature</option>
                    <option value="obtained">Obtained (Signed Consent Form Archived)</option>
                    <option value="declined">Declined by Parent / Guardian</option>
                  </select>

                  <p className="text-xs text-slate-600 mt-2.5 leading-relaxed">
                    <strong>Mandatory Note:</strong> APAAR creation requires the parent or
                    guardian&apos;s explicit consent before initiating simulated identity seeding.
                  </p>

                  {/* Feature 2: Send Consent Request to Parent/Guardian when student has no APAAR ID */}
                  {studentDraft.hasExistingApaar === 'no' && (
                    <div className="mt-4 pt-3.5 border-t border-slate-200 space-y-3">
                      <div className="text-xs font-semibold text-[#0B1F3A]">
                        Send Consent Request to Parent / Guardian (Simulated Link)
                      </div>
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                        <input
                          type="tel"
                          maxLength={10}
                          value={consentMobileInput}
                          onChange={(e) => {
                            const clean = e.target.value.replace(/\D/g, '');
                            setConsentMobileInput(clean);
                            setStudentDraft((prev) => ({ ...prev, mobileNumber: clean }));
                          }}
                          placeholder="10-digit parent mobile (demo)"
                          className="flex-1 rounded-md border border-slate-300 px-3 py-1.5 text-xs font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const rec = createSimulatedConsentRequest({
                              studentId: 'DRAFT',
                              fullName: studentDraft.studentNameSchool || 'Pranav Kulkarni',
                              classOrProgramme: studentDraft.programmeName,
                              mobileNumber: consentMobileInput || '9848012345',
                            });
                            setGeneratedConsentToken(rec);
                          }}
                          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors shrink-0"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Send consent request to parent/guardian</span>
                        </button>
                      </div>

                      {generatedConsentToken && (
                        <div className="p-3.5 rounded-md bg-indigo-50/90 border border-indigo-200 text-xs space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold text-indigo-950">
                              Demo SMS / WhatsApp Message Preview
                            </span>
                            <span className="px-2 py-0.5 rounded bg-amber-100 border border-amber-300 text-amber-900 font-semibold text-[10px]">
                              Simulated, no message is actually sent
                            </span>
                          </div>
                          <div className="p-2.5 rounded bg-white border border-indigo-100 font-mono text-[11px] text-slate-800 leading-relaxed">
                            [APAAR Ready Demo] Dear Parent/Guardian, please review and submit your
                            consent for {generatedConsentToken.studentFirstName} (
                            {generatedConsentToken.classOrProgramme}) at:{' '}
                            <span className="text-indigo-700 underline">
                              /consent/{generatedConsentToken.token}
                            </span>{' '}
                            (Valid 7 days, single-use only).
                          </div>
                          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                            <Link
                              to={`/consent/${generatedConsentToken.token}`}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#0B1F3A] text-white text-[11px] font-semibold hover:bg-slate-800"
                            >
                              <span>Open Public Consent Page (/consent/{generatedConsentToken.token})</span>
                              <ExternalLink className="w-3 h-3" />
                            </Link>
                            <button
                              type="button"
                              onClick={() => {
                                const expRec = createSimulatedConsentRequest({
                                  studentId: 'DRAFT',
                                  fullName: studentDraft.studentNameSchool || 'Pranav Kulkarni',
                                  classOrProgramme: studentDraft.programmeName,
                                  mobileNumber: consentMobileInput || '9848012345',
                                  forceExpiredDemo: true,
                                });
                                setGeneratedConsentToken(expRec);
                              }}
                              className="text-[11px] text-indigo-700 hover:underline font-medium"
                            >
                              Test Expired 7-Day Link
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 space-y-2">
                {step1Blocking.length > 0 && (
                  <p role="status" className="text-[11px] font-medium text-amber-800 text-right">
                    Missing on Step 1: {step1Blocking[0].whatFailed}
                  </p>
                )}
                <div className="flex items-center justify-between gap-3">
                  <button
                    type="button"
                    disabled
                    aria-disabled="true"
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[42px] rounded-md border border-slate-300 bg-white text-slate-400 text-xs font-semibold opacity-50 cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B1F3A]"
                  >
                    <ArrowLeft className="w-4 h-4 shrink-0" />
                    <span>Back</span>
                  </button>

                  <button
                    type="button"
                    disabled={step1Blocking.length > 0}
                    onClick={() => setCurrentStep(2)}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 min-h-[42px] rounded-md bg-[#0B1F3A] text-white text-xs font-semibold hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
                  >
                    <span>Next: Step 2 (General Profile)</span>
                    <ArrowRight className="w-4 h-4 shrink-0" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* =====================================================================
              STEP 2: GENERAL PROFILE (Fields 4.1.1 to 4.1.11 in 2-Column White Cards)
             ===================================================================== */}
          {currentStep === 2 && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 4.1.1 Student's Name (as per school record) */}
                <div
                  id="field-card-4-1-1"
                  className={`bg-white border rounded-lg p-5 transition-all ${
                    highlightedFieldId === 'field-card-4-1-1'
                      ? 'border-indigo-600 ring-4 ring-indigo-200'
                      : 'border-slate-200'
                  }`}
                >
                  <FieldCardHeader
                    fieldNumber="4.1.1"
                    label="Student's Name (as per school record)"
                    ruleCode="4.1.1"
                    required
                    activeRule={activeRule}
                    setActiveRule={setActiveRule}
                  />
                  <input
                    type="text"
                    value={studentDraft.studentNameSchool}
                    onChange={(e) =>
                      setStudentDraft((prev) => ({
                        ...prev,
                        studentNameSchool: e.target.value,
                      }))
                    }
                    placeholder="e.g. Pranav Kulkarni"
                    className="w-full rounded-md border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-[#0B1F3A] focus:outline-none"
                  />
                </div>

                {/* 4.1.2 Gender */}
                <div
                  id="field-card-4-1-2"
                  className={`bg-white border rounded-lg p-5 transition-all ${
                    highlightedFieldId === 'field-card-4-1-2'
                      ? 'border-indigo-600 ring-4 ring-indigo-200'
                      : 'border-slate-200'
                  }`}
                >
                  <FieldCardHeader
                    fieldNumber="4.1.2"
                    label="Gender"
                    ruleCode="4.1.2"
                    required
                    activeRule={activeRule}
                    setActiveRule={setActiveRule}
                  />
                  <select
                    value={studentDraft.gender}
                    onChange={(e) =>
                      setStudentDraft((prev) => ({
                        ...prev,
                        gender: e.target.value as 'F' | 'M' | 'O' | '',
                      }))
                    }
                    className="w-full rounded-md border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-[#0B1F3A] focus:outline-none"
                  >
                    <option value="">-- Select Gender --</option>
                    <option value="F">Female (F)</option>
                    <option value="M">Male (M)</option>
                    <option value="O">Other / Transgender (O)</option>
                  </select>
                </div>

                {/* 4.1.3 Date of Birth + Feature 5 Age-vs-Class Check */}
                <div
                  id="field-card-4-1-3"
                  className={`bg-white border rounded-lg p-5 transition-all ${
                    highlightedFieldId === 'field-card-4-1-3'
                      ? 'border-indigo-600 ring-4 ring-indigo-200'
                      : 'border-slate-200'
                  }`}
                >
                  <FieldCardHeader
                    fieldNumber="4.1.3"
                    label="Date of Birth"
                    ruleCode="4.1.3"
                    required
                    activeRule={activeRule}
                    setActiveRule={setActiveRule}
                  />
                  <input
                    type="date"
                    value={studentDraft.dob}
                    onChange={(e) =>
                      setStudentDraft((prev) => ({
                        ...prev,
                        dob: e.target.value,
                      }))
                    }
                    className="w-full rounded-md border border-slate-300 px-3.5 py-2 text-sm font-mono text-slate-900 focus:border-[#0B1F3A] focus:outline-none"
                  />

                  {ageVsClassEvaluation && (
                    <div
                      className={`mt-2.5 p-2.5 rounded border text-xs space-y-1 ${
                        ageVsClassEvaluation.isOutlier
                          ? 'bg-amber-50 border-amber-200 text-amber-950'
                          : 'bg-teal-50/70 border-teal-200 text-teal-900'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 font-semibold">
                        <span>
                          Age on {ageVsClassEvaluation.aprilFirstLabel}:{' '}
                          <strong className="font-mono">
                            {ageVsClassEvaluation.ageOnApril1} years
                          </strong>
                        </span>
                        <button
                          type="button"
                          onClick={() => setAgeSettingsOpen(true)}
                          className="text-[11px] underline text-indigo-700"
                        >
                          Configure Range ({ageVsClassEvaluation.rule.minAgeYears}–
                          {ageVsClassEvaluation.rule.maxAgeYears} yrs)
                        </button>
                      </div>
                      {ageVsClassEvaluation.isOutlier && (
                        <p className="text-[11px] leading-snug">
                          <strong>Age-vs-Class Warning (Never blocks submission):</strong> Age is
                          outside the typical {ageVsClassEvaluation.rule.minAgeYears}–
                          {ageVsClassEvaluation.rule.maxAgeYears} yr range for{' '}
                          {ageVsClassEvaluation.rule.classOrProgrammeLabel}. Verify DOB against
                          Class X certificate to rule out a birth-year typo.
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* 4.1.4 Mother's Name */}
                <div
                  id="field-card-4-1-4"
                  className={`bg-white border rounded-lg p-5 transition-all ${
                    highlightedFieldId === 'field-card-4-1-4'
                      ? 'border-indigo-600 ring-4 ring-indigo-200'
                      : 'border-slate-200'
                  }`}
                >
                  <FieldCardHeader
                    fieldNumber="4.1.4"
                    label="Mother's Name"
                    ruleCode="4.1.4"
                    required
                    activeRule={activeRule}
                    setActiveRule={setActiveRule}
                  />
                  <input
                    type="text"
                    value={studentDraft.motherName}
                    onChange={(e) =>
                      setStudentDraft((prev) => ({
                        ...prev,
                        motherName: e.target.value,
                      }))
                    }
                    placeholder="e.g. Sunita Kulkarni"
                    className="w-full rounded-md border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-[#0B1F3A] focus:outline-none"
                  />
                </div>

                {/* 4.1.5 Father's Name */}
                <div
                  id="field-card-4-1-5"
                  className="bg-white border border-slate-200 rounded-lg p-5"
                >
                  <FieldCardHeader
                    fieldNumber="4.1.5"
                    label="Father's Name"
                    ruleCode="4.1.5"
                    required
                    activeRule={activeRule}
                    setActiveRule={setActiveRule}
                  />
                  <input
                    type="text"
                    value={studentDraft.fatherName}
                    onChange={(e) =>
                      setStudentDraft((prev) => ({
                        ...prev,
                        fatherName: e.target.value,
                      }))
                    }
                    placeholder="e.g. Mahesh Kulkarni"
                    className="w-full rounded-md border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-[#0B1F3A] focus:outline-none"
                  />
                </div>

                {/* 4.1.6 Guardian's Name */}
                <div
                  id="field-card-4-1-6"
                  className="bg-white border border-slate-200 rounded-lg p-5"
                >
                  <FieldCardHeader
                    fieldNumber="4.1.6"
                    label="Guardian's Name"
                    ruleCode="4.1.6"
                    activeRule={activeRule}
                    setActiveRule={setActiveRule}
                  />
                  <input
                    type="text"
                    value={studentDraft.guardianName}
                    onChange={(e) =>
                      setStudentDraft((prev) => ({
                        ...prev,
                        guardianName: e.target.value,
                      }))
                    }
                    placeholder="Optional if parent names are recorded"
                    className="w-full rounded-md border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-[#0B1F3A] focus:outline-none"
                  />
                </div>

                {/* 4.1.7 Aadhaar Number of Student (optional, masked, demo numbers only) */}
                <div
                  id="field-card-4-1-7"
                  className={`bg-white border rounded-lg p-5 transition-all ${
                    highlightedFieldId === 'field-card-4-1-7'
                      ? 'border-indigo-600 ring-4 ring-indigo-200'
                      : 'border-slate-200'
                  }`}
                >
                  <FieldCardHeader
                    fieldNumber="4.1.7"
                    label="Aadhaar Number of Student (optional, masked, demo numbers only)"
                    ruleCode="4.1.7"
                    activeRule={activeRule}
                    setActiveRule={setActiveRule}
                  />
                  <input
                    type="text"
                    maxLength={12}
                    value={studentDraft.aadhaarOptional}
                    onChange={(e) =>
                      setStudentDraft((prev) => ({
                        ...prev,
                        aadhaarOptional: e.target.value.replace(/\D/g, ''),
                      }))
                    }
                    placeholder="Optional 12-digit fictional demo number"
                    className="w-full rounded-md border border-slate-300 px-3.5 py-2 text-sm font-mono text-slate-900 focus:border-[#0B1F3A] focus:outline-none"
                  />
                  <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-500">
                    <span>
                      Masked Preview:{' '}
                      <strong className="font-mono text-slate-800">
                        {studentDraft.aadhaarOptional
                          ? maskIdentifier(studentDraft.aadhaarOptional, 4)
                          : 'Not Provided'}
                      </strong>
                    </span>
                    <span>Never stored in local IndexedDB</span>
                  </div>
                </div>

                {/* 4.1.8 Name of Student as per Aadhaar Card + Feature 1 Smart Name-Mismatch Check */}
                <div
                  id="field-card-4-1-8"
                  className={`bg-white border rounded-lg p-5 transition-all ${
                    highlightedFieldId === 'field-card-4-1-8'
                      ? 'border-indigo-600 ring-4 ring-indigo-200'
                      : 'border-slate-200'
                  }`}
                >
                  <FieldCardHeader
                    fieldNumber="4.1.8"
                    label="Name of Student as per Aadhaar Card"
                    ruleCode="4.1.8"
                    activeRule={activeRule}
                    setActiveRule={setActiveRule}
                  />
                  <input
                    type="text"
                    value={studentDraft.studentNameAadhaar}
                    onChange={(e) =>
                      setStudentDraft((prev) => ({
                        ...prev,
                        studentNameAadhaar: e.target.value,
                      }))
                    }
                    placeholder="Enter name as printed on card (to test Smart Name Check)"
                    className="w-full rounded-md border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-[#0B1F3A] focus:outline-none"
                  />

                  {/* Quick Demo Presets to test Smart Name-Mismatch Check */}
                  <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px]">
                    <span className="text-slate-500">Try demo pair:</span>
                    <button
                      type="button"
                      onClick={() =>
                        setStudentDraft((prev) => ({
                          ...prev,
                          studentNameSchool: 'K. Ramesh',
                          studentNameAadhaar: 'Kumar Ramesh',
                        }))
                      }
                      className="px-2 py-0.5 rounded bg-slate-100 hover:bg-indigo-50 text-indigo-800 font-medium"
                    >
                      K. Ramesh ↔ Kumar Ramesh
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setStudentDraft((prev) => ({
                          ...prev,
                          studentNameSchool: 'Reddy Ananya',
                          studentNameAadhaar: 'Ananya Reddi',
                        }))
                      }
                      className="px-2 py-0.5 rounded bg-slate-100 hover:bg-indigo-50 text-indigo-800 font-medium"
                    >
                      Reddy Ananya ↔ Ananya Reddi
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setStudentDraft((prev) => ({
                          ...prev,
                          studentNameSchool: 'Pranav Sharma',
                          studentNameAadhaar: 'Pranav Sarma',
                        }))
                      }
                      className="px-2 py-0.5 rounded bg-slate-100 hover:bg-indigo-50 text-indigo-800 font-medium"
                    >
                      Sharma ↔ Sarma
                    </button>
                  </div>
                </div>

                {/* Full-Width Smart Name-Mismatch Result Card when both names are entered */}
                {(studentDraft.studentNameSchool.trim() ||
                  studentDraft.studentNameAadhaar.trim()) && (
                  <div className="md:col-span-2">
                    <SmartNameComparisonCard
                      schoolName={studentDraft.studentNameSchool}
                      aadhaarName={studentDraft.studentNameAadhaar}
                      onOpenCorrectionRequest={() => navigate('/teacher/name-update')}
                    />
                  </div>
                )}

                {/* 4.1.9 Admission Date (DD/MM/YYYY, must be after date of birth) */}
                <div
                  id="field-card-4-1-9"
                  className={`bg-white border rounded-lg p-5 transition-all ${
                    highlightedFieldId === 'field-card-4-1-9'
                      ? 'border-indigo-600 ring-4 ring-indigo-200'
                      : 'border-slate-200'
                  }`}
                >
                  <FieldCardHeader
                    fieldNumber="4.1.9"
                    label="Admission Date (DD/MM/YYYY, must be after date of birth)"
                    ruleCode="4.1.9"
                    required
                    activeRule={activeRule}
                    setActiveRule={setActiveRule}
                  />
                  <input
                    type="text"
                    value={studentDraft.admissionDate}
                    onChange={(e) =>
                      setStudentDraft((prev) => ({
                        ...prev,
                        admissionDate: e.target.value,
                      }))
                    }
                    placeholder="DD/MM/YYYY (e.g. 14/08/2026)"
                    className="w-full rounded-md border border-slate-300 px-3.5 py-2 text-sm font-mono text-slate-900 focus:border-[#0B1F3A] focus:outline-none"
                  />
                </div>

                {/* 4.1.10 Mobile Number (10 digits; NO alternate mobile field) */}
                <div
                  id="field-card-4-1-10"
                  className={`bg-white border rounded-lg p-5 transition-all ${
                    highlightedFieldId === 'field-card-4-1-10'
                      ? 'border-indigo-600 ring-4 ring-indigo-200'
                      : 'border-slate-200'
                  }`}
                >
                  <FieldCardHeader
                    fieldNumber="4.1.10"
                    label="Mobile Number (10 digits)"
                    ruleCode="4.1.10"
                    required
                    activeRule={activeRule}
                    setActiveRule={setActiveRule}
                  />
                  <input
                    type="tel"
                    maxLength={10}
                    value={studentDraft.mobileNumber}
                    onChange={(e) =>
                      setStudentDraft((prev) => ({
                        ...prev,
                        mobileNumber: e.target.value.replace(/\D/g, ''),
                      }))
                    }
                    placeholder="10-digit primary mobile number (e.g. 9848012345)"
                    className="w-full rounded-md border border-slate-300 px-3.5 py-2 text-sm font-mono text-slate-900 focus:border-[#0B1F3A] focus:outline-none"
                  />
                  <div className="mt-1 text-[11px] text-slate-500">
                    Single primary mobile number only ({studentDraft.mobileNumber.length}/10
                    digits).
                  </div>
                </div>

                {/* 4.1.11 Whether CWSN? (Yes / No radio) */}
                <div
                  id="field-card-4-1-11"
                  className={`bg-white border rounded-lg p-5 md:col-span-2 transition-all ${
                    highlightedFieldId === 'field-card-4-1-11'
                      ? 'border-indigo-600 ring-4 ring-indigo-200'
                      : 'border-slate-200'
                  }`}
                >
                  <FieldCardHeader
                    fieldNumber="4.1.11"
                    label="Whether CWSN (Children With Special Needs)?"
                    ruleCode="4.1.11"
                    required
                    activeRule={activeRule}
                    setActiveRule={setActiveRule}
                  />
                  <div className="flex items-center gap-6 mt-2">
                    <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-800 cursor-pointer">
                      <input
                        type="radio"
                        name="isCwsnRadio"
                        checked={studentDraft.isCwsn === 'yes'}
                        onChange={() =>
                          setStudentDraft((prev) => ({ ...prev, isCwsn: 'yes' }))
                        }
                        className="text-[#0B1F3A]"
                      />
                      <span>Yes</span>
                    </label>

                    <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-800 cursor-pointer">
                      <input
                        type="radio"
                        name="isCwsnRadio"
                        checked={studentDraft.isCwsn === 'no'}
                        onChange={() =>
                          setStudentDraft((prev) => ({ ...prev, isCwsn: 'no' }))
                        }
                        className="text-[#0B1F3A]"
                      />
                      <span>No</span>
                    </label>
                  </div>

                  {/* ITEM 3: CWSN REQUIRED SUB-FIELDS WHEN YES IS SELECTED */}
                  {studentDraft.isCwsn === 'yes' && (
                    <div className="mt-4 pt-4 border-t border-slate-200 bg-indigo-50/40 rounded-lg p-4 space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="text-xs font-bold text-[#0B1F3A]">
                          Required CWSN Accommodation &amp; Inclusion Details (Sensitive · Masked in Lists)
                        </div>
                        <span className="px-2 py-0.5 rounded bg-amber-100 border border-amber-300 text-[11px] font-semibold text-amber-900">
                          Record Status Only · No Document Upload
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">
                            4.1.11a Disability Category (RPwD Standard List) *
                          </label>
                          <select
                            value={studentDraft.cwsnDisabilityCategory || ''}
                            onChange={(e) =>
                              setStudentDraft((prev) => ({
                                ...prev,
                                cwsnDisabilityCategory: e.target.value,
                              }))
                            }
                            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900"
                          >
                            <option value="">-- Select Disability Category --</option>
                            {DISABILITY_CATEGORIES.map((cat) => (
                              <option key={cat} value={cat}>
                                {cat}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">
                            4.1.11b Whether Certificate is Available? (Status Only) *
                          </label>
                          <select
                            value={studentDraft.cwsnCertificateStatus || ''}
                            onChange={(e) =>
                              setStudentDraft((prev) => ({
                                ...prev,
                                cwsnCertificateStatus: e.target.value as CwsnCertificateStatus | '',
                              }))
                            }
                            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900"
                          >
                            <option value="">-- Select Certificate Status --</option>
                            <option value="Available & Verified (Record Status Only)">
                              Available &amp; Verified (Record Status Only)
                            </option>
                            <option value="Applied / Pending Issuance">
                              Applied / Pending Issuance
                            </option>
                            <option value="Not Available">Not Available</option>
                          </select>
                        </div>
                      </div>

                      <div className="text-xs">
                        <label className="block font-semibold text-slate-700 mb-1.5">
                          4.1.11c Support Needed at Institution (Select all that apply) *
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {CWSN_SUPPORT_OPTIONS.map((opt) => {
                            const currentSupport = studentDraft.cwsnSupportNeeded || [];
                            const checked = currentSupport.includes(opt.id);
                            return (
                              <label
                                key={opt.id}
                                className={`flex items-center gap-2 p-2.5 rounded border cursor-pointer transition-colors ${
                                  checked
                                    ? 'bg-indigo-50 border-indigo-300 text-indigo-950 font-semibold'
                                    : 'bg-white border-slate-200 text-slate-700'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={(e) => {
                                    setStudentDraft((prev) => {
                                      const existing = prev.cwsnSupportNeeded || [];
                                      return {
                                        ...prev,
                                        cwsnSupportNeeded: e.target.checked
                                          ? [...existing, opt.id]
                                          : existing.filter((x) => x !== opt.id),
                                      };
                                    });
                                  }}
                                />
                                <span>{opt.label}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>

                      <div className="text-xs">
                        <label className="block font-semibold text-slate-700 mb-1">
                          4.1.11d Support / Accommodation Note (Optional)
                        </label>
                        <input
                          type="text"
                          value={studentDraft.cwsnAccommodationNote || ''}
                          onChange={(e) =>
                            setStudentDraft((prev) => ({
                              ...prev,
                              cwsnAccommodationNote: e.target.value,
                            }))
                          }
                          placeholder="e.g. Ground-floor lab access and 20 mins extra exam time per hour"
                          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 space-y-2">
                {step2Blocking.length > 0 && (
                  <p role="status" className="text-[11px] font-medium text-amber-800 text-right">
                    Missing on Step 2 ({step2Blocking.length} field{step2Blocking.length > 1 ? 's' : ''}): {step2Blocking[0].whatFailed}
                  </p>
                )}
                <div className="flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[42px] rounded-md border border-slate-300 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B1F3A]"
                  >
                    <ArrowLeft className="w-4 h-4 shrink-0" />
                    <span>Back</span>
                  </button>

                  <button
                    type="button"
                    disabled={step2Blocking.length > 0}
                    onClick={() => setCurrentStep(3)}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 min-h-[42px] rounded-md bg-[#0B1F3A] text-white text-xs font-semibold hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
                  >
                    <span>Next: Step 3 (Admission &amp; Academic Details)</span>
                    <ArrowRight className="w-4 h-4 shrink-0" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* =====================================================================
              STEP 3: ADMISSION AND ACADEMIC DETAILS (2-Column White Cards + Live Intake Alert)
             ===================================================================== */}
          {currentStep === 3 && (
            <div className="space-y-5">
              {/* Live Warning if saving would push the programme above its approved intake */}
              {selectedProgrammeObj &&
                selectedProgrammeObj.actualEnrolment + 1 >
                  selectedProgrammeObj.approvedIntake && (
                  <div
                    role="alert"
                    className="p-4 rounded-lg bg-red-50 border border-red-200 text-xs text-red-900 flex items-start gap-3"
                  >
                    <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <div className="font-display font-bold text-sm text-red-800">
                        Live Sanctioned Intake Warning — Programme Over Intake Ceiling
                      </div>
                      <p className="leading-relaxed">
                        <strong>{selectedProgrammeObj.programmeName}</strong> at{' '}
                        <strong>{selectedProgrammeObj.institutionName}</strong> has an approved
                        intake of{' '}
                        <strong className="font-mono">
                          {selectedProgrammeObj.approvedIntake}
                        </strong>{' '}
                        and current actual enrolment of{' '}
                        <strong className="font-mono">
                          {selectedProgrammeObj.actualEnrolment}
                        </strong>
                        . Saving this student will push total enrolment to{' '}
                        <strong className="font-mono">
                          {selectedProgrammeObj.actualEnrolment + 1}
                        </strong>{' '}
                        (+
                        {selectedProgrammeObj.actualEnrolment +
                          1 -
                          selectedProgrammeObj.approvedIntake}{' '}
                        above sanctioned intake).
                      </p>
                    </div>
                  </div>
                )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 3.1 Class (School) OR Programme (College) */}
                <div
                  id="field-card-3-1"
                  className={`bg-white border rounded-lg p-5 transition-all ${
                    highlightedFieldId === 'field-card-3-1'
                      ? 'border-indigo-600 ring-4 ring-indigo-200'
                      : 'border-slate-200'
                  }`}
                >
                  <FieldCardHeader
                    fieldNumber="3.1"
                    label={
                      activeWorkspace === 'school'
                        ? 'Class (Classes 1 to 12)'
                        : 'Programme / Degree Branch'
                    }
                    ruleCode="R-3.1"
                    required
                    activeRule={activeRule}
                    setActiveRule={setActiveRule}
                  />
                  {activeWorkspace === 'school' ? (
                    <select
                      value={studentDraft.className || studentDraft.programmeName}
                      onChange={(e) => {
                        const val = e.target.value;
                        const matched = programmes.find((p) => p.programmeName === val);
                        setStudentDraft((prev) => ({
                          ...prev,
                          className: val,
                          programmeName: val,
                          department: matched ? matched.department : 'School Education',
                        }));
                      }}
                      className="w-full rounded-md border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-[#0B1F3A] focus:outline-none"
                    >
                      {[
                        'Class 1',
                        'Class 2',
                        'Class 3',
                        'Class 4',
                        'Class 5',
                        'Class 6',
                        'Class 7',
                        'Class 8',
                        'Class 9',
                        'Class 10',
                        'Class 11 (MPC / BiPC)',
                        'Class 12 (MPC / BiPC)',
                      ].map((cls) => (
                        <option key={cls} value={cls}>
                          {cls}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <select
                      value={studentDraft.programmeName}
                      onChange={(e) => {
                        const matched = programmes.find((p) => p.programmeName === e.target.value);
                        setStudentDraft((prev) => ({
                          ...prev,
                          programmeName: e.target.value,
                          department: matched ? matched.department : prev.department,
                        }));
                      }}
                      className="w-full rounded-md border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-[#0B1F3A] focus:outline-none"
                    >
                      {Array.from(new Set(programmes.map((p) => p.programmeName))).map((pName) => (
                        <option key={pName} value={pName}>
                          {pName}
                        </option>
                      ))}
                    </select>
                  )}
                  {selectedProgrammeObj && (
                    <div className="mt-2 text-[11px] font-mono text-slate-500 flex items-center justify-between">
                      <span>Approved Intake: {selectedProgrammeObj.approvedIntake}</span>
                      <span>Current Enrolment: {selectedProgrammeObj.actualEnrolment}</span>
                    </div>
                  )}
                </div>

                {/* 3.2 Section & Medium (School) OR Section, Department & Semester (College) */}
                <div
                  id="field-card-3-2"
                  className="bg-white border border-slate-200 rounded-lg p-5"
                >
                  <FieldCardHeader
                    fieldNumber="3.2"
                    label={
                      activeWorkspace === 'school'
                        ? 'Section (A–C) & Medium of Instruction'
                        : 'Section, Department & Semester'
                    }
                    ruleCode="R-3.2"
                    required
                    activeRule={activeRule}
                    setActiveRule={setActiveRule}
                  />
                  {activeWorkspace === 'school' ? (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-mono uppercase text-slate-500 mb-1">
                          Section (A to C)
                        </label>
                        <select
                          value={studentDraft.section}
                          onChange={(e) =>
                            setStudentDraft((prev) => ({ ...prev, section: e.target.value }))
                          }
                          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                        >
                          {['Section A', 'Section B', 'Section C'].map((secName) => (
                            <option key={secName} value={secName}>
                              {secName}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono uppercase text-slate-500 mb-1">
                          Medium of Instruction
                        </label>
                        <select
                          value={studentDraft.medium || 'English'}
                          onChange={(e) =>
                            setStudentDraft((prev) => ({
                              ...prev,
                              medium: e.target.value as 'English' | 'Telugu' | 'Hindi' | 'Urdu',
                            }))
                          }
                          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                        >
                          <option value="English">English</option>
                          <option value="Telugu">Telugu</option>
                          <option value="Hindi">Hindi</option>
                          <option value="Urdu">Urdu</option>
                        </select>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <select
                        value={studentDraft.section}
                        onChange={(e) =>
                          setStudentDraft((prev) => ({ ...prev, section: e.target.value }))
                        }
                        className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                      >
                        {Array.from(
                          new Set(
                            managedSections
                              .filter((sec) => !sec.isArchived)
                              .map((sec) => sec.sectionName)
                          )
                        ).map((secName) => (
                          <option key={secName} value={secName}>
                            {secName}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={studentDraft.department}
                        onChange={(e) =>
                          setStudentDraft((prev) => ({ ...prev, department: e.target.value }))
                        }
                        placeholder="Department"
                        className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900"
                      />
                      <select
                        value={studentDraft.semester || 1}
                        onChange={(e) =>
                          setStudentDraft((prev) => ({
                            ...prev,
                            semester: Number(e.target.value) || 1,
                          }))
                        }
                        className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                          <option key={sem} value={sem}>
                            Semester {sem}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* 3.3 Academic Year & Admission Number */}
                <div
                  id="field-card-3-3"
                  className={`bg-white border rounded-lg p-5 transition-all ${
                    highlightedFieldId === 'field-card-3-3'
                      ? 'border-indigo-600 ring-4 ring-indigo-200'
                      : 'border-slate-200'
                  }`}
                >
                  <FieldCardHeader
                    fieldNumber="3.3"
                    label="Academic Year & Roll / Admission Number"
                    ruleCode="R-3.3"
                    required
                    activeRule={activeRule}
                    setActiveRule={setActiveRule}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <select
                      value={studentDraft.academicYear}
                      onChange={(e) =>
                        setStudentDraft((prev) => ({ ...prev, academicYear: e.target.value }))
                      }
                      className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-mono text-slate-900"
                    >
                      {Object.values(academicYearsMeta).map((ay) => (
                        <option key={ay.code} value={ay.code}>
                          {ay.code} {ay.isReadOnlySnapshot ? '(Snapshot)' : '(Current)'}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={studentDraft.admissionNumber}
                      onChange={(e) =>
                        setStudentDraft((prev) => ({
                          ...prev,
                          admissionNumber: e.target.value,
                        }))
                      }
                      placeholder={
                        activeWorkspace === 'school' ? 'e.g. 26DPS-05A-012' : 'e.g. 24DIET-CS-001'
                      }
                      className="rounded-md border border-slate-300 px-3 py-2 text-sm font-mono text-slate-900"
                    />
                  </div>
                </div>

                {/* 3.4 Mid-Day Meal Eligible (School) OR Admission Quota & Enrolment Status (College) */}
                <div
                  id="field-card-3-4"
                  className="bg-white border border-slate-200 rounded-lg p-5"
                >
                  <FieldCardHeader
                    fieldNumber="3.4"
                    label={
                      activeWorkspace === 'school'
                        ? 'Mid-Day Meal (PM POSHAN) Eligible & Status'
                        : 'Admission Category & Enrolment Status'
                    }
                    ruleCode="R-3.4"
                    required
                    activeRule={activeRule}
                    setActiveRule={setActiveRule}
                  />
                  {activeWorkspace === 'school' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-mono uppercase text-slate-500 mb-1">
                          Mid-Day Meal Eligible (Demo Field)
                        </label>
                        <select
                          value={studentDraft.midDayMealEligible || 'Yes'}
                          onChange={(e) =>
                            setStudentDraft((prev) => ({
                              ...prev,
                              midDayMealEligible: e.target.value as 'Yes' | 'No',
                            }))
                          }
                          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-900"
                        >
                          <option value="Yes">Yes — Eligible (Classes 1–8 / Govt Aided)</option>
                          <option value="No">No — Not Applicable / Opted Out</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono uppercase text-slate-500 mb-1">
                          School Enrolment Status
                        </label>
                        <select
                          value={studentDraft.enrolmentStatus}
                          onChange={(e) =>
                            setStudentDraft((prev) => ({
                              ...prev,
                              enrolmentStatus: e.target.value,
                            }))
                          }
                          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900"
                        >
                          <option value="Active — Regular School Roll">
                            Active — Regular School Roll
                          </option>
                          <option value="RTE 25% Quota Admission">RTE 25% Quota Admission</option>
                          <option value="Transferred In (TC Verified)">
                            Transferred In (TC Verified)
                          </option>
                        </select>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <select
                        value={studentDraft.admissionCategory}
                        onChange={(e) =>
                          setStudentDraft((prev) => ({
                            ...prev,
                            admissionCategory: e.target.value,
                          }))
                        }
                        className="rounded-md border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900"
                      >
                        <option value="Regular / State Convener Quota">
                          Regular / State Convener Quota
                        </option>
                        <option value="Management / Institutional Quota">
                          Management / Institutional Quota
                        </option>
                        <option value="Supernumerary (EWS / TFW)">Supernumerary (EWS / TFW)</option>
                        <option value="Lateral Entry (Diploma)">Lateral Entry (Diploma)</option>
                      </select>

                      <select
                        value={studentDraft.enrolmentStatus}
                        onChange={(e) =>
                          setStudentDraft((prev) => ({
                            ...prev,
                            enrolmentStatus: e.target.value,
                          }))
                        }
                        className="rounded-md border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900"
                      >
                        <option value="Active — Semester 1">Active — Semester 1</option>
                        <option value="Provisional Allotment (Counselling)">
                          Provisional Allotment (Counselling)
                        </option>
                        <option value="Transferred / Sliding Round">
                          Transferred / Sliding Round
                        </option>
                      </select>
                    </div>
                  )}
                </div>

                {/* 3.5 Previous Institution and Qualification */}
                <div className="bg-white border border-slate-200 rounded-lg p-5 md:col-span-2">
                  <FieldCardHeader
                    fieldNumber="3.5"
                    label="Previous Institution & Qualifying Examination"
                    ruleCode="R-3.4"
                    required
                    activeRule={activeRule}
                    setActiveRule={setActiveRule}
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={studentDraft.previousInstitution}
                      onChange={(e) =>
                        setStudentDraft((prev) => ({
                          ...prev,
                          previousInstitution: e.target.value,
                        }))
                      }
                      placeholder="Previous School / Junior College Name"
                      className="rounded-md border border-slate-300 px-3.5 py-2 text-sm text-slate-900"
                    />
                    <input
                      type="text"
                      value={studentDraft.previousQualification}
                      onChange={(e) =>
                        setStudentDraft((prev) => ({
                          ...prev,
                          previousQualification: e.target.value,
                        }))
                      }
                      placeholder="Qualifying Exam (e.g. Class XII MPC)"
                      className="rounded-md border border-slate-300 px-3.5 py-2 text-sm text-slate-900"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 space-y-2">
                {step3Blocking.length > 0 && (
                  <p role="status" className="text-[11px] font-medium text-amber-800 text-right">
                    Missing on Step 3: {step3Blocking[0].whatFailed}
                  </p>
                )}
                <div className="flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[42px] rounded-md border border-slate-300 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B1F3A]"
                  >
                    <ArrowLeft className="w-4 h-4 shrink-0" />
                    <span>Back</span>
                  </button>

                  <button
                    type="button"
                    disabled={step3Blocking.length > 0}
                    onClick={() => setCurrentStep(4)}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 min-h-[42px] rounded-md bg-[#0B1F3A] text-white text-xs font-semibold hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
                  >
                    <span>Next: Step 4 (Review &amp; Submit)</span>
                    <ArrowRight className="w-4 h-4 shrink-0" />
                  </button>
                </div>
              </div>
            </div>
          )}

      {/* =====================================================================
          STEP 4: REVIEW AND SUBMIT
          Summary with Edit links, Validation Results (5-part explanation), APAAR Readiness Result, Save Student & Back
         ===================================================================== */}
      {currentStep === 4 && (
        <div className="space-y-6">
          {/* APAAR Readiness Result Banner */}
          <div
            className={`p-5 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
              apaarReadinessBanner.tone === 'teal'
                ? 'bg-teal-50 border-teal-200 text-teal-950'
                : apaarReadinessBanner.tone === 'amber'
                ? 'bg-amber-50 border-amber-200 text-amber-950'
                : 'bg-red-50 border-red-200 text-red-950'
            }`}
          >
            <div className="space-y-1">
              <div className="text-xs font-mono uppercase tracking-wider font-semibold">
                APAAR Readiness Result (Simulated Evaluation)
              </div>
              <div className="font-display text-lg font-bold">
                {apaarReadinessBanner.completeness} — {apaarReadinessBanner.statusText}
              </div>
              <p className="text-xs opacity-90">
                Blocking Errors: <strong>{blockingErrors.length}</strong> · Warnings:{' '}
                <strong>{warnings.length}</strong> · Info: <strong>{infos.length}</strong>
              </p>
            </div>

            <div className="shrink-0">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-white/90 border border-slate-200 text-xs font-semibold text-[#0B1F3A]">
                <FileCheck2 className="w-4 h-4 text-teal-700" />
                <span>Simulated Verification Only</span>
              </span>
            </div>
          </div>

          {/* Validation Results with Five-Part Explanation */}
          <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-4">
            <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
              <div>
                <h2 className="font-display font-bold text-base text-[#0B1F3A]">
                  Validation Results (Five-Part Diagnostic Explanations)
                </h2>
                <p className="text-xs text-slate-500">
                  Saving is blocked only when Blocking Errors ({blockingErrors.length}) are present.
                  Warnings allow saving with an audit annotation.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {validationFindings.map((item) => {
                const badgeTone =
                  item.severity === 'blocking'
                    ? 'bg-red-50 border-red-200 text-red-900'
                    : item.severity === 'warning'
                    ? 'bg-amber-50 border-amber-200 text-amber-900'
                    : 'bg-slate-50 border-slate-200 text-slate-800';

                return (
                  <div key={item.id} className={`p-4 rounded-md border text-xs ${badgeTone}`}>
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-black/10">
                      <div className="font-display font-bold text-sm flex items-center gap-2">
                        {item.severity === 'blocking' ? (
                          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                        ) : item.severity === 'warning' ? (
                          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                        ) : (
                          <Info className="w-4 h-4 text-indigo-600 shrink-0" />
                        )}
                        <span>
                          [{item.severity.toUpperCase()}] 1. Field &amp; Rule: {item.fieldLabel} (Rule{' '}
                          {item.ruleCode})
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => setCurrentStep(item.targetStep)}
                        className="inline-flex items-center gap-1 font-semibold underline"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>5. Edit in Step {item.targetStep}</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2.5">
                      <div>
                        <span className="font-semibold">2. Finding: </span>
                        <span>{item.whatFailed}</span>
                      </div>
                      <div>
                        <span className="font-semibold">3. Why it matters: </span>
                        <span>{item.whyItMatters}</span>
                      </div>
                      <div>
                        <span className="font-semibold">4. How to fix: </span>
                        <span>{item.howToFix}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Summary of All Answers with Edit Links to Each Step */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Step 1 Summary Card */}
            <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="font-display font-bold text-sm text-[#0B1F3A]">
                  Step 1: Identity Check
                </h3>
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="text-xs font-semibold text-indigo-700 hover:underline inline-flex items-center gap-1"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Edit Step 1</span>
                </button>
              </div>
              <dl className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <dt className="text-slate-500">Has Existing APAAR:</dt>
                  <dd className="font-semibold text-slate-900 uppercase">
                    {studentDraft.hasExistingApaar || 'Not Answered'}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Recorded APAAR ID:</dt>
                  <dd className="font-mono text-slate-900">
                    {studentDraft.hasExistingApaar === 'yes'
                      ? maskIdentifier(studentDraft.existingApaarId, 3)
                      : 'APAAR prerequisites pending'}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Simulated Aadhaar Lookup:</dt>
                  <dd className="font-medium text-slate-800">
                    {studentDraft.aadhaarSimulatedResult === 'found'
                      ? 'Found (Simulated)'
                      : studentDraft.aadhaarSimulatedResult === 'not_found'
                      ? 'Not Found (Simulated)'
                      : 'Not Run'}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Parent Consent:</dt>
                  <dd className="font-semibold text-slate-900 uppercase">
                    {studentDraft.consentStatus}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Step 2 Summary Card */}
            <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="font-display font-bold text-sm text-[#0B1F3A]">
                  Step 2: General Profile
                </h3>
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="text-xs font-semibold text-indigo-700 hover:underline inline-flex items-center gap-1"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Edit Step 2</span>
                </button>
              </div>
              <dl className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <dt className="text-slate-500">4.1.1 Name (School):</dt>
                  <dd className="font-semibold text-slate-900">
                    {studentDraft.studentNameSchool || '—'}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">4.1.2 Gender / 4.1.3 DOB:</dt>
                  <dd className="font-mono text-slate-900">
                    {studentDraft.gender || '—'} · {studentDraft.dob || '—'}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">4.1.4 Mother / 4.1.5 Father:</dt>
                  <dd className="text-slate-900 truncate max-w-[160px]">
                    {studentDraft.motherName || '—'} / {studentDraft.fatherName || '—'}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">4.1.7 Aadhaar (Masked):</dt>
                  <dd className="font-mono text-slate-900">
                    {studentDraft.aadhaarOptional
                      ? maskIdentifier(studentDraft.aadhaarOptional, 3)
                      : 'Optional (Blank)'}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">4.1.8 Name on Aadhaar:</dt>
                  <dd className="text-slate-900">
                    {studentDraft.studentNameAadhaar || '—'}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">4.1.9 Admission Date:</dt>
                  <dd className="font-mono text-slate-900">{studentDraft.admissionDate}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">4.1.10 Mobile / 4.1.11 CWSN:</dt>
                  <dd className="font-mono text-slate-900">
                    {studentDraft.mobileNumber || '—'} · CWSN: {studentDraft.isCwsn.toUpperCase()}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Step 3 Summary Card */}
            <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="font-display font-bold text-sm text-[#0B1F3A]">
                  Step 3: {activeWorkspace === 'school' ? 'School Class & Section' : 'College Academic Details'}
                </h3>
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="text-xs font-semibold text-indigo-700 hover:underline inline-flex items-center gap-1"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Edit Step 3</span>
                </button>
              </div>
              <dl className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <dt className="text-slate-500">
                    {activeWorkspace === 'school' ? 'Class:' : 'Programme:'}
                  </dt>
                  <dd className="font-semibold text-slate-900 text-right">
                    {activeWorkspace === 'school'
                      ? studentDraft.className || studentDraft.programmeName
                      : studentDraft.programmeName}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">
                    {activeWorkspace === 'school' ? 'Section & Medium:' : 'Section, Sem & Dept:'}
                  </dt>
                  <dd className="text-slate-900">
                    {activeWorkspace === 'school'
                      ? `${studentDraft.section} · ${studentDraft.medium || 'English'}`
                      : `${studentDraft.section} · Sem ${studentDraft.semester || 1} · ${studentDraft.department}`}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Academic Year &amp; Roll No:</dt>
                  <dd className="font-mono text-slate-900">
                    {studentDraft.academicYear} · {studentDraft.admissionNumber}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">
                    {activeWorkspace === 'school' ? 'Mid-Day Meal Eligible:' : 'Quota Category:'}
                  </dt>
                  <dd className="text-slate-900 text-right font-medium">
                    {activeWorkspace === 'school'
                      ? `${studentDraft.midDayMealEligible || 'Yes'} (Demo)`
                      : studentDraft.admissionCategory}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Enrolment Status:</dt>
                  <dd className="font-semibold text-teal-700">{studentDraft.enrolmentStatus}</dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Step 4 Action Buttons: Back and Submit */}
          <div className="pt-4 border-t border-slate-200 space-y-2">
            {blockingErrors.length > 0 && (
              <p role="status" className="text-[11px] font-semibold text-red-600 text-right">
                Resolve {blockingErrors.length} blocking error(s) above ({blockingErrors[0].fieldLabel}) to enable Submit.
              </p>
            )}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[42px] rounded-md border border-slate-300 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B1F3A]"
              >
                <ArrowLeft className="w-4 h-4 shrink-0" />
                <span>Back</span>
              </button>

              <button
                type="button"
                disabled={blockingErrors.length > 0}
                onClick={handleFinalSaveStudent}
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 min-h-[42px] rounded-md bg-[#0B1F3A] text-white font-display font-semibold text-xs sm:text-sm hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
              >
                <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                <span>Submit &amp; Save Student</span>
                <ArrowRight className="w-4 h-4 shrink-0" />
              </button>
            </div>
          </div>
        </div>
      )}
        </div>

        {/* =====================================================================
            FEATURE 3: "FIX BEFORE YOU SUBMIT" COACH SIDE PANEL
            Grouped as Must fix, Should check, FYI, each with "Take me to the field"
            and a live SVG progress ring.
           ===================================================================== */}
        <aside
          aria-label="Fix Before You Submit Coach"
          className="xl:col-span-4 bg-white border border-slate-200 rounded-lg p-5 space-y-4 xl:sticky xl:top-4"
        >
          {/* Header + Live Progress Ring */}
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
            <div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-indigo-700 font-semibold">
                Live Readiness Coach
              </div>
              <h2 className="font-display font-bold text-base text-[#0B1F3A]">
                &ldquo;Fix Before You Submit&rdquo; Coach
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Updates live as you type. Click any item to jump to and highlight that field.
              </p>
            </div>

            {/* SVG Progress Ring */}
            <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
              <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
                <circle
                  cx="28"
                  cy="28"
                  r="22"
                  fill="none"
                  stroke="#E2E8F0"
                  strokeWidth="5"
                />
                <circle
                  cx="28"
                  cy="28"
                  r="22"
                  fill="none"
                  stroke={
                    blockingErrors.length === 0
                      ? '#0F766E'
                      : coachProgressPercent >= 50
                      ? '#D97706'
                      : '#DC2626'
                  }
                  strokeWidth="5"
                  strokeDasharray={2 * Math.PI * 22}
                  strokeDashoffset={
                    2 * Math.PI * 22 * (1 - coachProgressPercent / 100)
                  }
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute font-mono font-bold text-xs text-[#0B1F3A]">
                {coachProgressPercent}%
              </span>
            </div>
          </div>

          {/* Group 1: MUST FIX (Blocking) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-red-700">
              <span>Must fix ({blockingErrors.length})</span>
              <span className="text-[11px] font-normal text-slate-500">Blocks submission</span>
            </div>
            {blockingErrors.length === 0 ? (
              <div className="p-2.5 rounded bg-teal-50/70 border border-teal-200 text-[11px] text-teal-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                <span>All mandatory fields are complete!</span>
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {blockingErrors.map((err) => (
                  <div
                    key={err.id}
                    className="p-3 rounded-md bg-red-50/70 border border-red-200 text-xs space-y-1.5"
                  >
                    <div className="font-semibold text-red-950">{err.fieldLabel}</div>
                    <p className="text-[11px] text-red-900 leading-snug">{err.whatFailed}</p>
                    <p className="text-[11px] text-slate-600 leading-snug">
                      <strong>Fix:</strong> {err.howToFix}
                    </p>
                    <button
                      type="button"
                      onClick={() => handleTakeMeToField(err.targetStep, err.fieldCardId)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-white border border-red-300 text-red-800 text-[11px] font-semibold hover:bg-red-100 transition-colors"
                    >
                      <Crosshair className="w-3 h-3" />
                      <span>Take me to the field (Step {err.targetStep})</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Group 2: SHOULD CHECK (Warnings) */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs font-bold text-amber-800">
              <span>Should check ({warnings.length})</span>
              <span className="text-[11px] font-normal text-slate-500">Advisory review</span>
            </div>
            {warnings.length === 0 ? (
              <div className="p-2.5 rounded bg-slate-50 border border-slate-200 text-[11px] text-slate-600">
                No advisory warnings flagged.
              </div>
            ) : (
              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {warnings.map((warn) => (
                  <div
                    key={warn.id}
                    className="p-3 rounded-md bg-amber-50/80 border border-amber-200 text-xs space-y-1.5"
                  >
                    <div className="font-semibold text-amber-950">{warn.fieldLabel}</div>
                    <p className="text-[11px] text-amber-900 leading-snug">{warn.whatFailed}</p>
                    <button
                      type="button"
                      onClick={() => handleTakeMeToField(warn.targetStep, warn.fieldCardId)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-white border border-amber-300 text-amber-900 text-[11px] font-semibold hover:bg-amber-100 transition-colors"
                    >
                      <Crosshair className="w-3 h-3" />
                      <span>Take me to the field (Step {warn.targetStep})</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Group 3: FYI (Informational) */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="text-xs font-bold text-indigo-800">FYI ({infos.length})</div>
            {infos.map((inf) => (
              <div
                key={inf.id}
                className="p-3 rounded-md bg-slate-50 border border-slate-200 text-xs space-y-1.5"
              >
                <div className="font-semibold text-slate-800">{inf.fieldLabel}</div>
                <p className="text-[11px] text-slate-600 leading-snug">{inf.whatFailed}</p>
                <button
                  type="button"
                  onClick={() => handleTakeMeToField(inf.targetStep, inf.fieldCardId)}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-700 hover:underline"
                >
                  <Crosshair className="w-3 h-3" />
                  <span>Take me to the field</span>
                </button>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
};
