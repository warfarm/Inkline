# Database Update Instructions

## Adding user_notes Column to Existing Database

If you have an existing Inkline database, you need to add the `user_notes` column to the `word_bank` table.

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Run this SQL command:

```sql
ALTER TABLE word_bank ADD COLUMN IF NOT EXISTS user_notes TEXT;
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
AND column_name = 'user_notes';
```

You should see:
```
column_name | data_type
user_notes  | text
```

## What This Enables

With the `user_notes` column added, users can now:
- Add personal notes to saved words
- See their notes in the word bank
- Include context, mnemonics, or examples with each word

The notes are saved automatically when clicking "Save to Word Bank" after adding text in the "Personal Notes" field (visible after clicking "Show More").
