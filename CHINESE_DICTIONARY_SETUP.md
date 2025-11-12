# Chinese Dictionary - Full CC-CEDICT Integration

## Overview

The Chinese dictionary has been upgraded to include the complete CC-CEDICT dictionary with **196,574 entries** (124,114 unique words in simplified and traditional Chinese).

## Features

- **Complete Coverage**: 196K+ Chinese words with pinyin and definitions
- **O(1) Lookups**: Uses JavaScript Map for instant dictionary access
- **Lazy Loading**: Dictionary loads on first use (doesn't impact initial page load)
- **Smart Caching**: Loaded once and cached in memory for the session
- **Fallback Support**: Embedded basic dictionary (~900 words) for immediate use
- **Character Breakdown**: Multi-character words show individual character meanings
- **Traditional Support**: Both simplified and traditional Chinese supported

## Technical Details

### File Structure

```
frontend/
├── public/
│   └── chinese-dict.json           # Full dictionary (15.6MB JSON)
├── src/lib/dictionaries/
│   ├── chinese.ts                  # Main lookup logic
│   ├── parseCEDICT.js              # Parser script (TypeScript export)
│   ├── parseCEDICT-json.js         # Parser script (JSON export)
│   ├── cedict_raw.txt              # Raw CC-CEDICT data (9.4MB)
│   └── test-chinese-dict.ts        # Test suite
```

### Loading Strategy

1. **Initial Load**: Uses embedded `basicChineseDict` (~900 common words)
2. **First Lookup**: Triggers background fetch of full dictionary (15.6MB)
3. **Subsequent Lookups**: Uses full dictionary if loaded, otherwise waits for it
4. **Memory Cache**: Dictionary stays in memory for the session (no IndexedDB needed)

### How It Works

```typescript
// Automatic lazy loading on first lookup
const result = await lookupChinese('学习');
// First call: Uses basicChineseDict, starts loading full dict
// Next calls: Uses full dict (196K entries)

// Or pre-load explicitly (e.g., on app startup)
import { loadFullChineseDict } from '@/lib/dictionaries/chinese';
await loadFullChineseDict();
```

### Dictionary Format

The JSON file uses a compact format to minimize size:

```json
{
  "学习": { "p": "xue2 xi2", "d": "to study; to learn" },
  "学": { "p": "xue2", "d": "to study; to learn; school" }
}
```

- `p`: Pinyin reading
- `d`: Definition(s)

This saves ~2MB compared to full property names.

## Usage

### In React Components

```typescript
import { lookupChinese } from '@/lib/dictionaries/chinese';

// Lookup a word
const definition = await lookupChinese('你好');

// Result includes:
// - word: "你好"
// - reading: "ni3 hao3"
// - definition: "hello; hi"
// - componentCharacters: [{ character: "你", reading: "ni3", ... }]
```

### Pre-warming (Optional)

To load the dictionary proactively (e.g., on app start for Chinese learners):

```typescript
import { loadFullChineseDict } from '@/lib/dictionaries/chinese';

// In App.tsx or a layout component
useEffect(() => {
  const userLanguage = user?.target_language;
  if (userLanguage === 'chinese') {
    // Pre-load dictionary in background
    loadFullChineseDict();
  }
}, [user]);
```

## Performance

### Initial Load
- **Bundle size impact**: 0 bytes (dictionary not in bundle)
- **First lookup**: ~50-200ms (uses basicChineseDict immediately)
- **Full dict download**: ~1-3 seconds on typical connection (15.6MB)

### After Loading
- **Lookup time**: <1ms (O(1) object access)
- **Memory usage**: ~30-40MB (dictionary in RAM)
- **No network calls**: All lookups are local

## Updating the Dictionary

To update with the latest CC-CEDICT data:

```bash
cd frontend/src/lib/dictionaries

# Download latest CC-CEDICT
curl -L -o cedict_raw.txt.gz \
  https://www.mdbg.net/chinese/export/cedict/cedict_1_0_ts_utf-8_mdbg.txt.gz

# Decompress
gunzip cedict_raw.txt.gz

# Generate JSON for web (outputs to public/chinese-dict.json)
node parseCEDICT-json.js

# Or generate TypeScript file (outputs to chinese-dict-full.ts)
node parseCEDICT.js
```

## Size Comparison

| Format | Size | Use Case |
|--------|------|----------|
| Raw CC-CEDICT | 9.4 MB | Source data |
| Compressed (.gz) | 3.8 MB | Distribution |
| JSON (compact keys) | 15.6 MB | Web runtime |
| TypeScript | 18.2 MB | Type-safe imports |

## Browser Compatibility

- **Modern browsers**: Full support (Chrome, Firefox, Safari, Edge)
- **IE11**: Not supported (uses ES6+ features)
- **Mobile**: Full support (iOS Safari, Android Chrome)

## CC-CEDICT License

This project uses CC-CEDICT data, which is licensed under:
- **License**: Creative Commons Attribution-ShareAlike 4.0 International
- **Source**: https://cc-cedict.org/
- **Publisher**: MDBG

## Testing

Run the test suite in browser console:

```typescript
import { testDictionary } from '@/lib/dictionaries/test-chinese-dict';
await testDictionary();
```

Tests verify:
- ✅ Basic words from embedded dict
- ✅ Less common words from full dict
- ✅ Character breakdown for compounds
- ✅ Traditional Chinese support
- ✅ Graceful handling of unknown words

## Troubleshooting

### Dictionary not loading
- Check browser console for errors
- Verify `/chinese-dict.json` is accessible (check Network tab)
- Check CORS if using a CDN

### High memory usage
- Expected: ~30-40MB for the dictionary
- Memory is released when user closes tab/app
- Consider IndexedDB if memory is critical

### Slow initial load
- Dictionary is 15.6MB (typical download: 1-3 seconds)
- Use `loadFullChineseDict()` on app start to pre-warm
- Consider serving gzipped (reduces to ~3.8MB)

## Future Enhancements

- [ ] IndexedDB caching for offline use
- [ ] Service Worker for background updates
- [ ] Compressed binary format (Protocol Buffers)
- [ ] Server-side API endpoint for lighter clients
- [ ] Delta updates for dictionary changes
- [ ] Multiple dictionary sources (HSK levels, frequency lists)
