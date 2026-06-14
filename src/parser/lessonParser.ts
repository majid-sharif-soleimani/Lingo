/**
 * Extracts and validates the end-of-lesson JSON report from ChatGPT's raw response text.
 * Uses the Zod LessonReportSchema for validation, which is lenient on non-score fields.
 */

import { v4 as uuidv4 } from 'uuid';
import { LessonReportSchema } from '../schemas/lessonSchema';
import type { LessonReport } from '../schemas/lessonSchema';
import type { LessonSummary, SessionType } from '../types/index';

/**
 * Attempts to parse and validate a lesson report from the raw text ChatGPT returned.
 * Strategy:
 *   1. Try JSON.parse(rawText.trim()) directly.
 *   2. If that fails, extract the first {...} block with a regex.
 *   3. Validate via LessonReportSchema.safeParse().
 * Returns a validated LessonReport on success, or null if parsing/validation fails.
 */
export function extractLessonReport(rawText: string): LessonReport | null {
  const trimmed = rawText.trim();

  // Attempt 1: direct parse
  let parsed: unknown = null;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    // Attempt 2: extract first JSON object block
    const match = trimmed.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        parsed = JSON.parse(match[0]);
      } catch {
        console.error('[lessonParser] Failed to parse extracted JSON block');
        return null;
      }
    } else {
      console.error('[lessonParser] No JSON object found in response');
      return null;
    }
  }

  const result = LessonReportSchema.safeParse(parsed);
  if (!result.success) {
    console.error('[lessonParser] Zod validation failed:', result.error.issues);
    return null;
  }

  return result.data;
}

/**
 * Converts a validated LessonReport to a full LessonSummary ready for storage.
 * Adds the id (uuid v4), date (ISO string today), and sessionType from the active session.
 */
export function toLessonSummary(report: LessonReport, sessionType: SessionType): LessonSummary {
  return {
    id: uuidv4(),
    date: new Date().toISOString(),
    sessionType,
    lessonTopic: report.lessonTopic,
    grammarTopics: report.grammarTopics,
    vocabularyTopics: report.vocabularyTopics,
    readingTopics: report.readingTopics,
    writingTopics: report.writingTopics,
    strengthsObserved: report.strengthsObserved,
    weaknessesObserved: report.weaknessesObserved,
    homework: report.homework,
    teacherNotes: report.teacherNotes,
    participationScore: report.participationScore,
    grammarScore: report.grammarScore,
    vocabularyScore: report.vocabularyScore,
    readingScore: report.readingScore,
    writingScore: report.writingScore,
    overallScore: report.overallScore,
  };
}
