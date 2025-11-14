/**
 * Test script to verify Chinese example sentences are properly indexed
 * Run with: node testChineseExamples.js
 */

const fs = require('fs');
const path = require('path');

console.log('Testing Chinese Example Sentences Integration\n');

// Load the examples file
const examplesPath = path.join(__dirname, '..', '..', 'frontend', 'public', 'data', 'chinese-examples.json');
console.log(`Loading: ${examplesPath}\n`);

const examples = JSON.parse(fs.readFileSync(examplesPath, 'utf-8'));

// Test words
const testWords = ['学习', '中文', '朋友', '喜欢', '吃饭', '工作', '学校'];

console.log('='.repeat(70));
console.log('Example Sentences Test Results');
console.log('='.repeat(70));

testWords.forEach(word => {
  console.log(`\n📖 Word: ${word}`);

  if (examples[word]) {
    const wordExamples = examples[word];
    console.log(`   ✅ Found ${wordExamples.length} example(s):\n`);

    wordExamples.forEach((ex, idx) => {
      console.log(`   ${idx + 1}. ${ex.chinese}`);
      console.log(`      ${ex.pinyin}`);
      console.log(`      "${ex.english}"\n`);
    });
  } else {
    console.log('   ❌ No examples found\n');
  }
});

// Statistics
const totalWords = Object.keys(examples).length;
const totalExamples = Object.values(examples).reduce((sum, arr) => sum + arr.length, 0);
const avgExamples = (totalExamples / totalWords).toFixed(2);

console.log('='.repeat(70));
console.log('Statistics');
console.log('='.repeat(70));
console.log(`Total words with examples: ${totalWords.toLocaleString()}`);
console.log(`Total example associations: ${totalExamples.toLocaleString()}`);
console.log(`Average examples per word: ${avgExamples}`);
console.log(`File size: ${(fs.statSync(examplesPath).size / (1024 * 1024)).toFixed(2)} MB`);
console.log('='.repeat(70));

// Test a few random words
console.log('\n🎲 Random Sample (10 words):');
const allWords = Object.keys(examples);
for (let i = 0; i < 10; i++) {
  const randomWord = allWords[Math.floor(Math.random() * allWords.length)];
  const count = examples[randomWord].length;
  console.log(`   ${randomWord} - ${count} example${count > 1 ? 's' : ''}`);
}

console.log('\n✅ Test complete!\n');
