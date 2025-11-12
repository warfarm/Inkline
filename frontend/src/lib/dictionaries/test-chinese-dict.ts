/**
 * Test script for Chinese dictionary with full CC-CEDICT
 * Run with: npx tsx src/lib/dictionaries/test-chinese-dict.ts
 */

import { lookupChinese, loadFullChineseDict } from './chinese.js';

async function testDictionary() {
  console.log('=== Chinese Dictionary Test ===\n');

  // Test 1: Basic word from embedded dictionary
  console.log('Test 1: Basic word (学习)');
  const result1 = await lookupChinese('学习');
  console.log('Result:', result1);
  console.log('Character breakdown:', result1?.componentCharacters);
  console.log('');

  // Test 2: Word that needs full dictionary
  console.log('Test 2: Less common word (电脑)');
  const result2 = await lookupChinese('电脑');
  console.log('Result:', result2);
  console.log('');

  // Test 3: Pre-load full dictionary and test again
  console.log('Test 3: Pre-loading full dictionary...');
  await loadFullChineseDict();
  console.log('Full dictionary loaded!');
  console.log('');

  // Test 4: Complex word
  console.log('Test 4: Complex word (人工智能)');
  const result3 = await lookupChinese('人工智能');
  console.log('Result:', result3);
  console.log('Character breakdown:', result3?.componentCharacters);
  console.log('');

  // Test 5: Single character
  console.log('Test 5: Single character (爱)');
  const result4 = await lookupChinese('爱');
  console.log('Result:', result4);
  console.log('');

  // Test 6: Unknown word
  console.log('Test 6: Unknown word (测试词)');
  const result5 = await lookupChinese('测试词');
  console.log('Result:', result5);
  console.log('Character breakdown:', result5?.componentCharacters);
  console.log('');

  console.log('=== Tests Complete ===');
}

// For browser testing
if (typeof window !== 'undefined') {
  (window as any).testChineseDict = testDictionary;
  console.log('Run testChineseDict() in console to test the dictionary');
} else {
  // For Node.js testing (won't work without browser fetch)
  console.log('This test needs to run in a browser environment');
  console.log('Add this to your React component:');
  console.log('  import { testChineseDict } from "@/lib/dictionaries/test-chinese-dict";');
  console.log('  useEffect(() => { testChineseDict(); }, []);');
}

export { testDictionary };
