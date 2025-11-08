import TinySegmenter from 'tiny-segmenter';

const segmenter = new TinySegmenter();

export interface SegmentedWord {
  text: string;
  start: number;
  end: number;
  reading?: string;
}

/**
 * Segments Japanese text into words using TinySegmenter
 * @param text - The Japanese text to segment
 * @returns Array of segmented words with position information
 */
export function segmentJapanese(text: string): SegmentedWord[] {
  if (!text) return [];

  const segments = segmenter.segment(text);
  const words: SegmentedWord[] = [];
  let currentPosition = 0;

  for (const segment of segments) {
    const start = currentPosition;
    const end = currentPosition + segment.length;

    words.push({
      text: segment,
      start,
      end,
    });

    currentPosition = end;
  }

  return words;
}

/**
 * Checks if a character is a kanji character
 * @param char - The character to check
 * @returns true if the character is kanji
 */
export function isKanji(char: string): boolean {
  const code = char.charCodeAt(0);
  return (
    (code >= 0x4e00 && code <= 0x9faf) || // CJK Unified Ideographs
    (code >= 0x3400 && code <= 0x4dbf) || // CJK Extension A
    (code >= 0x20000 && code <= 0x2a6df) || // CJK Extension B
    (code >= 0x2a700 && code <= 0x2b73f) || // CJK Extension C
    (code >= 0x2b740 && code <= 0x2b81f) || // CJK Extension D
    (code >= 0x2b820 && code <= 0x2ceaf) || // CJK Extension E
    (code >= 0xf900 && code <= 0xfaff) || // CJK Compatibility Ideographs
    (code >= 0x2f800 && code <= 0x2fa1f) // CJK Compatibility Ideographs Supplement
  );
}

/**
 * Extracts all kanji characters from a text
 * @param text - The text to extract kanji from
 * @returns Array of unique kanji characters
 */
export function extractKanji(text: string): string[] {
  const kanjiSet = new Set<string>();

  for (const char of text) {
    if (isKanji(char)) {
      kanjiSet.add(char);
    }
  }

  return Array.from(kanjiSet);
}

/**
 * Checks if a string contains any kanji
 * @param text - The text to check
 * @returns true if the text contains kanji
 */
export function hasKanji(text: string): boolean {
  return Array.from(text).some((char) => isKanji(char));
}
