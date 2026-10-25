# Translation Review Checklist (`TRANSLATION_TODO.md`)

> **Important Notice**: The Hindi (`हिन्दी`) and Telugu (`తెలుగు`) strings listed below in `src/data/i18n.ts` and `src/data/assistantKnowledgeBase.ts` are **unverified draft translations**. They require review by native Hindi and Telugu education-domain reviewers before official use.

---

## 1. AI Assistant UI Chrome (`src/data/i18n.ts` -> `ASSISTANT_UI_STRINGS`)

| Key | English Source | Hindi (`hi`) Draft — Needs Native Review | Telugu (`te`) Draft — Needs Native Review | Status |
| :--- | :--- | :--- | :--- | :--- |
| `panelTitle` | APAAR Ready Assistant | APAAR Ready सहायक | APAAR Ready సహాయకుడు | Pending Native Review |
| `offlineHelpPrefix` | Offline Help | ऑफ़लाइन सहायता | ఆఫ్‌లైన్ సహాయం | Pending Native Review |
| `safetyNote` | I explain how to use the app. I cannot change records or verify identities. | मैं ऐप का उपयोग करने का तरीका समझाता हूँ। मैं रिकॉर्ड नहीं बदल सकता और न ही पहचान सत्यापित कर सकता हूँ। | నేను యాప్‌ను ఎలా ఉపయోగించాలో వివరిస్తాను. నేను రికార్డులను మార్చలేను లేదా గుర్తింపులను ధృవీకరించలేను. | Pending Native Review |
| `welcomeHeading` | How can I help you on this page? | इस पेज पर मैं आपकी क्या सहायता कर सकता हूँ? | ఈ పేజీలో నేను మీకు ఎలా సహాయపడగలను? | Pending Native Review |
| `welcomeBodyPrefix` | You are viewing | आप अभी देख रहे हैं: | మీరు ప్రస్తుతం చూస్తున్న పేజీ: | Pending Native Review |
| `welcomeBodySuffix` | . Pick a suggestion below or type a question about adding students, missing APAAR IDs, Excel imports, duplicate reviews, or reports. | । नीचे दिए गए सुझावों में से चुनें या छात्र जोड़ने, अनुपलब्ध APAAR ID, एक्सेल इम्पोर्ट, डुप्लिकेट समीक्षा या रिपोर्ट के बारे में प्रश्न लिखें। | . క్రింది సూచనలలో ఒకదాన్ని ఎంచుకోండి లేదా విద్యార్థులను చేర్చడం, APAAR ID లేకపోవడం, ఎక్సెల్ దిగుమతి, డూప్లికేట్ సమీక్ష లేదా నివేదికల గురించి ప్రశ్న టైప్ చేయండి. | Pending Native Review |
| `navigationStepsLabel` | Navigation Steps: | नेविगेशन चरण (Navigation Steps): | నావిగేషన్ దశలు (Navigation Steps): | Pending Native Review |
| `suggestedForScreenLabel` | Suggested for this screen: | इस स्क्रीन के लिए सुझाव: | ఈ స్క్రీన్ కోసం సూచనలు: | Pending Native Review |
| `inputPlaceholder` | Ask how to use APAAR Ready... | APAAR Ready के उपयोग के बारे में पूछें... | APAAR Ready ఎలా ఉపయోగించాలో అడగండి... | Pending Native Review |
| `sendAriaLabel` | Send question | प्रश्न भेजें | ప్రశ్న పంపండి | Pending Native Review |
| `minimiseLabel` | Minimise assistant panel | सहायक पैनल छोटा करें | సహాయక ప్యానెల్‌ను చిన్నది చేయండి | Pending Native Review |
| `expandLabel` | Expand assistant panel | सहायक पैनल बड़ा करें | సహాయక ప్యానెల్‌ను పెద్దది చేయండి | Pending Native Review |
| `closeLabel` | Close assistant panel | सहायक पैनल बंद करें | సహాయక ప్యానెల్‌ను మూసివేయండి | Pending Native Review |
| `fallbackHeading` | I didn't understand that query. Try one of these search examples or help topics: | मुझे वह प्रश्न समझ नहीं आया। कृपया इन खोज उदाहरणों या सहायता विषयों में से किसी एक को चुनें: | ఆ ప్రశ్న నాకు అర్థం కాలేదు. క్రింది శోధన ఉదాహరణలు లేదా సహాయ అంశాలలో ఒకదాన్ని ప్రయత్నించండి: | Pending Native Review |
| `nlExamplesHeading` | Natural-Language Search Examples: | खोज उदाहरण (Search Examples): | శోధన ఉదాహరణలు (Search Examples): | Pending Native Review |
| `helpTopicsLabel` | Help Topics: | सहायता विषय (Help Topics): | సహాయ అంశాలు (Help Topics): | Pending Native Review |
| `nlInterpretedHeading` | Natural-Language Search Filters Interpreted | खोज फ़िल्टर पहचाने गए | శోధన ఫిల్టర్లు గుర్తించబడ్డాయి | Pending Native Review |
| `openFilteredListBtn` | Open Matching Filtered Student List | फ़िल्टर की गई छात्र सूची खोलें | ఫిల్టర్ చేసిన విద్యార్థుల జాబితాను తెరవండి | Pending Native Review |

---

## 2. Contextual Suggestion Chips (`src/data/i18n.ts` -> `CONTEXTUAL_SUGGESTIONS_I18N`)

| English Chip | Hindi (`hi`) Draft — Needs Native Review | Telugu (`te`) Draft — Needs Native Review | Status |
| :--- | :--- | :--- | :--- |
| How to add a student? | नया छात्र कैसे जोड़ें? | విద్యార్థిని ఎలా చేర్చాలి? | Pending Native Review |
| Student has no APAAR ID, what do I do? | छात्र के पास APAAR ID नहीं है, क्या करें? | విద్యార్థికి APAAR ID లేదు, ఏమి చేయాలి? | Pending Native Review |
| What is the Aadhaar availability check? | आधार उपलब्धता जांच क्या है? | ఆధార్ లభ్యత తనిఖీ అంటే ఏమిటి? | Pending Native Review |
| Why is this field required? | यह फ़ील्ड क्यों आवश्यक है? | ఈ ఫీల్డ్ ఎందుకు తప్పనిసరి? | Pending Native Review |
| How do I import an Excel file? | मैं एक्सेल (Excel) फ़ाइल कैसे इम्पोर्ट करूँ? | ఎక్సెల్ (Excel) ఫైల్ ఎలా దిగుమతి చేయాలి? | Pending Native Review |
| Why is a record flagged? | रिकॉर्ड क्यों फ्लैग किया गया है? | రికార్డు ఎందుకు ఫ్లాగ్ చేయబడింది? | Pending Native Review |
| How to review a duplicate? | डुप्लिकेट रिकॉर्ड की समीक्षा कैसे करें? | డూప్లికేట్ రికార్డును ఎలా సమీక్షించాలి? | Pending Native Review |
| How to correct a record? | रिकॉर्ड में सुधार कैसे करें? | రికార్డును ఎలా సవరించాలి? | Pending Native Review |
| Where to find reports? | रिपोर्ट कहाँ मिलेंगी? | నివేదికలు ఎక్కడ దొరుకుతాయి? | Pending Native Review |

---

## 3. Knowledge Base Topics, Answers & Navigation Steps (`src/data/assistantKnowledgeBase.ts`)

| Intent ID | Section | Hindi (`hi`) Status | Telugu (`te`) Status | Reviewer Notes |
| :--- | :--- | :--- | :--- | :--- |
| `add_student` | Topic Title, Answer, 4 Navigation Steps, Route CTA | Pending Native Review | Pending Native Review | Check UDISE+/AISHE terminology for "4-Step Form" and "Consent". |
| `no_apaar_id` | Topic Title, Answer, 4 Navigation Steps, Route CTA | Pending Native Review | Pending Native Review | Check phrasing for "APAAR prerequisites pending" and guardian consent. |
| `aadhaar_availability_check` | Topic Title, Answer, 4 Navigation Steps, Route CTA | Pending Native Review | Pending Native Review | Verify clarity that Aadhaar check is 100% simulated and never stores raw numbers. |
| `import_file` | Topic Title, Answer, 4 Navigation Steps, Route CTA | Pending Native Review | Pending Native Review | Check terms for "Import Module", "CSV", and "Masking". |
| `why_flagged` | Topic Title, Answer, 4 Navigation Steps, Route CTA | Pending Native Review | Pending Native Review | Verify terms for "Mismatch Flagged" and "Approved Intake". |
| `review_duplicate` | Topic Title, Answer, 4 Navigation Steps, Route CTA | Pending Native Review | Pending Native Review | Ensure "Zero Auto-Merge" safety rule is unambiguous in Hindi and Telugu. |
| `correct_record` | Topic Title, Answer, 4 Navigation Steps, Route CTA | Pending Native Review | Pending Native Review | Check terms for "Title Case" and "Standardize". |
| `find_reports` | Topic Title, Answer, 4 Navigation Steps, Route CTA | Pending Native Review | Pending Native Review | Check terms for "National KPIs", "Intake vs Enrolment", and "Reporting Module". |
