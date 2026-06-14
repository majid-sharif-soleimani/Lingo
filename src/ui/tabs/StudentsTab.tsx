/**
 * StudentsTab — list, create, edit, and delete students.
 * Each student has their own source/target language, memory depth, and voice settings.
 */
import React, { useState, useEffect } from 'react';
import type { StudentProfile, LanguageLevel } from '../../types/index';
import { t } from '../../i18n/index';
import * as studentRepo from '../../storage/studentRepository';
import { TagInput } from '../components/TagInput';
import {
  section,
  sectionTitle,
  formGroup,
  label as labelStyle,
  input as inputStyle,
  select as selectStyle,
  btnPrimary,
  btnGhost,
  btnDanger,
  btnSmall,
  studentRow,
  notice,
  palette,
  emptyState,
  divider,
  toggleContainer,
  toggleTrack,
  toggleThumb,
} from '../styles';

const LEVELS: LanguageLevel[] = [
  'Beginner',
  'Elementary',
  'Pre-Intermediate',
  'Intermediate',
  'Upper-Intermediate',
  'Advanced',
];

const SOURCE_SUGGESTIONS = ['فارسی', 'العربية', 'Türkçe', 'Français', 'Deutsch', 'Español', '中文', '日本語', 'English'];
const TARGET_SUGGESTIONS = ['English', 'Deutsch', 'Français', 'Español', 'Italiano', '日本語', '한국어', '中文', 'فارسی'];
const MEMORY_OPTIONS = [1, 3, 5, 10] as const;
const MEMORY_NOTES: Record<number, string> = {
  1: 'Minimal memory',
  3: 'Balanced (recommended)',
  5: 'Good depth',
  10: 'Maximum memory',
};

function levelLabel(level: LanguageLevel): string {
  const map: Record<LanguageLevel, () => string> = {
    Beginner: () => t('beginner'),
    Elementary: () => t('elementary'),
    'Pre-Intermediate': () => t('preIntermediate'),
    Intermediate: () => t('intermediate'),
    'Upper-Intermediate': () => t('upperIntermediate'),
    Advanced: () => t('advanced'),
  };
  return map[level]?.() ?? level;
}

function ageGroupLabel(age: number): string {
  if (age <= 10) return '4–10';
  if (age <= 14) return '11–14';
  if (age <= 18) return '15–18';
  return '18+';
}

interface StudentFormState {
  name: string;
  age: number;
  languageLevel: LanguageLevel;
  sourceLanguage: string;
  targetLanguage: string;
  memoryDepth: number;
  ttsEnabled: boolean;
  defaultVoiceInputLanguage: 'source' | 'target';
  canReadWriteSourceLanguage: boolean;
  canReadWriteTargetLanguage: boolean;
  goals: string[];
  strengths: string[];
  weaknesses: string[];
}

const EMPTY_FORM: StudentFormState = {
  name: '',
  age: 18,
  languageLevel: 'Beginner',
  sourceLanguage: '',
  targetLanguage: '',
  memoryDepth: 3,
  ttsEnabled: true,
  defaultVoiceInputLanguage: 'target',
  canReadWriteSourceLanguage: true,
  canReadWriteTargetLanguage: true,
  goals: [],
  strengths: [],
  weaknesses: [],
};

interface StudentsTabProps {
  dir: 'ltr' | 'rtl';
}

/** Renders a suggestion chip row. */
function SuggestionChips({
  suggestions,
  onSelect,
  current,
}: {
  suggestions: string[];
  onSelect: (v: string) => void;
  current: string;
}): React.ReactElement {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
      {suggestions.map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onSelect(s)}
          style={{
            padding: '2px 10px',
            borderRadius: 12,
            border: `1px solid ${s === current ? palette.primary : palette.border}`,
            background: s === current ? palette.primaryLight : 'transparent',
            color: s === current ? palette.primary : palette.textSecondary,
            fontSize: 12,
            cursor: 'pointer',
          }}
        >
          {s}
        </button>
      ))}
    </div>
  );
}

/**
 * Full CRUD for students, including per-student language and voice settings.
 */
export function StudentsTab({ dir }: StudentsTabProps): React.ReactElement {
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<StudentFormState>(EMPTY_FORM);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const all = await studentRepo.getAll();
    setStudents(all);
  }

  useEffect(() => { void load(); }, []);

  function openCreate() {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(true);
    setError(null);
  }

  function openEdit(student: StudentProfile) {
    setForm({
      name: student.name,
      age: student.age,
      languageLevel: student.languageLevel,
      sourceLanguage: student.sourceLanguage,
      targetLanguage: student.targetLanguage,
      memoryDepth: student.memoryDepth,
      ttsEnabled: student.ttsEnabled,
      defaultVoiceInputLanguage: student.defaultVoiceInputLanguage,
      canReadWriteSourceLanguage: student.canReadWriteSourceLanguage,
      canReadWriteTargetLanguage: student.canReadWriteTargetLanguage,
      goals: student.goals,
      strengths: student.strengths,
      weaknesses: student.weaknesses,
    });
    setEditingId(student.id);
    setShowForm(true);
    setError(null);
  }

  function cancelForm() {
    setShowForm(false);
    setEditingId(null);
    setError(null);
  }

  async function handleSave() {
    if (!form.name.trim()) { setError('Name is required.'); return; }
    if (!form.sourceLanguage.trim()) { setError('Native language is required.'); return; }
    if (!form.targetLanguage.trim()) { setError('Target language is required.'); return; }
    if (form.sourceLanguage.trim().toLowerCase() === form.targetLanguage.trim().toLowerCase()) {
      setError('Source and target languages must be different.');
      return;
    }
    try {
      const data = {
        name: form.name.trim(),
        age: form.age,
        languageLevel: form.languageLevel,
        sourceLanguage: form.sourceLanguage.trim(),
        targetLanguage: form.targetLanguage.trim(),
        memoryDepth: form.memoryDepth,
        ttsEnabled: form.ttsEnabled,
        defaultVoiceInputLanguage: form.defaultVoiceInputLanguage,
        canReadWriteSourceLanguage: form.canReadWriteSourceLanguage,
        canReadWriteTargetLanguage: form.canReadWriteTargetLanguage,
        goals: form.goals,
        strengths: form.strengths,
        weaknesses: form.weaknesses,
      };
      if (editingId) {
        await studentRepo.update(editingId, data);
      } else {
        await studentRepo.create({
          ...data,
          grammarTopicsLearned: [],
          vocabularyTopicsLearned: [],
          readingTopicsCompleted: [],
          writingTopicsCompleted: [],
        });
      }
      setShowForm(false);
      setEditingId(null);
      await load();
    } catch {
      setError(t('storageWriteFailed'));
    }
  }

  async function handleDelete(id: string) {
    try {
      await studentRepo.deleteStudent(id);
      setDeleteConfirmId(null);
      await load();
    } catch {
      setError(t('storageWriteFailed'));
    }
  }

  function setField<K extends keyof StudentFormState>(key: K, value: StudentFormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  const srcLabel = form.sourceLanguage || '…';
  const tgtLabel = form.targetLanguage || '…';

  return (
    <div style={{ direction: dir }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: `1px solid ${palette.border}` }}>
        <span style={{ fontWeight: 700 }}>{t('tabStudents')}</span>
        {!showForm && (
          <button style={{ ...btnPrimary, ...btnSmall }} onClick={openCreate}>
            + {t('addStudent')}
          </button>
        )}
      </div>

      {/* Student form */}
      {showForm && (
        <div style={{ ...section, borderBottom: `1px solid ${palette.border}` }}>
          <div style={sectionTitle}>
            {editingId ? t('editStudent') : t('addStudent')}
          </div>

          {error && <div style={{ ...notice('error'), marginBottom: 10 }}>{error}</div>}

          {/* ── Basic info ── */}
          <div style={formGroup}>
            <label style={labelStyle}>{t('studentName')} *</label>
            <input
              type="text"
              style={inputStyle}
              value={form.name}
              onChange={(e) => setField('name', e.target.value)}
              dir={dir}
            />
          </div>

          <div style={formGroup}>
            <label style={labelStyle}>{t('studentAge')}</label>
            <input
              type="number"
              min={4}
              max={99}
              style={inputStyle}
              value={form.age}
              onChange={(e) => setField('age', parseInt(e.target.value, 10) || 18)}
            />
            <div style={{ fontSize: 12, color: palette.textMuted }}>
              {t('ageGroupLabel')}: {ageGroupLabel(form.age)}
            </div>
          </div>

          <div style={formGroup}>
            <label style={labelStyle}>{t('languageLevel')}</label>
            <select
              style={selectStyle}
              value={form.languageLevel}
              onChange={(e) => setField('languageLevel', e.target.value as LanguageLevel)}
              dir={dir}
            >
              {LEVELS.map((l) => (
                <option key={l} value={l}>{levelLabel(l)}</option>
              ))}
            </select>
          </div>

          {/* ── Language pair ── */}
          <div style={{ background: palette.bgPanel, borderRadius: 10, padding: 12, marginBottom: 12, border: `1px solid ${palette.border}` }}>
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10, color: palette.textPrimary }}>
              Language Settings
            </div>

            <div style={formGroup}>
              <label style={labelStyle}>{t('sourceLanguage')} (native) *</label>
              <input
                type="text"
                style={inputStyle}
                value={form.sourceLanguage}
                onChange={(e) => setField('sourceLanguage', e.target.value)}
                placeholder="e.g. Persian, Arabic, Turkish…"
                dir="ltr"
              />
              <SuggestionChips
                suggestions={SOURCE_SUGGESTIONS}
                current={form.sourceLanguage}
                onSelect={(v) => setField('sourceLanguage', v)}
              />
            </div>

            <div style={formGroup}>
              <label style={labelStyle}>{t('targetLanguage')} (to learn) *</label>
              <input
                type="text"
                style={inputStyle}
                value={form.targetLanguage}
                onChange={(e) => setField('targetLanguage', e.target.value)}
                placeholder="e.g. English, German, French…"
                dir="ltr"
              />
              <SuggestionChips
                suggestions={TARGET_SUGGESTIONS}
                current={form.targetLanguage}
                onSelect={(v) => setField('targetLanguage', v)}
              />
            </div>

            {/* Memory depth */}
            <div style={formGroup}>
              <label style={labelStyle}>{t('memoryDepth')}</label>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {MEMORY_OPTIONS.map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setField('memoryDepth', n)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 8,
                      border: `2px solid ${form.memoryDepth === n ? palette.primary : palette.border}`,
                      background: form.memoryDepth === n ? palette.primaryLight : 'transparent',
                      color: form.memoryDepth === n ? palette.primary : palette.textSecondary,
                      fontWeight: form.memoryDepth === n ? 700 : 400,
                      cursor: 'pointer',
                      fontSize: 13,
                    }}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <div style={{ fontSize: 12, color: palette.textMuted, marginTop: 4 }}>
                {MEMORY_NOTES[form.memoryDepth]}
              </div>
            </div>

            {/* TTS toggle */}
            <div style={{ ...formGroup, gap: 10 }}>
              <label
                style={toggleContainer}
                onClick={() => setField('ttsEnabled', !form.ttsEnabled)}
              >
                <div style={toggleTrack(form.ttsEnabled)}>
                  <div style={toggleThumb(form.ttsEnabled)} />
                </div>
                <span style={{ fontSize: 13 }}>{t('ttsEnabled')}</span>
              </label>
            </div>

            {/* Default mic language */}
            <div style={formGroup}>
              <label style={labelStyle}>{t('defaultVoiceInputLanguage')}</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {(['source', 'target'] as const).map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setField('defaultVoiceInputLanguage', opt)}
                    style={{
                      flex: 1,
                      padding: '6px 10px',
                      borderRadius: 8,
                      border: `2px solid ${form.defaultVoiceInputLanguage === opt ? palette.primary : palette.border}`,
                      background: form.defaultVoiceInputLanguage === opt ? palette.primaryLight : 'transparent',
                      color: form.defaultVoiceInputLanguage === opt ? palette.primary : palette.textSecondary,
                      fontWeight: form.defaultVoiceInputLanguage === opt ? 700 : 400,
                      cursor: 'pointer',
                      fontSize: 12,
                    }}
                  >
                    {opt === 'source' ? srcLabel : tgtLabel}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── Literacy toggles ── */}
          <div style={{ ...formGroup, gap: 10 }}>
            <label
              style={toggleContainer}
              onClick={() => setField('canReadWriteSourceLanguage', !form.canReadWriteSourceLanguage)}
            >
              <div style={toggleTrack(form.canReadWriteSourceLanguage)}>
                <div style={toggleThumb(form.canReadWriteSourceLanguage)} />
              </div>
              <span style={{ fontSize: 13 }}>
                {t('canReadWriteSource')} ({srcLabel})
              </span>
            </label>
            {!form.canReadWriteSourceLanguage && (
              <div style={{ fontSize: 12, color: palette.textSecondary }}>
                {t('noticeSourceVoiceOnly')}
              </div>
            )}

            <label
              style={toggleContainer}
              onClick={() => setField('canReadWriteTargetLanguage', !form.canReadWriteTargetLanguage)}
            >
              <div style={toggleTrack(form.canReadWriteTargetLanguage)}>
                <div style={toggleThumb(form.canReadWriteTargetLanguage)} />
              </div>
              <span style={{ fontSize: 13 }}>
                {t('canReadWriteTarget')} ({tgtLabel})
              </span>
            </label>
            {!form.canReadWriteTargetLanguage && (
              <div style={{ fontSize: 12, color: palette.textSecondary }}>
                {t('noticeNoReadWrite')}
              </div>
            )}
          </div>

          {/* ── Goals / Strengths / Weaknesses ── */}
          <div style={formGroup}>
            <label style={labelStyle}>{t('goals')}</label>
            <TagInput
              tags={form.goals}
              onChange={(v) => setField('goals', v)}
              dir={dir}
              placeholder="e.g. Travel, Business, Exam prep"
            />
          </div>

          <div style={formGroup}>
            <label style={labelStyle}>{t('strengths')}</label>
            <TagInput
              tags={form.strengths}
              onChange={(v) => setField('strengths', v)}
              dir={dir}
              placeholder="e.g. Listening, Vocabulary"
            />
          </div>

          <div style={formGroup}>
            <label style={labelStyle}>{t('weaknesses')}</label>
            <TagInput
              tags={form.weaknesses}
              onChange={(v) => setField('weaknesses', v)}
              dir={dir}
              placeholder="e.g. Grammar, Speaking fluency"
            />
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            <button style={btnPrimary} onClick={() => void handleSave()}>
              {t('saveStudent')}
            </button>
            <button style={btnGhost} onClick={cancelForm}>
              {t('cancelEdit')}
            </button>
          </div>
        </div>
      )}

      {/* Student list */}
      {students.length === 0 && !showForm ? (
        <div style={emptyState}>{t('noStudentsYet')}</div>
      ) : (
        students.map((student) => (
          <div key={student.id}>
            <div style={studentRow}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{student.name}</div>
                <div style={{ fontSize: 12, color: palette.textMuted }}>
                  {student.sourceLanguage} → {student.targetLanguage}
                </div>
                <div style={{ fontSize: 12, color: palette.textMuted }}>
                  {ageGroupLabel(student.age)} · {levelLabel(student.languageLevel)}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                <button style={{ ...btnGhost, ...btnSmall }} onClick={() => openEdit(student)}>
                  ✏️
                </button>
                <button style={{ ...btnDanger, ...btnSmall }} onClick={() => setDeleteConfirmId(student.id)}>
                  🗑
                </button>
              </div>
            </div>

            {deleteConfirmId === student.id && (
              <div style={{ padding: '8px 16px', background: palette.dangerLight }}>
                <div style={{ fontSize: 13, marginBottom: 8, color: palette.danger }}>
                  {t('confirmDeleteStudent')}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button style={{ ...btnDanger, ...btnSmall }} onClick={() => void handleDelete(student.id)}>
                    {t('deleteStudent')}
                  </button>
                  <button style={{ ...btnGhost, ...btnSmall }} onClick={() => setDeleteConfirmId(null)}>
                    {t('cancelEdit')}
                  </button>
                </div>
              </div>
            )}
            <div style={divider} />
          </div>
        ))
      )}
    </div>
  );
}
