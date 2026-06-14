/**
 * DataTab — export/import data, storage usage meter, and device-level settings.
 * Language preferences are per-student and edited in the Students tab.
 */
import React, { useState, useEffect, useRef } from 'react';
import type { AppSettings, StudentProfile } from '../../types/index';
import { t } from '../../i18n/index';
import * as dataPort from '../../storage/dataPortRepository';
import * as studentRepo from '../../storage/studentRepository';
import { saveSettings } from '../../storage/settingsRepository';
import { readSession } from '../../storage/storageHelper';
import {
  section,
  sectionTitle,
  btnPrimary,
  btnDanger,
  btnGhost,
  notice,
  palette,
  scoreBarOuter,
  divider,
  formGroup,
  label as labelStyle,
  input as inputStyle,
  select as selectStyle,
} from '../styles';

interface DataTabProps {
  settings: AppSettings;
  dir: 'ltr' | 'rtl';
}

/**
 * Data management: storage usage, export/import, and the device-level
 * maxLessonsPerStudent setting.
 */
export function DataTab({ settings, dir }: DataTabProps): React.ReactElement {
  const [usage, setUsage] = useState<{ usedBytes: number; totalBytes: number; percentUsed: number } | null>(null);
  const [exportStatus, setExportStatus] = useState<string | null>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [showImportWarning, setShowImportWarning] = useState(false);
  const [maxLessons, setMaxLessons] = useState(settings.maxLessonsPerStudent);
  const [settingsSaved, setSettingsSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clear progress state
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [clearStudentId, setClearStudentId] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [clearSuccess, setClearSuccess] = useState(false);

  useEffect(() => {
    dataPort.getStorageUsage().then(setUsage).catch(console.error);
    studentRepo.getAll().then((list) => {
      setStudents(list);
      // Pre-select the last-used student
      readSession<string>('lastStudentId', '').then((id) => {
        if (id && list.some((s) => s.id === id)) setClearStudentId(id);
        else if (list.length > 0) setClearStudentId(list[0].id);
      }).catch(console.error);
    }).catch(console.error);
  }, []);

  async function handleExport() {
    setExportStatus(null);
    try {
      const json = await dataPort.exportAll();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ai-teacher-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setExportStatus('Export complete.');
    } catch {
      setExportStatus(t('storageWriteFailed'));
    }
  }

  function handleImportClick() {
    setShowImportWarning(true);
  }

  function confirmImport() {
    setShowImportWarning(false);
    fileInputRef.current?.click();
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportError(null);
    setImportStatus(null);
    const text = await file.text();
    try {
      const result = await dataPort.importAll(text);
      setImportStatus(
        `${t('importSuccess')} ${result.studentsImported} added, ${result.studentsUpdated} updated.`
      );
      dataPort.getStorageUsage().then(setUsage).catch(console.error);
    } catch (err) {
      const msg = String(err);
      if (msg.includes('INVALID_JSON')) setImportError(t('importInvalidJson'));
      else if (msg.includes('INVALID_STRUCTURE')) setImportError(t('importInvalidStructure'));
      else setImportError(t('storageWriteFailed'));
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function handleClearProgress() {
    if (!clearStudentId) return;
    setClearing(true);
    setClearSuccess(false);
    try {
      await studentRepo.clearProgress(clearStudentId);
      setShowClearConfirm(false);
      setClearSuccess(true);
      setTimeout(() => setClearSuccess(false), 3000);
      dataPort.getStorageUsage().then(setUsage).catch(console.error);
    } catch {
      // ignore
    } finally {
      setClearing(false);
    }
  }

  async function handleSaveSettings() {
    try {
      await saveSettings({ maxLessonsPerStudent: Math.max(1, Math.min(200, maxLessons)) });
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 2000);
    } catch {
      // ignore — rare
    }
  }

  const kbUsed = usage ? Math.round(usage.usedBytes / 1024) : 0;
  const mbTotal = usage ? Math.round(usage.totalBytes / (1024 * 1024)) : 5;
  const pct = usage?.percentUsed ?? 0;

  return (
    <div style={{ direction: dir }}>
      {/* Storage usage */}
      <div style={section}>
        <div style={sectionTitle}>{t('storageUsage')}</div>
        <div style={scoreBarOuter}>
          <div style={{
            width: `${Math.min(100, pct)}%`,
            height: '100%',
            background: pct > 80 ? palette.danger : pct > 60 ? palette.warning : palette.primary,
            borderRadius: 4,
            transition: 'width 0.4s',
          }} />
        </div>
        <div style={{ fontSize: 12, color: palette.textSecondary, marginTop: 4 }}>
          {kbUsed} KB / {mbTotal} MB ({pct}%)
        </div>
        {pct > 80 && (
          <div style={{ ...notice('warning'), marginTop: 8 }}>{t('storageWarning')}</div>
        )}
      </div>

      <div style={divider} />

      {/* Export */}
      <div style={section}>
        <div style={sectionTitle}>{t('exportData')}</div>
        <button style={{ ...btnGhost, width: '100%' }} onClick={() => void handleExport()}>
          ⬇ {t('exportData')}
        </button>
        {exportStatus && <div style={{ ...notice('info'), marginTop: 8 }}>{exportStatus}</div>}
      </div>

      <div style={divider} />

      {/* Import */}
      <div style={section}>
        <div style={sectionTitle}>{t('importData')}</div>
        <button style={{ ...btnGhost, width: '100%' }} onClick={handleImportClick}>
          ⬆ {t('importData')}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          style={{ display: 'none' }}
          onChange={(e) => void handleFileChange(e)}
        />
        {showImportWarning && (
          <div style={{ ...notice('warning'), marginTop: 8 }}>
            <div style={{ marginBottom: 8 }}>{t('importMergeWarning')}</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button style={{ ...btnPrimary, padding: '6px 12px', fontSize: 13 }} onClick={confirmImport}>
                {t('importData')}
              </button>
              <button style={{ ...btnGhost, padding: '6px 12px', fontSize: 13 }} onClick={() => setShowImportWarning(false)}>
                {t('cancelEdit')}
              </button>
            </div>
          </div>
        )}
        {importStatus && <div style={{ ...notice('info'), marginTop: 8 }}>{importStatus}</div>}
        {importError && <div style={{ ...notice('error'), marginTop: 8 }}>{importError}</div>}
      </div>

      <div style={divider} />

      {/* Clear student progress */}
      <div style={section}>
        <div style={sectionTitle}>{t('clearProgress')}</div>
        {students.length === 0 ? (
          <div style={{ fontSize: 13, color: palette.textMuted }}>{t('noStudentsYet')}</div>
        ) : (
          <>
            <div style={formGroup}>
              <label style={labelStyle}>{t('selectStudent')}</label>
              <select
                style={selectStyle}
                value={clearStudentId}
                onChange={(e) => {
                  setClearStudentId(e.target.value);
                  setShowClearConfirm(false);
                  setClearSuccess(false);
                }}
                dir={dir}
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.sourceLanguage} → {s.targetLanguage})
                  </option>
                ))}
              </select>
            </div>

            {!showClearConfirm && !clearSuccess && (
              <button
                style={{ ...btnDanger, width: '100%' }}
                onClick={() => setShowClearConfirm(true)}
                disabled={!clearStudentId}
              >
                {t('clearProgress')}
              </button>
            )}

            {showClearConfirm && (
              <div style={{ ...notice('error'), marginTop: 0 }}>
                <div style={{ marginBottom: 10 }}>{t('clearProgressConfirm')}</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    style={{ ...btnDanger, padding: '6px 12px', fontSize: 13 }}
                    onClick={() => void handleClearProgress()}
                    disabled={clearing}
                  >
                    {clearing ? '…' : t('clearProgress')}
                  </button>
                  <button
                    style={{ ...btnGhost, padding: '6px 12px', fontSize: 13 }}
                    onClick={() => setShowClearConfirm(false)}
                  >
                    {t('cancelEdit')}
                  </button>
                </div>
              </div>
            )}

            {clearSuccess && (
              <div style={{ ...notice('info'), marginTop: 0 }}>{t('clearProgressSuccess')}</div>
            )}
          </>
        )}
      </div>

      <div style={divider} />

      {/* Device-level settings */}
      <div style={section}>
        <div style={sectionTitle}>{t('editSettings')}</div>
        <div style={{ fontSize: 12, color: palette.textMuted, marginBottom: 10 }}>
          Language, voice, and memory settings are configured per-student in the Students tab.
        </div>
        <div style={formGroup}>
          <label style={labelStyle}>Max lessons stored per student</label>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              type="number"
              min={1}
              max={200}
              style={{ ...inputStyle, width: 80 }}
              value={maxLessons}
              onChange={(e) => setMaxLessons(parseInt(e.target.value, 10) || 50)}
            />
            <button style={{ ...btnGhost, padding: '6px 12px', fontSize: 13 }} onClick={() => void handleSaveSettings()}>
              {t('saveSettings')}
            </button>
          </div>
          {settingsSaved && (
            <div style={{ fontSize: 12, color: palette.primary, marginTop: 4 }}>Saved ✓</div>
          )}
        </div>
      </div>
    </div>
  );
}
