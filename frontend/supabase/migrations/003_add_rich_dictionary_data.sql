-- Add rich dictionary data columns to word_bank table
ALTER TABLE word_bank ADD COLUMN IF NOT EXISTS grammar_notes TEXT;
ALTER TABLE word_bank ADD COLUMN IF NOT EXISTS formality_level TEXT;
ALTER TABLE word_bank ADD COLUMN IF NOT EXISTS usage_notes TEXT;
ALTER TABLE word_bank ADD COLUMN IF NOT EXISTS additional_definitions JSONB;

-- Add comments to explain the columns
COMMENT ON COLUMN word_bank.grammar_notes IS 'Grammar context for particles and common words';
COMMENT ON COLUMN word_bank.formality_level IS 'Formality level: casual, polite, or formal';
COMMENT ON COLUMN word_bank.usage_notes IS 'Usage notes and context about when/how to use the word';
COMMENT ON COLUMN word_bank.additional_definitions IS 'Array of additional definitions with parts of speech';
