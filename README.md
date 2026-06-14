# AI Language Teacher — Chrome Extension

A Chrome Extension (Manifest V3) that turns ChatGPT into a persistent language teacher with memory across lessons. The extension supports any source language (the student's native language) and any target language (the language being taught).

## How it works

The extension injects a floating panel into the ChatGPT page. When a lesson is active, the panel expands to full-screen and serves as a complete chat client — the student types or speaks, and the teacher (ChatGPT, guided by a hidden system prompt) responds. The student never interacts with ChatGPT's own UI directly.

After each lesson, the extension asks ChatGPT to generate a structured report (scores, topics, homework, observations), validates it with Zod, and stores it in `chrome.storage.local`. The next lesson picks up where the last one left off.

---

## Prerequisites

- **Node.js** 18 or newer
- **Chrome** 114 or newer (Manifest V3)
- A **ChatGPT account** (free or Plus) — the extension uses your existing session

---

## Install dependencies

```bash
npm install
```

---

## Development build (watch mode)

```bash
npm run dev
```

Output is written to the `dist/` folder and rebuilt automatically on file changes.

---

## Production build

```bash
npm run build
```

---

## Load the extension in Chrome

1. Open `chrome://extensions` in Chrome.
2. Enable **Developer Mode** (toggle in the top-right corner).
3. Click **"Load unpacked"**.
4. Select the **`dist/`** folder inside this project.
5. The extension icon (🎓) appears in your toolbar.

---

## First-time setup

1. Navigate to [chatgpt.com](https://chatgpt.com) and log in.
2. Click the 🎓 button that appears in the top-right corner of the page.
3. Go to the **Students** tab and click **Add Student** to create the first student profile.
4. You're ready to start lessons.

---

## Usage walkthrough

### Create a student

1. Click the **Students** tab.
2. Click **Add Student** and fill in:
   - Name and age
   - Language level (Beginner → Advanced)
   - Whether the student can read/write in source and target languages
   - Goals, strengths, and weaknesses (add as tags, press Enter to confirm)
3. Click **Save Student**.

### Start a lesson

1. Click the **Lesson** tab.
2. Select a student and a session type:
   - **Voice Conversation** — uses ChatGPT's native voice mode for spoken practice
   - **Grammar Lesson** — structured explanation with exercises
   - **Reading Comprehension** *(requires target-language literacy)*
   - **Writing Practice** *(requires target-language literacy)*
3. Click **Start Lesson**.
4. The panel expands to **full screen** — ChatGPT is hidden underneath.
5. Chat with the teacher by typing or using the microphone.

### During a lesson

- **Send button** or **Enter** key sends your message.
- **🎙 microphone** — starts speech recognition (recognized text fills the input for review, never auto-sent).
- **Language toggle** (next to mic) — switches the mic between your native language and the target language.
- **🔊 button** — re-speaks any teacher message.
- **🔊/🔇 toggle** — mutes/unmutes text-to-speech for teacher replies.

### End a lesson

1. Click **End Lesson** in the panel header.
2. Confirm — the extension sends a hidden report request to ChatGPT.
3. ChatGPT returns a structured JSON report; the extension validates and stores it.
4. You're returned to the launcher. The lesson report is visible in the **History** tab.

### Microphone permission

The first time you use the microphone, Chrome shows a permission prompt for `chatgpt.com`. Click **Allow**. The Web Speech API runs in the ChatGPT page context, so Chrome attributes the request to that origin.

---

## Data management (Data tab)

- **Storage usage:** shows a bar chart of `chrome.storage.local` usage (5 MB quota). A warning appears at 80%.
- **Export:** downloads a complete backup of all students and settings as a `.json` file.
- **Import:** merges a backup file — existing students are updated by ID, new students are added, settings are replaced. A confirmation prompt warns you before proceeding.
- **Clear Progress:** permanently deletes a student's lesson history and accumulated topic lists. The student profile (name, languages, level) is preserved.
- **Settings:** configure the maximum number of lessons stored per student.

---

## Supported UI languages

The UI language dropdown is in the panel header. It defaults to Persian. The panel also auto-switches to the student's native language when a lesson starts. Supported:

| Code | Language |
|------|----------|
| `fa` | Persian / Farsi (RTL) |
| `ar` | Arabic (RTL) |
| `de` | German |
| `sv` | Swedish |
| `tr` | Turkish |
| `fr` | French |
| `es` | Spanish |
| `zh` | Chinese |
| `ja` | Japanese |
| `en` | English (fallback) |

---

## Architecture overview

See [`ARCHITECTURE.md`](ARCHITECTURE.md) for a detailed description of every module and how they fit together.

---

## Known limitations

- **ChatGPT DOM selectors:** the extension interacts with ChatGPT's DOM to send messages and detect responses. If ChatGPT redesigns its UI, selectors in `src/content/domIntegration.ts` and `src/content/responseWatcher.ts` may need updating.
- **Voice quality:** text-to-speech and speech recognition quality depends on the browser's built-in speech engine and available voices. Mixed-language replies (target language + native-language explanations) are read with one voice.
- **Lesson memory:** only the structured end-of-lesson report is stored, not the full conversation. This keeps storage small and prompts concise, but means the teacher cannot recall specific exchanges from previous sessions — only topics, scores, and observations.
- **ChatGPT session required:** the student must be logged in to ChatGPT. The extension uses their existing session; no API key is needed.

---

## License

MIT
