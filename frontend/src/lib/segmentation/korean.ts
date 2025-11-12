export interface SegmentedWord {
  text: string;
  start: number;
  end: number;
  reading?: string;
  particle?: string; // Attached particle if any
}

/**
 * Common Korean particles (조사) that attach to nouns and verbs
 * These will be detected and separated for better learning
 */
const KOREAN_PARTICLES = [
  // Subject/Topic markers
  '은', '는', '이', '가',
  // Object markers
  '을', '를',
  // Location/Direction markers
  '에', '에서', '에게', '한테', '께', '으로', '로',
  // Other common particles
  '도', '만', '부터', '까지', '와', '과', '하고', '의', '보다',
  '처럼', '같이', '마다', '밖에', '나', '이나', '라고', '이라고',
  // Verb endings (informal)
  '요', '어요', '아요', '여요',
];

/**
 * Common verb endings for conjugation detection
 */
const VERB_ENDINGS = [
  // Polite informal (해요체)
  '어요', '아요', '여요', '해요',
  // Polite formal (합니다체)
  '습니다', 'ㅂ니다',
  // Past tense
  '었어요', '았어요', '였어요', '했어요', '었습니다', '았습니다',
  // Present progressive
  '고 있어요', '고 있습니다',
  // Casual
  '어', '아', '여', '해',
];

/**
 * Checks if a character is a Korean Hangul character
 * @param char - The character to check
 * @returns true if the character is Hangul
 */
export function isHangul(char: string): boolean {
  const code = char.charCodeAt(0);
  return (
    (code >= 0xac00 && code <= 0xd7a3) || // Hangul Syllables
    (code >= 0x1100 && code <= 0x11ff) || // Hangul Jamo
    (code >= 0x3130 && code <= 0x318f) || // Hangul Compatibility Jamo
    (code >= 0xa960 && code <= 0xa97f) || // Hangul Jamo Extended-A
    (code >= 0xd7b0 && code <= 0xd7ff)    // Hangul Jamo Extended-B
  );
}

/**
 * Checks if a string contains any Korean characters
 * @param text - The text to check
 * @returns true if the text contains Korean characters
 */
export function hasKorean(text: string): boolean {
  return Array.from(text).some((char) => isHangul(char));
}

/**
 * Detects if a word ends with a particle and separates it
 * @param word - The word to check
 * @returns Object with stem and particle, or null if no particle found
 */
function detectParticle(word: string): { stem: string; particle: string } | null {
  if (word.length <= 1) return null;

  // Check for multi-character particles first (longest match)
  const multiCharParticles = KOREAN_PARTICLES.filter(p => p.length > 1).sort((a, b) => b.length - a.length);
  for (const particle of multiCharParticles) {
    if (word.endsWith(particle) && word.length > particle.length) {
      return {
        stem: word.slice(0, -particle.length),
        particle: particle,
      };
    }
  }

  // Check for single character particles
  const lastChar = word[word.length - 1];
  if (KOREAN_PARTICLES.includes(lastChar) && word.length > 1) {
    return {
      stem: word.slice(0, -1),
      particle: lastChar,
    };
  }

  return null;
}

/**
 * Segments Korean text into words
 * Korean naturally uses spaces between words, so we use space-based segmentation
 * with intelligent particle detection
 *
 * @param text - The Korean text to segment
 * @returns Array of segmented words with position information
 */
export function segmentKorean(text: string): SegmentedWord[] {
  if (!text) return [];

  const words: SegmentedWord[] = [];
  let currentPosition = 0;

  // Split by whitespace first (Korean uses spaces between words)
  const spaceSplit = text.split(/(\s+)/);

  for (const segment of spaceSplit) {
    // Skip empty segments
    if (!segment) continue;

    const start = currentPosition;
    const end = currentPosition + segment.length;

    // If it's whitespace, skip it (don't add to words array)
    if (/^\s+$/.test(segment)) {
      currentPosition = end;
      continue;
    }

    // Check if this word has an attached particle
    const particleInfo = detectParticle(segment);

    if (particleInfo && particleInfo.stem.length > 0) {
      // Add the stem
      const stemEnd = start + particleInfo.stem.length;
      words.push({
        text: particleInfo.stem,
        start: start,
        end: stemEnd,
      });

      // Add the particle as a separate word
      words.push({
        text: particleInfo.particle,
        start: stemEnd,
        end: end,
        particle: particleInfo.particle, // Mark it as a particle
      });
    } else {
      // Add the whole word
      words.push({
        text: segment,
        start: start,
        end: end,
      });
    }

    currentPosition = end;
  }

  return words;
}

/**
 * Detects verb conjugation patterns in Korean
 * @param word - The word to analyze
 * @returns Conjugation info if detected, null otherwise
 */
export function detectConjugation(word: string): {
  stem: string;
  ending: string;
  type: string;
} | null {
  // Check for common verb endings
  for (const ending of VERB_ENDINGS) {
    if (word.endsWith(ending) && word.length > ending.length) {
      let type = 'unknown';

      if (ending.includes('습니다') || ending.includes('ㅂ니다')) {
        type = 'polite-formal';
      } else if (ending.endsWith('요')) {
        type = 'polite-informal';
      } else if (ending === '어' || ending === '아' || ending === '여' || ending === '해') {
        type = 'casual';
      }

      // Determine if past tense
      if (ending.includes('었') || ending.includes('았') || ending.includes('였') || ending.includes('했')) {
        type = 'past-' + type;
      }

      return {
        stem: word.slice(0, -ending.length),
        ending: ending,
        type: type,
      };
    }
  }

  return null;
}

/**
 * Romanizes Korean text using Revised Romanization of Korean
 * This is a simplified version - for production, consider using a library
 * @param hangul - The Hangul text to romanize
 * @returns Romanized text
 */
export function romanizeKorean(_hangul: string): string {
  // This is a placeholder - actual implementation would need a proper romanization algorithm
  // or API call. For now, we'll rely on the dictionary API to provide romanization
  return '';
}
