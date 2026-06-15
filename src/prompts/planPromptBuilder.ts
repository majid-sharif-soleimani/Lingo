/**
 * Builds the ChatGPT prompt for generating a structured learning plan.
 */
import type { StudentProfile, LearningPlanConfig } from '../types/index';

export function buildPlanPrompt(student: StudentProfile, config: LearningPlanConfig): string {
  const ratioMap = { daily: 1, weekdays: 5/7, alternate: 0.5, weekly: 1/7 };
  const totalPracticeDays = Math.round(config.durationDays * ratioMap[config.frequency]);

  const canRead = student.canReadWriteTargetLanguage;
  const allowedTypes = ['Grammar', 'Vocabulary', 'Speaking', canRead ? 'Reading' : null, canRead ? 'Writing' : null]
    .filter(Boolean).join(', ');

  return `You are a professional language curriculum designer.
Create a structured learning plan for this student:

Student native language: ${student.sourceLanguage}
Target language: ${student.targetLanguage}
Current level: ${student.languageLevel}
Target level: ${config.targetLevel}
Age: ${student.age}
Goals: ${student.goals.join(', ') || 'General proficiency'}
Strengths: ${student.strengths.join(', ') || 'Not specified'}
Weaknesses: ${student.weaknesses.join(', ') || 'Not specified'}
Can read/write in target language: ${canRead ? 'yes' : 'no'}

Total PRACTICE days: ${totalPracticeDays} (this is NOT calendar days — only days the student actually practises)
Session length per day: ${config.sessionMinutes} minutes
Allowed day types: ${allowedTypes}, Review

Rules:
1. Output EXACTLY ${totalPracticeDays} day entries, numbered d=1 to d=${totalPracticeDays}.
2. Every 7th practice day (d=7, 14, 21, ...) MUST be type "Review".
3. Review days must specify which topics from the previous 7 days they review (in the "sub" array).
4. Weight topics toward the student's weaknesses and goals.
5. Progress logically from simpler to more complex topics over the full plan.
6. Each day's "sub" array should contain 2-4 specific learning objectives.
7. Set "min" to ${config.sessionMinutes} for all days.
${!canRead ? '8. Do NOT include Reading or Writing days — this student cannot yet read/write in the target language.' : ''}

Return ONLY a valid JSON array. No markdown code fences, no explanation, no extra text.
Example of ONE entry: {"d":1,"t":"Grammar","topic":"Present Simple","sub":["affirmative sentences","negative sentences","yes/no questions","short answers"],"min":${config.sessionMinutes}}

Output the full array of ${totalPracticeDays} entries now:`;
}
