import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Minus,
  Maximize2,
  X,
  Send,
  ArrowUpRight,
  ShieldAlert,
  HelpCircle,
} from 'lucide-react';
import {
  ASSISTANT_KNOWLEDGE_BASE,
  AssistantLanguage,
  getContextualSuggestions,
  getRouteReadableName,
  KnowledgeBaseIntent,
  matchAssistantIntent,
} from '../data/assistantKnowledgeBase';
import {
  ASSISTANT_UI_STRINGS,
  LANGUAGE_OPTIONS,
  detectScriptLanguage,
} from '../data/i18n';
import { useApp } from '../context/AppContext';
import {
  parseNaturalLanguageQuery,
  NaturalLanguageParseResult,
  NL_SEARCH_EXAMPLES,
} from '../utils/naturalLanguageSearch';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  userText?: string;
  matchedIntent?: KnowledgeBaseIntent | null;
  nlSearchParse?: NaturalLanguageParseResult | null;
  routeContextLabel?: string;
  replyLanguage?: AssistantLanguage;
}

// Optional Edge Function flag (off by default, no keys in frontend code)
const ENABLE_EDGE_ASSISTANT_LLM =
  import.meta.env.VITE_ENABLE_ASSISTANT_LLM === 'true';

export const FloatingAiAssistant: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    setActiveNlQuery,
    appLanguage,
    setAppLanguage,
    activeWorkspace,
  } = useApp();

  const [isOpen, setIsOpen] = useState(false);
  const [isMinimised, setIsMinimised] = useState(false);
  // Tracks whether the user explicitly clicked the segmented control in this session
  const [hasExplicitlyChosenLanguage, setHasExplicitlyChosenLanguage] = useState<boolean>(() => {
    try {
      return window.sessionStorage.getItem('apaar_session_lang_explicit') === '1';
    } catch {
      return false;
    }
  });
  const [inputValue, setInputValue] = useState('');
  // Transient in-memory messages only — never persisted to storage, cleared when Close (X) is pressed
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const language: AssistantLanguage = appLanguage;
  const ui = ASSISTANT_UI_STRINGS[language];

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentRouteName = getRouteReadableName(location.pathname);
  const suggestionChips = getContextualSuggestions(location.pathname, language);

  const handleSelectLanguage = (lang: AssistantLanguage) => {
    setAppLanguage(lang);
    setHasExplicitlyChosenLanguage(true);
    try {
      window.sessionStorage.setItem('apaar_session_lang_explicit', '1');
    } catch {
      // ignore
    }
  };

  // Close panel when Esc key is pressed
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        setIsMinimised(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Scroll to newest message when messages change
  useEffect(() => {
    if (isOpen && !isMinimised) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isMinimised]);

  // Explicit Close (X) deletes the in-memory conversation and closes the panel
  const handleClosePanel = () => {
    setIsOpen(false);
    setIsMinimised(false);
    setMessages([]); // Do not store chat history; cleared when Close (X) is pressed
  };

  const handleToggleButton = () => {
    if (isOpen) {
      if (isMinimised) {
        setIsMinimised(false);
        setTimeout(() => inputRef.current?.focus(), 80);
      } else {
        setIsOpen(false);
      }
    } else {
      setIsOpen(true);
      setIsMinimised(false);
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  };

  const resolveWorkspacePath = (rawPath: string): string => {
    if (rawPath.startsWith('/teacher/')) {
      const sub = rawPath.replace(/^\/teacher\/(school\/|college\/)?/, '');
      const base = activeWorkspace === 'school' ? '/teacher/school' : '/teacher/college';
      return sub ? `${base}/${sub}` : base;
    }
    return rawPath;
  };

  const handleAskQuestion = async (rawQuestion: string) => {
    const trimmed = rawQuestion.trim();
    if (!trimmed) return;

    // Auto-detect Devanagari (Hindi) or Telugu script if user has not explicitly chosen a language
    let activeReplyLang: AssistantLanguage = language;
    const detectedScript = detectScriptLanguage(trimmed);
    if (detectedScript && !hasExplicitlyChosenLanguage) {
      activeReplyLang = detectedScript;
      setAppLanguage(detectedScript);
    }

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}-u`,
      sender: 'user',
      userText: trimmed,
    };

    // Check if the query is a natural-language student search filter query
    const nlParsed = parseNaturalLanguageQuery(trimmed);

    // Offline rule-based & fuzzy matching against the built-in TypeScript knowledge base
    const matched = matchAssistantIntent(trimmed, location.pathname);

    // Optional Edge Function hook ("assistant-llm") behind env var, off by default
    if (!matched && !nlParsed.understood && ENABLE_EDGE_ASSISTANT_LLM) {
      try {
        await fetch('/functions/v1/assistant-llm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            question: trimmed,
            route: location.pathname,
            language: activeReplyLang,
          }),
        });
      } catch {
        // Silent fallback to built-in offline topics
      }
    }

    const botMsg: ChatMessage = {
      id: `msg-${Date.now()}-b`,
      sender: 'assistant',
      matchedIntent: matched,
      nlSearchParse: nlParsed.understood ? nlParsed : null,
      routeContextLabel: currentRouteName,
      replyLanguage: activeReplyLang,
    };

    setMessages((prev) => [...prev, userMsg, botMsg]);
    setInputValue('');
    if (isMinimised) setIsMinimised(false);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleAskQuestion(inputValue);
  };

  const handleNavigateOnly = (targetPath: string) => {
    // "Open this page" buttons may only navigate; never mutate data
    navigate(resolveWorkspacePath(targetPath));
  };

  return (
    <div className="fixed bottom-16 sm:bottom-5 right-4 sm:right-6 z-40 flex flex-col items-end pointer-events-none font-multilingual">
      {/* Compact Chat Panel anchored above the button (Clicking outside does NOT delete conversation) */}
      {isOpen && (
        <div
          role="dialog"
          aria-label={ui.panelTitle}
          className="pointer-events-auto mb-3 w-[calc(100vw-1.5rem)] max-w-[388px] bg-white border border-slate-300 rounded-lg shadow-xl overflow-hidden flex flex-col transition-opacity duration-150"
        >
          {/* Panel Header */}
          <div className="bg-[#0B1F3A] text-white px-3.5 py-2.5 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center shrink-0">
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="min-w-0">
                  <div className="font-display font-bold text-xs sm:text-sm leading-tight truncate">
                    {ui.panelTitle}
                  </div>
                  <div className="text-[10px] text-indigo-200 truncate">
                    {ui.offlineHelpPrefix} · {currentRouteName}
                  </div>
                </div>
              </div>

              {/* Visible Minimise (-) and Close (X) Buttons */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsMinimised(!isMinimised)}
                  aria-label={isMinimised ? ui.expandLabel : ui.minimiseLabel}
                  title={isMinimised ? ui.expandLabel : ui.minimiseLabel}
                  className="inline-flex items-center justify-center w-7 h-7 text-slate-200 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-slate-700 rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                >
                  {isMinimised ? (
                    <Maximize2 className="w-3.5 h-3.5" />
                  ) : (
                    <Minus className="w-4 h-4" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleClosePanel}
                  aria-label={ui.closeLabel}
                  title={`${ui.closeLabel} (Esc)`}
                  className="inline-flex items-center justify-center w-7 h-7 text-slate-200 hover:text-white bg-slate-800/80 hover:bg-red-600/80 border border-slate-700 rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Segmented Language Control: English | हिन्दी | తెలుగు */}
            <div
              role="group"
              aria-label="Assistant language selector"
              className="grid grid-cols-3 bg-slate-900/90 border border-slate-700/80 rounded-md p-0.5 text-[11px]"
            >
              {LANGUAGE_OPTIONS.map((opt) => {
                const isSelected = language === opt.code;
                return (
                  <button
                    key={opt.code}
                    type="button"
                    onClick={() => handleSelectLanguage(opt.code)}
                    aria-pressed={isSelected}
                    className={`py-1 px-2 rounded text-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
                      isSelected
                        ? 'bg-indigo-600 text-white font-semibold shadow-2xs'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    {opt.nativeLabel}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mandatory Always-Visible Safety Note (Localized in English / Hindi / Telugu) */}
          <div className="bg-indigo-50/90 border-b border-indigo-100 px-3.5 py-2 text-[11px] text-indigo-950 flex items-start gap-2">
            <ShieldAlert className="w-3.5 h-3.5 text-indigo-700 shrink-0 mt-0.5" />
            <span className="font-medium leading-snug">{ui.safetyNote}</span>
          </div>

          {!isMinimised && (
            <>
              {/* Message Area */}
              <div className="p-3.5 max-h-72 overflow-y-auto space-y-3 bg-[#F8FAFC] text-xs">
                {messages.length === 0 ? (
                  <div className="bg-white border border-slate-200 rounded-md p-3 text-slate-700 space-y-2">
                    <div className="font-semibold text-[#0B1F3A] flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span>{ui.welcomeHeading}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      {ui.welcomeBodyPrefix}
                      <strong>{currentRouteName}</strong>
                      {ui.welcomeBodySuffix}
                    </p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    if (msg.sender === 'user') {
                      return (
                        <div key={msg.id} className="flex justify-end">
                          <div className="bg-[#0B1F3A] text-white px-3 py-2 rounded-md max-w-[85%] text-xs break-words">
                            {msg.userText}
                          </div>
                        </div>
                      );
                    }

                    // Assistant response uses current active language so switching segments updates visible answers
                    const msgUi = ASSISTANT_UI_STRINGS[language];

                    if (msg.nlSearchParse && msg.nlSearchParse.understood) {
                      const nl = msg.nlSearchParse;
                      return (
                        <div
                          key={msg.id}
                          className="bg-white border border-indigo-200 rounded-md p-3 space-y-2.5 text-slate-800"
                        >
                          <div className="font-display font-bold text-xs text-[#0B1F3A]">
                            {msgUi.nlInterpretedHeading}
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {nl.chips.map((c) => (
                              <span
                                key={c.key}
                                className="px-2 py-0.5 rounded bg-indigo-50 border border-indigo-200 text-indigo-900 text-[11px] font-medium"
                              >
                                {c.label}
                              </span>
                            ))}
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveNlQuery(nl.rawQuery);
                              handleNavigateOnly('/teacher/students');
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded bg-[#0B1F3A] text-white text-[11px] font-semibold hover:bg-slate-800 transition-colors"
                          >
                            <span>{msgUi.openFilteredListBtn}</span>
                            <ArrowUpRight className="w-3 h-3" />
                          </button>
                        </div>
                      );
                    }

                    const intent = msg.matchedIntent;
                    if (!intent) {
                      return (
                        <div
                          key={msg.id}
                          className="bg-white border border-slate-200 rounded-md p-3 space-y-2.5 text-slate-700"
                        >
                          <div className="font-semibold text-slate-900 leading-snug">
                            {msgUi.fallbackHeading}
                          </div>
                          <div className="space-y-1">
                            <div className="text-[10px] font-semibold uppercase text-slate-400">
                              {msgUi.nlExamplesHeading}
                            </div>
                            {NL_SEARCH_EXAMPLES.slice(0, 3).map((ex) => (
                              <button
                                key={ex}
                                type="button"
                                onClick={() => handleAskQuestion(ex)}
                                className="block text-left text-[11px] text-indigo-700 hover:underline font-medium"
                              >
                                • &ldquo;{ex}&rdquo;
                              </button>
                            ))}
                          </div>
                          <div className="space-y-1 pt-1 border-t border-slate-100">
                            <div className="text-[10px] font-semibold uppercase text-slate-400">
                              {msgUi.helpTopicsHeading}
                            </div>
                            <ul className="space-y-1">
                              {ASSISTANT_KNOWLEDGE_BASE.map((topic) => (
                                <li key={topic.id}>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleAskQuestion(topic.topicLabels[language])
                                    }
                                    className="text-left text-[11px] text-indigo-700 hover:underline font-medium"
                                  >
                                    • {topic.topicLabels[language]}
                                  </button>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      );
                    }

                    const topicHeading = intent.topicLabels[language] || intent.topicLabel;
                    const answerText = intent.answers[language];
                    const stepList = intent.steps[language];
                    const targetRoutePath = intent.targetRoute
                      ? resolveWorkspacePath(intent.targetRoute.path)
                      : null;
                    const targetRouteLabel = intent.targetRoute
                      ? intent.targetRoute.labels[language] || intent.targetRoute.label
                      : '';

                    return (
                      <div
                        key={msg.id}
                        className="bg-white border border-slate-200 rounded-md p-3 space-y-2.5 text-slate-800"
                      >
                        <div className="font-display font-bold text-xs text-[#0B1F3A]">
                          {topicHeading}
                        </div>
                        <p className="text-[11px] text-slate-600 leading-relaxed">
                          {answerText}
                        </p>

                        <div className="space-y-1 pt-1 border-t border-slate-100">
                          <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                            {msgUi.navigationStepsLabel}
                          </div>
                          <ol className="space-y-1 text-[11px] text-slate-700 list-decimal list-inside">
                            {stepList.map((st, idx) => (
                              <li key={idx} className="leading-snug">
                                {st}
                              </li>
                            ))}
                          </ol>
                        </div>

                        {targetRoutePath && location.pathname !== targetRoutePath && (
                          <div className="pt-1">
                            <button
                              type="button"
                              onClick={() => handleNavigateOnly(targetRoutePath)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded bg-indigo-50 border border-indigo-200 text-indigo-800 text-[11px] font-semibold hover:bg-indigo-100 transition-colors"
                            >
                              <span>{targetRouteLabel}</span>
                              <ArrowUpRight className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Dynamic Contextual Suggestion Chips */}
              <div className="px-3.5 py-2.5 bg-white border-t border-slate-200">
                <div className="text-[10px] font-semibold text-slate-400 mb-1.5">
                  {ui.suggestedForScreenLabel}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {suggestionChips.map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => handleAskQuestion(chip)}
                      className="px-2.5 py-1 rounded bg-slate-100 hover:bg-indigo-50 hover:text-indigo-800 text-slate-700 text-[11px] font-medium transition-colors text-left"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input Box */}
              <form
                onSubmit={handleFormSubmit}
                className="p-2.5 bg-white border-t border-slate-200 flex items-center gap-2"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={ui.inputPlaceholder}
                  aria-label={ui.inputPlaceholder}
                  className="flex-1 rounded-md border border-slate-300 px-3 py-1.5 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none"
                />
                <button
                  type="submit"
                  aria-label={ui.sendAriaLabel}
                  className="p-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </>
          )}
        </div>
      )}

      {/* Floating Round 48px Button with Sparkle Icon, Blue/Purple Accent, Tooltip, and Visible Focus Ring */}
      <div className="relative group pointer-events-auto">
        <span
          role="tooltip"
          className="pointer-events-none absolute right-14 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded bg-[#0B1F3A] text-white text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity shadow-sm"
        >
          {ui.panelTitle}
        </span>

        <button
          type="button"
          onClick={handleToggleButton}
          aria-label={ui.panelTitle}
          title={ui.panelTitle}
          className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 text-white shadow-md hover:from-blue-700 hover:to-purple-700 flex items-center justify-center transition-transform duration-150 active:scale-95 focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-400 focus-visible:ring-offset-2"
        >
          <Sparkles className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
