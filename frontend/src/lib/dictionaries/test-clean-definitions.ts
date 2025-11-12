/**
 * Test script to verify definition cleaning works correctly
 */

// Example raw CC-CEDICT definition for 再
const rawDefinition = "again; once more; re-; further; beyond this point of time; (before an adjective) more; (followed by a number) another 5th, and not until then); more; how ... (followed by an adjective or verb, and then (usually) 也[ye3] or 都[dou1] for emphasis); (used to introduce additional information, as in 再則|再则[zai4 ze2], 再就是 [zai4 jiu4 shi4] etc); (literary) to reappear; to reoccur";

console.log('=== Definition Cleaning Test ===\n');

console.log('Original definition (raw CC-CEDICT):');
console.log(rawDefinition);
console.log('\n');

// Simulate the cleaning process
function cleanDefinition(definition: string, forCharacterBreakdown: boolean = false): string {
  let cleaned = definition;

  // Remove cross-references like [ye3], [dou1], [zai4 ze2]
  cleaned = cleaned.replace(/\[[\w\d\s]+\]/g, '');

  // Remove parenthetical notes for character breakdowns (too verbose)
  if (forCharacterBreakdown) {
    // Remove long parenthetical explanations
    cleaned = cleaned.replace(/\([^)]{20,}\)/g, '');
  }

  // Split by semicolon and take first 3-4 meanings for character breakdowns
  if (forCharacterBreakdown) {
    const meanings = cleaned.split(';').map(m => m.trim()).filter(m => m.length > 0);
    // Take first 3 meanings maximum for character breakdowns
    cleaned = meanings.slice(0, 3).join('; ');
  }

  // Clean up extra spaces and semicolons
  cleaned = cleaned.replace(/\s*;\s*;+/g, ';');
  cleaned = cleaned.replace(/;\s*$/, '');
  cleaned = cleaned.replace(/\s+/g, ' ');
  cleaned = cleaned.trim();

  return cleaned;
}

console.log('Cleaned for main definition:');
console.log(cleanDefinition(rawDefinition, false));
console.log('\n');

console.log('Cleaned for character breakdown:');
console.log(cleanDefinition(rawDefinition, true));
console.log('\n');

// Test more examples
const examples = [
  {
    word: '再',
    raw: rawDefinition,
  },
  {
    word: '生',
    raw: 'to be born; to give birth; life; to grow; raw; uncooked; student',
  },
  {
    word: '能',
    raw: 'can; to be able to; might; possibly; ability; (physics) energy',
  },
  {
    word: '源',
    raw: 'root; source; origin',
  },
];

console.log('=== Character Breakdown Examples ===\n');
examples.forEach(ex => {
  console.log(`${ex.word}: ${cleanDefinition(ex.raw, true)}`);
});

console.log('\n✅ Test complete!');
