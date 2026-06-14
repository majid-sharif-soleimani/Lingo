/**
 * Text-to-speech wrapper using the Web Speech API (SpeechSynthesis).
 * Teacher replies are spoken in the target language locale.
 * Note: mixed-language replies (target + source explanations) are read with one voice —
 * an accepted limitation of the Web Speech API.
 */

/** True if SpeechSynthesis is available in this browser. */
export const isTTSSupported: boolean =
  typeof window !== 'undefined' && typeof window.speechSynthesis !== 'undefined';

/**
 * Speaks the given text in the specified locale.
 * Cancels any currently playing utterance first.
 * Picks the best available voice whose lang starts with the locale's base code.
 * Falls back to the browser's default voice if no matching voice is found.
 *
 * @param text   The text to speak.
 * @param locale A BCP-47 locale string (e.g. 'en-US', 'fa-IR').
 */
export function speak(text: string, locale: string): void {
  if (!isTTSSupported) return;

  // Cancel any current utterance
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = locale;

  // Pick the best voice: prefer one whose lang starts with the base code
  const baseCode = locale.split('-')[0].toLowerCase();
  const voices = window.speechSynthesis.getVoices();
  const bestVoice = voices.find((v) => v.lang.toLowerCase().startsWith(baseCode));
  if (bestVoice) {
    utterance.voice = bestVoice;
  }
  // If no matching voice, the browser uses its default — acceptable fallback

  utterance.onerror = (ev) => {
    console.warn('[speechOutput] TTS error:', ev.error);
  };

  window.speechSynthesis.speak(utterance);
}

/**
 * Cancels any currently playing TTS utterance.
 */
export function stopSpeaking(): void {
  if (!isTTSSupported) return;
  window.speechSynthesis.cancel();
}
