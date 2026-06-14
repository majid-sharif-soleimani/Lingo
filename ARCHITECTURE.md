# Code Architecture

## Overview

AI Language Teacher is a Chrome Manifest V3 extension. It runs entirely as a content script on ChatGPT pages — there is no backend server. All state lives in `chrome.storage.local` and all AI responses come from the user's own ChatGPT session.

```
src/
├── background/        Chrome service worker (minimal — just keeps the extension alive)
├── content/           Content script: DOM interaction with ChatGPT
├── i18n/              Internationalisation (10 languages)
├── parser/            Extracts and validates lesson reports from ChatGPT's raw text
├── prompts/           Builds the system prompts injected into ChatGPT
├── schemas/           Zod schemas for lesson report validation
├── session/           Lesson lifecycle controllers
├── storage/           chrome.storage.local wrappers and repositories
├── types/             Shared TypeScript interfaces
├── ui/                React components
└── voice/             Web Speech API (TTS and STT)
```

---

## Entry point — `src/content/index.ts`

Runs at `document_idle` on every ChatGPT page. Creates a `<div>` host element, attaches a **Shadow DOM** to it, and mounts the React `Panel` component inside the shadow root.

Shadow DOM is essential: it fully isolates the extension's styles from ChatGPT's global CSS in both directions.

A `MutationObserver` on `document.body` re-mounts the panel if ChatGPT's SPA navigation removes the host element from the DOM.

---

## UI layer — `src/ui/`

### `Panel.tsx`
The root React component. Manages all top-level state and switches between four mutually exclusive views:

| State | View |
|---|---|
| No active session, collapsed | Launcher button (🎓, 56 px circle, top-right) |
| No active session, expanded | Control panel card (360 px, 4 tabs) |
| Active text lesson | `ChatView` full-screen overlay |
| Active voice lesson | `VoiceView` full-screen overlay |

Panel owns the persisted UI language (`uiLanguage` in storage). When a lesson starts it switches the language in-memory only (to the student's source language); when the lesson ends it restores the user's saved preference.

State changes in `chrome.storage.local` are observed via `chrome.storage.onChanged` so the panel reacts to changes made by the session controllers.

### Tabs

| File | Purpose |
|---|---|
| `tabs/LessonTab.tsx` | Student picker + session type picker + Start button |
| `tabs/StudentsTab.tsx` | Create / edit / delete student profiles |
| `tabs/HistoryTab.tsx` | Per-student lesson history with scores |
| `tabs/DataTab.tsx` | Storage usage, export/import backup, clear student progress, settings |

### Components

| File | Purpose |
|---|---|
| `components/ChatView.tsx` | Full-screen text lesson client: message list, composer, mic, TTS controls |
| `components/VoiceView.tsx` | Full-screen voice lesson overlay: status, timer, End Session |
| `components/MessageBubble.tsx` | Single chat message with per-line RTL/LTR detection |
| `components/MarkdownText.tsx` | Lightweight inline markdown renderer (bold, italic, headings, lists) |
| `components/Tab.tsx` | Reusable tab bar |
| `components/TagInput.tsx` | Multi-value tag editor (goals, strengths, weaknesses) |
| `components/ScoreBar.tsx` | Animated score bar for lesson reports |

### `styles.ts`
All CSS-in-JS style objects in one file. No external CSS, no Tailwind. All styles work inside Shadow DOM.

---

## Session controllers — `src/session/`

### `lessonController.ts` (text lessons)

Orchestrates the full lesson lifecycle for Grammar, Reading, and Writing sessions:

1. Validate ChatGPT is ready.
2. Call `startNewConversation()` to open a fresh chat.
3. Write `ActiveSession` to storage (Panel switches to `ChatView`).
4. Send the teacher system prompt via `sendToChatGPT()` and display the reply.
5. On each student turn: call `sendToChatGPT()` and append to transcript.
6. On `endLesson()`: send the end-lesson prompt, parse the JSON report, save it to the student's `lessonHistory`, clear session storage.

### `voiceLessonController.ts` (Voice Conversation)

Same lifecycle but uses ChatGPT's native voice mode:

1. Send voice system prompt via text (teacher introduces itself).
2. Write `ActiveSession` to storage (Panel switches to `VoiceView`).
3. Activate ChatGPT's voice mode button.
4. On `endVoiceLesson()`: deactivate voice mode → wait for text input to restore → wait for ChatGPT's post-voice transcript to settle → send end-lesson JSON prompt → parse and save report.

---

## ChatGPT communication — `src/content/`

### `chatRelay.ts`
The single round-trip primitive: `sendToChatGPT(text) → Promise<string>`. All lesson controllers go through this.

### `domIntegration.ts`
The **only** file that touches ChatGPT's own DOM. All selectors are fragile against ChatGPT UI updates and carry `// IMPORTANT:` comments.

Key functions:
- `isChatGPTReady()` — checks for the ProseMirror composer (`div#prompt-textarea`)
- `injectAndSendMessage(text)` — focuses the composer, inserts text via `document.execCommand('insertText')` (ProseMirror-compatible), waits for the send button to appear, clicks it
- `startNewConversation()` — clicks the "New chat" button and polls until the URL changes
- `activateVoiceMode()` / `deactivateVoiceMode()` — click ChatGPT's voice mode buttons
- `waitForStableMessages()` — polls until the assistant message count in the DOM is stable (used after ending voice mode to avoid reading the post-voice transcript as the lesson report)

### `responseWatcher.ts`
Detects when ChatGPT finishes generating a response using a belt-and-suspenders approach:
- `MutationObserver` on the conversation container
- 500 ms polling interval as backup
- 2 500 ms settle delay after the "Stop generating" button disappears (guards against mid-stream pauses)
- Expands any "Show more" collapsed content before reading, so truncated long responses (e.g. JSON lesson reports) are read in full
- 90 s timeout with detailed diagnostic logging on failure

---

## Prompts — `src/prompts/`

### `promptBuilder.ts`
Builds the teacher system prompt for text lessons. Composed of 8 blocks joined with `---` separators:

1. Teacher role + language rule (always respond in source language)
2. Source language literacy (short spoken phrases if student can't read/write)
3. Target language literacy (spoken-only if student can't read/write target)
4. Age-based content adaptation (4 age brackets)
5. Student profile (level, goals, strengths, weaknesses, topics learned)
6. Lesson history memory (last N lessons, most recent first)
7. Session type instructions (structured templates for Grammar / Reading / Writing)
8. Strict out-of-scope boundary rules

Also exports `buildEndLessonPrompt()` — the exact JSON schema the teacher must fill in at lesson end.

### `voicePromptBuilder.ts`
Same structure but adapted for spoken interaction:
- Echo what the student said
- Correct errors
- Continue the lesson naturally
- Vocabulary help on request

---

## Storage — `src/storage/`

### `storageHelper.ts`
Low-level wrappers around `chrome.storage.local`. All functions return Promises. Used by all other storage modules.

Key exports: `read<T>()`, `write()`, `readSession<T>()`, `writeSession()`, `removeSession()`

(Note: despite the name `readSession`/`writeSession`, all storage uses `chrome.storage.local` — `chrome.storage.session` is unavailable in content scripts.)

### `studentRepository.ts`
CRUD for `StudentProfile` objects, stored as `Record<string, StudentProfile>` under key `'students'`. Also owns `lessonHistory` (embedded in each profile).

Key exports: `getAll()`, `getById()`, `create()`, `update()`, `deleteStudent()`, `appendLesson()`, `clearProgress()`, `getLastNLessons()`

### `settingsRepository.ts`
Reads/writes `AppSettings` (device-level config, currently just `maxLessonsPerStudent`).

### `dataPortRepository.ts`
Export (`exportAll()` → JSON string) and import (`importAll()` → merge into storage). Used by `DataTab`.

---

## Data model — `src/types/index.ts`

| Type | Description |
|---|---|
| `StudentProfile` | All per-student config and embedded `lessonHistory` |
| `LessonSummary` | End-of-lesson report: scores, topics, homework, observations |
| `ActiveSession` | In-progress lesson state: studentId, sessionType, startedAt, conversationUrl |
| `ChatMessage` | Single message in the chat transcript |
| `AppSettings` | Device-level settings (maxLessonsPerStudent) |
| `SessionType` | `'Voice Conversation' \| 'Grammar Lesson' \| 'Reading Comprehension' \| 'Writing Practice'` |

---

## Internationalisation — `src/i18n/`

`index.ts` exports `t(key)` which looks up the current locale's string table (set once via `setLanguage()`). Falls back to English for any missing key.

Each locale file (`strings/en.ts`, `strings/fa.ts`, …) must implement the full `UIStrings` interface defined in `en.ts`.

RTL languages (Persian, Arabic) are detected via `isRTL()` which drives `dir="rtl"` throughout the UI.

---

## Voice — `src/voice/`

| File | Purpose |
|---|---|
| `speechOutput.ts` | TTS via `window.speechSynthesis` |
| `speechInput.ts` | STT via `window.SpeechRecognition` (Web Speech API) |

Both run in the ChatGPT page context, so Chrome attributes microphone permission to `chatgpt.com`. TTS is used only for text lessons (not Voice Conversation, which uses ChatGPT's own audio).

---

## Parser — `src/parser/lessonParser.ts`

`extractLessonReport(rawText)`:
1. Tries `JSON.parse(rawText)` directly.
2. Falls back to regex `\{[\s\S]*\}` to extract JSON from surrounding text.
3. Validates with `LessonReportSchema.safeParse()` (Zod).

`toLessonSummary(report, sessionType)` converts the validated object to a `LessonSummary` with a UUID and ISO date.

---

## State flow

```
User clicks "Start Lesson"
  → Panel.handleLessonStart()
    → lessonController.startLesson()  (or voiceLessonController)
      → chrome.storage.local.set({ activeSession })
        → chrome.storage.onChanged fires in Panel
          → Panel switches to ChatView (or VoiceView)
```

```
User sends a message in ChatView
  → ChatView.handleSend()
    → lessonController.sendMessage()
      → chatRelay.sendToChatGPT()
        → domIntegration.injectAndSendMessage()
        → responseWatcher.waitForChatGPTResponse()
      → chrome.storage.local.set({ transcript })
        → Panel.setTranscript() via onChanged
```

```
User clicks "End Lesson"
  → ChatView.handleEndLesson()
    → lessonController.endLesson()
      → sendToChatGPT(buildEndLessonPrompt())
      → extractLessonReport(raw)
      → studentRepo.appendLesson()
      → chrome.storage.local.remove([activeSession, transcript])
        → Panel.setActiveSession(null) via onChanged
          → Panel switches back to control panel
```
