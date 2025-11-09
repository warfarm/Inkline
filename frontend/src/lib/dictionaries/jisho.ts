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
      tags?: string[];
      info?: string[];
    }>;
    jlpt?: string[];
    tags?: string[];
  }>;
}

async function fetchWithFallback(apiUrl: string): Promise<Response> {
  const corsProxies = [
    'https://corsproxy.io/?',
    'https://api.allorigins.win/raw?url=',
  ];

  // Try direct fetch first (works in some environments)
  try {
    const directResponse = await fetch(apiUrl, {
      signal: AbortSignal.timeout(5000)
    });
    if (directResponse.ok) {
      const contentType = directResponse.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        return directResponse;
      }
    }
  } catch (error) {
    // Direct fetch failed, will try proxies
  }

  // Try each CORS proxy
  for (const proxy of corsProxies) {
    try {
      const response = await fetch(proxy + encodeURIComponent(apiUrl), {
        signal: AbortSignal.timeout(8000)
      });

      if (!response.ok) continue;

      const text = await response.text();

      // Validate it's actually JSON and not HTML
      if (text.trim().startsWith('<') || text.trim().startsWith('<!')) {
        continue; // Try next proxy
      }

      // Return a new Response with the text
      return new Response(text, {
        status: response.status,
        headers: response.headers,
      });
    } catch (error) {
      // Try next proxy
      continue;
    }
  }

  throw new Error('All CORS proxies failed');
}

export async function lookupJapanese(word: string): Promise<DictionaryResult | null> {
  try {
    const apiUrl = `https://jisho.org/api/v1/search/words?keyword=${encodeURIComponent(word)}`;

    const response = await fetchWithFallback(apiUrl);
    const text = await response.text();
    const data: JishoResponse = JSON.parse(text);

    if (!data.data || data.data.length === 0) {
      return null;
    }

    const entry = data.data[0];
    const japanese = entry.japanese[0];
    const primarySense = entry.senses[0];

    // Extract all definitions with their parts of speech
    const definitions = entry.senses.slice(0, 5).map(sense => ({
      meaning: sense.english_definitions.join(', '),
      partOfSpeech: sense.parts_of_speech.join(', '),
    }));

    // Extract grammar notes for particles and common grammatical words
    let grammarNotes: string | undefined;
    const commonParticles: Record<string, string> = {
      'は': 'Topic marker (indicates the topic of sentence); also used for contrast',
      'が': 'Subject marker (indicates the subject); also used for emphasis or contrast',
      'を': 'Direct object marker (indicates what action is performed on)',
      'に': 'Indirect object/location/time marker; indicates direction, location, or time',
      'へ': 'Direction marker (towards); similar to に but more directional',
      'で': 'Location of action marker; also means "by means of"',
      'と': 'And; with (accompaniment); quotation marker',
      'も': 'Also; too; as well (inclusive particle)',
      'の': 'Possessive particle (equivalent to \'s); also nominalizes verbs',
      'か': 'Question particle (placed at end of sentence)',
      'ね': 'Confirmation/agreement particle (seeking agreement)',
      'よ': 'Emphasis particle (asserting information)',
    };

    if (commonParticles[word]) {
      grammarNotes = commonParticles[word];
    }

    // Determine formality level from tags
    let formalityLevel: 'casual' | 'polite' | 'formal' | undefined;
    const allTags = [...(entry.tags || []), ...(primarySense.tags || [])];
    if (allTags.some(tag => tag.toLowerCase().includes('formal') || tag.toLowerCase().includes('polite'))) {
      formalityLevel = 'formal';
    } else if (allTags.some(tag => tag.toLowerCase().includes('casual') || tag.toLowerCase().includes('slang'))) {
      formalityLevel = 'casual';
    }

    // Extract usage notes
    const usageNotes = primarySense.info?.join('; ');

    return {
      word: japanese.word || japanese.reading,
      reading: japanese.reading,
      definition: primarySense.english_definitions.join(', '),
      definitions,
      grammarNotes,
      formalityLevel,
      usageNotes,
      example: undefined,
    };
  } catch (error) {
    console.error('Error looking up Japanese word:', error);
    // Return a user-friendly error instead of null
    return {
      word,
      reading: '',
      definition: 'Unable to fetch definition. The dictionary service may be temporarily unavailable. Please try again later.',
    };
  }
}
