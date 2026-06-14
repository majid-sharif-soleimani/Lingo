/**
 * Thin shared wrappers around chrome.storage.local.
 * All repositories use these so error handling is centralised in one place.
 *
 * Note: chrome.storage.session is NOT available in content scripts (only in service workers
 * and extension pages). All data — both persistent and session-scoped — is stored in
 * chrome.storage.local. Session-scoped keys (activeSession, transcript) are cleaned up
 * explicitly when a lesson ends or is abandoned.
 */

/**
 * Reads a value from chrome.storage.local.
 * Returns the fallback if the key is absent or any error occurs.
 */
export async function read<T>(key: string, fallback: T): Promise<T> {
  try {
    const result = await chrome.storage.local.get(key);
    return (result[key] as T) ?? fallback;
  } catch (err) {
    console.error(`[storageHelper] read("${key}") failed:`, err);
    return fallback;
  }
}

/**
 * Writes a value to chrome.storage.local.
 * Throws on quota errors so callers can surface a message to the user.
 */
export async function write<T>(key: string, value: T): Promise<void> {
  await chrome.storage.local.set({ [key]: value });
}

/**
 * Reads a session-scoped value from chrome.storage.local.
 * "Session-scoped" means the key is removed when the lesson ends/is abandoned,
 * not that it uses chrome.storage.session (which is unavailable in content scripts).
 */
export async function readSession<T>(key: string, fallback: T): Promise<T> {
  try {
    const result = await chrome.storage.local.get(key);
    return (result[key] as T) ?? fallback;
  } catch (err) {
    console.error(`[storageHelper] readSession("${key}") failed:`, err);
    return fallback;
  }
}

/**
 * Writes a session-scoped value to chrome.storage.local.
 */
export async function writeSession<T>(key: string, value: T): Promise<void> {
  await chrome.storage.local.set({ [key]: value });
}

/**
 * Removes a session-scoped key from chrome.storage.local.
 */
export async function removeSession(key: string): Promise<void> {
  try {
    await chrome.storage.local.remove(key);
  } catch (err) {
    console.error(`[storageHelper] removeSession("${key}") failed:`, err);
  }
}
