/**
 * ChatView — the full-screen lesson chat client (Panel state D).
 *
 * Layout (top → bottom):
 *   - Header: student name · session type · elapsed timer · language switcher · End Lesson
 *   - Message list with auto-scroll
 *   - Composer: textarea + send + mic + voice-language toggle + TTS toggle
 *
 * Language settings (TTS, STT locale, default mic language) are read from the
 * student's own profile, not from global app settings.
 *
 * Voice input places recognized text into the textarea for review — never auto-sends.
 */
import React, { useEffect, useRef, useState, useCallback } from 'react';
import type { ChatMessage, ActiveSession, StudentProfile } from '../../types/index';
import type { LessonSummary } from '../../types/index';
import { t, isRTL } from '../../i18n/index';
import { speak, stopSpeaking, isTTSSupported } from '../../voice/speechOutput';
import { createSpeechInput } from '../../voice/speechInput';
import { toSpeechLocale, toLanguageCode } from '../../i18n/languageCodes';
import * as lessonController from '../../session/lessonController';
import { MessageBubble } from './MessageBubble';
import { v4 as uuidv4 } from 'uuid';
import {
  lessonOverlay,
  chatHeader,
  chatHeaderTitle,
  chatHeaderMeta,
  messageList,
  chatComposer,
  chatComposerRow,
  chatTextarea,
  iconBtn,
  btnPrimary,
  btnDanger,
  typingIndicator,
  notice,
  palette,
  btnGhost,
  btnSmall,
} from '../styles';

/** Supported UI languages for the in-lesson language dropdown. */
export const UI_LANGUAGES: { name: string; code: string }[] = [
  { name: 'فارسی', code: 'fa' },
  { name: 'English', code: 'en' },
  { name: 'Svenska', code: 'sv' },
  { name: 'Deutsch', code: 'de' },
  { name: 'العربية', code: 'ar' },
];

interface ChatViewProps {
  session: ActiveSession;
  transcript: ChatMessage[];
  student: StudentProfile | null;
  dir: 'ltr' | 'rtl';
  uiLanguageName: string;
  onUiLanguageChange: (name: string) => void;
  onTranscriptChange: (t: ChatMessage[]) => void;
  onLessonEnd: (summary: LessonSummary) => void;
  onAbandon: () => void;
  onMinimize: () => void;
}

/** Formats seconds into HH:MM:SS */
function formatElapsed(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [h, m, s].map((v) => String(v).padStart(2, '0')).join(':');
}

/**
 * Full-screen lesson chat client. Handles message sending, voice I/O, timer, and error recovery.
 * Language settings (TTS on/off, default mic language, STT locale) come from the student profile.
 */
export function ChatView({
  session,
  transcript,
  student,
  dir,
  uiLanguageName,
  onUiLanguageChange,
  onTranscriptChange,
  onLessonEnd,
  onAbandon,
  onMinimize,
}: ChatViewProps): React.ReactElement {
  const [inputText, setInputText] = useState('');
  const [thinking, setThinking] = useState(false);
  const [endingLesson, setEndingLesson] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [endError, setEndError] = useState<string | null>(null);
  // TTS is only meaningful for voice-style sessions; disable it for text-based lessons
  const ttsAllowed = session.sessionType === 'Voice Conversation';
  const [ttsOn, setTtsOn] = useState((student?.ttsEnabled ?? true) && ttsAllowed);
  const [micLang, setMicLang] = useState<'source' | 'target'>(
    student?.defaultVoiceInputLanguage ?? 'target'
  );
  const [isListening, setIsListening] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [interrupted, setInterrupted] = useState(false);
  const [endConfirm, setEndConfirm] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Elapsed timer
  useEffect(() => {
    const startTime = new Date(session.startedAt).getTime();
    const tick = () => setElapsed(Math.floor((Date.now() - startTime) / 1000));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [session.startedAt]);

  // Auto-scroll to newest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript, thinking]);

  // Check for session interruption (URL mismatch after page reload)
  useEffect(() => {
    if (session.conversationUrl && session.conversationUrl !== location.href) {
      setInterrupted(true);
    }
  }, [session.conversationUrl]);

  // Speech recognition — callbacks are stable references via useRef
  const speechInput = useRef(
    createSpeechInput({
      onResult: (text, _isFinal) => {
        setInputText(text);
        if (_isFinal) setIsListening(false);
      },
      onError: (err) => {
        console.warn('[ChatView] Speech recognition error:', err);
        setIsListening(false);
      },
      onEnd: () => setIsListening(false),
    })
  ).current;

  /** Returns the BCP-47 speech locale for the given language slot. */
  const getLocale = useCallback(
    (lang: 'source' | 'target'): string => {
      const name = lang === 'source'
        ? (student?.sourceLanguage ?? 'English')
        : (student?.targetLanguage ?? 'English');
      return toSpeechLocale(toLanguageCode(name));
    },
    [student]
  );

  function toggleMic() {
    if (isListening) {
      speechInput.stop();
      setIsListening(false);
    } else {
      setIsListening(true);
      speechInput.start(getLocale(micLang));
    }
  }

  function toggleMicLang() {
    const next = micLang === 'source' ? 'target' : 'source';
    setMicLang(next);
    if (isListening) {
      speechInput.stop();
      setIsListening(false);
    }
  }

  async function handleSend() {
    const text = inputText.trim();
    if (!text || thinking || endingLesson) return;

    setInputText('');
    setError(null);

    const studentMsg: ChatMessage = {
      id: uuidv4(),
      role: 'student',
      text,
      at: new Date().toISOString(),
    };
    const newTranscript = [...transcript, studentMsg];
    onTranscriptChange(newTranscript);
    await lessonController.saveTranscript(newTranscript);

    setThinking(true);
    try {
      const reply = await lessonController.sendStudentMessage(text);
      const teacherMsg: ChatMessage = {
        id: uuidv4(),
        role: 'teacher',
        text: reply,
        at: new Date().toISOString(),
      };
      const finalTranscript = [...newTranscript, teacherMsg];
      onTranscriptChange(finalTranscript);
      await lessonController.saveTranscript(finalTranscript);

      if (ttsOn && isTTSSupported) {
        speak(reply, getLocale('target'));
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg.includes('timeout') ? t('noResponse') : t('chatGptNotReady'));
    } finally {
      setThinking(false);
    }
  }

  async function handleEndLesson() {
    setEndConfirm(false);
    setEndingLesson(true);
    setEndError(null);
    stopSpeaking();
    try {
      const summary = await lessonController.endLesson();
      onLessonEnd(summary);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setEndError(msg === 'Failed to parse lesson report' || msg.includes('parse')
        ? t('reportParseFailed')
        : t('noResponse'));
      setEndingLesson(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  }

  const targetLocale = getLocale('target');
  const inputDir = isRTL(student?.targetLanguage ?? 'English') ? 'rtl' : 'ltr';
  const targetDir: 'ltr' | 'rtl' = inputDir;
  const micLangLabel = micLang === 'target'
    ? (student?.targetLanguage ?? 'Target').slice(0, 3)
    : (student?.sourceLanguage ?? 'Source').slice(0, 3);

  return (
    <div style={{ ...lessonOverlay, direction: dir }}>
      {/* Header */}
      <div style={chatHeader}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={chatHeaderTitle}>
            {student?.name ?? t('student')}
          </div>
          <div style={chatHeaderMeta}>
            {session.sessionType} · {formatElapsed(elapsed)}
          </div>
        </div>

        {/* UI Language dropdown — always visible */}
        <select
          value={uiLanguageName}
          onChange={(e) => onUiLanguageChange(e.target.value)}
          style={{
            padding: '4px 8px',
            borderRadius: 8,
            border: `1px solid ${palette.border}`,
            fontSize: 12,
            background: palette.bg,
            color: palette.textSecondary,
            cursor: 'pointer',
          }}
          title="Switch UI language"
        >
          {UI_LANGUAGES.map((l) => (
            <option key={l.code} value={l.name}>{l.name}</option>
          ))}
        </select>

        <button
          style={{ ...btnGhost, ...btnSmall }}
          onClick={onMinimize}
          title={t('minimize')}
          aria-label={t('minimize')}
        >
          ↓
        </button>
        <button
          style={{ ...btnDanger, ...btnSmall, opacity: (endingLesson || thinking) ? 0.6 : 1 }}
          onClick={() => setEndConfirm(true)}
          disabled={endingLesson || thinking}
        >
          {endingLesson ? '…' : t('endLesson')}
        </button>
      </div>

      {/* End-lesson error banner (separate from chat message errors) */}
      {endError && (
        <div style={{ ...notice('error'), margin: '0 12px 4px', display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ flex: 1 }}>{endError}</span>
          <button style={{ ...btnDanger, ...btnSmall }} onClick={() => void handleEndLesson()}>
            {t('retryMessage')}
          </button>
        </div>
      )}

      {/* Interrupted session banner */}
      {interrupted && (
        <div style={{ ...notice('warning'), margin: '8px 12px', display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ flex: 1 }}>{t('sessionInterrupted')}</span>
          <button style={{ ...btnGhost, ...btnSmall }} onClick={() => setInterrupted(false)}>
            {t('resumeLesson')}
          </button>
          <button style={{ ...btnDanger, ...btnSmall }} onClick={onAbandon}>
            {t('endLessonNow')}
          </button>
        </div>
      )}

      {/* End lesson confirmation */}
      {endConfirm && (
        <div style={{ ...notice('warning'), margin: '8px 12px', display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ flex: 1 }}>{t('endLesson')}?</span>
          <button style={{ ...btnDanger, ...btnSmall }} onClick={() => void handleEndLesson()}>
            {t('endLessonNow')}
          </button>
          <button style={{ ...btnGhost, ...btnSmall }} onClick={() => setEndConfirm(false)}>
            {t('cancelEdit')}
          </button>
        </div>
      )}

      {/* Message list */}
      <div style={messageList}>
        {/* Connecting indicator — shown while waiting for the teacher's opening message */}
        {transcript.length === 0 && !error && (
          <div style={{ alignSelf: 'flex-start' }}>
            <div style={{ fontSize: 11, color: palette.textMuted, marginBottom: 2 }}>
              {t('connecting')}
            </div>
            <div style={typingIndicator}>
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: palette.textMuted,
                    animation: `bounce 1.2s ${i * 0.2}s ease-in-out infinite`,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {transcript.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            teacherLabel={t('teacher')}
            studentLabel={t('student')}
            onSpeak={(text) => speak(text, targetLocale)}
            ttsSupported={isTTSSupported}
            sourceDir={dir}
            targetDir={targetDir}
          />
        ))}

        {thinking && (
          <div style={{ alignSelf: 'flex-start' }}>
            <div style={{ fontSize: 11, color: palette.textMuted, marginBottom: 2 }}>
              {t('thinking')}
            </div>
            <div style={typingIndicator}>
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: palette.textMuted,
                    animation: `bounce 1.2s ${i * 0.2}s ease-in-out infinite`,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {error && (
          <div style={{ ...notice('error'), display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ flex: 1 }}>{error}</span>
            <button style={{ ...btnGhost, ...btnSmall }} onClick={() => { setError(null); void handleSend(); }}>
              {t('retryMessage')}
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Full-screen blocking overlay while ending — prevents any interaction */}
      {endingLesson && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 10,
          background: 'rgba(247,247,248,0.92)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
          cursor: 'wait',
        }}>
          <div style={typingIndicator}>
            {[0, 1, 2].map((i) => (
              <span key={i} style={{
                width: 12, height: 12, borderRadius: '50%',
                background: palette.primary,
                animation: `bounce 1.2s ${i * 0.2}s ease-in-out infinite`,
              }} />
            ))}
          </div>
          <div style={{ fontWeight: 700, fontSize: 16, color: palette.textPrimary, textAlign: 'center', direction: dir }}>
            {t('endingLesson')}
          </div>
        </div>
      )}

      {/* Composer */}
      <div style={chatComposer}>
        {!speechInput.isSupported && (
          <div style={{ fontSize: 12, color: palette.textMuted }}>{t('voiceUnavailable')}</div>
        )}
        <div style={chatComposerRow}>
          <textarea
            style={chatTextarea}
            value={inputText}
            placeholder={isListening ? t('micListening') : transcript.length === 0 ? t('connecting') : t('sendMessage')}
            rows={1}
            disabled={thinking || endingLesson || transcript.length === 0}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            dir={inputDir}
          />
          <button
            style={{ ...btnPrimary, padding: '8px 14px' }}
            onClick={() => void handleSend()}
            disabled={thinking || endingLesson || !inputText.trim() || transcript.length === 0}
            title={t('sendMessage')}
          >
            ➤
          </button>
        </div>

        {/* Toolbar row */}
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {speechInput.isSupported && (
            <>
              <button
                style={{
                  ...iconBtn,
                  color: isListening ? palette.danger : palette.textSecondary,
                  background: isListening ? palette.dangerLight : 'transparent',
                }}
                onClick={toggleMic}
                title={isListening ? t('micStop') : t('micStart')}
                disabled={thinking || endingLesson}
              >
                {isListening ? '⏹' : '🎙'}
              </button>
              <button
                style={{ ...iconBtn, fontSize: 11, fontWeight: 700 }}
                onClick={toggleMicLang}
                title={t('voiceLanguageToggle')}
                disabled={thinking || endingLesson}
              >
                {micLangLabel}
              </button>
            </>
          )}
          {isTTSSupported && ttsAllowed && (
            <button
              style={{ ...iconBtn, color: ttsOn ? palette.primary : palette.textMuted }}
              onClick={() => { setTtsOn(!ttsOn); stopSpeaking(); }}
              title={t('ttsToggle')}
              disabled={endingLesson}
            >
              {ttsOn ? '🔊' : '🔇'}
            </button>
          )}
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
          40% { transform: scale(1.2); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
