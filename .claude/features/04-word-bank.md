# Word Bank

## Overview

The Word Bank is a personal vocabulary management system where users save, organize, review, and practice words they encounter while reading. It features rich dictionary metadata, custom flashcard practice, filtering/sorting, and spaced repetition tracking.

## Features

### A. Word List View

Comprehensive table/grid displaying saved words with:
- **Word** - Target language text
- **Reading** - Pronunciation (Pinyin/Hiragana)
- **Definition** - Primary English meaning
- **Status** - Learning or Mastered (badge)
- **Times Reviewed** - Practice count
- **Actions** - Edit, Delete, Toggle Status

**Layout options:**
- **Table view** (desktop) - Sortable columns
- **Card grid** (mobile) - Touch-friendly cards

**Implementation:**
- `WordBankList.tsx` - Main word bank page
- `WordCard.tsx` - Individual word card component

### B. Rich Metadata Display

**NEW FEATURE:** Words saved from articles now include comprehensive dictionary data.

**Expandable "Show More" section reveals:**

1. **Grammar Notes** (Blue badge)
   - Contextual grammar explanations
   - Especially useful for particles and function words
   - Examples: は (topic marker), が (subject marker), 了 (aspect particle)

2. **Formality Level** (Gray badge)
   - casual | polite | formal
   - Helps learners use appropriate language
   - Important for Japanese keigo (polite language)

3. **Usage Notes** (Amber badge)
   - Context about when/how to use the word
   - Collocations and common patterns
   - Regional variations or alternatives

4. **Additional Definitions** (List)
   - Multiple meanings with parts of speech
   - Format: `(noun) learning • (verb) to study`
   - Helps distinguish homonyms

5. **User Notes** (Green badge)
   - Personal notes, mnemonics, examples
   - Editable by user (text area)
   - Synced across devices
   - Color-coded for easy identification

**Database structure:**
```sql
CREATE TABLE word_bank (
  ...
  user_notes TEXT,
  grammar_notes TEXT,
  formality_level TEXT,
  usage_notes TEXT,
  additional_definitions JSONB,
  ...
);
```

### C. Filtering & Search

**Filter options:**
- **Status:** All, Learning, Mastered
- **Language:** Chinese, Japanese
- **Difficulty:** (inferred from times_reviewed)
- **Search:** Real-time text search across word, reading, definition

**Search implementation:**
- Client-side filtering (fast, no network)
- Debounced input (300ms)
- Highlights matching text

**Example query:**
```typescript
filteredWords = words.filter(w =>
  w.word.includes(search) ||
  w.reading?.includes(search) ||
  w.definition.includes(search)
);
```

### D. Sorting

**Sort options:**
- **Date added** (default) - Newest first
- **Alphabetical** - A-Z by word
- **Times reviewed** - Least reviewed first (prioritize weak words)
- **Status** - Learning first, then Mastered

**Implementation:**
```typescript
const sortedWords = [...words].sort((a, b) => {
  if (sort === 'date') return new Date(b.first_seen_at) - new Date(a.first_seen_at);
  if (sort === 'alpha') return a.word.localeCompare(b.word);
  if (sort === 'reviewed') return a.times_reviewed - b.times_reviewed;
  ...
});
```

### E. Word Actions

**Per-word actions:**

1. **Toggle Status** (Learning ⇄ Mastered)
   - Visual indicator: Badge color changes
   - Updates `status` column in database
   - Mastered words optionally hidden from practice

2. **Delete Word**
   - Confirmation dialog: "Remove [word] from word bank?"
   - Permanent deletion from database
   - Cannot be undone (warn user)

3. **Edit Notes** (NEW)
   - Expand word card
   - Edit `user_notes` text area
   - Auto-save on blur
   - Character limit: 500 chars

4. **View Example Sentences**
   - Expandable section
   - Shows example sentence from dictionary
   - Context from original article (if saved during reading)

### F. Flashcard Practice

Spaced repetition practice system with customizable settings.

**Practice modes:**
1. **Standard** - All learning words
2. **Weak words** - Low review count (< 3)
3. **Custom set** - User-selected words

**Flashcard UI:**
```
┌───────────────────────────────┐
│  Card 5 of 20                 │
├───────────────────────────────┤
│                               │
│         学习                  │
│                               │
│    [Click to reveal]          │
│                               │
└───────────────────────────────┘
│ [I know this] [I don't know]  │
└───────────────────────────────┘
```

**After reveal:**
```
┌───────────────────────────────┐
│  Card 5 of 20                 │
├───────────────────────────────┤
│         学习                  │
│        xuéxí                  │
│                               │
│    to study; to learn         │
│                               │
│  Example: 我每天学习中文        │
└───────────────────────────────┘
│ [I know this] [I don't know]  │
└───────────────────────────────┘
```

**Customization options (NEW):**
- **Cards per session:** 10, 20, 50, All
- **Shuffle cards:** On/Off
- **Auto-advance:** Off, 3s, 5s, 10s
- **Show reading:** Always, On reveal, Never

**Saved preferences:**
- Stored in `localStorage`
- Persistent across sessions
- Per-user settings

**Review tracking:**
- Increments `times_reviewed` on "I know this"
- Updates `last_reviewed_at` timestamp
- Future: Spaced repetition scheduling (SM-2 algorithm)

**Implementation:**
- `FlashcardPractice.tsx` - Practice interface
- `FlashcardSettings.tsx` - Customization modal

### G. Bulk Actions

**Multi-select mode:**
- Checkbox on each word card
- "Select All" / "Select None" buttons
- Bulk actions toolbar appears

**Bulk operations:**
- **Mark as Mastered** - Update status for all selected
- **Delete Selected** - Batch deletion with confirmation
- **Export** - Download as CSV/JSON (future feature)

### H. Word Statistics

**Dashboard card displays:**
- **Total words saved:** Count
- **Learning:** Count (green)
- **Mastered:** Count (blue)
- **This week:** Words added in last 7 days
- **Review progress:** Avg times reviewed

**Visualizations (future):**
- Progress chart over time
- Words per difficulty level
- Most reviewed words
- Learning streak

### I. Integration with Reading

**Seamless connection to articles:**

1. **Save from article reader:**
   - Click "Save to Word Bank" in WordPopup
   - Optionally add user notes
   - All dictionary metadata automatically included
   - Real-time sync to word bank page

2. **Word Bank side panel:**
   - Shows saved words during reading
   - Click word to jump back to location in article
   - Unsave button (trash icon)
   - Collapsible for distraction-free reading

3. **Context preservation:**
   - Future: Store sentence context from article
   - Future: Link back to source article

## User Flow

### Saving a word:
1. User reads article and clicks word
2. WordPopup appears with full definition
3. User optionally adds personal notes in textarea
4. User clicks "Save to Word Bank"
5. Toast notification: "Saved [word] to Word Bank"
6. Word appears in side panel
7. Word accessible from Word Bank page

### Practicing words:
1. User navigates to Word Bank page
2. Clicks "Start Practice"
3. Selects practice mode and settings
4. Reviews flashcards, marking known/unknown
5. Completes session, sees summary
6. Review counts updated in word bank

### Editing a word:
1. User finds word in Word Bank list
2. Expands word card (click chevron)
3. Sees all metadata in expandable sections
4. Edits user notes
5. Clicks outside to auto-save
6. Changes synced to database

## Database Schema

```sql
CREATE TABLE word_bank (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  word TEXT NOT NULL,
  language TEXT NOT NULL,
  definition TEXT NOT NULL,
  reading TEXT,
  example_sentence TEXT,

  -- Rich metadata (NEW)
  user_notes TEXT,
  grammar_notes TEXT,
  formality_level TEXT,
  usage_notes TEXT,
  additional_definitions JSONB,

  -- Learning progress
  status TEXT DEFAULT 'learning',
  times_reviewed INTEGER DEFAULT 0,
  first_seen_at TIMESTAMP DEFAULT NOW(),
  last_reviewed_at TIMESTAMP,

  UNIQUE(user_id, word, language)
);
```

**JSONB structure for additional_definitions:**
```json
[
  {"meaning": "to study", "partOfSpeech": "verb"},
  {"meaning": "learning", "partOfSpeech": "noun"}
]
```

## Spaced Repetition (Future)

**Planned algorithm:** SM-2 (SuperMemo 2)

**Additional columns needed:**
```sql
ALTER TABLE word_bank
  ADD COLUMN easiness_factor FLOAT DEFAULT 2.5,
  ADD COLUMN interval INTEGER DEFAULT 1,
  ADD COLUMN repetitions INTEGER DEFAULT 0,
  ADD COLUMN next_review_date DATE;
```

**Review scheduling:**
- New words: Review tomorrow
- Easy words: Exponential backoff (1d → 6d → 14d → ...)
- Difficult words: Shorter intervals
- User feedback adjusts easiness factor

## Export & Import (Future)

**Export formats:**
- **CSV** - For Excel/Sheets
- **JSON** - For backups
- **Anki** - Standard flashcard format (TSV)

**Export fields:**
- Word, Reading, Definition
- User notes (important for mnemonics)
- Times reviewed, Status
- All rich metadata

**Import:**
- Upload CSV/JSON
- Map columns to fields
- Deduplicate existing words
- Batch insert

## Mobile Optimization

**Responsive design:**
- Card grid layout on mobile
- Swipe actions (swipe left to delete, right to mark mastered)
- Bottom sheet for word details
- Touch-friendly buttons (min 44x44px)

**Performance:**
- Virtual scrolling for 1000+ words
- Lazy load word details
- Optimistic UI updates (instant feedback)

## Accessibility

- **Keyboard shortcuts:** Arrow keys for navigation, Space to reveal
- **Screen reader support:** ARIA labels for all actions
- **High contrast mode:** Theme-aware colors
- **Focus management:** Trap focus in modal during practice

## Related Files

**Components:**
- `frontend/src/components/wordbank/WordBankList.tsx` - Main word bank page
- `frontend/src/components/wordbank/WordCard.tsx` - Individual word card
- `frontend/src/components/wordbank/FlashcardPractice.tsx` - Practice interface
- `frontend/src/components/wordbank/WordBankPanel.tsx` - Reading side panel

**Pages:**
- `frontend/src/pages/WordBank.tsx` - Word bank page route

**Hooks:**
- `frontend/src/hooks/useWordBank.ts` - Word CRUD operations (if exists)

**Types:**
- `frontend/src/types/index.ts` - `WordBankEntry` interface

**Database:**
- `word_bank` table in Supabase

## API Endpoints (Supabase)

**Get user's word bank:**
```typescript
const { data, error } = await supabase
  .from('word_bank')
  .select('*')
  .eq('user_id', user.id)
  .order('first_seen_at', { ascending: false });
```

**Save word:**
```typescript
const { data, error } = await supabase
  .from('word_bank')
  .insert({
    user_id: user.id,
    word: '学习',
    language: 'zh',
    definition: 'to study; to learn',
    reading: 'xuéxí',
    grammar_notes: '...',
    user_notes: 'Mnemonic: Learning requires practice',
    // ... other fields
  });
```

**Update word:**
```typescript
const { data, error } = await supabase
  .from('word_bank')
  .update({
    status: 'mastered',
    times_reviewed: current_count + 1,
    last_reviewed_at: new Date().toISOString(),
  })
  .eq('id', word_id);
```

**Delete word:**
```typescript
const { error } = await supabase
  .from('word_bank')
  .delete()
  .eq('id', word_id)
  .eq('user_id', user.id); // Security: Only delete own words
```

## Security

- **Row Level Security (RLS):** Users can only access their own words
- **Policy:** `auth.uid() = user_id` on all operations
- **No cross-user data leakage:** Enforced at database level
- **Soft delete option:** Flag as `deleted` instead of hard delete (future)

## Future Enhancements

- [ ] Spaced repetition (SM-2 algorithm)
- [ ] Export to Anki format
- [ ] Import from CSV/JSON
- [ ] Word difficulty scoring
- [ ] Learning streaks and badges
- [ ] Word associations (related words)
- [ ] Audio pronunciation in flashcards
- [ ] Handwriting practice (draw characters)
- [ ] Shared word lists (classroom/community)
- [ ] Word usage frequency (HSK level, JLPT level)
- [ ] Etymology information
- [ ] Sentence mining (extract from articles)
- [ ] Word clouds visualization
- [ ] Progress heatmap calendar
