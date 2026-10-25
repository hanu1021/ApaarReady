import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, FileEdit, Info } from 'lucide-react';

export type NameMatchVerdict = 'match' | 'likely_same' | 'needs_review';

export interface NameDifferencePart {
  part: string;
  detail: string;
  type: 'exact' | 'case_space' | 'initial' | 'order' | 'spelling_translit' | 'mismatch';
}

export interface SmartNameCheckResult {
  verdict: NameMatchVerdict;
  chipLabel: 'Match' | 'Likely same person (minor variation)' | 'Needs review';
  differences: NameDifferencePart[];
  suggestedNextStep: string;
  disclaimer: string;
  normalizedSchool: string;
  normalizedAadhaar: string;
}

// Common Indian spelling variants & initial expansions (Synthetic / Rule-based)
const SPELLING_VARIANT_GROUPS: string[][] = [
  ['reddy', 'reddi', 'reddygier'],
  ['sharma', 'sarma', 'sharmah'],
  ['varma', 'verma', 'varmah'],
  ['rao', 'rau', 'raao'],
  ['choudhary', 'chaudhary', 'chowdary', 'choudhury', 'chowdhary'],
  ['mohammed', 'mohammad', 'muhammad', 'mohd', 'md'],
  ['kulkarni', 'kulakarni'],
  ['lakshmi', 'laxmi', 'lakshmy'],
  ['srinivas', 'shrinivas', 'sreenivas', 'srinivasa'],
  ['venkatesh', 'venkateswara', 'venkat'],
  ['prasad', 'prasada'],
  ['kumar', 'kumari', 'kmr'],
  ['narayanan', 'narayana', 'narayan'],
  ['joshi', 'josi'],
  ['patel', 'patil'],
  [' Nair', 'nayar'],
  ['iyer', 'aiyar', 'ayyar'],
  ['iyengar', 'ayyangar'],
  ['deshmukh', 'deshamukh'],
  ['agarwal', 'agrawal', 'aggarwal'],
  ['bhattacharya', 'bhattacharyya'],
  ['mukherjee', 'mukhopadhyay', 'mukherji'],
  ['banerjee', 'bandyopadhyay', 'banerji'],
  ['chatterjee', 'chattopadhyay', 'chatterji'],
];

const HONORIFICS = new Set(['mr', 'mrs', 'ms', 'miss', 'kumari', 'sri', 'shri', 'smt', 'dr', 'master']);

// Simple Hindi / Telugu phonetic transliteration normalizer
export function phoneticNormalizeToken(raw: string): string {
  let s = raw.toLowerCase().replace(/[^a-z]/g, '');
  if (!s) return '';

  // Check canonical variant dictionary first
  for (const group of SPELLING_VARIANT_GROUPS) {
    if (group.includes(s)) {
      return group[0];
    }
  }

  // Vowel & aspirated consonant normalization common in Hindi/Telugu transliteration
  s = s
    .replace(/aa/g, 'a')
    .replace(/ee/g, 'i')
    .replace(/oo/g, 'u')
    .replace(/ou/g, 'au')
    .replace(/sh/g, 's')
    .replace(/th/g, 't')
    .replace(/dh/g, 'd')
    .replace(/bh/g, 'b')
    .replace(/kh/g, 'k')
    .replace(/gh/g, 'g')
    .replace(/ph/g, 'f')
    .replace(/chh/g, 'ch')
    .replace(/w/g, 'v')
    .replace(/z/g, 'j')
    .replace(/y/g, 'i');

  // Deduplicate consecutive identical letters (e.g. "kiran" vs "kirann", "reddy" vs "redy")
  s = s.replace(/(.)\1+/g, '$1');

  // Trailing schwa ('a') normalization for tokens > 4 chars (e.g. "rama" vs "ram", "krishna" vs "krishn")
  if (s.length > 4 && s.endsWith('a')) {
    s = s.slice(0, -1);
  }

  return s;
}

// Levenshtein edit distance for minor typo detection
function editDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return dp[m][n];
}

function tokenizeName(raw: string): {
  tokens: string[];
  removedHonorifics: string[];
} {
  // Split on whitespace, dots, hyphens, commas
  const parts = raw
    .trim()
    .replace(/\./g, ' ')
    .replace(/[,_-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);

  const tokens: string[] = [];
  const removedHonorifics: string[] = [];

  for (const p of parts) {
    const clean = p.replace(/[^a-zA-Z]/g, '');
    if (!clean) continue;
    const lower = clean.toLowerCase();
    // Note: "md" is kept as a name token (Mohammed) rather than stripped as honorific
    if (HONORIFICS.has(lower)) {
      removedHonorifics.push(p);
    } else {
      tokens.push(clean);
    }
  }

  return { tokens, removedHonorifics };
}

function areSpellingVariants(t1: string, t2: string): boolean {
  const l1 = t1.toLowerCase();
  const l2 = t2.toLowerCase();
  for (const group of SPELLING_VARIANT_GROUPS) {
    if (group.includes(l1) && group.includes(l2)) return true;
  }
  return false;
}

export function compareStudentNames(
  schoolNameRaw: string,
  aadhaarNameRaw: string
): SmartNameCheckResult {
  const disclaimer =
    'A similar name alone is never proof. Simulated check only — never overwrites records automatically.';

  const sTrim = schoolNameRaw.trim();
  const aTrim = aadhaarNameRaw.trim();

  if (!sTrim || !aTrim) {
    return {
      verdict: 'needs_review',
      chipLabel: 'Needs review',
      differences: [
        {
          part: 'Missing comparison field',
          detail: 'Enter both School Record Name and Name as per Aadhaar Card to run comparison.',
          type: 'mismatch',
        },
      ],
      suggestedNextStep: 'Populate both name fields to inspect token alignment.',
      disclaimer,
      normalizedSchool: sTrim,
      normalizedAadhaar: aTrim,
    };
  }

  // Exact match
  if (sTrim === aTrim) {
    return {
      verdict: 'match',
      chipLabel: 'Match',
      differences: [
        {
          part: 'All tokens identical',
          detail: `"${sTrim}" matches "${aTrim}" character-for-character.`,
          type: 'exact',
        },
      ],
      suggestedNextStep: 'No name correction request needed.',
      disclaimer,
      normalizedSchool: sTrim,
      normalizedAadhaar: aTrim,
    };
  }

  const schoolParsed = tokenizeName(sTrim);
  const aadhaarParsed = tokenizeName(aTrim);

  const sTokens = schoolParsed.tokens;
  const aTokens = aadhaarParsed.tokens;

  const differences: NameDifferencePart[] = [];

  if (
    schoolParsed.removedHonorifics.length > 0 ||
    aadhaarParsed.removedHonorifics.length > 0
  ) {
    differences.push({
      part: 'Honorific / Title prefix',
      detail: `Honorific (${[
        ...schoolParsed.removedHonorifics,
        ...aadhaarParsed.removedHonorifics,
      ].join(', ')}) present in one record.`,
      type: 'case_space',
    });
  }

  // Case / spacing only difference check
  if (
    sTokens.length === aTokens.length &&
    sTokens.every((t, i) => t.toLowerCase() === aTokens[i].toLowerCase()) &&
    differences.length === 0
  ) {
    differences.push({
      part: 'Case or spacing normalization',
      detail: `"${sTrim}" and "${aTrim}" have identical words with different capitalization or punctuation.`,
      type: 'case_space',
    });
    return {
      verdict: 'match',
      chipLabel: 'Match',
      differences,
      suggestedNextStep:
        'Names match after case/spacing normalization. Optionally standardize to Title Case.',
      disclaimer,
      normalizedSchool: sTokens.join(' '),
      normalizedAadhaar: aTokens.join(' '),
    };
  }

  //Greedy bipartite matching between sTokens and aTokens
  const usedA = new Set<number>();
  const matchedPairs: Array<{
    sIdx: number;
    aIdx: number;
    sTok: string;
    aTok: string;
    matchType: 'exact' | 'initial' | 'spelling_translit';
  }> = [];

  // Pass 1: Exact case-insensitive token matches
  sTokens.forEach((sTok, sIdx) => {
    for (let aIdx = 0; aIdx < aTokens.length; aIdx++) {
      if (usedA.has(aIdx)) continue;
      if (sTok.toLowerCase() === aTokens[aIdx].toLowerCase()) {
        usedA.add(aIdx);
        matchedPairs.push({ sIdx, aIdx, sTok, aTok: aTokens[aIdx], matchType: 'exact' });
        break;
      }
    }
  });

  // Pass 2: Initial expansion (e.g. "K" <-> "Kumar" or "Karthikeya", or "MD" <-> "Mohammed")
  sTokens.forEach((sTok, sIdx) => {
    if (matchedPairs.some((p) => p.sIdx === sIdx)) return;
    for (let aIdx = 0; aIdx < aTokens.length; aIdx++) {
      if (usedA.has(aIdx)) continue;
      const aTok = aTokens[aIdx];
      const sLow = sTok.toLowerCase();
      const aLow = aTok.toLowerCase();

      const isInitialMatch =
        (sLow.length === 1 && aLow.length > 1 && aLow.startsWith(sLow)) ||
        (aLow.length === 1 && sLow.length > 1 && sLow.startsWith(aLow)) ||
        areSpellingVariants(sLow, aLow);

      if (isInitialMatch) {
        usedA.add(aIdx);
        matchedPairs.push({
          sIdx,
          aIdx,
          sTok,
          aTok,
          matchType: areSpellingVariants(sLow, aLow) ? 'spelling_translit' : 'initial',
        });
        break;
      }
    }
  });

  // Pass 3: Phonetic / Hindi-Telugu transliteration or 1-char edit distance
  sTokens.forEach((sTok, sIdx) => {
    if (matchedPairs.some((p) => p.sIdx === sIdx)) return;
    for (let aIdx = 0; aIdx < aTokens.length; aIdx++) {
      if (usedA.has(aIdx)) continue;
      const aTok = aTokens[aIdx];
      const p1 = phoneticNormalizeToken(sTok);
      const p2 = phoneticNormalizeToken(aTok);
      const dist = editDistance(sTok.toLowerCase(), aTok.toLowerCase());

      if ((p1 && p1 === p2) || (Math.min(sTok.length, aTok.length) >= 4 && dist <= 1)) {
        usedA.add(aIdx);
        matchedPairs.push({
          sIdx,
          aIdx,
          sTok,
          aTok,
          matchType: 'spelling_translit',
        });
        break;
      }
    }
  });

  // Check if order was swapped (e.g., Surname-first vs Surname-last: "Reddy Ananya" vs "Ananya Reddy")
  let orderSwapped = false;
  if (matchedPairs.length >= 2) {
    for (let i = 0; i < matchedPairs.length - 1; i++) {
      if (matchedPairs[i].sIdx < matchedPairs[i + 1].sIdx && matchedPairs[i].aIdx > matchedPairs[i + 1].aIdx) {
        orderSwapped = true;
      }
    }
  }

  if (orderSwapped) {
    differences.push({
      part: 'Surname-first vs Surname-last order',
      detail: `Token order is reversed between School Record ("${sTokens.join(' ')}") and Aadhaar ("${aTokens.join(' ')}").`,
      type: 'order',
    });
  }

  for (const pair of matchedPairs) {
    if (pair.matchType === 'initial') {
      differences.push({
        part: `Initial vs Expanded token: "${pair.sTok}" ↔ "${pair.aTok}"`,
        detail: `Single-letter initial "${
          pair.sTok.length === 1 ? pair.sTok : pair.aTok
        }." corresponds to expanded name "${
          pair.sTok.length > 1 ? pair.sTok : pair.aTok
        }".`,
        type: 'initial',
      });
    } else if (pair.matchType === 'spelling_translit') {
      differences.push({
        part: `Spelling / Transliteration variant: "${pair.sTok}" ↔ "${pair.aTok}"`,
        detail: `Phonetic or transliteration variation detected between "${pair.sTok}" and "${pair.aTok}".`,
        type: 'spelling_translit',
      });
    }
  }

  // Unmatched tokens
  const unmatchedS = sTokens.filter((_, idx) => !matchedPairs.some((p) => p.sIdx === idx));
  const unmatchedA = aTokens.filter((_, idx) => !usedA.has(idx));

  if (unmatchedS.length > 0 || unmatchedA.length > 0) {
    differences.push({
      part: `Unmatched token(s): ${[...unmatchedS, ...unmatchedA].join(', ')}`,
      detail: `${
        unmatchedS.length > 0 ? `Only in School Record: "${unmatchedS.join(' ')}". ` : ''
      }${unmatchedA.length > 0 ? `Only in Aadhaar Record: "${unmatchedA.join(' ')}".` : ''}`,
      type: 'mismatch',
    });
  }

  // Determine overall verdict
  const allMatched = unmatchedS.length === 0 && unmatchedA.length === 0 && matchedPairs.length > 0;
  const highOverlap =
    matchedPairs.length >= Math.max(1, Math.min(sTokens.length, aTokens.length)) &&
    unmatchedS.length + unmatchedA.length <= 1;

  if (allMatched) {
    return {
      verdict: 'likely_same',
      chipLabel: 'Likely same person (minor variation)',
      differences,
      suggestedNextStep:
        'Verify supporting Class X certificate or parent affidavit, then open a formal Name Correction Request if alignment is required.',
      disclaimer,
      normalizedSchool: sTokens.join(' '),
      normalizedAadhaar: aTokens.join(' '),
    };
  }

  if (highOverlap && matchedPairs.length > 0) {
    return {
      verdict: 'likely_same',
      chipLabel: 'Likely same person (minor variation)',
      differences,
      suggestedNextStep:
        'Check missing middle/surname token against admission register and open a correction request if appropriate.',
      disclaimer,
      normalizedSchool: sTokens.join(' '),
      normalizedAadhaar: aTokens.join(' '),
    };
  }

  return {
    verdict: 'needs_review',
    chipLabel: 'Needs review',
    differences,
    suggestedNextStep:
      'Significant name difference detected. Verify whether the right student card was entered or open a formal correction request with documentary proof.',
    disclaimer,
    normalizedSchool: sTokens.join(' '),
    normalizedAadhaar: aTokens.join(' '),
  };
}

export const SmartNameComparisonCard: React.FC<{
  schoolName: string;
  aadhaarName: string;
  onOpenCorrectionRequest?: () => void;
  correctionLinkHref?: string;
}> = ({ schoolName, aadhaarName, onOpenCorrectionRequest, correctionLinkHref }) => {
  const result = React.useMemo(
    () => compareStudentNames(schoolName, aadhaarName),
    [schoolName, aadhaarName]
  );

  if (!schoolName.trim() && !aadhaarName.trim()) {
    return null;
  }

  const toneStyles =
    result.verdict === 'match'
      ? {
          bg: 'bg-teal-50/80 border-teal-200',
          chip: 'bg-teal-100 text-teal-900 border-teal-300',
          icon: <CheckCircle2 className="w-4 h-4 text-teal-700 shrink-0" />,
        }
      : result.verdict === 'likely_same'
      ? {
          bg: 'bg-amber-50/80 border-amber-200',
          chip: 'bg-amber-100 text-amber-900 border-amber-300',
          icon: <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />,
        }
      : {
          bg: 'bg-red-50/80 border-red-200',
          chip: 'bg-red-100 text-red-900 border-red-300',
          icon: <AlertCircle className="w-4 h-4 text-red-700 shrink-0" />,
        };

  return (
    <div
      className={`rounded-lg border p-3.5 sm:p-4 text-xs space-y-3 ${toneStyles.bg}`}
      role="region"
      aria-label="Smart Name-Mismatch Check Result"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {toneStyles.icon}
          <span className="font-display font-bold text-slate-900">
            Smart Name-Mismatch Check (Simulated)
          </span>
        </div>

        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded border font-semibold text-[11px] ${toneStyles.chip}`}
        >
          {result.chipLabel}
        </span>
      </div>

      {/* Token Difference Breakdown */}
      <div className="space-y-1.5 bg-white/90 rounded-md p-2.5 border border-slate-200/80">
        <div className="text-[11px] font-semibold text-slate-600">
          What was compared &amp; which parts differ:
        </div>
        <ul className="space-y-1">
          {result.differences.map((diff, idx) => (
            <li key={idx} className="text-[11px] text-slate-800 flex items-start gap-1.5">
              <span className="font-mono font-bold text-[#0B1F3A] shrink-0">•</span>
              <div>
                <strong className="font-semibold text-slate-900">{diff.part}:</strong>{' '}
                <span className="text-slate-700">{diff.detail}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Suggested Next Step + Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1">
        <div className="space-y-0.5">
          <div className="text-[11px] text-slate-800">
            <strong className="text-[#0B1F3A]">Suggested next step:</strong>{' '}
            {result.suggestedNextStep}
          </div>
          <div className="text-[10px] text-slate-600 flex items-center gap-1">
            <Info className="w-3 h-3 text-slate-500 shrink-0" />
            <span>{result.disclaimer}</span>
          </div>
        </div>

        {result.verdict !== 'match' && (onOpenCorrectionRequest || correctionLinkHref) && (
          <div className="shrink-0">
            {onOpenCorrectionRequest ? (
              <button
                type="button"
                onClick={onOpenCorrectionRequest}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#0B1F3A] text-white font-semibold text-[11px] hover:bg-slate-800 transition-colors"
              >
                <FileEdit className="w-3.5 h-3.5" />
                <span>Open correction request</span>
              </button>
            ) : (
              <a
                href={correctionLinkHref}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#0B1F3A] text-white font-semibold text-[11px] hover:bg-slate-800 transition-colors"
              >
                <FileEdit className="w-3.5 h-3.5" />
                <span>Open correction request</span>
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
