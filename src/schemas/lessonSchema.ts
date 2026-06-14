/**
 * Zod schemas for runtime validation of lesson reports and backup files.
 * Non-score fields use .catch()/.default() to be lenient when ChatGPT
 * omits or malforms optional fields. Score fields are strict 0–100 integers.
 */

import { z } from 'zod';

/** A strict 0–100 integer score — must validate exactly. */
const score = z.number().int().min(0).max(100);

/**
 * Validates the raw JSON object ChatGPT returns for an end-of-lesson report.
 * Array fields default to [] and string fields default to '' if missing or malformed,
 * so a partial response still yields a usable summary rather than a total failure.
 */
export const LessonReportSchema = z.object({
  lessonTopic: z.string().catch(''),
  grammarTopics: z.array(z.string()).catch([]),
  vocabularyTopics: z.array(z.string()).catch([]),
  readingTopics: z.array(z.string()).catch([]),
  writingTopics: z.array(z.string()).catch([]),
  strengthsObserved: z.array(z.string()).catch([]),
  weaknessesObserved: z.array(z.string()).catch([]),
  homework: z.array(z.string()).catch([]),
  teacherNotes: z.array(z.string()).catch([]),
  // Scores must be strict 0–100 integers
  participationScore: score,
  grammarScore: score,
  vocabularyScore: score,
  readingScore: score,
  writingScore: score,
  overallScore: score,
});

export type LessonReport = z.infer<typeof LessonReportSchema>;

/**
 * Validates an imported backup file structure.
 * Uses .passthrough() so extra fields in settings or student profiles
 * do not cause validation failures — forward-compatibility.
 */
export const BackupSchema = z.object({
  version: z.string(),
  exportedAt: z.string(),
  settings: z
    .object({
      sourceLanguage: z.string(),
      targetLanguage: z.string(),
      memoryDepth: z.number(),
      maxLessonsPerStudent: z.number(),
      ttsEnabled: z.boolean(),
      defaultVoiceInputLanguage: z.enum(['source', 'target']),
      setupComplete: z.boolean(),
    })
    .passthrough(),
  students: z.array(
    z
      .object({
        id: z.string(),
        name: z.string(),
        age: z.number(),
        languageLevel: z.string(),
        canReadWriteSourceLanguage: z.boolean(),
        canReadWriteTargetLanguage: z.boolean(),
        goals: z.array(z.string()),
        strengths: z.array(z.string()),
        weaknesses: z.array(z.string()),
        grammarTopicsLearned: z.array(z.string()),
        vocabularyTopicsLearned: z.array(z.string()),
        readingTopicsCompleted: z.array(z.string()),
        writingTopicsCompleted: z.array(z.string()),
        lessonHistory: z.array(z.unknown()),
        createdAt: z.string(),
        updatedAt: z.string(),
      })
      .passthrough()
  ),
});

export type BackupFile = z.infer<typeof BackupSchema>;
