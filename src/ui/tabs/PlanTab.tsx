/**
 * PlanTab — learning plan generator, viewer, progress tracker, and practice material generator.
 */
import React, { useState, useEffect, useCallback } from 'react';
import type {
  StudentProfile,
  LearningPlan,
  LearningPlanConfig,
  LanguageLevel,
  MaterialType,
  PracticeFrequency,
  PlanDayType,
} from '../../types/index';
import { t } from '../../i18n/index';
import { isRTL } from '../../i18n/index';
import * as studentRepo from '../../storage/studentRepository';
import * as planController from '../../session/planController';
import * as materialController from '../../session/materialController';
import { readSession, writeSession } from '../../storage/storageHelper';
import { MarkdownText } from '../components/MarkdownText';
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
  notice,
  palette,
  emptyState,
  scoreBarOuter,
  badge,
} from '../styles';

const LEVELS: LanguageLevel[] = [
  'Beginner', 'Elementary', 'Pre-Intermediate', 'Intermediate', 'Upper-Intermediate', 'Advanced',
];

const FREQUENCIES: PracticeFrequency[] = ['daily', 'weekdays', 'alternate', 'weekly'];

const MATERIAL_TYPES: MaterialType[] = ['vocabulary', 'grammar', 'reading', 'writing', 'review'];

const TYPE_COLORS: Record<PlanDayType, string> = {
  Grammar: '#4299e1',
  Vocabulary: '#9f7aea',
  Reading: '#38b2ac',
  Writing: '#ed8936',
  Speaking: '#48bb78',
  Review: '#a0aec0',
};

function freqLabel(f: PracticeFrequency): string {
  const map: Record<PracticeFrequency, () => string> = {
    daily: () => t('freqDaily'),
    weekdays: () => t('freqWeekdays'),
    alternate: () => t('freqAlternate'),
    weekly: () => t('freqWeekly'),
  };
  return map[f]();
}

function matTypeLabel(m: MaterialType): string {
  const map: Record<MaterialType, () => string> = {
    vocabulary: () => t('practiceTypeVocabulary'),
    grammar: () => t('practiceTypeGrammar'),
    reading: () => t('practiceTypeReading'),
    writing: () => t('practiceTypeWriting'),
    review: () => t('practiceTypeReview'),
  };
  return map[m]();
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function getPracticeDate(startDate: string, dayIndex: number, frequency: PracticeFrequency): Date {
  const start = new Date(startDate);
  if (frequency === 'daily') {
    return new Date(start.getTime() + dayIndex * 86400000);
  }
  if (frequency === 'alternate') {
    return new Date(start.getTime() + dayIndex * 2 * 86400000);
  }
  if (frequency === 'weekly') {
    return new Date(start.getTime() + dayIndex * 7 * 86400000);
  }
  // weekdays: skip Saturday (6) and Sunday (0)
  let count = 0;
  const d = new Date(start);
  while (count < dayIndex) {
    d.setDate(d.getDate() + 1);
    if (d.getDay() !== 0 && d.getDay() !== 6) count++;
  }
  return d;
}

function shortDate(d: Date): string {
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function downloadAsPdf(title: string, markdown: string): void {
  let html = markdown
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/^(\d+)\. (.+)$/gm, '<li>$1. $2</li>')
    .replace(/\n\n/g, '</p><p>');
  html = '<p>' + html + '</p>';

  const win = window.open('', '_blank');
  if (!win) return;
  win.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title>
<style>
  body{font-family:sans-serif;font-size:14px;margin:40px;line-height:1.7;color:#1a202c}
  h2{color:#10a37f;margin-top:24px}h3{color:#4a5568;margin-top:16px}
  li{margin-bottom:4px}strong{font-weight:700}
  @media print{body{margin:20px}}
</style></head><body>${html}</body></html>`);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 300);
}

interface PlanTabProps {
  dir: 'ltr' | 'rtl';
}

export function PlanTab({ dir }: PlanTabProps): React.ReactElement {
  // Students
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');

  // Plan
  const [plan, setPlan] = useState<LearningPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isStale, setIsStale] = useState(false);
  const [showRegenerateConfirm, setShowRegenerateConfirm] = useState(false);
  const [expandedDay, setExpandedDay] = useState<number | null>(null);

  // Plan config (wizard)
  const [config, setConfig] = useState<LearningPlanConfig>({
    targetLevel: 'Intermediate',
    durationDays: 60,
    frequency: 'weekdays',
    sessionMinutes: 30,
    startDate: todayISO(),
  });

  // Material generator
  const [showMaterials, setShowMaterials] = useState(false);
  const [matType, setMatType] = useState<MaterialType>('grammar');
  const [matTopic, setMatTopic] = useState('');
  const [matLevel, setMatLevel] = useState<LanguageLevel>('Intermediate');
  const [matGenerating, setMatGenerating] = useState(false);
  const [matResult, setMatResult] = useState<string | null>(null);
  const [matError, setMatError] = useState<string | null>(null);

  const selectedStudent = students.find(s => s.id === selectedStudentId) ?? null;

  const loadPlanForStudent = useCallback(async (studentId: string, studentList?: StudentProfile[]) => {
    if (!studentId) { setPlan(null); setIsStale(false); return; }
    const loaded = await planController.loadPlan(studentId);
    setPlan(loaded);
    if (loaded) {
      const st = (studentList ?? students).find(s => s.id === studentId);
      if (st) {
        const currentHash = planController.computeConfigHash(st, loaded.config);
        setIsStale(currentHash !== loaded.configHash);
      }
    } else {
      setIsStale(false);
    }
  }, [students]);

  useEffect(() => {
    studentRepo.getAll().then(async (list) => {
      setStudents(list);
      const lastId = await readSession<string>('lastStudentId', '');
      const id = lastId && list.some(s => s.id === lastId) ? lastId : (list[0]?.id ?? '');
      setSelectedStudentId(id);
      if (id) {
        // initialize matLevel from student
        const st = list.find(s => s.id === id);
        if (st) setMatLevel(st.languageLevel);
        await loadPlanForStudent(id, list);
      }
    }).catch(console.error);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleStudentChange(id: string) {
    setSelectedStudentId(id);
    setPlan(null);
    setIsStale(false);
    setError(null);
    setShowRegenerateConfirm(false);
    void writeSession('lastStudentId', id);
    const st = students.find(s => s.id === id);
    if (st) setMatLevel(st.languageLevel);
    if (id) await loadPlanForStudent(id);
  }

  async function handleGenerate() {
    if (!selectedStudent) return;
    setLoading(true);
    setError(null);
    setShowRegenerateConfirm(false);
    try {
      // If regenerating, delete old plan first
      if (plan) {
        await planController.removePlan(selectedStudent.id);
      }
      const newPlan = await planController.generatePlan(selectedStudent, config);
      setPlan(newPlan);
      setIsStale(false);
    } catch (err) {
      setError(err instanceof planController.PlanParseError ? t('planParseFailed') : t('startFailed'));
    } finally {
      setLoading(false);
    }
  }

  async function handleMatGenerate() {
    if (!selectedStudent || !matTopic.trim()) return;
    setMatGenerating(true);
    setMatError(null);
    setMatResult(null);
    try {
      const result = await materialController.generateMaterial(selectedStudent, matType, matTopic.trim(), matLevel);
      setMatResult(result);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setMatError(msg.includes('not-ready') ? t('chatGptNotReady') : t('startFailed'));
    } finally {
      setMatGenerating(false);
    }
  }

  const sourceDir = selectedStudent && isRTL(selectedStudent.sourceLanguage) ? 'rtl' : 'ltr';

  // ── Student picker ──────────────────────────────────────────────────────────

  const studentPicker = (
    <div style={formGroup}>
      <label style={labelStyle}>{t('selectStudent')}</label>
      <select
        style={selectStyle}
        value={selectedStudentId}
        onChange={(e) => void handleStudentChange(e.target.value)}
        dir={dir}
      >
        <option value="">— {t('selectStudent')} —</option>
        {students.map(s => (
          <option key={s.id} value={s.id}>
            {s.name} ({s.sourceLanguage} → {s.targetLanguage})
          </option>
        ))}
      </select>
    </div>
  );

  if (students.length === 0) {
    return (
      <div style={{ ...section, direction: dir }}>
        <div style={emptyState}>{t('createStudentFirst')}</div>
      </div>
    );
  }

  // ── Compute plan stats ──────────────────────────────────────────────────────
  const totalDays = plan?.days.length ?? 0;
  const completedDays = plan?.days.filter(d => d.status === 'completed').length ?? 0;
  const progressPct = totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;
  const firstPendingDay = plan?.days.find(d => d.status === 'pending') ?? null;

  // Skill breakdown per type
  const SKILL_TYPES: PlanDayType[] = ['Grammar', 'Vocabulary', 'Reading', 'Writing', 'Speaking', 'Review'];
  const skillStats = SKILL_TYPES.map(type => {
    const typeDays = plan?.days.filter(d => d.t === type) ?? [];
    const typeDone = typeDays.filter(d => d.status === 'completed');
    const avgScore = typeDone.length > 0
      ? Math.round(typeDone.reduce((sum, d) => sum + (d.score ?? 0), 0) / typeDone.length)
      : null;
    return { type, total: typeDays.length, done: typeDone.length, avgScore };
  }).filter(s => s.total > 0);

  // ── Plan dates ──────────────────────────────────────────────────────────────
  const planStartStr = plan?.config.startDate ?? '';
  const planEndDate = plan && plan.days.length > 0
    ? getPracticeDate(planStartStr, plan.days.length - 1, plan.config.frequency)
    : null;

  // ── Material section ────────────────────────────────────────────────────────
  const materialSection = (
    <div style={{ borderTop: `1px solid ${palette.border}`, marginTop: 8 }}>
      <button
        style={{
          width: '100%', padding: '10px 16px', background: 'transparent', border: 'none',
          textAlign: 'left', cursor: 'pointer', fontWeight: 700, fontSize: 13,
          color: palette.textSecondary, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}
        onClick={() => {
          setShowMaterials(v => !v);
          if (showMaterials) { setMatResult(null); setMatError(null); }
        }}
      >
        <span>{t('practiceTitle')}</span>
        <span>{showMaterials ? '▲' : '▼'}</span>
      </button>

      {showMaterials && (
        <div style={{ ...section, paddingTop: 0 }}>
          {matResult ? (
            // Result view
            <div>
              <div style={{ ...scoreBarOuter, display: 'none' }} />
              <div style={{
                background: palette.bgPanel, borderRadius: 10, padding: 12,
                border: `1px solid ${palette.border}`, maxHeight: 340, overflowY: 'auto',
                fontSize: 13, marginBottom: 12,
              }}>
                <MarkdownText
                  text={matResult}
                  sourceDir={sourceDir}
                  targetDir="ltr"
                />
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button
                  style={{ ...btnPrimary, ...btnSmall }}
                  onClick={() => downloadAsPdf(`${matTypeLabel(matType)} — ${matTopic}`, matResult)}
                >
                  {t('practiceDownloadPdf')}
                </button>
                <button
                  style={{ ...btnGhost, ...btnSmall }}
                  onClick={() => { setMatResult(null); setMatError(null); }}
                >
                  {t('practiceBack')}
                </button>
              </div>
            </div>
          ) : (
            // Generator form
            <div>
              {matError && <div style={{ ...notice('error'), marginBottom: 10 }}>{matError}</div>}

              <div style={formGroup}>
                <label style={labelStyle}>{t('practiceType')}</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {MATERIAL_TYPES.map(mt => (
                    <button
                      key={mt}
                      type="button"
                      onClick={() => setMatType(mt)}
                      style={{
                        padding: '4px 10px', borderRadius: 12, fontSize: 12, cursor: 'pointer',
                        border: `1px solid ${matType === mt ? palette.primary : palette.border}`,
                        background: matType === mt ? palette.primaryLight : 'transparent',
                        color: matType === mt ? palette.primary : palette.textSecondary,
                        fontWeight: matType === mt ? 700 : 400,
                      }}
                    >
                      {matTypeLabel(mt)}
                    </button>
                  ))}
                </div>
              </div>

              <div style={formGroup}>
                <label style={labelStyle}>{t('practiceTopic')}</label>
                <input
                  type="text"
                  style={inputStyle}
                  value={matTopic}
                  onChange={e => setMatTopic(e.target.value)}
                  placeholder={t('practiceTopicPlaceholder')}
                  dir="ltr"
                />
              </div>

              <div style={formGroup}>
                <label style={labelStyle}>{t('practiceLevel')}</label>
                <select
                  style={selectStyle}
                  value={matLevel}
                  onChange={e => setMatLevel(e.target.value as LanguageLevel)}
                  dir="ltr"
                >
                  {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>

              <button
                style={{ ...btnPrimary, width: '100%' }}
                disabled={!selectedStudentId || !matTopic.trim() || matGenerating}
                onClick={() => void handleMatGenerate()}
              >
                {matGenerating ? t('practiceGenerating') : t('practiceGenerate')}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );

  // ── Loading state ───────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ ...section, direction: dir }}>
        {studentPicker}
        <div style={{ ...notice('info'), marginTop: 12 }}>{t('planGenerating')}</div>
      </div>
    );
  }

  // ── No plan: show generate wizard ───────────────────────────────────────────
  if (!plan) {
    return (
      <div style={{ direction: dir }}>
        <div style={section}>
          {studentPicker}

          {error && <div style={{ ...notice('error'), marginBottom: 10 }}>{error}</div>}

          <div style={sectionTitle}>{t('generatePlan')}</div>

          <div style={formGroup}>
            <label style={labelStyle}>{t('planTargetLevel')}</label>
            <select
              style={selectStyle}
              value={config.targetLevel}
              onChange={e => setConfig(c => ({ ...c, targetLevel: e.target.value as LanguageLevel }))}
              dir="ltr"
            >
              {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>

          <div style={formGroup}>
            <label style={labelStyle}>{t('planDuration')}</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                type="number"
                min={7}
                max={365}
                style={{ ...inputStyle, width: 80 }}
                value={config.durationDays}
                onChange={e => setConfig(c => ({ ...c, durationDays: parseInt(e.target.value, 10) || 60 }))}
              />
              <span style={{ color: palette.textSecondary, fontSize: 13 }}>{t('planDurationDays')}</span>
            </div>
          </div>

          <div style={formGroup}>
            <label style={labelStyle}>{t('planFrequency')}</label>
            <select
              style={selectStyle}
              value={config.frequency}
              onChange={e => setConfig(c => ({ ...c, frequency: e.target.value as PracticeFrequency }))}
              dir="ltr"
            >
              {FREQUENCIES.map(f => <option key={f} value={f}>{freqLabel(f)}</option>)}
            </select>
          </div>

          <div style={formGroup}>
            <label style={labelStyle}>{t('planSessionLength')}</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                type="number"
                min={10}
                max={120}
                style={{ ...inputStyle, width: 80 }}
                value={config.sessionMinutes}
                onChange={e => setConfig(c => ({ ...c, sessionMinutes: parseInt(e.target.value, 10) || 30 }))}
              />
              <span style={{ color: palette.textSecondary, fontSize: 13 }}>{t('planSessionMinutes')}</span>
            </div>
          </div>

          <div style={formGroup}>
            <label style={labelStyle}>{t('planStartDate')}</label>
            <input
              type="date"
              style={inputStyle}
              value={config.startDate}
              onChange={e => setConfig(c => ({ ...c, startDate: e.target.value }))}
            />
          </div>

          <button
            style={{ ...btnPrimary, width: '100%', marginTop: 4 }}
            disabled={!selectedStudentId}
            onClick={() => void handleGenerate()}
          >
            {t('generatePlan')}
          </button>
        </div>

        {selectedStudentId && materialSection}
      </div>
    );
  }

  // ── Plan exists ─────────────────────────────────────────────────────────────

  const planSummaryLine = selectedStudent
    ? `${selectedStudent.name} · ${planStartStr} → ${planEndDate ? shortDate(planEndDate) : '?'} · ${plan.config.targetLevel} · ${freqLabel(plan.config.frequency)}`
    : '';

  return (
    <div style={{ direction: dir }}>
      {/* Stale banner */}
      {isStale && !showRegenerateConfirm && (
        <div style={{ ...notice('warning'), margin: '8px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div>{t('planStale')}</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              style={{ ...btnDanger, ...btnSmall }}
              onClick={() => setShowRegenerateConfirm(true)}
            >
              {t('planRegenerate')}
            </button>
            <button
              style={{ ...btnGhost, ...btnSmall }}
              onClick={() => setIsStale(false)}
            >
              {t('planKeepCurrent')}
            </button>
          </div>
        </div>
      )}

      {showRegenerateConfirm && (
        <div style={{ ...notice('error'), margin: '8px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div>{t('planRegenerateConfirm')}</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              style={{ ...btnDanger, ...btnSmall }}
              onClick={() => void handleGenerate()}
            >
              {t('planRegenerate')}
            </button>
            <button
              style={{ ...btnGhost, ...btnSmall }}
              onClick={() => setShowRegenerateConfirm(false)}
            >
              {t('planKeepCurrent')}
            </button>
          </div>
        </div>
      )}

      <div style={section}>
        {studentPicker}

        {error && <div style={{ ...notice('error'), marginBottom: 10 }}>{error}</div>}

        {/* Summary */}
        <div style={{ fontSize: 12, color: palette.textSecondary, marginBottom: 10 }}>{planSummaryLine}</div>

        {/* Overall progress */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: palette.textSecondary, marginBottom: 4 }}>
            <span>{t('planProgress')}</span>
            <span>{completedDays}/{totalDays} ({progressPct}%)</span>
          </div>
          <div style={{ ...scoreBarOuter }}>
            <div style={{
              width: `${progressPct}%`, height: '100%',
              background: palette.primary, borderRadius: 4, transition: 'width 0.4s',
            }} />
          </div>
        </div>

        {/* Skill breakdown */}
        {skillStats.length > 0 && (
          <div style={{ marginBottom: 12 }}>
            {skillStats.map(({ type, total, done, avgScore }) => {
              const pct = total > 0 ? Math.round((done / total) * 100) : 0;
              return (
                <div key={type} style={{ marginBottom: 6 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: palette.textMuted, marginBottom: 2 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{
                        width: 8, height: 8, borderRadius: '50%',
                        background: TYPE_COLORS[type], display: 'inline-block',
                      }} />
                      {type}
                    </span>
                    <span>{done}/{total}{avgScore !== null ? ` · ${avgScore}/100` : ''}</span>
                  </div>
                  <div style={{ height: 4, background: palette.border, borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{
                      width: `${pct}%`, height: '100%',
                      background: TYPE_COLORS[type], transition: 'width 0.4s',
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Day list */}
      <div style={{ borderTop: `1px solid ${palette.border}` }}>
        {plan.days.map((day) => {
          const date = getPracticeDate(plan.config.startDate, day.d - 1, plan.config.frequency);
          const isNext = firstPendingDay?.d === day.d;
          const isExpanded = expandedDay === day.d;

          const statusIcon = day.status === 'completed' ? '✓' : day.status === 'skipped' ? '—' : isNext ? '→' : '○';
          const statusColor = day.status === 'completed' ? palette.success : day.status === 'skipped' ? palette.textMuted : isNext ? palette.primary : palette.textMuted;

          return (
            <div
              key={day.d}
              style={{
                borderBottom: `1px solid ${palette.border}`,
                background: isNext ? palette.primaryLight : day.status === 'completed' ? palette.bgPanel : 'transparent',
              }}
            >
              <div
                style={{
                  display: 'flex', alignItems: 'center', padding: '8px 16px', gap: 8,
                  cursor: day.status === 'completed' ? 'pointer' : 'default',
                }}
                onClick={() => {
                  if (day.status === 'completed') {
                    setExpandedDay(isExpanded ? null : day.d);
                  }
                }}
              >
                {/* Status icon */}
                <span style={{ fontSize: 14, color: statusColor, width: 16, flexShrink: 0, textAlign: 'center' }}>
                  {statusIcon}
                </span>

                {/* Day number + date */}
                <div style={{ flexShrink: 0, minWidth: 54 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: isNext ? palette.primary : palette.textSecondary }}>
                    {t('planDay')} {day.d}
                  </div>
                  <div style={{ fontSize: 10, color: palette.textMuted }}>{shortDate(date)}</div>
                </div>

                {/* Type badge */}
                <span style={{ ...badge(TYPE_COLORS[day.t]), fontSize: 10, flexShrink: 0 }}>
                  {day.t}
                </span>

                {/* Topic */}
                <div style={{ flex: 1, fontSize: 12, color: palette.textPrimary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {day.topic}
                </div>

                {/* Score or time estimate */}
                {day.status === 'completed' && day.score !== undefined && (
                  <span style={{ fontSize: 11, color: palette.textSecondary, flexShrink: 0 }}>
                    {day.score}/100
                  </span>
                )}
                {day.status === 'pending' && !isNext && (
                  <span style={{ fontSize: 10, color: palette.textMuted, flexShrink: 0 }}>{day.min}m</span>
                )}
              </div>

              {/* Start lesson button for next day */}
              {isNext && (
                <div style={{ padding: '0 16px 10px' }}>
                  <div style={{ fontSize: 11, color: palette.textMuted, marginBottom: 6 }}>
                    {day.sub.slice(0, 3).join(' · ')}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <span style={{ fontSize: 11, color: palette.textMuted }}>{day.min} min</span>
                  </div>
                </div>
              )}

              {/* Expanded completed day details */}
              {isExpanded && day.status === 'completed' && (
                <div style={{ padding: '0 16px 10px 44px', fontSize: 12, color: palette.textSecondary }}>
                  {day.doneAt && (
                    <div style={{ marginBottom: 4 }}>
                      Completed: {new Date(day.doneAt).toLocaleDateString()}
                    </div>
                  )}
                  <div>Objectives: {day.sub.join(', ')}</div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Regenerate button */}
      <div style={{ ...section, paddingTop: 12 }}>
        {!showRegenerateConfirm && (
          <button
            style={{ ...btnGhost, width: '100%', fontSize: 12 }}
            onClick={() => setShowRegenerateConfirm(true)}
          >
            {t('planRegenerate')}
          </button>
        )}
      </div>

      {/* Practice materials (collapsible) */}
      {selectedStudentId && materialSection}
    </div>
  );
}
