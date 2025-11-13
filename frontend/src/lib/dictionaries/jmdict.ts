import type { DictionaryResult } from '@/types';

/**
 * JMDict-based Japanese Dictionary
 * Provides O(1) lookup time using a Map-based index
 *
 * This implementation uses a simplified dictionary format based on JMDict.
 * For production, you can download the full JMDict JSON from:
 * https://github.com/scriptin/jmdict-simplified/releases
 */

// Dictionary entry structure
interface JMDictEntry {
  kanji?: string;       // Kanji writing (if exists)
  reading: string;      // Kana reading (hiragana/katakana)
  senses: Array<{
    gloss: string[];    // English definitions
    pos?: string[];     // Parts of speech
    info?: string[];    // Additional info
  }>;
  common?: boolean;     // Is this a common word?
  jlpt?: number;       // JLPT level (5=easiest, 1=hardest)
}

// Example sentence structure
interface ExampleSentence {
  japanese: string;
  english: string;
  source: string | null;
}

/**
 * Basic Japanese dictionary with common words
 * This is a starter set - extend with full JMDict data for production
 */
export const basicJapaneseDict: Record<string, JMDictEntry> = {
  // Pronouns
  '私': {
    kanji: '私',
    reading: 'わたし',
    senses: [{ gloss: ['I', 'me'], pos: ['pronoun'] }],
    common: true,
    jlpt: 5
  },
  'わたし': {
    reading: 'わたし',
    senses: [{ gloss: ['I', 'me'], pos: ['pronoun'] }],
    common: true,
    jlpt: 5
  },
  'あなた': {
    reading: 'あなた',
    senses: [{ gloss: ['you'], pos: ['pronoun'] }],
    common: true,
    jlpt: 5
  },
  '彼': {
    kanji: '彼',
    reading: 'かれ',
    senses: [{ gloss: ['he', 'him', 'boyfriend'], pos: ['pronoun', 'noun'] }],
    common: true,
    jlpt: 5
  },
  '彼女': {
    kanji: '彼女',
    reading: 'かのじょ',
    senses: [{ gloss: ['she', 'her', 'girlfriend'], pos: ['pronoun', 'noun'] }],
    common: true,
    jlpt: 5
  },

  // Verbs - Dictionary forms
  '食べる': {
    kanji: '食べる',
    reading: 'たべる',
    senses: [{ gloss: ['to eat'], pos: ['verb-ichidan'] }],
    common: true,
    jlpt: 5
  },
  '食べます': {
    kanji: '食べます',
    reading: 'たべます',
    senses: [{
      gloss: ['to eat (polite form)'],
      pos: ['verb-ichidan'],
      info: ['masu-form of 食べる']
    }],
    common: true,
    jlpt: 5
  },
  '食べ': {
    kanji: '食べ',
    reading: 'たべ',
    senses: [{
      gloss: ['eat (verb stem)'],
      pos: ['verb-ichidan'],
      info: ['stem form of 食べる (taberu) - to eat']
    }],
    common: true,
    jlpt: 5
  },
  '食べて': {
    kanji: '食べて',
    reading: 'たべて',
    senses: [{
      gloss: ['eating', 'eat and...'],
      pos: ['verb-ichidan'],
      info: ['te-form of 食べる']
    }],
    common: true,
    jlpt: 5
  },
  '食べた': {
    kanji: '食べた',
    reading: 'たべた',
    senses: [{
      gloss: ['ate', 'eaten'],
      pos: ['verb-ichidan'],
      info: ['past tense of 食べる']
    }],
    common: true,
    jlpt: 5
  },
  '食べ物': {
    kanji: '食べ物',
    reading: 'たべもの',
    senses: [{ gloss: ['food'], pos: ['noun'] }],
    common: true,
    jlpt: 5
  },
  '飲む': {
    kanji: '飲む',
    reading: 'のむ',
    senses: [{ gloss: ['to drink'], pos: ['verb-godan'] }],
    common: true,
    jlpt: 5
  },
  '行く': {
    kanji: '行く',
    reading: 'いく',
    senses: [{ gloss: ['to go'], pos: ['verb-godan'] }],
    common: true,
    jlpt: 5
  },
  '来る': {
    kanji: '来る',
    reading: 'くる',
    senses: [{ gloss: ['to come'], pos: ['verb-irregular'] }],
    common: true,
    jlpt: 5
  },
  'する': {
    reading: 'する',
    senses: [{ gloss: ['to do'], pos: ['verb-irregular'] }],
    common: true,
    jlpt: 5
  },
  '見る': {
    kanji: '見る',
    reading: 'みる',
    senses: [{ gloss: ['to see', 'to watch'], pos: ['verb-ichidan'] }],
    common: true,
    jlpt: 5
  },
  '読む': {
    kanji: '読む',
    reading: 'よむ',
    senses: [{ gloss: ['to read'], pos: ['verb-godan'] }],
    common: true,
    jlpt: 5
  },
  '書く': {
    kanji: '書く',
    reading: 'かく',
    senses: [{ gloss: ['to write'], pos: ['verb-godan'] }],
    common: true,
    jlpt: 5
  },
  '話す': {
    kanji: '話す',
    reading: 'はなす',
    senses: [{ gloss: ['to speak', 'to talk'], pos: ['verb-godan'] }],
    common: true,
    jlpt: 5
  },
  '聞く': {
    kanji: '聞く',
    reading: 'きく',
    senses: [{ gloss: ['to hear', 'to listen', 'to ask'], pos: ['verb-godan'] }],
    common: true,
    jlpt: 5
  },
  '勉強する': {
    kanji: '勉強する',
    reading: 'べんきょうする',
    senses: [{ gloss: ['to study'], pos: ['verb-suru'] }],
    common: true,
    jlpt: 5
  },

  // Nouns
  '日本': {
    kanji: '日本',
    reading: 'にほん',
    senses: [{ gloss: ['Japan'], pos: ['noun'] }],
    common: true,
    jlpt: 5
  },
  '学生': {
    kanji: '学生',
    reading: 'がくせい',
    senses: [{ gloss: ['student'], pos: ['noun'] }],
    common: true,
    jlpt: 5
  },
  '先生': {
    kanji: '先生',
    reading: 'せんせい',
    senses: [{ gloss: ['teacher', 'professor'], pos: ['noun'] }],
    common: true,
    jlpt: 5
  },
  '学校': {
    kanji: '学校',
    reading: 'がっこう',
    senses: [{ gloss: ['school'], pos: ['noun'] }],
    common: true,
    jlpt: 5
  },
  '友達': {
    kanji: '友達',
    reading: 'ともだち',
    senses: [{ gloss: ['friend'], pos: ['noun'] }],
    common: true,
    jlpt: 5
  },
  '本': {
    kanji: '本',
    reading: 'ほん',
    senses: [{ gloss: ['book'], pos: ['noun', 'counter'] }],
    common: true,
    jlpt: 5
  },
  '時間': {
    kanji: '時間',
    reading: 'じかん',
    senses: [{ gloss: ['time', 'hour'], pos: ['noun'] }],
    common: true,
    jlpt: 5
  },
  '今日': {
    kanji: '今日',
    reading: 'きょう',
    senses: [{ gloss: ['today'], pos: ['noun'] }],
    common: true,
    jlpt: 5
  },
  '明日': {
    kanji: '明日',
    reading: 'あした',
    senses: [{ gloss: ['tomorrow'], pos: ['noun'] }],
    common: true,
    jlpt: 5
  },
  '昨日': {
    kanji: '昨日',
    reading: 'きのう',
    senses: [{ gloss: ['yesterday'], pos: ['noun'] }],
    common: true,
    jlpt: 5
  },

  // Particles (essential for Japanese)
  'は': {
    reading: 'は',
    senses: [{
      gloss: ['topic marker'],
      pos: ['particle'],
      info: ['Indicates the topic of the sentence; also used for contrast']
    }],
    common: true,
    jlpt: 5
  },
  'が': {
    reading: 'が',
    senses: [{
      gloss: ['subject marker'],
      pos: ['particle'],
      info: ['Indicates the subject; also used for emphasis or contrast']
    }],
    common: true,
    jlpt: 5
  },
  'を': {
    reading: 'を',
    senses: [{
      gloss: ['object marker'],
      pos: ['particle'],
      info: ['Indicates the direct object of an action']
    }],
    common: true,
    jlpt: 5
  },
  'に': {
    reading: 'に',
    senses: [{
      gloss: ['to', 'at', 'in', 'on'],
      pos: ['particle'],
      info: ['Indicates location, time, direction, or indirect object']
    }],
    common: true,
    jlpt: 5
  },
  'で': {
    reading: 'で',
    senses: [{
      gloss: ['at', 'in', 'by means of'],
      pos: ['particle'],
      info: ['Indicates location of action or means/method']
    }],
    common: true,
    jlpt: 5
  },
  'と': {
    reading: 'と',
    senses: [{
      gloss: ['and', 'with'],
      pos: ['particle'],
      info: ['Connects nouns, indicates accompaniment, or marks quotations']
    }],
    common: true,
    jlpt: 5
  },
  'の': {
    reading: 'の',
    senses: [{
      gloss: ['possessive particle', 'nominalizer'],
      pos: ['particle'],
      info: ['Shows possession (like \'s in English) or turns phrases into nouns']
    }],
    common: true,
    jlpt: 5
  },
  'か': {
    reading: 'か',
    senses: [{
      gloss: ['question marker'],
      pos: ['particle'],
      info: ['Placed at the end of a sentence to form a question']
    }],
    common: true,
    jlpt: 5
  },
  'も': {
    reading: 'も',
    senses: [{
      gloss: ['also', 'too'],
      pos: ['particle'],
      info: ['Indicates "also" or "too"']
    }],
    common: true,
    jlpt: 5
  },
  'ね': {
    reading: 'ね',
    senses: [{
      gloss: ['right?', 'isn\'t it?'],
      pos: ['particle'],
      info: ['Sentence-ending particle seeking confirmation or agreement']
    }],
    common: true,
    jlpt: 5
  },
  'よ': {
    reading: 'よ',
    senses: [{
      gloss: ['emphasis particle'],
      pos: ['particle'],
      info: ['Sentence-ending particle for emphasis or assertion']
    }],
    common: true,
    jlpt: 5
  },

  // Adjectives
  '大きい': {
    kanji: '大きい',
    reading: 'おおきい',
    senses: [{ gloss: ['big', 'large'], pos: ['i-adjective'] }],
    common: true,
    jlpt: 5
  },
  '小さい': {
    kanji: '小さい',
    reading: 'ちいさい',
    senses: [{ gloss: ['small', 'little'], pos: ['i-adjective'] }],
    common: true,
    jlpt: 5
  },
  '良い': {
    kanji: '良い',
    reading: 'よい',
    senses: [{ gloss: ['good'], pos: ['i-adjective'] }],
    common: true,
    jlpt: 5
  },
  'いい': {
    reading: 'いい',
    senses: [{ gloss: ['good'], pos: ['i-adjective'], info: ['Colloquial form of 良い (yoi)'] }],
    common: true,
    jlpt: 5
  },
  '悪い': {
    kanji: '悪い',
    reading: 'わるい',
    senses: [{ gloss: ['bad'], pos: ['i-adjective'] }],
    common: true,
    jlpt: 5
  },
  '新しい': {
    kanji: '新しい',
    reading: 'あたらしい',
    senses: [{ gloss: ['new'], pos: ['i-adjective'] }],
    common: true,
    jlpt: 5
  },
  '古い': {
    kanji: '古い',
    reading: 'ふるい',
    senses: [{ gloss: ['old'], pos: ['i-adjective'] }],
    common: true,
    jlpt: 5
  },

  // Common phrases
  'こんにちは': {
    reading: 'こんにちは',
    senses: [{ gloss: ['hello', 'good afternoon'], pos: ['interjection'] }],
    common: true,
    jlpt: 5
  },
  'ありがとう': {
    reading: 'ありがとう',
    senses: [{ gloss: ['thank you'], pos: ['interjection'] }],
    common: true,
    jlpt: 5
  },
  'すみません': {
    reading: 'すみません',
    senses: [{ gloss: ['excuse me', 'sorry'], pos: ['interjection'] }],
    common: true,
    jlpt: 5
  },
};

/**
 * Cache for full JMDict dictionary (loaded lazily)
 */
let fullJMDictCache: Record<string, JMDictEntry> | null = null;
let fullDictLoadingPromise: Promise<void> | null = null;

/**
 * Cache for example sentences (loaded lazily)
 */
let examplesCache: Record<string, ExampleSentence[]> | null = null;
let examplesLoadingPromise: Promise<void> | null = null;

/**
 * Loads the full JMDict dictionary from JSON file
 * This function loads the dictionary lazily in the background
 */
async function loadFullJMDict(): Promise<void> {
  if (fullJMDictCache || fullDictLoadingPromise) {
    return fullDictLoadingPromise || Promise.resolve();
  }

  fullDictLoadingPromise = (async () => {
    try {
      console.log('Loading full JMDict dictionary...');

      // In production, load from a pre-processed JSON file
      // For now, we'll use the basic dictionary
      // TODO: Download and process full JMDict JSON from:
      // https://github.com/scriptin/jmdict-simplified/releases/latest

      const response = await fetch('/data/jmdict-indexed.json');

      if (response.ok) {
        const data = await response.json();
        fullJMDictCache = data;
        if (fullJMDictCache) {
          console.log(`Full JMDict loaded: ${Object.keys(fullJMDictCache).length} entries`);
        }
      } else {
        console.warn('Full JMDict not available, using basic dictionary only');
      }
    } catch (error) {
      console.warn('Error loading full JMDict:', error);
      console.log('Falling back to basic dictionary');
    }
  })();

  return fullDictLoadingPromise;
}

/**
 * Loads the example sentences from JSON file
 * This function loads the examples lazily in the background
 */
async function loadExamples(): Promise<void> {
  if (examplesCache || examplesLoadingPromise) {
    return examplesLoadingPromise || Promise.resolve();
  }

  examplesLoadingPromise = (async () => {
    try {
      console.log('Loading Japanese example sentences...');

      const response = await fetch('/data/japanese-examples.json');

      if (response.ok) {
        const data = await response.json();
        examplesCache = data;
        if (examplesCache) {
          console.log(`Examples loaded: ${Object.keys(examplesCache).length} words with examples`);
        }
      } else {
        console.warn('Examples file not available');
      }
    } catch (error) {
      console.warn('Error loading examples:', error);
    }
  })();

  return examplesLoadingPromise;
}

/**
 * Gets a dictionary entry with O(1) lookup
 * Merges data from both dictionaries - uses full dictionary for definitions,
 * and basic dictionary for JLPT levels
 */
function getDictEntry(word: string): JMDictEntry | null {
  let entry: JMDictEntry | null = null;

  // Try full dictionary first (has more complete definitions)
  if (fullJMDictCache && fullJMDictCache[word]) {
    entry = fullJMDictCache[word];

    // Supplement with JLPT level from basic dictionary if available
    if (basicJapaneseDict[word]?.jlpt && !entry.jlpt) {
      entry = { ...entry, jlpt: basicJapaneseDict[word].jlpt };
    }

    return entry;
  }

  // Fall back to basic dictionary
  if (basicJapaneseDict[word]) {
    return basicJapaneseDict[word];
  }

  return null;
}

/**
 * Attempts to find dictionary form from conjugated verb
 * This is a simple heuristic - for production, use a proper morphological analyzer
 */
function tryFindDictionaryForm(word: string): JMDictEntry | null {
  // Common verb conjugation patterns
  const patterns = [
    // Masu-form: 食べます -> 食べる
    { pattern: /(.+)ます$/, replacement: '$1る' },
    // Te-form: 食べて -> 食べる
    { pattern: /(.+)て$/, replacement: '$1る' },
    // Ta-form: 食べた -> 食べる
    { pattern: /(.+)た$/, replacement: '$1る' },

    // Godan verb stems (五段動詞)
    // き stem: 聞き → 聞く, 書き → 書く
    { pattern: /(.+)き$/, replacement: '$1く' },
    // ぎ stem: 泳ぎ → 泳ぐ
    { pattern: /(.+)ぎ$/, replacement: '$1ぐ' },
    // し stem: 話し → 話す
    { pattern: /(.+)し$/, replacement: '$1す' },
    // ち stem: 待ち → 待つ
    { pattern: /(.+)ち$/, replacement: '$1つ' },
    // に stem: 死に → 死ぬ
    { pattern: /(.+)に$/, replacement: '$1ぬ' },
    // び stem: 遊び → 遊ぶ
    { pattern: /(.+)び$/, replacement: '$1ぶ' },
    // み stem: 読み → 読む
    { pattern: /(.+)み$/, replacement: '$1む' },
    // り stem: 帰り → 帰る, 作り → 作る
    { pattern: /(.+)り$/, replacement: '$1る' },
    // い stem: 買い → 買う
    { pattern: /(.+)い$/, replacement: '$1う' },

    // Ichidan verb stem: 食べ -> 食べる (if above patterns don't match)
    { pattern: /(.+)$/, replacement: '$1る' },
  ];

  for (const { pattern, replacement } of patterns) {
    if (pattern.test(word)) {
      const dictionaryForm = word.replace(pattern, replacement);
      const entry = getDictEntry(dictionaryForm);
      if (entry) {
        return entry;
      }
    }
  }

  return null;
}

/**
 * Main lookup function for Japanese words
 * Provides O(1) lookup time using indexed dictionary
 */
export async function lookupJapanese(word: string): Promise<DictionaryResult | null> {
  try {
    // Trigger loading of full dictionary if not already loaded/loading
    if (!fullJMDictCache && !fullDictLoadingPromise) {
      loadFullJMDict(); // Fire and forget - will be available for next lookup
    }

    // Trigger loading of examples if not already loaded/loading
    if (!examplesCache && !examplesLoadingPromise) {
      loadExamples(); // Fire and forget - will be available for next lookup
    }

    // Try to get entry from available dictionaries
    let entry = getDictEntry(word);

    // If not found and full dict is still loading, wait for it
    if (!entry && fullDictLoadingPromise && !fullJMDictCache) {
      await fullDictLoadingPromise;
      entry = getDictEntry(word);
    }

    // If still not found, try to find dictionary form from conjugation
    if (!entry) {
      entry = tryFindDictionaryForm(word);
    }

    // If we found an entry, build the result
    if (entry) {
      const primarySense = entry.senses[0];

      // Build definitions array
      const definitions = entry.senses.map(sense => ({
        meaning: sense.gloss.join(', '),
        partOfSpeech: sense.pos?.join(', ') || '',
      }));

      // Determine grammar notes
      let grammarNotes: string | undefined;
      if (primarySense.info && primarySense.info.length > 0) {
        grammarNotes = primarySense.info.join('; ');
      }

      // Get examples if available
      let examples: string[] | undefined;

      // If examples are still loading, wait for them to finish
      if (!examplesCache && examplesLoadingPromise) {
        await examplesLoadingPromise;
      }

      // Get examples for this word
      if (examplesCache && examplesCache[word]) {
        const wordExamples: ExampleSentence[] = examplesCache[word];
        examples = wordExamples.map(ex => `${ex.japanese}\n${ex.english}`);
      }

      return {
        word: entry.kanji || entry.reading,
        reading: entry.reading,
        definition: primarySense.gloss.join(', '),
        definitions,
        grammarNotes,
        usageNotes: primarySense.pos?.includes('particle') ? grammarNotes : undefined,
        jlptLevel: entry.jlpt,
        examples,
      };
    }

    // Word not found
    return null;
  } catch (error) {
    console.error('Error looking up Japanese word:', error);
    return {
      word,
      reading: '',
      definition: 'Unable to fetch definition. Please try again.',
    };
  }
}
