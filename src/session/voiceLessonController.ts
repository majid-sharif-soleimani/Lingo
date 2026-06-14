/**
 * Voice Lesson Controller — orchestrates the lifecycle of a Voice Conversation session.
 *
 * Flow:
 *   1. Build the voice system prompt (teacher persona + classroom boundary rules).
 *   2. Open a fresh ChatGPT conversation and inject the prompt as a text message.
 *   3. Write ActiveSession to storage (triggers UI → VoiceView overlay).
 *   4. Activate ChatGPT's native voice mode.
 *
 * Ending:
 *   1. Deactivate voice mode.
 *   2. Wait for text input to restore.
 *   3. Inject the end-lesson report request (same JSON schema as text lessons).
 *   4. Parse, save, and clear session.
 */

import { v4 as uuidv4 } from 'uuid';
import type { ActiveSession, LessonSummary } from '../types/index';
import { getSettingsOrDefaults } from '../storage/settingsRepository';
import * as studentRepo from '../storage/studentRepository';
import { readSession, writeSession, removeSession } from '../storage/storageHelper';
import { buildVoiceSystemPrompt } from '../prompts/voicePromptBuilder';
import { buildEndLessonPrompt } from '../prompts/promptBuilder';
import { extractLessonReport, toLessonSummary } from '../parser/lessonParser';
import { sendToChatGPT, RelayError } from '../content/chatRelay';
import {
  startNewConversation,
  isChatGPTReady,
  activateVoiceMode,
  deactivateVoiceMode,
  waitForStableMessages,
} from '../content/domIntegration';

export { RelayError };

export class LessonParseError extends Error {
  constructor(message = 'Failed to parse lesson report') {
    super(message);
    this.name = 'LessonParseError';
  }
}

const SESSION_KEY = 'activeSession';
const TRANSCRIPT_KEY = 'transcript';

/**
 * Starts a Voice Conversation session:
 *   1. Validates readiness.
 *   2. Injects the voice system prompt and waits for ChatGPT's acknowledgement.
 *   3. Writes session to storage (UI switches to VoiceView).
 *   4. Activates ChatGPT's voice mode.
 */
export async function startVoiceLesson(studentId: string): Promise<void> {
  console.log('[voiceLessonController] startVoiceLesson — studentId:', studentId);

  const student = await studentRepo.getById(studentId);
  if (!student) throw new Error(`Student not found: ${studentId}`);
  console.log('[voiceLessonController] student:', student.name, `(${student.sourceLanguage}→${student.targetLanguage})`);

  const ready = isChatGPTReady();
  console.log('[voiceLessonController] isChatGPTReady:', ready);
  if (!ready) {
    throw new RelayError('not-ready', 'ChatGPT composer input not found');
  }

  const recentLessons = await studentRepo.getLastNLessons(studentId, student.memoryDepth);
  console.log('[voiceLessonController] recentLessons count:', recentLessons.length);

  const prompt = buildVoiceSystemPrompt(student, recentLessons);
  console.log('[voiceLessonController] prompt built, length:', prompt.length, 'chars');

  console.log('[voiceLessonController] starting new conversation…');
  const conversationUrl = await startNewConversation();
  console.log('[voiceLessonController] conversationUrl after nav:', conversationUrl);

  const session: ActiveSession = {
    studentId,
    sessionType: 'Voice Conversation',
    startedAt: new Date().toISOString(),
    conversationUrl,
    voiceModeActivated: false,
  };
  await writeSession(SESSION_KEY, session);
  await writeSession(TRANSCRIPT_KEY, []);
  console.log('[voiceLessonController] session written, sending voice prompt…');

  try {
    await sendToChatGPT(prompt);
    console.log('[voiceLessonController] voice prompt acknowledged by ChatGPT');
  } catch (err) {
    console.error('[voiceLessonController] sendToChatGPT (voice prompt) FAILED:', err);
    await removeSession(SESSION_KEY);
    await removeSession(TRANSCRIPT_KEY);
    throw err;
  }

  const actualUrl = location.href;
  console.log('[voiceLessonController] activating voice mode…');
  const activated = await activateVoiceMode();
  console.log('[voiceLessonController] voiceModeActivated:', activated);

  await writeSession(SESSION_KEY, {
    ...session,
    conversationUrl: actualUrl,
    voiceModeActivated: activated,
  });
  console.log('[voiceLessonController] startVoiceLesson complete');
}

/**
 * Ends a Voice Conversation session:
 *   1. Deactivates voice mode.
 *   2. Waits for ChatGPT's text input to be ready again.
 *   3. Injects the end-lesson report request and parses the response.
 *   4. Saves the lesson summary and clears the session.
 *
 * Throws LessonParseError if the report JSON cannot be parsed.
 */
export async function endVoiceLesson(): Promise<LessonSummary> {
  await deactivateVoiceMode();

  // Wait up to 6 seconds for the text input to restore after voice mode exits
  await waitForTextInput(6000);

  // Wait for ChatGPT to finish adding its post-voice transcript to the DOM.
  // Without this, waitForChatGPTResponse counts the transcript as the "new" assistant
  // message and resolves with transcript text instead of the JSON report.
  await waitForStableMessages();

  const session = await readSession<ActiveSession | null>(SESSION_KEY, null);
  if (!session) throw new Error('No active session');

  const settings = await getSettingsOrDefaults();

  const raw = await sendToChatGPT(buildEndLessonPrompt());
  const report = extractLessonReport(raw);
  if (!report) throw new LessonParseError();

  const summary = toLessonSummary(report, session.sessionType);
  await studentRepo.appendLesson(session.studentId, summary, settings.maxLessonsPerStudent);

  await removeSession(SESSION_KEY);
  await removeSession(TRANSCRIPT_KEY);

  return summary;
}

/**
 * Abandons a voice session without generating a report.
 */
export async function abandonVoiceLesson(): Promise<void> {
  await deactivateVoiceMode();
  await removeSession(SESSION_KEY);
  await removeSession(TRANSCRIPT_KEY);
}

/** Polls until ChatGPT's text input is ready or the timeout elapses. */
async function waitForTextInput(timeoutMs: number): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (isChatGPTReady()) return;
    await new Promise<void>((r) => setTimeout(r, 200));
  }
}
