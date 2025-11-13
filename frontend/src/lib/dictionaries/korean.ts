import type { DictionaryResult } from '@/types';
import { detectConjugation } from '../segmentation/korean';

// Full dictionary cache (loaded on demand)
let fullKoreanDictCache: Record<string, { r: string; d: string; p: string; i?: string; w?: string }> | null = null;
let fullDictLoadingPromise: Promise<void> | null = null;

/**
 * Common Korean copulas and verb endings used as standalone words
 */
const COMMON_COPULAS: Record<string, {
  definition: string;
  grammarNotes: string;
  formalityLevel?: 'casual' | 'polite' | 'formal';
  examples: string[];
}> = {
  '이에요': {
    definition: 'to be (polite informal)',
    grammarNotes: 'Polite informal copula (이다). Used after nouns ending in consonants. Attaches to nouns to indicate "is/am/are". Part of the 해요체 (polite informal speech level).',
    formalityLevel: 'polite',
    examples: ['학생이에요 (I am a student)', '선생님이에요 (She is a teacher)'],
  },
  '예요': {
    definition: 'to be (polite informal, after vowels)',
    grammarNotes: 'Polite informal copula (이다). Used after nouns ending in vowels. Attaches to nouns to indicate "is/am/are". Part of the 해요체 (polite informal speech level).',
    formalityLevel: 'polite',
    examples: ['의사예요 (I am a doctor)', '친구예요 (She is a friend)'],
  },
  '입니다': {
    definition: 'to be (polite formal)',
    grammarNotes: 'Polite formal copula (이다). Used in formal situations. Attaches to nouns to indicate "is/am/are". Part of the 합니다체 (polite formal speech level).',
    formalityLevel: 'formal',
    examples: ['학생입니다 (I am a student)', '한국인입니다 (I am Korean)'],
  },
  '이야': {
    definition: 'to be (casual)',
    grammarNotes: 'Casual copula (이다). Used after nouns ending in consonants. Used in informal speech with friends or younger people.',
    formalityLevel: 'casual',
    examples: ['친구야 (It\'s a friend)', '책이야 (It\'s a book)'],
  },
  '야': {
    definition: 'to be (casual, after vowels)',
    grammarNotes: 'Casual copula (이다). Used after nouns ending in vowels. Used in informal speech with friends or younger people.',
    formalityLevel: 'casual',
    examples: ['나야 (It\'s me)', '여기야 (It\'s here)'],
  },
  '아니에요': {
    definition: 'to not be (polite informal)',
    grammarNotes: 'Negative polite informal copula. Means "is not", "am not", "are not". Used in polite conversation.',
    formalityLevel: 'polite',
    examples: ['학생이 아니에요 (I am not a student)', '여기가 아니에요 (This is not the place)'],
  },
  '아닙니다': {
    definition: 'to not be (polite formal)',
    grammarNotes: 'Negative polite formal copula. Means "is not", "am not", "are not". Used in formal situations.',
    formalityLevel: 'formal',
    examples: ['학생이 아닙니다 (I am not a student)', '사실이 아닙니다 (It is not true)'],
  },
};

/**
 * Common Korean particles with detailed grammar explanations
 * Similar to Japanese particles in jisho.ts
 */
const COMMON_PARTICLES: Record<string, {
  definition: string;
  grammarNotes: string;
  formalityLevel?: 'casual' | 'polite' | 'formal';
  examples: string[];
}> = {
  '은': {
    definition: 'topic marker (used after consonants)',
    grammarNotes: 'Topic marker that indicates the topic of the sentence. Used after nouns ending in consonants. Compare with 는 (used after vowels). Often implies contrast or new information.',
    examples: ['저는 학생입니다 (I am a student)', '책은 재미있어요 (The book is interesting)'],
  },
  '는': {
    definition: 'topic marker (used after vowels)',
    grammarNotes: 'Topic marker that indicates the topic of the sentence. Used after nouns ending in vowels. Compare with 은 (used after consonants). Often implies contrast.',
    examples: ['저는 학생이에요 (I am a student)', '사과는 빨개요 (The apple is red)'],
  },
  '이': {
    definition: 'subject marker (used after consonants)',
    grammarNotes: 'Subject marker that indicates the grammatical subject. Used after nouns ending in consonants. Compare with 가 (used after vowels). Emphasizes the subject.',
    examples: ['친구가 왔어요 (My friend came)', '책이 있어요 (There is a book)'],
  },
  '가': {
    definition: 'subject marker (used after vowels)',
    grammarNotes: 'Subject marker that indicates the grammatical subject. Used after nouns ending in vowels. Compare with 이 (used after consonants). Emphasizes the subject.',
    examples: ['비가 와요 (It is raining)', '저가 할게요 (I will do it)'],
  },
  '을': {
    definition: 'object marker (used after consonants)',
    grammarNotes: 'Object marker that indicates the direct object of a verb. Used after nouns ending in consonants. Compare with 를 (used after vowels).',
    examples: ['밥을 먹어요 (eat rice)', '책을 읽어요 (read a book)'],
  },
  '를': {
    definition: 'object marker (used after vowels)',
    grammarNotes: 'Object marker that indicates the direct object of a verb. Used after nouns ending in vowels. Compare with 을 (used after consonants).',
    examples: ['커피를 마셔요 (drink coffee)', '영화를 봐요 (watch a movie)'],
  },
  '에': {
    definition: 'location/time marker',
    grammarNotes: 'Indicates location (static), time, or direction. Used for "at", "in", "on", "to". For action locations, use 에서.',
    examples: ['학교에 가요 (go to school)', '집에 있어요 (be at home)', '3시에 만나요 (meet at 3 o\'clock)'],
  },
  '에서': {
    definition: 'location marker (for actions)',
    grammarNotes: 'Indicates the location where an action takes place. Used for "at", "in" (for actions). Compare with 에 (static location).',
    examples: ['도서관에서 공부해요 (study at the library)', '서울에서 살아요 (live in Seoul)'],
  },
  '에게': {
    definition: 'to (a person)',
    grammarNotes: 'Indicates the indirect object, meaning "to" or "for" a person. Used for people and animals. Compare with 한테 (casual).',
    formalityLevel: 'polite',
    examples: ['친구에게 전화해요 (call a friend)', '선생님에게 질문해요 (ask the teacher)'],
  },
  '한테': {
    definition: 'to (a person, casual)',
    grammarNotes: 'Casual form of 에게. Indicates the indirect object, meaning "to" a person. Used in informal speech.',
    formalityLevel: 'casual',
    examples: ['친구한테 말했어 (told a friend)', '엄마한테 물어봐 (ask mom)'],
  },
  '께': {
    definition: 'to (honorific)',
    grammarNotes: 'Honorific form of 에게/한테. Used when giving something to or speaking to someone of higher status.',
    formalityLevel: 'formal',
    examples: ['할아버지께 선물을 드려요 (give a gift to grandfather)', '선생님께 여쭤봐요 (ask the teacher - honorific)'],
  },
  '도': {
    definition: 'also, too, as well',
    grammarNotes: 'Inclusive particle meaning "also" or "too". Replaces subject/object markers (이/가, 을/를) but combines with other particles (에도, 에서도).',
    examples: ['저도 학생이에요 (I am also a student)', '중국어도 배워요 (also learn Chinese)'],
  },
  '만': {
    definition: 'only, just',
    grammarNotes: 'Exclusive particle meaning "only" or "just". Replaces subject/object markers but can combine with other particles.',
    examples: ['물만 마셔요 (drink only water)', '이것만 주세요 (give me only this)'],
  },
  '부터': {
    definition: 'from (starting point)',
    grammarNotes: 'Indicates the starting point in time or sequence. Often paired with 까지 (until).',
    examples: ['9시부터 시작해요 (start from 9 o\'clock)', '월요일부터 금요일까지 (from Monday to Friday)'],
  },
  '까지': {
    definition: 'until, to, up to',
    grammarNotes: 'Indicates the ending point in time, location, or extent. Often paired with 부터 (from).',
    examples: ['5시까지 공부해요 (study until 5 o\'clock)', '서울까지 가요 (go to Seoul)'],
  },
  '와': {
    definition: 'and, with (used after vowels)',
    grammarNotes: 'Connects two nouns meaning "and" or indicates accompaniment "with". Used after vowels. Compare with 과 (after consonants) and 하고 (casual).',
    examples: ['사과와 바나나 (apple and banana)', '친구와 영화를 봐요 (watch a movie with a friend)'],
  },
  '과': {
    definition: 'and, with (used after consonants)',
    grammarNotes: 'Connects two nouns meaning "and" or indicates accompaniment "with". Used after consonants. Compare with 와 (after vowels) and 하고 (casual).',
    examples: ['책과 펜 (book and pen)', '선생님과 대화해요 (talk with the teacher)'],
  },
  '하고': {
    definition: 'and, with (casual)',
    grammarNotes: 'Casual form of 와/과. Connects two nouns or indicates accompaniment. Used in informal speech.',
    formalityLevel: 'casual',
    examples: ['친구하고 놀아요 (hang out with friends)', '밥하고 김치 (rice and kimchi)'],
  },
  '으로': {
    definition: 'by means of, toward (used after consonants)',
    grammarNotes: 'Indicates direction, means/method, or material. Used after consonants ending in anything except ㄹ. Compare with 로.',
    examples: ['버스로 가요 (go by bus)', '오른쪽으로 가세요 (go to the right)'],
  },
  '로': {
    definition: 'by means of, toward (used after vowels/ㄹ)',
    grammarNotes: 'Indicates direction, means/method, or material. Used after vowels or ㄹ. Compare with 으로.',
    examples: ['비행기로 가요 (go by airplane)', '한국어로 말해요 (speak in Korean)'],
  },
  '의': {
    definition: 'possessive marker (\'s)',
    grammarNotes: 'Possessive particle similar to English "\'s" or "of". Often omitted in casual speech.',
    examples: ['저의 책 (my book)', '한국의 문화 (culture of Korea)'],
  },
  '보다': {
    definition: 'than (comparison)',
    grammarNotes: 'Comparison particle meaning "than". Used in comparative sentences with 더 (more).',
    examples: ['사과가 바나나보다 맛있어요 (apples are more delicious than bananas)'],
  },
  '처럼': {
    definition: 'like, as',
    grammarNotes: 'Indicates similarity, meaning "like" or "as". Similar to 같이.',
    examples: ['천사처럼 (like an angel)', '친구처럼 대해요 (treat like a friend)'],
  },
  '같이': {
    definition: 'together, like',
    grammarNotes: 'Can mean "together" or "like/as". Context-dependent. Similar to 처럼 for "like".',
    examples: ['같이 가요 (let\'s go together)', '꿈같이 (like a dream)'],
  },
  '마다': {
    definition: 'every, each',
    grammarNotes: 'Indicates "every" or "each" for recurring intervals or items.',
    examples: ['날마다 (every day)', '사람마다 (each person)'],
  },
  '밖에': {
    definition: 'only (with negation)',
    grammarNotes: 'Means "only" but must be used with negative verbs. Emphasizes limitation.',
    examples: ['이것밖에 없어요 (there is only this)', '5분밖에 안 걸려요 (it takes only 5 minutes)'],
  },
  '나': {
    definition: 'or, as many as',
    grammarNotes: 'Can mean "or" (choice) or indicate an approximate amount. 이나 used after consonants.',
    examples: ['커피나 차 (coffee or tea)', '10개나 먹었어요 (ate as many as 10)'],
  },
  '이나': {
    definition: 'or, as many as (after consonants)',
    grammarNotes: 'Variant of 나 used after consonants. Means "or" or indicates approximate amount.',
    examples: ['책이나 잡지 (book or magazine)', '100명이나 왔어요 (as many as 100 people came)'],
  },
};

/**
 * Load the full Korean dictionary (40k+ entries, ~8MB)
 * This is loaded lazily on first use and cached in memory
 * Can be called proactively to pre-warm the cache
 */
export async function loadFullKoreanDict(): Promise<void> {
  // If already loaded, return immediately
  if (fullKoreanDictCache) {
    return;
  }

  // If already loading, wait for that promise
  if (fullDictLoadingPromise) {
    return fullDictLoadingPromise;
  }

  // Start loading
  fullDictLoadingPromise = (async () => {
    try {
      console.log('[Korean Dict] Loading full Korean dictionary...');
      const response = await fetch('/korean-dict.json');

      if (!response.ok) {
        throw new Error(`Failed to load dictionary: ${response.status}`);
      }

      fullKoreanDictCache = await response.json();
      console.log(`[Korean Dict] Loaded ${Object.keys(fullKoreanDictCache!).length} entries`);
    } catch (error) {
      console.error('[Korean Dict] Failed to load full dictionary:', error);
      // Don't cache the error - allow retry on next lookup
      fullDictLoadingPromise = null;
    }
  })();

  return fullDictLoadingPromise;
}

/**
 * Cleans HTML and WikiLink markup from text
 * Removes <a rel="mwWikiLink"...> tags and other HTML
 * Uses DOMParser for safe HTML entity decoding and comprehensive tag removal
 */
function cleanWikiMarkup(text: string): string {
  if (!text) return '';

  // Use DOMParser to properly parse and extract text content
  // This handles all nested HTML tags automatically
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(`<!DOCTYPE html><body>${text}</body>`, 'text/html');

    // Get pure text content (no HTML tags at all)
    let cleaned = doc.body.textContent || '';

    // Clean up extra whitespace and normalize
    cleaned = cleaned.replace(/\s+/g, ' ').trim();

    // Remove parentheses that are empty or only contain whitespace
    cleaned = cleaned.replace(/\(\s*\)/g, '');

    return cleaned;
  } catch (error) {
    console.warn('Error parsing HTML:', error);

    // Fallback: manual cleaning if DOMParser fails
    let cleaned = text;

    // Remove all HTML tags completely
    cleaned = cleaned.replace(/<[^>]+>/g, ' ');

    // Decode common HTML entities
    cleaned = cleaned
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, ' ');

    // Clean up extra whitespace
    cleaned = cleaned.replace(/\s+/g, ' ').trim();

    // Remove empty parentheses
    cleaned = cleaned.replace(/\(\s*\)/g, '');

    return cleaned;
  }
}

/**
 * Attempts to fetch definition from Wiktionary API
 */
async function fetchFromWiktionary(word: string): Promise<DictionaryResult | null> {
  try {
    const url = `https://en.wiktionary.org/api/rest_v1/page/definition/${encodeURIComponent(word)}`;
    const response = await fetch(url, {
      signal: AbortSignal.timeout(5000)
    });

    if (!response.ok) return null;

    const data = await response.json();

    // Extract Korean definitions
    if (data.ko && data.ko.length > 0) {
      const koreanEntry = data.ko[0];
      const definitions = koreanEntry.definitions || [];

      if (definitions.length > 0) {
        // Clean HTML markup from all definitions
        const cleanedDefinitions = definitions.map((def: any) => ({
          meaning: cleanWikiMarkup(def.definition || ''),
          partOfSpeech: def.partOfSpeech,
        }));

        // Extract and clean examples if available
        const examples: string[] = [];
        definitions.forEach((def: any) => {
          if (def.examples && Array.isArray(def.examples)) {
            def.examples.forEach((example: string) => {
              const cleaned = cleanWikiMarkup(example);
              if (cleaned) {
                examples.push(cleaned);
              }
            });
          }
        });

        return {
          word: word,
          reading: '', // Wiktionary doesn't always provide romanization
          definition: cleanedDefinitions[0].meaning,
          definitions: cleanedDefinitions,
          examples: examples.length > 0 ? examples.slice(0, 3) : undefined, // Limit to 3 examples
        };
      }
    }

    return null;
  } catch (error) {
    console.warn('Wiktionary lookup failed:', error);
    return null;
  }
}

/**
 * Calls Supabase Edge Function for Korean dictionary lookup
 * Uses official Korean-English Dictionary API (krdict.korean.go.kr)
 */
async function fetchFromKoreanDict(word: string): Promise<DictionaryResult | null> {
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    if (!supabaseUrl) {
      console.warn('Supabase URL not configured');
      return null;
    }

    const edgeUrl = `${supabaseUrl}/functions/v1/korean-dict?word=${encodeURIComponent(word)}`;

    const response = await fetch(edgeUrl, {
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      signal: AbortSignal.timeout(8000)
    });

    if (!response.ok) {
      console.warn('Korean dictionary API failed:', response.status);
      return null;
    }

    const result = await response.json();

    // Clean HTML from Korean Dict API results
    if (result) {
      if (result.definition) {
        result.definition = cleanWikiMarkup(result.definition);
      }
      if (result.definitions && Array.isArray(result.definitions)) {
        result.definitions = result.definitions.map((def: any) => ({
          ...def,
          meaning: cleanWikiMarkup(def.meaning || ''),
        }));
      }
      if (result.examples && Array.isArray(result.examples)) {
        result.examples = result.examples.map((ex: string) => cleanWikiMarkup(ex));
      }
      if (result.usageNotes) {
        result.usageNotes = cleanWikiMarkup(result.usageNotes);
      }
      if (result.grammarNotes) {
        result.grammarNotes = cleanWikiMarkup(result.grammarNotes);
      }
    }

    return result;
  } catch (error) {
    console.warn('Korean dictionary Edge Function failed:', error);
    return null;
  }
}

/**
 * Common Korean family names for name detection
 */
const KOREAN_FAMILY_NAMES = [
  '김', '이', '박', '최', '정', '강', '조', '윤', '장', '임',
  '한', '오', '서', '신', '권', '황', '안', '송', '전', '홍',
  '유', '고', '문', '양', '손', '배', '백', '허', '남', '심',
  '노', '하', '곽', '성', '차', '주', '우', '구', '신', '민',
];

/**
 * Checks if a word appears to be a Korean proper noun (name)
 */
function isLikelyKoreanName(word: string): boolean {
  // Korean names are typically 2-4 characters
  if (word.length < 2 || word.length > 4) return false;

  // Check if first character is a common family name
  return KOREAN_FAMILY_NAMES.includes(word[0]);
}

/**
 * Main lookup function for Korean words
 * Checks particles first, then offline dictionary, then online APIs as fallback
 */
export async function lookupKorean(word: string): Promise<DictionaryResult | null> {
  try {
    // First check if it's a common copula/verb ending
    if (COMMON_COPULAS[word]) {
      const copulaInfo = COMMON_COPULAS[word];
      return {
        word: word,
        reading: '',
        definition: copulaInfo.definition,
        grammarNotes: copulaInfo.grammarNotes,
        formalityLevel: copulaInfo.formalityLevel,
        examples: copulaInfo.examples,
        definitions: [{
          meaning: copulaInfo.definition,
          partOfSpeech: 'copula',
        }],
      };
    }

    // Check if it's a common particle
    if (COMMON_PARTICLES[word]) {
      const particleInfo = COMMON_PARTICLES[word];
      return {
        word: word,
        reading: '', // Particles don't need romanization
        definition: particleInfo.definition,
        grammarNotes: particleInfo.grammarNotes,
        formalityLevel: particleInfo.formalityLevel,
        examples: particleInfo.examples,
        definitions: [{
          meaning: particleInfo.definition,
          partOfSpeech: 'particle',
        }],
      };
    }

    // Check if word has verb conjugation
    const conjugationInfo = detectConjugation(word);
    let baseWord = word;
    let conjugationResult = undefined;

    if (conjugationInfo) {
      // For 하다 verbs, the stem needs 하다 added (not just 다)
      // because 하 becomes 해 in conjugation
      // Example: 좋아해요 → stem "좋아" + "하다" = 좋아하다
      if (conjugationInfo.isHadaVerb) {
        baseWord = conjugationInfo.stem + '하다';
      } else {
        baseWord = conjugationInfo.stem + '다';
      }

      conjugationResult = {
        dictionaryForm: baseWord,
        conjugatedForm: word,
        conjugationType: conjugationInfo.type,
      };
    }

    // Try offline dictionary first
    let result: DictionaryResult | null = null;

    // Load full dictionary if not already loaded (lazy loading)
    if (!fullKoreanDictCache) {
      await loadFullKoreanDict();
    }

    // Check offline dictionary
    if (fullKoreanDictCache) {
      const entry = fullKoreanDictCache[baseWord] || fullKoreanDictCache[word];
      if (entry) {
        // Convert offline entry to DictionaryResult format
        const definitions = entry.d.split('; ').map(def => ({
          meaning: def,
          partOfSpeech: entry.p || '',
        }));

        result = {
          word: entry.w || word, // Use original word if this is a romanization entry
          reading: entry.r || '',
          definition: entry.d,
          definitions: definitions,
          conjugationInfo: conjugationResult,
        };

        // If entry has 'w' field, it means we looked up by romanization
        if (entry.w) {
          result.word = entry.w;
        }
      }
    }

    // Fallback to online APIs if offline dictionary didn't have the word
    if (!result) {
      // Try Korean dictionary API first (official source)
      result = await fetchFromKoreanDict(baseWord);

      // Fallback to Wiktionary
      if (!result) {
        result = await fetchFromWiktionary(baseWord);
      }
    }

    // If we found a result and had conjugation info, add it
    if (result && conjugationResult) {
      result.conjugationInfo = conjugationResult;
    }

    // If still no result, provide context-specific message
    if (!result) {
      const isName = isLikelyKoreanName(word);

      return {
        word: word,
        reading: '',
        definition: isName
          ? 'This appears to be a proper noun (name or place). Proper nouns typically don\'t have dictionary definitions.'
          : 'Definition not found. This word may be a proper noun, abbreviation, or not in the dictionary.',
        conjugationInfo: conjugationResult,
      };
    }

    return result;
  } catch (error) {
    console.error('Error looking up Korean word:', error);
    return {
      word,
      reading: '',
      definition: 'Unable to fetch definition. Please try again later.',
    };
  }
}

/**
 * Export common particles and copulas for use in other components
 */
export { COMMON_PARTICLES, COMMON_COPULAS };
