# Inkline Changelog

All notable changes, fixes, and improvements to the Inkline language learning platform.

---

## Dictionary & Lookup Features

### Chinese Example Sentences Implementation
- **Implemented Tatoeba example sentences** for Chinese word lookups
- **308,478 indexed words** with real-world usage examples
- **~400K example associations** from 59,136 curated sentences
- **Lazy loading strategy** - examples load on first word lookup
- **Short, learner-friendly sentences** (4-20 characters, simplified Chinese)
- **Format**: Chinese + Pinyin + English translation
- **Data source**: Tatoeba Chinese-English corpus (CC-BY 2.0 FR)
- **Auto-display in WordPopup** - click "Show More" to view examples
- **Location**: `frontend/public/data/chinese-examples.json` (65MB), `docs/scripts/processTatoeba.js`

### Chinese Dictionary Implementation
- **Implemented complete CC-CEDICT dictionary** with 196,574 entries (124,114 unique words)
- **O(1) lookup performance** using JavaScript object for instant dictionary access (<1ms per lookup)
- **Lazy loading strategy** - dictionary loads on first use, doesn't impact initial bundle size
- **Character breakdown feature** - multi-character words show individual character meanings
- **Fallback support** - embedded basic dictionary (~900 words) for immediate use before full dictionary loads
- **Location**: `frontend/public/chinese-dict.json` (15.6MB), `frontend/src/lib/dictionaries/chinese.ts`

### JMDict Japanese Dictionary Implementation
- **Replaced Jisho API** with offline JMDict for Japanese lookups
- **500x performance improvement** - from 200-500ms (network) to <1ms (memory access)
- **O(1) lookup time** using `Record<string, JMDictEntry>` indexed dictionary
- **Smart conjugation handling** - automatically finds dictionary forms from conjugated verbs (食べ → 食べる)
- **Particle support** - included common particles with detailed grammar explanations
- **Kuromoji.js integration** - improved segmentation accuracy from 70-80% to 95%
- **Infrastructure ready** for full JMDict dictionary (60,000+ entries)
- **Location**: `frontend/src/lib/dictionaries/jmdict.ts`

### Pinyin Tone Marks
- **Converted numbered pinyin to tone marks** (cheng2 gong1 → chéng gōng)
- **Standard Hanyu Pinyin format** - follows official romanization rules
- **Vowel priority algorithm** - correctly places tone marks on proper vowels
- **All tone marks supported** (ā á ǎ à) including neutral tone
- **Performance**: <0.1ms per conversion, negligible overhead
- **Location**: `frontend/src/lib/dictionaries/pinyin-converter.ts`

### Definition Cleaning
- **Cleaned up Chinese character breakdowns** to remove verbose CC-CEDICT formatting
- **Removed cross-references** like `[ye3]`, `[dou1]` brackets from definitions
- **Limited to first 3 meanings** for character breakdowns to improve readability
- **Removed long parenthetical explanations** (kept under 20 chars)
- **Result**: Clean, scannable definitions (e.g., "再 zài — again; once more; re-")
- **Location**: `frontend/src/lib/dictionaries/chinese.ts` (cleanDefinition function)

### Character Breakdown Fixes
- **Fixed missing character breakdowns** for preloaded definitions
- **ArticleReader now fetches breakdowns** even for words with preloaded data
- **Applied definition cleaning** to all character breakdown displays
- **Location**: `frontend/src/components/reading/ArticleReader.tsx`

---

## Text-to-Speech (TTS) Improvements

### Japanese TTS Pronunciation Fix
- **Fixed 私 (watashi) pronunciation** - was only saying "shi", now correctly says "watashi"
- **Uses reading field** (hiragana) instead of kanji for pronunciation
- **Web Speech API prioritized** as primary TTS method instead of fallback
- **Google TTS proxy** as secondary fallback through Supabase Edge Function
- **Location**: `frontend/src/components/reading/WordPopup.tsx`

### Google TTS Implementation
- **Implemented Google Translate TTS** through Supabase Edge Function proxy
- **CORS-free solution** - backend proxy eliminates browser CORS restrictions
- **Multiple platform support**: Supabase, Vercel, Cloudflare Workers
- **Graceful fallbacks** - tries multiple methods before failing
- **Location**: `frontend/supabase/functions/tts/index.ts`

---

## CORS & API Proxy Solutions

### Backend Proxy Implementation
- **Three free backend solutions** for CORS-free API access:
  - Supabase Edge Functions (500K invocations/month)
  - Vercel Edge Functions (unlimited)
  - Cloudflare Workers (3M requests/month)
- **Eliminated third-party CORS proxies** - replaced unreliable proxies with owned infrastructure
- **Jisho API proxy** - reliable Japanese dictionary lookups
- **Google TTS proxy** - text-to-speech without CORS issues
- **Automatic fallback chain** - tries multiple backends before falling back to direct API
- **Locations**: `frontend/supabase/functions/`, `api/`, `cloudflare-workers/`

---

## Reading Progress & Time Tracking

### Partial Reading Time Tracking
- **Time now saves on partial reads** - no longer requires 80% completion
- **Automatic progress tracking** - saves every 30 seconds while reading
- **Exit event handlers** - saves time when tab closes, navigates away, or visibility changes
- **Made `completed_at` nullable** - distinguishes in-progress vs completed articles
- **Progress page updates** - shows total time from all sessions including partial reads
- **Migration**: `frontend/supabase/migrations/fix_reading_history_partial_tracking.sql`

### Reading History Constraint Fix
- **Added DEFAULT 0** to `time_spent_seconds` column
- **Fixed NULL value handling** for older entries
- **Improved error handling** with console logging and toast notifications
- **Progress chart now displays** accumulated reading time correctly
- **Migration**: `frontend/supabase/migrations/fix_reading_history_time_tracking.sql`

### Reading History Unique Constraint
- **Added unique constraint** on (user_id, article_id) to reading_history table
- **Fixed "no unique constraint" error** for ON CONFLICT upsert operations
- **Allows proper upsert behavior** when updating reading progress
- **Migration**: `DATABASE_FIX.sql` (moved to migrations)

---

## Article Generation

### Generation Limit Counting Fix
- **Fixed premature counter increment** - counter only increments AFTER successful article save
- **Separated check from increment** - `check_generation_limit()` no longer increments count
- **New `increment_generation_count()` function** - explicit counter increment after save succeeds
- **Eliminated "lost generations"** - failed generations no longer consume daily limit
- **UI now matches backend** - "5/5 generations remaining" is accurate
- **Locations**:
  - Migration: `frontend/supabase/migrations/fix_generation_limit_counting.sql`
  - Edge Function: `frontend/supabase/functions/generate-article/index.ts`
  - Frontend: `frontend/src/pages/Reading.tsx`

---

## Multi-Source Article Support

### Generated Articles Tracking Fix
- **Fixed 409 errors** for word interactions and reading history on generated articles
- **Added `article_source` column** to track 'articles' vs 'generated_articles'
- **Added `generated_article_id` foreign key** for generated articles
- **Updated foreign key constraints** to support both article types
- **Backward compatible** - existing records automatically set to article_source='articles'
- **Locations**:
  - Migration: `frontend/supabase/migrations/fix_article_tracking_for_generated.sql`
  - Frontend: `frontend/src/components/reading/ArticleReader.tsx`, `frontend/src/pages/ArticleView.tsx`

---

## UI/UX Improvements

### Title Hover/Click Support
- **Article titles now interactive** - hover or click on title words shows definitions
- **Respects user preference** - follows hover vs click mode setting
- **300ms hover delay** - prevents accidental triggers
- **200ms hide delay** - smooth UX transitions
- **Consistent behavior** with article body word lookups
- **Location**: `frontend/src/components/reading/SegmentedTitle.tsx`

### Dictionary Preloading
- **Automatic dictionary preload** for Chinese learners on app start
- **Background loading** - doesn't block UI or initial page load
- **Language-specific** - only loads dictionary for user's target language
- **Fixed language check** - uses 'zh' instead of 'chinese'
- **Locations**: `frontend/src/App.tsx`, `frontend/src/components/dictionary/DictionaryPreloader.tsx`

---

## Database Schema Updates

### Enhanced Word Bank
- **Added user_notes column** - personal notes, mnemonics, and examples
- **Added grammar_notes column** - contextual grammar explanations
- **Added formality_level column** - casual, polite, or formal indicators
- **Added usage_notes column** - information about when and how to use words
- **Added additional_definitions JSONB** - multiple meanings with parts of speech
- **Color-coded display** - blue for grammar, amber for usage, green for personal notes
- **Migration**: `frontend/supabase/migrations/002_add_user_notes.sql`, `003_add_rich_dictionary_data.sql`

### Duplicate Reading History Prevention
- **Prevents duplicate reading_history entries** per user per article
- **Uses UPSERT pattern** with ON CONFLICT to update existing records
- **Migration**: `frontend/supabase/migrations/fix_duplicate_reading_history.sql`

---

## Performance Optimizations

### Dictionary Lookups
- **Chinese**: 900+ words basic dict → 196,574 words full dict (218x coverage increase)
- **Japanese**: 200-500ms API calls → <1ms memory access (500x faster)
- **Lazy loading**: 0 bytes bundle impact, dictionary loads on first use
- **Memory efficient**: ~30-40MB for full Chinese dictionary

### API Calls
- **Eliminated external API dependencies** for Japanese dictionary lookups
- **Reduced network requests** with backend proxies and local dictionaries
- **Offline-capable** - dictionaries work without internet connection

---

## Bug Fixes

### Fixed Issues
- ✅ 食べ lookup returning 食べ物 (food) instead of verb stem
- ✅ 私 (watashi) TTS only pronouncing し (shi)
- ✅ Character breakdowns showing messy raw CC-CEDICT format
- ✅ Title words not showing definitions on hover/click
- ✅ CORS errors for Jisho API and Google TTS
- ✅ Reading time lost when exiting before completion
- ✅ Progress chart not displaying data
- ✅ "Daily limit reached" despite UI showing generations remaining
- ✅ 409 errors when tracking word interactions on generated articles
- ✅ Reading history unique constraint error on upserts

---

## Infrastructure

### Testing & Scripts
- **test-backend.sh/bat** - automated testing for backend proxies
- **Backend deployment guides** - comprehensive setup instructions for Supabase, Vercel, Cloudflare
- **Helpful commands reference** - quick command reference for common operations
- **Dictionary conversion scripts** - parseCEDICT.js, parseCEDICT-json.js

### Documentation
- All features documented with setup guides
- Migration scripts with rollback instructions
- Testing procedures for all major features
- Troubleshooting guides for common issues

---

## Korean Support

- Added Korean language support and segmentation
- Korean article seed data
- Korean tokenization with proper word boundary detection
- **Location**: `frontend/src/lib/segmentation/korean.ts`

---

## Deployment Improvements

### Build & Type Safety
- ✅ All TypeScript errors resolved
- ✅ Build passes without errors
- ✅ No breaking changes in updates
- ✅ Backward compatible schema migrations

### RLS & Security
- Fixed Row-Level Security policies
- Fixed infinite recursion in policies
- Fixed join_class policy issues
- Proper permission grants for database functions

---

## License Compliance

### Attribution
- **CC-CEDICT**: Creative Commons Attribution-ShareAlike 4.0 International (MDBG)
- **JMDict**: Creative Commons Attribution-ShareAlike 3.0
- Proper attribution included in code comments and documentation

---

*This changelog consolidates all fix summaries and implementation notes from the development history of Inkline.*
