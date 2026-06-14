# Learning Plan Feature — Design & Implementation Plan

## Overview

This document specifies three interconnected features:

1. **Learning Plan Generator** — ChatGPT creates a day-by-day curriculum tailored to the student's profile and learning goals (duration, frequency, target level). Stored compressed in `chrome.storage.local`.
2. **Plan-Driven Lesson Selection** — The student selects a specific day/topic from their plan to practice instead of choosing a generic session type. The app tracks per-topic completion and scores.
3. **Practice Material Generator** — Generate standalone practice materials (vocabulary quizzes, grammar exercises, reading passages, writing prompts) without starting an AI session. Downloadable as PDF.

---

## 1. Data Model

### 1.1 New types (add to `src/types/index.ts`)

```typescript
/** Frequency at which the student practises. */
export type PracticeFrequency =
  | 'daily'           // 7 days/week
  | 'weekdays'        // Mon–Fri
  | 'alternate'       // every other day
  | 'weekly';         // once a week (weekend only etc.)

/** Type of content for a single plan day. */
export type PlanDayType =
  | 'Grammar'
  | 'Vocabulary'
  | 'Reading'
  | 'Writing'
  | 'Speaking'
  | 'Review';         // recap of recent topics

/** Completion status of a single plan day. */
export type DayStatus = 'pending' | 'completed' | 'skipped';

/** Configuration inputs for generating a learning plan. */
export interface LearningPlanConfig {
  targetLevel: LanguageLevel;           // desired end level (e.g. 'B2' / 'Intermediate')
  durationDays: number;                 // total calendar days (e.g. 60)
  frequency: PracticeFrequency;         // how often the student practises
  startDate: string;                    // ISO date string (YYYY-MM-DD)
}

/**
 * A single day in the learning plan.
 * Field names are intentionally short to keep the compressed payload small.
 */
export interface DayPlan {
  d: number;          // day number (1-based)
  t: PlanDayType;     // content type
  topic: string;      // main topic (e.g. "Present Simple")
  sub: string[];      // sub-topics or objectives (2-4 items)
  min: number;        // estimated session length in minutes
  status: DayStatus;
  score?: number;     // 0–100, set when completed via a lesson session
  doneAt?: string;    // ISO timestamp
}

/**
 * A complete learning plan for one student.
 * Stored under chrome.storage.local key: `plan_<studentId>`
 * The `days` array is stored gzip-compressed (see learningPlanRepository).
 */
export interface LearningPlan {
  id: string;
  studentId: string;
  generatedAt: string;        // ISO timestamp
  config: LearningPlanConfig;
  configHash: string;         // hash of the StudentProfile fields that affect the plan
  days: DayPlan[];            // full array in memory; compressed on write
}
```

### 1.2 `configHash` computation

The hash is a deterministic string derived from the StudentProfile fields that would change the curriculum if they changed:

```
age | languageLevel | sourceLanguage | targetLanguage |
canReadWriteTargetLanguage | goals.join(',') |
strengths.join(',') | weaknesses.join(',') |
plan.config.targetLevel | plan.config.durationDays | plan.config.frequency
```

Use a simple djb2 hash (no crypto dependency) stored as a hex string. When the student profile is saved or when plan config is edited, recompute the hash. If it differs from the stored plan's `configHash`, show a stale-plan warning.

---

## 2. Storage Strategy

### 2.1 Compression

`chrome.storage.local` has a 5 MB quota. A 60-day plan with ~8 fields per day is roughly 15–25 KB as JSON. With gzip (via the `CompressionStream` API available in Chrome 80+, required version is 114+) this compresses to ~3–5 KB — a 70–80% reduction.

Storage key: `plan_<studentId>` (one per student).

### 2.2 `src/storage/learningPlanRepository.ts` (new file)

```typescript
// Public API

/** Reads and decompresses the plan for a student. Returns null if not found. */
export async function getPlan(studentId: string): Promise<LearningPlan | null>

/** Compresses and writes the plan. */
export async function savePlan(plan: LearningPlan): Promise<void>

/** Updates a single day's status/score without decompressing the whole plan. */
export async function updateDay(
  studentId: string,
  dayNumber: number,
  patch: Partial<Pick<DayPlan, 'status' | 'score' | 'doneAt'>>
): Promise<void>

/** Deletes the plan for a student (e.g. after clearProgress). */
export async function deletePlan(studentId: string): Promise<void>
```

### 2.3 Compression helpers (`src/storage/compression.ts`, new file)

```typescript
export async function compress(json: string): Promise<Uint8Array>   // gzip
export async function decompress(data: Uint8Array): Promise<string> // gunzip
```

Use `CompressionStream('gzip')` and `DecompressionStream('gzip')`. Store the compressed bytes as a Base64 string inside `chrome.storage.local` (which only accepts JSON-serialisable values).

---

## 3. Plan Generation

### 3.1 Prompt — `src/prompts/planPromptBuilder.ts` (new file)

The prompt instructs ChatGPT to return **only** a JSON array of day plans, no markdown, no explanation.

```
You are a professional language curriculum designer.
Create a learning plan for the following student:
  Native language: {sourceLanguage}
  Target language: {targetLanguage}
  Current level: {languageLevel}
  Target level: {targetLevel}
  Age: {age}
  Goals: {goals}
  Known strengths: {strengths}
  Known weaknesses: {weaknesses}
  Can read/write in target language: {yes|no}
  Total practice days: {totalPracticeDays}  (not calendar days — only the days they actually practise)
  Session length: approximately {estimatedMinutes} minutes per day

Distribute topics across all {totalPracticeDays} days.
Every 7th practice day must be a "Review" day covering the previous week's topics.
Include a balance of: Grammar, Vocabulary, Reading (if literate), Writing (if literate), Speaking.
Weight topics towards the student's weaknesses and goals.

Return ONLY a valid JSON array with NO markdown, NO explanation:
[
  { "d": 1, "t": "Grammar", "topic": "Present Simple", "sub": ["affirmative", "negative", "yes/no questions"], "min": 30 },
  ...
]
```

`totalPracticeDays` is computed from `durationDays` × frequency ratio (e.g. daily = 1.0, weekdays = 5/7, alternate = 0.5).
`estimatedMinutes` defaults to 30 and can be set in the plan config.

### 3.2 Parser — `src/parser/planParser.ts` (new file)

1. Try `JSON.parse(rawText)` directly.
2. Fallback: extract first `[…]` array via regex.
3. Validate with a Zod schema (`PlanDaySchema`, `PlanArraySchema`).
4. Fill in `status: 'pending'` and omit `score`/`doneAt` on each entry.

### 3.3 Controller — `src/session/planController.ts` (new file)

```typescript
/**
 * Generates a plan by sending the prompt to ChatGPT and parsing the response.
 * Does NOT start a lesson session — uses chatRelay directly.
 * The plan generation prompt is sent in a NEW conversation (startNewConversation)
 * to avoid contaminating the current chat.
 * Returns the parsed LearningPlan, or throws PlanParseError on failure.
 */
export async function generatePlan(
  student: StudentProfile,
  config: LearningPlanConfig
): Promise<LearningPlan>

/** Returns the plan from cache, or null. */
export async function loadPlan(studentId: string): Promise<LearningPlan | null>

/** Marks a day complete with the lesson score. Called from lessonController after appendLesson(). */
export async function markDayComplete(
  studentId: string,
  dayNumber: number,
  score: number
): Promise<void>

/** Computes the config hash for a student + plan config. */
export function computeConfigHash(student: StudentProfile, config: LearningPlanConfig): string
```

---

## 4. Plan-Driven Lesson Selection

### 4.1 Linking a lesson to a plan day

`ActiveSession` gets a new optional field:

```typescript
planDayNumber?: number;   // set when the lesson was started from a plan day
```

After `lessonController.endLesson()` calls `appendLesson()`, it also calls `planController.markDayComplete()` if `planDayNumber` is set. This writes `status: 'completed'` and the `overallScore` to that day.

### 4.2 Session type mapping

When the user starts a plan day, the session type is mapped automatically:

| `PlanDayType` | `SessionType` used |
|---|---|
| Grammar | Grammar Lesson |
| Vocabulary | Grammar Lesson (vocab-focused prompt) |
| Reading | Reading Comprehension |
| Writing | Writing Practice |
| Speaking | Voice Conversation |
| Review | Grammar Lesson (review-focused prompt) |

The `planDayNumber` and `planDayType` are passed through `ActiveSession` so `promptBuilder` can tailor the lesson prompt to the specific day's `topic` and `sub` items.

### 4.3 Prompt adaptation

In `buildTeacherSystemPrompt()`, if a `planDay` is provided, replace the generic session-type block with:

```
TODAY'S PLAN: Day {d} — {type}: {topic}
Objectives for this session:
- {sub[0]}
- {sub[1]}
...
Focus this entire lesson on the above objectives. Do not deviate.
```

---

## 5. UI

### 5.1 New tab: "Plan"

Add a **Plan** tab to the panel (5th tab: Lesson | Students | Plan | History | Data).

### 5.2 `src/ui/tabs/PlanTab.tsx` (new file)

**States:**

| Condition | View shown |
|---|---|
| No plan exists | "Generate Plan" wizard |
| Plan exists, config hash matches | Plan viewer |
| Plan exists, config hash mismatch | Stale-plan warning + Regenerate button |
| Generating | Progress indicator (ChatGPT is thinking…) |

**Generate Plan wizard** (inline, not a separate screen):

1. Target level selector (Beginner → Advanced)
2. Duration input (number of days, e.g. 60)
3. Frequency selector (daily / weekdays / alternate / weekly)
4. Session length in minutes (default 30)
5. Start date (defaults to today)
6. **Generate Plan** button → calls `planController.generatePlan()`

**Plan viewer:**

- Overall progress bar: `completedDays / totalPracticeDays × 100%`
- Skill breakdown bars (Grammar / Vocabulary / Reading / Writing / Speaking) — based on completed days per type and average scores
- Day list (scrollable):
  - Day number, date (computed from startDate + frequency), type badge, topic
  - Status icon: ✓ (completed, green), → (today/next, primary colour), ○ (pending, grey), — (skipped)
  - Score shown for completed days
  - **Start Lesson** button on the current/next pending day (one at a time)
  - Completed days are collapsed; tap to expand and see score details
- **Regenerate Plan** button at the bottom (with confirm: "This will reset all progress")

**Stale-plan warning banner** (shown when hash mismatch):

```
Your learning plan was generated with different settings.
Regenerating will reset all plan progress.
[Keep current plan]  [Regenerate]
```

### 5.3 Changes to `LessonTab.tsx`

When a plan exists for the selected student, show an additional option:

```
● Follow my learning plan  ← radio
○ Choose session type manually
```

When "Follow my learning plan" is selected, the session type picker is hidden and replaced with the next pending plan day preview (day number, topic). The Start button passes `planDayNumber` to `handleLessonStart`.

### 5.4 Changes to `Panel.tsx`

- Add `'plan'` to `PanelTab` type
- Add Plan tab to the tab bar
- Pass `planDayNumber` through `handleLessonStart` → `ActiveSession`

---

## 6. Settings Change Invalidation

### 6.1 Where to check

In `StudentsTab.tsx`, after `studentRepo.update()` succeeds, recompute the hash and compare to the stored plan's `configHash`. If they differ, set a React state flag that triggers a warning banner at the top of the Plan tab.

The banner is also shown reactively: when the Plan tab mounts, it loads the plan and checks the hash against the current student profile.

### 6.2 Which fields invalidate the plan

| Field changed | Invalidates? |
|---|---|
| `age` | Yes |
| `languageLevel` | Yes |
| `sourceLanguage` | Yes |
| `targetLanguage` | Yes |
| `canReadWriteTargetLanguage` | Yes |
| `goals` | Yes |
| `strengths` | Yes |
| `weaknesses` | Yes |
| `name` | No |
| `ttsEnabled` | No |
| `memoryDepth` | No |
| `defaultVoiceInputLanguage` | No |

---

## 7. Practice Material Generator

### 7.1 Purpose

Generate standalone practice materials (no live AI session, no `ActiveSession` in storage) that the student can work through offline. These are never saved to storage.

### 7.2 Material types

| Type | Description |
|---|---|
| Vocabulary Quiz | 10–15 fill-in-the-blank or multiple-choice questions on a vocabulary topic |
| Grammar Exercises | Explanation + 10 exercises (fill-in, transformation, error correction) |
| Reading Passage | Short article (200–400 words) + 5 comprehension questions + vocabulary section |
| Writing Prompt | Task description + model sentences + correction checklist |
| Review Sheet | Mixed questions covering the last N completed plan topics |

### 7.3 Location in UI

A new section at the bottom of the **Plan tab** (or as a sub-tab of Plan: "Practice Materials"). It does not require a plan to exist.

**Controls:**

1. Material type selector (dropdown or segmented control)
2. Topic / subject input (free text, e.g. "Past Simple", "Travel vocabulary")
3. Difficulty selector (uses student's `languageLevel` as default)
4. **Generate** button

### 7.4 Controller — `src/session/materialController.ts` (new file)

```typescript
/**
 * Generates a practice material by:
 *   1. Opening a new ChatGPT conversation.
 *   2. Sending the material prompt.
 *   3. Waiting for and returning the formatted response.
 * Does NOT write to chrome.storage (no session, no transcript).
 */
export async function generateMaterial(
  student: StudentProfile,
  type: MaterialType,
  topic: string,
  level: LanguageLevel
): Promise<string>   // returns raw markdown text
```

### 7.5 Prompt — `src/prompts/materialPromptBuilder.ts` (new file)

Each material type has a prompt template. All instruct ChatGPT to respond in the student's `sourceLanguage` for instructions/explanations but use `targetLanguage` for the actual content.

Example for Grammar Exercises:

```
You are a language teacher creating a printable grammar worksheet.
Student's native language: {sourceLanguage}
Target language: {targetLanguage}
Level: {level}
Topic: {topic}

Create a worksheet with this exact structure (use markdown):
## Grammar: {topic}
### Quick Reference
2-3 sentence rule summary in {sourceLanguage}.
### Exercises
10 numbered exercises. Mix: fill-in-the-blank, sentence transformation, error correction.
Put answers at the end under: ### Answer Key
Write all exercise sentences in {targetLanguage}.
Write instructions and the answer key in {sourceLanguage}.
```

### 7.6 Display

The generated material is rendered using the existing `MarkdownText` component inside a scrollable container in the Plan tab. It replaces the generation controls while visible; a **← Back** button returns to the generator form.

### 7.7 PDF Download

No PDF library dependency — use the browser's built-in print dialog:

```typescript
function downloadAsPdf(title: string, markdownHtml: string): void {
  const win = window.open('', '_blank');
  win.document.write(`
    <html><head>
      <title>${title}</title>
      <style>
        body { font-family: sans-serif; font-size: 14px; margin: 40px; line-height: 1.6; }
        h2 { color: #10a37f; }
        h3 { color: #4a5568; }
        @media print { body { margin: 20px; } }
      </style>
    </head><body>${markdownHtml}</body></html>
  `);
  win.document.close();
  win.focus();
  win.print();
  // win.close() after print dialog — browser handles this
}
```

The markdown → HTML conversion reuses the logic from `MarkdownText` but outputs HTML string instead of React elements.

---

## 8. New Files Summary

| File | Purpose |
|---|---|
| `src/types/index.ts` | Add `LearningPlan`, `LearningPlanConfig`, `DayPlan`, `PlanDayType`, `PracticeFrequency`, `DayStatus`, `MaterialType` |
| `src/storage/compression.ts` | `compress()` / `decompress()` via CompressionStream |
| `src/storage/learningPlanRepository.ts` | CRUD for `LearningPlan` with transparent compression |
| `src/prompts/planPromptBuilder.ts` | Builds the curriculum generation prompt |
| `src/prompts/materialPromptBuilder.ts` | Builds per-type practice material prompts |
| `src/parser/planParser.ts` | Parses + Zod-validates the day-plan JSON array |
| `src/schemas/planSchema.ts` | Zod schemas for `DayPlan` and `LearningPlan` |
| `src/session/planController.ts` | Orchestrates plan generation, loading, day completion |
| `src/session/materialController.ts` | Generates practice materials via ChatGPT |
| `src/ui/tabs/PlanTab.tsx` | Plan tab: wizard, viewer, progress, materials |

### Modified files

| File | Change |
|---|---|
| `src/types/index.ts` | New types (above) |
| `src/ui/Panel.tsx` | Add `'plan'` tab; pass `planDayNumber` through lesson start |
| `src/ui/tabs/LessonTab.tsx` | "Follow my plan" toggle; show next plan day |
| `src/session/lessonController.ts` | Call `markDayComplete()` on lesson end if `planDayNumber` set |
| `src/prompts/promptBuilder.ts` | Inject plan-day context into teacher prompt |
| `src/storage/studentRepository.ts` | Call `deletePlan()` from `clearProgress()` |
| `src/i18n/strings/en.ts` | New i18n keys for all plan UI strings |
| All other locale files | Add same keys (English fallback is automatic) |

---

## 9. Implementation Order

The features have dependencies — implement in this sequence:

### Phase 1 — Foundation (no UI yet)
1. Add new types to `src/types/index.ts`
2. Write `src/storage/compression.ts`
3. Write `src/storage/learningPlanRepository.ts`
4. Write `src/schemas/planSchema.ts`
5. Write `src/parser/planParser.ts`
6. Add i18n keys to all locale files

### Phase 2 — Plan generation
7. Write `src/prompts/planPromptBuilder.ts`
8. Write `src/session/planController.ts` (generatePlan + loadPlan + computeConfigHash)
9. Test generation manually via browser console

### Phase 3 — Plan UI & progress tracking
10. Write `src/ui/tabs/PlanTab.tsx` (wizard + viewer, no materials section yet)
11. Update `Panel.tsx` to add the Plan tab
12. Update `LessonTab.tsx` to add the "Follow my plan" option
13. Update `lessonController.ts` to call `markDayComplete()` on lesson end
14. Update `promptBuilder.ts` to inject plan-day context
15. Update `studentRepository.clearProgress()` to also call `deletePlan()`

### Phase 4 — Practice material generator
16. Write `src/prompts/materialPromptBuilder.ts`
17. Write `src/session/materialController.ts`
18. Add materials section to `PlanTab.tsx`
19. Implement `downloadAsPdf()` helper

### Phase 5 — Settings invalidation
20. Add hash recomputation to `StudentsTab.tsx` on save
21. Show stale-plan banner in `PlanTab.tsx`

---

## 10. Open Questions / Decisions Needed

1. **Session length input**: Should "session length in minutes" be part of the plan config wizard, or always default to 30 min? Exposing it gives flexibility but adds a form field.

2. **Vocabulary days**: Should Vocabulary days use a normal Grammar Lesson session (with the topic injected) or get their own session type? Currently `SessionType` has no `'Vocabulary Lesson'` variant.

3. **Review day scope**: Should Review days cover the previous 7 practice days, or the previous calendar week? If the student skips days, the scope might differ.

4. **Plan regeneration & progress reset**: Should regenerating completely delete the old plan's progress, or try to map completed topics onto the new plan? Full reset is simpler; smart mapping is more user-friendly.

5. **Material generator placement**: Inside the Plan tab as a section, or as a standalone 6th tab? A 6th tab (Lesson | Students | Plan | Practice | History | Data) might be cleaner but 6 tabs is wide for a 360 px panel.

6. **PDF rendering**: The `window.open()` + `window.print()` approach works but is browser-dependent and can be blocked by pop-up blockers. An alternative is jsPDF (adds ~200 KB to the bundle). Decision: use the print approach first; add jsPDF if print quality is inadequate.
