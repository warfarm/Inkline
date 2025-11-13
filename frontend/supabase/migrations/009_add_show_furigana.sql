-- Add show_furigana column to profiles table
-- This allows users to toggle furigana (reading annotations) display for Japanese text

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS show_furigana BOOLEAN DEFAULT TRUE;

-- Add comment to explain the column
COMMENT ON COLUMN profiles.show_furigana IS 'Display furigana (reading annotations) above Japanese text in articles';
