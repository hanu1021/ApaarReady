import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Printer,
  ArrowLeft,
  X,
  FileText,
  Lock,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useApp } from '../context/AppContext';
import {
  maskIdentifier,
  StudentRecord,
  buildSimulatedEducationHistory,
} from '../data/mockData';

// ============================================================================
// FEATURE 2: PUBLIC DEMO PAGE (/consent/:token)
// Shows NO student data beyond the first name and class.
// Tokens expire after 7 days and work once.
// ============================================================================
export const PublicConsentPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const { consentTokens, respondToConsentToken } = useApp();
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const tokenRecord = consentTokens.find((t) => t.token === token);

  const isExpired =
    tokenRecord &&
    (tokenRecord.status === 'expired' || new Date(tokenRecord.expiresAt) < new Date());
  const isAlreadyUsed =
    tokenRecord &&
    (tokenRecord.usedOnce ||
      tokenRecord.status === 'obtained' ||
      tokenRecord.status === 'declined');

  const handleDecision = (decision: 'obtained' | 'declined') => {
    if (!token) return;
    setSubmitting(true);
    setTimeout(() => {
      const res = respondToConsentToken(token, decision);
      setFeedback(res);
      setSubmitting(false);
    }, 220);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col justify-between overflow-x-hidden">
      {/* Top Demo Safety Banner */}
      <div className="bg-[#0B1F3A] text-slate-200 px-4 py-2 text-xs border-b border-slate-700">
        <div className="max-w-xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-amber-300">Simulated Consent Portal</span>
            <span aria-hidden="true">·</span>
            <span>Demo data only — No real SMS/WhatsApp sent</span>
          </div>
          <Link
            to="/teacher/students/new"
            className="text-teal-300 hover:underline font-medium text-[11px]"
          >
            &larr; Return to Teacher Portal
          </Link>
        </div>
      </div>

      <main className="flex-1 px-4 py-8 flex items-center justify-center">
        <div className="w-full max-w-lg bg-white border border-slate-200 rounded-lg shadow-sm p-5 sm:p-7 space-y-5">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-teal-700 font-semibold">
                Parent / Guardian Consent Request (Simulated)
              </div>
              <h1 className="font-display text-xl sm:text-2xl font-bold text-[#0B1F3A] mt-1 break-words">
                APAAR Academic Registry Consent
              </h1>
            </div>
            <div className="w-10 h-10 rounded-md bg-[#0B1F3A] text-white flex items-center justify-center font-display font-bold text-sm shrink-0">
              AR
            </div>
          </div>

          {/* Privacy Guardrail Notice */}
          <div className="p-3 rounded-md bg-slate-50 border border-slate-200 text-[11px] text-slate-600 flex items-start gap-2">
            <Lock className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
            <span>
              <strong>Privacy Protection:</strong> To protect student privacy on public links, this
              page displays <strong>only the student&apos;s first name and class</strong>. No full
              name, birth date, PEN, or Aadhaar number is ever shown here.
            </span>
          </div>

          {/* Unknown Token Error State */}
          {!tokenRecord ? (
            <div
              role="alert"
              className="p-4 rounded-md bg-red-50 border border-red-200 text-xs text-red-900 space-y-2"
            >
              <div className="font-display font-bold text-sm flex items-center gap-2 text-red-800">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Invalid or Unknown Consent Link</span>
              </div>
              <p>
                The consent token <code className="font-mono">{token}</code> could not be found.
                Please request a fresh simulated consent link from the school nodal officer.
              </p>
            </div>
          ) : (
            <>
              {/* Minimal Permitted Student Info: First Name & Class Only */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-sky-50/70 border border-sky-200 rounded-md p-4 text-xs">
                <div>
                  <div className="text-slate-500 font-medium">Student First Name Only</div>
                  <div className="font-display font-bold text-base text-[#0B1F3A] mt-0.5">
                    {tokenRecord.studentFirstName}
                  </div>
                </div>
                <div>
                  <div className="text-slate-500 font-medium">Class / Programme</div>
                  <div className="font-semibold text-slate-900 mt-0.5">
                    {tokenRecord.classOrProgramme}
                  </div>
                </div>
                <div className="sm:col-span-2 pt-2 border-t border-sky-200/70 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-600 font-mono">
                  <span>Token: {tokenRecord.token}</span>
                  <span>
                    Expires: {new Date(tokenRecord.expiresAt).toLocaleDateString()} (7-day validity)
                  </span>
                </div>
              </div>

              {/* What is being asked */}
              <div className="space-y-2 text-xs text-slate-700 leading-relaxed">
                <h2 className="font-display font-bold text-sm text-[#0B1F3A]">
                  What is being requested from you?
                </h2>
                <p>
                  The institution is preparing student readiness records for the{' '}
                  <strong>Automated Permanent Academic Account Registry (APAAR / ABC)</strong>.
                  Before initiating simulated identity seeding for{' '}
                  <strong>{tokenRecord.studentFirstName}</strong> ({tokenRecord.classOrProgramme}),
                  explicit parent or legal guardian consent is required.
                </p>
                <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-600">
                  <li>
                    Choosing <strong>Agree</strong> updates the student&apos;s consent status to{' '}
                    <strong>Obtained</strong> with a timestamp in the school audit log.
                  </li>
                  <li>
                    Choosing <strong>Decline</strong> marks the consent status as{' '}
                    <strong>Declined</strong> and halts APAAR creation for this record.
                  </li>
                  <li>This link works once and expires 7 days after generation.</li>
                </ul>
              </div>

              {/* Feedback Banner */}
              {feedback && (
                <div
                  role="status"
                  className={`p-3.5 rounded-md border text-xs font-medium flex items-start gap-2 ${
                    feedback.success
                      ? 'bg-teal-50 border-teal-200 text-teal-900'
                      : 'bg-red-50 border-red-200 text-red-900'
                  }`}
                >
                  {feedback.success ? (
                    <CheckCircle2 className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  )}
                  <span>{feedback.message}</span>
                </div>
              )}

              {/* Expired / Single-Use Consumed / Active Decision Controls */}
              {isAlreadyUsed ? (
                <div className="p-4 rounded-md bg-slate-100 border border-slate-300 text-xs space-y-1.5">
                  <div className="font-display font-bold text-sm text-slate-900 flex items-center gap-2">
                    {tokenRecord.status === 'obtained' ? (
                      <CheckCircle2 className="w-4 h-4 text-teal-700 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-600 shrink-0" />
                    )}
                    <span>
                      Single-Use Link Completed — Status:{' '}
                      <span className="uppercase">{tokenRecord.status}</span>
                    </span>
                  </div>
                  <p className="text-slate-600">
                    Recorded on{' '}
                    <span className="font-mono">
                      {tokenRecord.respondedAt || '2026-10-25'}
                    </span>
                    . Because each consent token is valid for one submission only, no further
                    changes can be made using this link.
                  </p>
                </div>
              ) : isExpired ? (
                <div className="p-4 rounded-md bg-amber-50 border border-amber-200 text-xs text-amber-950 space-y-1.5">
                  <div className="font-display font-bold text-sm text-amber-900 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>Consent Link Expired (7-Day Limit Reached)</span>
                  </div>
                  <p>
                    This simulated consent link expired on{' '}
                    <span className="font-mono">
                      {new Date(tokenRecord.expiresAt).toLocaleDateString()}
                    </span>
                    . Please contact the school nodal officer to generate a new 7-day request.
                  </p>
                </div>
              ) : (
                <div className="pt-2 border-t border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3">
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => handleDecision('declined')}
                    className="px-4 py-2.5 rounded-md border border-red-300 bg-white text-red-700 font-semibold text-xs hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    {submitting ? 'Saving...' : 'Decline Consent'}
                  </button>
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => handleDecision('obtained')}
                    className="px-5 py-2.5 rounded-md bg-teal-700 text-white font-semibold text-xs hover:bg-teal-800 transition-colors disabled:opacity-50"
                  >
                    {submitting ? 'Saving...' : 'Agree & Grant Consent (Simulated)'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <footer className="py-4 px-4 text-center text-[11px] text-slate-500 border-t border-slate-200 bg-white">
        APAAR Ready Sandbox · Simulated Consent Link · No real personal data stored or transmitted
      </footer>
    </div>
  );
};

// ============================================================================
// FEATURE 7: PRINTABLE A4 STUDENT RECORD SUMMARY (Modal + Standalone Route)
// Clean one-page A4 print layout with masked identifiers, completeness,
// open issues, consent status, and a real QR code linking to the demo record page,
// labelled "Demo summary, not an official document". Audit-logs each print.
// ============================================================================
export const PrintableStudentSummaryCard: React.FC<{
  student: StudentRecord;
  onClose?: () => void;
}> = ({ student, onClose }) => {
  const { addAuditLog, session } = useApp();
  const [printedNotice, setPrintedNotice] = useState<string | null>(null);

  const demoRecordUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/teacher/students/${student.id}/summary`
      : `https://apaar-ready.demo/teacher/students/${student.id}/summary`;

  const handlePrint = () => {
    addAuditLog({
      actor: session.userName,
      role: session.roleDisplayLabel || session.designation,
      action: 'RECORD_SUMMARY_PRINTED',
      targetStudentId: student.id,
      details: `Printed A4 demo record summary for ${student.fullName} (${student.rollNo}). All identifiers printed in masked format only.`,
    });
    setPrintedNotice(
      'Print action logged in Audit Trail. Opening browser print dialog (identifiers remain strictly masked)...'
    );
    setTimeout(() => {
      window.print();
    }, 120);
  };

  const openIssues: string[] = [];
  if (student.verificationStatus === 'Mismatch Flagged') {
    openIssues.push('Demographic Name / DOB Mismatch Flagged for human review.');
  }
  if (!student.apaarId) {
    openIssues.push('APAAR ID not yet recorded (Prerequisites / Consent workflow).');
  }
  if (student.consentStatus === 'pending') {
    openIssues.push('Parent / Guardian consent is currently Pending.');
  } else if (student.consentStatus === 'declined') {
    openIssues.push('Parent / Guardian consent was Declined.');
  }
  if (student.duplicateCandidateId) {
    openIssues.push(
      `Flagged as possible duplicate pair with ${student.duplicateCandidateId} (${
        student.reviewedStatus || 'Unreviewed'
      }).`
    );
  }
  if (student.aiIssueNote) {
    openIssues.push(student.aiIssueNote);
  }

  return (
    <div className="bg-white border border-slate-300 rounded-lg shadow-sm max-w-3xl w-full mx-auto p-5 sm:p-8 space-y-6 print:border-0 print:shadow-none print:p-0">
      {/* Top Action Bar (Hidden when printing) */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200 print:hidden">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#0B1F3A]">
          <FileText className="w-4 h-4 text-teal-700" />
          <span>One-Page A4 Printable Student Summary</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-[#0B1F3A] text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Summary (A4 / Save PDF)</span>
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-md border border-slate-300 text-slate-600 hover:bg-slate-100"
              aria-label="Close print preview"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {printedNotice && (
        <div className="p-3 rounded-md bg-teal-50 border border-teal-200 text-xs text-teal-900 print:hidden">
          {printedNotice}
        </div>
      )}

      {/* Mandatory Watermark / Disclaimer Banner */}
      <div className="p-3 rounded-md bg-amber-50 border border-amber-300 text-amber-950 text-xs flex items-center justify-between gap-2">
        <div className="font-bold uppercase tracking-wider">
          Demo summary, not an official document
        </div>
        <div className="font-mono text-[11px]">
          Synthetic Data · Simulated Verification Only
        </div>
      </div>

      {/* Header & QR Code Block */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="space-y-1.5">
          <div className="text-xs font-semibold text-slate-500">
            {student.institutionName} ({student.state})
          </div>
          <h1 className="font-display text-xl sm:text-2xl font-bold text-[#0B1F3A]">
            {student.fullName}
          </h1>
          <div className="text-xs font-mono text-slate-700">
            Roll / Admission No: <strong>{student.rollNo}</strong> · Record ID:{' '}
            <strong>{student.id}</strong>
          </div>
          <div className="text-xs text-slate-600">
            Class / Programme: <strong>{student.programme}</strong> ·{' '}
            <strong>{student.section || 'Section A'}</strong> (Sem {student.semester},{' '}
            {student.academicYear})
          </div>
        </div>

        {/* Real QR Code linking to the demo record page */}
        <div className="flex flex-col items-center p-2.5 border border-slate-200 rounded-md bg-slate-50 shrink-0 self-start">
          <QRCodeSVG
            value={demoRecordUrl}
            size={84}
            level="M"
            includeMargin={false}
          />
          <span className="text-[10px] font-mono text-slate-600 mt-1.5 text-center max-w-[120px] leading-tight">
            Demo summary, not an official document
          </span>
        </div>
      </div>

      {/* Strictly Masked Identifiers & Demographic Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        <div className="p-4 rounded-md border border-slate-200 bg-slate-50/60 space-y-2">
          <div className="font-display font-bold text-slate-900 border-b border-slate-200 pb-1.5">
            1. Masked Identifiers (Privacy Enforced)
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Permanent Education No (PEN):</span>
            <span className="font-mono font-bold text-slate-900">
              {maskIdentifier(student.pen, 3)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">APAAR ID (Masked):</span>
            <span className="font-mono font-bold text-slate-900">
              {maskIdentifier(student.apaarId, 3)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Date of Birth / Gender:</span>
            <span className="font-mono text-slate-800">
              {student.dob} · {student.gender}
            </span>
          </div>
          <div className="text-[10px] text-slate-500 pt-1">
            Note: Full sensitive identifiers are never printed on summary sheets.
          </div>
        </div>

        <div className="p-4 rounded-md border border-slate-200 bg-slate-50/60 space-y-2">
          <div className="font-display font-bold text-slate-900 border-b border-slate-200 pb-1.5">
            2. Completeness &amp; Consent Status
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Verification Status:</span>
            <span className="font-semibold text-[#0B1F3A]">{student.verificationStatus}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Record Completeness Score:</span>
            <span className="font-mono font-bold text-teal-700">
              {student.dataQualityScore}%
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Parent / Guardian Consent:</span>
            <span className="font-semibold uppercase text-slate-900">
              {student.consentStatus || 'not_required'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Roster Status:</span>
            <span className="font-medium text-slate-800">
              {student.studentStatus || 'Active'}
            </span>
          </div>
        </div>
      </div>

      {/* Open Issues & Action Notes */}
      <div className="p-4 rounded-md border border-slate-200 space-y-2 text-xs">
        <div className="font-display font-bold text-slate-900">
          3. Open Data Quality Issues &amp; Readiness Notes
        </div>
        {openIssues.length === 0 ? (
          <div className="text-teal-700 font-medium flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>No open issues — Record is complete for Simulated Verification.</span>
          </div>
        ) : (
          <ul className="list-disc list-inside space-y-1 text-slate-700">
            {openIssues.map((iss, i) => (
              <li key={i}>{iss}</li>
            ))}
          </ul>
        )}
      </div>

      {/* Longitudinal Education History (Simulated) */}
      <div className="p-4 rounded-md border border-slate-200 space-y-2.5 text-xs">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="font-display font-bold text-slate-900">
            4. Longitudinal Education History (Simulated)
          </div>
          <span className="text-[10px] font-mono text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
            Simulated demo history · Cross-institution lookup requires authorized integration
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[11px]">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold">
                <th className="py-1.5 px-2">Stage</th>
                <th className="py-1.5 px-2">Years</th>
                <th className="py-1.5 px-2">Institution &amp; Type</th>
                <th className="py-1.5 px-2">Class / Programme</th>
                <th className="py-1.5 px-2">Status</th>
                <th className="py-1.5 px-2">Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {buildSimulatedEducationHistory(student).map((st) => (
                <tr key={st.id}>
                  <td className="py-1.5 px-2 font-mono font-semibold text-[#0B1F3A]">
                    {st.stage}
                  </td>
                  <td className="py-1.5 px-2 font-mono">
                    {st.startYear}–{st.endYear}
                  </td>
                  <td className="py-1.5 px-2">
                    <span className="font-medium text-slate-900">{st.institutionName}</span>{' '}
                    <span className="text-slate-500">({st.institutionType})</span>
                  </td>
                  <td className="py-1.5 px-2">{st.classOrProgramme}</td>
                  <td className="py-1.5 px-2 font-mono font-semibold">{st.status}</td>
                  <td className="py-1.5 px-2 text-slate-500">{st.sourceLabel}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Sign-off */}
      <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
        <div>
          Generated by: <strong>{session.userName}</strong> ({session.designation})
        </div>
        <div className="font-mono">
          Printed on: 25 Oct 2026 · Demo summary, not an official document
        </div>
      </div>
    </div>
  );
};

export const PrintableStudentSummaryModal: React.FC<{
  student: StudentRecord | null;
  onClose: () => void;
}> = ({ student, onClose }) => {
  if (!student) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Printable Record Summary for ${student.fullName}`}
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-[1px] flex items-center justify-center p-4 overflow-y-auto"
    >
      <div className="my-auto w-full max-w-3xl">
        <PrintableStudentSummaryCard student={student} onClose={onClose} />
      </div>
    </div>
  );
};

export const StandaloneStudentSummaryPage: React.FC = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const { students } = useApp();
  const navigate = useNavigate();

  const student = students.find((s) => s.id === studentId) || students[0];

  return (
    <div className="space-y-4">
      <div className="print:hidden">
        <button
          type="button"
          onClick={() => navigate('/teacher/students')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Students</span>
        </button>
      </div>
      <PrintableStudentSummaryCard student={student} />
    </div>
  );
};
