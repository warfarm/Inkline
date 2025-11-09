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
    const sense = entry.senses[0];

    return {
      word: japanese.word || japanese.reading,
      reading: japanese.reading,
      definition: sense.english_definitions.join(', '),
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
