/**
 * Lightweight markdown renderer for teacher/student chat messages.
 * Handles: bold, italic, inline code, h1-h3, bullet lists, numbered lists,
 * blank-line paragraph breaks, and single-newline line breaks.
 * No external dependencies — keeps bundle size small.
 *
 * Per-line direction: lines whose characters are exclusively RTL script
 * (Arabic/Persian/Hebrew) get dir="rtl"; lines with exclusively LTR script
 * (Latin etc.) get dir="ltr"; mixed or undetermined lines use sourceDir.
 */
import React from 'react';

// ── Script detection ──────────────────────────────────────────────────────────

// Matches any Arabic, Persian, Hebrew, or other RTL-script character
const HAS_RTL = /[֐-׿؀-ۿݐ-ݿࢠ-ࣿיִ-ﭏﭐ-﷿ﹰ-﻿]/;
// Matches any Latin or common LTR-script letter
const HAS_LTR = /[a-zA-ZÀ-ɏɐ-ʯ]/;

/**
 * Returns 'rtl' if the line has RTL chars and no LTR chars,
 * 'ltr' if it has LTR chars and no RTL chars, or null if mixed/neither.
 */
function detectDir(text: string): 'rtl' | 'ltr' | null {
  const rtl = HAS_RTL.test(text);
  const ltr = HAS_LTR.test(text);
  if (rtl && !ltr) return 'rtl';
  if (ltr && !rtl) return 'ltr';
  return null; // mixed or punctuation-only → caller uses sourceDir
}

// ── Inline rendering ──────────────────────────────────────────────────────────

const INLINE_RE = /(\*\*|__)(.*?)\1|(\*|_)(.*?)\3|`([^`]+)`/g;

function renderInline(text: string, key: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  INLINE_RE.lastIndex = 0;

  while ((m = INLINE_RE.exec(text)) !== null) {
    if (m.index > last) nodes.push(text.slice(last, m.index));

    if (m[1]) {
      nodes.push(<strong key={`${key}-b${m.index}`}>{m[2]}</strong>);
    } else if (m[3]) {
      nodes.push(<em key={`${key}-i${m.index}`}>{m[4]}</em>);
    } else if (m[5]) {
      nodes.push(<code key={`${key}-c${m.index}`} style={codeStyle}>{m[5]}</code>);
    }
    last = INLINE_RE.lastIndex;
  }

  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

// ── Line classifiers ──────────────────────────────────────────────────────────

const isBullet   = (l: string) => /^[-*•]\s+/.test(l);
const isNumbered = (l: string) => /^\d+[.)]\s+/.test(l);

// ── Public component ──────────────────────────────────────────────────────────

interface MarkdownTextProps {
  text: string;
  /** Direction of the source (explanation) language — used as the default. */
  sourceDir: 'ltr' | 'rtl';
  /** Direction of the target (practice) language — applied to lines written in it. */
  targetDir: 'ltr' | 'rtl';
}

export function MarkdownText({ text, sourceDir, targetDir }: MarkdownTextProps): React.ReactElement {
  const lines = text.split('\n').map((l) => l.trimEnd());
  const elements: React.ReactNode[] = [];
  let i = 0;

  /** Resolve the dir for one line of plain text. */
  function lineDir(line: string): 'ltr' | 'rtl' {
    return detectDir(line) ?? sourceDir;
  }

  while (i < lines.length) {
    const line = lines[i].trim();

    if (!line) { i++; continue; }

    // ── Heading ──────────────────────────────────────────────────────────────
    const hm = line.match(/^(#{1,3})\s+(.*)/);
    if (hm) {
      const level = hm[1].length as 1 | 2 | 3;
      const content = hm[2];
      elements.push(
        <div key={i} style={headingStyles[level]} dir={lineDir(content)}>
          {renderInline(content, `h${i}`)}
        </div>
      );
      i++;
      continue;
    }

    // ── Bullet list ───────────────────────────────────────────────────────────
    if (isBullet(line)) {
      const start = i;
      const items: string[] = [];
      while (i < lines.length && (isBullet(lines[i].trim()) || lines[i].trim() === '')) {
        const t = lines[i].trim();
        if (t) items.push(t.replace(/^[-*•]\s+/, ''));
        i++;
      }
      // List direction follows the first item's script
      const listDir = lineDir(items[0] ?? '');
      elements.push(
        <ul key={`ul${start}`} style={ulStyle} dir={listDir}>
          {items.map((item, j) => (
            <li key={j} dir={lineDir(item)}>
              {renderInline(item, `ul${start}-${j}`)}
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // ── Numbered list ─────────────────────────────────────────────────────────
    if (isNumbered(line)) {
      const start = i;
      const items: string[] = [];
      while (i < lines.length && (isNumbered(lines[i].trim()) || lines[i].trim() === '')) {
        const t = lines[i].trim();
        if (t) items.push(t.replace(/^\d+[.)]\s+/, ''));
        i++;
      }
      const listDir = lineDir(items[0] ?? '');
      elements.push(
        <ol key={`ol${start}`} style={olStyle} dir={listDir}>
          {items.map((item, j) => (
            <li key={j} dir={lineDir(item)}>
              {renderInline(item, `ol${start}-${j}`)}
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // ── Regular paragraph ─────────────────────────────────────────────────────
    elements.push(
      <p key={i} style={pStyle} dir={lineDir(line)}>
        {renderInline(line, `p${i}`)}
      </p>
    );
    i++;
  }

  return <>{elements}</>;
}

// ── Styles ────────────────────────────────────────────────────────────────────

const pStyle: React.CSSProperties = {
  margin: '0 0 5px 0',
  lineHeight: 1.6,
};

const ulStyle: React.CSSProperties = {
  margin: '2px 0 8px 0',
  paddingInlineStart: 20,
  lineHeight: 1.6,
};

const olStyle: React.CSSProperties = {
  margin: '2px 0 8px 0',
  paddingInlineStart: 20,
  lineHeight: 1.6,
};

const codeStyle: React.CSSProperties = {
  background: 'rgba(0,0,0,0.08)',
  padding: '1px 5px',
  borderRadius: 4,
  fontFamily: 'monospace',
  fontSize: '0.88em',
};

const headingStyles: Record<1 | 2 | 3, React.CSSProperties> = {
  1: { fontWeight: 700, fontSize: '1.1em', margin: '10px 0 5px', lineHeight: 1.3 },
  2: { fontWeight: 700, fontSize: '1.0em', margin: '8px 0 4px', lineHeight: 1.3, borderBottom: '1px solid rgba(0,0,0,0.1)', paddingBottom: 2 },
  3: { fontWeight: 600, fontSize: '0.95em', margin: '6px 0 3px', lineHeight: 1.3 },
};
