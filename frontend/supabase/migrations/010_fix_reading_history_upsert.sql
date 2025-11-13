-- Migration: Fix reading_history duplicate prevention
-- Description: Cleans up duplicates and adds partial unique indexes

-- ============================================
-- 1. Clean up duplicate records for generated articles
-- ============================================
WITH duplicates AS (
  SELECT id,
         ROW_NUMBER() OVER (
           PARTITION BY user_id, generated_article_id
           ORDER BY completed_at DESC NULLS LAST,
                    time_spent_seconds DESC,
                    id DESC
         ) as rn
  FROM reading_history
  WHERE generated_article_id IS NOT NULL
)
DELETE FROM reading_history
WHERE id IN (
  SELECT id FROM duplicates WHERE rn > 1
);

-- ============================================
-- 2. Clean up duplicate records for regular articles
-- ============================================
WITH duplicates AS (
  SELECT id,
         ROW_NUMBER() OVER (
           PARTITION BY user_id, article_id
           ORDER BY completed_at DESC NULLS LAST,
                    time_spent_seconds DESC,
                    id DESC
         ) as rn
  FROM reading_history
  WHERE article_id IS NOT NULL
)
DELETE FROM reading_history
WHERE id IN (
  SELECT id FROM duplicates WHERE rn > 1
);

-- ============================================
-- 3. Drop old indexes/constraints
-- ============================================
DROP INDEX IF EXISTS idx_reading_history_unique_article;
DROP INDEX IF EXISTS idx_reading_history_unique_generated;

-- ============================================
-- 4. Add partial unique indexes (only for non-NULL values)
-- ============================================
CREATE UNIQUE INDEX idx_reading_history_user_generated_unique
  ON reading_history(user_id, generated_article_id)
  WHERE generated_article_id IS NOT NULL;

CREATE UNIQUE INDEX idx_reading_history_user_article_unique
  ON reading_history(user_id, article_id)
  WHERE article_id IS NOT NULL;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
-- Changes made:
-- ✓ Removed duplicate reading_history records
-- ✓ Added partial unique indexes that prevent duplicates
-- ✓ Frontend updated to use INSERT instead of UPSERT
--
-- This prevents:
-- - Duplicate reading history records
-- - 400 errors from invalid upsert operations
-- ============================================
