/**
 * Response Watcher — detects when ChatGPT finishes generating a response.
 *
 * Uses a MutationObserver + a 500ms polling interval as a belt-and-suspenders approach.
 * The 1500ms extra wait after generation ends guards against brief UI flickers.
 *
 * All selectors carry "// IMPORTANT:" comments because they are fragile against ChatGPT updates.
 */

/** Typed error class for relay failures. */
export class RelayError extends Error {
  constructor(
    public readonly code: 'not-ready' | 'timeout' | 'no-response',
    message?: string
  ) {
    super(message ?? code);
    this.name = 'RelayError';
  }
}

/**
 * Tries to expand any "Show more" / "Read more" buttons in the last assistant message.
 * ChatGPT sometimes collapses long responses and only shows a truncated portion.
 * Clicking these buttons reveals the full content before we read textContent.
 */
function expandCollapsedContent(): void {
  // IMPORTANT: ChatGPT collapses long messages with a "Show more" button rendered inside
  // the assistant message container. Without expanding, textContent returns only the visible
  // portion (can be as few as 64–150 chars for a JSON report).
  const messages = document.querySelectorAll<HTMLElement>(
    '[data-message-author-role="assistant"]'
  );
  if (messages.length === 0) return;
  const last = messages[messages.length - 1];
  const buttons = last.querySelectorAll<HTMLButtonElement>('button');
  for (const btn of buttons) {
    const text = (btn.textContent?.trim() ?? '').toLowerCase();
    const label = (btn.getAttribute('aria-label') ?? '').toLowerCase();
    if (
      text === 'show more' || text === 'read more' || text === 'more' ||
      label.includes('show more') || label.includes('expand') || label.includes('read more')
    ) {
      btn.click();
    }
  }
}

/**
 * Returns the text content of the last assistant message currently in the DOM.
 * Returns '' if no assistant messages are present.
 */
function getLastAssistantText(): string {
  // IMPORTANT: ChatGPT wraps each message in a [data-message-author-role] attribute.
  // This selector has been stable across several ChatGPT versions but may change.
  const messages = document.querySelectorAll<HTMLElement>(
    '[data-message-author-role="assistant"]'
  );
  if (messages.length === 0) return '';
  const last = messages[messages.length - 1];
  return last.textContent?.trim() ?? '';
}

/**
 * Returns the number of assistant message elements currently in the DOM.
 */
function countAssistantMessages(): number {
  // IMPORTANT: Same selector as getLastAssistantText — fragile if ChatGPT changes its DOM structure.
  return document.querySelectorAll('[data-message-author-role="assistant"]').length;
}

/**
 * Returns true if the "Stop generating" button is currently visible.
 * When this button is absent, ChatGPT has finished (or hasn't started) generating.
 */
function isStreaming(): boolean {
  // IMPORTANT: ChatGPT's stop button aria-label and test-id have changed across versions.
  // We check all known variants for resilience.
  return !!(
    document.querySelector('button[aria-label="Stop generating"]') ??
    document.querySelector('button[aria-label="Stop streaming"]') ??
    document.querySelector('button[aria-label="Stop"]') ??
    document.querySelector('button[data-testid="stop-button"]') ??
    document.querySelector('[data-testid="stop-streaming-button"]')
  );
}

/**
 * Returns the conversation container element to observe for DOM mutations.
 */
function getConversationContainer(): Element {
  // IMPORTANT: The conversation container selector changes with ChatGPT redesigns.
  // We fall back to <main> and then document.body as progressively more stable options.
  return (
    document.querySelector('[class*="conversation"]') ??
    document.querySelector('main') ??
    document.body
  );
}

/**
 * Waits for ChatGPT to finish generating a response after a message has been sent.
 *
 * Detection logic:
 *   1. Record the initial assistant message count.
 *   2. Observe the conversation container for DOM changes (MutationObserver).
 *   3. Also poll every 500ms as a backup in case mutations are missed.
 *   4. Resolve when BOTH conditions are met:
 *      a. A new assistant message exists (count increased) with non-empty text.
 *      b. The "Stop generating" button is absent.
 *   5. Wait an additional 1500ms after condition b to guard against stream-chunk flickers.
 *   6. Reject with RelayError('timeout') after timeoutMs.
 *
 * @param timeoutMs  Maximum ms to wait before rejecting (default 90s — reports can be long).
 */
export function waitForChatGPTResponse(timeoutMs = 90_000): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const initialCount = countAssistantMessages();
    let settled = false;
    let settleTimer: ReturnType<typeof setTimeout> | null = null;
    let pollInterval: ReturnType<typeof setInterval> | null = null;

    function cleanup() {
      observer.disconnect();
      if (pollInterval !== null) {
        clearInterval(pollInterval);
        pollInterval = null;
      }
      if (settleTimer !== null) {
        clearTimeout(settleTimer);
        settleTimer = null;
      }
    }

    console.log('[responseWatcher] waiting for response — initialCount:', initialCount, 'timeout:', timeoutMs, 'ms');

    const timeoutHandle = setTimeout(() => {
      if (!settled) {
        settled = true;
        cleanup();
        const currentCount = countAssistantMessages();
        const lastText = getLastAssistantText();
        console.error('[responseWatcher] TIMEOUT after', timeoutMs, 'ms');
        console.error('[responseWatcher] initialCount:', initialCount, 'currentCount:', currentCount);
        console.error('[responseWatcher] lastAssistantText snippet:', lastText.slice(0, 200));
        console.error('[responseWatcher] isStreaming:', isStreaming());
        reject(new RelayError('timeout', 'ChatGPT did not respond within the timeout period'));
      }
    }, timeoutMs);

    function settle() {
      if (settled) return;
      settled = true;
      clearTimeout(timeoutHandle);
      cleanup();
      // Expand any collapsed "Show more" buttons so we read the full response text.
      expandCollapsedContent();
      // Allow a short render cycle after expansion before reading textContent.
      setTimeout(() => {
        const text = getLastAssistantText();
        console.log('[responseWatcher] settled — text length:', text.length, 'snippet:', text.slice(0, 100));
        if (text) {
          resolve(text);
        } else {
          console.error('[responseWatcher] settled with empty text — assistant messages count:', countAssistantMessages());
          reject(new RelayError('no-response', 'ChatGPT response was empty'));
        }
      }, 300);
    }

    function check() {
      const currentCount = countAssistantMessages();
      const hasNewMessage = currentCount > initialCount;
      const hasText = getLastAssistantText().length > 0;
      const streaming = isStreaming();

      if (hasNewMessage && hasText && !streaming) {
        // IMPORTANT: Wait an extra 2500ms before reading because ChatGPT sometimes briefly
        // removes the "Stop generating" button between streaming chunks, which would cause
        // us to read an incomplete response. 2500ms (up from 1500ms) gives more buffer
        // for long JSON responses that stream slowly (e.g. lesson reports after voice sessions).
        if (settleTimer === null) {
          settleTimer = setTimeout(settle, 2500);
        }
      } else {
        // If streaming resumed or message disappeared, cancel the pending settle timer
        if (settleTimer !== null && (streaming || !hasNewMessage)) {
          clearTimeout(settleTimer);
          settleTimer = null;
        }
      }
    }

    // IMPORTANT: Observe the conversation container for any DOM changes (childList + subtree).
    // We use subtree:true because ChatGPT nests messages many levels deep.
    const container = getConversationContainer();
    const observer = new MutationObserver(check);
    observer.observe(container, { childList: true, subtree: true, characterData: true });

    // IMPORTANT: Poll every 500ms as a backup. If the MutationObserver misses a state
    // transition (e.g., the container was replaced during SPA navigation), polling ensures
    // we still detect the completed response.
    pollInterval = setInterval(check, 500);

    // Run an immediate check in case the response is already there
    check();
  });
}
