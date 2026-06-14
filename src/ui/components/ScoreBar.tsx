/**
 * Visual 0–100 score bar with a label and numeric value.
 */
import React from 'react';
import { scoreBarOuter, scoreBarInner, palette } from '../styles';

interface ScoreBarProps {
  label: string;
  score: number;   // 0–100
  dir?: 'ltr' | 'rtl';
}

/**
 * Renders a labeled horizontal bar that fills proportionally to the score.
 * Color shifts from red (low) to amber (mid) to green (high).
 */
export function ScoreBar({ label, score, dir = 'ltr' }: ScoreBarProps): React.ReactElement {
  const clamped = Math.min(100, Math.max(0, score));
  return (
    <div style={{ marginBottom: 10, direction: dir }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 12, color: palette.textSecondary, fontWeight: 600 }}>
          {label}
        </span>
        <span style={{ fontSize: 12, fontWeight: 700, color: palette.textPrimary }}>
          {clamped}/100
        </span>
      </div>
      <div style={scoreBarOuter}>
        <div style={scoreBarInner(clamped)} />
      </div>
    </div>
  );
}
