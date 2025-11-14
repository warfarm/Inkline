# Article Generator Feature - Deployment Guide

This guide covers deploying the AI-powered article generator feature with Gemini API integration.

## Overview

The article generator allows users to create custom language learning articles based on their proficiency level and interests. It integrates with:
- Gemini 2.5 Flash API for article generation (free tier)
- Supabase Edge Functions for secure API key handling
- Supabase Database for storing generated articles
- Existing article reading infrastructure

## Prerequisites

- Supabase CLI installed (`npm install -g supabase`)
- Gemini API key from Google AI Studio
- Supabase project with database access
- Vercel account (for frontend deployment)

## Step 1: Database Setup

Run the database migration to create the required tables:

```bash
# Navigate to your Supabase SQL Editor
# Or use the Supabase CLI

# Run the migration file
supabase db push frontend/supabase/migrations/add_generated_articles.sql
```

Or manually execute the SQL in Supabase Dashboard → SQL Editor:

```sql
-- Copy and run the contents of:
-- frontend/supabase/migrations/add_generated_articles.sql
```

This creates:
- `generated_articles` table - Stores AI-generated articles
- `generation_limits` table - Tracks daily generation limits (5 per user per day)
- Helper functions for limit checking
- RLS policies for data security

**Verify installation:**
```sql
-- Check tables exist
SELECT tablename FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('generated_articles', 'generation_limits');

-- Test limit function
SELECT get_remaining_generations('YOUR_USER_ID'::uuid);
-- Should return: 5
```

## Step 2: Deploy Supabase Edge Function

### A. Initialize Supabase (if not already done)

```bash
cd frontend
supabase login
supabase link --project-ref YOUR_PROJECT_REF
```

### B. Set Environment Variables

```bash
# Set the Gemini API key as a secret
supabase secrets set GEMINI_API_KEY=AIzaSyBQUJz642_j46kMPLE8xI-SKJhCF0IcIuA

# Verify secrets
supabase secrets list
```

### C. Deploy the Edge Function

```bash
# Deploy the generate-article function
supabase functions deploy generate-article

# Expected output:
# Deploying function generate-article...
# Deployed function generate-article: https://YOUR_PROJECT_REF.supabase.co/functions/v1/generate-article
```

### D. Test the Edge Function

```bash
# Get your session token
# Login to your app and get the token from browser DevTools → Application → Local Storage

curl -X POST \
  'https://YOUR_PROJECT_REF.supabase.co/functions/v1/generate-article' \
  -H 'Authorization: Bearer YOUR_USER_JWT_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "topic": "Daily Life",
    "length": "short",
    "isTestArticle": false,
    "language": "zh",
    "difficultyLevel": "beginner",
    "wordBankWords": ["学习", "中文", "喜欢"]
  }'
```

**Expected response:**
```json
{
  "title": "我的日常生活",
  "content": "我每天早上七点起床...",
  "wordCount": 180,
  "topic": "Daily Life",
  "language": "zh",
  "difficultyLevel": "beginner",
  "isTestArticle": false,
  "articleLength": "short",
  "generationPrompt": "Daily Life",
  "wordBankWordsUsed": ["学习", "中文", "喜欢"]
}
```

## Step 3: Frontend Environment Variables

### A. Vercel Deployment

Add environment variable in Vercel Dashboard:

1. Go to Project Settings → Environment Variables
2. Add variable:
   - **Name:** `VITE_SUPABASE_URL`
   - **Value:** `https://YOUR_PROJECT_REF.supabase.co`
   - **Environments:** Production, Preview, Development

3. Existing variables should already include:
   - `VITE_SUPABASE_ANON_KEY`

**Note:** NO GEMINI_API_KEY in frontend - it's secured in Edge Function!

### B. Local Development

Create/update `.env.local`:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

## Step 4: Deploy Frontend

```bash
# Build and test locally first
cd frontend
npm install
npm run build

# Preview production build
npm run preview

# Deploy to Vercel
git add .
git commit -m "Add AI article generator feature"
git push origin main

# Vercel will auto-deploy if connected
```

## Step 5: Verification

### Test the Complete Flow:

1. **Navigate to Reading Page**
   - Go to `https://your-app.vercel.app/reading`
   - Should see generation form

2. **Check Generation Limit**
   - Should display "Generations remaining today: 5/5"

3. **Generate an Article**
   - Enter topic: "Technology"
   - Select length: "Medium"
   - Toggle "Test Article" if desired
   - Click "Generate Article"
   - Should see:
     - Progress bar (0% → 100%)
     - Typewriter effect displaying article
     - "Definitions preloaded!" toast notification

4. **Verify Article Storage**
   ```sql
   -- In Supabase SQL Editor
   SELECT id, title, topic, word_count, is_test_article
   FROM generated_articles
   WHERE user_id = 'YOUR_USER_ID';
   ```

5. **Check Daily Limit**
   - Generate 5 articles
   - Should see "Generations remaining today: 0/5"
   - Attempt 6th generation
   - Should see error: "Daily generation limit reached"

6. **Test Article Reading**
   - Click on generated article card
   - Should navigate to `/article/{id}?source=generated`
   - Back button should return to `/reading`
   - Word popup should show "✓ In Word Bank" for saved words

7. **Verify Definitions**
   - Click/hover over words in article
   - Should see instant definitions (preloaded)
   - No API delay

## Troubleshooting

### Edge Function Errors

**Error: "GEMINI_API_KEY not configured"**
```bash
# Re-set the secret
supabase secrets set GEMINI_API_KEY=YOUR_KEY_HERE
supabase functions deploy generate-article
```

**Error: "Unauthorized"**
```bash
# Check RLS policies
# Verify user is authenticated
# Check JWT token is valid
```

**Error: "Daily generation limit reached"**
```sql
-- Reset for testing
DELETE FROM generation_limits WHERE user_id = 'YOUR_USER_ID';
```

### Frontend Errors

**Error: "Failed to generate article from Gemini API"**
- Check Gemini API key is valid
- Verify quota not exceeded
- Check Edge Function logs: `supabase functions logs generate-article`

**Error: "Gemini API is currently overloaded"**
- This is a temporary 503 error from Google's servers
- The function automatically retries with exponential backoff and falls back to gemini-2.0-flash
- If error persists after 6 attempts, wait a few minutes and try again
- Peak usage times may experience more overload errors

**Articles not displaying:**
```sql
-- Check articles exist
SELECT * FROM generated_articles WHERE user_id = 'YOUR_USER_ID';

-- Verify RLS policies
SELECT * FROM pg_policies WHERE tablename = 'generated_articles';
```

**Typewriter effect not working:**
- Check browser console for React errors
- Verify `article.content` is not empty

### Database Issues

**Function not found:**
```sql
-- Re-create functions
\i frontend/supabase/migrations/add_generated_articles.sql
```

**Permission denied:**
```sql
-- Check RLS policies are enabled
ALTER TABLE generated_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE generation_limits ENABLE ROW LEVEL SECURITY;
```

## Monitoring

### Check Edge Function Logs

```bash
# Real-time logs
supabase functions logs generate-article --follow

# Recent logs
supabase functions logs generate-article
```

### Monitor API Usage

**Gemini API Quota:**
- Visit: https://aistudio.google.com/apikey
- Check usage and quota

**Database Metrics:**
```sql
-- Total generated articles
SELECT COUNT(*) FROM generated_articles;

-- Articles per user
SELECT user_id, COUNT(*) as article_count
FROM generated_articles
GROUP BY user_id
ORDER BY article_count DESC;

-- Generation limit usage today
SELECT user_id, count, last_generated_at
FROM generation_limits
WHERE generation_date = CURRENT_DATE;
```

## Rate Limiting

Current limits:
- **5 generations per user per day** (resets at midnight UTC)
- **Gemini 2.5 Flash API:** Free tier = 15 RPM, 1500 RPD
- **Edge Functions:** 500,000 invocations/month (Supabase free tier)

**Note:** The 5 per user/day limit is well within Gemini's 1500 RPD limit. With proper user distribution, the system can support hundreds of active users per day safely.

**Important:** Gemini 1.5 models have been retired. Always use Gemini 2.x models (gemini-2.5-flash, gemini-2.0-flash, etc.).

### Retry Logic & Fallback

The Edge Function implements robust retry logic to handle temporary API issues:
- **Primary Model:** gemini-2.5-flash (fastest, most efficient)
- **Fallback Model:** gemini-2.0-flash (if primary is overloaded)
- **Retry Strategy:** Up to 3 attempts per model with exponential backoff (2s, 4s, 8s)
- **503 Handling:** Automatically retries when models are overloaded
- **Total Attempts:** Up to 6 attempts across both models before failing

This ensures high availability even during peak usage times.

To modify daily limit:
```sql
-- Change limit in function
CREATE OR REPLACE FUNCTION check_generation_limit(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_limit INTEGER := 10; -- Change this value
  ...
```

## Security Notes

✅ **Secure:**
- Gemini API key stored in Supabase secrets (never exposed to client)
- Edge Function validates user authentication
- RLS policies prevent unauthorized access
- Daily limits prevent abuse

⚠️ **Important:**
- Never commit `.env` files with real keys
- Rotate API keys if compromised
- Monitor usage for anomalies

## Cost Estimates

**Gemini 2.5 Flash API (Free Tier):**
- 15 requests per minute (RPM)
- 1,500 requests per day (RPD)
- ~45,000 requests per month
- **Cost:** FREE

**Supabase Edge Functions:**
- 500,000 invocations/month (free tier)
- ~1s execution time per generation
- **Cost:** FREE (under limit)

**Database Storage:**
- ~5KB per article
- 100 articles = 500KB
- **Cost:** Negligible

**Estimated Monthly Costs:** $0 for up to 45,000 articles/month (limited by Gemini 2.5 Flash free tier)

## Support

For issues:
1. Check Edge Function logs: `supabase functions logs generate-article`
2. Verify database migrations ran successfully
3. Test Edge Function with curl (see Step 2D)
4. Check browser console for frontend errors

## Next Steps

- [ ] Add article regeneration dialog
- [ ] Implement article favoriting
- [ ] Add export feature for generated articles
- [ ] Track generation analytics
- [ ] Add user feedback on generation quality

---

## Quick Reference

```bash
# Deploy database migration
supabase db push migrations/add_generated_articles.sql

# Set API key
supabase secrets set GEMINI_API_KEY=YOUR_KEY

# Deploy edge function
supabase functions deploy generate-article

# View logs
supabase functions logs generate-article --follow

# Reset user's daily limit (testing)
supabase db execute "DELETE FROM generation_limits WHERE user_id = 'UUID'"
```

## Feature Documentation Location

- **Database Schema:** `frontend/supabase/migrations/add_generated_articles.sql`
- **Edge Function:** `frontend/supabase/functions/generate-article/index.ts`
- **Frontend Page:** `frontend/src/pages/Reading.tsx`
- **Types:** `frontend/src/types/index.ts` (GeneratedArticle, ArticleLength)
- **Navigation:** `frontend/src/components/layout/Navigation.tsx` (Reading link enabled)
- **Routing:** `frontend/src/App.tsx` (/reading route)

---

**Deployment Complete! 🎉**

Users can now generate custom AI articles tailored to their learning level and word bank.
