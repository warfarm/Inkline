import { useState, useEffect } from 'react';

export type WordBankPanelPosition = 'left' | 'right';

const STORAGE_KEY = 'word_bank_panel_position';

export function useWordBankPanelPosition() {
  const [position, setPosition] = useState<WordBankPanelPosition>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return (stored === 'left' || stored === 'right') ? stored : 'right';
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, position);
  }, [position]);

  return { position, setPosition };
}
