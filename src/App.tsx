/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { PortalLayout } from './components/PortalLayout';
import { LandingPage } from './pages/LandingPage';
import {
  LoginStateStep,
  LoginRoleStep,
  LoginInstitutionStep,
  LoginCredentialsStep,
  DemoCredentialsPage,
} from './pages/LoginPage';
import {
  TeacherDashboard,
  TeacherCleaningPage,
  TeacherDuplicatesPage,
  TeacherExportPage,
} from './pages/TeacherDashboard';
import { AddStudentWizard } from './pages/AddStudentWizard';
import {
  SchoolDashboardPage,
  SchoolProfilePage,
  SchoolProgrammesSectionsPage,
  SchoolApprovedIntakePage,
  RequestManagementPage,
  StudentNameUpdatePage,
  ApaarModulePage,
  SectionShiftPage,
  ProgressionActivityPage,
  ImportWizardPage,
  DropboxInactivePage,
  TransferCertificatePage,
  InactivateStudentPage,
  ReportingModulePage,
  SchoolCertificationPage,
  GlobalStudentSearchPage,
  ValidationGuidePage,
  NotificationsPage,
} from './pages/TeacherPortalPages';
import {
  CollegeOverview,
  CollegeDepartmentsPage,
  CollegeAlertsPage,
  CollegeAiAuditPage,
  ManagementStudentAdmissionsPage,
  ManagementDataQualityPage,
  ManagementApaarReadinessPage,
  ManagementIdentityVerificationPage,
  ManagementReconciliationPage,
  ManagementAnalyticsPage,
  ManagementStaffPermissionsPage,
  ManagementAuditLogsPage,
} from './pages/CollegeOverview';
import {
  AicteOverview,
  AicteInstitutionsPage,
  AicteAdvisoriesPage,
  AicteStandardsPage,
} from './pages/AicteOverview';
import {
  PublicConsentPage,
  StandaloneStudentSummaryPage,
} from './pages/PublicConsentPage';
import {
  ForgotPasswordPage,
  ResetPasswordPage,
  SettingsAndRolloverPage,
  HelpAndSupportPage,
  DevHealthPage,
  WhatIsSimulatedPage,
  NotFound404Page,
  NotPermittedPage,
} from './pages/GovernanceAndSupportPages';

export default function App() {
  const wrap = (el: React.ReactNode) => <PortalLayout>{el}</PortalLayout>;

  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Landing */}
          <Route path="/" element={<LandingPage />} />

          {/* Public Simulated Parent/Guardian Consent Page */}
          <Route path="/consent/:token" element={<PublicConsentPage />} />

          {/* Demo Accounts Quick-Login Directory */}
          <Route path="/demo-credentials" element={<DemoCredentialsPage />} />

          {/* 4-Step Sequential Login Routes + Account Recovery Screens */}
          <Route path="/login" element={<Navigate to="/login/state" replace />} />
          <Route path="/login/state" element={<LoginStateStep />} />
          <Route path="/login/role" element={<LoginRoleStep />} />
          <Route path="/login/institution" element={<LoginInstitutionStep />} />
          <Route path="/login/credentials" element={<LoginCredentialsStep />} />
          <Route path="/login/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/login/reset-password" element={<ResetPasswordPage />} />

          {/* =================================================================
              TEACHER PORTAL: SCHOOL WORKSPACE (/teacher/school/*),
              COLLEGE WORKSPACE (/teacher/college/*), & ADAPTIVE (/teacher/*)
             ================================================================= */}
          {['/teacher', '/teacher/school', '/teacher/college'].map((base) => (
            <React.Fragment key={base}>
              {/* 1. School / College Dashboard */}
              <Route path={base} element={wrap(<SchoolDashboardPage />)} />

              {/* 2. School / College Details Group */}
              <Route path={`${base}/profile`} element={wrap(<SchoolProfilePage />)} />
              <Route
                path={`${base}/programmes`}
                element={wrap(<SchoolProgrammesSectionsPage />)}
              />
              <Route
                path={`${base}/intake`}
                element={wrap(<SchoolApprovedIntakePage />)}
              />

              {/* 3. Request Management */}
              <Route
                path={`${base}/requests`}
                element={wrap(<RequestManagementPage />)}
              />

              {/* 4. Student Name Update */}
              <Route
                path={`${base}/name-update`}
                element={wrap(<StudentNameUpdatePage />)}
              />

              {/* 5. List of All Students Group: All Students, Add New Student & Printable Summary */}
              <Route path={`${base}/students`} element={wrap(<TeacherDashboard />)} />
              <Route
                path={`${base}/students/new`}
                element={wrap(<AddStudentWizard />)}
              />
              <Route
                path={`${base}/students/:studentId/summary`}
                element={wrap(<StandaloneStudentSummaryPage />)}
              />

              {/* 6. APAAR Module */}
              <Route path={`${base}/apaar`} element={wrap(<ApaarModulePage />)} />

              {/* 7. Section Shift */}
              <Route
                path={`${base}/section-shift`}
                element={wrap(<SectionShiftPage />)}
              />

              {/* 8. Student Movement and Progression Group */}
              <Route
                path={`${base}/progression`}
                element={wrap(<ProgressionActivityPage />)}
              />
              <Route path={`${base}/import`} element={wrap(<ImportWizardPage />)} />
              <Route
                path={`${base}/dropbox`}
                element={wrap(<DropboxInactivePage />)}
              />
              <Route
                path={`${base}/transfer-certificate`}
                element={wrap(<TransferCertificatePage />)}
              />
              <Route
                path={`${base}/inactivate`}
                element={wrap(<InactivateStudentPage />)}
              />

              {/* 9. Reporting Module */}
              <Route
                path={`${base}/reporting`}
                element={wrap(<ReportingModulePage />)}
              />

              {/* 10. School / College Certification */}
              <Route
                path={`${base}/certification`}
                element={wrap(<SchoolCertificationPage />)}
              />

              {/* 11. Duplicate Records */}
              <Route
                path={`${base}/duplicates`}
                element={wrap(<TeacherDuplicatesPage />)}
              />

              {/* 12. Global Student Search */}
              <Route
                path={`${base}/global-search`}
                element={wrap(<GlobalStudentSearchPage />)}
              />

              {/* 13. Form Fields Validation Guide */}
              <Route
                path={`${base}/validation-guide`}
                element={wrap(<ValidationGuidePage />)}
              />

              {/* 14. Notifications */}
              <Route
                path={`${base}/notifications`}
                element={wrap(<NotificationsPage />)}
              />

              {/* 15. Settings & Rollover */}
              <Route
                path={`${base}/settings`}
                element={wrap(<SettingsAndRolloverPage />)}
              />

              {/* 16. Help & Support */}
              <Route path={`${base}/help`} element={wrap(<HelpAndSupportPage />)} />

              {/* Legacy Cleaning & Export */}
              <Route
                path={`${base}/cleaning`}
                element={wrap(<TeacherCleaningPage />)}
              />
              <Route path={`${base}/export`} element={wrap(<TeacherExportPage />)} />
            </React.Fragment>
          ))}

          {/* =================================================================
              SCHOOL MANAGEMENT (/school-management/*) &
              COLLEGE MANAGEMENT (/college/*) - FULL 16-ITEM MENU
             ================================================================= */}
          {['/school-management', '/college'].map((mgmtBase) => (
            <React.Fragment key={mgmtBase}>
              {/* 1. Overview */}
              <Route path={mgmtBase} element={wrap(<CollegeOverview />)} />

              {/* 2. Institution Profile */}
              <Route path={`${mgmtBase}/profile`} element={wrap(<SchoolProfilePage />)} />

              {/* 3. Classes and Sections / Programmes and Sections */}
              <Route
                path={`${mgmtBase}/classes-sections`}
                element={wrap(<SchoolProgrammesSectionsPage />)}
              />

              {/* 4. Approved Intake */}
              <Route
                path={`${mgmtBase}/approved-intake`}
                element={wrap(<SchoolApprovedIntakePage />)}
              />

              {/* 5. Student Admissions */}
              <Route
                path={`${mgmtBase}/admissions`}
                element={wrap(<ManagementStudentAdmissionsPage />)}
              />

              {/* 6. Student Records */}
              <Route
                path={`${mgmtBase}/students`}
                element={wrap(<TeacherDashboard />)}
              />

              {/* 7. Data Quality */}
              <Route
                path={`${mgmtBase}/data-quality`}
                element={wrap(<ManagementDataQualityPage />)}
              />

              {/* 8. Duplicate Records */}
              <Route
                path={`${mgmtBase}/duplicates`}
                element={wrap(<TeacherDuplicatesPage />)}
              />

              {/* 9. APAAR Readiness */}
              <Route
                path={`${mgmtBase}/apaar-readiness`}
                element={wrap(<ManagementApaarReadinessPage />)}
              />

              {/* 10. Identity Verification */}
              <Route
                path={`${mgmtBase}/identity-verification`}
                element={wrap(<ManagementIdentityVerificationPage />)}
              />

              {/* 11. Admission Reconciliation */}
              <Route
                path={`${mgmtBase}/reconciliation`}
                element={wrap(<ManagementReconciliationPage />)}
              />

              {/* 12. Analytics */}
              <Route
                path={`${mgmtBase}/analytics`}
                element={wrap(<ManagementAnalyticsPage />)}
              />

              {/* 13. Reports */}
              <Route
                path={`${mgmtBase}/reports`}
                element={wrap(<ReportingModulePage />)}
              />
              <Route
                path={`${mgmtBase}/reporting`}
                element={wrap(<ReportingModulePage />)}
              />

              {/* 14. Staff and Permissions */}
              <Route
                path={`${mgmtBase}/staff`}
                element={wrap(<ManagementStaffPermissionsPage />)}
              />

              {/* 15. Audit Logs */}
              <Route
                path={`${mgmtBase}/audit-logs`}
                element={wrap(<ManagementAuditLogsPage />)}
              />

              {/* 16. Settings */}
              <Route
                path={`${mgmtBase}/settings`}
                element={wrap(<SettingsAndRolloverPage />)}
              />

              {/* Preserved Existing Sub-Routes */}
              <Route
                path={`${mgmtBase}/departments`}
                element={wrap(<CollegeDepartmentsPage />)}
              />
              <Route
                path={`${mgmtBase}/alerts`}
                element={wrap(<CollegeAlertsPage />)}
              />
              <Route
                path={`${mgmtBase}/ai-audit`}
                element={wrap(<CollegeAiAuditPage />)}
              />
              <Route
                path={`${mgmtBase}/help`}
                element={wrap(<HelpAndSupportPage />)}
              />
            </React.Fragment>
          ))}

          {/* AICTE Central Monitoring Portal Routes */}
          <Route path="/aicte" element={wrap(<AicteOverview />)} />
          <Route
            path="/aicte/institutions"
            element={wrap(<AicteInstitutionsPage />)}
          />
          <Route path="/aicte/advisories" element={wrap(<AicteAdvisoriesPage />)} />
          <Route path="/aicte/standards" element={wrap(<AicteStandardsPage />)} />

          {/* Supabase Readiness & System Health (/dev/health - Admin / Officer) */}
          <Route path="/dev/health" element={wrap(<DevHealthPage />)} />

          {/* Judge Disclosure: What is Simulated (/what-is-simulated) */}
          <Route
            path="/what-is-simulated"
            element={wrap(<WhatIsSimulatedPage />)}
          />

          {/* Access Not Permitted & Custom 404 Pages */}
          <Route path="/not-permitted" element={wrap(<NotPermittedPage />)} />
          <Route path="*" element={<NotFound404Page />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
