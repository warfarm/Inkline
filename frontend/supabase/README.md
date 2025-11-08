# Supabase Database Setup

This folder contains the SQL files needed to set up your Supabase database.

## Files

- **complete_setup.sql** - The complete database schema with all tables, RLS policies, and sample data
- **fix_join_class_policy.sql** - Patch to fix the join class feature (run if you set up before this fix)
- **seed.sql** - Sample article data
- **migrations/** - Historical migration files

## Setup Instructions

### Option 1: Fresh Setup (Recommended)

1. Create a new Supabase project at https://supabase.com
2. Go to the SQL Editor in your Supabase dashboard
3. Copy and paste the contents of `complete_setup.sql`
4. Click "Run" to execute the SQL
5. Your database is ready!

### Option 2: If You Already Set Up Before

If you set up your database before the join class fix was added, you need to apply the patch:

1. Go to the SQL Editor in your Supabase dashboard
2. Copy and paste the contents of `fix_join_class_policy.sql`
3. Click "Run" to execute the SQL
4. The join class feature will now work correctly

## What Gets Created

### Tables
- `profiles` - User profiles extending Supabase auth
- `classes` - Teacher classes
- `class_enrollments` - Student enrollment in classes
- `articles` - Pre-generated reading content
- `word_bank` - User saved vocabulary
- `reading_history` - Article completion tracking
- `kanji_familiarity` - Japanese kanji tracking for furigana
- `word_interactions` - Analytics for word lookups

### Sample Data
The setup includes sample articles in both Japanese and Chinese for testing purposes.

## Environment Variables

After setting up your database, add these to your `.env.local` file:

```
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

You can find these values in your Supabase project settings under "API".
