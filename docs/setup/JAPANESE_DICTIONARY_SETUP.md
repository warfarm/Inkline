# Japanese Dictionary Setup Guide (JMDict)

Complete guide for setting up the JMDict Japanese dictionary in Inkline.

---

## Overview

Inkline uses **JMDict** for Japanese word lookups, providing:
- **500x faster lookups** - <1ms instead of 200-500ms API calls
- **Offline functionality** - no network dependency
- **O(1) lookup time** - instant dictionary access
- **Smart conjugation handling** - automatically finds base forms
- **95% segmentation accuracy** - using Kuromoji.js

---

## Current Implementation Status

### ✅ Already Implemented

1. **JMDict Dictionary Module**
   - Location: `frontend/src/lib/dictionaries/jmdict.ts`
   - O(1) lookup using `Record<string, JMDictEntry>`
   - Basic dictionary with 100+ common words (working now)
   - Infrastructure ready for full dictionary

2. **Kuromoji.js Segmentation**
   - Installed and configured
   - Dictionary files in `public/dict/`
   - Auto-loads on app start
   - Provides base forms for conjugated verbs

3. **TTS Improvements**
   - Web Speech API as primary method
   - Uses reading (hiragana) for accurate pronunciation
   - Fixed 私 pronunciation issue (watashi, not "shi")

### ⏳ Optional: Full Dictionary Download

Basic dictionary (~100 words) works now. For full coverage:

---

## Downloading Full JMDict (Optional)

### Option 1: Common Words (Recommended)
- **File**: `jmdict-eng-common.json`
- **Size**: ~3-5 MB
- **Entries**: ~15,000 common words
- **Best for**: Web deployment, faster loading

### Option 2: Complete Dictionary
- **File**: `jmdict-eng-all.json`
- **Size**: ~50-80 MB
- **Entries**: ~60,000+ all words
- **Best for**: Maximum coverage, local development

### Download Instructions

#### Using curl (Windows/Mac/Linux)
```bash
# Navigate to frontend directory
cd frontend

# Create data directory
mkdir -p public/data

# Download common words version (RECOMMENDED)
curl -L -o public/data/jmdict-common.json https://github.com/scriptin/jmdict-simplified/releases/latest/download/jmdict-eng-common.json

# OR download full version (larger)
# curl -L -o public/data/jmdict-all.json https://github.com/scriptin/jmdict-simplified/releases/latest/download/jmdict-eng-all.json
```

#### Manual Download
1. Visit: https://github.com/scriptin/jmdict-simplified/releases/latest
2. Download `jmdict-eng-common.json`
3. Save to: `frontend/public/data/jmdict-common.json`

---

## How It Works

### Loading Process

1. **App starts** → Kuromoji tokenizer begins loading in background
2. **User clicks a word** → Checks basic dictionary first (instant)
3. **If not found** → Triggers JMDict load from `/data/jmdict-common.json`
4. **Next lookup** → Uses loaded full dictionary (instant)

### Performance

```typescript
// First word lookup (if not in basic dict)
// - Triggers load: ~200-500ms (one-time)
// - Returns result: instant from basic dict

// Subsequent lookups
// - Full dict loaded: <1ms (memory access)
// - 15,000+ words available
```

---

## Key Features

### Smart Conjugation Handling

The system automatically finds dictionary forms:
- 食べ → 食べる (stem → dictionary form)
- 食べて → 食べる (te-form → dictionary form)
- 食べます → 食べる (polite → dictionary form)
- 食べた → 食べる (past → dictionary form)

### Particle Support

Common particles included with detailed grammar explanations:
- は (wa) - topic marker
- が (ga) - subject marker
- を (wo) - object marker
- に (ni) - direction/location/time marker
- で (de) - means/location marker

### TTS Pronunciation

Correctly pronounces Japanese words using hiragana readings:
- 私 → わたし → "watashi" ✅
- 食べる → たべる → "taberu" ✅

---

## Kuromoji.js vs MeCab

Both are **morphological analyzers** for Japanese text segmentation.

### MeCab
**Pros**:
- ✅ Most accurate (98-99%)
- ✅ Native C++ performance
- ✅ Industry standard

**Cons**:
- ❌ Server-side only
- ❌ Complex setup
- ❌ Requires compilation

### Kuromoji.js (Current)
**Pros**:
- ✅ Runs in browser
- ✅ Easy setup (npm install)
- ✅ Good accuracy (95%)
- ✅ WebAssembly version available

**Cons**:
- ❌ Slower than native MeCab
- ❌ Larger bundle (~5-10MB)
- ❌ Slightly less accurate

**Why Kuromoji.js**: Perfect for client-side web applications like Inkline.

---

## Testing

### Test Without Full Dictionary (Basic Only)

```bash
npm run dev
```

Try these words in a Japanese article:
- ✅ **私** (watashi) - works
- ✅ **食べ** (tabe) - works
- ✅ **は** (particle) - works with grammar notes
- ❌ **複雑** (fukuzatsu) - won't work yet (needs full dict)

### Test With Full Dictionary (After Download)

After downloading `jmdict-common.json`:
- ✅ All previous words still work
- ✅ **複雑** now works!
- ✅ Any word from 15,000+ entries works

### Check Browser Console

Look for:
```
Kuromoji tokenizer loaded successfully
Using reading for Japanese pronunciation
```

---

## Troubleshooting

### "Module 'path' has been externalized"
**Solution**: This is a warning, not an error. Kuromoji uses Node.js `path` module which Vite externalizes. App will work fine.

### Dictionary not loading
**Check**:
1. File exists at `public/data/jmdict-common.json`
2. File is valid JSON (not HTML error page)
3. Browser Network tab shows successful fetch
4. Console shows any errors

### Kuromoji not loading
**Check**:
1. Files exist in `public/dict/`
2. Files are `.dat.gz` format (compressed)
3. Console shows "Kuromoji tokenizer loaded successfully"
4. Network tab shows successful loads

### Build errors
```bash
npm install @types/kuromoji
npm run build
```

---

## Optional: Converting JMDict Format

For optimal performance, convert to indexed format:

### Create Conversion Script

```typescript
// scripts/convert-jmdict.ts
import * as fs from 'fs';

interface JMDictWord {
  id: string;
  kanji?: Array<{ text: string; common?: boolean }>;
  kana: Array<{ text: string; common?: boolean }>;
  sense: Array<{
    gloss: Array<{ text: string }>;
    partOfSpeech: string[];
  }>;
}

// Read original file
const jmdict = JSON.parse(
  fs.readFileSync('./public/data/jmdict-common.json', 'utf-8')
);

// Convert to indexed format for O(1) lookup
const indexed: Record<string, any> = {};

for (const word of jmdict.words) {
  // Index by kanji
  word.kanji?.forEach(k => {
    indexed[k.text] = {
      kanji: k.text,
      reading: word.kana[0]?.text || '',
      senses: word.sense.map(s => ({
        gloss: s.gloss.map(g => g.text),
        pos: s.partOfSpeech
      })),
      common: k.common || false
    };
  });

  // Index by kana
  word.kana.forEach(k => {
    if (!indexed[k.text]) {
      indexed[k.text] = {
        reading: k.text,
        senses: word.sense.map(s => ({
          gloss: s.gloss.map(g => g.text),
          pos: s.partOfSpeech
        })),
        common: k.common || false
      };
    }
  });
}

// Write indexed dictionary
fs.writeFileSync(
  './public/data/jmdict-indexed.json',
  JSON.stringify(indexed)
);

console.log(`✅ Converted ${Object.keys(indexed).length} entries`);
```

### Run Conversion

```bash
npx tsx scripts/convert-jmdict.ts
```

**Note**: Current implementation handles both formats. Indexing is optional.

---

## Performance Benchmarks

### Before (Jisho API)
- First lookup: 200-500ms (network)
- Subsequent: 200-500ms each
- Total for 10 words: ~3-5 seconds
- Offline: ❌ Doesn't work

### After (JMDict + Kuromoji)
- First lookup: 200-500ms (one-time load)
- Subsequent: <1ms each
- Total for 10 words: <500ms
- Offline: ✅ Fully functional

### Segmentation Comparison
- **TinySegmenter**: ~1ms, 70-80% accuracy
- **Kuromoji.js**: ~5-10ms, 95% accuracy
- **Improvement**: 20-25% better accuracy

---

## File Structure

After setup:

```
Inkline/
├── frontend/
│   ├── public/
│   │   ├── data/
│   │   │   └── jmdict-common.json  ← Optional download
│   │   └── dict/                   ← Kuromoji dictionary
│   │       ├── base.dat.gz
│   │       ├── cc.dat.gz
│   │       └── ... (12 files)
│   ├── src/
│   │   └── lib/
│   │       └── dictionaries/
│   │           └── jmdict.ts       ← Main dictionary module
│   └── package.json
```

---

## Verification Checklist

- [ ] Kuromoji files exist in `public/dict/` (12 .dat.gz files)
- [ ] `jmdict.ts` file exists and imported correctly
- [ ] Build completes successfully (`npm run build`)
- [ ] Console shows "Kuromoji tokenizer loaded successfully"
- [ ] Basic words work (私, 食べ, は)
- [ ] TTS pronounces 私 as "watashi" correctly
- [ ] Conjugated verbs show proper forms
- [ ] Optional: Full dictionary downloaded to `public/data/`

---

## Additional Resources

- **JMDict Project**: https://www.edrdg.org/wiki/index.php/JMdict-EDICT_Dictionary_Project
- **Kuromoji.js**: https://github.com/takuyaa/kuromoji.js
- **JMDict Simplified**: https://github.com/scriptin/jmdict-simplified
- **License**: Creative Commons Attribution-ShareAlike 3.0

---

**Ready to use!** The basic dictionary (~100 words) works out of the box. Download the full JMDict file for 15,000+ word coverage.
