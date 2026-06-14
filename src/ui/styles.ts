/**
 * All CSS-in-JS style objects for the AI Language Teacher panel.
 * Pure JS style objects — no external CSS, no Tailwind.
 * These styles must work correctly inside a Shadow DOM.
 */
import type { CSSProperties } from 'react';

// ─── Color Palette ────────────────────────────────────────────────────────────

export const palette = {
  // Brand / accent
  primary: '#10a37f',         // ChatGPT-adjacent green — start/send/save actions
  primaryHover: '#0d8a6a',
  primaryLight: '#e6f7f3',

  // Danger
  danger: '#e53e3e',
  dangerHover: '#c53030',
  dangerLight: '#fff5f5',

  // Neutrals
  bg: '#ffffff',
  bgPanel: '#f9fafb',
  bgHover: '#f0f2f5',
  border: '#e2e8f0',
  borderFocus: '#10a37f',

  // Text
  textPrimary: '#1a202c',
  textSecondary: '#4a5568',
  textMuted: '#a0aec0',
  textInverse: '#ffffff',

  // Chat
  bubbleTeacher: '#f0f4ff',
  bubbleStudent: '#10a37f',
  bubbleStudentText: '#ffffff',
  chatBg: '#f7f7f8',

  // Overlay / shadow
  overlay: 'rgba(0,0,0,0.7)',
  shadow: '0 4px 24px rgba(0,0,0,0.15)',
  shadowSm: '0 2px 8px rgba(0,0,0,0.10)',

  // Status
  warning: '#f6ad55',
  warningLight: '#fffaf0',
  success: '#48bb78',
};

// ─── Layout constants ──────────────────────────────────────────────────────────

export const PANEL_WIDTH = 360;
export const HEADER_HEIGHT = 48;
export const TAB_HEIGHT = 40;

// ─── Shared base styles ───────────────────────────────────────────────────────

export const resetBase: CSSProperties = {
  boxSizing: 'border-box',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  fontSize: 14,
  color: palette.textPrimary,
  lineHeight: 1.5,
};

// ─── Launcher (small circular button) ────────────────────────────────────────

export const launcherBtn: CSSProperties = {
  ...resetBase,
  position: 'fixed',
  top: 16,
  right: 16,
  width: 56,
  height: 56,
  borderRadius: '50%',
  background: palette.primary,
  color: palette.textInverse,
  border: 'none',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 24,
  boxShadow: palette.shadow,
  zIndex: 1,
  transition: 'transform 0.15s',
};

// ─── Control Panel card ───────────────────────────────────────────────────────

export const card: CSSProperties = {
  ...resetBase,
  position: 'fixed',
  top: 16,
  right: 16,
  width: PANEL_WIDTH,
  maxHeight: '80vh',
  overflowY: 'auto',
  background: palette.bg,
  borderRadius: 16,
  boxShadow: palette.shadow,
  display: 'flex',
  flexDirection: 'column',
  zIndex: 1,
};

export const cardHeader: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '12px 16px',
  borderBottom: `1px solid ${palette.border}`,
  background: palette.bg,
  borderRadius: '16px 16px 0 0',
  minHeight: HEADER_HEIGHT,
  flexShrink: 0,
};

export const cardTitle: CSSProperties = {
  fontWeight: 700,
  fontSize: 16,
  color: palette.textPrimary,
  margin: 0,
};

export const cardBody: CSSProperties = {
  flex: 1,
  overflowY: 'auto',
  padding: '0 0 8px',
};

// ─── Full-screen lesson overlay ───────────────────────────────────────────────

export const lessonOverlay: CSSProperties = {
  ...resetBase,
  position: 'fixed',
  inset: 0,
  background: palette.chatBg,
  display: 'flex',
  flexDirection: 'column',
  zIndex: 1,
};

// ─── Tab bar ──────────────────────────────────────────────────────────────────

export const tabBar: CSSProperties = {
  display: 'flex',
  borderBottom: `1px solid ${palette.border}`,
  background: palette.bg,
  flexShrink: 0,
};

export const tabItem = (active: boolean): CSSProperties => ({
  flex: 1,
  height: TAB_HEIGHT,
  border: 'none',
  borderBottom: active ? `2px solid ${palette.primary}` : '2px solid transparent',
  background: 'transparent',
  color: active ? palette.primary : palette.textSecondary,
  fontWeight: active ? 700 : 400,
  fontSize: 13,
  cursor: 'pointer',
  transition: 'color 0.15s, border-color 0.15s',
});

// ─── Buttons ──────────────────────────────────────────────────────────────────

export const btnBase: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 6,
  padding: '8px 16px',
  borderRadius: 8,
  border: 'none',
  cursor: 'pointer',
  fontSize: 14,
  fontWeight: 600,
  transition: 'background 0.15s, opacity 0.15s',
  whiteSpace: 'nowrap',
};

export const btnPrimary: CSSProperties = {
  ...btnBase,
  background: palette.primary,
  color: palette.textInverse,
};

export const btnDanger: CSSProperties = {
  ...btnBase,
  background: palette.danger,
  color: palette.textInverse,
};

export const btnGhost: CSSProperties = {
  ...btnBase,
  background: 'transparent',
  color: palette.textSecondary,
  border: `1px solid ${palette.border}`,
};

export const btnSmall: CSSProperties = {
  ...btnBase,
  padding: '4px 10px',
  fontSize: 12,
};

// ─── Form elements ────────────────────────────────────────────────────────────

export const formGroup: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
  marginBottom: 12,
};

export const label: CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  color: palette.textSecondary,
  textTransform: 'uppercase',
  letterSpacing: 0.5,
};

export const input: CSSProperties = {
  padding: '8px 12px',
  borderRadius: 8,
  border: `1px solid ${palette.border}`,
  fontSize: 14,
  color: palette.textPrimary,
  background: palette.bg,
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
  transition: 'border-color 0.15s',
};

export const select: CSSProperties = {
  ...input,
  cursor: 'pointer',
};

export const textarea: CSSProperties = {
  ...input,
  resize: 'vertical',
  minHeight: 80,
};

// ─── Chat UI ──────────────────────────────────────────────────────────────────

export const chatHeader: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '10px 16px',
  background: palette.bg,
  borderBottom: `1px solid ${palette.border}`,
  flexShrink: 0,
  gap: 8,
  flexWrap: 'wrap',
};

export const chatHeaderTitle: CSSProperties = {
  fontWeight: 700,
  fontSize: 15,
  color: palette.textPrimary,
};

export const chatHeaderMeta: CSSProperties = {
  fontSize: 12,
  color: palette.textSecondary,
};

export const messageList: CSSProperties = {
  flex: 1,
  overflowY: 'auto',
  padding: '16px 12px',
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
};

export const messageBubbleBase: CSSProperties = {
  maxWidth: '80%',
  padding: '10px 14px',
  borderRadius: 16,
  fontSize: 14,
  lineHeight: 1.6,
  wordBreak: 'break-word',
  whiteSpace: 'pre-wrap',
};

export const messageBubbleTeacher: CSSProperties = {
  ...messageBubbleBase,
  background: palette.bubbleTeacher,
  color: palette.textPrimary,
  borderBottomLeftRadius: 4,
  alignSelf: 'flex-start',
};

export const messageBubbleStudent: CSSProperties = {
  ...messageBubbleBase,
  background: palette.bubbleStudent,
  color: palette.bubbleStudentText,
  borderBottomRightRadius: 4,
  alignSelf: 'flex-end',
};

export const messageRow = (isStudent: boolean): CSSProperties => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: isStudent ? 'flex-end' : 'flex-start',
});

export const messageRoleLabel: CSSProperties = {
  fontSize: 11,
  color: palette.textMuted,
  marginBottom: 2,
  fontWeight: 600,
};

export const chatComposer: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  padding: '10px 12px',
  background: palette.bg,
  borderTop: `1px solid ${palette.border}`,
  flexShrink: 0,
};

export const chatComposerRow: CSSProperties = {
  display: 'flex',
  gap: 8,
  alignItems: 'flex-end',
};

export const chatTextarea: CSSProperties = {
  flex: 1,
  padding: '8px 12px',
  borderRadius: 12,
  border: `1px solid ${palette.border}`,
  fontSize: 14,
  resize: 'none',
  minHeight: 40,
  maxHeight: 120,
  outline: 'none',
  fontFamily: 'inherit',
  lineHeight: 1.5,
  color: palette.textPrimary,
  background: palette.bg,
};

export const iconBtn: CSSProperties = {
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  padding: 6,
  borderRadius: 8,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 18,
  color: palette.textSecondary,
  transition: 'background 0.15s',
  flexShrink: 0,
};

// ─── Typing indicator ─────────────────────────────────────────────────────────

export const typingIndicator: CSSProperties = {
  display: 'flex',
  gap: 4,
  padding: '10px 14px',
  background: palette.bubbleTeacher,
  borderRadius: 16,
  borderBottomLeftRadius: 4,
  alignSelf: 'flex-start',
  width: 56,
};

// ─── Score bar ────────────────────────────────────────────────────────────────

export const scoreBarOuter: CSSProperties = {
  width: '100%',
  height: 8,
  background: palette.border,
  borderRadius: 4,
  overflow: 'hidden',
};

export const scoreBarInner = (pct: number): CSSProperties => ({
  width: `${Math.min(100, Math.max(0, pct))}%`,
  height: '100%',
  background:
    pct >= 75 ? palette.success : pct >= 50 ? palette.warning : palette.danger,
  borderRadius: 4,
  transition: 'width 0.4s ease',
});

// ─── Tags ─────────────────────────────────────────────────────────────────────

export const tagContainer: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 6,
  marginTop: 4,
};

export const tag: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 4,
  padding: '2px 8px',
  background: palette.primaryLight,
  color: palette.primary,
  borderRadius: 12,
  fontSize: 12,
  fontWeight: 600,
};

export const tagRemoveBtn: CSSProperties = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: palette.primary,
  padding: 0,
  fontSize: 14,
  lineHeight: 1,
  display: 'flex',
  alignItems: 'center',
};

// ─── Notice / banner ─────────────────────────────────────────────────────────

export const notice = (variant: 'info' | 'warning' | 'error' = 'info'): CSSProperties => {
  const map = {
    info: { bg: '#ebf8ff', color: '#2b6cb0', border: '#bee3f8' },
    warning: { bg: palette.warningLight, color: '#9c4221', border: '#fbd38d' },
    error: { bg: palette.dangerLight, color: palette.danger, border: '#feb2b2' },
  };
  const c = map[variant];
  return {
    padding: '10px 14px',
    borderRadius: 8,
    background: c.bg,
    color: c.color,
    border: `1px solid ${c.border}`,
    fontSize: 13,
    lineHeight: 1.5,
  };
};

// ─── Section padding ─────────────────────────────────────────────────────────

export const section: CSSProperties = {
  padding: '16px',
};

export const sectionTitle: CSSProperties = {
  fontWeight: 700,
  fontSize: 15,
  marginBottom: 12,
  color: palette.textPrimary,
};

// ─── Progress bar (setup wizard) ─────────────────────────────────────────────

export const progressBar = (pct: number): CSSProperties => ({
  height: 4,
  background: palette.primary,
  width: `${pct}%`,
  borderRadius: 2,
  transition: 'width 0.3s',
});

export const progressTrack: CSSProperties = {
  height: 4,
  background: palette.border,
  borderRadius: 2,
  width: '100%',
  marginBottom: 16,
  overflow: 'hidden',
};

// ─── Toggle switch ────────────────────────────────────────────────────────────

export const toggleContainer: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  cursor: 'pointer',
  userSelect: 'none',
};

export const toggleTrack = (on: boolean): CSSProperties => ({
  width: 40,
  height: 22,
  background: on ? palette.primary : palette.border,
  borderRadius: 11,
  position: 'relative',
  transition: 'background 0.2s',
  flexShrink: 0,
});

export const toggleThumb = (on: boolean): CSSProperties => ({
  position: 'absolute',
  top: 3,
  left: on ? 19 : 3,
  width: 16,
  height: 16,
  background: '#fff',
  borderRadius: '50%',
  transition: 'left 0.2s',
  boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
});

// ─── Divider ─────────────────────────────────────────────────────────────────

export const divider: CSSProperties = {
  height: 1,
  background: palette.border,
  margin: '8px 0',
};

// ─── Student list row ─────────────────────────────────────────────────────────

export const studentRow: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '10px 16px',
  borderBottom: `1px solid ${palette.border}`,
  gap: 8,
};

// ─── History item ─────────────────────────────────────────────────────────────

export const historyItem: CSSProperties = {
  padding: '10px 16px',
  borderBottom: `1px solid ${palette.border}`,
  cursor: 'pointer',
};

// ─── Badge ────────────────────────────────────────────────────────────────────

export const badge = (color: string): CSSProperties => ({
  display: 'inline-block',
  padding: '2px 8px',
  borderRadius: 10,
  fontSize: 11,
  fontWeight: 700,
  background: color,
  color: '#fff',
  whiteSpace: 'nowrap',
});

// ─── Empty state ─────────────────────────────────────────────────────────────

export const emptyState: CSSProperties = {
  padding: '32px 16px',
  textAlign: 'center',
  color: palette.textMuted,
  fontSize: 14,
};
