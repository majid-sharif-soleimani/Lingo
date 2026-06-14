/**
 * Chat Relay — the single round-trip primitive for all ChatGPT communication.
 *
 * Architecture note: this is the ONLY module that combines injection + waiting.
 * The lesson controller calls sendToChatGPT() for every turn (teacher prompt,
 * student messages, and the end-lesson report request). Keeping it in one place
 * means injection and response detection are always in sync.
 *
 * Error handling: throws typed RelayError so the lesson controller can present
 * the right t() key to the user.
 */

import { isChatGPTReady, injectAndSendMessage } from './domIntegration';
import { waitForChatGPTResponse, RelayError } from './responseWatcher';

export { RelayError };

/**
 * Sends one message to the hidden ChatGPT and returns the full reply text.
 *
 * @throws RelayError('not-ready') if ChatGPT's composer is not present (user not logged in, etc.)
 * @throws RelayError('timeout')   if ChatGPT does not respond within 90 seconds
 * @throws RelayError('no-response') if the response element is empty after generation
 */
export async function sendToChatGPT(text: string): Promise<string> {
  // IMPORTANT: Always check readiness before injection — if ChatGPT isn't loaded or the
  // user is logged out, injection will silently fail and waitForChatGPTResponse will time out.
  if (!isChatGPTReady()) {
    throw new RelayError('not-ready', 'ChatGPT composer input not found');
  }

  // Inject the message into ChatGPT's composer and click Send.
  await injectAndSendMessage(text);

  // Wait for ChatGPT to finish generating the response and return its full text.
  return await waitForChatGPTResponse();
}
