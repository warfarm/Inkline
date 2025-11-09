import { useState, useEffect } from 'react';

export type WordPopupMode = 'hover' | 'click';

const STORAGE_KEY = 'word_popup_mode';

export function useWordPopupMode() {
  const [mode, setMode] = useState<WordPopupMode>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return (stored === 'click' || stored === 'hover') ? stored : 'hover';
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, mode);
  }, [mode]);

  return { mode, setMode };
}
