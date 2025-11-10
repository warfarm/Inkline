import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * Extract all unique words from articles in seed.sql
 */
function extractVocabulary() {
  const seedPath = join(__dirname, '../../supabase/seed.sql');
  const seedContent = readFileSync(seedPath, 'utf-8');

  // Extract all INSERT INTO articles statements
  const articleMatches = seedContent.matchAll(/INSERT INTO articles[^;]+;/gs);

  const chineseWords = new Set<string>();
  const japaneseWords = new Set<string>();

  for (const match of articleMatches) {
    const articleSQL = match[0];

    // Check language
    const isChinese = articleSQL.includes("'zh'");
    const isJapanese = articleSQL.includes("'ja'");

    // Extract segmented_content JSON
    const segmentedMatch = articleSQL.match(/segmented_content\s*=\s*'({[^']+})'/);
    if (!segmentedMatch) continue;

    try {
      const segmentedContent = JSON.parse(segmentedMatch[1].replace(/\\'/g, "'"));
      const words = segmentedContent.words || [];

      words.forEach((wordData: any) => {
        const word = wordData.text?.trim();
        if (word) {
          if (isChinese) {
            chineseWords.add(word);
          } else if (isJapanese) {
            japaneseWords.add(word);
          }
        }
      });
    } catch (error) {
      console.error('Error parsing segmented_content:', error);
    }
  }

  console.log('\n=== Chinese Words ===');
  console.log(`Total unique words: ${chineseWords.size}`);
  console.log('Words:', Array.from(chineseWords).sort().join(', '));

  console.log('\n=== Japanese Words ===');
  console.log(`Total unique words: ${japaneseWords.size}`);
  console.log('Words:', Array.from(japaneseWords).sort().join(', '));

  return { chineseWords: Array.from(chineseWords), japaneseWords: Array.from(japaneseWords) };
}

// Run the extraction
extractVocabulary();
