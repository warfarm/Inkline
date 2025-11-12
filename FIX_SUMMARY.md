# Fix Summary: 409 Errors for Word Interactions and Reading Progress

## Problem Identified

The application was throwing 409 (Conflict) errors when:
1. Hovering over words to see definitions
2. Saving words to the word bank
3. Tracking reading progress completion

### Root Cause

The database schema supports two types of articles:
- **Regular articles** (stored in `articles` table)
- **Generated articles** (stored in `generated_articles` table)

However, the `word_interactions` and `reading_history` tables only had foreign key constraints referencing the `articles` table. When users viewed generated articles, the system tried to insert records with an `article_id` that didn't exist in the `articles` table, causing foreign key constraint violations (409 errors).

**Error Messages:**
```
POST https://...supabase.co/rest/v1/word_interactions 409 (Conflict)
POST https://...supabase.co/rest/v1/reading_history 409 (Conflict)

Error tracking completion:
{
  code: '23503',
  details: 'Key is not present in table "articles".',
  message: 'insert or update on table "reading_history" violates foreign key constraint "reading_history_article_id_fkey"'
}
```

## Solution Implemented

### 1. Database Migration

**File:** `frontend/supabase/migrations/fix_article_tracking_for_generated.sql`

The migration:
- Adds `article_source` column to track whether the article is from `articles` or `generated_articles`
- Adds `generated_article_id` foreign key column for generated articles
- Updates foreign key constraints to support both article types
- Adds performance indexes for the new columns

### 2. Frontend Code Updates

**Files Modified:**
- `frontend/src/components/reading/ArticleReader.tsx`
- `frontend/src/pages/ArticleView.tsx`

**Changes:**
- Added `isGenerated` prop to `ArticleReader` component
- Updated all database inserts to include `article_source` field
- Conditionally set either `article_id` or `generated_article_id` based on article type

## How to Apply the Fix

### Step 1: Run the Database Migration

1. Open your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Open the file: `frontend/supabase/migrations/fix_article_tracking_for_generated.sql`
4. Copy the entire contents
5. Paste into the SQL Editor
6. Click **Run** to execute the migration

### Step 2: Test the Application

1. Clear your browser cache and refresh the page
2. Test with a **regular article**:
   - Navigate to an article from the Home page
   - Hover over words to see definitions
   - Save a word to your word bank
   - Scroll to 80% to trigger reading completion
   - Verify no 409 errors in the console

3. Test with a **generated article** (if you have the article generation feature):
   - Generate a new article
   - Open the generated article
   - Hover over words to see definitions
   - Save a word to your word bank
   - Scroll to 80% to trigger reading completion
   - Verify no 409 errors in the console

## Expected Behavior After Fix

✅ **Word hovering/clicking**: No more 409 errors when looking up definitions
✅ **Saving words**: Words save successfully to word bank from both article types
✅ **Reading progress**: Completion tracking works for both regular and generated articles
✅ **Console logs**: Should show "Reading progress saved" with the correct source type

## Database Schema Changes

### word_interactions table

**New columns:**
- `article_source` (TEXT): 'articles' or 'generated_articles'
- `generated_article_id` (UUID): Foreign key to generated_articles table

### reading_history table

**New columns:**
- `article_source` (TEXT): 'articles' or 'generated_articles'
- `generated_article_id` (UUID): Foreign key to generated_articles table

## Backward Compatibility

✅ **Existing data preserved**: All existing records are automatically set to `article_source = 'articles'`
✅ **No data loss**: Migration only adds new columns, doesn't remove anything
✅ **Gradual rollout**: Old code will continue to work until frontend is deployed

## Rollback Instructions (if needed)

If you need to rollback the changes:

```sql
-- Remove the new columns
ALTER TABLE word_interactions DROP COLUMN IF EXISTS article_source;
ALTER TABLE word_interactions DROP COLUMN IF EXISTS generated_article_id;

ALTER TABLE reading_history DROP COLUMN IF EXISTS article_source;
ALTER TABLE reading_history DROP COLUMN IF EXISTS generated_article_id;

-- Re-add the original foreign key constraints
ALTER TABLE word_interactions
  ADD CONSTRAINT word_interactions_article_id_fkey
  FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE;

ALTER TABLE reading_history
  ADD CONSTRAINT reading_history_article_id_fkey
  FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE;
```

## Additional Notes

- The migration is safe to run multiple times (uses `IF NOT EXISTS`)
- Performance impact is minimal due to new indexes
- The frontend code defaults to `isGenerated = false` for backward compatibility

## Questions or Issues?

If you encounter any issues:
1. Check the Supabase logs for detailed error messages
2. Verify the migration ran successfully
3. Clear browser cache and reload
4. Check the console for any remaining error messages
