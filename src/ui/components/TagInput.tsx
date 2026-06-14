/**
 * Add/remove tag chip input component.
 * Press Enter, comma, or click + to add a tag. Click × on a chip to remove it.
 * Does NOT commit on blur to prevent individual characters being added while tabbing.
 */
import React, { useState } from 'react';
import { tag, tagContainer, tagRemoveBtn, input as inputStyle, palette } from '../styles';

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  dir?: 'ltr' | 'rtl';
}

/**
 * A compound input: shows existing tags as chips and accepts new ones via text input.
 * Commit triggers: Enter key, comma key, or clicking the + button.
 * Backspace on an empty input removes the last tag.
 */
export function TagInput({ tags, onChange, placeholder, dir = 'ltr' }: TagInputProps): React.ReactElement {
  const [value, setValue] = useState('');

  function commit() {
    const trimmed = value.trim().replace(/,+$/, '');
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
    }
    setValue('');
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      commit();
    } else if (e.key === 'Backspace' && value === '' && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  }

  function removeTag(index: number) {
    onChange(tags.filter((_, i) => i !== index));
  }

  return (
    <div style={{ direction: dir }}>
      {tags.length > 0 && (
        <div style={{ ...tagContainer, marginBottom: 6 }}>
          {tags.map((tagVal, i) => (
            <span key={i} style={tag}>
              {tagVal}
              <button
                type="button"
                style={tagRemoveBtn}
                onClick={() => removeTag(i)}
                aria-label={`Remove ${tagVal}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
      <div style={{ display: 'flex', gap: 6 }}>
        <input
          type="text"
          value={value}
          placeholder={placeholder}
          style={{ ...inputStyle, flex: 1, marginTop: 0 }}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          dir={dir}
        />
        <button
          type="button"
          onClick={commit}
          disabled={!value.trim()}
          style={{
            padding: '6px 12px',
            borderRadius: 8,
            border: `1px solid ${palette.border}`,
            background: value.trim() ? palette.primary : palette.bgPanel,
            color: value.trim() ? '#fff' : palette.textMuted,
            cursor: value.trim() ? 'pointer' : 'default',
            fontSize: 16,
            fontWeight: 700,
            transition: 'background 0.15s',
          }}
          title="Add (or press Enter)"
        >
          +
        </button>
      </div>
      <div style={{ fontSize: 11, color: palette.textMuted, marginTop: 4 }}>
        Press Enter or click + to add
      </div>
    </div>
  );
}
