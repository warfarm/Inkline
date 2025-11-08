# Article Reading Interface

## Layout

```
┌─────────────────────────────────────┐
│  [← Back]  Title        [Settings]  │
├─────────────────────────────────────┤
│                                     │
│  Article content with clickable     │
│  words and phrases.                 │
│                                     │
│  [Word popup appears below word]    │
│                                     │
└─────────────────────────────────────┘
│  Progress: 45%  |  Time: 5:32      │
│  [Save to Word Bank] [More/Less]   │
└─────────────────────────────────────┘
```

## Features

### A. Word Clicking

- Each word wrapped in `<span class="word-clickable">`
- On click:
  - Fetch definition from dictionary API
  - Show popup below word with:
    - Word in target language
    - Reading (Pinyin/Hiragana)
    - English definition
    - Example sentence
    - [Save to Word Bank] button
  - Track interaction in `word_interactions` table

### B. Phrase Highlighting

- User can click-drag to select multiple words
- On selection end:
  - Show popup with:
    - Selected phrase
    - Grammar structure explanation (from article's grammar_points data)
    - Example usage
    - [Save] button (saves entire phrase to word bank)

### C. Furigana Display (Japanese Only)

- Use `<ruby>` tags for kanji with furigana
- Display logic:
  - Check `kanji_familiarity` table for each kanji
  - If `show_furigana = true` OR `times_encountered < 3`, show furigana
  - Otherwise, hide furigana
- Global toggle in settings: "Always show furigana"
- Per-article quick toggle button in header

### D. Article Progress

- Track scroll position and time spent
- On completion (scroll to 80%+ or click "Mark Complete"):
  - Save to `reading_history`
  - Show feedback modal: "Did you like this topic?" [More] [Less] [Neutral]
  - Update user interest preferences

## Implementation Notes

- Use TinySegmenter for Japanese, nodejieba for Chinese during article pre-processing
- Store segmented content in `articles.segmented_content` as:

```json
{
  "words": [
    {"text": "私", "start": 0, "end": 1},
    {"text": "は", "start": 1, "end": 2},
    {"text": "学生", "start": 2, "end": 4}
  ]
}
```

- For dictionary lookups:
  - Japanese: `fetch('https://jisho.org/api/v1/search/words?keyword=WORD')`
  - Chinese: Use pre-loaded CC-CEDICT data or API wrapper
