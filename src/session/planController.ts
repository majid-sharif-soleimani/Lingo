/**
 * Plan Controller — orchestrates learning plan generation, loading, and progress tracking.
 */
import { v4 as uuidv4 } from 'uuid';
import type { StudentProfile, LearningPlan, LearningPlanConfig } from '../types/index';
import { buildPlanPrompt } from '../prompts/planPromptBuilder';
import { parsePlan } from '../parser/planParser';
import { getPlan, savePlan, updateDay, deletePlan } from '../storage/learningPlanRepository';
import { sendToChatGPT } from '../content/chatRelay';
import { startNewConversation } from '../content/domIntegration';

export { getPlan as loadPlan };

export class PlanParseError extends Error {
  constructor() { super('Failed to parse learning plan'); this.name = 'PlanParseError'; }
}

export function computeConfigHash(student: StudentProfile, config: LearningPlanConfig): string {
  const parts = [
    student.age, student.languageLevel, student.sourceLanguage, student.targetLanguage,
    student.canReadWriteTargetLanguage,
    ...student.goals, ...student.strengths, ...student.weaknesses,
    config.targetLevel, config.durationDays, config.frequency,
  ];
  const str = parts.join('|');
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = ((h << 5) + h) ^ str.charCodeAt(i);
  return (h >>> 0).toString(16);
}

export async function generatePlan(student: StudentProfile, config: LearningPlanConfig): Promise<LearningPlan> {
  await startNewConversation();
  const raw = await sendToChatGPT(buildPlanPrompt(student, config));
  const days = parsePlan(raw);
  if (!days) throw new PlanParseError();
  const plan: LearningPlan = {
    id: uuidv4(),
    studentId: student.id,
    generatedAt: new Date().toISOString(),
    config,
    configHash: computeConfigHash(student, config),
    days,
  };
  await savePlan(plan);
  return plan;
}

export async function markDayComplete(studentId: string, dayNumber: number, score: number): Promise<void> {
  await updateDay(studentId, dayNumber, { status: 'completed', score, doneAt: new Date().toISOString() });
}

export async function removePlan(studentId: string): Promise<void> {
  await deletePlan(studentId);
}
