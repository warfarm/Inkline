-- Add word_definitions column to articles table for preloaded dictionary data
ALTER TABLE articles ADD COLUMN IF NOT EXISTS word_definitions JSONB DEFAULT '{}'::jsonb;

-- Add comment to explain the column
COMMENT ON COLUMN articles.word_definitions IS 'Preloaded dictionary definitions for all words in the article. Structure: { "word": { "reading": "...", "definition": "...", "example": "..." } }';
