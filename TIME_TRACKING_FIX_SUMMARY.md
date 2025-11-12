# Time Tracking Fix Summary

## Problem
Reading time was only saved when users completed an article (scrolled to 80%). If users exited before completion, all their reading time was lost.

## Solution Implemented

### 1. Automatic Progress Tracking
**File:** `frontend/src/components/reading/ArticleReader.tsx`

**Changes:**
- Create a `reading_history` record immediately when article loads (with `completed_at = NULL`)
- **Periodic saves**: Auto-save reading time every 30 seconds while reading
- **Exit saves**: Save time when user:
  - Closes the browser tab
  - Navigates away from the article
  - Switches to another tab (using `visibilitychange` event)
  - Component unmounts
- **Completion tracking**: Update `completed_at` timestamp only when user scrolls to 80%+

### 2. Database Schema Update
**File:** `frontend/supabase/migrations/fix_reading_history_partial_tracking.sql`

**Changes:**
- Made `completed_at` column **nullable** (no longer defaults to NOW())
- `completed_at = NULL` → Article in progress
- `completed_at = timestamp` → Article completed
- Added indexes for filtering completed vs in-progress articles

### 3. Progress Page Updates
**File:** `frontend/src/pages/Progress.tsx`

**Changes:**
- Fetches **all** reading history (both completed and in-progress)
- **Total time** calculated from all sessions (including partial reads)
- **Articles read count** only counts completed articles
- **Streak calculation** only uses completed articles
- **Recent articles** only shows completed ones

## How to Apply

### Step 1: Run Database Migration

1. Open Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy contents of `frontend/supabase/migrations/fix_reading_history_partial_tracking.sql`
4. Paste and **Run**

### Step 2: Test the Fix

1. **Open an article** and start reading
2. **Wait 30 seconds** - Check console for "Progress auto-saved" message
3. **Navigate away** before completing - Time should be saved
4. **Go to Progress page** - You should see the reading time accumulated
5. **Go back and complete the article** - Article should be marked complete

## Expected Behavior

### ✅ Before Completion (in-progress)
- Reading time updates every 30 seconds
- Time saved when you exit the page
- Shows in total time on Progress page
- Does NOT count as "article completed"

### ✅ After Completion (80%+ scroll)
- Article marked as completed (`completed_at` set)
- Counts toward "Articles Read" stat
- Counts toward streak calculation
- Shows in "Recently Completed" section

## Console Logs to Watch For

```javascript
// On page load
"Error creating reading history:" // If there's a problem creating the record

// Every 30 seconds
"Progress auto-saved: { timeSpentSeconds: 45, wordsSaved: 3 }"

// On page exit
"Error saving on unload:" // If there's a problem saving

// On 80%+ scroll
"Article completed: { timeSpentSeconds: 320, wordsSaved: 12 }"
```

## Troubleshooting

### Time not saving?
1. Check browser console for errors
2. Verify database migration ran successfully
3. Check Supabase logs for permission errors
4. Ensure user is logged in

### Duplicate reading history entries?
- The system checks for existing records before creating new ones
- Each article should have max 1 record per user
- Re-visiting an article will update the existing record

### Progress page showing 0 minutes?
1. Make sure you've run the database migration
2. Check that reading_history table has records with `time_spent_seconds > 0`
3. Verify the Progress page is querying all history (not just completed)

## Database Schema Reference

### reading_history table
```sql
id                    UUID PRIMARY KEY
user_id               UUID NOT NULL
article_id            UUID (nullable - for regular articles)
generated_article_id  UUID (nullable - for generated articles)
article_source        TEXT ('articles' or 'generated_articles')
time_spent_seconds    INTEGER DEFAULT 0
words_saved_count     INTEGER DEFAULT 0
completed_at          TIMESTAMP (nullable - NULL if in progress)
liked                 BOOLEAN (nullable)
```

### Key Differences from Before
| Field | Before | After |
|-------|--------|-------|
| `completed_at` | `DEFAULT NOW()` | `NULL` by default |
| Creation | Only on 80%+ scroll | Immediately on page load |
| Updates | None | Every 30s + on exit |

## Benefits

✅ **No lost time**: All reading time is tracked, even partial sessions
✅ **Real-time progress**: Updates every 30 seconds
✅ **Reliable exit tracking**: Multiple handlers ensure save on exit
✅ **Accurate metrics**: Teachers and students see true reading time
✅ **Better insights**: Can see which articles users start but don't finish

## Future Enhancements

- [ ] Add "Resume reading" feature for in-progress articles
- [ ] Show reading time per article on article cards
- [ ] Weekly/monthly reading time charts
- [ ] Reading goals and achievements based on time spent
