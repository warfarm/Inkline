#!/usr/bin/env node

/**
 * Parser for CC-CEDICT dictionary
 * Converts the raw CEDICT file into an optimized JavaScript format for O(1) lookups
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function parseCEDICT(inputFile, outputFile) {
  console.log('Reading CC-CEDICT file...');
  const content = fs.readFileSync(inputFile, 'utf-8');
  const lines = content.split('\n');

  const dictionary = {};
  let entryCount = 0;
  let skippedCount = 0;

  console.log(`Processing ${lines.length} lines...`);

  for (const line of lines) {
    // Skip comments and empty lines
    if (line.startsWith('#') || line.trim() === '') {
      continue;
    }

    try {
      // Parse line format: Traditional Simplified [pinyin] /definition1/definition2/
      // Example: 學習 学习 [xue2 xi2] /to study/to learn/

      const match = line.match(/^(\S+)\s+(\S+)\s+\[([^\]]+)\]\s+\/(.+)\/\s*$/);

      if (!match) {
        skippedCount++;
        continue;
      }

      const [, traditional, simplified, pinyin, definitionsRaw] = match;

      // Split definitions by / and clean them
      const definitions = definitionsRaw
        .split('/')
        .map(d => d.trim())
        .filter(d => d.length > 0);

      // Primary definition is the first one
      const definition = definitions.join('; ');

      // Store under simplified Chinese (what users will look up)
      dictionary[simplified] = {
        pinyin: pinyin.trim(),
        definition: definition,
      };

      // Also store traditional if different (for traditional Chinese text)
      if (traditional !== simplified) {
        dictionary[traditional] = {
          pinyin: pinyin.trim(),
          definition: definition,
        };
      }

      entryCount++;

      if (entryCount % 10000 === 0) {
        console.log(`Processed ${entryCount} entries...`);
      }
    } catch (error) {
      console.error(`Error parsing line: ${line}`, error);
      skippedCount++;
    }
  }

  console.log(`\nParsing complete!`);
  console.log(`Total entries: ${entryCount}`);
  console.log(`Skipped lines: ${skippedCount}`);
  console.log(`Dictionary size: ${Object.keys(dictionary).keys.length} unique words`);

  // Write to output file as TypeScript module
  console.log(`\nWriting to ${outputFile}...`);

  const output = `// Auto-generated from CC-CEDICT
// Total entries: ${entryCount}
// Generated: ${new Date().toISOString()}
// DO NOT EDIT MANUALLY

export const fullChineseDict: Record<string, { pinyin: string; definition: string }> = ${JSON.stringify(dictionary, null, 0)};
`;

  fs.writeFileSync(outputFile, output, 'utf-8');

  const stats = fs.statSync(outputFile);
  console.log(`Output file size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
  console.log('Done!');
}

// Run the parser
const inputFile = path.join(__dirname, 'cedict_raw.txt');
const outputFile = path.join(__dirname, 'chinese-dict-full.ts');

parseCEDICT(inputFile, outputFile);
