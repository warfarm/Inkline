# Chinese Example Sentences Implementation

## Overview

The Chinese dictionary now includes **example sentences from Tatoeba**, a free collection of sentences and translations for language learners. This feature provides real-world usage examples for Chinese words in the word popup.

## Features

- **308,478 indexed words** with example sentences
- **~400K example associations** across the vocabulary
- **2 examples per word** on average (up to 2 max)
- **Short, learner-friendly sentences** (4-20 characters)
- **Lazy loading** - examples load on first word lookup
- **Automatic display** in WordPopup component
- **Format**: Chinese characters + Pinyin + English translation

## How It Works

### Data Source

- **Source**: Tatoeba Chinese-English sentence pairs (63,352 sentences)
- **GitHub**: https://github.com/krmanik/Chinese-Example-Sentences
- **License**: CC-BY 2.0 FR (free to use with attribution)

### Processing

The `processTatoeba.js` script:
1. Reads the TSV file with Chinese-English sentence pairs
2. Extracts all 2-3 character word combinations from each sentence
3. Indexes sentences by the words they contain
4. Limits to 2 best examples per word (shortest sentences prioritized)
5. Outputs a JSON file mapping words to example sentences

### File Structure

```
frontend/
├── public/
│   └── data/
│       └── chinese-examples.json    # 65MB indexed examples
├── src/lib/dictionaries/
│   └── chinese.ts                   # Updated with examples loading
docs/scripts/
├── cmn_sen_db_2.tsv                 # Raw Tatoeba data (9.7MB)
└── processTatoeba.js                # Processing script
```

### Example Format

```json
{
  "学习": [
    {
      "chinese": "我每天学习中文。",
      "pinyin": "wǒ měi tiān xué xí zhōng wén.",
      "english": "I study Chinese every day."
    },
    {
      "chinese": "学习很重要。",
      "pinyin": "xué xí hěn zhòng yào.",
      "english": "Studying is very important."
    }
  ]
}
```

## Usage

### For Users

Example sentences appear automatically in the word popup when you click/hover on Chinese words:

1. Click on any Chinese word in an article
2. The WordPopup shows the definition
3. Click "Show More" to see example sentences
4. Examples display as:
   ```
   我每天学习中文。
   I study Chinese every day.
   ```

### For Developers

The Chinese dictionary automatically loads examples:

```typescript
import { lookupChinese } from '@/lib/dictionaries/chinese';

// Lookup automatically triggers example loading
const result = await lookupChinese('学习');

// Result includes examples array
console.log(result.examples);
// [
//   "我每天学习中文。\nI study Chinese every day.",
//   "学习很重要。\nStudying is very important."
// ]
```

### Pre-loading Examples

To pre-load examples on app start (for faster first lookup):

```typescript
import { loadChineseExamples } from '@/lib/dictionaries/chinese';

// In App.tsx or layout component
useEffect(() => {
  const userLanguage = user?.target_language;
  if (userLanguage === 'zh') {
    // Pre-load examples in background
    loadChineseExamples();
  }
}, [user]);
```

## Performance

### Initial Load
- **Bundle size impact**: 0 bytes (examples not in bundle)
- **First lookup**: Uses dictionary immediately, triggers example loading
- **Example download**: ~2-5 seconds on typical connection (65MB)

### After Loading
- **Lookup time**: <1ms (O(1) hash map access)
- **Memory usage**: ~80-100MB (examples in RAM)
- **Network calls**: None (all lookups are local)

## File Size Optimization

The current configuration prioritizes quality over size:
- **Current size**: 65MB
- **Words indexed**: 308K words
- **Examples per word**: Up to 2

To reduce file size further, edit `docs/scripts/processTatoeba.js`:

```javascript
// Reduce to 1 example per word
const MAX_EXAMPLES_PER_WORD = 1;  // Currently: 2

// Only index 2-character words (skip 3-character)
const MAX_WORD_LENGTH = 2;  // Currently: 3

// Shorter sentences only
const MAX_SENTENCE_LENGTH = 15;  // Currently: 20
```

Then regenerate:
```bash
cd docs/scripts
node processTatoeba.js
```

## Updating Examples

To update with latest Tatoeba data:

```bash
cd docs/scripts

# Download latest dataset
curl -L -o cmn_sen_db_2.tsv \
  "https://raw.githubusercontent.com/krmanik/Chinese-Example-Sentences/master/Chinese%20Example%20Sentences/cmn_sen_db_2.tsv"

# Regenerate examples JSON
node processTatoeba.js
```

## Statistics

```
Total sentences processed: 59,136
Sentences skipped: 4,216 (too long/short)
Unique words indexed: 308,478
Total example associations: 398,683
Average examples per word: 1.29
File size: 64.56 MB
```

## Attribution

This project uses example sentences from **Tatoeba**:
- **License**: Creative Commons Attribution 2.0 FR
- **Source**: https://tatoeba.org
- **Data compiled by**: krmanik (GitHub)

The raw sentence data includes:
- Simplified Chinese: Community contributions
- Traditional Chinese: Auto-generated
- Pinyin: Auto-generated with Python
- English: Community translations

## Troubleshooting

### Examples not loading
- Check browser console for errors
- Verify `/data/chinese-examples.json` is accessible
- Check Network tab for 404 or CORS errors

### High memory usage
- Expected: ~80-100MB for examples
- Memory is released when tab closes
- Consider reducing file size if critical

### Slow initial load
- Examples file is 65MB (typical download: 2-5 seconds)
- Use `loadChineseExamples()` on app start to pre-warm
- Consider serving with gzip compression

## Future Enhancements

- [ ] Add HSK level tags to example sentences
- [ ] Include audio for example sentences
- [ ] Add single-character example support
- [ ] Implement example sentence difficulty scoring
- [ ] Add more examples for common words
- [ ] Create compressed binary format (MessagePack)
- [ ] IndexedDB caching for offline use

## Related Files

- `frontend/src/lib/dictionaries/chinese.ts` - Dictionary with examples loading
- `frontend/src/components/reading/WordPopup.tsx` - Display component
- `frontend/public/data/chinese-examples.json` - Examples data
- `docs/scripts/processTatoeba.js` - Data processing script
- `docs/scripts/cmn_sen_db_2.tsv` - Raw Tatoeba data
