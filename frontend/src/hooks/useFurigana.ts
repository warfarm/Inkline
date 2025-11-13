import { useState } from 'react';
import { useAuth } from './useAuth';

interface UseFuriganaReturn {
  showFurigana: boolean;
  overrideWords: Set<string>;
  shouldShowWordFurigana: (word: string) => boolean;
  isWordOverridden: (word: string) => boolean;
  toggleWordFurigana: (word: string) => void;
}

/**
 * Custom hook to manage furigana display preferences
 * - showFurigana: Global setting from user profile (default ON)
 * - overrideWords: Words with individually overridden furigana state
 * - shouldShowWordFurigana: Determines if a word's furigana should be visible
 * - isWordOverridden: Check if a word has an override
 * - toggleWordFurigana: Toggle furigana override for a specific word
 *
 * Logic:
 * - If global ON + word NOT overridden → show furigana
 * - If global ON + word IS overridden → hide furigana
 * - If global OFF + word NOT overridden → hide furigana
 * - If global OFF + word IS overridden → show furigana
 */
export function useFurigana(): UseFuriganaReturn {
  const { profile } = useAuth();

  // Global furigana setting from profile (default to true)
  const showFurigana = profile?.show_furigana ?? true;

  // Track words with overridden furigana state (opposite of global)
  const [overrideWords, setOverrideWords] = useState<Set<string>>(new Set());

  // Check if a word has an override
  const isWordOverridden = (word: string): boolean => {
    return overrideWords.has(word);
  };

  // Determine if a word's furigana should be shown
  const shouldShowWordFurigana = (word: string): boolean => {
    const isOverridden = overrideWords.has(word);
    // XOR logic: show if (global ON and not overridden) OR (global OFF and overridden)
    return showFurigana ? !isOverridden : isOverridden;
  };

  // Toggle furigana override for a specific word
  const toggleWordFurigana = (word: string) => {
    setOverrideWords((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(word)) {
        newSet.delete(word);
      } else {
        newSet.add(word);
      }
      return newSet;
    });
  };

  return {
    showFurigana,
    overrideWords,
    shouldShowWordFurigana,
    isWordOverridden,
    toggleWordFurigana,
  };
}
