-- Add user_notes column to word_bank table
ALTER TABLE word_bank ADD COLUMN IF NOT EXISTS user_notes TEXT;

-- Add comment to explain the column
COMMENT ON COLUMN word_bank.user_notes IS 'Personal notes added by the user about this word';
