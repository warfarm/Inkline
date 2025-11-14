# Korean Dictionary Setup Guide

Complete guide for setting up the offline Korean dictionary in Inkline using Kaikki.org/Wiktextract data.

---

## Overview

Inkline uses **Kaikki.org Korean Dictionary** (extracted from Wiktionary) for Korean word lookups, providing:
- **Instant offline lookups** - <1ms instead of 200-500ms API calls
- **40,000+ entries** - comprehensive vocabulary coverage
- **O(1) lookup time** - instant dictionary access using indexed JSON
- **Smart particle handling** - built-in Korean grammar particles and copulas
- **Romanization support** - includes romanization for pronunciation

---

## Current Implementation Status

### ✅ Already Implemented

1. **Korean Dictionary Module**
   - Location: `frontend/src/lib/dictionaries/korean.ts`
   - O(1) lookup using `Record<string, Entry>`
   - Built-in particles and copulas (working now)
   - Infrastructure ready for full dictionary

2. **Particle & Copula Support**
   - 25+ common Korean particles (은/는, 이/가, 을/를, etc.)
   - Common copulas (이에요, 예요, 입니다, etc.)
   - Detailed grammar explanations and examples
   - Formality level indicators

3. **Verb Conjugation Detection**
   - Automatic detection of conjugated forms
   - Shows dictionary form (e.g., 가다 for 가요)
   - Recognizes polite, formal, and casual forms

4. **Lazy Loading System**
   - Dictionary loads on first use
   - Cached in memory for session
   - Falls back to online APIs if needed

### ⏳ Optional: Full Dictionary Download

Basic particles and copulas work now. For full coverage:

---

## Downloading Full Korean Dictionary

### Prerequisites

- Node.js installed (for conversion script)
- ~10MB disk space for JSONL source
- ~8MB disk space for final JSON file

### Download & Convert Instructions

#### Step 1: Download Raw Dictionary

```bash
# Navigate to frontend data directory
cd frontend/public/data

# Download Korean dictionary from Kaikki.org (via GitLab mirror)
curl -L -o korean-dict.jsonl "https://gitlab.com/tdulcet/compact-dictionary/-/raw/main/wiktionary/dictionary-ko.json?inline=false"

# Verify download (should be ~10MB)
ls -lh korean-dict.jsonl
```

#### Step 2: Convert to Indexed Format

```bash
# Return to frontend directory
cd ../..

# Run conversion script
node scripts/convert-korean-dict.js
```

The conversion script will:
- Parse 40,000+ JSONL entries
- Create indexed JSON for O(1) lookups
- Add reverse romanization lookups
- Generate ~72,000 total entries (includes romanizations)
- Output to `public/korean-dict.json` (~8MB)

#### Step 3: Verify Conversion

You should see output like:
```
✅ Conversion complete!
   Output size: 8.10 MB
   Total entries: 72,034

🔍 Sample entries:
   안녕: annyeong - peace; tranquility; wellness...
   가다: gada - to go; (auxiliary, with -어) Marks...
   하다: hada - (transitive) to do; used to vaguely...
```

---

## How It Works

### Loading Process

1. **App starts** → Korean segmentation ready
2. **User clicks a Korean word** → Checks particles/copulas first (instant)
3. **Not found in basic dict** → Triggers full dictionary load from `/korean-dict.json`
4. **Next lookup** → Uses loaded full dictionary (instant)
5. **Still not found** → Falls back to online APIs (Wiktionary, Korean Learners' Dictionary)

### Performance

```typescript
// First word lookup (if not particle/copula)
// - Triggers load: ~200-500ms (one-time)
// - Returns result: instant if found

// Subsequent lookups
// - Full dict loaded: <1ms (memory access)
// - 40,000+ words available
// - Zero network calls
```

---

## Dictionary Format

### Source Format (JSONL)

Each line in `korean-dict.jsonl`:
```json
{
  "": "안녕",
  "p": ["intj", "noun"],
  "d": ["peace; tranquility", "wellness", "(informal) hello"],
  "f": ["annyeong", "安寧"],
  "i": "[a̠nɲʌ̹ŋ]"
}
```

### Indexed Format (JSON)

Converted to `korean-dict.json`:
```json
{
  "안녕": {
    "r": "annyeong",
    "d": "peace; tranquility; wellness; (informal) hello",
    "p": "intj, noun",
    "i": "[a̠nɲʌ̹ŋ]"
  },
  "annyeong": {
    "r": "annyeong",
    "d": "peace; tranquility; wellness; (informal) hello",
    "p": "intj, noun",
    "i": "[a̠nɲʌ̹ŋ]",
    "w": "안녕"
  }
}
```

**Keys**:
- `r`: Romanization/reading
- `d`: Definitions (joined with semicolons)
- `p`: Parts of speech
- `i`: IPA pronunciation (optional)
- `w`: Original Korean word (for romanization entries)

---

## Key Features

### Smart Particle & Grammar Handling

Built-in support for Korean particles with detailed explanations:

**Subject/Topic Markers**:
- 은/는 (eun/neun) - topic marker (consonant/vowel)
- 이/가 (i/ga) - subject marker (consonant/vowel)

**Object Markers**:
- 을/를 (eul/reul) - object marker (consonant/vowel)

**Location/Direction**:
- 에 (e) - at, to (static location/time)
- 에서 (eseo) - at, in (action location)
- 에게/한테/께 (ege/hante/kke) - to (person, casual, honorific)

**And 20+ more particles** with grammar notes and examples!

### Copula Support

Common copulas with formality levels:
- 이에요/예요 (polite informal "to be")
- 입니다 (polite formal "to be")
- 이야/야 (casual "to be")
- 아니에요/아닙니다 (negative forms)

### Verb Conjugation

Automatic detection and display:
- 가요 → 가다 (gada, "to go")
- 먹었어요 → 먹다 (meokda, "to eat" - past polite)
- Shows conjugation type (polite-informal, past, etc.)

---

## Testing

### Test With Basic Dictionary Only

Without downloading the full dictionary:

```bash
npm run dev
```

Try these words in a Korean article:
- ✅ **은, 는, 이, 가** (particles) - works
- ✅ **이에요, 예요** (copulas) - works with grammar notes
- ❌ **안녕, 사랑** (regular words) - won't work yet

### Test With Full Dictionary

After converting `korean-dict.json`:
- ✅ All particles and copulas still work
- ✅ **안녕, 가다, 하다, 먹다, 사랑** - all work!
- ✅ Any word from 40,000+ entries works
- ✅ Offline - no network calls

### Check Browser Console

Look for:
```
[Korean Dict] Loading full Korean dictionary...
[Korean Dict] Loaded 72034 entries
```

---

## File Structure

After setup:

```
Inkline/
├── frontend/
│   ├── public/
│   │   ├── data/
│   │   │   └── korean-dict.jsonl     ← Downloaded source
│   │   └── korean-dict.json          ← Converted dictionary
│   ├── src/
│   │   └── lib/
│   │       └── dictionaries/
│   │           └── korean.ts         ← Main dictionary module
│   ├── scripts/
│   │   └── convert-korean-dict.js    ← Conversion script
│   └── package.json
```

---

## Comparison with Other Languages

| Feature | Japanese | Chinese | Korean |
|---------|----------|---------|--------|
| **Source** | JMDict | CC-CEDICT | Wiktextract (Kaikki.org) |
| **Entries** | 15,000-60,000 | 196,574 | 40,689 |
| **Size** | 3-80 MB | 15.6 MB | 8.1 MB |
| **Format** | JSON | JSON | JSON |
| **Lookup** | O(1) | O(1) | O(1) |
| **License** | CC BY-SA 3.0 | CC BY-SA 4.0 | CC (Wiktionary) |
| **Offline** | ✅ | ✅ | ✅ |

---

## Updating the Dictionary

To update with the latest Wiktionary data:

```bash
cd frontend/public/data

# Download latest version (updated weekly)
curl -L -o korean-dict.jsonl "https://gitlab.com/tdulcet/compact-dictionary/-/raw/main/wiktionary/dictionary-ko.json?inline=false"

# Convert to indexed format
cd ../..
node scripts/convert-korean-dict.js
```

The compact-dictionaries project updates automatically from Wiktionary dumps.

---

## Troubleshooting

### Dictionary not loading

**Check**:
1. File exists at `public/korean-dict.json`
2. File is valid JSON (open in text editor)
3. Browser Network tab shows successful fetch
4. Console shows any errors

**Solution**:
```bash
# Re-run conversion
cd frontend
node scripts/convert-korean-dict.js
```

### Conversion script fails

**Error**: `require is not defined`
**Solution**: Script uses ES modules. Make sure you're running from `frontend/` directory:
```bash
cd frontend
node scripts/convert-korean-dict.js
```

### Build errors

```bash
npm install
npm run build
```

### Words not found in dictionary

The dictionary covers 40,000+ common words but may miss:
- Very rare or archaic words
- New slang or internet terms
- Highly technical terminology
- Proper nouns (names, places)

These will fall back to online APIs (Wiktionary, Korean Learners' Dictionary).

---

## Performance Benchmarks

### Before (Online APIs Only)

- First lookup: 200-500ms (network)
- Subsequent: 200-500ms each
- Total for 10 words: ~3-5 seconds
- Offline: ❌ Doesn't work

### After (Offline Dictionary)

- First lookup: 200-500ms (one-time load)
- Subsequent: <1ms each
- Total for 10 words: <500ms
- Offline: ✅ Fully functional

**Result**: **10-500x faster** for regular lookups!

---

## Data Source & License

### Kaikki.org / Wiktextract

- **Source**: English Wiktionary (Korean language entries)
- **Extracted by**: Wiktextract (Tatu Ylonen)
- **Mirror**: compact-dictionaries (tdulcet/GitLab)
- **License**: Creative Commons (inherited from Wiktionary)
- **Updates**: Weekly automatic updates from Wiktionary dumps

### Attribution

When using this dictionary data:
- Credit to Wiktionary contributors
- Credit to Tatu Ylonen for Wiktextract
- Link to https://kaikki.org for academic use

### License Compliance

This dictionary is freely usable under Wiktionary's Creative Commons license. No API keys or registration required.

---

## Optional: Pre-warming

To load the dictionary proactively on app start (recommended for Korean learners):

```typescript
// In App.tsx or layout component
import { loadFullKoreanDict } from '@/lib/dictionaries/korean';

useEffect(() => {
  const userLanguage = user?.target_language;
  if (userLanguage === 'korean') {
    // Pre-load dictionary in background
    loadFullKoreanDict();
  }
}, [user]);
```

---

## Verification Checklist

- [ ] `korean-dict.jsonl` downloaded to `public/data/` (~10MB)
- [ ] `korean-dict.json` exists in `public/` (~8MB)
- [ ] `korean.ts` file exists and imported correctly
- [ ] Build completes successfully (`npm run build`)
- [ ] Console shows "Loaded 72034 entries"
- [ ] Particles work (은, 는, 이, 가, etc.)
- [ ] Common words work (안녕, 가다, 하다, 사랑)
- [ ] Conjugation detection works (가요 → 가다)
- [ ] No network calls for dictionary lookups

---

## Additional Resources

- **Kaikki.org**: https://kaikki.org/dictionary/Korean/
- **Wiktextract**: https://github.com/tatuylonen/wiktextract
- **Compact Dictionaries**: https://gitlab.com/tdulcet/compact-dictionary
- **Wiktionary**: https://en.wiktionary.org/wiki/Wiktionary:Main_Page
- **Korean Learners' Dictionary**: https://krdict.korean.go.kr

---

**Ready to use!** The basic particle/copula dictionary works out of the box. Download and convert the full dictionary for 40,000+ word coverage.
