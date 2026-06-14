/**
 * VoiceView — full-screen overlay shown during a Voice Conversation session.
 *
 * Covers the entire viewport (same as ChatView) so ChatGPT is hidden underneath.
 * Shows session info, animated voice status, and the End Session control.
 */
import React, { useEffect, useState } from 'react';
import type { ActiveSession, StudentProfile, LessonSummary } from '../../types/index';
import { t } from '../../i18n/index';
import * as voiceLessonController from '../../session/voiceLessonController';
import { UI_LANGUAGES } from './ChatView';
import {
  lessonOverlay,
  chatHeader,
  chatHeaderTitle,
  chatHeaderMeta,
  palette,
  notice,
  btnDanger,
  btnSmall,
  btnGhost,
} from '../styles';

interface VoiceViewProps {
  session: ActiveSession;
  student: StudentProfile | null;
  dir: 'ltr' | 'rtl';
  uiLanguageName: string;
  onUiLanguageChange: (name: string) => void;
  onLessonEnd: (summary: LessonSummary) => void;
  onAbandon: () => void;
}

function formatElapsed(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [h, m, s].map((v) => String(v).padStart(2, '0')).join(':');
}

export function VoiceView({
  session,
  student,
  dir,
  uiLanguageName,
  onUiLanguageChange,
  onLessonEnd,
  onAbandon,
}: VoiceViewProps): React.ReactElement {
  const [elapsed, setElapsed] = useState(0);
  const [ending, setEnding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [endConfirm, setEndConfirm] = useState(false);

  useEffect(() => {
    const startTime = new Date(session.startedAt).getTime();
    const tick = () => setElapsed(Math.floor((Date.now() - startTime) / 1000));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [session.startedAt]);

  async function handleEndSession() {
    setEndConfirm(false);
    setEnding(true);
    setError(null);
    try {
      const summary = await voiceLessonController.endVoiceLesson();
      onLessonEnd(summary);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(
        msg === 'Failed to parse lesson report' || msg.includes('parse')
          ? t('reportParseFailed')
          : t('noResponse')
      );
      setEnding(false);
    }
  }

  const voiceStatus = session.voiceModeActivated === false
    ? 'activating'
    : session.voiceModeActivated
    ? 'active'
    : 'not-found';

  return (
    <div style={{ ...lessonOverlay, direction: dir }}>
      {/* Header */}
      <div style={{ ...chatHeader, direction: dir }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={chatHeaderTitle}>
            🎙 {student?.name ?? t('student')}
          </span>
          <span style={chatHeaderMeta}>
            {t('voiceConversation')} · {formatElapsed(elapsed)}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Language dropdown */}
          <select
            value={uiLanguageName}
            onChange={(e) => onUiLanguageChange(e.target.value)}
            style={{
              padding: '3px 6px',
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

          {/* Abandon (×) */}
          {!ending && (
            <button
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: palette.textMuted, padding: '0 4px' }}
              onClick={onAbandon}
              title={t('abandon')}
              aria-label={t('abandon')}
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Center status area */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 24,
        padding: 32,
      }}>
        {/* Microphone icon with pulse animation */}
        {!ending && (
          <div style={{
            width: 96,
            height: 96,
            borderRadius: '50%',
            background: voiceStatus === 'active' ? palette.primaryLight : palette.bgHover,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 44,
            boxShadow: voiceStatus === 'active'
              ? `0 0 0 12px ${palette.primaryLight}, 0 0 0 24px rgba(16,163,127,0.08)`
              : 'none',
            transition: 'box-shadow 0.5s',
          }}>
            🎙
          </div>
        )}

        {/* Voice status text */}
        {!ending && (
          <div style={{ textAlign: 'center', maxWidth: 400 }}>
            {voiceStatus === 'active' && (
              <div style={{ fontSize: 18, fontWeight: 600, color: palette.primary }}>
                {t('voiceSessionHint')}
              </div>
            )}
            {voiceStatus === 'activating' && (
              <div style={{ fontSize: 16, color: palette.textMuted }}>
                {t('voiceModeActivating')}
              </div>
            )}
            {voiceStatus === 'not-found' && (
              <div style={{ ...notice('warning'), maxWidth: 360 }}>
                {t('voiceModeNotFound')}
              </div>
            )}
            <div style={{ fontSize: 13, color: palette.textMuted, marginTop: 12 }}>
              {student?.sourceLanguage && student?.targetLanguage
                ? `${student.sourceLanguage} → ${student.targetLanguage}`
                : ''}
            </div>
          </div>
        )}

        {/* Ending state */}
        {ending && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>⏳</div>
            <div style={{ ...notice('info'), fontSize: 15 }}>
              {t('endingVoiceLesson')}
            </div>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <div style={{ ...notice('error'), maxWidth: 360 }}>{error}</div>
            <button
              style={{ ...btnDanger, ...btnSmall }}
              onClick={() => void handleEndSession()}
            >
              {t('retryMessage')}
            </button>
          </div>
        )}

        {/* End confirm */}
        {endConfirm && !ending && (
          <div style={{ ...notice('warning'), display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', maxWidth: 360 }}>
            <span style={{ flex: 1 }}>{t('endLesson')}?</span>
            <button style={{ ...btnDanger, ...btnSmall }} onClick={() => void handleEndSession()}>
              {t('endLessonNow')}
            </button>
            <button style={{ ...btnGhost, ...btnSmall }} onClick={() => setEndConfirm(false)}>
              {t('cancelEdit')}
            </button>
          </div>
        )}
      </div>

      {/* Bottom bar — End Session button */}
      {!ending && !endConfirm && (
        <div style={{
          padding: '16px 24px',
          background: palette.bg,
          borderTop: `1px solid ${palette.border}`,
          display: 'flex',
          justifyContent: 'center',
        }}>
          <button
            style={{ ...btnDanger, padding: '12px 48px', fontSize: 15 }}
            onClick={() => setEndConfirm(true)}
            disabled={!!error}
          >
            {t('endLesson')}
          </button>
        </div>
      )}
    </div>
  );
}
