/**
 * Repository for device-level AppSettings stored under chrome.storage.local key: 'appSettings'.
 * Language preferences and teaching options are per-student; only device-wide settings live here.
 */

import type { AppSettings } from '../types/index';
import { read, write } from './storageHelper';

const STORAGE_KEY = 'appSettings';

const DEFAULTS: AppSettings = {
  maxLessonsPerStudent: 50,
};

/**
 * Retrieves the stored AppSettings merged with defaults.
 * Always returns a complete object (never null).
 */
export async function getSettings(): Promise<AppSettings> {
  const stored = await read<Partial<AppSettings> | null>(STORAGE_KEY, null);
  return { ...DEFAULTS, ...(stored ?? {}) };
}

/** Alias for callers that need a guaranteed non-null result. */
export const getSettingsOrDefaults = getSettings;

/**
 * Persists AppSettings to chrome.storage.local.
 * Throws on quota errors.
 */
export async function saveSettings(settings: AppSettings): Promise<void> {
  await write(STORAGE_KEY, settings);
}
