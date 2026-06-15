/**
 * All shared TypeScript interfaces for the AI Language Teacher extension.
 */

export type LanguageLevel =
  | 'Beginner'
  | 'Elementary'
  | 'Pre-Intermediate'
  | 'Intermediate'
  | 'Upper-Intermediate'
  | 'Advanced';

export type SessionType =
  | 'Voice Conversation'
  | 'Grammar Lesson'
  | 'Reading Comprehension'
  | 'Writing Practice'
  | 'Mixed Lesson';

/**
 * Device-level app settings — only configuration that applies to the device as a whole,
 * not to individual students. Language preferences, memory depth, and voice settings
 * are all per-student and live in StudentProfile.
 * Stored under chrome.storage.local key: 'appSettings'
 */
export interface AppSettings {
  /** Maximum lessons stored per student before oldest are pruned. Default: 50. */
  maxLessonsPerStudent: number;
}

/**
 * Per-student profile. All teaching preferences are stored here because different
 * students on the same device may speak different languages and have different abilities.
 */
export interface StudentProfile {
  id: string;
  name: string;

  /** Student's age — used to customize content maturity, vocabulary, and topics.
   *  Age 4–10:  very simple vocabulary, games, songs, picture descriptions.
   *  Age 11–14: school topics, basic grammar, simple stories.
   *  Age 15–18: teen topics, more complex grammar, essays.
   *  Age 18+:   adult topics, professional vocabulary, nuanced grammar. */
  age: number;

  languageLevel: LanguageLevel;

  /** The student's native language (e.g. "Persian", "Arabic").
   *  Used for teacher explanations and as a TTS/STT language option. */
  sourceLanguage: string;

  /** The language being taught (e.g. "English", "German"). */
  targetLanguage: string;

  /** How many past lesson summaries to inject into the teacher prompt per session.
   *  Default: 3. Range: 1–10. */
  memoryDepth: number;

  /** Whether teacher replies are read aloud via text-to-speech for this student. Default: true. */
  ttsEnabled: boolean;

  /** Which language the microphone listens in by default for this student: 'source' or 'target'.
   *  The student can flip this live during a lesson. Default: 'target'. */
  defaultVoiceInputLanguage: 'source' | 'target';

  /** Whether this student can read and write in the SOURCE language.
   *  If false: the teacher must use only very short spoken-style phrases for explanations. */
  canReadWriteSourceLanguage: boolean;

  /** Whether this student can read and write in the TARGET language.
   *  If false: Reading Comprehension and Writing Practice are disabled for this student. */
  canReadWriteTargetLanguage: boolean;

  goals: string[];
  strengths: string[];
  weaknesses: string[];
  grammarTopicsLearned: string[];
  vocabularyTopicsLearned: string[];
  readingTopicsCompleted: string[];   // only populated if canReadWriteTargetLanguage = true
  writingTopicsCompleted: string[];   // only populated if canReadWriteTargetLanguage = true
  lessonHistory: LessonSummary[];
  createdAt: string;
  updatedAt: string;
}

export interface LessonSummary {
  id: string;
  date: string;
  sessionType: SessionType;
  lessonTopic: string;
  grammarTopics: string[];
  vocabularyTopics: string[];
  readingTopics: string[];
  writingTopics: string[];
  strengthsObserved: string[];
  weaknessesObserved: string[];
  homework: string[];
  teacherNotes: string[];
  participationScore: number;   // 0–100
  grammarScore: number;         // 0–100
  vocabularyScore: number;      // 0–100
  readingScore: number;         // 0–100
  writingScore: number;         // 0–100
  overallScore: number;         // 0–100
}

/**
 * The single source of truth for an in-progress lesson.
 * Stored in chrome.storage.session under key 'activeSession'.
 * null when no lesson is active.
 */
export interface ActiveSession {
  studentId: string;
  sessionType: SessionType;
  startedAt: string;   // ISO string; used to compute elapsed time

  /** The ChatGPT conversation URL captured right after startNewConversation().
   *  On page reload we compare the current URL to this to detect an interrupted session. */
  conversationUrl: string;

  /** Voice Conversation sessions only: true if ChatGPT's voice mode was successfully activated. */
  voiceModeActivated?: boolean;

  /** Set when the lesson was started from a learning plan day. */
  planDayNumber?: number;
}

/** A single message shown in our chat UI. */
export interface ChatMessage {
  id: string;
  role: 'student' | 'teacher';
  text: string;
  at: string;          // ISO timestamp
}

/**
 * The live transcript of the active lesson, shown in our ChatView.
 * Stored in chrome.storage.session under key 'transcript'.
 */
export type Transcript = ChatMessage[];

/**
 * Result of importing a backup file.
 */
export interface ImportResult {
  studentsImported: number;
  studentsUpdated: number;
  settingsImported: boolean;
  errors: string[];
}

// ─── Learning Plan types ──────────────────────────────────────────────────────

export type PracticeFrequency = 'daily' | 'weekdays' | 'alternate' | 'weekly';
export type PlanDayType = 'Grammar' | 'Vocabulary' | 'Reading' | 'Writing' | 'Speaking' | 'Review';
export type DayStatus = 'pending' | 'completed' | 'skipped';
export type MaterialType = 'vocabulary' | 'grammar' | 'reading' | 'writing' | 'review';

export interface LearningPlanConfig {
  targetLevel: LanguageLevel;
  durationDays: number;
  frequency: PracticeFrequency;
  sessionMinutes: number;
  startDate: string;        // YYYY-MM-DD
}

export interface DayPlan {
  d: number;           // day number, 1-based
  t: PlanDayType;
  topic: string;
  sub: string[];       // 2-4 sub-topics / objectives
  min: number;         // estimated minutes
  status: DayStatus;
  score?: number;
  doneAt?: string;
}

export interface LearningPlan {
  id: string;
  studentId: string;
  generatedAt: string;
  config: LearningPlanConfig;
  configHash: string;
  days: DayPlan[];
}
