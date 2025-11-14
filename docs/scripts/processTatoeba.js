/**
 * Process Tatoeba Chinese-English sentences and create an indexed JSON file
 *
 * Input: cmn_sen_db_2.tsv (Tab-separated: id, simplified, traditional, pinyin, english)
 * Output: chinese-examples.json (JSON object mapping words to example sentences)
 *
 * Format: {
 *   "学习": [
 *     { "chinese": "我每天学习中文。", "pinyin": "wǒ měi tiān xué xí zhōng wén.", "english": "I study Chinese every day." },
 *     ...
 *   ]
 * }
 */

const fs = require('fs');
const path = require('path');

// Configuration
const MAX_EXAMPLES_PER_WORD = 2; // Limit examples per word to keep file size manageable
const MIN_SENTENCE_LENGTH = 4; // Minimum characters in Chinese sentence
const MAX_SENTENCE_LENGTH = 20; // Maximum characters (prefer short, clear sentences)
const MIN_WORD_LENGTH = 2; // Only index 2+ character words (compound words)
const MAX_WORD_LENGTH = 3; // Only index up to 3-character words
const PRIORITIZE_COMMON_WORDS = true; // Prioritize shorter sentences for better examples

console.log('Processing Tatoeba Chinese-English sentences...\n');

// Read TSV file
const tsvPath = path.join(__dirname, 'cmn_sen_db_2.tsv');
const tsvContent = fs.readFileSync(tsvPath, 'utf-8');
const lines = tsvContent.trim().split('\n');

console.log(`Total sentences in TSV: ${lines.length}`);

// Index to store: word -> array of example sentences
const wordToExamples = {};
let processedCount = 0;
let skippedCount = 0;

// Process each sentence
for (const line of lines) {
  const parts = line.split('\t');

  if (parts.length !== 5) {
    skippedCount++;
    continue;
  }

  const [id, simplified, traditional, pinyin, english] = parts;

  // Skip if sentence is too short or too long
  const sentenceLength = simplified.length;
  if (sentenceLength < MIN_SENTENCE_LENGTH || sentenceLength > MAX_SENTENCE_LENGTH) {
    skippedCount++;
    continue;
  }

  // Skip sentences with poor English (very short translations often indicate issues)
  if (english.length < 3) {
    skippedCount++;
    continue;
  }

  // Create example object
  const example = {
    chinese: simplified,
    pinyin: pinyin.trim(),
    english: english.trim()
  };

  // Extract all substrings (words) from the simplified Chinese sentence
  // We'll index both individual characters and multi-character words
  const words = extractWords(simplified);

  // Prioritize this sentence for shorter words (better examples for learners)
  const sentencePriority = sentenceLength <= 15 ? 2 : 1;

  // Add this sentence to the index for each word it contains
  for (const word of words) {
    if (word.length < MIN_WORD_LENGTH || word.length > MAX_WORD_LENGTH) continue;

    if (!wordToExamples[word]) {
      wordToExamples[word] = [];
    }

    // Only add if we haven't reached the limit for this word
    const currentCount = wordToExamples[word].length;
    const maxForThisWord = MAX_EXAMPLES_PER_WORD * sentencePriority;

    if (currentCount < maxForThisWord) {
      // Check if this exact sentence is already added (avoid duplicates)
      const isDuplicate = wordToExamples[word].some(
        ex => ex.chinese === example.chinese
      );

      if (!isDuplicate) {
        wordToExamples[word].push(example);
      }
    }
  }

  processedCount++;

  // Progress indicator
  if (processedCount % 10000 === 0) {
    console.log(`Processed ${processedCount} sentences...`);
  }
}

console.log(`\nProcessed: ${processedCount} sentences`);
console.log(`Skipped: ${skippedCount} sentences`);

// Trim examples to max limit per word (in case priority gave some words more)
let trimmedCount = 0;
for (const word in wordToExamples) {
  if (wordToExamples[word].length > MAX_EXAMPLES_PER_WORD) {
    // Keep the shortest sentences as examples
    wordToExamples[word].sort((a, b) => a.chinese.length - b.chinese.length);
    wordToExamples[word] = wordToExamples[word].slice(0, MAX_EXAMPLES_PER_WORD);
    trimmedCount++;
  }
}

console.log(`Trimmed ${trimmedCount} words to max examples limit`);
console.log(`Unique words indexed: ${Object.keys(wordToExamples).length}`);

// Calculate stats
const totalExamples = Object.values(wordToExamples).reduce((sum, arr) => sum + arr.length, 0);
const avgExamplesPerWord = (totalExamples / Object.keys(wordToExamples).length).toFixed(2);
console.log(`Total example associations: ${totalExamples}`);
console.log(`Average examples per word: ${avgExamplesPerWord}`);

// Write to JSON file (minified to save space)
const outputPath = path.join(__dirname, '..', '..', 'frontend', 'public', 'data', 'chinese-examples.json');
fs.writeFileSync(outputPath, JSON.stringify(wordToExamples), 'utf-8');

const fileSizeInMB = (fs.statSync(outputPath).size / (1024 * 1024)).toFixed(2);
console.log(`\nOutput written to: ${outputPath}`);
console.log(`File size: ${fileSizeInMB} MB`);

console.log('\n✅ Done!');

/**
 * Extract all meaningful words/substrings from a Chinese sentence
 * This includes:
 * - 2-character combinations (most common word length)
 * - 3-character combinations
 *
 * We skip single characters and 4-char idioms to reduce file size.
 */
function extractWords(sentence) {
  const words = new Set();

  // Remove punctuation and non-Chinese characters for indexing
  const cleanSentence = sentence.replace(/[^\u4e00-\u9fff]/g, '');

  // Extract substrings of 2-3 characters
  for (let length = 2; length <= 3; length++) {
    for (let i = 0; i <= cleanSentence.length - length; i++) {
      const word = cleanSentence.substring(i, i + length);
      if (word.length === length) {
        words.add(word);
      }
    }
  }

  return Array.from(words);
}
