/**
 * Panel — root React component for the AI Language Teacher extension.
 *
 * Panel states (mutually exclusive, in priority order):
 *   D. Lesson  — activeSession non-null: full-screen lesson overlay
 *   B. Launcher — collapsed: small 56px circle (top-right)
 *   C. Control Panel — expanded: 360px card (top-right)
 *
 * A permanent UI-language dropdown is shown in both the Control Panel header and the
 * Lesson overlay header. It defaults to English and can be changed at any time.
 * When a lesson starts, the UI language automatically switches to the student's
 * sourceLanguage (if it has a supported translation table).
 *
 * Language settings (sourceLanguage, targetLanguage, memoryDepth, TTS, mic) are now
 * per-student and live in StudentProfile — there is no global setup wizard.
 */
import React, { useState, useEffect, useCallback } from 'react';
import type { AppSettings, ActiveSession, ChatMessage, LessonSummary, SessionType, StudentProfile } from '../types/index';
import { getSettings } from '../storage/settingsRepository';
import * as studentRepo from '../storage/studentRepository';
import { setLanguage, isRTL, t } from '../i18n/index';
import { readSession, writeSession } from '../storage/storageHelper';
import { Tab } from './components/Tab';
import type { TabDef } from './components/Tab';
import { ChatView, UI_LANGUAGES } from './components/ChatView';
import { VoiceView } from './components/VoiceView';
import { LessonTab } from './tabs/LessonTab';
import { StudentsTab } from './tabs/StudentsTab';
import { HistoryTab } from './tabs/HistoryTab';
import { DataTab } from './tabs/DataTab';
import * as lessonController from '../session/lessonController';
import * as voiceLessonController from '../session/voiceLessonController';
import { launcherBtn, card, cardHeader, cardTitle, cardBody, palette, notice } from './styles';

interface PanelProps {
  host: HTMLDivElement;
}

type PanelTab = 'lesson' | 'students' | 'history' | 'data';

/**
 * Root panel component. Manages all top-level state and navigation.
 */
export function Panel({ host }: PanelProps): React.ReactElement {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(null);
  const [transcript, setTranscript] = useState<ChatMessage[]>([]);
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<PanelTab>('lesson');
  const [lessonComplete, setLessonComplete] = useState<LessonSummary | null>(null);
  const [startError, setStartError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const [chatMinimized, setChatMinimized] = useState(false);

  // UI language — persisted to storage so it survives page reload and browser restart.
  const [uiLanguageName, setUiLanguageName] = useState<string>('فارسی');

  // ── Initial load ──────────────────────────────────────────────────────────

  const loadAll = useCallback(async () => {
    // Restore persisted UI language first; fall back to Persian.
    const savedLang = await readSession<string>('uiLanguage', 'فارسی');
    setUiLanguageName(savedLang);
    setLanguage(savedLang);

    const s = await getSettings();
    setSettings(s);

    const session = await readSession<ActiveSession | null>('activeSession', null);
    setActiveSession(session);

    const tx = await readSession<ChatMessage[]>('transcript', []);
    setTranscript(tx);

    if (session) {
      const st = await studentRepo.getById(session.studentId);
      setStudent(st);
      // If resuming an active session, switch display to the student's source language
      // (in-memory only — do NOT save this over the user's own preference).
      if (st?.sourceLanguage) {
        setUiLanguageName(st.sourceLanguage);
        setLanguage(st.sourceLanguage);
      }
    }
  }, []);

  useEffect(() => { void loadAll(); }, [loadAll]);

  // ── Subscribe to chrome.storage.onChanged ─────────────────────────────────

  useEffect(() => {
    function handleStorageChange(
      changes: Record<string, chrome.storage.StorageChange>,
      areaName: string
    ) {
      if (areaName === 'local') {
        if ('activeSession' in changes) {
          const newSession = changes['activeSession'].newValue as ActiveSession | null ?? null;
          setActiveSession(newSession);
          if (newSession) {
            studentRepo.getById(newSession.studentId).then(setStudent).catch(console.error);
          } else {
            setStudent(null);
          }
        }
        if ('transcript' in changes) {
          setTranscript(changes['transcript'].newValue as ChatMessage[] ?? []);
        }
        if ('appSettings' in changes) {
          const newSettings = changes['appSettings'].newValue as AppSettings | null ?? null;
          setSettings(newSettings);
        }
      }
    }
    chrome.storage.onChanged.addListener(handleStorageChange);
    return () => chrome.storage.onChanged.removeListener(handleStorageChange);
  }, []);

  // ── Host element sizing ───────────────────────────────────────────────────

  useEffect(() => {
    if (activeSession?.sessionType === 'Voice Conversation') {
      host.style.cssText = 'position:fixed; inset:0; z-index:2147483000; width:100%; height:100%;';
    } else if (activeSession && chatMinimized) {
      // Minimized text lesson: hide the overlay but keep a zero-size anchor so the
      // restore button (rendered with position:fixed) can still appear.
      host.style.cssText = 'position:fixed; top:0; right:0; z-index:2147483000; width:0; height:0;';
    } else if (activeSession) {
      host.style.cssText = 'position:fixed; inset:0; z-index:2147483000; width:100%; height:100%;';
    } else {
      host.style.cssText = 'position:fixed; top:0; right:0; z-index:2147483000; width:0; height:0;';
    }
  }, [activeSession, chatMinimized, host]);

  // ── UI language handler ───────────────────────────────────────────────────

  function handleUiLanguageChange(name: string) {
    setUiLanguageName(name);
    setLanguage(name);
    // Persist the user's explicit choice so it survives refresh and browser restart.
    void writeSession('uiLanguage', name);
  }

  // Switches UI language in-memory only — used during lesson start so the auto-switch
  // to the student's source language does not overwrite the user's saved preference.
  function applyLanguageInMemory(name: string) {
    setUiLanguageName(name);
    setLanguage(name);
  }

  // ── Derived ───────────────────────────────────────────────────────────────

  const dir = isRTL(uiLanguageName) ? 'rtl' : 'ltr';

  // ── Lesson start ──────────────────────────────────────────────────────────

  async function handleLessonStart(studentId: string, sessionType: SessionType) {
    setStartError(null);
    setStarting(true);
    console.log('[Panel] handleLessonStart — studentId:', studentId, 'sessionType:', sessionType);
    try {
      const st = await studentRepo.getById(studentId);
      console.log('[Panel] student loaded:', st ? `${st.name} (${st.sourceLanguage}→${st.targetLanguage})` : 'NOT FOUND');
      if (st?.sourceLanguage) {
        // In-memory switch only — don't overwrite the user's saved language preference.
        applyLanguageInMemory(st.sourceLanguage);
      }
      if (sessionType === 'Voice Conversation') {
        await voiceLessonController.startVoiceLesson(studentId);
      } else {
        await lessonController.startLesson(studentId, sessionType);
      }
      console.log('[Panel] lesson started successfully');
    } catch (err) {
      console.error('[Panel] handleLessonStart FAILED:', err);
      console.error('[Panel] error name:', err instanceof Error ? err.name : typeof err);
      console.error('[Panel] error message:', err instanceof Error ? err.message : String(err));
      if (err instanceof Error && err.stack) console.error('[Panel] stack:', err.stack);
      const msg = err instanceof Error ? err.message : String(err);
      setStartError(msg.includes('not-ready') ? t('chatGptNotReady') : t('startFailed'));
    } finally {
      setStarting(false);
    }
  }

  // ── Lesson end ────────────────────────────────────────────────────────────

  async function restoreUserLanguage() {
    const savedLang = await readSession<string>('uiLanguage', 'فارسی');
    setUiLanguageName(savedLang);
    setLanguage(savedLang);
  }

  function handleLessonEnd(summary: LessonSummary) {
    setLessonComplete(summary);
    setActiveSession(null);
    setTranscript([]);
    setChatMinimized(false);
    void restoreUserLanguage();
  }

  async function handleAbandon() {
    if (activeSession?.sessionType === 'Voice Conversation') {
      await voiceLessonController.abandonVoiceLesson();
    } else {
      await lessonController.abandonLesson();
    }
    setActiveSession(null);
    setTranscript([]);
    setChatMinimized(false);
    void restoreUserLanguage();
  }

  // ── Rendering ─────────────────────────────────────────────────────────────

  // D. Lesson overlay (active session) — takes priority over everything else
  if (activeSession && settings !== undefined) {
    if (activeSession.sessionType === 'Voice Conversation') {
      return (
        <VoiceView
          session={activeSession}
          student={student}
          dir={dir}
          uiLanguageName={uiLanguageName}
          onUiLanguageChange={handleUiLanguageChange}
          onLessonEnd={handleLessonEnd}
          onAbandon={() => void handleAbandon()}
        />
      );
    }

    // Minimized text lesson: host is shrunken to 0×0 so ChatGPT is fully visible.
    // Show a floating restore button so the user can get back to the chat.
    if (chatMinimized) {
      return (
        <button
          style={{
            ...launcherBtn,
            bottom: 24,
            right: 24,
            fontSize: 20,
          }}
          onClick={() => setChatMinimized(false)}
          title={t('appTitle')}
          aria-label={t('appTitle')}
        >
          📚
        </button>
      );
    }

    return (
      <ChatView
        session={activeSession}
        transcript={transcript}
        student={student}
        dir={dir}
        uiLanguageName={uiLanguageName}
        onUiLanguageChange={handleUiLanguageChange}
        onTranscriptChange={setTranscript}
        onLessonEnd={handleLessonEnd}
        onAbandon={() => void handleAbandon()}
        onMinimize={() => setChatMinimized(true)}
      />
    );
  }

  // The language dropdown shown in the control-panel header
  const languageDropdown = (
    <select
      value={uiLanguageName}
      onChange={(e) => handleUiLanguageChange(e.target.value)}
      style={{
        padding: '3px 7px',
        borderRadius: 8,
        border: `1px solid ${palette.border}`,
        fontSize: 12,
        background: palette.bg,
        color: palette.textSecondary,
        cursor: 'pointer',
        maxWidth: 110,
      }}
      title="Switch UI language"
    >
      {UI_LANGUAGES.map((l) => (
        <option key={l.code} value={l.name}>{l.name}</option>
      ))}
    </select>
  );

  // B. Launcher (collapsed) — small circle
  if (!expanded) {
    return (
      <div>
        {/* Lesson complete summary toast */}
        {lessonComplete && (
          <div style={{ position: 'fixed', top: 80, right: 16, width: 300, background: '#fff', borderRadius: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.15)', padding: 16, zIndex: 1, direction: dir }}>
            <div style={{ fontWeight: 700, marginBottom: 4, color: palette.primary }}>
              🎉 {t('lessonComplete')}
            </div>
            <div style={{ fontSize: 13, color: palette.textSecondary }}>
              {t('overallScore')}: {lessonComplete.overallScore}/100
            </div>
            <button
              style={{ position: 'absolute', top: 10, right: 10, background: 'transparent', border: 'none', color: palette.textMuted, cursor: 'pointer', fontSize: 18 }}
              onClick={() => setLessonComplete(null)}
            >
              ×
            </button>
          </div>
        )}
        <button
          style={launcherBtn}
          onClick={() => setExpanded(true)}
          title={t('appTitle')}
          aria-label={t('appTitle')}
        >
          🎓
        </button>
      </div>
    );
  }

  // C. Control panel (expanded)
  const tabs: TabDef[] = [
    { id: 'lesson', label: t('tabLesson') },
    { id: 'students', label: t('tabStudents') },
    { id: 'history', label: t('tabHistory') },
    { id: 'data', label: t('tabData') },
  ];

  return (
    <div style={{ ...card, direction: dir }}>
      {/* Header */}
      <div style={cardHeader}>
        <span style={cardTitle}>{t('appTitle')}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {languageDropdown}
          <button
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: palette.textSecondary, padding: '0 4px' }}
            onClick={() => setExpanded(false)}
            title={t('minimize')}
            aria-label={t('minimize')}
          >
            ×
          </button>
        </div>
      </div>

      {/* Tab bar */}
      <Tab
        tabs={tabs}
        activeId={activeTab}
        onSelect={(id) => setActiveTab(id as PanelTab)}
        dir={dir}
      />

      {/* Tab content */}
      <div style={cardBody}>
        {startError && (
          <div style={{ ...notice('error'), margin: '8px 16px' }}>{startError}</div>
        )}
        {starting && (
          <div style={{ ...notice('info'), margin: '8px 16px' }}>Starting lesson…</div>
        )}

        {activeTab === 'lesson' && (
          <LessonTab
            dir={dir}
            onStart={(studentId, sessionType) => void handleLessonStart(studentId, sessionType)}
            onGoToStudents={() => setActiveTab('students')}
          />
        )}
        {activeTab === 'students' && (
          <StudentsTab dir={dir} />
        )}
        {activeTab === 'history' && (
          <HistoryTab dir={dir} />
        )}
        {activeTab === 'data' && settings && (
          <DataTab settings={settings} dir={dir} />
        )}
      </div>
    </div>
  );
}

