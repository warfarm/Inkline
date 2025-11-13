/**
 * Process JMDict examples and create an optimized lookup index
 * This script extracts example sentences and creates a word-to-examples mapping
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Processing JMDict examples...');

// Read the JMDict examples file
const inputFile = path.join(__dirname, 'temp', 'jmdict-examples-eng-3.6.1.json');
const outputFile = path.join(__dirname, '..', 'public', 'data', 'japanese-examples.json');

console.log('Reading JMDict data...');
const data = JSON.parse(fs.readFileSync(inputFile, 'utf8'));

console.log(`Total entries: ${data.words.length}`);

// Create word-to-examples index
const examplesIndex = {};
let totalExamples = 0;
let entriesWithExamples = 0;

// Process each entry
data.words.forEach((entry, idx) => {
  if (idx % 10000 === 0) {
    console.log(`Processing entry ${idx}/${data.words.length}...`);
  }

  // Get all possible word forms (kanji and kana)
  const wordForms = new Set();

  // Add kanji forms
  entry.kanji.forEach(k => wordForms.add(k.text));

  // Add kana forms
  entry.kana.forEach(k => wordForms.add(k.text));

  // Process each sense (meaning)
  entry.sense.forEach(sense => {
    if (sense.examples && sense.examples.length > 0) {
      // Extract examples from this sense
      const examples = sense.examples.map(ex => {
        const jpSentence = ex.sentences.find(s => s.land === 'jpn');
        const enSentence = ex.sentences.find(s => s.land === 'eng');

        return {
          japanese: jpSentence?.text || '',
          english: enSentence?.text || '',
          source: ex.source?.value || null
        };
      }).filter(ex => ex.japanese && ex.english);

      if (examples.length > 0) {
        // Add examples for each word form
        wordForms.forEach(word => {
          if (!examplesIndex[word]) {
            examplesIndex[word] = [];
          }

          // Add examples (limit to 3 per word to keep file size down)
          examples.slice(0, 3).forEach(example => {
            // Avoid duplicates
            const isDuplicate = examplesIndex[word].some(
              existing => existing.japanese === example.japanese
            );
            if (!isDuplicate && examplesIndex[word].length < 3) {
              examplesIndex[word].push(example);
              totalExamples++;
            }
          });
        });

        entriesWithExamples++;
      }
    }
  });
});

console.log(`\nProcessing complete!`);
console.log(`Entries with examples: ${entriesWithExamples}`);
console.log(`Unique words with examples: ${Object.keys(examplesIndex).length}`);
console.log(`Total example sentences: ${totalExamples}`);

// Create output directory if it doesn't exist
const outputDir = path.dirname(outputFile);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Write optimized index to file
console.log(`\nWriting to ${outputFile}...`);
fs.writeFileSync(outputFile, JSON.stringify(examplesIndex, null, 0), 'utf8');

const stats = fs.statSync(outputFile);
console.log(`Output file size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
console.log('Done!');
