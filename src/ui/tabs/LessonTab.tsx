/**
 * LessonTab — pick a student + session type, then start a lesson.
 * Language settings come from the selected student profile.
 * Reading Comprehension and Writing Practice are hidden when the student
 * cannot read/write in the target language.
 */
import React, { useState, useEffect } from 'react';
import type { StudentProfile, SessionType } from '../../types/index';
import { t } from '../../i18n/index';
import * as studentRepo from '../../storage/studentRepository';
import { readSession, writeSession } from '../../storage/storageHelper';
import { isChatGPTReady } from '../../content/domIntegration';
import {
  section,
  sectionTitle,
  formGroup,
  label as labelStyle,
  select as selectStyle,
  btnPrimary,
  btnGhost,
  notice,
  palette,
  emptyState,
} from '../styles';

const ALL_SESSION_TYPES: SessionType[] = [
  'Voice Conversation',
  'Grammar Lesson',
  'Reading Comprehension',
  'Writing Practice',
];

function sessionTypeLabel(type: SessionType): string {
  const map: Record<SessionType, () => string> = {
    'Voice Conversation': () => t('voiceConversation'),
    'Grammar Lesson': () => t('grammarLesson'),
    'Reading Comprehension': () => t('readingComprehension'),
    'Writing Practice': () => t('writingPractice'),
    'Mixed Lesson': () => t('mixedLesson'),
  };
  return map[type]?.() ?? type;
}

interface LessonTabProps {
  dir: 'ltr' | 'rtl';
  onStart: (studentId: string, sessionType: SessionType) => void;
  onGoToStudents: () => void;
}

/**
 * Renders the lesson-start form: student picker + session type picker + Start button.
 * The selected student's language pair is shown as a hint below their name.
 */
export function LessonTab({ dir, onStart, onGoToStudents }: LessonTabProps): React.ReactElement {
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [sessionType, setSessionType] = useState<SessionType>('Voice Conversation');
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chatReady, setChatReady] = useState(true);

  useEffect(() => {
    studentRepo.getAll().then(setStudents).catch(console.error);
    setChatReady(isChatGPTReady());
    // Restore last selections from storage.
    readSession<string>('lastStudentId', '').then(id => { if (id) setSelectedStudentId(id); }).catch(console.error);
    readSession<SessionType | null>('lastSessionType', null).then(st => { if (st) setSessionType(st); }).catch(console.error);
  }, []);

  const selectedStudent = students.find((s) => s.id === selectedStudentId) ?? null;

  const availableSessionTypes = ALL_SESSION_TYPES.filter((type) => {
    if (!selectedStudent) return true;
    if (!selectedStudent.canReadWriteTargetLanguage) {
      return type !== 'Reading Comprehension' && type !== 'Writing Practice';
    }
    return true;
  });

  function handleStart() {
    if (!selectedStudentId || starting) return;
    setError(null);
    setStarting(true);
    onStart(selectedStudentId, sessionType);
    // starting flag will reset when the lesson overlay takes over or on error (handled by Panel)
  }

  if (students.length === 0) {
    return (
      <div style={{ ...section, direction: dir }}>
        <div style={emptyState}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>👤</div>
          <div>{t('createStudentFirst')}</div>
          <button style={{ ...btnGhost, marginTop: 16 }} onClick={onGoToStudents}>
            {t('addStudent')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ ...section, direction: dir }}>
      <div style={sectionTitle}>{t('tabLesson')}</div>

      {!chatReady && (
        <div style={{ ...notice('warning'), marginBottom: 12 }}>
          {t('pleaseLoginChatGPT')}
        </div>
      )}

      <div style={formGroup}>
        <label style={labelStyle}>{t('selectStudent')}</label>
        <select
          style={selectStyle}
          value={selectedStudentId}
          onChange={(e) => {
            const id = e.target.value;
            setSelectedStudentId(id);
            setSessionType('Voice Conversation');
            void writeSession('lastStudentId', id);
            void writeSession('lastSessionType', 'Voice Conversation');
          }}
          dir={dir}
        >
          <option value="">— {t('selectStudent')} —</option>
          {students.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} ({s.sourceLanguage} → {s.targetLanguage})
            </option>
          ))}
        </select>

        {/* Show selected student's details */}
        {selectedStudent && (
          <div style={{ fontSize: 12, color: palette.textSecondary, marginTop: 6 }}>
            {selectedStudent.languageLevel}
            {!selectedStudent.canReadWriteTargetLanguage && (
              <span style={{ color: palette.warning }}> · {t('noticeNoReadWrite')}</span>
            )}
          </div>
        )}
      </div>

      <div style={formGroup}>
        <label style={labelStyle}>{t('sessionType')}</label>
        <select
          style={selectStyle}
          value={sessionType}
          onChange={(e) => {
            const st = e.target.value as SessionType;
            setSessionType(st);
            void writeSession('lastSessionType', st);
          }}
          disabled={!selectedStudentId}
          dir={dir}
        >
          {availableSessionTypes.map((type) => (
            <option key={type} value={type}>
              {sessionTypeLabel(type)}
            </option>
          ))}
        </select>
      </div>

      {error && <div style={{ ...notice('error'), marginBottom: 12 }}>{error}</div>}

      <button
        style={{ ...btnPrimary, width: '100%', padding: '12px', marginBottom: 8 }}
        disabled={!selectedStudentId || starting || !chatReady}
        onClick={handleStart}
      >
        {starting ? '…' : t('startLesson')}
      </button>

      <div style={{ fontSize: 12, color: palette.textMuted, textAlign: 'center' }}>
        {t('lessonHint')}
      </div>
    </div>
  );
}
