/**
 * Data portability: export all data to JSON and import from JSON backups.
 * Import strategy: MERGE — existing students updated by id, new ones added; settings replaced.
 */

import { read, write } from './storageHelper';
import { getSettings, saveSettings } from './settingsRepository';
import { getAll, update, create } from './studentRepository';
import { BackupSchema } from '../schemas/lessonSchema';
import type { ImportResult } from '../types/index';
import type { AppSettings, StudentProfile } from '../types/index';

const BACKUP_VERSION = '1.0';

/** Chrome's localStorage quota is 5 MB (5,242,880 bytes). */
const TOTAL_BYTES = 5 * 1024 * 1024;

/**
 * Exports all data (settings + students with full lesson history) as a JSON string.
 * The resulting string can be saved as a .json file by the caller.
 */
export async function exportAll(): Promise<string> {
  const settings = await getSettings();
  const students = await getAll();
  const payload = {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    settings: settings ?? {},
    students,
  };
  return JSON.stringify(payload, null, 2);
}

/**
 * Imports a backup JSON string and merges it into existing storage.
 * - Settings are replaced wholesale.
 * - Students with matching ids are updated; new ids are inserted as new students.
 * Returns an ImportResult summary.
 * Throws on JSON parse errors or Zod validation failures (caller shows the error).
 */
export async function importAll(jsonString: string): Promise<ImportResult> {
  const result: ImportResult = {
    studentsImported: 0,
    studentsUpdated: 0,
    settingsImported: false,
    errors: [],
  };

  // Parse JSON
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonString);
  } catch {
    throw new Error('INVALID_JSON');
  }

  // Validate structure
  const validation = BackupSchema.safeParse(parsed);
  if (!validation.success) {
    throw new Error('INVALID_STRUCTURE');
  }

  const backup = validation.data;
  const existingStudents = await getAll();
  const existingIds = new Set(existingStudents.map((s) => s.id));

  // Replace settings
  try {
    await saveSettings(backup.settings as AppSettings);
    result.settingsImported = true;
  } catch (err) {
    result.errors.push(`Settings import failed: ${String(err)}`);
  }

  // Merge students
  for (const rawStudent of backup.students) {
    const student = rawStudent as StudentProfile;
    try {
      if (existingIds.has(student.id)) {
        await update(student.id, student);
        result.studentsUpdated++;
      } else {
        // Insert with original id by writing directly
        const studentsMap = await read<Record<string, StudentProfile>>('students', {});
        studentsMap[student.id] = student;
        await write('students', studentsMap);
        result.studentsImported++;
      }
    } catch (err) {
      result.errors.push(`Student "${student.name}" (${student.id}): ${String(err)}`);
    }
  }

  return result;
}

/**
 * Returns current chrome.storage.local usage versus the 5 MB quota.
 */
export async function getStorageUsage(): Promise<{
  usedBytes: number;
  totalBytes: number;
  percentUsed: number;
}> {
  try {
    const usedBytes = await chrome.storage.local.getBytesInUse(null);
    const percentUsed = Math.round((usedBytes / TOTAL_BYTES) * 100);
    return { usedBytes, totalBytes: TOTAL_BYTES, percentUsed };
  } catch (err) {
    console.error('[dataPortRepository] getStorageUsage failed:', err);
    return { usedBytes: 0, totalBytes: TOTAL_BYTES, percentUsed: 0 };
  }
}
