/**
 * Convert Korean Dictionary from JSONL to Indexed JSON
 *
 * Input: korean-dict.jsonl (JSONL format from kaikki.org/wiktextract)
 * Output: korean-dict.json (Indexed JSON for O(1) lookups)
 *
 * Similar to Chinese dictionary conversion
 */

import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Input and output paths
const inputPath = path.join(__dirname, '../public/data/korean-dict.jsonl');
const outputPath = path.join(__dirname, '../public/korean-dict.json');

console.log('🔄 Converting Korean dictionary from JSONL to indexed JSON...');
console.log(`📖 Reading from: ${inputPath}`);

// Create indexed dictionary object
const indexedDict = {};
let lineCount = 0;
let errorCount = 0;

// Create read stream
const fileStream = fs.createReadStream(inputPath);
const rl = readline.createInterface({
  input: fileStream,
  crlfDelay: Infinity
});

rl.on('line', (line) => {
  lineCount++;

  try {
    const entry = JSON.parse(line);

    // Extract the Korean word (key is empty string "")
    const word = entry[''];

    if (!word) {
      errorCount++;
      return;
    }

    // Extract definitions
    const definitions = entry.d || [];
    if (definitions.length === 0) {
      errorCount++;
      return;
    }

    // Extract romanization/reading
    // The 'f' field contains forms including romanization
    // Usually the first form is the romanization
    const forms = entry.f || [];
    const romanization = forms.find(f => /^[a-zA-Z]/.test(f)) || '';

    // Extract parts of speech
    const partsOfSpeech = entry.p || [];

    // Create compact entry (similar to Chinese dict format)
    // Using short keys to minimize file size
    const dictEntry = {
      r: romanization,           // reading/romanization
      d: definitions.join('; '), // definitions joined
      p: partsOfSpeech.join(', ') // parts of speech
    };

    // Optional: Include IPA if available
    if (entry.i) {
      dictEntry.i = entry.i;
    }

    // Index by Korean word
    indexedDict[word] = dictEntry;

    // Also index by romanization for reverse lookups (optional)
    // This helps with searching by romanization
    if (romanization && romanization !== word) {
      // Only add if not already present (avoid overwriting)
      if (!indexedDict[romanization]) {
        indexedDict[romanization] = {
          ...dictEntry,
          w: word // Include original Korean word for reverse lookup
        };
      }
    }

  } catch (error) {
    errorCount++;
    if (errorCount <= 5) {
      console.error(`❌ Error parsing line ${lineCount}:`, error.message);
    }
  }

  // Progress indicator
  if (lineCount % 5000 === 0) {
    console.log(`   Processing... ${lineCount} entries`);
  }
});

rl.on('close', () => {
  const uniqueWords = Object.keys(indexedDict).length;

  console.log('\n📊 Conversion Summary:');
  console.log(`   Lines processed: ${lineCount.toLocaleString()}`);
  console.log(`   Unique entries: ${uniqueWords.toLocaleString()}`);
  console.log(`   Errors: ${errorCount.toLocaleString()}`);

  // Write to JSON file
  console.log(`\n💾 Writing to: ${outputPath}`);

  const jsonStr = JSON.stringify(indexedDict);
  fs.writeFileSync(outputPath, jsonStr, 'utf-8');

  const stats = fs.statSync(outputPath);
  const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);

  console.log(`\n✅ Conversion complete!`);
  console.log(`   Output size: ${sizeMB} MB`);
  console.log(`   Location: ${outputPath}`);
  console.log(`\n📈 Dictionary Statistics:`);
  console.log(`   Total entries: ${uniqueWords.toLocaleString()}`);
  console.log(`   Average entry size: ${(stats.size / uniqueWords).toFixed(0)} bytes`);

  // Sample entries for verification
  console.log(`\n🔍 Sample entries:`);
  const sampleWords = ['안녕', '가다', '하다', '먹다', '사랑'].filter(w => indexedDict[w]);
  sampleWords.forEach(word => {
    const entry = indexedDict[word];
    console.log(`   ${word}: ${entry.r} - ${entry.d.substring(0, 50)}...`);
  });

  console.log('\n🎉 Done! Dictionary is ready for use.');
});

rl.on('error', (error) => {
  console.error('❌ Error reading file:', error);
  process.exit(1);
});
