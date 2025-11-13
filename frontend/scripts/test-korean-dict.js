/**
 * Test Korean Dictionary Offline Lookup
 *
 * Simple script to verify the dictionary format and test lookups
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dictPath = path.join(__dirname, '../public/korean-dict.json');

console.log('🧪 Testing Korean Dictionary...\n');

// Check if file exists
if (!fs.existsSync(dictPath)) {
  console.error('❌ Dictionary file not found!');
  console.error(`   Expected: ${dictPath}`);
  console.error('\n   Run the conversion script first:');
  console.error('   node scripts/convert-korean-dict.js\n');
  process.exit(1);
}

// Load dictionary
console.log('📖 Loading dictionary...');
const dict = JSON.parse(fs.readFileSync(dictPath, 'utf-8'));

const totalEntries = Object.keys(dict).length;
console.log(`✅ Loaded ${totalEntries.toLocaleString()} entries\n`);

// Test words
const testWords = [
  '안녕',     // hello
  '가다',     // to go
  '하다',     // to do
  '먹다',     // to eat
  '사랑',     // love
  '학교',     // school
  '친구',     // friend
  '음식',     // food
  '물',       // water
  '책',       // book
  'annyeong', // romanization lookup
  'gada',     // romanization lookup
];

console.log('🔍 Testing word lookups:\n');

let successCount = 0;
let failCount = 0;

testWords.forEach(word => {
  const entry = dict[word];

  if (entry) {
    successCount++;
    const displayWord = entry.w || word; // Use Korean word if this is a romanization entry
    const shortDef = entry.d.length > 60 ? entry.d.substring(0, 60) + '...' : entry.d;

    console.log(`✅ ${word}`);
    console.log(`   Word: ${displayWord}`);
    console.log(`   Reading: ${entry.r}`);
    console.log(`   Definition: ${shortDef}`);
    console.log(`   POS: ${entry.p}`);
    console.log('');
  } else {
    failCount++;
    console.log(`❌ ${word} - Not found`);
    console.log('');
  }
});

// Statistics
console.log('━'.repeat(60));
console.log('📊 Test Results:\n');
console.log(`   Total tests: ${testWords.length}`);
console.log(`   ✅ Passed: ${successCount}`);
console.log(`   ❌ Failed: ${failCount}`);
console.log(`   Success rate: ${((successCount / testWords.length) * 100).toFixed(1)}%`);

// Dictionary statistics
console.log('\n📈 Dictionary Statistics:\n');
console.log(`   Total entries: ${totalEntries.toLocaleString()}`);

const fileStats = fs.statSync(dictPath);
const sizeMB = (fileStats.size / (1024 * 1024)).toFixed(2);
console.log(`   File size: ${sizeMB} MB`);
console.log(`   Average entry: ${(fileStats.size / totalEntries).toFixed(0)} bytes`);

// Count Korean vs Romanization entries
let koreanEntries = 0;
let romanizationEntries = 0;

for (const [key, value] of Object.entries(dict)) {
  if (value.w) {
    romanizationEntries++;
  } else {
    koreanEntries++;
  }
}

console.log(`   Korean entries: ${koreanEntries.toLocaleString()}`);
console.log(`   Romanization entries: ${romanizationEntries.toLocaleString()}`);

// Sample some random entries
console.log('\n🎲 Random sample entries:\n');

const allKeys = Object.keys(dict);
const sampleSize = 5;

for (let i = 0; i < sampleSize; i++) {
  const randomKey = allKeys[Math.floor(Math.random() * allKeys.length)];
  const entry = dict[randomKey];
  const shortDef = entry.d.length > 40 ? entry.d.substring(0, 40) + '...' : entry.d;

  console.log(`   ${randomKey}: ${entry.r} - ${shortDef}`);
}

console.log('\n✅ Dictionary test complete!\n');

if (failCount > 0) {
  console.log('⚠️  Some words were not found. This may be normal for:');
  console.log('   - Very rare words');
  console.log('   - Proper nouns');
  console.log('   - New/slang terms\n');
}

process.exit(failCount > 0 ? 1 : 0);
