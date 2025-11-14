#!/usr/bin/env node

/**
 * Parser for CC-CEDICT dictionary - JSON version
 * Creates a compressed JSON file for web loading
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

      // Primary definition is the first one, join others with semicolon
      const definition = definitions.join('; ');

      // Store under simplified Chinese (what users will look up)
      dictionary[simplified] = {
        p: pinyin.trim(), // shortened key to save space
        d: definition,     // shortened key to save space
      };

      // Also store traditional if different
      if (traditional !== simplified) {
        dictionary[traditional] = {
          p: pinyin.trim(),
          d: definition,
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
  console.log(`Dictionary size: ${Object.keys(dictionary).length} unique words`);

  // Write to output file as compact JSON
  console.log(`\nWriting to ${outputFile}...`);
  fs.writeFileSync(outputFile, JSON.stringify(dictionary), 'utf-8');

  const stats = fs.statSync(outputFile);
  console.log(`Output file size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
  console.log('Done!');
}

// Run the parser
const inputFile = path.join(__dirname, 'cedict_raw.txt');
const outputFile = path.join(__dirname, '../../../public/chinese-dict.json');

// Create public directory if it doesn't exist
const publicDir = path.dirname(outputFile);
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

parseCEDICT(inputFile, outputFile);
