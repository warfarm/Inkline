// Convert JMDict simplified format to indexed format for O(1) lookups
const fs = require('fs');
const path = require('path');

console.log('📖 Converting JMDict to indexed format...\n');

// Read the JMDict file
const inputPath = path.join(__dirname, '../public/data/jmdict-common.json');
const outputPath = path.join(__dirname, '../public/data/jmdict-indexed.json');

console.log(`Reading from: ${inputPath}`);

const jmdict = JSON.parse(fs.readFileSync(inputPath, 'utf-8'));

console.log(`Version: ${jmdict.version}`);
console.log(`Dict Date: ${jmdict.dictDate}`);
console.log(`Total words in source: ${jmdict.words.length}\n`);

// Convert to indexed format
const indexed = {};
let entryCount = 0;

for (const word of jmdict.words) {
  // Index by kanji writings
  if (word.kanji && word.kanji.length > 0) {
    for (const kanjiEntry of word.kanji) {
      const key = kanjiEntry.text;

      indexed[key] = {
        kanji: key,
        reading: word.kana[0]?.text || '',
        senses: word.sense.map(s => ({
          gloss: s.gloss.map(g => g.text),
          pos: s.partOfSpeech || [],
          info: s.info || []
        })),
        common: kanjiEntry.common || false
      };

      entryCount++;
    }
  }

  // Index by kana readings
  for (const kanaEntry of word.kana) {
    const key = kanaEntry.text;

    // Only add if not already indexed (kanji takes priority)
    if (!indexed[key]) {
      indexed[key] = {
        reading: key,
        senses: word.sense.map(s => ({
          gloss: s.gloss.map(g => g.text),
          pos: s.partOfSpeech || [],
          info: s.info || []
        })),
        common: kanaEntry.common || false
      };

      entryCount++;
    }
  }
}

// Write indexed dictionary
console.log(`Writing to: ${outputPath}`);
fs.writeFileSync(outputPath, JSON.stringify(indexed));

console.log(`\n✅ Conversion complete!`);
console.log(`   Total indexed entries: ${Object.keys(indexed).length}`);
console.log(`   File size: ${(fs.statSync(outputPath).size / 1024 / 1024).toFixed(2)} MB`);
