/**
 * ChatGPT DOM Integration Layer
 *
 * Architecture note: this module is the ONLY place in the extension that touches
 * ChatGPT's own DOM. All access is funnelled through injectAndSendMessage() and
 * startNewConversation(). Everything here carries "// IMPORTANT:" comments because
 * ChatGPT updates its UI frequently and these selectors are the most fragile part of
 * the extension.
 */

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function querySelector<T extends Element>(selectors: string[]): T | null {
  for (const sel of selectors) {
    const el = document.querySelector<T>(sel);
    if (el) return el;
  }
  return null;
}

/**
 * Returns true if a ChatGPT composer input is present (user is logged in and page is ready).
 */
export function isChatGPTReady(): boolean {
  // IMPORTANT: ChatGPT now uses a ProseMirror contenteditable div with id="prompt-textarea".
  const SELECTORS = [
    'div[contenteditable="true"]#prompt-textarea',
    '#prompt-textarea',
    'textarea[name="prompt-textarea"]',
    'div[contenteditable="true"]',
  ];
  const found = querySelector(SELECTORS);
  if (!found) {
    console.warn('[domIntegration] isChatGPTReady: no composer input found. Tried:', SELECTORS);
  }
  return found !== null;
}

/**
 * Waits for the send button to appear in the DOM (it is only rendered after text is typed).
 * Returns the button element or null after the timeout.
 */
async function waitForSendButton(timeoutMs = 3000): Promise<HTMLButtonElement | null> {
  const SEND_SELECTORS = [
    'button[data-testid="send-button"]',
    'button[aria-label="Send message"]',
    'button[aria-label="Send prompt"]',
    'button[aria-label="Send"]',
  ];

  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const btn = querySelector<HTMLButtonElement>(SEND_SELECTORS);
    if (btn && !btn.disabled) return btn;
    await delay(100);
  }
  return null;
}

/**
 * Injects text into ChatGPT's ProseMirror composer and triggers sending.
 *
 * Steps:
 *   1. Find the contenteditable input.
 *   2. Focus it and inject text via execCommand (ProseMirror-compatible).
 *   3. Wait up to 3 seconds for the send button to appear (it is conditionally rendered).
 *   4. Click send, or simulate Enter as a fallback.
 */
export async function injectAndSendMessage(text: string): Promise<void> {
  // IMPORTANT: ChatGPT's composer is now a ProseMirror contenteditable div (id="prompt-textarea").
  const INPUT_SELECTORS = [
    'div[contenteditable="true"]#prompt-textarea',
    '#prompt-textarea',
    'div[contenteditable="true"]',
    'textarea[name="prompt-textarea"]',
  ];
  const input = querySelector<HTMLElement>(INPUT_SELECTORS);

  if (!input) {
    console.error('[domIntegration] injectAndSendMessage: composer input not found. Tried:', INPUT_SELECTORS);
    console.error('[domIntegration] page URL:', location.href);
    console.error('[domIntegration] contenteditable elements on page:', document.querySelectorAll('[contenteditable]').length);
    return;
  }
  console.log('[domIntegration] injectAndSendMessage: found input', input.tagName, input.id || '(no id)', 'text length:', text.length);

  // IMPORTANT: Focus the element first so the browser routes key/input events to it.
  input.focus();

  if (input instanceof HTMLTextAreaElement) {
    // Legacy textarea path (older ChatGPT versions)
    // IMPORTANT: Must use the native setter to trigger React's onChange.
    const nativeSetter = Object.getOwnPropertyDescriptor(
      window.HTMLTextAreaElement.prototype,
      'value'
    )?.set;
    if (nativeSetter) {
      nativeSetter.call(input, text);
    } else {
      input.value = text;
    }
    input.dispatchEvent(new Event('input', { bubbles: true }));
  } else {
    // IMPORTANT: ProseMirror contenteditable path (current ChatGPT UI).
    // 1. Select all existing content so inserting replaces it.
    document.execCommand('selectAll', false);
    // 2. Insert the text — ProseMirror listens to the 'insertText' input event that
    //    execCommand generates, so this correctly updates ProseMirror's internal state.
    document.execCommand('insertText', false, text);
  }

  // IMPORTANT: The send button only renders after text exists in the composer.
  // Wait up to 3 seconds for it to appear before falling back to Enter.
  await delay(300);
  const sendButton = await waitForSendButton(3000);

  if (sendButton) {
    console.log('[domIntegration] send button found, clicking');
    sendButton.click();
  } else {
    console.warn('[domIntegration] Send button not found after 3s — simulating Enter key');
    input.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', bubbles: true })
    );
    input.dispatchEvent(
      new KeyboardEvent('keyup', { key: 'Enter', code: 'Enter', bubbles: true })
    );
  }
}

/**
 * Opens a fresh ChatGPT conversation so the teacher system prompt is the very first message.
 * Returns the URL of the new conversation.
 */
export async function startNewConversation(): Promise<string> {
  // IMPORTANT: If already on the root/new-chat page there is nothing to navigate to.
  if (location.pathname === '/' || location.pathname === '') {
    return location.href;
  }

  // IMPORTANT: ChatGPT's "New chat" button selector changes frequently.
  // We try all known variants before falling back to text/label search.
  const newChatButton = querySelector<HTMLElement>([
    'button[aria-label="New chat"]',
    'a[aria-label="New chat"]',
    'button[data-testid="create-new-chat-button"]',
    'button[data-testid="new-conversation-button"]',
    'button[data-testid="compose-button"]',
    'nav a[href="/"]',
    'a[href="/"]',
  ]) || findNewChatByText();

  if (newChatButton) {
    const prevUrl = location.href;
    newChatButton.click();
    // IMPORTANT: Wait for the SPA navigation to settle. We poll until the URL changes
    // (meaning ChatGPT navigated to the new chat page) or fall back to a 2s fixed wait.
    const deadline = Date.now() + 2000;
    while (Date.now() < deadline) {
      if (location.href !== prevUrl) break;
      await delay(100);
    }
    // Extra settle time for ChatGPT's React tree to finish rendering the fresh composer.
    await delay(500);
  } else {
    console.warn('[domIntegration] startNewConversation: "New chat" button not found. Proceeding with current conversation.');
  }

  return location.href;
}

/**
 * Returns true if ChatGPT's real-time voice mode is currently active.
 * Detected by the presence of a stop/end voice button in the DOM.
 */
export function isVoiceModeActive(): boolean {
  // IMPORTANT: When voice mode is active, ChatGPT shows a stop/end button.
  // These selectors cover known variants.
  return querySelector([
    'button[aria-label="Stop Voice"]',
    'button[aria-label="End voice chat"]',
    'button[aria-label="End call"]',
    'button[aria-label="Close voice mode"]',
    'button[aria-label="Stop listening"]',
  ]) !== null;
}

/**
 * Clicks ChatGPT's "Start Voice" button to activate real-time voice mode.
 * Returns true if the button was found and clicked, false otherwise.
 */
export async function activateVoiceMode(): Promise<boolean> {
  // IMPORTANT: The voice button is in the composer trailing area.
  // In current ChatGPT UI it has aria-label="Start Voice".
  const btn = querySelector<HTMLButtonElement>([
    'button[aria-label="Start Voice"]',
    'button[aria-label="Use voice"]',
    'button[aria-label="Voice mode"]',
  ]);

  if (!btn) {
    console.warn('[domIntegration] activateVoiceMode: voice button not found');
    return false;
  }

  btn.click();
  // Wait for voice mode UI to initialise
  await delay(1500);
  return true;
}

/**
 * Stops ChatGPT's voice mode by clicking the stop/end voice button.
 * Returns true if the button was found and clicked, false otherwise.
 * Returns false gracefully if voice mode has already ended on its own.
 */
export async function deactivateVoiceMode(): Promise<boolean> {
  // IMPORTANT: ChatGPT's voice stop button aria-labels have changed across versions.
  // Try all known attribute-based selectors first, then fall back to text/label search.
  const STOP_SELECTORS = [
    'button[aria-label="Stop Voice"]',
    'button[aria-label="End voice chat"]',
    'button[aria-label="End call"]',
    'button[aria-label="Close voice mode"]',
    'button[aria-label="Stop listening"]',
    'button[aria-label="Leave call"]',
    'button[aria-label="Hang up"]',
    'button[data-testid="voice-stop-button"]',
    'button[data-testid="stop-voice-button"]',
    'button[data-testid="end-voice-button"]',
  ];

  let btn = querySelector<HTMLButtonElement>(STOP_SELECTORS);

  // IMPORTANT: Fallback — scan all buttons for voice-related stop text or labels.
  if (!btn) {
    const KEYWORDS = ['stop voice', 'end voice', 'end call', 'leave call', 'hang up', 'close voice', 'stop listening'];
    const candidates = document.querySelectorAll<HTMLButtonElement>('button');
    for (const candidate of candidates) {
      const text = (candidate.textContent?.trim() ?? '').toLowerCase();
      const label = (
        candidate.getAttribute('aria-label') ??
        candidate.getAttribute('title') ??
        ''
      ).toLowerCase();
      if (KEYWORDS.some((kw) => text.includes(kw) || label.includes(kw))) {
        btn = candidate;
        break;
      }
    }
  }

  if (!btn) {
    console.warn('[domIntegration] deactivateVoiceMode: stop voice button not found — voice may have already ended');
    return false;
  }

  btn.click();
  // Wait for voice mode to shut down and text input to restore
  await delay(2000);
  return true;
}

/**
 * Polls until the assistant message count has been stable (unchanged) for `stableMs`.
 * Call this after ending a voice session so that ChatGPT's post-voice transcript
 * finishes appearing before we count the baseline for waitForChatGPTResponse.
 */
export async function waitForStableMessages(stableMs = 2500, timeoutMs = 12_000): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  let lastCount = document.querySelectorAll('[data-message-author-role="assistant"]').length;
  let stableSince = Date.now();

  while (Date.now() < deadline) {
    await delay(300);
    const count = document.querySelectorAll('[data-message-author-role="assistant"]').length;
    if (count !== lastCount) {
      lastCount = count;
      stableSince = Date.now();
    } else if (Date.now() - stableSince >= stableMs) {
      return;
    }
  }
  // Timed out — proceed anyway; sendToChatGPT will still work, just less safe
}

function findNewChatByText(): HTMLElement | null {
  const candidates = document.querySelectorAll<HTMLElement>('button, a');
  for (const el of candidates) {
    const text = el.textContent?.trim().toLowerCase() ?? '';
    const label = (
      el.getAttribute('aria-label') ??
      el.getAttribute('title') ??
      ''
    ).toLowerCase();
    if (
      text === 'new chat' ||
      text === 'new conversation' ||
      label.includes('new chat') ||
      label.includes('new conversation') ||
      label.includes('compose')
    ) {
      return el;
    }
  }
  return null;
}
