import type { DictionaryResult } from '@/types';

export async function lookupChinese(word: string): Promise<DictionaryResult | null> {
  try {
    const response = await fetch(
      `https://www.mdbg.net/chinese/dictionary?page=worddict&wdrst=0&wdqb=${encodeURIComponent(word)}`
    );

    if (!response.ok) {
      return {
        word,
        reading: '',
        definition: 'Dictionary lookup unavailable',
      };
    }

    return {
      word,
      reading: '',
      definition: 'Chinese dictionary integration coming soon',
    };
  } catch (error) {
    console.error('Error looking up Chinese word:', error);
    return null;
  }
}
