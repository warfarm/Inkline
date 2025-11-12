-- Migration: Fix article tracking to support both regular and generated articles
-- Description: Updates word_interactions and reading_history tables to handle both article types

-- ============================================
-- 1. Update word_interactions table
-- ============================================

-- Drop the existing foreign key constraint
ALTER TABLE word_interactions
  DROP CONSTRAINT IF EXISTS word_interactions_article_id_fkey;

-- Add a new column to track the source of the article
ALTER TABLE word_interactions
  ADD COLUMN IF NOT EXISTS article_source TEXT CHECK (article_source IN ('articles', 'generated_articles'));

-- Add a foreign key for generated articles
ALTER TABLE word_interactions
  ADD COLUMN IF NOT EXISTS generated_article_id UUID REFERENCES generated_articles(id) ON DELETE CASCADE;

-- Update existing records to use 'articles' as the default source
UPDATE word_interactions
SET article_source = 'articles'
WHERE article_source IS NULL;

-- Make article_source not null for future records
ALTER TABLE word_interactions
  ALTER COLUMN article_source SET DEFAULT 'articles';

-- Add back foreign key constraint for regular articles (nullable)
ALTER TABLE word_interactions
  ADD CONSTRAINT word_interactions_article_id_fkey
  FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE
  NOT VALID;

-- Validate the constraint for existing data
ALTER TABLE word_interactions
  VALIDATE CONSTRAINT word_interactions_article_id_fkey;

-- ============================================
-- 2. Update reading_history table
-- ============================================

-- Drop the existing foreign key constraint
ALTER TABLE reading_history
  DROP CONSTRAINT IF EXISTS reading_history_article_id_fkey;

-- Add a new column to track the source of the article
ALTER TABLE reading_history
  ADD COLUMN IF NOT EXISTS article_source TEXT CHECK (article_source IN ('articles', 'generated_articles'));

-- Add a foreign key for generated articles
ALTER TABLE reading_history
  ADD COLUMN IF NOT EXISTS generated_article_id UUID REFERENCES generated_articles(id) ON DELETE CASCADE;

-- Update existing records to use 'articles' as the default source
UPDATE reading_history
SET article_source = 'articles'
WHERE article_source IS NULL;

-- Make article_source not null for future records
ALTER TABLE reading_history
  ALTER COLUMN article_source SET DEFAULT 'articles';

-- Add back foreign key constraint for regular articles (nullable)
ALTER TABLE reading_history
  ADD CONSTRAINT reading_history_article_id_fkey
  FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE
  NOT VALID;

-- Validate the constraint for existing data
ALTER TABLE reading_history
  VALIDATE CONSTRAINT reading_history_article_id_fkey;

-- ============================================
-- 3. Add comments for documentation
-- ============================================

COMMENT ON COLUMN word_interactions.article_source IS 'Source table: articles or generated_articles';
COMMENT ON COLUMN word_interactions.generated_article_id IS 'Foreign key to generated_articles (when source is generated_articles)';
COMMENT ON COLUMN reading_history.article_source IS 'Source table: articles or generated_articles';
COMMENT ON COLUMN reading_history.generated_article_id IS 'Foreign key to generated_articles (when source is generated_articles)';

-- ============================================
-- 4. Create indexes for performance
-- ============================================

CREATE INDEX IF NOT EXISTS idx_word_interactions_generated_article
  ON word_interactions(generated_article_id)
  WHERE generated_article_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_reading_history_generated_article
  ON reading_history(generated_article_id)
  WHERE generated_article_id IS NOT NULL;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
-- Changes made:
-- ✓ Added article_source column to track article type
-- ✓ Added generated_article_id foreign key columns
-- ✓ Updated constraints to support both article types
-- ✓ Added indexes for performance
--
-- Next steps:
-- 1. Update frontend code to set article_source and generated_article_id
-- 2. Test with both regular and generated articles
-- ============================================
