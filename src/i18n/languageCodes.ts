/**
 * Maps human-readable language names to BCP-47 language codes.
 * Accepts names in English or the language's own script.
 */

/** Mapping from various name forms to BCP-47 base codes. */
const NAME_TO_CODE: Record<string, string> = {
  // English
  english: 'en',
  انگلیسی: 'en',
  الإنجليزية: 'en',
  'İngilizce': 'en',
  anglais: 'en',
  englisch: 'en',
  inglés: 'en',
  英语: 'en',
  英文: 'en',
  英語: 'en',

  // Persian / Farsi
  persian: 'fa',
  farsi: 'fa',
  فارسی: 'fa',
  'فارسي': 'fa',
  فارس: 'fa',
  ایرانی: 'fa',

  // Arabic
  arabic: 'ar',
  عربی: 'ar',
  عربي: 'ar',
  العربية: 'ar',

  // Turkish
  turkish: 'tr',
  türkçe: 'tr',
  turkce: 'tr',
  türkisch: 'tr',
  turc: 'tr',
  turco: 'tr',
  'ترکی': 'tr',
  تركي: 'tr',

  // French
  french: 'fr',
  français: 'fr',
  francais: 'fr',
  französisch: 'fr',
  francés: 'fr',
  法语: 'fr',
  فرانسوی: 'fr',
  الفرنسية: 'fr',

  // German
  german: 'de',
  deutsch: 'de',
  allemand: 'de',
  alemán: 'de',
  德语: 'de',
  آلمانی: 'de',
  الألمانية: 'de',

  // Spanish
  spanish: 'es',
  español: 'es',
  espanol: 'es',
  espagnol: 'es',
  spanisch: 'es',
  spagnolo: 'es',
  西班牙语: 'es',
  اسپانیایی: 'es',
  الإسبانية: 'es',

  // Chinese
  chinese: 'zh',
  mandarin: 'zh',
  中文: 'zh',
  汉语: 'zh',
  普通话: 'zh',
  چینی: 'zh',
  الصينية: 'zh',
  chinesisch: 'zh',
  chinois: 'zh',
  chino: 'zh',

  // Japanese
  japanese: 'ja',
  日本語: 'ja',
  日语: 'ja',
  ژاپنی: 'ja',
  اليابانية: 'ja',
  japonais: 'ja',
  japanisch: 'ja',
  japonés: 'ja',

  // Korean
  korean: 'ko',
  한국어: 'ko',
  کره‌ای: 'ko',
  الكورية: 'ko',

  // Italian
  italian: 'it',
  italiano: 'it',
  italienisch: 'it',
  italien: 'it',
  ایتالیایی: 'it',
  الإيطالية: 'it',

  // Portuguese
  portuguese: 'pt',
  português: 'pt',
  portugues: 'pt',
  portugiesisch: 'pt',
  portugais: 'pt',
  portugués: 'pt',

  // Swedish
  swedish: 'sv',
  svenska: 'sv',
  schwedisch: 'sv',
  suédois: 'sv',
  sueco: 'sv',
  سوئدی: 'sv',
  '瑞典语': 'sv',
  スウェーデン語: 'sv',
  السويدية: 'sv',
};

/**
 * Converts a human-readable language name to a BCP-47 base code.
 * Accepts names in English or the language's own script.
 * Returns 'en' as the fallback for unknown languages.
 */
export function toLanguageCode(name: string): string {
  const normalized = name.trim().toLowerCase();
  return NAME_TO_CODE[normalized] ?? NAME_TO_CODE[name.trim()] ?? 'en';
}

/** Maps BCP-47 base codes to full speech locales for STT/TTS. */
const CODE_TO_SPEECH_LOCALE: Record<string, string> = {
  en: 'en-US',
  fa: 'fa-IR',
  ar: 'ar-SA',
  tr: 'tr-TR',
  fr: 'fr-FR',
  de: 'de-DE',
  es: 'es-ES',
  zh: 'zh-CN',
  ja: 'ja-JP',
  ko: 'ko-KR',
  it: 'it-IT',
  pt: 'pt-BR',
  sv: 'sv-SE',
};

/**
 * Converts a BCP-47 base code to a full speech locale suitable for SpeechRecognition/SpeechSynthesis.
 * Falls back to the code itself if not in the map.
 */
export function toSpeechLocale(code: string): string {
  return CODE_TO_SPEECH_LOCALE[code] ?? code;
}
