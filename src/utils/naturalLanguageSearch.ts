import { StudentRecord } from '../data/mockData';

export interface NaturalSearchFilterState {
  classNum?: number;
  semesterNum?: number;
  classOrSemester?: number;
  programmeKeyword?: string;
  section?: 'Section A' | 'Section B' | 'Section C';
  apaarPresence?: 'missing' | 'recorded';
  verificationStatus?:
    | 'Simulated Verification'
    | 'Pending Official Verification'
    | 'Mismatch Flagged'
    | 'Missing APAAR ID';
  completeness?: 'incomplete' | 'complete';
  duplicatesOnly?: boolean;
  dateRange?: 'this_month' | 'this_week';
  consentFilter?: 'pending' | 'obtained' | 'declined';
  nameOrRollText?: string;
}

export interface RemovableFilterChip {
  key: keyof NaturalSearchFilterState;
  label: string;
}

export interface NaturalLanguageParseResult {
  rawQuery: string;
  understood: boolean;
  filters: NaturalSearchFilterState;
  chips: RemovableFilterChip[];
  examples: string[];
}

export const SCHOOL_NL_SEARCH_EXAMPLES: string[] = [
  'students in class 5 with no APAAR ID',
  'incomplete records in class 10 section B',
  'possible duplicates in section A',
  'mismatch flagged in section A',
];

export const COLLEGE_NL_SEARCH_EXAMPLES: string[] = [
  'CSE students with consent pending',
  'possible duplicates in semester 3',
  'possible duplicates in section A',
  'incomplete records this month',
];

export const NL_SEARCH_EXAMPLES: string[] = [
  'students in class 5 with no APAAR ID',
  'incomplete records in class 10 section B',
  'CSE students with consent pending',
  'possible duplicates in section A',
  'possible duplicates in semester 3',
];

export function parseNaturalLanguageQuery(raw: string): NaturalLanguageParseResult {
  const q = raw.trim();
  const lower = q.toLowerCase();
  const filters: NaturalSearchFilterState = {};
  const chips: RemovableFilterChip[] = [];

  if (!q) {
    return {
      rawQuery: q,
      understood: true,
      filters: {},
      chips: [],
      examples: NL_SEARCH_EXAMPLES,
    };
  }

  // 1a. Explicit Class / Grade detection (e.g. "class 5", "class 10", "grade 8")
  const explicitClassMatch = /\b(?:class|grade|std)\s*(\d{1,2})\b/i.exec(lower);
  if (explicitClassMatch) {
    const num = parseInt(explicitClassMatch[1], 10);
    filters.classNum = num;
    filters.classOrSemester = num;
    chips.push({
      key: 'classOrSemester',
      label: `Class: Class ${num}`,
    });
  } else {
    // 1b. Explicit Semester / Year detection (e.g. "semester 3", "sem 3")
    const semMatch = /\b(?:semester|sem|year)\s*(\d{1,2})\b/i.exec(lower);
    if (semMatch) {
      const num = parseInt(semMatch[1], 10);
      filters.semesterNum = num;
      filters.classOrSemester = num;
      chips.push({
        key: 'classOrSemester',
        label: `Semester: Sem ${num}`,
      });
    }
  }

  // 2. Section detection ("section A", "sec B", "section C")
  const secMatch = /\b(?:section|sec)\s*([abc])\b/i.exec(lower);
  if (secMatch) {
    const letter = secMatch[1].toUpperCase() as 'A' | 'B' | 'C';
    filters.section = `Section ${letter}`;
    chips.push({
      key: 'section',
      label: `Section: Section ${letter}`,
    });
  }

  // 3. APAAR presence ("no apaar", "without apaar", "missing apaar", "has apaar", "with apaar")
  if (
    /\b(?:no\s+apaar|without\s+apaar|missing\s+apaar|apaar\s+missing|not\s+recorded)\b/i.test(
      lower
    )
  ) {
    filters.apaarPresence = 'missing';
    chips.push({
      key: 'apaarPresence',
      label: 'APAAR Status: No APAAR ID',
    });
  } else if (/\b(?:has\s+apaar|with\s+apaar\s+id|recorded\s+apaar)\b/i.test(lower)) {
    filters.apaarPresence = 'recorded';
    chips.push({
      key: 'apaarPresence',
      label: 'APAAR Status: Has APAAR ID',
    });
  }

  // 4. Completeness ("incomplete records", "incomplete students", "complete records")
  if (/\b(?:incomplete|pending\s+records|unfinished|missing\s+details)\b/i.test(lower)) {
    filters.completeness = 'incomplete';
    chips.push({
      key: 'completeness',
      label: 'Completeness: Incomplete / Pending',
    });
  } else if (/\b(?:complete\s+records|fully\s+verified|simulated\s+verified)\b/i.test(lower)) {
    filters.completeness = 'complete';
    chips.push({
      key: 'completeness',
      label: 'Completeness: Complete (Simulated Verified)',
    });
  }

  // 5. Duplicates ("possible duplicates", "duplicate", "duplicates")
  if (/\b(?:duplicate|duplicates)\b/i.test(lower)) {
    filters.duplicatesOnly = true;
    chips.push({
      key: 'duplicatesOnly',
      label: 'Flag: Possible Duplicates',
    });
  }

  // 6. Verification Status ("mismatch", "mismatch flagged", "pending verification")
  if (/\b(?:mismatch|mismatches|name\s+mismatch)\b/i.test(lower)) {
    filters.verificationStatus = 'Mismatch Flagged';
    chips.push({
      key: 'verificationStatus',
      label: 'Status: Mismatch Flagged',
    });
  } else if (/\b(?:pending\s+official|pending\s+verification)\b/i.test(lower)) {
    filters.verificationStatus = 'Pending Official Verification';
    chips.push({
      key: 'verificationStatus',
      label: 'Status: Pending Official Verification',
    });
  }

  // 7. Consent Status ("consent pending", "no consent", "consent obtained", "consent declined")
  if (/\b(?:consent\s+pending|pending\s+consent|without\s+consent)\b/i.test(lower)) {
    filters.consentFilter = 'pending';
    chips.push({
      key: 'consentFilter',
      label: 'Parent Consent: Pending',
    });
  } else if (/\b(?:consent\s+obtained|with\s+consent)\b/i.test(lower)) {
    filters.consentFilter = 'obtained';
    chips.push({
      key: 'consentFilter',
      label: 'Parent Consent: Obtained',
    });
  } else if (/\b(?:consent\s+declined|declined\s+consent)\b/i.test(lower)) {
    filters.consentFilter = 'declined';
    chips.push({
      key: 'consentFilter',
      label: 'Parent Consent: Declined',
    });
  }

  // 8. Date range ("this month", "october", "this week", "recent")
  if (/\b(?:this\s+month|october|current\s+month|recent)\b/i.test(lower)) {
    filters.dateRange = 'this_month';
    chips.push({
      key: 'dateRange',
      label: 'Date Range: This Month (Oct 2026)',
    });
  } else if (/\b(?:this\s+week|last\s+7\s+days)\b/i.test(lower)) {
    filters.dateRange = 'this_week';
    chips.push({
      key: 'dateRange',
      label: 'Date Range: This Week',
    });
  }

  // 9. Programme keyword ("cse", "computer science", "ece", "electronics", "mechanical", "civil", "ai", "data science", "electrical")
  const progMap: Array<{ regex: RegExp; keyword: string; label: string }> = [
    {
      regex: /\b(?:cse|computer\s+science)\b/i,
      keyword: 'Computer Science',
      label: 'Computer Science (CSE)',
    },
    {
      regex: /\b(?:ece|electronics)\b/i,
      keyword: 'Electronics',
      label: 'Electronics & Comm (ECE)',
    },
    { regex: /\b(?:mech|mechanical)\b/i, keyword: 'Mechanical', label: 'Mechanical Engg' },
    { regex: /\b(?:civil)\b/i, keyword: 'Civil', label: 'Civil Engg' },
    {
      regex: /\b(?:ai|artificial\s+intelligence|data\s+science)\b/i,
      keyword: 'Artificial Intelligence',
      label: 'AI & Data Science',
    },
    {
      regex: /\b(?:eee|electrical)\b/i,
      keyword: 'Electrical',
      label: 'Electrical & Electronics',
    },
  ];

  for (const pm of progMap) {
    if (pm.regex.test(lower)) {
      filters.programmeKeyword = pm.keyword;
      chips.push({
        key: 'programmeKeyword',
        label: `Programme: ${pm.label}`,
      });
      break;
    }
  }

  const understood = chips.length > 0;

  return {
    rawQuery: q,
    understood,
    filters,
    chips,
    examples: NL_SEARCH_EXAMPLES,
  };
}

export function applyNaturalSearchFilters(
  students: StudentRecord[],
  filters: NaturalSearchFilterState
): StudentRecord[] {
  return students.filter((s) => {
    if (filters.classOrSemester !== undefined) {
      const targetNum = filters.classOrSemester;
      const targetClassStr = `Class ${targetNum}`;
      const isClassMatch =
        s.className === targetClassStr ||
        s.programme === targetClassStr ||
        s.semester === targetNum;
      if (!isClassMatch) return false;
    }

    if (filters.section && (s.section || 'Section A') !== filters.section) {
      return false;
    }

    if (filters.programmeKeyword) {
      if (!s.programme.toLowerCase().includes(filters.programmeKeyword.toLowerCase())) {
        return false;
      }
    }

    if (filters.apaarPresence === 'missing' && s.apaarId !== null) {
      return false;
    }
    if (filters.apaarPresence === 'recorded' && s.apaarId === null) {
      return false;
    }

    if (filters.verificationStatus && s.verificationStatus !== filters.verificationStatus) {
      return false;
    }

    if (filters.completeness === 'incomplete') {
      const isIncomplete =
        s.verificationStatus !== 'Simulated Verification' || s.dataQualityScore < 85;
      if (!isIncomplete) return false;
    } else if (filters.completeness === 'complete') {
      if (s.verificationStatus !== 'Simulated Verification') return false;
    }

    if (filters.duplicatesOnly && !s.duplicateCandidateId) {
      return false;
    }

    if (filters.consentFilter) {
      const stConsent = s.consentStatus || (s.apaarId ? 'obtained' : 'pending');
      if (stConsent !== filters.consentFilter) return false;
    }

    if (filters.dateRange === 'this_week') {
      if (s.lastUpdated < '2026-10-18') return false;
    } else if (filters.dateRange === 'this_month') {
      if (!s.lastUpdated.startsWith('2026-10')) return false;
    }

    return true;
  });
}
