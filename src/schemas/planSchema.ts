/**
 * Zod schemas for validating the raw ChatGPT output for learning plan days.
 */
import { z } from 'zod';

const PLAN_DAY_TYPES = ['Grammar', 'Vocabulary', 'Reading', 'Writing', 'Speaking', 'Review'] as const;

export const RawDayPlanSchema = z.object({
  d: z.number().int().min(1),
  t: z.enum(PLAN_DAY_TYPES),
  topic: z.string().min(1),
  sub: z.array(z.string()).min(1).max(6),
  min: z.number().int().min(5).max(120),
});

export const RawPlanArraySchema = z.array(RawDayPlanSchema).min(1);
