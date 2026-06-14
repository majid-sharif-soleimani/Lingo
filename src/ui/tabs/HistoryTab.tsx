/**
 * HistoryTab — lesson history per student with expandable rows and score bars.
 */
import React, { useState, useEffect } from 'react';
import type { StudentProfile, LessonSummary } from '../../types/index';
import { t } from '../../i18n/index';
import * as studentRepo from '../../storage/studentRepository';
import { ScoreBar } from '../components/ScoreBar';
import {
  section,
  sectionTitle,
  formGroup,
  label as labelStyle,
  select as selectStyle,
  historyItem,
  badge,
  emptyState,
  palette,
  divider,
  tagContainer,
  tag,
} from '../styles';

interface HistoryTabProps {
  dir: 'ltr' | 'rtl';
}

const SESSION_COLORS: Record<string, string> = {
  'Conversation Practice': '#10a37f',
  'Grammar Lesson': '#6c5ce7',
  'Reading Comprehension': '#0984e3',
  'Writing Practice': '#e17055',
  'Mixed Lesson': '#a29bfe',
};

/**
 * Lesson history view with per-student picker and expandable lesson rows.
 */
export function HistoryTab({ dir }: HistoryTabProps): React.ReactElement {
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [lessons, setLessons] = useState<LessonSummary[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    studentRepo.getAll().then((all) => {
      setStudents(all);
      if (all.length > 0) setSelectedId(all[0].id);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    if (!selectedId) { setLessons([]); return; }
    studentRepo.getById(selectedId).then((s) => {
      if (!s) { setLessons([]); return; }
      const sorted = [...s.lessonHistory].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setLessons(sorted);
    }).catch(console.error);
  }, [selectedId]);

  function toggleExpand(id: string) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  return (
    <div style={{ direction: dir }}>
      <div style={{ padding: '12px 16px', borderBottom: `1px solid ${palette.border}` }}>
        <div style={sectionTitle}>{t('lessonHistory')}</div>
        {students.length > 0 && (
          <div style={formGroup}>
            <label style={labelStyle}>{t('selectStudent')}</label>
            <select
              style={selectStyle}
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              dir={dir}
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {lessons.length === 0 ? (
        <div style={emptyState}>{t('noLessonsYet')}</div>
      ) : (
        lessons.map((lesson) => (
          <div key={lesson.id}>
            <div
              style={{ ...historyItem, cursor: 'pointer' }}
              onClick={() => toggleExpand(lesson.id)}
            >
              {/* Summary row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 12, color: palette.textMuted, minWidth: 80 }}>
                  {lesson.date.slice(0, 10)}
                </span>
                <span style={badge(SESSION_COLORS[lesson.sessionType] ?? palette.primary)}>
                  {lesson.sessionType}
                </span>
                <span style={{ ...badge(scoreColor(lesson.overallScore)), marginLeft: 'auto' }}>
                  {t('overallScore')}: {lesson.overallScore}
                </span>
              </div>
              <div style={{ fontSize: 13, color: palette.textSecondary, marginTop: 4 }}>
                {lesson.lessonTopic || '—'}
              </div>
            </div>

            {/* Expanded details */}
            {expandedId === lesson.id && (
              <div style={{ padding: '12px 16px', background: palette.bgPanel, borderBottom: `1px solid ${palette.border}` }}>
                <ScoreBar label={t('overallScore')} score={lesson.overallScore} dir={dir} />
                <ScoreBar label={t('grammarScore')} score={lesson.grammarScore} dir={dir} />
                <ScoreBar label={t('vocabularyScore')} score={lesson.vocabularyScore} dir={dir} />
                <ScoreBar label={t('participationScore')} score={lesson.participationScore} dir={dir} />
                <ScoreBar label={t('readingScore')} score={lesson.readingScore} dir={dir} />
                <ScoreBar label={t('writingScore')} score={lesson.writingScore} dir={dir} />

                {lesson.strengthsObserved.length > 0 && (
                  <Section title={t('strengthsObserved')} items={lesson.strengthsObserved} dir={dir} />
                )}
                {lesson.weaknessesObserved.length > 0 && (
                  <Section title={t('weaknessesObserved')} items={lesson.weaknessesObserved} dir={dir} />
                )}
                {lesson.homework.length > 0 && (
                  <Section title={t('homework')} items={lesson.homework} dir={dir} />
                )}
                {lesson.teacherNotes.length > 0 && (
                  <Section title={t('teacherNotes')} items={lesson.teacherNotes} dir={dir} />
                )}
              </div>
            )}
            <div style={divider} />
          </div>
        ))
      )}
    </div>
  );
}

function Section({ title, items, dir }: { title: string; items: string[]; dir: 'ltr' | 'rtl' }) {
  return (
    <div style={{ marginTop: 10 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: palette.textSecondary, marginBottom: 4 }}>
        {title}
      </div>
      <div style={tagContainer}>
        {items.map((item, i) => (
          <span key={i} style={{ ...tag, background: palette.bgHover, color: palette.textPrimary }}>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

function scoreColor(score: number): string {
  if (score >= 75) return '#48bb78';
  if (score >= 50) return '#f6ad55';
  return '#e53e3e';
}
