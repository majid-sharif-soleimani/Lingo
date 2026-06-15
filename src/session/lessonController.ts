/**
 * Lesson Controller — orchestrates the full lifecycle of a lesson.
 *
 * Pure orchestration: no UI code here. The UI calls these functions directly.
 * The only shared mutable state is chrome.storage (session + local).
 *
 * Memory note: the full conversation is NOT stored. Only the structured LessonSummary
 * (topics, scores, strengths/weaknesses, homework, notes) persists and feeds future
 * sessions via student.memoryDepth. This keeps storage small and prompts concise.
 */

import { v4 as uuidv4 } from 'uuid';
import type { ActiveSession, LessonSummary, SessionType } from '../types/index';
import { getSettingsOrDefaults } from '../storage/settingsRepository';
import * as studentRepo from '../storage/studentRepository';
import { readSession, writeSession, removeSession } from '../storage/storageHelper';
import { buildTeacherSystemPrompt, buildEndLessonPrompt } from '../prompts/promptBuilder';
import { extractLessonReport, toLessonSummary } from '../parser/lessonParser';
import { sendToChatGPT, RelayError } from '../content/chatRelay';
import { startNewConversation, isChatGPTReady } from '../content/domIntegration';
import type { ChatMessage } from '../types/index';

export { RelayError };

/** Typed error for lesson report parse failures. */
export class LessonParseError extends Error {
  constructor(message = 'Failed to parse lesson report') {
    super(message);
    this.name = 'LessonParseError';
  }
}

const SESSION_KEY = 'activeSession';
const TRANSCRIPT_KEY = 'transcript';

/**
 * Starts a new lesson session.
 *   1. Load student + check ChatGPT is ready.
 *   2. Fetch recent lessons for memory injection (count = student.memoryDepth).
 *   3. Build the teacher system prompt from the student's own language settings.
 *   4. Open a fresh ChatGPT conversation.
 *   5. Write ActiveSession + empty transcript to storage so the UI switches to
 *      the full-screen ChatView overlay immediately (hiding ChatGPT).
 *   6. Send the hidden teacher system prompt and wait for the opening reply.
 *   7. Write the opening reply to the transcript.
 *
 * If step 6 fails, the session is removed so the UI reverts to the Control Panel
 * and shows t('startFailed').
 */
export async function startLesson(studentId: string, sessionType: SessionType, planDayNumber?: number): Promise<void> {
  console.log('[lessonController] startLesson — studentId:', studentId, 'sessionType:', sessionType);

  const student = await studentRepo.getById(studentId);
  if (!student) throw new Error(`Student not found: ${studentId}`);
  console.log('[lessonController] student:', student.name, `(${student.sourceLanguage}→${student.targetLanguage})`);

  const ready = isChatGPTReady();
  console.log('[lessonController] isChatGPTReady:', ready);
  if (!ready) {
    throw new RelayError('not-ready', 'ChatGPT composer input not found');
  }

  const recentLessons = await studentRepo.getLastNLessons(studentId, student.memoryDepth);
  console.log('[lessonController] recentLessons count:', recentLessons.length);

  const prompt = buildTeacherSystemPrompt(student, sessionType, recentLessons);
  console.log('[lessonController] prompt built, length:', prompt.length, 'chars');

  console.log('[lessonController] starting new conversation…');
  const conversationUrl = await startNewConversation();
  console.log('[lessonController] conversationUrl after nav:', conversationUrl);

  const session: ActiveSession = {
    studentId,
    sessionType,
    startedAt: new Date().toISOString(),
    conversationUrl,
    ...(planDayNumber !== undefined ? { planDayNumber } : {}),
  };
  await writeSession(SESSION_KEY, session);
  await writeSession(TRANSCRIPT_KEY, []);
  console.log('[lessonController] session written to storage, sending prompt…');

  let opening: string;
  try {
    opening = await sendToChatGPT(prompt);
    console.log('[lessonController] opening reply received, length:', opening.length, 'chars');
  } catch (err) {
    console.error('[lessonController] sendToChatGPT (prompt) FAILED:', err);
    await removeSession(SESSION_KEY);
    await removeSession(TRANSCRIPT_KEY);
    throw err;
  }

  const actualConversationUrl = location.href;
  if (actualConversationUrl !== session.conversationUrl) {
    console.log('[lessonController] updating conversationUrl to:', actualConversationUrl);
    await writeSession(SESSION_KEY, { ...session, conversationUrl: actualConversationUrl });
  }

  const initialTranscript: ChatMessage[] = [
    {
      id: uuidv4(),
      role: 'teacher',
      text: opening,
      at: new Date().toISOString(),
    },
  ];
  await writeSession(TRANSCRIPT_KEY, initialTranscript);
  console.log('[lessonController] startLesson complete');
}

/**
 * Relays one student message to ChatGPT and returns the teacher's reply.
 * The UI owns appending to and persisting the transcript.
 */
export async function sendStudentMessage(text: string): Promise<string> {
  return await sendToChatGPT(text);
}

/**
 * Ends the active lesson:
 *   1. Read the active session.
 *   2. Send the end-lesson report request.
 *   3. Parse and validate the JSON report.
 *   4. Save the LessonSummary to the student's history.
 *   5. Clear session + transcript from chrome.storage.session.
 *   6. Return the completed LessonSummary.
 *
 * Throws LessonParseError if the report cannot be parsed — the session stays active
 * so the user can retry or end without saving.
 */
export async function endLesson(): Promise<LessonSummary> {
  const session = await readSession<ActiveSession | null>(SESSION_KEY, null);
  if (!session) throw new Error('No active session');

  // maxLessonsPerStudent is device-level; all other prefs are per-student
  const settings = await getSettingsOrDefaults();

  const raw = await sendToChatGPT(buildEndLessonPrompt());

  const report = extractLessonReport(raw);
  if (!report) {
    throw new LessonParseError();
  }

  const summary = toLessonSummary(report, session.sessionType);
  await studentRepo.appendLesson(session.studentId, summary, settings.maxLessonsPerStudent);

  if (session.planDayNumber !== undefined) {
    const { markDayComplete } = await import('./planController');
    await markDayComplete(session.studentId, session.planDayNumber, summary.overallScore);
  }

  // Clear session state
  await removeSession(SESSION_KEY);
  await removeSession(TRANSCRIPT_KEY);

  return summary;
}

/** Reads the current active session from session storage (or null if none). */
export async function getActiveSession(): Promise<ActiveSession | null> {
  return readSession<ActiveSession | null>(SESSION_KEY, null);
}

/** Reads the current transcript from session storage (or [] if none). */
export async function getTranscript(): Promise<ChatMessage[]> {
  return readSession<ChatMessage[]>(TRANSCRIPT_KEY, []);
}

/** Writes an updated transcript to session storage. */
export async function saveTranscript(transcript: ChatMessage[]): Promise<void> {
  await writeSession(TRANSCRIPT_KEY, transcript);
}

/**
 * Clears the active session and transcript without generating a report.
 * Used when the user chooses "End lesson now" from the interrupted-session banner.
 */
export async function abandonLesson(): Promise<void> {
  await removeSession(SESSION_KEY);
  await removeSession(TRANSCRIPT_KEY);
}
