-- Migration: Fix duplicate reading_history records
-- Description: Adds unique constraints to prevent multiple records for the same article

-- ============================================
-- 1. Clean up existing duplicates (if any)
-- ============================================

-- Delete duplicate records, keeping only the most recent one per user per article
WITH duplicates AS (
  SELECT id,
         ROW_NUMBER() OVER (
           PARTITION BY user_id,
                        COALESCE(article_id::text, ''),
                        COALESCE(generated_article_id::text, '')
           ORDER BY completed_at DESC NULLS LAST,
                    time_spent_seconds DESC,
                    id DESC
         ) as rn
  FROM reading_history
)
DELETE FROM reading_history
WHERE id IN (
  SELECT id FROM duplicates WHERE rn > 1
);

-- ============================================
-- 2. Add unique constraints
-- ============================================

-- For regular articles (article_id is not null)
CREATE UNIQUE INDEX IF NOT EXISTS idx_reading_history_unique_article
  ON reading_history(user_id, article_id)
  WHERE article_id IS NOT NULL;

-- For generated articles (generated_article_id is not null)
CREATE UNIQUE INDEX IF NOT EXISTS idx_reading_history_unique_generated
  ON reading_history(user_id, generated_article_id)
  WHERE generated_article_id IS NOT NULL;

-- ============================================
-- 3. Add check constraint to ensure exactly one article_id is set
-- ============================================

-- Ensure either article_id OR generated_article_id is set, but not both
ALTER TABLE reading_history
  DROP CONSTRAINT IF EXISTS reading_history_article_check;

ALTER TABLE reading_history
  ADD CONSTRAINT reading_history_article_check
  CHECK (
    (article_id IS NOT NULL AND generated_article_id IS NULL) OR
    (article_id IS NULL AND generated_article_id IS NOT NULL)
  );

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
-- Changes made:
-- ✓ Removed duplicate reading_history records
-- ✓ Added unique constraint per user per regular article
-- ✓ Added unique constraint per user per generated article
-- ✓ Added check to ensure exactly one article type is set
--
-- This ensures:
-- - Only 1 reading_history record per user per article
-- - Articles read count is accurate
-- - No duplicate tracking
-- ============================================
