export type AssistantLanguage = 'en' | 'hi' | 'te';

export const LANGUAGE_OPTIONS: { code: AssistantLanguage; label: string; nativeLabel: string }[] = [
  { code: 'en', label: 'English', nativeLabel: 'English' },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिन्दी' },
  { code: 'te', label: 'Telugu', nativeLabel: 'తెలుగు' },
];

export interface AssistantUiStrings {
  panelTitle: string;
  offlineHelpPrefix: string;
  safetyNote: string;
  welcomeHeading: string;
  welcomeBodyPrefix: string;
  welcomeBodySuffix: string;
  navigationStepsLabel: string;
  suggestedForScreenLabel: string;
  inputPlaceholder: string;
  sendAriaLabel: string;
  minimiseLabel: string;
  expandLabel: string;
  closeLabel: string;
  fallbackHeading: string;
  nlExamplesHeading: string;
  helpTopicsHeading: string;
  nlInterpretedHeading: string;
  openFilteredListBtn: string;
}

/**
 * UI strings for the APAAR Ready Assistant in English, Hindi (Devanagari), and Telugu.
 * Note: Hindi and Telugu strings are draft translations listed in TRANSLATION_TODO.md
 * for native speaker review.
 */
export const ASSISTANT_UI_STRINGS: Record<AssistantLanguage, AssistantUiStrings> = {
  en: {
    panelTitle: 'APAAR Ready Assistant',
    offlineHelpPrefix: 'Offline Help',
    safetyNote: 'I explain how to use the app. I cannot change records or verify identities.',
    welcomeHeading: 'How can I help you on this page?',
    welcomeBodyPrefix: 'You are viewing ',
    welcomeBodySuffix:
      '. Pick a suggestion below or type a question about adding students, missing APAAR IDs, Excel imports, duplicate reviews, or reports.',
    navigationStepsLabel: 'Navigation Steps:',
    suggestedForScreenLabel: 'Suggested for this screen:',
    inputPlaceholder: 'Ask how to use APAAR Ready...',
    sendAriaLabel: 'Send question',
    minimiseLabel: 'Minimise assistant panel',
    expandLabel: 'Expand assistant panel',
    closeLabel: 'Close assistant panel',
    fallbackHeading:
      "I didn't understand that query. Try one of these search examples or help topics:",
    nlExamplesHeading: 'Natural-Language Search Examples:',
    helpTopicsHeading: 'Help Topics:',
    nlInterpretedHeading: 'Natural-Language Search Filters Interpreted',
    openFilteredListBtn: 'Open Matching Filtered Student List',
  },
  hi: {
    panelTitle: 'APAAR Ready सहायक',
    offlineHelpPrefix: 'ऑफ़लाइन सहायता',
    safetyNote:
      'मैं ऐप का उपयोग करने का तरीका समझाता हूँ। मैं रिकॉर्ड नहीं बदल सकता और न ही पहचान सत्यापित कर सकता हूँ।',
    welcomeHeading: 'इस पेज पर मैं आपकी क्या सहायता कर सकता हूँ?',
    welcomeBodyPrefix: 'आप अभी देख रहे हैं: ',
    welcomeBodySuffix:
      '। नीचे दिए गए सुझावों में से चुनें या छात्र जोड़ने, अनुपलब्ध APAAR ID, एक्सेल इम्पोर्ट, डुप्लिकेट समीक्षा या रिपोर्ट के बारे में प्रश्न लिखें।',
    navigationStepsLabel: 'नेविगेशन चरण (Navigation Steps):',
    suggestedForScreenLabel: 'इस स्क्रीन के लिए सुझाव:',
    inputPlaceholder: 'APAAR Ready के उपयोग के बारे में पूछें...',
    sendAriaLabel: 'प्रश्न भेजें',
    minimiseLabel: 'सहायक पैनल छोटा करें',
    expandLabel: 'सहायक पैनल बड़ा करें',
    closeLabel: 'सहायक पैनल बंद करें',
    fallbackHeading:
      'मुझे वह प्रश्न समझ नहीं आया। कृपया इन खोज उदाहरणों या सहायता विषयों में से किसी एक को चुनें:',
    nlExamplesHeading: 'खोज उदाहरण (Search Examples):',
    helpTopicsHeading: 'सहायता विषय (Help Topics):',
    nlInterpretedHeading: 'खोज फ़िल्टर पहचाने गए',
    openFilteredListBtn: 'फ़िल्टर की गई छात्र सूची खोलें',
  },
  te: {
    panelTitle: 'APAAR Ready సహాయకుడు',
    offlineHelpPrefix: 'ఆఫ్‌లైన్ సహాయం',
    safetyNote:
      'నేను యాప్‌ను ఎలా ఉపయోగించాలో వివరిస్తాను. నేను రికార్డులను మార్చలేను లేదా గుర్తింపులను ధృవీకరించలేను.',
    welcomeHeading: 'ఈ పేజీలో నేను మీకు ఎలా సహాయపడగలను?',
    welcomeBodyPrefix: 'మీరు ప్రస్తుతం చూస్తున్న పేజీ: ',
    welcomeBodySuffix:
      '. క్రింది సూచనలలో ఒకదాన్ని ఎంచుకోండి లేదా విద్యార్థులను చేర్చడం, APAAR ID లేకపోవడం, ఎక్సెల్ దిగుమతి, డూప్లికేట్ సమీక్ష లేదా నివేదికల గురించి ప్రశ్న టైప్ చేయండి.',
    navigationStepsLabel: 'నావిగేషన్ దశలు (Navigation Steps):',
    suggestedForScreenLabel: 'ఈ స్క్రీన్ కోసం సూచనలు:',
    inputPlaceholder: 'APAAR Ready ఎలా ఉపయోగించాలో అడగండి...',
    sendAriaLabel: 'ప్రశ్న పంపండి',
    minimiseLabel: 'సహాయక ప్యానెల్‌ను చిన్నది చేయండి',
    expandLabel: 'సహాయక ప్యానెల్‌ను పెద్దది చేయండి',
    closeLabel: 'సహాయక ప్యానెల్‌ను మూసివేయండి',
    fallbackHeading:
      'ఆ ప్రశ్న నాకు అర్థం కాలేదు. క్రింది శోధన ఉదాహరణలు లేదా సహాయ అంశాలలో ఒకదాన్ని ప్రయత్నించండి:',
    nlExamplesHeading: 'శోధన ఉదాహరణలు (Search Examples):',
    helpTopicsHeading: 'సహాయ అంశాలు (Help Topics):',
    nlInterpretedHeading: 'శోధన ఫిల్టర్లు గుర్తించబడ్డాయి',
    openFilteredListBtn: 'ఫిల్టర్ చేసిన విద్యార్థుల జాబితాను తెరవండి',
  },
};

export const CONTEXTUAL_SUGGESTIONS_I18N: Record<
  'new_student' | 'import_export' | 'duplicates' | 'cleaning' | 'apaar' | 'college' | 'aicte' | 'default',
  Record<AssistantLanguage, string[]>
> = {
  new_student: {
    en: [
      'Student has no APAAR ID, what do I do?',
      'What is the Aadhaar availability check?',
      'Why is this field required?',
      'Where to find reports?',
    ],
    hi: [
      'छात्र के पास APAAR ID नहीं है, क्या करें?',
      'आधार उपलब्धता जांच क्या है?',
      'यह फ़ील्ड क्यों आवश्यक है?',
      'रिपोर्ट कहाँ मिलेंगी?',
    ],
    te: [
      'విద్యార్థికి APAAR ID లేదు, ఏమి చేయాలి?',
      'ఆధార్ లభ్యత తనిఖీ అంటే ఏమిటి?',
      'ఈ ఫీల్డ్ ఎందుకు తప్పనిసరి?',
      'నివేదికలు ఎక్కడ దొరుకుతాయి?',
    ],
  },
  import_export: {
    en: [
      'How do I import an Excel file?',
      'Where to find reports?',
      'Why is a record flagged?',
      'How to add a student?',
    ],
    hi: [
      'मैं एक्सेल (Excel) फ़ाइल कैसे इम्पोर्ट करूँ?',
      'रिपोर्ट कहाँ मिलेंगी?',
      'रिकॉर्ड क्यों फ्लैग किया गया है?',
      'नया छात्र कैसे जोड़ें?',
    ],
    te: [
      'ఎక్సెల్ (Excel) ఫైల్ ఎలా దిగుమతి చేయాలి?',
      'నివేదికలు ఎక్కడ దొరుకుతాయి?',
      'రికార్డు ఎందుకు ఫ్లాగ్ చేయబడింది?',
      'విద్యార్థిని ఎలా చేర్చాలి?',
    ],
  },
  duplicates: {
    en: [
      'How to review a duplicate?',
      'Why is a record flagged?',
      'How to correct a record?',
      'How to add a student?',
    ],
    hi: [
      'डुप्लिकेट रिकॉर्ड की समीक्षा कैसे करें?',
      'रिकॉर्ड क्यों फ्लैग किया गया है?',
      'रिकॉर्ड में सुधार कैसे करें?',
      'नया छात्र कैसे जोड़ें?',
    ],
    te: [
      'డూప్లికేట్ రికార్డును ఎలా సమీక్షించాలి?',
      'రికార్డు ఎందుకు ఫ్లాగ్ చేయబడింది?',
      'రికార్డును ఎలా సవరించాలి?',
      'విద్యార్థిని ఎలా చేర్చాలి?',
    ],
  },
  cleaning: {
    en: [
      'How to correct a record?',
      'Why is a record flagged?',
      'How to review a duplicate?',
      'Student has no APAAR ID, what do I do?',
    ],
    hi: [
      'रिकॉर्ड में सुधार कैसे करें?',
      'रिकॉर्ड क्यों फ्लैग किया गया है?',
      'डुप्लिकेट रिकॉर्ड की समीक्षा कैसे करें?',
      'छात्र के पास APAAR ID नहीं है, क्या करें?',
    ],
    te: [
      'రికార్డును ఎలా సవరించాలి?',
      'రికార్డు ఎందుకు ఫ్లాగ్ చేయబడింది?',
      'డూప్లికేట్ రికార్డును ఎలా సమీక్షించాలి?',
      'విద్యార్థికి APAAR ID లేదు, ఏమి చేయాలి?',
    ],
  },
  apaar: {
    en: [
      'Student has no APAAR ID, what do I do?',
      'What is the Aadhaar availability check?',
      'Why is a record flagged?',
      'Where to find reports?',
    ],
    hi: [
      'छात्र के पास APAAR ID नहीं है, क्या करें?',
      'आधार उपलब्धता जांच क्या है?',
      'रिकॉर्ड क्यों फ्लैग किया गया है?',
      'रिपोर्ट कहाँ मिलेंगी?',
    ],
    te: [
      'విద్యార్థికి APAAR ID లేదు, ఏమి చేయాలి?',
      'ఆధార్ లభ్యత తనిఖీ అంటే ఏమిటి?',
      'రికార్డు ఎందుకు ఫ్లాగ్ చేయబడింది?',
      'నివేదికలు ఎక్కడ దొరుకుతాయి?',
    ],
  },
  college: {
    en: [
      'Why is a record flagged?',
      'Where to find reports?',
      'How to review a duplicate?',
      'How do I import an Excel file?',
    ],
    hi: [
      'रिकॉर्ड क्यों फ्लैग किया गया है?',
      'रिपोर्ट कहाँ मिलेंगी?',
      'डुप्लिकेट रिकॉर्ड की समीक्षा कैसे करें?',
      'मैं एक्सेल (Excel) फ़ाइल कैसे इम्पोर्ट करूँ?',
    ],
    te: [
      'రికార్డు ఎందుకు ఫ్లాగ్ చేయబడింది?',
      'నివేదికలు ఎక్కడ దొరుకుతాయి?',
      'డూప్లికేట్ రికార్డును ఎలా సమీక్షించాలి?',
      'ఎక్సెల్ (Excel) ఫైల్ ఎలా దిగుమతి చేయాలి?',
    ],
  },
  aicte: {
    en: [
      'Where to find reports?',
      'Why is a record flagged?',
      'How to review a duplicate?',
      'Student has no APAAR ID, what do I do?',
    ],
    hi: [
      'रिपोर्ट कहाँ मिलेंगी?',
      'रिकॉर्ड क्यों फ्लैग किया गया है?',
      'डुप्लिकेट रिकॉर्ड की समीक्षा कैसे करें?',
      'छात्र के पास APAAR ID नहीं है, क्या करें?',
    ],
    te: [
      'నివేదికలు ఎక్కడ దొరుకుతాయి?',
      'రికార్డు ఎందుకు ఫ్లాగ్ చేయబడింది?',
      'డూప్లికేట్ రికార్డును ఎలా సమీక్షించాలి?',
      'విద్యార్థికి APAAR ID లేదు, ఏమి చేయాలి?',
    ],
  },
  default: {
    en: [
      'How to add a student?',
      'Student has no APAAR ID, what do I do?',
      'How do I import an Excel file?',
      'Why is a record flagged?',
      'How to review a duplicate?',
    ],
    hi: [
      'नया छात्र कैसे जोड़ें?',
      'छात्र के पास APAAR ID नहीं है, क्या करें?',
      'मैं एक्सेल (Excel) फ़ाइल कैसे इम्पोर्ट करूँ?',
      'रिकॉर्ड क्यों फ्लैग किया गया है?',
      'डुप्लिकेट रिकॉर्ड की समीक्षा कैसे करें?',
    ],
    te: [
      'విద్యార్థిని ఎలా చేర్చాలి?',
      'విద్యార్థికి APAAR ID లేదు, ఏమి చేయాలి?',
      'ఎక్సెల్ (Excel) ఫైల్ ఎలా దిగుమతి చేయాలి?',
      'రికార్డు ఎందుకు ఫ్లాగ్ చేయబడింది?',
      'డూప్లికేట్ రికార్డును ఎలా సమీక్షించాలి?',
    ],
  },
};

/**
 * Detects whether user input contains Hindi (Devanagari) or Telugu script characters.
 */
export function detectScriptLanguage(input: string): AssistantLanguage | null {
  if (/[\u0C00-\u0C7F]/.test(input)) {
    return 'te';
  }
  if (/[\u0900-\u097F]/.test(input)) {
    return 'hi';
  }
  return null;
}
