export interface SegmentedWord {
  text: string;
  start: number;
  end: number;
  reading?: string;
}

// Import the Chinese dictionary for word recognition
import { basicChineseDict } from '../dictionaries/chinese';

/**
 * Dictionary-based Chinese word segmentation using Forward Maximum Matching algorithm
 * This recognizes compound words from the dictionary instead of splitting character-by-character
 * @param text - The Chinese text to segment
 * @returns Array of segmented words with position information
 */
export function segmentChinese(text: string): SegmentedWord[] {
  if (!text) return [];

  const words: SegmentedWord[] = [];
  let currentPosition = 0;
  const maxWordLength = 8; // Maximum word length to check (most Chinese words are 2-4 chars)

  while (currentPosition < text.length) {
    let matched = false;

    // Try to match the longest possible word first (greedy matching)
    for (let length = Math.min(maxWordLength, text.length - currentPosition); length > 0; length--) {
      const candidate = text.substring(currentPosition, currentPosition + length);

      // Check if this substring exists in our dictionary
      if (basicChineseDict[candidate]) {
        const start = currentPosition;
        const end = currentPosition + length;

        words.push({
          text: candidate,
          start,
          end,
          reading: basicChineseDict[candidate].pinyin,
        });

        currentPosition = end;
        matched = true;
        break;
      }
    }

    // If no dictionary match found, treat as single character
    if (!matched) {
      const char = text[currentPosition];
      const start = currentPosition;
      const end = currentPosition + char.length;

      words.push({
        text: char,
        start,
        end,
      });

      currentPosition = end;
    }
  }

  return words;
}

/**
 * Checks if a character is a Chinese character (Hanzi)
 * @param char - The character to check
 * @returns true if the character is Chinese
 */
export function isHanzi(char: string): boolean {
  const code = char.charCodeAt(0);
  return (
    (code >= 0x4e00 && code <= 0x9faf) || // CJK Unified Ideographs
    (code >= 0x3400 && code <= 0x4dbf) || // CJK Extension A
    (code >= 0x20000 && code <= 0x2a6df) || // CJK Extension B
    (code >= 0xf900 && code <= 0xfaff) // CJK Compatibility Ideographs
  );
}

/**
 * Checks if a string contains any Chinese characters
 * @param text - The text to check
 * @returns true if the text contains Chinese characters
 */
export function hasChinese(text: string): boolean {
  return Array.from(text).some((char) => isHanzi(char));
}
