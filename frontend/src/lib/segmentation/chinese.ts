export interface SegmentedWord {
  text: string;
  start: number;
  end: number;
  reading?: string;
}

/**
 * Simple Chinese word segmentation
 * Note: This is a basic implementation. For production, consider using a library like nodejieba
 * For now, we segment character by character for simplicity
 * @param text - The Chinese text to segment
 * @returns Array of segmented characters with position information
 */
export function segmentChinese(text: string): SegmentedWord[] {
  if (!text) return [];

  const words: SegmentedWord[] = [];
  let currentPosition = 0;

  // Simple character-by-character segmentation
  // In production, you'd want to use a proper Chinese word segmentation library
  for (const char of text) {
    const start = currentPosition;
    const end = currentPosition + char.length;

    words.push({
      text: char,
      start,
      end,
    });

    currentPosition = end;
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
