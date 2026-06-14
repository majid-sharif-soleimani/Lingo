/**
 * A single chat message bubble — teacher or student.
 * Teacher messages include a 🔊 re-speak button.
 */
import React from 'react';
import type { ChatMessage } from '../../types/index';
import {
  messageBubbleTeacher,
  messageBubbleStudent,
  messageRow,
  messageRoleLabel,
  iconBtn,
  palette,
} from '../styles';
import { MarkdownText } from './MarkdownText';

interface MessageBubbleProps {
  message: ChatMessage;
  teacherLabel: string;
  studentLabel: string;
  onSpeak?: (text: string) => void;
  ttsSupported?: boolean;
  /** Direction of the source (explanation) language — default for mixed lines. */
  sourceDir?: 'ltr' | 'rtl';
  /** Direction of the target (practice) language — applied to target-only lines. */
  targetDir?: 'ltr' | 'rtl';
}

/**
 * Renders one message in the chat view.
 * Teacher messages are aligned left; student messages right (or flipped for RTL).
 */
export function MessageBubble({
  message,
  teacherLabel,
  studentLabel,
  onSpeak,
  ttsSupported,
  sourceDir = 'ltr',
  targetDir = 'ltr',
}: MessageBubbleProps): React.ReactElement {
  const isStudent = message.role === 'student';
  const bubbleStyle = isStudent ? messageBubbleStudent : messageBubbleTeacher;
  const label = isStudent ? studentLabel : teacherLabel;
  const dir = sourceDir;

  return (
    <div style={{ ...messageRow(isStudent), direction: dir }}>
      <span style={messageRoleLabel}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, flexDirection: dir === 'rtl' && !isStudent ? 'row-reverse' : 'row' }}>
        <div style={bubbleStyle}>
          <MarkdownText text={message.text} sourceDir={sourceDir} targetDir={targetDir} />
        </div>
        {!isStudent && ttsSupported && onSpeak && (
          <button
            style={{ ...iconBtn, color: palette.textMuted, fontSize: 14 }}
            onClick={() => onSpeak(message.text)}
            title="Re-read this message"
            aria-label="Speak message"
          >
            🔊
          </button>
        )}
      </div>
    </div>
  );
}
