import { segmentJapanese, type SegmentedWord as JapaneseWord } from './japanese';
import { segmentChinese, type SegmentedWord as ChineseWord } from './chinese';
import { segmentKorean, type SegmentedWord as KoreanWord } from './korean';
import type { Language } from '@/types';

export type SegmentedWord = JapaneseWord | ChineseWord | KoreanWord;

/**
 * Segments text based on the language
 * @param text - The text to segment
 * @param language - The language of the text ('ja', 'zh', or 'ko')
 * @returns Array of segmented words with position information
 */
export function segmentText(text: string, language: Language): SegmentedWord[] {
  if (language === 'ja') {
    return segmentJapanese(text);
  } else if (language === 'zh') {
    return segmentChinese(text);
  } else if (language === 'ko') {
    return segmentKorean(text);
  }

  return [];
}

export { segmentJapanese, segmentChinese, segmentKorean };
export { isKanji, hasKanji, extractKanji } from './japanese';
export { isHanzi, hasChinese } from './chinese';
export { isHangul, hasKorean, detectConjugation } from './korean';
