/**
 * Content Script Entry Point
 *
 * Runs on https://chatgpt.com/* and https://chat.openai.com/* at document_idle.
 * Mounts the AI Language Teacher panel into a Shadow DOM so our styles are fully
 * isolated from ChatGPT's own CSS in both directions.
 *
 * Architecture: this file contains NO business logic — it only mounts the React
 * Panel component. All lesson orchestration lives in session/lessonController.ts.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { Panel } from '../ui/Panel';

/**
 * Mounts the panel into a Shadow DOM attached to a stable host element.
 * Safe to call multiple times — returns immediately if already mounted.
 */
function mountPanel(): void {
  // IMPORTANT: stable ID prevents double-mounting on ChatGPT's client-side navigations.
  // ChatGPT is a React SPA and re-renders its DOM on every page change without a full reload.
  if (document.getElementById('ai-teacher-panel-host')) return;

  const host = document.createElement('div');
  host.id = 'ai-teacher-panel-host';

  // IMPORTANT: position:fixed + very high z-index keeps the panel above all ChatGPT UI.
  // The host starts small (launcher in the top-right corner). When a lesson is active,
  // the Panel component sets the host to inset:0 to cover the whole screen and hide ChatGPT.
  host.style.cssText =
    'position:fixed; top:0; right:0; z-index:2147483000; width:0; height:0;';

  document.body.appendChild(host);

  // IMPORTANT: Shadow DOM fully isolates our styles from ChatGPT's global CSS in both
  // directions — ChatGPT cannot accidentally override our component styles, and our
  // styles cannot leak into ChatGPT's own UI.
  const shadowRoot = host.attachShadow({ mode: 'open' });
  const container = document.createElement('div');
  shadowRoot.appendChild(container);

  // The Panel component controls host.style to toggle between the small launcher
  // footprint and full-screen overlay depending on whether a lesson is active.
  ReactDOM.createRoot(container).render(
    React.createElement(Panel, { host })
  );
}

// IMPORTANT: ChatGPT is a SPA — it navigates between pages without a full browser reload,
// which can cause our host element to be unmounted from the DOM. The MutationObserver
// watches document.body for child removals and re-mounts the panel if needed.
const remountObserver = new MutationObserver(() => {
  if (!document.getElementById('ai-teacher-panel-host')) {
    mountPanel();
  }
});

remountObserver.observe(document.body, { childList: true });

// Mount on initial load
mountPanel();
