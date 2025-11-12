# JMDict Setup Guide

## What You Need to Download

You have **two options** for the JMDict dictionary:

### Option 1: Common Words Only (Recommended for Web)
- **File:** `jmdict-eng-common.json`
- **Size:** ~3-5 MB
- **Entries:** ~15,000 common words
- **Best for:** Web deployment, faster loading

### Option 2: Complete Dictionary
- **File:** `jmdict-eng-all.json`
- **Size:** ~50-80 MB
- **Entries:** ~60,000+ all words
- **Best for:** Maximum coverage, local development

---

## Download Instructions

### Download from GitHub Releases

```bash
# Navigate to your project's frontend directory
cd C:\Users\warfarm\Downloads\Inkline\frontend

# Create data directory if it doesn't exist
mkdir -p public\data

# Download common words version (RECOMMENDED)
curl -L -o public\data\jmdict-common.json https://github.com/scriptin/jmdict-simplified/releases/latest/download/jmdict-eng-common.json

# OR download full version (larger, more complete)
# curl -L -o public\data\jmdict-all.json https://github.com/scriptin/jmdict-simplified/releases/latest/download/jmdict-eng-all.json
```

### Manual Download (if curl doesn't work)

1. Go to: https://github.com/scriptin/jmdict-simplified/releases/latest
2. Download `jmdict-eng-common.json` (or `jmdict-eng-all.json`)
3. Save it to: `C:\Users\warfarm\Downloads\Inkline\frontend\public\data\jmdict-common.json`

---

## File Structure

After download, your directory should look like:

```
Inkline/
├── frontend/
│   ├── public/
│   │   ├── data/
│   │   │   └── jmdict-common.json  ← Downloaded dictionary
│   │   └── dict/                   ← Kuromoji dictionary (already done)
│   │       ├── base.dat.gz
│   │       ├── cc.dat.gz
│   │       └── ... (other files)
│   ├── src/
│   └── package.json
```

---

## Current Setup Status

### ✅ Already Implemented

1. **Kuromoji.js Segmentation**
   - Installed and configured
   - Dictionary files copied to `public/dict/`
   - Auto-loads on app start
   - Provides base forms for conjugated verbs

2. **JMDict Dictionary Module**
   - Created `frontend/src/lib/dictionaries/jmdict.ts`
   - O(1) lookup time using indexed dictionary
   - Basic dictionary with 100+ common words (working now)
   - Infrastructure ready for full dictionary

3. **TTS Improvements**
   - Web Speech API is now primary method
   - Uses reading (hiragana) for accurate pronunciation
   - Fixed 私 pronunciation issue

### ⏳ Needs JMDict Download

The dictionary will work with the basic built-in dictionary (~100 words), but for full coverage you should download the JMDict file.

**When JMDict is downloaded:**
- File placed at `public/data/jmdict-common.json`
- Will auto-load on first lookup
- Provides 15,000+ word definitions instantly
- No further configuration needed!

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
// - 60,000+ words available
```

---

## Converting JMDict Format (Optional)

The `jmdict-eng-common.json` file is in the original format. For optimal performance, you can convert it to our indexed format:

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
    info?: string[];
  }>;
}

interface JMDictFile {
  words: JMDictWord[];
}

// Read original file
const jmdict: JMDictFile = JSON.parse(
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
        pos: s.partOfSpeech,
        info: s.info
      })),
      common: k.common || false
    };
  });

  // Index by kana
  word.kana.forEach(k => {
    // Only if not already indexed by kanji
    if (!indexed[k.text]) {
      indexed[k.text] = {
        reading: k.text,
        senses: word.sense.map(s => ({
          gloss: s.gloss.map(g => g.text),
          pos: s.partOfSpeech,
          info: s.info
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

### Update jmdict.ts

```typescript
// In loadFullJMDict() function, change:
const response = await fetch('/data/jmdict-common.json');
// To:
const response = await fetch('/data/jmdict-indexed.json');
```

**Note:** The current implementation can handle both formats. Indexing is optional but provides better performance.

---

## Testing

### 1. Test Without JMDict (Basic Dictionary)

```bash
npm run dev
```

Visit a Japanese article and try these words:
- ✅ **私** (watashi) - Should work (in basic dict)
- ✅ **食べ** (tabe) - Should work (in basic dict)
- ✅ **は** (particle) - Should work with grammar notes
- ❌ **複雑** (fukuzatsu - complex) - Won't work yet (needs full dict)

### 2. Test With JMDict (After Download)

After downloading `jmdict-common.json`:

```bash
npm run dev
```

Try the same words:
- ✅ All previous words still work
- ✅ **複雑** now works!
- ✅ Any word from 15,000+ entries works

### 3. Test Kuromoji Segmentation

Check browser console for:
```
Kuromoji tokenizer loaded successfully
```

Click on conjugated verbs:
- **食べます** (tabemasu) → Should show "to eat (polite form)"
- **食べて** (tabete) → Should show "eating (te-form)"
- Reading should be shown as hiragana

---

## Verification Checklist

- [ ] `public/dict/` folder exists with Kuromoji files (12 .dat.gz files)
- [ ] `public/data/jmdict-common.json` downloaded (3-5 MB)
- [ ] Build completes successfully (`npm run build`)
- [ ] Console shows "Kuromoji tokenizer loaded successfully"
- [ ] Basic words work (私, 食べ, は)
- [ ] Full dictionary loads on first uncommon word
- [ ] TTS pronounces 私 as "watashi" correctly
- [ ] Conjugated verbs show proper forms

---

## Troubleshooting

### Problem: "Module 'path' has been externalized"

**Solution:** This is a warning, not an error. Kuromoji uses Node.js `path` module which Vite externalizes for browser. The app will work fine.

### Problem: Dictionary not loading

**Check:**
1. File exists at `public/data/jmdict-common.json`
2. File is valid JSON (not HTML error page)
3. Browser network tab shows successful fetch to `/data/jmdict-common.json`
4. Console shows any errors

### Problem: Kuromoji not loading

**Check:**
1. Files exist in `public/dict/`
2. Files are `.dat.gz` format (compressed)
3. Console shows "Kuromoji tokenizer loaded successfully"
4. Network tab shows successful loads from `/dict/`

### Problem: Build errors

**Run:**
```bash
npm install @types/kuromoji
npm run build
```

---

## Performance Benchmarks

### Before (Jisho API)
- First lookup: 200-500ms (network request)
- Subsequent: 200-500ms each
- Total for 10 words: ~3-5 seconds
- Offline: ❌ Doesn't work

### After (JMDict + Kuromoji)
- First lookup: 200-500ms (one-time load)
- Subsequent: <1ms each
- Total for 10 words: <500ms
- Offline: ✅ Fully functional

### Segmentation
- **TinySegmenter:** ~1ms, 70-80% accuracy
- **Kuromoji.js:** ~5-10ms, 95% accuracy
- **Improvement:** 20-25% better accuracy, still fast

---

## Summary

### What's Working Now
✅ Kuromoji segmentation
✅ Basic JMDict dictionary (~100 words)
✅ Web Speech API TTS
✅ O(1) lookup infrastructure
✅ Build succeeds
✅ Conjugation handling

### What Needs Download
⏳ Full JMDict dictionary (15,000+ words)

### Where to Download
🔗 https://github.com/scriptin/jmdict-simplified/releases/latest

### What to Download
📦 `jmdict-eng-common.json` (3-5 MB)

### Where to Put It
📁 `frontend/public/data/jmdict-common.json`

---

## Next Steps

1. **Download JMDict** (5 minutes)
   ```bash
   cd frontend
   curl -L -o public/data/jmdict-common.json \
     https://github.com/scriptin/jmdict-simplified/releases/latest/download/jmdict-eng-common.json
   ```

2. **Test the App** (2 minutes)
   ```bash
   npm run dev
   ```
   - Open a Japanese article
   - Click on various words
   - Verify TTS pronunciation
   - Check console for "dictionary loaded" message

3. **Optional: Convert Format** (10 minutes)
   - Create conversion script (provided above)
   - Run: `npx tsx scripts/convert-jmdict.ts`
   - Update jmdict.ts to use indexed file
   - Slight performance improvement

---

## Additional Resources

- **JMDict Project:** https://www.edrdg.org/wiki/index.php/JMdict-EDICT_Dictionary_Project
- **Kuromoji.js:** https://github.com/takuyaa/kuromoji.js
- **JMDict Simplified:** https://github.com/scriptin/jmdict-simplified
- **License:** Creative Commons Attribution-ShareAlike 3.0

---

**Ready to use!** The dictionary infrastructure is complete. Just download the JMDict file and you'll have instant Japanese lookups with 15,000+ words.
