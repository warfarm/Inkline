# Preloading Article Definitions Guide

## Overview
This feature preloads dictionary definitions for all words in articles, eliminating lookup delays and improving the reading experience for students.

## Benefits
- **Faster word lookups**: No waiting for API calls when hovering/clicking words
- **Offline-ready**: Definitions are stored in the database
- **Better UX**: Instant popup display
- **Reduced API load**: Less stress on external dictionary APIs (especially Jisho for Japanese)

## Setup Instructions

### 1. Run Database Migration

First, add the `word_definitions` column to the `articles` table:

```sql
-- Run this in your Supabase SQL Editor
ALTER TABLE articles ADD COLUMN IF NOT EXISTS word_definitions JSONB DEFAULT '{}'::jsonb;
```

Or use the migration file:
```bash
# The migration is available at:
frontend/supabase/migrations/004_add_word_definitions.sql
```

### 2. Preload Definitions

#### Option A: Using the Admin UI (Recommended)

1. Navigate to `/admin` in your application
2. Click "Start Preloading All Articles"
3. Monitor progress in real-time
4. Wait for completion message

#### Option B: Programmatic Preload

For new articles or batch processing:

```typescript
import { preloadArticleDefinitions } from '@/scripts/preloadArticleDefinitions';

// Preload all articles
await preloadArticleDefinitions();

// Or preload a specific article
await preloadArticleDefinitions('article-uuid-here');
```

## How It Works

### Data Structure

The `word_definitions` field stores a JSON object mapping words to their definitions:

```json
{
  "word_definitions": {
    "学习": {
      "reading": "xuéxí",
      "definition": "to study; to learn",
      "example": "我每天学习中文",
      "grammarNotes": null,
      "formalityLevel": null,
      "usageNotes": null,
      "definitions": [
        { "meaning": "to study", "partOfSpeech": "verb" },
        { "meaning": "to learn", "partOfSpeech": "verb" }
      ],
      "examples": []
    }
  }
}
```

### Lookup Flow

1. **Check preloaded data**: ArticleReader first checks `article.word_definitions[word]`
2. **Fallback to API**: If not found, makes real-time API call (Chinese dict or Jisho)
3. **Display result**: Shows definition in popup

### Performance

- **Chinese articles**: Fast (uses local dictionary, ~1-2 seconds per article)
- **Japanese articles**: Slower (uses Jisho API with rate limiting, ~5-10 minutes per article)

## Monitoring & Debugging

Check browser console for:
- `Using preloaded definition for: [word]` - Successfully using cached data
- `Fetched definition via API for: [word]` - Falling back to real-time lookup

## Updating Definitions

If you need to refresh definitions (e.g., after improving dictionary data):

1. Clear existing definitions:
```sql
UPDATE articles SET word_definitions = '{}'::jsonb;
```

2. Re-run the preload process

## Best Practices

1. **Run after importing articles**: Preload immediately after adding new articles
2. **Monitor Japanese preloads**: They take longer due to API rate limits
3. **Check coverage**: Verify all words have definitions by checking article cards
4. **Update periodically**: Refresh definitions when dictionary sources improve

## Troubleshooting

### Definitions not loading
- Check browser console for errors
- Verify migration was run: `SELECT column_name FROM information_schema.columns WHERE table_name = 'articles' AND column_name = 'word_definitions';`
- Ensure articles have segmented_content populated

### Preload taking too long
- Japanese articles require ~300ms delay per word (API rate limiting)
- Run preload during off-hours
- Consider preloading only Chinese articles first for quick wins

### Missing definitions for some words
- Some words may not exist in dictionaries (proper nouns, slang)
- ArticleReader will fall back to real-time lookup automatically
- Check console for "Fetched definition via API" messages

## Future Enhancements

- [ ] Background job for automatic preloading
- [ ] Incremental updates (only new words)
- [ ] Dictionary source selection (multiple APIs)
- [ ] User-contributed definitions
- [ ] Analytics on most-looked-up words
