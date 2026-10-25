import {
  AssistantLanguage,
  CONTEXTUAL_SUGGESTIONS_I18N,
} from './i18n';

export type { AssistantLanguage };

export interface KnowledgeBaseIntent {
  id: string;
  topicLabel: string;
  topicLabels: {
    en: string;
    hi: string;
    te: string;
  };
  keywords: string[];
  answers: {
    en: string;
    hi: string;
    te: string;
  };
  steps: {
    en: string[];
    hi: string[];
    te: string[];
  };
  targetRoute?: {
    label: string;
    labels: {
      en: string;
      hi: string;
      te: string;
    };
    path: string;
  };
}

export const ASSISTANT_KNOWLEDGE_BASE: KnowledgeBaseIntent[] = [
  {
    id: 'add_student',
    topicLabel: 'How to add a new student (4-Step Form)',
    topicLabels: {
      en: 'How to add a new student (4-Step Form)',
      hi: 'नया छात्र कैसे जोड़ें (4-चरण फॉर्म)',
      te: 'కొత్త విద్యార్థిని ఎలా చేర్చాలి (4-దశల ఫారమ్)',
    },
    keywords: [
      'add student',
      'new student',
      'register student',
      'create student',
      'how to add',
      '4 step',
      'wizard',
      '4.1.1',
      'admission form',
      // Devanagari Hindi
      'छात्र जोड़ें',
      'नया छात्र',
      'छात्र कैसे जोड़ें',
      'पंजीकरण',
      'एडमिशन',
      // Telugu Script
      'విద్యార్థిని చేర్చడం',
      'విద్యార్థిని ఎలా చేర్చాలి',
      'కొత్త విద్యార్థి',
      'నమోదు',
      'అడ్మిషన్',
      // Romanized Hindi & Telugu (English letters)
      'naya chhatra',
      'chhatra kaise jode',
      'student kaise add kare',
      'bacha add karna',
      'dakhila',
      'panjikaran',
      'vidyarthi jode',
      'kotha vidyarthi',
      'vidyarthini ela cherchali',
      'cherchadam',
      'namodu',
    ],
    answers: {
      en: 'You can add a fictional student record using the 4-Step Portal Registration Form. The form validates identity readiness, general profile fields (4.1.1–4.1.11), and class/programme intake limits before saving.',
      hi: 'आप 4-चरण पोर्टल पंजीकरण फॉर्म का उपयोग करके एक नया (काल्पनिक) छात्र रिकॉर्ड जोड़ सकते हैं। यह फॉर्म सहेजने से पहले पहचान तत्परता, सामान्य प्रोफ़ाइल (4.1.1–4.1.11) और सीट सीमा की जांच करता है।',
      te: 'మీరు 4-దశల పోర్టల్ రిజిస్ట్రేషన్ ఫారమ్ ద్వారా కొత్త (డెమో) విద్యార్థి రికార్డును చేర్చవచ్చు. ఇది గుర్తింపు సంసిద్ధత, సాధారణ ప్రొఫైల్ (4.1.1–4.1.11) మరియు సీట్ల పరిమితిని తనిఖీ చేస్తుంది.',
    },
    steps: {
      en: [
        'Open the Teacher Portal sidebar and click "Add New Student".',
        'Complete Step 1 (Identity Check): indicate whether the student has an APAAR ID and record parent/guardian consent.',
        'Complete Step 2 (General Profile 4.1.1–4.1.11) and Step 3 (Admission & Academic Details).',
        'In Step 4 (Review & Submit), resolve any red blocking errors and click "Save Student & Write Audit Log".',
      ],
      hi: [
        'शिक्षक पोर्टल साइडबार खोलें और "Add New Student" पर क्लिक करें।',
        'चरण 1 (पहचान जांच) पूरा करें: बताएं कि क्या छात्र के पास पहले से APAAR ID है और अभिभावक की सहमति दर्ज करें।',
        'चरण 2 (सामान्य प्रोफ़ाइल 4.1.1–4.1.11) और चरण 3 (प्रवेश एवं शैक्षणिक विवरण) भरें।',
        'चरण 4 (समीक्षा और सबमिट) में किसी भी ब्लॉकिंग त्रुटि को ठीक करें और "Save Student & Write Audit Log" पर क्लिक करें।',
      ],
      te: [
        'టీచర్ పోర్టల్ సైడ్‌బార్‌లో "Add New Student" క్లిక్ చేయండి.',
        'దశ 1 (ఐడెంటిటీ చెక్) పూర్తి చేయండి: విద్యార్థికి ఇప్పటికే APAAR ID ఉందో లేదో ఎంచుకుని, తల్లిదండ్రుల సమ్మతిని నమోదు చేయండి.',
        'దశ 2 (జనరల్ ప్రొఫైల్ 4.1.1–4.1.11) మరియు దశ 3 (అడ్మిషన్ వివరాలు) పూర్తి చేయండి.',
        'దశ 4 (రివ్యూ & సబ్మిట్) లో బ్లాకింగ్ ఎర్రర్స్ లేకుండా చూసుకుని "Save Student & Write Audit Log" క్లిక్ చేయండి.',
      ],
    },
    targetRoute: {
      label: 'Open this page: Add New Student',
      labels: {
        en: 'Open this page: Add New Student',
        hi: 'यह पेज खोलें: नया छात्र जोड़ें',
        te: 'ఈ పేజీని తెరవండి: కొత్త విద్యార్థిని చేర్చండి',
      },
      path: '/teacher/students/new',
    },
  },
  {
    id: 'no_apaar_id',
    topicLabel: 'Student has no APAAR ID — what to do',
    topicLabels: {
      en: 'Student has no APAAR ID — what to do',
      hi: 'छात्र के पास APAAR ID नहीं है — क्या करें',
      te: 'విద్యార్థికి APAAR ID లేదు — ఏమి చేయాలి',
    },
    keywords: [
      'no apaar',
      'missing apaar',
      'without apaar',
      'does not have apaar',
      'need apaar creation',
      'prerequisites pending',
      'consent',
      'what do i do',
      // Devanagari Hindi
      'अपार नहीं',
      'APAAR ID नहीं है',
      'अपार आईडी नहीं',
      'सहमति',
      'अभिभावक सहमति',
      // Telugu Script
      'అపార్ ఐడి లేదు',
      'APAAR ID లేదు',
      'సమ్మతి',
      'తల్లిదండ్రుల సమ్మతి',
      'ఏమి చేయాలి',
      // Romanized Hindi & Telugu
      'apaar nahi hai',
      'apaar id nahi',
      'bina apaar',
      'sahmati',
      'mata pita sahmati',
      'kya kare',
      'apaar ledu',
      'apaar id ledu',
      'emi cheyali',
      'anumathi',
      'tallidandrula sammati',
    ],
    answers: {
      en: 'If a student does not yet have an APAAR ID, you can still register them. The portal marks the record as "APAAR prerequisites pending" or "Ready for APAAR creation - simulated" once parent/guardian consent is obtained.',
      hi: 'यदि किसी छात्र के पास अभी तक APAAR ID नहीं है, तब भी आप उनका पंजीकरण कर सकते हैं। अभिभावक की सहमति प्राप्त होने पर पोर्टल रिकॉर्ड को "Ready for APAAR creation - simulated" के रूप में चिह्नित करता है।',
      te: 'విద్యార్థికి ఇంకా APAAR ID లేకపోయినా మీరు వారిని నమోదు చేయవచ్చు. తల్లిదండ్రుల సమ్మతి పొందిన తర్వాత పోర్టల్ దానిని "Ready for APAAR creation - simulated" గా సూచిస్తుంది.',
    },
    steps: {
      en: [
        'In Step 1 of Add New Student, select "No" for "Does the student already have an APAAR ID?".',
        'Review the notice confirming the record will be marked "APAAR prerequisites pending".',
        'Collect signed parent/guardian consent and set Consent Status to "Obtained".',
        'Complete Steps 2 and 3 ensuring the school name (4.1.1) and identity card name (4.1.8) match.',
      ],
      hi: [
        'नया छात्र जोड़ें के चरण 1 में, "Does the student already have an APAAR ID?" के लिए "No" चुनें।',
        'अभिभावक से लिखित सहमति प्राप्त करें और Consent Status को "Obtained" पर सेट करें।',
        'चरण 2 और 3 में सुनिश्चित करें कि स्कूल रिकॉर्ड का नाम (4.1.1) और पहचान पत्र का नाम (4.1.8) मेल खाते हैं।',
        'चरण 4 में तत्परता स्थिति की समीक्षा करें और छात्र रिकॉर्ड सहेजें।',
      ],
      te: [
        'Add New Student దశ 1 లో, "Does the student already have an APAAR ID?" కు "No" ఎంచుకోండి.',
        'తల్లిదండ్రుల సమ్మతి పత్రం తీసుకుని Consent Status ను "Obtained" గా మార్చండి.',
        'దశ 2 మరియు 3 లో పాఠశాల రికార్డు పేరు (4.1.1) మరియు కార్డు పేరు (4.1.8) సరిపోలుతున్నాయో లేదో తనిఖీ చేయండి.',
        'దశ 4 లో సంసిద్ధత ఫలితాన్ని చూసి రికార్డును సేవ్ చేయండి.',
      ],
    },
    targetRoute: {
      label: 'Open this page: Identity Check (Step 1)',
      labels: {
        en: 'Open this page: Identity Check (Step 1)',
        hi: 'यह पेज खोलें: पहचान जांच (चरण 1)',
        te: 'ఈ పేజీని తెరవండి: ఐడెంటిటీ చెక్ (దశ 1)',
      },
      path: '/teacher/students/new',
    },
  },
  {
    id: 'aadhaar_availability_check',
    topicLabel: 'What is the Aadhaar availability check & required fields?',
    topicLabels: {
      en: 'What is the Aadhaar availability check & required fields?',
      hi: 'आधार उपलब्धता जांच और आवश्यक फ़ील्ड क्या हैं?',
      te: 'ఆధార్ లభ్యత తనిఖీ మరియు తప్పనిసరి ఫీల్డ్స్ అంటే ఏమిటి?',
    },
    keywords: [
      'aadhaar availability',
      'aadhaar check',
      'why is this field required',
      'refer rule',
      'required field',
      '4.1.7',
      '4.1.8',
      '4.1.9',
      '4.1.10',
      'cwsn',
      // Devanagari Hindi
      'आधार जांच',
      'आधार उपलब्धता',
      'यह फ़ील्ड क्यों आवश्यक है',
      'नियम',
      'अनिवार्य',
      // Telugu Script
      'ఆధార్ తనిఖీ',
      'ఆధార్ లభ్యత',
      'ఈ ఫీల్డ్ ఎందుకు తప్పనిసరి',
      'నియమం',
      'తప్పనిసరి',
      // Romanized Hindi & Telugu
      'aadhaar janch',
      'aadhar check',
      'zaroori field',
      'niyam',
      'aadhaar tanikhi',
      'enduku tappanisariga',
      'niyamam',
    ],
    answers: {
      en: 'The Aadhaar Availability Check in Step 1 is a 100% simulated lookup using fictional 12-digit numbers. It never stores or logs the raw number. Each field card also includes a "[Refer Rule: x]" link explaining what the rule means, why it matters, and how to fix it.',
      hi: 'चरण 1 में आधार उपलब्धता जांच काल्पनिक 12-अंकीय संख्याओं का उपयोग करके केवल एक सिमुलेशन है। यह कभी भी वास्तविक या पूर्ण नंबर संग्रहीत नहीं करता है। प्रत्येक फ़ील्ड कार्ड में "[Refer Rule: x]" लिंक दिया गया है।',
      te: 'దశ 1 లోని ఆధార్ లభ్యత తనిఖీ కేవలం 12-అంకెల నమూనా సంఖ్యలతో చేసే సిమ్యులేషన్ మాత్రమే. ఇది పూర్తి సంఖ్యను ఎప్పుడూ నిల్వ చేయదు. ప్రతి ఫీల్డ్ కార్డులో "[Refer Rule: x]" లింక్ నియమ వివరణను అందిస్తుంది.',
    },
    steps: {
      en: [
        'In Step 1, tick "Check AADHAAR Number Availability" and enter a 12-digit fictional number.',
        'Click "Go" to see the simulated result ("found" for even last digit, "not found" for odd).',
        'Click "[Refer Rule: x]" on any field card to view What it means, Why it matters, and How to fix.',
        'Ensure mandatory fields (Name 4.1.1, Gender 4.1.2, DOB 4.1.3, Parent Name, Admission Date 4.1.9 after DOB, 10-digit Mobile 4.1.10) are completed.',
      ],
      hi: [
        'चरण 1 में "Check AADHAAR Number Availability" चुनें और 12-अंकीय काल्पनिक संख्या दर्ज करें।',
        'सिमुलेटेड परिणाम देखने के लिए "Go" पर क्लिक करें।',
        'किसी भी नियम को समझने के लिए कार्ड के ऊपर "[Refer Rule: x]" पर क्लिक करें।',
        'सभी अनिवार्य फ़ील्ड (नाम, लिंग, जन्म तिथि, प्रवेश तिथि, 10-अंकीय मोबाइल) पूरा करें।',
      ],
      te: [
        'దశ 1 లో "Check AADHAAR Number Availability" ఎంచుకుని 12-అంకెల నమూనా సంఖ్యను నమోదు చేయండి.',
        'సిమ్యులేటెడ్ ఫలితం చూడటానికి "Go" క్లిక్ చేయండి.',
        'నియమం వివరాలు తెలుసుకోవడానికి "[Refer Rule: x]" పై క్లిక్ చేయండి.',
        'తప్పనిసరి ఫీల్డ్స్ (పేరు, లింగం, పుట్టిన తేదీ, అడ్మిషన్ తేదీ, 10-అంకెల మొబైల్) పూర్తి చేయండి.',
      ],
    },
    targetRoute: {
      label: 'Open this page: Student Form Rules',
      labels: {
        en: 'Open this page: Student Form Rules',
        hi: 'यह पेज खोलें: छात्र फॉर्म नियम',
        te: 'ఈ పేజీని తెరవండి: విద్యార్థి ఫారమ్ నియమాలు',
      },
      path: '/teacher/students/new',
    },
  },
  {
    id: 'import_file',
    topicLabel: 'How to import or export an Excel / CSV batch file',
    topicLabels: {
      en: 'How to import or export an Excel / CSV batch file',
      hi: 'एक्सेल / सीएसवी (Excel / CSV) फ़ाइल कैसे इम्पोर्ट या एक्सपोर्ट करें',
      te: 'ఎక్సెల్ / సిఎస్‌వి (Excel / CSV) ఫైల్ ఎలా దిగుమతి లేదా ఎగుమతి చేయాలి',
    },
    keywords: [
      'import',
      'excel',
      'csv',
      'upload',
      'bulk',
      'spreadsheet',
      'how do i import an excel file',
      'file',
      'batch',
      // Devanagari Hindi
      'इंपोर्ट',
      'इम्पोर्ट',
      'एक्सेल',
      'फ़ाइल अपलोड',
      // Telugu Script
      'ఎక్సెల్ దిగుమతి',
      'దిగుమతి',
      'ఎక్సెల్',
      'ఫైల్ అప్‌లోడ్',
      // Romanized Hindi & Telugu
      'excel kaise import kare',
      'file upload kaise kare',
      'csv import',
      'digumati',
      'excel ela digumati cheyali',
    ],
    answers: {
      en: 'For bulk student rosters, institutional ERP spreadsheets (Excel / CSV) are ingested with automatic default masking of 11-digit PEN and 12-digit APAAR IDs. You can also export masked CSV packets and JSON exception logs from the Reporting / Batch Export page.',
      hi: 'बल्क छात्र सूचियों के लिए, संस्थागत एक्सेल/सीएसवी (Excel/CSV) फ़ाइलें डिफ़ॉल्ट PEN और APAAR मास्किंग के साथ लोड की जाती हैं। आप Batch Readiness Export पेज से मास्क्ड CSV पैकेट डाउनलोड कर सकते हैं।',
      te: 'బల్క్ విద్యార్థి జాబితాల కోసం, ఎక్సెల్/సిఎస్‌వి (Excel/CSV) ఫైళ్లు ఆటోమేటిక్ PEN మరియు APAAR మాస్కింగ్‌తో లోడ్ చేయబడతాయి. మీరు Batch Readiness Export పేజీ నుండి CSV ప్యాకెట్లను ఎగుమతి చేయవచ్చు.',
    },
    steps: {
      en: [
        'Prepare your Excel/CSV roster with standard columns: Roll No, Full Name, DOB (YYYY-MM-DD), Gender, 11-digit PEN, and Class/Programme.',
        'Ensure no real Aadhaar numbers are included in bulk demo files.',
        'Open the Import Module in the Teacher Portal to validate and import rows.',
        'Go to Reporting / Batch Readiness Export to generate masked CSV rosters or JSON exception reports.',
      ],
      hi: [
        'मानक कॉलम (रोल नंबर, पूरा नाम, जन्म तिथि, लिंग, 11-अंकीय PEN और कक्षा/प्रोग्राम) के साथ अपनी Excel/CSV फ़ाइल तैयार करें।',
        'सुनिश्चित करें कि डेमो फ़ाइलों में कोई वास्तविक आधार संख्या शामिल न हो।',
        'शिक्षक पोर्टल में Import Module खोलकर पंक्तियों की जांच करें।',
        'मास्क्ड CSV पैकेट तैयार करने के लिए "Reporting Module" या "Batch Readiness Export" पेज खोलें।',
      ],
      te: [
        'రోల్ నంబర్, పూర్తి పేరు, పుట్టిన తేదీ, లింగం, 11-అంకెల PEN మరియు తరగతి/ప్రోగ్రామ్ కాలమ్‌లతో Excel/CSV ఫైల్ సిద్ధం చేయండి.',
        'డెమో ఫైళ్లలో నిజమైన ఆధార్ సంఖ్యలను చేర్చవద్దని నిర్ధారించుకోండి.',
        'టీచర్ పోర్టల్‌లో Import Module తెరిచి రికార్డులను పరిశీలించండి.',
        'మాస్క్ చేసిన CSV ఫైల్ పొందడానికి "Reporting Module" లేదా "Batch Readiness Export" పేజీని తెరవండి.',
      ],
    },
    targetRoute: {
      label: 'Open this page: Import Module',
      labels: {
        en: 'Open this page: Import Module',
        hi: 'यह पेज खोलें: इम्पोर्ट मॉड्यूल',
        te: 'ఈ పేజీని తెరవండి: దిగుమతి మాడ్యూల్',
      },
      path: '/teacher/import',
    },
  },
  {
    id: 'why_flagged',
    topicLabel: 'Why a student record is flagged (Mismatch / Intake / Pending)',
    topicLabels: {
      en: 'Why a student record is flagged (Mismatch / Intake / Pending)',
      hi: 'छात्र रिकॉर्ड क्यों फ्लैग किया गया है (Mismatch / Intake / Pending)',
      te: 'విద్యార్థి రికార్డు ఎందుకు ఫ్లాగ్ చేయబడింది (Mismatch / Intake / Pending)',
    },
    keywords: [
      'why is a record flagged',
      'why flagged',
      'mismatch flagged',
      'flag',
      'warning',
      'error',
      'issue',
      'over intake',
      'discrepancy',
      // Devanagari Hindi
      'क्यों फ्लैग',
      'रिकॉर्ड क्यों फ्लैग',
      'त्रुटि',
      'चेतावनी',
      'नाम अंतर',
      // Telugu Script
      'ఎందుకు ఫ్లాగ్ చేయబడింది',
      'రికార్డు ఎందుకు ఫ్లాగ్',
      'లోపం',
      'హెచ్చరిక',
      'పేరు తేడా',
      // Romanized Hindi & Telugu
      'record kyu flag hai',
      'galat naam',
      'galti',
      'mismatch kya hai',
      'enduku flag ayyindi',
      'tappu',
      'peru teda',
    ],
    answers: {
      en: 'A record is flagged when the pre-verification engine detects formatting variances (such as initials like "K. Varma" vs "Karthikeya Varma", honorific prefixes like "MD.", or non-ISO dates), potential duplicates, or when a class/branch exceeds its sanctioned intake.',
      hi: 'जब प्री-वेरिफिकेशन इंजन नाम के संक्षिप्त रूप (जैसे "K. Varma"), तिथि प्रारूप त्रुटि, संभावित डुप्लिकेट, या स्वीकृत सीट सीमा (Approved Intake) से अधिक नामांकन पाता है, तो रिकॉर्ड को फ्लैग किया जाता है।',
      te: 'పేరులోని ఇంటిపేరు/ఇనిషియల్స్ తేడాలు, తేదీ ఫార్మాట్ లోపాలు, డూప్లికేట్ అనుమానాలు లేదా అనుమతించిన సీట్ల కంటే ఎక్కువ అడ్మిషన్లు ఉన్నప్పుడు రికార్డు ఫ్లాగ్ చేయబడుతుంది.',
    },
    steps: {
      en: [
        'Check the "Verification Status (Simulated)" column and the diagnostic note beneath the student name in the registry.',
        'If flagged as "Mismatch Flagged", open "Student Name Update" or "AI Data Cleaning Lab" to review standardization.',
        'If flagged with a duplicate confidence score, open "Duplicate Records".',
        'If a class or programme is flagged for Over-Intake, check "Approved Intake" or "Admission Reconciliation".',
      ],
      hi: [
        'तालिका में "Verification Status (Simulated)" कॉलम और छात्र के नाम के नीचे नोट देखें।',
        'यदि "Mismatch Flagged" है, तो नाम या जन्म तिथि सुधारने के लिए "Student Name Update" खोलें।',
        'यदि डुप्लिकेट संदेह है, तो "Duplicate Records" में जाएं।',
        'यदि सीट सीमा से अधिक नामांकन है, तो "Approved Intake" देखें।',
      ],
      te: [
        'పట్టికలో "Verification Status (Simulated)" కాలమ్ మరియు విద్యార్థి పేరు కింద ఉన్న నోట్ చూడండి.',
        '"Mismatch Flagged" అని ఉంటే, "Student Name Update" తెరిచి పేరు లేదా తేదీని సరిచేయండి.',
        'డూప్లికేట్ అనుమానం ఉంటే "Duplicate Records" తనిఖీ చేయండి.',
        'సీట్ల పరిమితి మించితే "Approved Intake" చూడండి.',
      ],
    },
    targetRoute: {
      label: 'Open this page: Student Name Update',
      labels: {
        en: 'Open this page: Student Name Update',
        hi: 'यह पेज खोलें: छात्र नाम सुधार',
        te: 'ఈ పేజీని తెరవండి: విద్యార్థి పేరు సవరణ',
      },
      path: '/teacher/name-update',
    },
  },
  {
    id: 'review_duplicate',
    topicLabel: 'How to review a duplicate record (Zero Auto-Merge)',
    topicLabels: {
      en: 'How to review a duplicate record (Zero Auto-Merge)',
      hi: 'डुप्लिकेट रिकॉर्ड की समीक्षा कैसे करें (Zero Auto-Merge)',
      te: 'డూప్లికేట్ రికార్డును ఎలా సమీక్షించాలి (Zero Auto-Merge)',
    },
    keywords: [
      'duplicate',
      'duplicates',
      'merge',
      'delete',
      'keep separate',
      'counselling round',
      'dual seat',
      'how to review a duplicate',
      // Devanagari Hindi
      'डुप्लिकेट',
      'डुप्लिकेट रिकॉर्ड',
      'दोहरा रिकॉर्ड',
      'मर्ज',
      // Telugu Script
      'డూప్లికేట్ సమీక్ష',
      'డూప్లికేట్',
      'రెండు రికార్డులు',
      // Romanized Hindi & Telugu
      'duplicate kaise dekhe',
      'do record',
      'same student',
      'duplicate ela chudali',
      'rendu records',
    ],
    answers: {
      en: 'APAAR Ready enforces a strict Zero Auto-Merge and Zero Deletion policy. Candidate duplicate pairs (sharing a PEN or phonetic name/DOB) are placed in the Duplicate Review Queue for human nodal officer review.',
      hi: 'APAAR Ready में किसी भी रिकॉर्ड को अपने आप मर्ज या डिलीट नहीं किया जाता है। संभावित डुप्लिकेट जोड़े को नोडल अधिकारी की समीक्षा के लिए "Duplicate Records" में रखा जाता है।',
      te: 'APAAR Ready లో రికార్డులు ఆటోమేటిక్‌గా విలీనం (merge) లేదా తొలగించబడవు (delete). డూప్లికేట్ అనుమానిత జతలను అధికారి సమీక్ష కోసం "Duplicate Records" లో ఉంచుతారు.',
    },
    steps: {
      en: [
        'Navigate to "Duplicate Records" in the sidebar.',
        'Compare Record A and Record B side-by-side (class/programme, masked PEN, DOB, and similarity confidence).',
        'Click "Mark as Distinct Students (Keep Separate)" if they are two different individuals.',
        'Click "Flag Pair for Registrar Counselling Audit (No Auto-Merge)" if one seat requires reconciliation.',
      ],
      hi: [
        'साइडबार में "Duplicate Records" पर जाएं।',
        'रिकॉर्ड A और रिकॉर्ड B की साथ-साथ तुलना करें।',
        'यदि वे दो अलग छात्र हैं, तो "Mark as Distinct Students (Keep Separate)" पर क्लिक करें।',
        'यदि अतिरिक्त सीट की जांच आवश्यक है, तो "Flag Pair for Registrar Counselling Audit" चुनें।',
      ],
      te: [
        'సైడ్‌బార్‌లో "Duplicate Records" తెరవండి.',
        'రికార్డు A మరియు రికార్డు B వివరాలను పక్కపక్కనే పోల్చి చూడండి.',
        'ఇద్దరూ వేర్వేరు విద్యార్థులైతే "Mark as Distinct Students (Keep Separate)" క్లిక్ చేయండి.',
        'కౌన్సెలింగ్/అడ్మిషన్ ఆడిట్ అవసరమైతే "Flag Pair for Registrar Counselling Audit" క్లిక్ చేయండి.',
      ],
    },
    targetRoute: {
      label: 'Open this page: Duplicate Records',
      labels: {
        en: 'Open this page: Duplicate Records',
        hi: 'यह पेज खोलें: डुप्लिकेट रिकॉर्ड',
        te: 'ఈ పేజీని తెరవండి: డూప్లికేట్ రికార్డులు',
      },
      path: '/teacher/duplicates',
    },
  },
  {
    id: 'correct_record',
    topicLabel: 'How to correct or standardize a student record',
    topicLabels: {
      en: 'How to correct or standardize a student record',
      hi: 'छात्र रिकॉर्ड में सुधार या मानकीकरण कैसे करें',
      te: 'విద్యార్థి రికార్డును ఎలా సవరించాలి లేదా క్రమబద్ధీకరించాలి',
    },
    keywords: [
      'correct',
      'fix',
      'edit',
      'standardize',
      'clean',
      'update',
      'change record',
      'ai clean',
      'name casing',
      // Devanagari Hindi
      'सुधारें',
      'रिकॉर्ड में सुधार',
      'नाम बदलें',
      'संशोधन',
      // Telugu Script
      'రికార్డు సవరణ',
      'సవరించాలి',
      'పేరు మార్పు',
      'సరిచేయడం',
      // Romanized Hindi & Telugu
      'sudhaar',
      'naam kaise badle',
      'record theek kare',
      'correction kaise kare',
      'peru ela marchali',
      'sari cheyadam',
      'savarana',
    ],
    answers: {
      en: 'You can standardize formatting issues (such as lowercase names, "MD." prefixes, or date formats) using the Student Name Update module or the "Standardize" button in the student table.',
      hi: 'आप "Student Name Update" या छात्र तालिका में मानकीकरण बटन का उपयोग करके नाम के अक्षरों, उपसर्गों या जन्म तिथि के प्रारूप को सुधार सकते हैं।',
      te: 'మీరు "Student Name Update" లేదా విద్యార్థుల పట్టికలోని బటన్ ద్వారా పేరు అక్షరాలు మరియు పుట్టిన తేదీ ఫార్మాట్‌ను సరిచేయవచ్చు.',
    },
    steps: {
      en: [
        'Open "Student Name Update" or "List of All Students" from the Teacher sidebar.',
        'Read the diagnostic note describing the exact formatting variance.',
        'Submit a correction request or approve standardization to normalize the name to Title Case and ISO date format.',
        'Verify the updated status and the audit log entry.',
      ],
      hi: [
        'शिक्षक साइडबार से "Student Name Update" या "All Students" खोलें।',
        'प्रारूप त्रुटि का वर्णन करने वाले नोट को पढ़ें।',
        'नाम और तिथि प्रारूप को सही करने के लिए सुधार अनुरोध सबमिट करें।',
        'अपडेट की गई स्थिति और ऑडिट लॉग प्रविष्टि की पुष्टि करें।',
      ],
      te: [
        'టీచర్ సైడ్‌బార్ నుండి "Student Name Update" లేదా "All Students" తెరవండి.',
        'ఫార్మాట్ లోపాన్ని వివరించే నోట్‌ను పరిశీలించండి.',
        'పేరు మరియు తేదీని క్రమబద్ధీకరించడానికి సవరణ అభ్యర్థనను సమర్పించండి.',
        'మారిన స్థితిని మరియు ఆడిట్ లాగ్ ఎంట్రీని తనిఖీ చేయండి.',
      ],
    },
    targetRoute: {
      label: 'Open this page: Student Name Update',
      labels: {
        en: 'Open this page: Student Name Update',
        hi: 'यह पेज खोलें: छात्र नाम अपडेट',
        te: 'ఈ పేజీని తెరవండి: విద్యార్థి పేరు అప్‌డేట్',
      },
      path: '/teacher/name-update',
    },
  },
  {
    id: 'find_reports',
    topicLabel: 'Where to find reports, intake charts, and national KPIs',
    topicLabels: {
      en: 'Where to find reports, intake charts, and national KPIs',
      hi: 'रिपोर्ट, सीट चार्ट और राष्ट्रीय KPI कहाँ मिलेंगी',
      te: 'నివేదికలు, ఇన్‌టేక్ చార్టులు మరియు జాతీయ KPIలు ఎక్కడ దొరుకుతాయి',
    },
    keywords: [
      'report',
      'reports',
      'export',
      'download',
      'chart',
      'bar chart',
      'kpi',
      'analytics',
      'where to find reports',
      'college overview',
      'aicte',
      'state table',
      // Devanagari Hindi
      'रिपोर्ट',
      'रिपोर्ट कहाँ',
      'डाउनलोड',
      'चार्ट',
      // Telugu Script
      'నివేదికలు',
      'నివేదికలు ఎక్కడ',
      'డౌన్‌లోడ్',
      'చార్ట్',
      // Romanized Hindi & Telugu
      'report kaha milegi',
      'report kaise निकाले',
      'download kaise kare',
      'nivedikalu',
      'reports ekkada',
    ],
    answers: {
      en: 'Reports are organized by portal role: Teachers can export masked CSV/PDF/Excel packets in the Reporting Module; School & College Management can inspect the Intake vs Enrolment bar chart, Analytics, and Reports; AICTE officers can view National KPIs and the State-Wise Compliance Table.',
      hi: 'रिपोर्ट भूमिका के अनुसार उपलब्ध हैं: शिक्षक "Reporting Module" में मास्क्ड रिपोर्ट डाउनलोड कर सकते हैं; प्रबंधन "Intake vs Enrolment" चार्ट और "Reports" देख सकते हैं; और AICTE अधिकारी राष्ट्रीय KPI और राज्य तालिका देख सकते हैं।',
      te: 'నివేదికలు పోర్టల్ వారీగా ఉంటాయి: టీచర్లు "Reporting Module" లో CSV/PDF పొందవచ్చు; మేనేజ్‌మెంట్ "Intake vs Enrolment" చార్ట్ మరియు "Reports" చూడవచ్చు; AICTE అధికారులు జాతీయ KPIలు మరియు రాష్ట్రాల పట్టికను చూడవచ్చు.',
    },
    steps: {
      en: [
        'For Teacher exports: open "Reporting Module" in the sidebar.',
        'For Class/Programme Intake vs Enrolment bar charts: open Management "1. Overview".',
        'For Management PDF/CSV/Excel exports: open Management "13. Reports".',
        'For National KPIs and the State surveillance table: open "/aicte" (AICTE Central Monitoring).',
      ],
      hi: [
        'शिक्षक रिपोर्ट निर्यात के लिए: साइडबार में "Reporting Module" खोलें।',
        'सीट बनाम नामांकन बार चार्ट के लिए: प्रबंधन पोर्टल में "1. Overview" खोलें।',
        'प्रबंधन रिपोर्ट के लिए: "13. Reports" खोलें।',
        'राष्ट्रीय KPI और राज्य तालिका के लिए: "/aicte" खोलें।',
      ],
      te: [
        'టీచర్ రిపోర్ట్ ఎగుమతుల కోసం: సైడ్‌బార్‌లో "Reporting Module" తెరవండి.',
        'ఇన్‌టేక్ వర్సెస్ ఎన్‌రోల్‌మెంట్ బార్ చార్ట్ కోసం: మేనేజ్‌మెంట్ పోర్టల్‌లో "1. Overview" తెరవండి.',
        'మేనేజ్‌మెంట్ నివేదికల కోసం: "13. Reports" తెరవండి.',
        'జాతీయ KPIలు మరియు రాష్ట్రాల పట్టిక కోసం: "/aicte" తెరవండి.',
      ],
    },
    targetRoute: {
      label: 'Open this page: Reporting Module',
      labels: {
        en: 'Open this page: Reporting Module',
        hi: 'यह पेज खोलें: रिपोर्टिंग मॉड्यूल',
        te: 'ఈ పేజీని తెరవండి: రిపోర్టింగ్ మాడ్యూల్',
      },
      path: '/teacher/reporting',
    },
  },
];

// Context-sensitive suggestion chips based on the active route and selected language
export function getContextualSuggestions(
  pathname: string,
  language: AssistantLanguage = 'en'
): string[] {
  if (pathname.includes('/students/new')) {
    return CONTEXTUAL_SUGGESTIONS_I18N.new_student[language];
  }
  if (pathname.includes('/export') || pathname.includes('/import') || pathname.includes('/reporting')) {
    return CONTEXTUAL_SUGGESTIONS_I18N.import_export[language];
  }
  if (pathname.includes('/duplicates')) {
    return CONTEXTUAL_SUGGESTIONS_I18N.duplicates[language];
  }
  if (
    pathname.includes('/cleaning') ||
    pathname.includes('/name-update') ||
    pathname.includes('/requests') ||
    pathname.includes('/data-quality')
  ) {
    return CONTEXTUAL_SUGGESTIONS_I18N.cleaning[language];
  }
  if (pathname.includes('/apaar') || pathname.includes('/identity-verification')) {
    return CONTEXTUAL_SUGGESTIONS_I18N.apaar[language];
  }
  if (pathname.startsWith('/college') || pathname.startsWith('/school-management')) {
    return CONTEXTUAL_SUGGESTIONS_I18N.college[language];
  }
  if (pathname.startsWith('/aicte')) {
    return CONTEXTUAL_SUGGESTIONS_I18N.aicte[language];
  }
  return CONTEXTUAL_SUGGESTIONS_I18N.default[language];
}

// Lightweight Levenshtein distance for fuzzy token matching
function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }
  return dp[m][n];
}

export function matchAssistantIntent(
  query: string,
  currentPathname: string
): KnowledgeBaseIntent | null {
  const normalized = query
    .toLowerCase()
    .replace(/[?.,!|।]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!normalized) return null;

  const queryWords = normalized.split(' ').filter((w) => w.length >= 2);

  let bestIntent: KnowledgeBaseIntent | null = null;
  let bestScore = 0;

  for (const intent of ASSISTANT_KNOWLEDGE_BASE) {
    let score = 0;

    // Also check localized topic labels
    for (const labelVal of Object.values(intent.topicLabels)) {
      if (normalized === labelVal.toLowerCase()) {
        score += 20;
      }
    }

    for (const kw of intent.keywords) {
      const kwLower = kw.toLowerCase();
      if (normalized.includes(kwLower)) {
        // Strong exact phrase or substring match
        score += kwLower.includes(' ') ? 12 : 6;
      } else {
        // Fuzzy word-level matching (works for English, Hindi/Telugu script, and Romanized words)
        const kwWords = kwLower.split(' ');
        for (const qWord of queryWords) {
          for (const kWord of kwWords) {
            if (qWord === kWord) {
              score += 3;
            } else if (
              qWord.length >= 4 &&
              kWord.length >= 4 &&
              levenshteinDistance(qWord, kWord) <= 1
            ) {
              score += 2;
            }
          }
        }
      }
    }

    // Contextual route boost if query is general
    if (
      currentPathname.includes('/students/new') &&
      (intent.id === 'aadhaar_availability_check' || intent.id === 'no_apaar_id')
    ) {
      if (
        normalized.includes('field') ||
        normalized.includes('rule') ||
        normalized.includes('step') ||
        normalized.includes('फ़ील्ड') ||
        normalized.includes('ఫీల్డ్')
      ) {
        score += 4;
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestIntent = intent;
    }
  }

  return bestScore >= 3 ? bestIntent : null;
}

export function getRouteReadableName(pathname: string): string {
  const p = pathname.replace(/\/+$/, '') || '/';

  // Teacher Portal (School & College workspaces)
  if (p === '/teacher' || p === '/teacher/school') {
    return 'School Dashboard';
  }
  if (p === '/teacher/college') {
    return 'College Dashboard';
  }
  if (p.endsWith('/profile') && p.startsWith('/teacher')) {
    return 'Institution Profile';
  }
  if (p.endsWith('/programmes') && p.startsWith('/teacher')) {
    return p.includes('/school/') ? 'Classes and Sections' : 'Programmes and Sections';
  }
  if (p.endsWith('/intake') && p.startsWith('/teacher')) {
    return 'Approved Intake';
  }
  if (p.endsWith('/requests')) {
    return 'Request Management';
  }
  if (p.endsWith('/name-update')) {
    return 'Student Name Update';
  }
  if (p.endsWith('/students') && p.startsWith('/teacher')) {
    return 'All Students';
  }
  if (p.endsWith('/students/new')) {
    return 'Add New Student';
  }
  if (p.includes('/students/') && p.endsWith('/summary')) {
    return 'Printable Student Summary Card';
  }
  if (p.endsWith('/apaar')) {
    return 'APAAR Module';
  }
  if (p.endsWith('/section-shift')) {
    return 'Section Shift';
  }
  if (p.endsWith('/progression')) {
    return 'Progression Activity';
  }
  if (p.endsWith('/import')) {
    return 'Import Module';
  }
  if (p.endsWith('/dropbox')) {
    return 'Dropbox / Inactive Student List';
  }
  if (p.endsWith('/transfer-certificate')) {
    return 'Transfer Certificate Module / Mark Dropout';
  }
  if (p.endsWith('/inactivate')) {
    return 'Inactivate Student Module';
  }
  if (p.endsWith('/reporting')) {
    return 'Reporting Module';
  }
  if (p.endsWith('/certification')) {
    return p.includes('/school/') ? 'School Certification' : 'College Certification';
  }
  if (p.endsWith('/duplicates') && p.startsWith('/teacher')) {
    return 'Duplicate Records';
  }
  if (p.endsWith('/global-search')) {
    return 'Global Student Search';
  }
  if (p.endsWith('/validation-guide')) {
    return 'Form Fields Validation Guide';
  }
  if (p.endsWith('/notifications')) {
    return 'Notifications';
  }
  if (p.endsWith('/settings') && p.startsWith('/teacher')) {
    return 'Settings & Rollover';
  }
  if (p.endsWith('/help')) {
    return 'Help & Support';
  }
  if (p.endsWith('/cleaning')) {
    return 'AI Data Cleaning Lab';
  }
  if (p.endsWith('/export')) {
    return 'Batch Readiness Export';
  }

  // School & College Management Portals
  if (p === '/school-management') {
    return 'School Management Overview';
  }
  if (p === '/college') {
    return 'College Management Overview';
  }
  if ((p.startsWith('/school-management') || p.startsWith('/college')) && p.endsWith('/profile')) {
    return 'Institution Profile';
  }
  if (p.endsWith('/classes-sections') || p.endsWith('/departments')) {
    return p.startsWith('/school-management') ? 'Classes and Sections' : 'Programmes and Sections';
  }
  if (p.endsWith('/approved-intake')) {
    return 'Approved Intake';
  }
  if (p.endsWith('/admissions')) {
    return 'Student Admissions';
  }
  if ((p.startsWith('/school-management') || p.startsWith('/college')) && p.endsWith('/students')) {
    return 'Student Records';
  }
  if (p.endsWith('/data-quality') || p.endsWith('/ai-audit')) {
    return 'Data Quality';
  }
  if ((p.startsWith('/school-management') || p.startsWith('/college')) && p.endsWith('/duplicates')) {
    return 'Duplicate Records';
  }
  if (p.endsWith('/apaar-readiness')) {
    return 'APAAR Readiness';
  }
  if (p.endsWith('/identity-verification')) {
    return 'Identity Verification';
  }
  if (p.endsWith('/reconciliation') || p.endsWith('/alerts')) {
    return 'Admission Reconciliation';
  }
  if (p.endsWith('/analytics')) {
    return 'Analytics';
  }
  if (p.endsWith('/reports')) {
    return 'Reports';
  }
  if (p.endsWith('/staff')) {
    return 'Staff and Permissions';
  }
  if (p.endsWith('/audit-logs') || p.endsWith('/audit')) {
    return 'Audit Logs';
  }
  if ((p.startsWith('/school-management') || p.startsWith('/college')) && p.endsWith('/settings')) {
    return 'Settings';
  }

  // AICTE Portal
  if (p === '/aicte') {
    return 'National KPIs & States';
  }
  if (p === '/aicte/institutions') {
    return 'Institution Directory (Colleges)';
  }
  if (p === '/aicte/advisories') {
    return 'Intake Governance Advisories';
  }
  if (p === '/aicte/standards') {
    return 'Policy & Schema Standards';
  }
  if (p === '/dev/health') {
    return 'System & Supabase Health';
  }
  if (p === '/what-is-simulated') {
    return 'What Is Simulated';
  }
  if (p === '/not-permitted') {
    return 'Not Permitted';
  }

  return 'APAAR Ready Portal';
}
