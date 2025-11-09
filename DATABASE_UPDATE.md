# Database Update Instructions

## Adding Enhanced Dictionary Data Columns to Existing Database

If you have an existing Inkline database, you need to add several new columns to the `word_bank` table for rich dictionary data.

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Run these SQL commands:

```sql
-- Add user notes column (if not already added)
ALTER TABLE word_bank ADD COLUMN IF NOT EXISTS user_notes TEXT;

-- Add rich dictionary data columns
ALTER TABLE word_bank ADD COLUMN IF NOT EXISTS grammar_notes TEXT;
ALTER TABLE word_bank ADD COLUMN IF NOT EXISTS formality_level TEXT;
ALTER TABLE word_bank ADD COLUMN IF NOT EXISTS usage_notes TEXT;
ALTER TABLE word_bank ADD COLUMN IF NOT EXISTS additional_definitions JSONB;
```

4. Click **Run** to execute

### Option 2: Using the Migration File

If you're using Supabase CLI:

```bash
cd frontend/supabase
supabase migration up
```

This will apply the migration file `002_add_user_notes.sql`.

### Option 3: Recreate Database (For New Setups)

If you haven't deployed yet or don't mind losing data:

1. Drop existing tables
2. Run the updated `complete_setup.sql` file which includes the `user_notes` column

### Verify the Update

After applying the update, verify it worked:

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'word_bank'
AND column_name IN ('user_notes', 'grammar_notes', 'formality_level', 'usage_notes', 'additional_definitions')
ORDER BY column_name;
```

You should see:
```
column_name             | data_type
additional_definitions  | jsonb
formality_level        | text
grammar_notes          | text
usage_notes            | text
user_notes             | text
```

## What This Enables

With these enhanced columns added, the word bank now stores and displays:

1. **Grammar Notes** - Contextual grammar explanations for particles and common words (e.g., は, が, を)
2. **Formality Level** - Whether a word is casual, polite, or formal
3. **Usage Notes** - Information about when and how to use the word
4. **Additional Definitions** - Multiple meanings with parts of speech (stored as JSON)
5. **User Notes** - Personal notes, mnemonics, and examples added by the user

All this data is:
- Automatically saved when you save a word from the popup
- Displayed in the word bank with "Show More" expansion
- Available in both the main word bank page and the article side panel
- Color-coded for easy identification (blue for grammar, amber for usage, green for personal notes)
