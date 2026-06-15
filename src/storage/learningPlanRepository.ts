/**
 * Repository for LearningPlan — one plan per student, stored gzip-compressed
 * under chrome.storage.local key: plan_<studentId>.
 */
import type { LearningPlan, DayPlan } from '../types/index';
import { compress, decompress } from './compression';

function planKey(studentId: string): string { return `plan_${studentId}`; }

export async function getPlan(studentId: string): Promise<LearningPlan | null> {
  const result = await chrome.storage.local.get(planKey(studentId));
  const stored = result[planKey(studentId)] as string | undefined;
  if (!stored) return null;
  try {
    const json = await decompress(stored);
    return JSON.parse(json) as LearningPlan;
  } catch {
    return null;
  }
}

export async function savePlan(plan: LearningPlan): Promise<void> {
  const json = JSON.stringify(plan);
  const compressed = await compress(json);
  await chrome.storage.local.set({ [planKey(plan.studentId)]: compressed });
}

export async function updateDay(
  studentId: string,
  dayNumber: number,
  patch: Partial<Pick<DayPlan, 'status' | 'score' | 'doneAt'>>
): Promise<void> {
  const plan = await getPlan(studentId);
  if (!plan) return;
  const idx = plan.days.findIndex(d => d.d === dayNumber);
  if (idx === -1) return;
  plan.days[idx] = { ...plan.days[idx], ...patch };
  await savePlan(plan);
}

export async function deletePlan(studentId: string): Promise<void> {
  await chrome.storage.local.remove(planKey(studentId));
}
