import type { DictionaryResult } from '@/types';

interface JishoResponse {
  data: Array<{
    slug: string;
    japanese: Array<{
      word?: string;
      reading: string;
    }>;
    senses: Array<{
      english_definitions: string[];
      parts_of_speech: string[];
    }>;
  }>;
}

export async function lookupJapanese(word: string): Promise<DictionaryResult | null> {
  try {
    // Use CORS proxy for development
    // In production, you should set up your own backend API endpoint
    const apiUrl = `https://jisho.org/api/v1/search/words?keyword=${encodeURIComponent(word)}`;
    const corsProxy = 'https://api.allorigins.win/raw?url=';

    const response = await fetch(corsProxy + encodeURIComponent(apiUrl));

    if (!response.ok) {
      throw new Error('Failed to fetch from Jisho API');
    }

    const data: JishoResponse = await response.json();

    if (!data.data || data.data.length === 0) {
      return null;
    }

    const entry = data.data[0];
    const japanese = entry.japanese[0];
    const sense = entry.senses[0];

    return {
      word: japanese.word || japanese.reading,
      reading: japanese.reading,
      definition: sense.english_definitions.join(', '),
      example: undefined,
    };
  } catch (error) {
    console.error('Error looking up Japanese word:', error);
    return null;
  }
}
