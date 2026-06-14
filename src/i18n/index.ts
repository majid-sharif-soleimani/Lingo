/**
 * i18n entry point. Provides getStrings() and a module-level t() function.
 * The active locale is set once when the panel mounts via setLanguage().
 */

import type { UIStrings } from './strings/en';
import { toLanguageCode } from './languageCodes';

import en from './strings/en';
import fa from './strings/fa';
import ar from './strings/ar';
import tr from './strings/tr';
import fr from './strings/fr';
import de from './strings/de';
import es from './strings/es';
import zh from './strings/zh';
import ja from './strings/ja';
import sv from './strings/sv';

export type { UIStrings };

const STRING_TABLES: Record<string, UIStrings> = { en, fa, ar, tr, fr, de, es, zh, ja, sv };

/** RTL language codes — used by the UI to set text direction. */
export const RTL_CODES = new Set(['fa', 'ar']);

/**
 * Returns the UIStrings table for the given source language name.
 * Falls back to English if no table is available for the resolved code.
 */
export function getStrings(sourceLanguage: string): UIStrings {
  const code = toLanguageCode(sourceLanguage);
  return STRING_TABLES[code] ?? en;
}

/**
 * Returns true if the given source language name maps to a right-to-left language.
 */
export function isRTL(sourceLanguage: string): boolean {
  return RTL_CODES.has(toLanguageCode(sourceLanguage));
}

// Module-level active strings — set once via setLanguage()
let _active: UIStrings = en;

/**
 * Sets the active language for the module-level t() function.
 * Call this once when the panel mounts with the user's source language.
 */
export function setLanguage(sourceLanguage: string): void {
  _active = getStrings(sourceLanguage);
}

/**
 * Translates a UIStrings key using the currently active language.
 * Falls back to the English string if the active table is missing the key.
 */
export function t(key: keyof UIStrings): string {
  return _active[key] ?? en[key] ?? key;
}
