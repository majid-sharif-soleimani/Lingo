/**
 * Background Service Worker — minimal responsibilities.
 *
 * All UI and lesson logic live in the content script (which runs in the ChatGPT page context).
 * The service worker only:
 *   1. Opens chatgpt.com on first install so the user lands where the extension's panel appears.
 *   2. Focuses/opens a ChatGPT tab when the user clicks the toolbar action icon.
 */

/**
 * On first install, open a ChatGPT tab so the first-run setup wizard appears immediately.
 */
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    chrome.tabs.create({ url: 'https://chatgpt.com/' });
  }
});

/**
 * When the user clicks the extension toolbar icon, focus an existing ChatGPT tab
 * or open a new one. The extension has no popup — the panel lives inside ChatGPT's page.
 */
chrome.action.onClicked.addListener(async () => {
  const tabs = await chrome.tabs.query({ url: ['https://chatgpt.com/*', 'https://chat.openai.com/*'] });
  if (tabs.length > 0 && tabs[0].id !== undefined) {
    await chrome.tabs.update(tabs[0].id, { active: true });
    if (tabs[0].windowId !== undefined) {
      await chrome.windows.update(tabs[0].windowId, { focused: true });
    }
  } else {
    await chrome.tabs.create({ url: 'https://chatgpt.com/' });
  }
});
