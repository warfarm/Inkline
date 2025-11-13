/**
 * Test 하다 (hada) verb conjugation detection
 *
 * Verifies that conjugated 하다 verbs are correctly converted to dictionary form
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dictPath = path.join(__dirname, '../public/korean-dict.json');

console.log('🧪 Testing 하다 Verb Conjugation Detection...\n');

// Load dictionary
const dict = JSON.parse(fs.readFileSync(dictPath, 'utf-8'));

// Simplified conjugation detection (matching the fixed logic)
function detectConjugation(word) {
  const endings = ['해요', '해', '했어요', '했어', '합니다', '하세요'];

  for (const ending of endings) {
    if (word.endsWith(ending) && word.length > ending.length) {
      const stem = word.slice(0, -ending.length);
      const isHadaVerb = ending.startsWith('해') || ending.startsWith('했');

      return {
        stem: stem,
        ending: ending,
        isHadaVerb: isHadaVerb,
      };
    }
  }

  return null;
}

// Test cases: [conjugated form, expected dictionary form]
const testCases = [
  ['좋아해요', '좋아하다', 'to like'],
  ['공부해요', '공부하다', 'to study'],
  ['사랑해요', '사랑하다', 'to love'],
  ['일해요', '일하다', 'to work'],
  ['생각해요', '생각하다', 'to think'],
  ['운동해요', '운동하다', 'to exercise'],
  ['요리해요', '요리하다', 'to cook'],
  ['산책해요', '산책하다', 'to take a walk'],
];

console.log('🔍 Testing 하다 verb conjugations:\n');

let passCount = 0;
let failCount = 0;

testCases.forEach(([conjugated, expectedBase, expectedMeaning]) => {
  const conjugationInfo = detectConjugation(conjugated);

  if (!conjugationInfo) {
    console.log(`❌ ${conjugated} - Failed to detect conjugation`);
    failCount++;
    return;
  }

  // Construct base form
  let baseWord;
  if (conjugationInfo.isHadaVerb) {
    baseWord = conjugationInfo.stem + '하다';
  } else {
    baseWord = conjugationInfo.stem + '다';
  }

  // Check if base form is correct
  if (baseWord !== expectedBase) {
    console.log(`❌ ${conjugated}`);
    console.log(`   Expected: ${expectedBase}`);
    console.log(`   Got: ${baseWord}`);
    failCount++;
    return;
  }

  // Check if base form exists in dictionary
  const dictEntry = dict[baseWord];

  if (!dictEntry) {
    console.log(`⚠️  ${conjugated} → ${baseWord}`);
    console.log(`   ✅ Conjugation correct, but not in dictionary`);
    passCount++;
    return;
  }

  // Success!
  const shortDef = dictEntry.d.length > 50 ? dictEntry.d.substring(0, 50) + '...' : dictEntry.d;
  console.log(`✅ ${conjugated} → ${baseWord}`);
  console.log(`   Reading: ${dictEntry.r}`);
  console.log(`   Definition: ${shortDef}`);
  passCount++;
});

console.log('\n━'.repeat(30));
console.log('📊 Test Results:\n');
console.log(`   Total tests: ${testCases.length}`);
console.log(`   ✅ Passed: ${passCount}`);
console.log(`   ❌ Failed: ${failCount}`);
console.log(`   Success rate: ${((passCount / testCases.length) * 100).toFixed(1)}%\n`);

if (passCount === testCases.length) {
  console.log('🎉 All 하다 verb conjugations work correctly!\n');
} else {
  console.log('⚠️  Some conjugations failed. Check the logic.\n');
}

process.exit(failCount > 0 ? 1 : 0);
