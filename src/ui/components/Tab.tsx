/**
 * Reusable horizontal tab bar component.
 */
import React from 'react';
import { tabBar, tabItem } from '../styles';

export interface TabDef {
  id: string;
  label: string;
}

interface TabProps {
  tabs: TabDef[];
  activeId: string;
  onSelect: (id: string) => void;
  dir?: 'ltr' | 'rtl';
}

/**
 * Renders a row of tab buttons. Highlights the active tab with a bottom border.
 */
export function Tab({ tabs, activeId, onSelect, dir = 'ltr' }: TabProps): React.ReactElement {
  return (
    <div style={{ ...tabBar, direction: dir }} role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={tab.id === activeId}
          style={tabItem(tab.id === activeId)}
          onClick={() => onSelect(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
