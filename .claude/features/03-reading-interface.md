# Article Reading Interface

## Overview

The reading interface is the core of Inkline's learning experience. It provides interactive articles with word-level segmentation, hover/click definitions, text-to-speech, character breakdowns, and vocabulary saving.

## Layout

```
┌──────────────────────────────────────────────────────┐
│ [← Back]  Article Title        [Settings]  [Toggle] │
├──────────────────────────────────────────────────────┤
│                                                       │
│  Article content with clickable/hoverable words      │
│  显示为可点击的分段文本                                │
│                                                       │
│  [Word popup appears near clicked word]              │
│                                                       │
│                                                       │
│                                    [Word Bank Panel] │
│                                    │ Saved words     │
│                                    │ • word 1        │
│                                    │ • word 2        │
│                                    └─────────────────┘
│                                                       │
└──────────────────────────────────────────────────────┘
│ Progress: 65% | Time: 8:32 | Words: 12              │
└──────────────────────────────────────────────────────┘
```

## Core Features

### A. Word Clicking/Hovering

Each word is wrapped in a clickable/hoverable `<span>` element with:
- Automatic word segmentation (TinySegmenter for Japanese, Jieba for Chinese)
- User-configurable interaction mode (hover vs. click)
- Smart popup positioning (avoids screen edges)
- Mobile-optimized touch interactions

**Implementation:** `ArticleReader.tsx` + `WordPopup.tsx`

**User Preference:**
- Hover mode: Definition appears on mouse hover (desktop)
- Click mode: Definition appears on click (mobile-friendly)
- Stored in user settings

**On Word Interaction:**
1. Check preloaded definitions from `article.word_definitions` first
2. If not found, fetch from dictionary API:
   - Chinese: Local CC-CEDICT dictionary
   - Japanese: Jisho.org API
3. Display popup with:
   - Word in target language
   - Reading (Pinyin/Hiragana)
   - Primary English definition
   - Grammar notes (if applicable)
   - Character breakdown (Chinese)
   - Example sentences
   - [Save to Word Bank] button
   - [🔊 Listen] button (text-to-speech)
4. Track interaction in `word_interactions` table

**Word Popup Features:**
- **Show More** button reveals:
  - Additional definitions with parts of speech
  - Usage notes
  - Example sentences
- **Save with Notes:** Textarea for personal notes when saving
- **Text-to-Speech:** Native browser Web Speech API
  - Chinese: zh-CN voice
  - Japanese: ja-JP voice
  - Auto-detects language from user profile
- **Smart Positioning:** Popup adjusts to stay within viewport

### B. Character Breakdown (Chinese)

**NEW FEATURE:** When clicking multi-character Chinese words, the popup shows individual character breakdowns.

Example: **学习** (xuéxí - to study)
- **学** (xué) — to learn
- **习** (xí) — to practice

**Benefits:**
- Helps learners understand word composition
- Builds character recognition skills
- Shows semantic relationships between characters

**Implementation:**
- `componentCharacters` field in `DictionaryResult` interface
- Displayed in emerald-themed section above "Show More"
- Always visible (not hidden behind "Show More")

**Data structure:**
```typescript
componentCharacters?: Array<{
  character: string;
  reading: string;
  definition: string;
}>;
```

### C. Preloaded Definitions

**Performance Optimization:** Articles cache dictionary definitions for instant lookup.

**How it works:**
1. Admin navigates to `/admin` and runs "Preload All Articles"
2. System fetches definitions for all unique words in all articles
3. Definitions stored in `articles.word_definitions` JSONB column
4. ArticleReader checks cache first, then falls back to API

**Benefits:**
- **Instant lookups:** No waiting for API calls
- **Offline-ready:** Works without internet (after preload)
- **Reduced load:** Less stress on Jisho.org API
- **Better UX:** Smooth, lagless interactions

**Coverage indicator:**
- Article cards show "✓ Definitions cached" badge if preloaded
- Console logs show "Using preloaded definition" vs "Fetched via API"

### D. Phrase Highlighting

Users can click-drag to select multiple words for phrase lookup.

**On phrase selection:**
1. Extract selected text
2. Show `PhrasePopup` component
3. Display:
   - Selected phrase
   - Compound meaning (if available)
   - Grammar structure explanation (from article's `grammar_points`)
   - Example usage
   - [Save Phrase] button
4. Track in `word_interactions` table with type `phrase_highlight`

**Use cases:**
- Grammar patterns (e.g., "不...也不...")
- Fixed expressions (e.g., "一边...一边...")
- Compound verbs (e.g., "出去", "起来")

### E. Furigana Display (Japanese Only)

Uses HTML `<ruby>` tags for kanji with furigana readings.

**Adaptive display logic:**
- Check `kanji_familiarity` table for each kanji
- If `show_furigana = true` OR `times_encountered < 3`, show furigana
- Otherwise, hide furigana (promote character recognition)
- Clicking hidden furigana reveals it and increments `times_clicked`

**Controls:**
- **Global setting:** "Always show furigana" in Settings page
- **Quick toggle:** Button in article header for temporary override
- **Per-kanji tracking:** Individual familiarity per character

**Component:** `FuriganaText.tsx`

**Custom hook:** `useKanjiFamiliarity.ts`
- Tracks kanji encounters
- Updates familiarity scores
- Controls furigana visibility

### F. Word Bank Side Panel

**NEW FEATURE:** Collapsible side panel shows saved words during reading.

**Features:**
- Real-time sync when words are saved/unsaved
- Quick unsave button (trash icon)
- Click word to scroll back to location in article
- Responsive: Slides in from right on desktop, bottom sheet on mobile
- Position preference: Right or left side (saved in settings)

**Benefits:**
- Review words without leaving article
- Quick context switching
- Reinforces vocabulary in context

**Implementation:**
- `WordBankPanel.tsx`
- Custom hook: `useWordBankPanelPosition.ts`

### G. Article Progress Tracking

Real-time tracking at bottom of screen:

**Metrics displayed:**
- **Progress:** Scroll percentage (0-100%)
- **Time:** Elapsed reading time (MM:SS)
- **Words:** Count of words saved to word bank

**Completion trigger:**
- Scroll to 80%+ of article
- OR click "Mark Complete" button
- Saves to `reading_history` table with:
  - `time_spent_seconds`
  - `words_saved_count`
  - `completed_at` timestamp

**Post-completion modal:**
```
"Did you like this topic?"
[👍 More] [👎 Less] [😐 Neutral]
```
- Updates user interests for article recommendations
- Saved as `liked` boolean in `reading_history`

### H. Text-to-Speech (TTS)

**NEW FEATURE:** Native browser pronunciation for words.

**How it works:**
1. User clicks 🔊 button in word popup
2. Uses Web Speech API (`SpeechSynthesisUtterance`)
3. Language detection:
   - Primary: User's `target_language` from profile
   - Fallback: Character analysis (hiragana/katakana = Japanese, else Chinese)
4. Voice selection:
   - Chinese: `zh-CN`
   - Japanese: `ja-JP`
5. Speech rate: 0.8x (slightly slower for clarity)

**Features:**
- Visual feedback: 🔊 changes to ⏸ while speaking
- Cancel on new TTS request (prevents overlap)
- Error handling for unsupported browsers
- Works offline (system voices)

**Browser support:** Chrome, Edge, Safari, Firefox (varies by platform)

## Implementation Notes

### Word Segmentation

Pre-processed during article creation, stored in `articles.segmented_content`:

```json
{
  "words": [
    {"text": "学习", "start": 0, "end": 2, "reading": "xuéxí"},
    {"text": "中文", "start": 2, "end": 4, "reading": "zhōngwén"}
  ]
}
```

**On frontend:**
- Map over `segmented_content.words`
- Wrap each word in `<span class="word-clickable">`
- Attach click/hover handlers
- Highlight on hover (CSS transition)

### Dictionary Lookups

**Priority order:**
1. **Preloaded cache** (`article.word_definitions[word]`)
2. **Real-time API** (Chinese local dict or Jisho API)

**Chinese dictionary:**
- `frontend/src/lib/dictionaries/chinese.ts`
- 60KB+ CC-CEDICT embedded data
- Instant lookups (no network required)
- Character breakdown logic built-in

**Japanese dictionary:**
- `frontend/src/lib/dictionaries/jisho.ts`
- Jisho.org API wrapper
- `fetch('https://jisho.org/api/v1/search/words?keyword=WORD')`
- Free, no authentication required
- Rate limiting: ~300ms delay per request (for preloading)

### Mobile Optimizations

**Touch interactions:**
- Larger tap targets (min 44x44px)
- Bottom sheet popups (full width)
- Swipe to close word bank panel
- Sticky progress bar

**Responsive design:**
- Stack layout on mobile
- Word bank panel slides from bottom
- Font size adjustments
- Condensed header

**Performance:**
- Virtualized long articles (React Virtuoso)
- Lazy load images
- Debounced scroll handlers

## User Flow

### First-time reading flow:
1. User selects article from Home
2. Lands on `/article/:id` (ArticleView page)
3. Sees segmented article content
4. Hovers/clicks first word
5. Popup appears with definition
6. User clicks "Save to Word Bank"
7. Word appears in side panel
8. Continues reading, saving words
9. Scrolls to bottom (80%+)
10. "Did you like this topic?" modal appears
11. User selects preference
12. Returns to Home with updated recommendations

### Returning user flow:
1. User resumes article from Progress page
2. Previously saved words already in word bank
3. Unsave button (trash icon) appears in popups
4. Can toggle between saving/unsaving
5. Word bank panel syncs in real-time

## Settings & Preferences

Users can configure:
- **Word popup mode:** Hover or click (Settings page)
- **Word bank position:** Right or left side (Settings page)
- **Always show furigana:** Override familiarity system (Settings page)
- **Theme:** Dark or light mode (affects popup styling)

All preferences stored in database and synced across devices.

## Analytics

Tracked interactions:
- `word_interactions` table records:
  - `click` - Word looked up
  - `save` - Word saved to word bank
  - `phrase_highlight` - Phrase selected

**Use cases:**
- Identify difficult words (high click count, low save rate)
- Detect grammar patterns needing explanation
- Improve article difficulty calibration
- Personalize recommendations

## Accessibility

- **Keyboard navigation:** Tab through words, Enter to open popup
- **Screen readers:** ARIA labels on all interactive elements
- **High contrast:** Theme-aware colors
- **Focus indicators:** Clear visual focus states
- **Semantic HTML:** Proper heading hierarchy, landmarks

## Future Enhancements

- [ ] Word notes visible in popup (currently only in word bank)
- [ ] Inline grammar explanations (tooltips on particles)
- [ ] Article bookmarking
- [ ] Highlight difficult words before reading
- [ ] Reading speed analytics
- [ ] Audio article narration
- [ ] Sentence-level translation on hover
- [ ] Export annotations/highlights
- [ ] Collaborative reading (classroom mode)
- [ ] AI chat assistant for questions about article

## Related Files

**Components:**
- `frontend/src/components/reading/ArticleReader.tsx` - Main reading interface
- `frontend/src/components/reading/WordPopup.tsx` - Definition popup
- `frontend/src/components/reading/PhrasePopup.tsx` - Phrase lookup
- `frontend/src/components/reading/FuriganaText.tsx` - Furigana rendering
- `frontend/src/components/wordbank/WordBankPanel.tsx` - Side panel

**Hooks:**
- `frontend/src/hooks/useKanjiFamiliarity.ts` - Furigana control
- `frontend/src/hooks/useWordPopupMode.ts` - Hover vs click preference
- `frontend/src/hooks/useWordBankPanelPosition.ts` - Panel position

**Libraries:**
- `frontend/src/lib/dictionaries/chinese.ts` - Chinese dictionary + character breakdown
- `frontend/src/lib/dictionaries/jisho.ts` - Japanese dictionary (Jisho API)
- `frontend/src/lib/segmentation/chinese.ts` - Chinese segmentation
- `frontend/src/lib/segmentation/japanese.ts` - Japanese segmentation

**Types:**
- `frontend/src/types/index.ts` - `DictionaryResult`, `Article`, `SegmentedWord`

**Pages:**
- `frontend/src/pages/ArticleView.tsx` - Article reading page
- `frontend/src/pages/Settings.tsx` - User preferences

**Admin:**
- `frontend/src/components/admin/PreloadDefinitions.tsx` - Definition preloading UI
- `frontend/src/scripts/preloadArticleDefinitions.ts` - Preloading logic
