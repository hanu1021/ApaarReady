import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Users,
  Sparkles,
  GitCompare,
  Building2,
  AlertTriangle,
  Globe,
  FileSpreadsheet,
  LogOut,
  Eye,
  EyeOff,
  SlidersHorizontal,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Info,
  LayoutDashboard,
  ClipboardList,
  UserCheck,
  IdCard,
  ArrowLeftRight,
  ArrowLeft,
  TrendingUp,
  FileCheck2,
  Search,
  BookOpen,
  Bell,
  Wifi,
  WifiOff,
  RefreshCw,
  Trash2,
  Database,
  HelpCircle,
  Settings,
  Compass,
  Calendar,
  Lock,
  Layers,
  Award,
  PieChart,
  UserPlus,
  History,
  KeyRound,
  MoreVertical,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { useApp, DemoAccountKey } from '../context/AppContext';
import { UserRole } from '../data/mockData';
import { getRouteReadableName } from '../data/assistantKnowledgeBase';
import { FloatingAiAssistant } from './FloatingAiAssistant';
import {
  SessionTimeoutWatcher,
  InteractiveTourOverlay,
  JudgeDemoGuideDrawer,
  ToastContainer,
  NotPermittedPage,
} from '../pages/GovernanceAndSupportPages';

interface NavSubItem {
  label: string;
  path: string;
}

interface NavEntry {
  id: string;
  label: string;
  path?: string;
  icon: React.FC<{ className?: string }>;
  isAi?: boolean;
  badgeText?: string;
  badgeTone?: 'amber' | 'teal' | 'red' | 'indigo';
  children?: NavSubItem[];
}

const ROLE_LABELS: Record<UserRole, { title: string; subtitle: string }> = {
  teacher: {
    title: 'Teacher / Nodal Officer Portal',
    subtitle: 'Deccan Institute of Engineering & Technology',
  },
  college: {
    title: 'College Management Portal',
    subtitle: 'Multi-Campus Intake & Enrolment Governance',
  },
  aicte: {
    title: 'AICTE Central Monitoring',
    subtitle: 'National Higher Education Data Quality & Intake Watch',
  },
};

const DEMO_QUICK_ACCOUNTS: {
  key: DemoAccountKey;
  label: string;
  sublabel: string;
  workspaceBadge: 'School' | 'College' | 'National';
}[] = [
  {
    key: 'school_teacher',
    label: 'School Teacher',
    sublabel: 'Assigned Classes: 5-A, 5-B, 10-A · Demo Public School',
    workspaceBadge: 'School',
  },
  {
    key: 'school_management',
    label: 'School Management',
    sublabel: 'Headmaster / Principal · Classes 1–12 Governance',
    workspaceBadge: 'School',
  },
  {
    key: 'college_teacher',
    label: 'College Teacher',
    sublabel: 'Assigned: B.Tech CSE-A, CSE-B · Deccan Institute (DIET)',
    workspaceBadge: 'College',
  },
  {
    key: 'college_management',
    label: 'College Management',
    sublabel: 'Principal & Registrar · UG/PG Programme Governance',
    workspaceBadge: 'College',
  },
  {
    key: 'aicte_state',
    label: 'AICTE State officer',
    sublabel: 'Telangana State Directorate · Aggregated Analytics Only',
    workspaceBadge: 'College',
  },
  {
    key: 'aicte_national',
    label: 'AICTE National officer',
    sublabel: 'All-India Monitoring Cell · Aggregated Rollups Only',
    workspaceBadge: 'National',
  },
  {
    key: 'auditor',
    label: 'Auditor',
    sublabel: 'Read-Only Compliance & Audit Trail Inspector',
    workspaceBadge: 'School',
  },
];

export const PortalLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    session,
    activeWorkspace,
    teacherContext,
    setTeacherContext,
    clearTeacherContext,
    isClassTeacherScoped,
    setIsClassTeacherScoped,
    assignedTeacherScopeLabel,
    canViewSensitive,
    setCanViewSensitive,
    workspaceStudents,
    programmes,
    globalUnmask,
    setGlobalUnmask,
    selectedAcademicYear,
    setSelectedAcademicYear,
    currentActiveAcademicYear,
    academicYearsMeta,
    isReadOnlySnapshot,
    requests,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    addToast,
    isOnline,
    simulateOffline,
    setSimulateOffline,
    offlineDrafts,
    syncOfflineDraftsToDb,
    clearOfflineDrafts,
    studentDraft,
    setStudentDraft,
    activeNlQuery,
    setActiveNlQuery,
    demoGuideOpen,
    setDemoGuideOpen,
    setTourActive,
    setTourStep,
    hasUnsavedChanges,
    setHasUnsavedChanges,
    activeBreadcrumbSuffix,
    switchRoleSignOut,
    signInDemoAccount,
    addAuditLog,
    resetLoginFlow,
  } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  // Desktop Sidebar Collapse / Expand State (Remembered for the session)
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    try {
      return window.sessionStorage.getItem('apaar_sidebar_collapsed') === '1';
    } catch {
      return false;
    }
  });

  const toggleSidebarCollapsed = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        window.sessionStorage.setItem('apaar_sidebar_collapsed', next ? '1' : '0');
      } catch {
        // ignore storage errors
      }
      return next;
    });
  };

  // Mobile/Tablet (<1024px) Overlay Drawer State
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  // Mobile Top-Bar Overflow Menu (<640px)
  const [mobileOverflowOpen, setMobileOverflowOpen] = useState(false);
  // Mobile Demo Data Banner Info Popover State
  const [demoInfoOpen, setDemoInfoOpen] = useState(false);
  // Offline Drafts Waiting to Sync Popover State
  const [draftsPopoverOpen, setDraftsPopoverOpen] = useState(false);
  // Top Bar Notification Bell Dropdown & Full Modal State
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [allNotifsModalOpen, setAllNotifsModalOpen] = useState(false);
  const [syncingDrafts, setSyncingDrafts] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);
  const [reenteredApaarMap, setReenteredApaarMap] = useState<Record<string, string>>({});
  // Top Bar Natural-Language Search Input
  const [topSearchInput, setTopSearchInput] = useState(activeNlQuery);
  // State Quality (Simulated Loading Skeleton & Retryable Error State)
  const [simLoading, setSimLoading] = useState(false);
  const [simError, setSimError] = useState(false);

  // Switch Role Confirm & Demo Quick Login Modal State
  const [switchRoleModalOpen, setSwitchRoleModalOpen] = useState(false);
  // Unsaved Changes Leave Confirmation Modal State
  const [unsavedLeaveModalOpen, setUnsavedLeaveModalOpen] = useState(false);
  const [pendingBackTarget, setPendingBackTarget] = useState<string | null>(null);
  // Track form modifications on Add Student, Settings, and Import pages
  const [localFormModified, setLocalFormModified] = useState(false);

  // Track in-app navigation history for the top-right Back button
  const historyStackRef = useRef<string[]>([]);

  useEffect(() => {
    const currentFull = location.pathname;
    const stack = historyStackRef.current;
    if (stack.length === 0 || stack[stack.length - 1] !== currentFull) {
      stack.push(currentFull);
      if (stack.length > 30) {
        stack.shift();
      }
    }
    setLocalFormModified(false);
    setHasUnsavedChanges(false);
    setMobileDrawerOpen(false);
    setMobileOverflowOpen(false);
    setDemoInfoOpen(false);
    setDraftsPopoverOpen(false);
    setNotifDropdownOpen(false);
  }, [location.pathname, location.search, setHasUnsavedChanges]);

  useEffect(() => {
    setTopSearchInput(activeNlQuery);
  }, [activeNlQuery]);

  // Close Switch Role, Notifications, or Unsaved Changes dialogs on Escape key
  useEffect(() => {
    if (
      !switchRoleModalOpen &&
      !unsavedLeaveModalOpen &&
      !mobileOverflowOpen &&
      !notifDropdownOpen &&
      !allNotifsModalOpen
    )
      return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSwitchRoleModalOpen(false);
        setUnsavedLeaveModalOpen(false);
        setMobileOverflowOpen(false);
        setNotifDropdownOpen(false);
        setAllNotifsModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    switchRoleModalOpen,
    unsavedLeaveModalOpen,
    mobileOverflowOpen,
    notifDropdownOpen,
    allNotifsModalOpen,
  ]);

  // First-login skippable walkthrough check (runs once per browser session)
  useEffect(() => {
    try {
      const seen = window.sessionStorage.getItem('apaar_tour_seen_v1');
      if (!seen) {
        window.sessionStorage.setItem('apaar_tour_seen_v1', '1');
        setTourStep(0);
        setTourActive(true);
      }
    } catch {
      // ignore storage errors
    }
  }, [setTourActive, setTourStep]);

  // Collapsible Sidebar Group States for Teacher Portal
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    school_details: true,
    all_students_group: true,
    movement_progression: true,
  });

  const isSchoolWorkspace = activeWorkspace === 'school';
  const teacherBase = isSchoolWorkspace ? '/teacher/school' : '/teacher/college';
  const mgmtBase = isSchoolWorkspace ? '/school-management' : '/college';
  const currentRole: UserRole = session.role;

  const portalHomePath =
    currentRole === 'aicte'
      ? '/aicte'
      : currentRole === 'college'
      ? mgmtBase
      : teacherBase;

  const normalizedPathname = location.pathname.replace(/\/+$/, '') || '/';
  const isDashboardHome =
    normalizedPathname === '/teacher' ||
    normalizedPathname === '/teacher/school' ||
    normalizedPathname === '/teacher/college' ||
    normalizedPathname === '/school-management' ||
    normalizedPathname === '/college' ||
    normalizedPathname === '/aicte';

  // Browser tab title updated on every page
  const readablePageName = getRouteReadableName(normalizedPathname);
  useEffect(() => {
    const titlePrefix =
      isDashboardHome && currentRole === 'teacher'
        ? isSchoolWorkspace
          ? 'School Teacher Dashboard'
          : 'College Teacher Dashboard'
        : activeBreadcrumbSuffix
        ? `${readablePageName} (${activeBreadcrumbSuffix})`
        : readablePageName;
    document.title = `${titlePrefix} - APAAR Ready`;
  }, [readablePageName, isDashboardHome, currentRole, isSchoolWorkspace, activeBreadcrumbSuffix]);

  // Check if current page is Add Student, Settings, or Import and has unsaved changes
  const isUnsavedSensitiveRoute =
    normalizedPathname.endsWith('/students/new') ||
    normalizedPathname.endsWith('/settings') ||
    normalizedPathname.endsWith('/import');

  const isAddStudentDraftDirty =
    normalizedPathname.endsWith('/students/new') &&
    Boolean(
      studentDraft.studentNameSchool.trim() ||
        studentDraft.motherName.trim() ||
        studentDraft.fatherName.trim() ||
        studentDraft.mobileNumber.trim() ||
        studentDraft.existingApaarId.trim()
    );

  const isPageDirty =
    isUnsavedSensitiveRoute &&
    (hasUnsavedChanges || localFormModified || isAddStudentDraftDirty);

  const computeBackTarget = (): string => {
    const stack = historyStackRef.current;
    for (let i = stack.length - 2; i >= 0; i--) {
      const candidate = stack[i];
      if (candidate && candidate !== location.pathname && !candidate.startsWith('/login')) {
        return candidate;
      }
    }
    return portalHomePath;
  };

  const executeBackNavigation = (targetPath: string) => {
    const stack = historyStackRef.current;
    if (stack.length > 1) {
      stack.pop();
    }
    setLocalFormModified(false);
    setHasUnsavedChanges(false);
    setUnsavedLeaveModalOpen(false);
    setPendingBackTarget(null);
    navigate(targetPath);
  };

  const handleBackButtonClick = () => {
    const target = computeBackTarget();
    if (isPageDirty) {
      setPendingBackTarget(target);
      setUnsavedLeaveModalOpen(true);
      return;
    }
    executeBackNavigation(target);
  };

  const handleConfirmSwitchRoleSignOut = () => {
    setSwitchRoleModalOpen(false);
    const nextUrl = switchRoleSignOut();
    navigate(nextUrl);
  };

  const handleQuickDemoLoginInModal = (accountKey: DemoAccountKey) => {
    const targetRoute = signInDemoAccount(accountKey);
    setSwitchRoleModalOpen(false);
    navigate(targetRoute);
  };

  const handleSidebarLogOut = () => {
    addAuditLog({
      actor: session.userName,
      role: session.roleDisplayLabel || session.designation,
      action: 'USER_LOGGED_OUT',
      targetStudentId: 'SESSION',
      details: `Signed out from ${session.institutionName}.`,
    });
    resetLoginFlow();
    setMobileDrawerOpen(false);
    navigate('/login/state');
  };

  const handleTopNlSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = topSearchInput.trim();
    setActiveNlQuery(q);
    if (!location.pathname.endsWith('/students')) {
      if (session.role === 'college') {
        navigate(`${mgmtBase}/students`);
      } else {
        navigate(`${teacherBase}/students`);
      }
    }
  };

  const handleSyncDrafts = async () => {
    if (!isOnline) return;
    setSyncingDrafts(true);
    setSyncFeedback(null);
    try {
      const res = await syncOfflineDraftsToDb(reenteredApaarMap);
      setSyncFeedback(res.message);
      setReenteredApaarMap({});
    } catch {
      setSyncFeedback('Error syncing local drafts from IndexedDB.');
    } finally {
      setSyncingDrafts(false);
    }
  };

  // Strict Role & Workspace Route Guard:
  // Role and workspace come ONLY from the login flow. Changing the URL to another workspace or role renders NotPermittedPage.
  const isRoutePermitted = React.useMemo(() => {
    const path = location.pathname;
    if (
      path === '/not-permitted' ||
      path === '/what-is-simulated' ||
      path === '/dev/health' ||
      path.endsWith('/help')
    ) {
      return true;
    }

    // 1. Check workspace cross-access
    if (isSchoolWorkspace) {
      if (
        path === '/teacher/college' ||
        path.startsWith('/teacher/college/') ||
        path === '/college' ||
        path.startsWith('/college/') ||
        path === '/aicte' ||
        path.startsWith('/aicte/')
      ) {
        return false;
      }
    } else {
      // College or AICTE workspace
      if (
        path === '/teacher/school' ||
        path.startsWith('/teacher/school/') ||
        path === '/school-management' ||
        path.startsWith('/school-management/')
      ) {
        return false;
      }
    }

    // 2. Check role cross-access
    if (session.role === 'teacher') {
      if (
        path === '/school-management' ||
        path.startsWith('/school-management/') ||
        path === '/college' ||
        path.startsWith('/college/') ||
        path === '/aicte' ||
        path.startsWith('/aicte/')
      ) {
        return false;
      }
    } else if (session.role === 'college') {
      // Management role (School Headmaster/Principal or College Management)
      if (path.startsWith('/aicte')) {
        return false;
      }
      // Allow printable student summary if opened from Management Student Records, block other /teacher routes
      if (path.startsWith('/teacher') && !path.includes('/summary')) {
        return false;
      }
    } else if (session.role === 'aicte') {
      if (
        path.startsWith('/teacher') ||
        path.startsWith('/school-management') ||
        path.startsWith('/college')
      ) {
        return false;
      }
    }

    return true;
  }, [location.pathname, isSchoolWorkspace, session.role]);

  const openRequestsCount = requests.filter(
    (r) => r.status === 'Open' || r.status === 'Under Review'
  ).length;
  const unreadNotifCount = notifications.filter((n) => !n.isRead).length;

  // Build role & workspace-specific navigation entries
  const navEntries: NavEntry[] =
    currentRole === 'teacher'
      ? [
          {
            id: 'school_dashboard',
            label: isSchoolWorkspace ? 'School Dashboard' : 'College Dashboard',
            path: teacherBase,
            icon: LayoutDashboard,
          },
          {
            id: 'school_details',
            label: isSchoolWorkspace ? 'School Details' : 'College Details',
            icon: Building2,
            children: [
              {
                label: 'Institution Profile',
                path: `${teacherBase}/profile`,
              },
              {
                label: isSchoolWorkspace
                  ? 'Classes and Sections'
                  : 'Programmes and Sections',
                path: `${teacherBase}/programmes`,
              },
              {
                label: 'Approved Intake',
                path: `${teacherBase}/intake`,
              },
            ],
          },
          {
            id: 'request_management',
            label: 'Request Management',
            path: `${teacherBase}/requests`,
            icon: ClipboardList,
            badgeText: String(openRequestsCount),
            badgeTone: 'amber',
          },
          {
            id: 'student_name_update',
            label: 'Student Name Update',
            path: `${teacherBase}/name-update`,
            icon: UserCheck,
          },
          {
            id: 'all_students_group',
            label: 'List of All Students',
            icon: Users,
            children: [
              { label: 'All Students', path: `${teacherBase}/students` },
              { label: 'Add New Student', path: `${teacherBase}/students/new` },
            ],
          },
          {
            id: 'apaar_module',
            label: 'APAAR Module',
            path: `${teacherBase}/apaar`,
            icon: IdCard,
          },
          {
            id: 'section_shift',
            label: 'Section Shift',
            path: `${teacherBase}/section-shift`,
            icon: ArrowLeftRight,
          },
          {
            id: 'movement_progression',
            label: 'Student Movement and Progression',
            icon: TrendingUp,
            children: [
              { label: 'Progression Activity', path: `${teacherBase}/progression` },
              { label: 'Import Module', path: `${teacherBase}/import` },
              { label: 'Dropbox / Inactive Student List', path: `${teacherBase}/dropbox` },
              {
                label: 'Transfer Certificate Module / Mark Dropout',
                path: `${teacherBase}/transfer-certificate`,
              },
              { label: 'Inactivate Student Module', path: `${teacherBase}/inactivate` },
            ],
          },
          {
            id: 'reporting_module',
            label: 'Reporting Module',
            path: `${teacherBase}/reporting`,
            icon: FileSpreadsheet,
            badgeText: 'NEW',
            badgeTone: 'teal',
          },
          {
            id: 'school_certification',
            label: isSchoolWorkspace ? 'School Certification' : 'College Certification',
            path: `${teacherBase}/certification`,
            icon: FileCheck2,
          },
          {
            id: 'duplicate_records',
            label: `Duplicate Records ${selectedAcademicYear}`,
            path: `${teacherBase}/duplicates`,
            icon: GitCompare,
            isAi: true,
          },
          {
            id: 'global_search',
            label: 'Global Student Search',
            path: `${teacherBase}/global-search`,
            icon: Search,
          },
          {
            id: 'validation_guide',
            label: 'Form Fields Validation Guide',
            path: `${teacherBase}/validation-guide`,
            icon: BookOpen,
          },
          {
            id: 'notifications',
            label: 'Notifications',
            path: `${teacherBase}/notifications`,
            icon: Bell,
            badgeText: unreadNotifCount > 0 ? `NEW · ${unreadNotifCount}` : 'NEW',
            badgeTone: 'red',
          },
          {
            id: 'settings_rollover',
            label: `Settings & Rollover (${selectedAcademicYear})`,
            path: `${teacherBase}/settings`,
            icon: Settings,
          },
          {
            id: 'help_support',
            label: 'Help & Support',
            path: `${teacherBase}/help`,
            icon: HelpCircle,
          },
        ]
      : currentRole === 'college'
      ? [
          {
            id: 'mgmt_1_overview',
            label: '1. Overview',
            path: mgmtBase,
            icon: LayoutDashboard,
          },
          {
            id: 'mgmt_2_profile',
            label: '2. Institution Profile',
            path: `${mgmtBase}/profile`,
            icon: Building2,
          },
          {
            id: 'mgmt_3_classes',
            label: isSchoolWorkspace ? '3. Classes and Sections' : '3. Programmes and Sections',
            path: `${mgmtBase}/classes-sections`,
            icon: Layers,
          },
          {
            id: 'mgmt_4_intake',
            label: '4. Approved Intake',
            path: `${mgmtBase}/approved-intake`,
            icon: ClipboardList,
          },
          {
            id: 'mgmt_5_admissions',
            label: '5. Student Admissions',
            path: `${mgmtBase}/admissions`,
            icon: UserPlus,
          },
          {
            id: 'mgmt_6_records',
            label: '6. Student Records',
            path: `${mgmtBase}/students`,
            icon: Users,
          },
          {
            id: 'mgmt_7_quality',
            label: '7. Data Quality',
            path: `${mgmtBase}/data-quality`,
            icon: Sparkles,
            isAi: true,
          },
          {
            id: 'mgmt_8_duplicates',
            label: `8. Duplicate Records (${selectedAcademicYear})`,
            path: `${mgmtBase}/duplicates`,
            icon: GitCompare,
          },
          {
            id: 'mgmt_9_readiness',
            label: '9. APAAR Readiness',
            path: `${mgmtBase}/apaar-readiness`,
            icon: Award,
          },
          {
            id: 'mgmt_10_verification',
            label: '10. Identity Verification',
            path: `${mgmtBase}/identity-verification`,
            icon: ShieldCheck,
          },
          {
            id: 'mgmt_11_reconciliation',
            label: '11. Admission Reconciliation',
            path: `${mgmtBase}/reconciliation`,
            icon: AlertTriangle,
          },
          {
            id: 'mgmt_12_analytics',
            label: '12. Analytics',
            path: `${mgmtBase}/analytics`,
            icon: PieChart,
          },
          {
            id: 'mgmt_13_reports',
            label: '13. Reports',
            path: `${mgmtBase}/reports`,
            icon: FileSpreadsheet,
          },
          {
            id: 'mgmt_14_staff',
            label: '14. Staff and Permissions',
            path: `${mgmtBase}/staff`,
            icon: KeyRound,
          },
          {
            id: 'mgmt_15_audit',
            label: '15. Audit Logs',
            path: `${mgmtBase}/audit-logs`,
            icon: History,
          },
          {
            id: 'mgmt_16_settings',
            label: '16. Settings',
            path: `${mgmtBase}/settings`,
            icon: Settings,
          },
        ]
      : [
          {
            id: 'aicte_kpi',
            label: 'National KPIs & States',
            path: '/aicte',
            icon: Globe,
          },
          {
            id: 'aicte_inst',
            label: 'Institution Directory (Colleges)',
            path: '/aicte/institutions',
            icon: Building2,
          },
          {
            id: 'aicte_adv',
            label: 'Intake Governance Advisories',
            path: '/aicte/advisories',
            icon: AlertTriangle,
          },
          {
            id: 'aicte_std',
            label: 'Policy & Schema Standards',
            path: '/aicte/standards',
            icon: SlidersHorizontal,
          },
          {
            id: 'dev_health',
            label: 'System & Supabase Health (/dev/health)',
            path: '/dev/health',
            icon: Database,
          },
        ];

  const roleMeta =
    currentRole === 'teacher'
      ? {
          title: isSchoolWorkspace
            ? 'School Teacher / Nodal Portal'
            : 'College Staff / Nodal Portal',
          subtitle: session.institutionName,
        }
      : currentRole === 'college'
      ? {
          title: isSchoolWorkspace
            ? 'School Management (Headmaster / Principal)'
            : 'College Management Portal',
          subtitle: `${session.institutionName} · ${
            isSchoolWorkspace ? 'Class 1–12 Governance' : 'Programme Intake Governance'
          }`,
        }
      : ROLE_LABELS.aicte;

  const toggleGroup = (groupId: string) => {
    setOpenGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  // Compute Breadcrumbs for Inner Pages
  const breadcrumbs = React.useMemo(() => {
    if (isDashboardHome) return [];

    const dashboardLabel =
      currentRole === 'teacher'
        ? isSchoolWorkspace
          ? 'School Dashboard'
          : 'College Dashboard'
        : currentRole === 'college'
        ? isSchoolWorkspace
          ? 'School Management'
          : 'College Management'
        : 'AICTE Monitoring';

    const crumbs: { label: string; path?: string }[] = [
      { label: dashboardLabel, path: portalHomePath },
    ];

    // Check if current path matches a navEntry or child
    for (const entry of navEntries) {
      if (entry.children) {
        const matchedChild = entry.children.find((c) => c.path === normalizedPathname);
        if (matchedChild) {
          // For "List of All Students > All Students", keep breadcrumb concise as "School Dashboard > All Students"
          if (entry.id !== 'all_students_group') {
            crumbs.push({ label: entry.label });
          } else if (matchedChild.path.endsWith('/students/new')) {
            crumbs.push({ label: 'All Students', path: `${teacherBase}/students` });
          }
          crumbs.push({
            label: matchedChild.label,
            path: activeBreadcrumbSuffix ? matchedChild.path : undefined,
          });
          if (activeBreadcrumbSuffix) {
            crumbs.push({ label: activeBreadcrumbSuffix });
          }
          return crumbs;
        }
      } else if (entry.path === normalizedPathname) {
        crumbs.push({
          label: entry.label.replace(/^\d+\.\s*/, ''),
          path: activeBreadcrumbSuffix ? entry.path : undefined,
        });
        if (activeBreadcrumbSuffix) {
          crumbs.push({ label: activeBreadcrumbSuffix });
        }
        return crumbs;
      }
    }

    // Fallback for dynamic routes like /teacher/school/students/:id/summary
    if (normalizedPathname.includes('/students/') && normalizedPathname.endsWith('/summary')) {
      crumbs.push({
        label: currentRole === 'college' ? 'Student Records' : 'All Students',
        path: currentRole === 'college' ? `${mgmtBase}/students` : `${teacherBase}/students`,
      });
      crumbs.push({ label: 'Printable Student Summary Card' });
      return crumbs;
    }

    crumbs.push({ label: readablePageName });
    if (activeBreadcrumbSuffix) {
      crumbs.push({ label: activeBreadcrumbSuffix });
    }
    return crumbs;
  }, [
    isDashboardHome,
    currentRole,
    isSchoolWorkspace,
    portalHomePath,
    navEntries,
    normalizedPathname,
    activeBreadcrumbSuffix,
    teacherBase,
    mgmtBase,
    readablePageName,
  ]);

  // Class / Programme options for the Teacher Context Bar
  const contextClassOrProgrammes = React.useMemo(() => {
    const set = new Set<string>();
    programmes.forEach((p) => set.add(p.programmeName));
    workspaceStudents.forEach((s) => set.add(s.programme));
    return Array.from(set);
  }, [programmes, workspaceStudents]);

  // Shared Sidebar Content rendered in Desktop Aside (lg:flex) and Mobile Drawer (<1024px)
  const renderSidebarContent = (isMobileDrawer = false) => {
    const isCollapsed = !isMobileDrawer && sidebarCollapsed;

    return (
      <div className="flex flex-col h-full justify-between bg-[var(--sidebar-bg)] text-[var(--sidebar-text)] select-none">
        {/* Top Fixed Brand + Desktop Collapse Toggle / Mobile Close Button */}
        <div className="shrink-0">
          <div
            className={`border-b border-[var(--sidebar-border)] flex items-center ${
              isCollapsed ? ' flex-col gap-2 py-3 px-2' : 'justify-between gap-2 px-4 py-3.5'
            }`}
          >
            <Link
              to="/"
              onClick={() => setMobileDrawerOpen(false)}
              title="APAAR Ready Home"
              className="flex items-center gap-2.5 min-w-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded"
            >
              <div className="w-8 h-8 rounded-md bg-white flex items-center justify-center text-[#1D4ED8] font-display font-bold text-sm shrink-0 shadow-xs">
                AR
              </div>
              {!isCollapsed && (
                <div className="min-w-0">
                  <div className="font-display font-bold text-base tracking-tight text-white leading-none truncate">
                    APAAR Ready
                  </div>
                  <div className="text-[11px] text-[var(--sidebar-text-muted)] mt-1 truncate">
                    {session.state} · {isSchoolWorkspace ? 'School' : 'College'} Workspace
                  </div>
                </div>
              )}
            </Link>

            {isMobileDrawer ? (
              <button
                type="button"
                onClick={() => setMobileDrawerOpen(false)}
                aria-label="Close navigation menu"
                className="p-1.5 rounded-md text-white hover:bg-[var(--sidebar-hover-bg)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <X className="w-5 h-5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={toggleSidebarCollapsed}
                aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar to icons'}
                title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar to icons'}
                className="p-1.5 rounded-md text-white hover:bg-[var(--sidebar-hover-bg)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white shrink-0"
              >
                {isCollapsed ? (
                  <PanelLeftOpen className="w-4 h-4" />
                ) : (
                  <PanelLeftClose className="w-4 h-4" />
                )}
              </button>
            )}
          </div>

          {/* Mobile Context Selector inside Sidebar Drawer when in Teacher Role */}
          {isMobileDrawer && currentRole === 'teacher' && (
            <div className="px-4 py-3 border-b border-[var(--sidebar-border)] bg-[var(--sidebar-footer-bg)] space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-white">
                  Class / Section Context
                </span>
                <span className="text-[10px] font-mono text-[var(--sidebar-text-muted)]">
                  {selectedAcademicYear}
                </span>
              </div>
              <div className="text-[11px] text-[var(--sidebar-text-muted)]">
                You can see: <strong className="text-white">{assignedTeacherScopeLabel}</strong>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <select
                  aria-label="Mobile Context Class or Programme"
                  value={teacherContext.classOrProgramme}
                  onChange={(e) =>
                    setTeacherContext((prev) => ({
                      ...prev,
                      classOrProgramme: e.target.value,
                    }))
                  }
                  className="rounded bg-[var(--sidebar-bg)] border border-blue-400/50 px-2 py-1 text-[11px] text-white"
                >
                  <option value="Show all">
                    All {isSchoolWorkspace ? 'Classes' : 'Programmes'}
                  </option>
                  {contextClassOrProgrammes.map((cp) => (
                    <option key={cp} value={cp}>
                      {cp}
                    </option>
                  ))}
                </select>
                <select
                  aria-label="Mobile Context Section"
                  value={teacherContext.section}
                  onChange={(e) =>
                    setTeacherContext((prev) => ({
                      ...prev,
                      section: e.target.value,
                    }))
                  }
                  className="rounded bg-[var(--sidebar-bg)] border border-blue-400/50 px-2 py-1 text-[11px] text-white"
                >
                  <option value="Show all">All Sections</option>
                  <option value="Section A">Section A</option>
                  <option value="Section B">Section B</option>
                  <option value="Section C">Section C</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Independently Scrollable Menu List (Hidden scrollbar; labels wrap up to 2 lines and never clip) */}
        <nav
          aria-label="Portal Sidebar Navigation"
          tabIndex={0}
          className={`flex-1 min-h-0 overflow-y-auto sidebar-scroll-hidden py-3 space-y-1 focus:outline-none ${
            isCollapsed ? 'px-2' : 'px-3'
          }`}
        >
          {!isCollapsed && (
            <div className="px-2.5 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--sidebar-text-muted)] break-words whitespace-normal">
              {roleMeta.title}
            </div>
          )}

          {navEntries.map((item) => {
            const Icon = item.icon;

            // Collapsible Group Entry
            if (item.children && item.children.length > 0) {
              const isGroupOpen = !!openGroups[item.id];
              const hasActiveChild = item.children.some(
                (c) => location.pathname === c.path
              );

              if (isCollapsed) {
                return (
                  <button
                    key={item.id}
                    type="button"
                    title={`${item.label} (Click to expand)`}
                    aria-label={item.label}
                    onClick={() => {
                      setSidebarCollapsed(false);
                      try {
                        window.sessionStorage.setItem('apaar_sidebar_collapsed', '0');
                      } catch {
                        // ignore
                      }
                      setOpenGroups((prev) => ({ ...prev, [item.id]: true }));
                    }}
                    className={`w-full flex items-center justify-center p-2.5 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                      hasActiveChild
                        ? 'bg-[var(--sidebar-active-bg)] border-l-4 border-[var(--sidebar-active-border)] text-white font-semibold'
                        : 'text-white hover:bg-[var(--sidebar-hover-bg)] border-l-4 border-transparent'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0 text-white" />
                  </button>
                );
              }

              return (
                <div key={item.id} className="space-y-0.5">
                  <button
                    type="button"
                    onClick={() => toggleGroup(item.id)}
                    className={`w-full flex items-start justify-between gap-2 px-2.5 py-2 rounded-md text-left text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                      hasActiveChild
                        ? 'bg-[var(--sidebar-active-bg)] border-l-4 border-[var(--sidebar-active-border)] text-white font-semibold'
                        : 'text-white hover:bg-[var(--sidebar-hover-bg)] border-l-4 border-transparent'
                    }`}
                  >
                    <span className="flex items-start gap-2.5 min-w-0">
                      <Icon className="w-4 h-4 shrink-0 mt-0.5 text-white" />
                      <span className="leading-snug line-clamp-2 break-words whitespace-normal">
                        {item.label}
                      </span>
                    </span>
                    {isGroupOpen ? (
                      <ChevronDown className="w-4 h-4 shrink-0 mt-0.5 text-white" />
                    ) : (
                      <ChevronRight className="w-4 h-4 shrink-0 mt-0.5 text-white" />
                    )}
                  </button>

                  {isGroupOpen && (
                    <div className="pl-5 pr-1 py-0.5 space-y-0.5 border-l border-blue-400/50 ml-3.5">
                      {item.children.map((sub) => {
                        const isSubActive = location.pathname === sub.path;
                        return (
                          <Link
                            key={sub.path}
                            to={sub.path}
                            onClick={() => setMobileDrawerOpen(false)}
                            className={`block px-2.5 py-1.5 rounded text-xs leading-snug line-clamp-2 break-words whitespace-normal transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                              isSubActive
                                ? 'bg-[var(--sidebar-active-bg)] border-l-4 border-[var(--sidebar-active-border)] text-white font-semibold'
                                : 'text-white hover:bg-[var(--sidebar-hover-bg)] border-l-4 border-transparent'
                            }`}
                          >
                            {sub.label}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            // Single Direct Link Entry
            const isActive = location.pathname === item.path;

            if (isCollapsed) {
              return (
                <Link
                  key={item.id}
                  to={item.path || teacherBase}
                  title={item.label}
                  aria-label={item.label}
                  className={`relative flex items-center justify-center p-2.5 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                    isActive
                      ? 'bg-[var(--sidebar-active-bg)] border-l-4 border-[var(--sidebar-active-border)] text-white font-semibold'
                      : 'text-white hover:bg-[var(--sidebar-hover-bg)] border-l-4 border-transparent'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0 text-white" />
                  {item.badgeText && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-white" />
                  )}
                </Link>
              );
            }

            return (
              <Link
                key={item.id}
                to={item.path || teacherBase}
                onClick={() => setMobileDrawerOpen(false)}
                className={`flex items-start justify-between gap-2 px-2.5 py-2 rounded-md text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                  isActive
                    ? 'bg-[var(--sidebar-active-bg)] border-l-4 border-[var(--sidebar-active-border)] text-white font-semibold'
                    : 'text-white hover:bg-[var(--sidebar-hover-bg)] border-l-4 border-transparent'
                }`}
              >
                <span className="flex items-start gap-2.5 min-w-0">
                  <Icon className="w-4 h-4 shrink-0 mt-0.5 text-white" />
                  <span className="leading-snug line-clamp-2 break-words whitespace-normal">
                    {item.label}
                  </span>
                </span>

                {item.badgeText && (
                  <span
                    className={`text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded shrink-0 ${
                      item.badgeTone === 'red'
                        ? 'bg-red-600 text-white'
                        : item.badgeTone === 'teal'
                        ? 'bg-teal-600 text-white'
                        : 'bg-white/20 text-white border border-white/30'
                    }`}
                  >
                    {item.badgeText}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Pinned Bottom Profile Block (Name, Role, Workspace Badge, Institution, Log out, Demo Logins) */}
        <div
          className={`shrink-0 border-t border-[var(--sidebar-border)] bg-[var(--sidebar-footer-bg)] ${
            isCollapsed ? 'p-2 space-y-2 flex flex-col items-center' : 'p-3.5 space-y-2.5'
          }`}
        >
          {isCollapsed ? (
            <>
              <div
                title={`${session.userName} · ${session.designation} · ${session.institutionName}`}
                className="w-8 h-8 rounded-full bg-[var(--sidebar-bg)] border border-white/30 flex items-center justify-center text-[11px] font-bold text-white"
              >
                {session.userName
                  .split(' ')
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join('')}
              </div>
              <button
                type="button"
                onClick={handleSidebarLogOut}
                title="Log out"
                aria-label="Log out"
                className="p-2 rounded-md text-white bg-[var(--sidebar-bg)] hover:bg-[var(--sidebar-hover-bg)] border border-white/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <LogOut className="w-4 h-4" />
              </button>
              <Link
                to="/demo-credentials"
                title="Demo Logins Directory"
                aria-label="Demo Logins Directory"
                className="p-2 rounded-md text-white bg-[var(--sidebar-bg)] hover:bg-[var(--sidebar-hover-bg)] border border-white/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <KeyRound className="w-4 h-4" />
              </Link>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between gap-2">
                <div className="text-[11px] text-[var(--sidebar-text-muted)] flex items-center gap-1.5 min-w-0">
                  <ShieldCheck className="w-3.5 h-3.5 text-white shrink-0" />
                  <span className="truncate">IDs Masked (Last 3)</span>
                </div>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold border shrink-0 bg-white text-[#1D4ED8] border-white">
                  {isSchoolWorkspace ? 'School' : 'College'}
                </span>
              </div>

              <div className="pt-2 border-t border-white/15 space-y-2">
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-white break-words">
                    {session.userName}
                  </div>
                  <div className="text-[11px] text-[var(--sidebar-text-muted)] break-words">
                    {session.designation}
                  </div>
                  <div className="text-[10px] text-blue-200 break-words mt-0.5">
                    {session.institutionName}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleSidebarLogOut}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-white bg-[var(--sidebar-bg)] hover:bg-[var(--sidebar-hover-bg)] border border-white/25 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Log out</span>
                  </button>
                  <Link
                    to="/demo-credentials"
                    onClick={() => setMobileDrawerOpen(false)}
                    title="Demo Accounts Directory"
                    className="px-2.5 py-1.5 text-[11px] font-mono font-semibold text-[#1D4ED8] bg-white hover:bg-blue-50 border border-white rounded-md transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  >
                    Demo Logins
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900 overflow-x-hidden">
      {/* Compact Demo Data Banner (1 short line on phones with Info Popover; full line on desktop) */}
      <div className="relative bg-[#0B1F3A] border-b border-slate-700/80 text-slate-200 px-3 sm:px-4 lg:px-6 py-1.5 text-xs">
        <div className="flex items-center justify-between gap-2">
          {/* Mobile / Tablet Short Single Line */}
          <div className="flex items-center gap-1.5 min-w-0 lg:hidden">
            <span className="font-semibold text-amber-300 shrink-0">Demo data</span>
            <span aria-hidden="true" className="shrink-0">·</span>
            <span className="truncate text-slate-200">
              Simulated Verification only
            </span>
          </div>

          {/* Desktop Full Line */}
          <div className="hidden lg:flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-amber-300">Demo data</span>
            <span aria-hidden="true">·</span>
            <span>
              All student PENs, APAAR IDs, and institutions in this environment are 100% synthetic.
            </span>
            <span aria-hidden="true">·</span>
            <span className="text-teal-300">
              Statuses represent Simulated Verification or Pending Official Verification only.
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="hidden xl:inline text-slate-300">
              No auto-merge or record deletion
            </span>
            <button
              type="button"
              onClick={() => setDemoInfoOpen(!demoInfoOpen)}
              aria-label="Demo data & privacy rules"
              className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-300 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 rounded"
            >
              <Info className="w-3.5 h-3.5" />
              <span className="lg:hidden">Info</span>
            </button>
          </div>
        </div>

        {/* Info Popover for full explanation on small screens */}
        {demoInfoOpen && (
          <div className="mt-2 p-3 rounded-md bg-slate-900 border border-slate-700 text-xs text-slate-200 space-y-1.5 shadow-lg">
            <div className="flex items-center justify-between font-semibold text-amber-300">
              <span>Synthetic Demo Environment Safeguards</span>
              <button
                type="button"
                onClick={() => setDemoInfoOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="leading-relaxed text-[11px]">
              All student records, PEN numbers, APAAR IDs, and institutions are 100% synthetic.
              Verification statuses strictly denote <strong>Simulated Verification</strong> or{' '}
              <strong>Pending Official Verification</strong>. Records are never auto-merged or
              deleted.
            </p>
          </div>
        )}
      </div>

      {/* Mobile / Tablet Overlay Drawer (<1024px) */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex h-[100dvh]">
          {/* Dark Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-[1px]"
            onClick={() => setMobileDrawerOpen(false)}
            aria-hidden="true"
          />
          {/* Drawer Container */}
          <aside className="relative z-10 w-72 max-w-[85vw] h-[100dvh] bg-[var(--sidebar-bg)] shadow-xl flex flex-col">
            {renderSidebarContent(true)}
          </aside>
        </div>
      )}

      <div className="flex-1 flex min-h-0 min-w-0 items-stretch">
        {/* Desktop Permanent Sidebar: Full viewport height (sticky top-0 h-[100dvh]) with internal scroll & session collapse */}
        <aside
          className={`hidden lg:flex shrink-0 border-r border-[var(--sidebar-border)] flex-col h-[100dvh] sticky top-0 bg-[var(--sidebar-bg)] overflow-hidden transition-[width] duration-150 ${
            sidebarCollapsed ? 'w-16' : 'w-72'
          }`}
        >
          {renderSidebarContent(false)}
        </aside>

        {/* Main Workspace Container (Full width on phones, min-w-0 to prevent horizontal overflow) */}
        <div className="flex-1 flex flex-col min-w-0 max-w-full">
          {/* Top Bar */}
          <header className="bg-white border-b border-slate-200 px-3 sm:px-4 lg:px-8 py-2.5 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              {/* Left: Hamburger + Portal Title + Workspace Badge */}
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <button
                  type="button"
                  onClick={() => setMobileDrawerOpen(true)}
                  aria-label="Open navigation menu"
                  className="lg:hidden p-1.5 -ml-1 rounded-md text-[#0B1F3A] hover:bg-slate-100 transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B1F3A]"
                >
                  <Menu className="w-5 h-5" />
                </button>

                <div className="min-w-0">
                  <div className="font-display font-bold text-xs sm:text-base text-[#0B1F3A] flex items-center gap-1.5 min-w-0">
                    <span className="truncate">{roleMeta.title}</span>
                    <span
                      className={`inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-mono font-bold border shrink-0 ${
                        isSchoolWorkspace
                          ? 'bg-teal-50 text-teal-800 border-teal-300'
                          : 'bg-indigo-50 text-indigo-800 border-indigo-300'
                      }`}
                    >
                      {isSchoolWorkspace ? 'School' : 'College'}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 truncate hidden md:block">
                    {roleMeta.subtitle} · State: {session.state}
                  </div>
                </div>
              </div>

              {/* Right Controls: Consistent order (Year selector, Online status, Demo Guide, Drafts, Back, Switch role) */}
              <div className="flex flex-wrap items-center justify-end gap-1.5 sm:gap-2 shrink-0">
                {/* 1. Academic Year Selector */}
                <div className="inline-flex items-center gap-1 bg-slate-100 border border-slate-300 rounded-md px-1.5 sm:px-2 py-1 text-xs">
                  <Calendar className="w-3.5 h-3.5 text-[#0B1F3A] shrink-0 hidden sm:inline" />
                  <select
                    aria-label="Select Academic Year"
                    value={selectedAcademicYear}
                    onChange={(e) => setSelectedAcademicYear(e.target.value)}
                    className="bg-transparent font-mono font-bold text-[#0B1F3A] text-[11px] sm:text-xs focus:outline-none cursor-pointer max-w-[92px] sm:max-w-none truncate"
                  >
                    {Object.values(academicYearsMeta).map((yr) => (
                      <option key={yr.code} value={yr.code}>
                        {yr.selectorLabel}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Online Status Indicator + Demo Toggle */}
                <button
                  type="button"
                  onClick={() => setSimulateOffline(!simulateOffline)}
                  aria-label={isOnline ? 'Online status: Online' : 'Offline Mode (Simulated)'}
                  title="Click to toggle Simulated Offline Mode for testing IndexedDB local drafts"
                  className={`inline-flex items-center gap-1 px-2 py-1 text-[11px] sm:text-xs font-semibold rounded-md border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 ${
                    isOnline
                      ? 'border-teal-200 bg-teal-50 text-teal-800 hover:bg-teal-100'
                      : 'border-amber-300 bg-amber-100 text-amber-950 hover:bg-amber-200'
                  }`}
                >
                  {isOnline ? (
                    <>
                      <Wifi className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                      <span>Online</span>
                    </>
                  ) : (
                    <>
                      <WifiOff className="w-3.5 h-3.5 text-amber-800 shrink-0" />
                      <span className="hidden sm:inline">Offline Mode</span>
                      <span className="sm:hidden">Offline</span>
                    </>
                  )}
                </button>

                {/* 3. Demo Guide Button (Visible on >=640px, in overflow menu on phones) */}
                <button
                  type="button"
                  onClick={() => setDemoGuideOpen(!demoGuideOpen)}
                  className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                >
                  <Compass className="w-3.5 h-3.5 shrink-0" />
                  <span>Demo Guide</span>
                </button>

                {/* 4. Drafts Waiting to Sync Button */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setDraftsPopoverOpen(!draftsPopoverOpen)}
                    aria-label={`Drafts waiting to sync (${offlineDrafts.length})`}
                    className={`inline-flex items-center gap-1 px-2 py-1 text-[11px] sm:text-xs font-medium rounded-md border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                      offlineDrafts.length > 0
                        ? 'border-indigo-300 bg-indigo-50 text-indigo-900 font-semibold'
                        : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Database className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span className="hidden xl:inline">Drafts waiting to sync</span>
                    <span className="xl:hidden">Drafts</span>
                    <span className="font-mono font-bold px-1 rounded bg-white border border-slate-200 text-[10px]">
                      {offlineDrafts.length}
                    </span>
                  </button>

                  {draftsPopoverOpen && (
                    <div
                      role="dialog"
                      aria-label="Offline Drafts Waiting to Sync"
                      className="absolute right-0 mt-2 w-80 sm:w-96 max-w-[calc(100vw-1.5rem)] bg-white border border-slate-200 rounded-lg shadow-xl p-4 z-50 text-xs space-y-3"
                    >
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <div className="font-display font-bold text-sm text-[#0B1F3A] flex items-center gap-1.5">
                          <Database className="w-4 h-4 text-indigo-600" />
                          <span>IndexedDB Local Drafts ({offlineDrafts.length})</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setDraftsPopoverOpen(false)}
                          className="text-slate-400 hover:text-slate-700"
                          aria-label="Close drafts panel"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="p-2.5 rounded bg-slate-50 border border-slate-200 text-[11px] text-slate-600 leading-relaxed">
                        <strong className="text-slate-900">What is stored locally:</strong> Browser
                        IndexedDB stores only non-sensitive form fields (Name, Gender, DOB,
                        Class/Programme, Section).{' '}
                        <strong className="text-teal-800">
                          Full Aadhaar, PEN, and APAAR numbers are never stored on your device
                        </strong>{' '}
                        and are requested again at sync if needed.
                      </div>

                      {syncFeedback && (
                        <div className="p-2.5 rounded bg-teal-50 border border-teal-200 text-teal-900 text-[11px] font-medium">
                          {syncFeedback}
                        </div>
                      )}

                      {offlineDrafts.length === 0 ? (
                        <div className="py-4 text-center text-slate-500">
                          No local drafts waiting to sync. Typing in Add New Student automatically
                          saves a local backup in IndexedDB.
                        </div>
                      ) : (
                        <div className="max-h-56 overflow-y-auto space-y-2 divide-y divide-slate-100">
                          {offlineDrafts.map((d) => (
                            <div key={d.draftId} className="pt-2 first:pt-0 space-y-1.5">
                              <div className="flex items-center justify-between">
                                <span className="font-semibold text-slate-900">
                                  {d.nonSensitiveData.studentNameSchool || 'Unnamed Student Draft'}
                                </span>
                                <span className="font-mono text-[10px] text-slate-500">
                                  Saved {d.updatedAt} (Step {d.step})
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-600">
                                {d.nonSensitiveData.programmeName} · {d.nonSensitiveData.section}
                              </div>

                              {d.requiresSensitiveReentry && (
                                <div className="pt-1">
                                  <label className="block text-[10px] font-semibold text-amber-800 mb-1">
                                    Re-enter 12-digit fictional APAAR ID for sync (not stored on
                                    device):
                                  </label>
                                  <input
                                    type="text"
                                    maxLength={12}
                                    value={reenteredApaarMap[d.draftId] || ''}
                                    onChange={(e) =>
                                      setReenteredApaarMap((prev) => ({
                                        ...prev,
                                        [d.draftId]: e.target.value.replace(/\D/g, ''),
                                      }))
                                    }
                                    placeholder="12-digit fictional APAAR ID"
                                    className="w-full rounded border border-amber-300 px-2.5 py-1 text-xs font-mono"
                                  />
                                </div>
                              )}

                              <div className="flex items-center gap-2 pt-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setStudentDraft({
                                      ...d.nonSensitiveData,
                                      existingApaarId: '',
                                      aadhaarAvailabilityInput: '',
                                      aadhaarOptional: '',
                                    });
                                    setDraftsPopoverOpen(false);
                                    navigate(`${teacherBase}/students/new`);
                                  }}
                                  className="text-[11px] font-semibold text-indigo-700 hover:underline"
                                >
                                  Resume in Form &rarr;
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="pt-2 border-t border-slate-200 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={clearOfflineDrafts}
                          disabled={offlineDrafts.length === 0}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded border border-red-200 text-red-700 hover:bg-red-50 text-[11px] font-semibold disabled:opacity-40"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Clear local drafts</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleSyncDrafts}
                          disabled={!isOnline || offlineDrafts.length === 0 || syncingDrafts}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#0B1F3A] text-white hover:bg-slate-800 text-[11px] font-semibold disabled:opacity-40"
                        >
                          <RefreshCw
                            className={`w-3.5 h-3.5 ${syncingDrafts ? 'animate-spin' : ''}`}
                          />
                          <span>
                            {!isOnline
                              ? 'Reconnect to Sync'
                              : syncingDrafts
                              ? 'Syncing...'
                              : 'Sync drafts'}
                          </span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* 4B. Notification Bell in Top Bar (Unread Count + Dropdown of Latest 5 + Mark All Read + View All) */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setNotifDropdownOpen(!notifDropdownOpen);
                      setDraftsPopoverOpen(false);
                    }}
                    aria-label={`Notifications (${unreadNotifCount} unread)`}
                    aria-expanded={notifDropdownOpen}
                    className={`relative inline-flex items-center justify-center p-1.5 sm:px-2.5 sm:py-1 rounded-md border text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B1F3A] ${
                      unreadNotifCount > 0
                        ? 'border-blue-300 bg-blue-50 text-blue-900'
                        : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Bell className="w-4 h-4 text-[#0B1F3A] shrink-0" />
                    {unreadNotifCount > 0 && (
                      <span
                        aria-hidden="true"
                        className="ml-1 inline-flex items-center justify-center px-1.5 py-0.2 rounded-full bg-red-600 text-white font-mono text-[10px] font-bold leading-tight"
                      >
                        {unreadNotifCount}
                      </span>
                    )}
                  </button>

                  {notifDropdownOpen && (
                    <div
                      role="dialog"
                      aria-label="Latest Notifications"
                      className="absolute right-0 mt-2 w-80 sm:w-96 max-w-[calc(100vw-1.5rem)] bg-white border border-slate-200 rounded-lg shadow-xl z-50 text-xs overflow-hidden"
                    >
                      <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-2">
                        <div className="font-display font-bold text-sm text-[#0B1F3A] flex items-center gap-1.5">
                          <Bell className="w-4 h-4 text-blue-700" />
                          <span>Notifications</span>
                          {unreadNotifCount > 0 && (
                            <span className="px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-900 font-mono text-[10px] font-bold">
                              {unreadNotifCount} unread
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          disabled={unreadNotifCount === 0}
                          onClick={() => {
                            markAllNotificationsRead();
                            addToast('All notifications marked as read.', 'info');
                          }}
                          className="text-[11px] font-semibold text-blue-700 hover:underline disabled:opacity-40 disabled:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded px-1"
                        >
                          Mark all as read
                        </button>
                      </div>

                      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                        {notifications.slice(0, 5).map((n) => (
                          <div
                            key={n.id}
                            onClick={() => {
                              if (!n.isRead) {
                                markNotificationRead(n.id);
                              }
                            }}
                            className={`p-3.5 transition-colors cursor-pointer flex items-start gap-2.5 ${
                              !n.isRead
                                ? 'bg-blue-50/50 hover:bg-blue-50'
                                : 'bg-white hover:bg-slate-50'
                            }`}
                          >
                            {/* Unread Dot */}
                            <span
                              aria-label={!n.isRead ? 'Unread notification' : 'Read notification'}
                              className={`w-2 h-2 rounded-full shrink-0 mt-1.5 ${
                                !n.isRead ? 'bg-blue-600' : 'bg-transparent'
                              }`}
                            />
                            <div className="min-w-0 flex-1 space-y-0.5">
                              <div className="flex items-center justify-between gap-2 text-[10px] font-mono text-slate-500">
                                <span>{n.category}</span>
                                <span>{n.timestamp}</span>
                              </div>
                              <div className="font-display font-semibold text-xs text-[#0B1F3A] leading-snug">
                                {n.title}
                              </div>
                              <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                                {n.message}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => {
                            setNotifDropdownOpen(false);
                            if (currentRole === 'teacher') {
                              navigate(`${teacherBase}/notifications`);
                            } else {
                              setAllNotifsModalOpen(true);
                            }
                          }}
                          className="text-xs font-semibold text-[#0B1F3A] hover:text-blue-700 inline-flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded px-1"
                        >
                          <span>View all ({notifications.length})</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setNotifDropdownOpen(false)}
                          className="text-[11px] font-medium text-slate-500 hover:text-slate-800"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* 5. Back Button (Hidden on Dashboard Home; visible on phones & desktop) */}
                {!isDashboardHome && (
                  <button
                    type="button"
                    onClick={handleBackButtonClick}
                    aria-label="Go back to previous page"
                    title="Go back to previous page"
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] sm:text-xs font-semibold rounded-md border border-slate-300 bg-white text-[#0B1F3A] hover:bg-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B1F3A]"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 shrink-0" />
                    <span>Back</span>
                  </button>
                )}

                {/* 6. Switch Role Button (Visible on >=640px; moves into overflow menu on phones) */}
                <button
                  type="button"
                  onClick={() => setSwitchRoleModalOpen(true)}
                  aria-label="Switch role"
                  className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md border border-[#0B1F3A]/20 bg-slate-100 text-[#0B1F3A] hover:bg-slate-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B1F3A]"
                >
                  <KeyRound className="w-3.5 h-3.5 shrink-0" />
                  <span>Switch role</span>
                </button>

                {/* Mask/Reveal IDs Button (Desktop/Tablet) */}
                <button
                  type="button"
                  onClick={() => setGlobalUnmask(!globalUnmask)}
                  aria-label={globalUnmask ? 'Mask All PEN & APAAR IDs' : 'Reveal IDs'}
                  className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B1F3A]"
                >
                  {globalUnmask ? (
                    <>
                      <EyeOff className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>Mask IDs</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>Reveal IDs</span>
                    </>
                  )}
                </button>

                {/* Phone Top-Bar Overflow Menu (<640px) containing Switch role, Demo Guide, and Reveal IDs */}
                <div className="relative sm:hidden">
                  <button
                    type="button"
                    onClick={() => setMobileOverflowOpen(!mobileOverflowOpen)}
                    aria-label="More top bar actions"
                    aria-expanded={mobileOverflowOpen}
                    className="inline-flex items-center justify-center p-1.5 rounded-md border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B1F3A]"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  {mobileOverflowOpen && (
                    <div
                      role="menu"
                      aria-label="More actions"
                      className="absolute right-0 mt-1.5 w-52 bg-white border border-slate-200 rounded-lg shadow-xl py-1.5 z-50 text-xs"
                    >
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setMobileOverflowOpen(false);
                          setSwitchRoleModalOpen(true);
                        }}
                        className="w-full px-3.5 py-2 text-left font-semibold text-[#0B1F3A] hover:bg-slate-50 flex items-center gap-2"
                      >
                        <KeyRound className="w-3.5 h-3.5 text-teal-700" />
                        <span>Switch role</span>
                      </button>
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setMobileOverflowOpen(false);
                          setDemoGuideOpen(true);
                        }}
                        className="w-full px-3.5 py-2 text-left font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <Compass className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Demo Guide</span>
                      </button>
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setGlobalUnmask(!globalUnmask);
                          setMobileOverflowOpen(false);
                        }}
                        className="w-full px-3.5 py-2 text-left font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                      >
                        {globalUnmask ? (
                          <>
                            <EyeOff className="w-3.5 h-3.5 text-amber-600" />
                            <span>Mask All IDs</span>
                          </>
                        ) : (
                          <>
                            <Eye className="w-3.5 h-3.5 text-slate-500" />
                            <span>Reveal IDs (Last 3 Default)</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Natural-Language Search Bar in Top Bar */}
            <form
              onSubmit={handleTopNlSearchSubmit}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1.5 border-t border-slate-100"
            >
              <div className="relative flex-1 min-w-0">
                <Search className="w-3.5 h-3.5 text-indigo-600 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={topSearchInput}
                  onChange={(e) => setTopSearchInput(e.target.value)}
                  placeholder='Search by name, roll number, class, programme or institution (e.g. "students in class 5 with no APAAR ID")...'
                  aria-label="Natural-language student search"
                  className="w-full pl-8 pr-8 py-1.5 rounded-md border border-slate-300 bg-slate-50/70 text-xs text-slate-900 focus:bg-white focus:border-[#0B1F3A] focus:outline-none"
                />
                {topSearchInput && (
                  <button
                    type="button"
                    onClick={() => {
                      setTopSearchInput('');
                      setActiveNlQuery('');
                    }}
                    aria-label="Clear search query"
                    className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-700"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-md bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                >
                  Search Records
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const sample = isSchoolWorkspace
                      ? 'students in class 5 with no APAAR ID'
                      : 'CSE students with consent pending';
                    setTopSearchInput(sample);
                    setActiveNlQuery(sample);
                    if (!location.pathname.endsWith('/students')) {
                      navigate(
                        currentRole === 'college'
                          ? `${mgmtBase}/students`
                          : `${teacherBase}/students`
                      );
                    }
                  }}
                  className="hidden xl:inline-flex px-2.5 py-1.5 rounded-md border border-slate-200 bg-slate-50 text-[11px] text-slate-600 hover:bg-slate-100 whitespace-nowrap"
                >
                  Try: &ldquo;
                  {isSchoolWorkspace
                    ? 'students in class 5 with no APAAR ID'
                    : 'CSE students with consent pending'}
                  &rdquo;
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSimLoading(true);
                    setTimeout(() => setSimLoading(false), 900);
                  }}
                  title="Test Loading Skeleton State"
                  className="hidden xl:inline-flex px-2 py-1.5 rounded-md border border-slate-200 bg-white text-[11px] text-slate-600 hover:bg-slate-50 whitespace-nowrap"
                >
                  Skeleton
                </button>
                <button
                  type="button"
                  onClick={() => setSimError(!simError)}
                  title="Test Error State with Retry Button"
                  className="hidden xl:inline-flex px-2 py-1.5 rounded-md border border-slate-200 bg-white text-[11px] text-slate-600 hover:bg-slate-50 whitespace-nowrap"
                >
                  {simError ? 'Clear Error' : 'Test Error'}
                </button>
              </div>
            </form>
          </header>

          {/* 4. TEACHER CONTEXT BAR & ASSIGNED CLASS SCOPE (Shown at the top of Teacher pages) */}
          {currentRole === 'teacher' && isRoutePermitted && (
            <div
              role="region"
              aria-label="Teacher Context Bar"
              className="bg-slate-100 border-b border-slate-200 px-3 sm:px-4 lg:px-8 py-2 text-xs"
            >
              <div className="max-w-[1440px] mx-auto flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-display font-bold text-[#0B1F3A] text-xs uppercase tracking-wider mr-1">
                    Context:
                  </span>

                  {/* Academic Year */}
                  <label className="inline-flex items-center gap-1 bg-white border border-slate-300 rounded px-2 py-1">
                    <span className="text-[11px] text-slate-500">Year:</span>
                    <select
                      aria-label="Context Academic Year"
                      value={selectedAcademicYear}
                      onChange={(e) => setSelectedAcademicYear(e.target.value)}
                      className="bg-transparent font-mono font-semibold text-[#0B1F3A] text-xs focus:outline-none"
                    >
                      {Object.values(academicYearsMeta).map((yr) => (
                        <option key={yr.code} value={yr.code}>
                          {yr.code}
                        </option>
                      ))}
                    </select>
                  </label>

                  {/* Class or Programme */}
                  <label className="inline-flex items-center gap-1 bg-white border border-slate-300 rounded px-2 py-1">
                    <span className="text-[11px] text-slate-500">
                      {isSchoolWorkspace ? 'Class:' : 'Programme:'}
                    </span>
                    <select
                      aria-label="Context Class or Programme"
                      value={teacherContext.classOrProgramme}
                      onChange={(e) =>
                        setTeacherContext((prev) => ({
                          ...prev,
                          classOrProgramme: e.target.value,
                        }))
                      }
                      className="bg-transparent font-semibold text-[#0B1F3A] text-xs focus:outline-none max-w-[160px]"
                    >
                      <option value="Show all">
                        Show all ({isSchoolWorkspace ? 'Classes' : 'Programmes'})
                      </option>
                      {contextClassOrProgrammes.map((cp) => (
                        <option key={cp} value={cp}>
                          {cp}
                        </option>
                      ))}
                    </select>
                  </label>

                  {/* Section */}
                  <label className="inline-flex items-center gap-1 bg-white border border-slate-300 rounded px-2 py-1">
                    <span className="text-[11px] text-slate-500">Section:</span>
                    <select
                      aria-label="Context Section"
                      value={teacherContext.section}
                      onChange={(e) =>
                        setTeacherContext((prev) => ({
                          ...prev,
                          section: e.target.value,
                        }))
                      }
                      className="bg-transparent font-semibold text-[#0B1F3A] text-xs focus:outline-none"
                    >
                      <option value="Show all">Show all</option>
                      <option value="Section A">Section A</option>
                      <option value="Section B">Section B</option>
                      <option value="Section C">Section C</option>
                    </select>
                  </label>

                  {/* Semester (only in College workspace) */}
                  {!isSchoolWorkspace && (
                    <label className="inline-flex items-center gap-1 bg-white border border-slate-300 rounded px-2 py-1">
                      <span className="text-[11px] text-slate-500">Sem:</span>
                      <select
                        aria-label="Context Semester"
                        value={teacherContext.semester}
                        onChange={(e) =>
                          setTeacherContext((prev) => ({
                            ...prev,
                            semester: e.target.value,
                          }))
                        }
                        className="bg-transparent font-semibold text-[#0B1F3A] text-xs focus:outline-none"
                      >
                        <option value="Show all">Show all</option>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                          <option key={sem} value={String(sem)}>
                            Sem {sem}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}

                  {/* Teacher Scope Indicator ("You can see: Class 5-A, 5-B, 10-A") */}
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-teal-50 border border-teal-200 text-teal-900 text-[11px]">
                    <span className="font-semibold">You can see:</span>
                    <span className="font-mono font-bold">{assignedTeacherScopeLabel}</span>
                    <button
                      type="button"
                      onClick={() => setIsClassTeacherScoped(!isClassTeacherScoped)}
                      title="Toggle between Class Teacher Assigned Scope (RLS) and Nodal Officer Full Institution Scope"
                      className="ml-1 px-1.5 py-0.2 rounded bg-white border border-teal-300 text-[10px] font-semibold text-teal-800 hover:bg-teal-100"
                    >
                      {isClassTeacherScoped ? 'Assigned Scope' : 'Full School'}
                    </button>
                  </div>
                </div>

                {/* Active Choice Chip + Clear Selection Button + Sensitive Permission Toggle */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#0B1F3A] text-white font-mono text-[11px] font-semibold">
                    <span>
                      Viewing:{' '}
                      {teacherContext.classOrProgramme !== 'Show all'
                        ? teacherContext.classOrProgramme
                        : isSchoolWorkspace
                        ? 'All Classes'
                        : 'All Programmes'}{' '}
                      -{' '}
                      {teacherContext.section !== 'Show all'
                        ? teacherContext.section
                        : 'All Sections'}{' '}
                      - {selectedAcademicYear}
                    </span>
                  </span>

                  {(teacherContext.institutionType !== 'Show all' ||
                    teacherContext.classOrProgramme !== 'Show all' ||
                    teacherContext.section !== 'Show all' ||
                    teacherContext.semester !== 'Show all') && (
                    <button
                      type="button"
                      onClick={clearTeacherContext}
                      className="px-2.5 py-1 rounded border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 font-semibold text-[11px]"
                    >
                      Clear selection
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setCanViewSensitive(!canViewSensitive)}
                    title="Toggle can_view_sensitive permission for partial PEN search and unmasking"
                    className={`px-2 py-1 rounded border font-mono text-[10px] font-semibold transition-colors ${
                      canViewSensitive
                        ? 'bg-teal-50 border-teal-300 text-teal-800'
                        : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    can_view_sensitive: {canViewSensitive ? 'ON' : 'OFF'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 0. READ-ONLY PREVIOUS YEAR SNAPSHOT BANNER */}
          {isReadOnlySnapshot && isRoutePermitted && (
            <div
              role="region"
              aria-label="Snapshot read only notice"
              className="bg-amber-100 border-b border-amber-300 px-3 sm:px-4 lg:px-8 py-2.5 text-xs text-amber-950 flex flex-wrap items-center justify-between gap-2"
            >
              <div className="flex items-center gap-2 font-medium">
                <Lock className="w-4 h-4 text-amber-800 shrink-0" />
                <span>
                  <strong className="font-bold">Snapshot, read only ({selectedAcademicYear}):</strong>{' '}
                  You are inspecting the previous academic year snapshot (
                  {academicYearsMeta[selectedAcademicYear]?.startDateDisplay} to{' '}
                  {academicYearsMeta[selectedAcademicYear]?.endDateDisplay}). Adding, editing, and
                  certifying records are disabled in snapshot mode.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAcademicYear(currentActiveAcademicYear)}
                className="px-3 py-1 rounded bg-[#0B1F3A] text-white font-semibold text-[11px] hover:bg-slate-800 shrink-0"
              >
                Switch to Current Year ({currentActiveAcademicYear}) &rarr;
              </button>
            </div>
          )}

          {/* Main Viewport: 16px padding (p-4) on phones, p-6 on tablets, p-8 on desktop */}
          <main
            onInput={() => {
              if (isUnsavedSensitiveRoute) setLocalFormModified(true);
            }}
            onChange={() => {
              if (isUnsavedSensitiveRoute) setLocalFormModified(true);
            }}
            className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 max-w-[1440px] w-full mx-auto min-w-0"
          >
            {/* Breadcrumb Bar on Every Inner Page */}
            {!isDashboardHome && isRoutePermitted && breadcrumbs.length > 0 && (
              <nav
                aria-label="Breadcrumb"
                className="mb-4 flex flex-wrap items-center gap-1.5 text-xs text-slate-600 bg-white border border-slate-200 rounded-md px-3 py-2"
              >
                {breadcrumbs.map((crumb, idx) => {
                  const isLast = idx === breadcrumbs.length - 1;
                  return (
                    <React.Fragment key={`${crumb.label}-${idx}`}>
                      {idx > 0 && (
                        <ChevronRight
                          className="w-3.5 h-3.5 text-slate-400 shrink-0"
                          aria-hidden="true"
                        />
                      )}
                      {crumb.path && !isLast ? (
                        <Link
                          to={crumb.path}
                          className="font-medium text-indigo-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
                        >
                          {crumb.label}
                        </Link>
                      ) : (
                        <span
                          aria-current={isLast ? 'page' : undefined}
                          className={
                            isLast
                              ? 'font-semibold text-[#0B1F3A]'
                              : 'font-medium text-slate-600'
                          }
                        >
                          {crumb.label}
                        </span>
                      )}
                    </React.Fragment>
                  );
                })}
              </nav>
            )}

            {!isRoutePermitted ? (
              <NotPermittedPage />
            ) : simLoading ? (
              <div
                aria-busy="true"
                aria-label="Loading page content"
                className="space-y-4 animate-pulse"
              >
                <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-2.5">
                  <div className="h-4 bg-slate-200 rounded w-44" />
                  <div className="h-6 bg-slate-300 rounded w-80 max-w-full" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((n) => (
                    <div key={n} className="bg-white border border-slate-200 rounded-lg p-5 space-y-3">
                      <div className="h-3 bg-slate-200 rounded w-1/2" />
                      <div className="h-8 bg-slate-300 rounded w-1/3" />
                      <div className="h-3 bg-slate-100 rounded w-2/3" />
                    </div>
                  ))}
                </div>
                <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-3">
                  <div className="h-5 bg-slate-200 rounded w-1/4" />
                  <div className="h-10 bg-slate-100 rounded w-full" />
                  <div className="h-10 bg-slate-100 rounded w-full" />
                  <div className="h-10 bg-slate-100 rounded w-full" />
                </div>
              </div>
            ) : simError ? (
              <div
                role="alert"
                className="bg-white border-2 border-red-200 rounded-lg p-6 max-w-lg mx-auto my-8 text-center space-y-3 text-xs"
              >
                <AlertTriangle className="w-8 h-8 text-red-600 mx-auto" />
                <h2 className="font-display font-bold text-base text-[#0B1F3A]">
                  Simulated Data Service Error
                </h2>
                <p className="text-slate-600 leading-relaxed">
                  Could not load institutional records for {selectedAcademicYear}. Your local
                  IndexedDB drafts remain safe. Click Retry below to restore the view.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSimError(false);
                    setSimLoading(true);
                    setTimeout(() => setSimLoading(false), 400);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-[#0B1F3A] text-white font-semibold hover:bg-slate-800"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retry Loading Data</span>
                </button>
              </div>
            ) : (
              <fieldset
                disabled={isReadOnlySnapshot && location.pathname.includes('/new')}
                className="min-w-0 border-0 p-0 m-0"
              >
                {children}
              </fieldset>
            )}
          </main>
        </div>
      </div>

      {/* SWITCH ROLE CONFIRM DIALOG + DEMO QUICK LOGIN */}
      {switchRoleModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="switch-role-modal-title"
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white border border-slate-200 rounded-lg shadow-2xl max-w-lg w-full overflow-hidden text-xs">
            <div className="bg-[#0B1F3A] text-white px-5 py-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-teal-400 shrink-0" />
                <h2
                  id="switch-role-modal-title"
                  className="font-display font-bold text-sm sm:text-base"
                >
                  Switch Role (Authentication Required)
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSwitchRoleModalOpen(false)}
                aria-label="Close switch role dialog"
                className="p-1 rounded text-slate-300 hover:text-white hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="p-3.5 rounded-md bg-amber-50 border border-amber-300 text-amber-950 space-y-1">
                <p className="font-semibold text-xs sm:text-sm leading-snug">
                  Switch role? You will be signed out and can log in again with another role.
                </p>
                <p className="text-[11px] text-amber-900 leading-relaxed">
                  Currently signed in as <strong>{session.userName}</strong> (
                  {session.roleDisplayLabel || session.designation}) at{' '}
                  <strong>{session.institutionName}</strong>. Confirming signs you out, writes an
                  audit log entry, clears session data, and opens <code>/login/role</code> with your
                  state (<strong>{session.state}</strong>) kept in app state only.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2 border-b border-slate-200 pb-4">
                <button
                  type="button"
                  onClick={() => setSwitchRoleModalOpen(false)}
                  className="px-3.5 py-2 rounded-md border border-slate-300 bg-white text-slate-700 font-semibold hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSwitchRoleSignOut}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-[#0B1F3A] text-white font-semibold hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign out &amp; go to /login/role</span>
                </button>
              </div>

              {/* Demo quick login (demo accounts only) */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-display font-bold text-xs text-[#0B1F3A] uppercase tracking-wider">
                    Demo quick login (demo accounts only)
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-600">
                    Audit-logged login flow
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Select a synthetic demo account below to sign in through the normal login logic
                  and open its permitted workspace:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {DEMO_QUICK_ACCOUNTS.map((acc) => (
                    <button
                      key={acc.key}
                      type="button"
                      onClick={() => handleQuickDemoLoginInModal(acc.key)}
                      className="text-left p-2.5 rounded-md border border-slate-200 hover:border-[#0B1F3A] hover:bg-slate-50 transition-colors flex flex-col justify-between gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B1F3A]"
                    >
                      <div className="flex items-center justify-between gap-1.5">
                        <span className="font-semibold text-[#0B1F3A] text-xs">{acc.label}</span>
                        <span
                          className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded border shrink-0 ${
                            acc.workspaceBadge === 'School'
                              ? 'bg-teal-50 text-teal-800 border-teal-200'
                              : acc.workspaceBadge === 'College'
                              ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}
                        >
                          {acc.workspaceBadge}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 leading-snug">{acc.sublabel}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* UNSAVED CHANGES CONFIRMATION DIALOG FOR TOP-RIGHT BACK BUTTON */}
      {unsavedLeaveModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="unsaved-leave-modal-title"
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white border border-slate-200 rounded-lg shadow-2xl max-w-md w-full p-5 space-y-4 text-xs">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2 text-amber-800 font-display font-bold text-sm">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                <h2 id="unsaved-leave-modal-title">Leave page with unsaved changes?</h2>
              </div>
              <button
                type="button"
                onClick={() => setUnsavedLeaveModalOpen(false)}
                aria-label="Close unsaved changes dialog"
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-slate-600 leading-relaxed">
              You have unsaved changes on <strong>{readablePageName}</strong>. Are you sure you want
              to go back without saving or completing your changes?
            </p>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setUnsavedLeaveModalOpen(false)}
                className="px-3.5 py-2 rounded-md border border-slate-300 bg-white text-slate-700 font-semibold hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500"
              >
                Stay on page
              </button>
              <button
                type="button"
                onClick={() => executeBackNavigation(pendingBackTarget || portalHomePath)}
                className="px-3.5 py-2 rounded-md bg-red-600 text-white font-semibold hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
              >
                Leave page
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ALL NOTIFICATIONS MODAL (When "View all" is clicked in Management or AICTE portal) */}
      {allNotifsModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="All Notifications and Action Advisories"
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white border border-slate-200 rounded-lg shadow-2xl max-w-2xl w-full overflow-hidden text-xs">
            <div className="bg-[#0B1F3A] text-white px-5 py-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-teal-400 shrink-0" />
                <h2 className="font-display font-bold text-sm sm:text-base">
                  All Notifications &amp; Action Advisories ({notifications.length})
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={unreadNotifCount === 0}
                  onClick={() => {
                    markAllNotificationsRead();
                    addToast('All notifications marked as read.', 'info');
                  }}
                  className="px-2.5 py-1 rounded bg-teal-700 text-white font-semibold text-[11px] hover:bg-teal-800 disabled:opacity-40"
                >
                  Mark all as read
                </button>
                <button
                  type="button"
                  onClick={() => setAllNotifsModalOpen(false)}
                  aria-label="Close notifications modal"
                  className="p-1 rounded text-slate-300 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="max-h-[70vh] overflow-y-auto divide-y divide-slate-200">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    !n.isRead ? 'bg-blue-50/50' : 'bg-white'
                  }`}
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <span
                      aria-label={!n.isRead ? 'Unread notification' : 'Read notification'}
                      className={`w-2.5 h-2.5 rounded-full shrink-0 mt-1.5 ${
                        !n.isRead ? 'bg-blue-600' : 'bg-slate-200'
                      }`}
                    />
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500">
                        {!n.isRead && (
                          <span className="px-1.5 py-0.2 rounded bg-blue-600 text-white text-[10px] font-bold">
                            UNREAD
                          </span>
                        )}
                        <span>{n.category}</span>
                        <span>·</span>
                        <span>{n.timestamp}</span>
                      </div>
                      <div className="font-display font-bold text-sm text-[#0B1F3A]">
                        {n.title}
                      </div>
                      <p className="text-slate-600 leading-relaxed">{n.message}</p>
                    </div>
                  </div>
                  {!n.isRead && (
                    <button
                      type="button"
                      onClick={() => markNotificationRead(n.id)}
                      className="px-3 py-1.5 rounded border border-slate-300 bg-white text-slate-700 font-semibold hover:bg-slate-50 shrink-0 self-start sm:self-center"
                    >
                      Mark read
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Global Overlays: Session Timeout, Walkthrough Tour, Judge Demo Guide, Toasts & AI Assistant */}
      <SessionTimeoutWatcher />
      <InteractiveTourOverlay />
      <JudgeDemoGuideDrawer />
      <ToastContainer />
      <FloatingAiAssistant />
    </div>
  );
};
