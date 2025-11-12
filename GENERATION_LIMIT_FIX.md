# Generation Limit Bug Fix

## Problem
Users were seeing "5/5 generations remaining" in the UI but getting "Daily generation limit reached" errors when trying to generate articles.

## Root Cause
The `check_generation_limit()` database function was incrementing the counter **before** the article was successfully saved. If any step failed after the counter increment (Gemini API error, parsing error, database save error), the user would "lose" a generation without receiving an article.

**Problematic flow:**
1. User clicks "Generate Article"
2. Backend calls `check_generation_limit()` → counter increments immediately
3. Gemini API generates content
4. ❌ Database save fails
5. Counter was already incremented, so user lost a generation

After 5 failed attempts, the counter shows 5 but the user has 0 articles.

## Solution
Separated the limit checking from the counter incrementing:
- `check_generation_limit()` now ONLY checks if under limit (doesn't increment)
- New `increment_generation_count()` function increments ONLY after article is saved
- Counter only increments when article is successfully saved to database

**Fixed flow:**
1. User clicks "Generate Article"
2. Backend checks `check_generation_limit()` (doesn't increment)
3. Gemini API generates content
4. Frontend saves article to database
5. ✅ Only if save succeeds → increment counter
6. If save fails → counter unchanged, user can retry

## Files Changed

### 1. Database Migration (NEW)
**File:** `frontend/supabase/migrations/fix_generation_limit_counting.sql`
- Modified `check_generation_limit()` to only check, not increment
- Created `increment_generation_count()` to increment separately
- Added permission grants

### 2. Edge Function
**File:** `frontend/supabase/functions/generate-article/index.ts`
- Line 107-124: Updated to check limit without incrementing
- Removed counter increment from edge function (moved to frontend)

### 3. Frontend
**File:** `frontend/src/pages/Reading.tsx`
- Line 205-212: Added call to `increment_generation_count()` after successful article save
- Counter only increments when article is fully saved

## Deployment Steps

### Step 1: Apply Database Migration
1. Open Supabase Dashboard → SQL Editor
2. Copy contents of `frontend/supabase/migrations/fix_generation_limit_counting.sql`
3. Paste and execute
4. Verify no errors

### Step 2: Deploy Edge Function
```bash
# Navigate to frontend directory
cd frontend

# Deploy the updated edge function
npx supabase functions deploy generate-article
```

### Step 3: Deploy Frontend
```bash
# If using Vercel (auto-deploy on git push)
git add .
git commit -m "Fix: Only count successful article generations"
git push origin main

# Or manually build and deploy
npm run build
# Deploy dist/ folder to your hosting
```

### Step 4: Reset Generation Counts (Optional)
If you want to give affected users a fresh start:

```sql
-- Run in Supabase SQL Editor
-- This resets today's counts for all users
UPDATE generation_limits
SET count = 0, last_generated_at = NOW()
WHERE generation_date = CURRENT_DATE;
```

## Testing

1. **Check Remaining Generations:**
   - Visit `/reading` page
   - Should show "Generations remaining today: 5/5"

2. **Generate Article:**
   - Enter topic, click "Generate Article"
   - Should succeed and show "4/5" remaining

3. **Verify Failed Generation Doesn't Count:**
   - Temporarily break database (e.g., disconnect internet during save)
   - Try to generate → should fail
   - Refresh page → should still show same count (not decremented)

4. **Reach Limit:**
   - Generate 5 articles
   - Should show "0/5" remaining
   - Try to generate another → should get limit error
   - Both UI and backend should agree on limit

## Verification Queries

```sql
-- Check a user's generation count for today
SELECT * FROM generation_limits
WHERE user_id = 'USER_ID_HERE'
AND generation_date = CURRENT_DATE;

-- Check all generated articles for a user today
SELECT COUNT(*) FROM generated_articles
WHERE user_id = 'USER_ID_HERE'
AND DATE(created_at) = CURRENT_DATE;

-- The counts should match!
```

## Notes
- The fix ensures counter only increments on successful article saves
- Failed generations no longer consume the daily limit
- Counter resets automatically at midnight (by date)
- No data loss - all existing articles are preserved
