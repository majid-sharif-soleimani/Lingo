/**
 * Parses and validates the JSON array returned by ChatGPT for learning plan generation.
 */
import { RawPlanArraySchema } from '../schemas/planSchema';
import type { DayPlan } from '../types/index';

export function parsePlan(raw: string): DayPlan[] | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    const match = raw.match(/\[[\s\S]*\]/);
    if (!match) { console.error('[planParser] No JSON array found'); return null; }
    try { parsed = JSON.parse(match[0]); } catch { console.error('[planParser] JSON parse failed'); return null; }
  }
  const result = RawPlanArraySchema.safeParse(parsed);
  if (!result.success) { console.error('[planParser] Zod validation failed', result.error.issues); return null; }
  return result.data.map(entry => ({ ...entry, status: 'pending' as const }));
}
