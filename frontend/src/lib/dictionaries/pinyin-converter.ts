/**
 * Convert numbered pinyin (cheng2 gong1) to tone marks (chéng gōng)
 */

const TONE_MARKS: Record<string, string[]> = {
  a: ['a', 'ā', 'á', 'ǎ', 'à', 'a'],
  e: ['e', 'ē', 'é', 'ě', 'è', 'e'],
  i: ['i', 'ī', 'í', 'ǐ', 'ì', 'i'],
  o: ['o', 'ō', 'ó', 'ǒ', 'ò', 'o'],
  u: ['u', 'ū', 'ú', 'ǔ', 'ù', 'u'],
  ü: ['ü', 'ǖ', 'ǘ', 'ǚ', 'ǜ', 'ü'],
  v: ['ü', 'ǖ', 'ǘ', 'ǚ', 'ǜ', 'ü'], // v is often used instead of ü
};

/**
 * Convert numbered pinyin to tone mark pinyin
 * Examples:
 *   cheng2 → chéng
 *   gong1 → gōng
 *   ni3 hao3 → nǐ hǎo
 */
export function convertNumberedPinyinToToneMarks(pinyin: string): string {
  if (!pinyin) return '';

  // Split by spaces to handle multiple syllables
  const syllables = pinyin.split(/\s+/);

  return syllables.map(syllable => convertSyllable(syllable)).join(' ');
}

function convertSyllable(syllable: string): string {
  // Match pinyin with tone number at the end
  const match = syllable.match(/^([a-züA-ZÜ]+?)([1-5])$/);

  if (!match) {
    // No tone number, return as is
    return syllable;
  }

  const [, letters, toneNumber] = match;
  const tone = parseInt(toneNumber, 10);

  // Find which vowel gets the tone mark
  // Rules: a and e always get the mark
  // ou: o gets the mark
  // For other combinations, the first vowel gets it
  const lowerLetters = letters.toLowerCase();

  // Priority order for tone placement
  if (lowerLetters.includes('a')) {
    return applyTone(letters, 'a', tone);
  }
  if (lowerLetters.includes('e')) {
    return applyTone(letters, 'e', tone);
  }
  if (lowerLetters.includes('ou')) {
    return applyTone(letters, 'o', tone);
  }

  // For iu, the second vowel gets the mark
  const iuMatch = lowerLetters.match(/iu/);
  if (iuMatch) {
    return applyTone(letters, 'u', tone);
  }

  // For ui, the second vowel gets the mark
  const uiMatch = lowerLetters.match(/ui/);
  if (uiMatch) {
    return applyTone(letters, 'i', tone);
  }

  // Otherwise, use first vowel found
  for (const vowel of ['o', 'u', 'ü', 'v', 'i']) {
    if (lowerLetters.includes(vowel)) {
      return applyTone(letters, vowel, tone);
    }
  }

  // No vowel found, return without tone number
  return letters;
}

function applyTone(letters: string, vowel: string, tone: number): string {
  const lowerLetters = letters.toLowerCase();
  const vowelIndex = lowerLetters.indexOf(vowel);

  if (vowelIndex === -1) return letters;

  const toneMarks = TONE_MARKS[vowel];
  if (!toneMarks) return letters;

  // Get the tone mark (tone 5 is neutral, use index 0 or 5)
  const toneMarkIndex = tone === 5 ? 0 : tone;
  const toneMark = toneMarks[toneMarkIndex];

  // Replace the vowel with tone mark
  const before = letters.substring(0, vowelIndex);
  const after = letters.substring(vowelIndex + 1);

  return before + toneMark + after;
}

/**
 * Batch convert multiple pinyin syllables separated by spaces
 */
export function convertPinyin(pinyin: string): string {
  return convertNumberedPinyinToToneMarks(pinyin);
}
