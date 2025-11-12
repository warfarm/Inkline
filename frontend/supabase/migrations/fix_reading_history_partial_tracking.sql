-- Migration: Fix reading_history to support partial progress tracking
-- Description: Makes completed_at nullable so we can track reading sessions before completion

-- ============================================
-- 1. Update completed_at to be nullable
-- ============================================

-- Remove the default value and make the column nullable
ALTER TABLE reading_history
  ALTER COLUMN completed_at DROP DEFAULT,
  ALTER COLUMN completed_at DROP NOT NULL;

-- Update existing records that have completed_at set but might be incomplete
-- (This is a safety measure for existing data)
COMMENT ON COLUMN reading_history.completed_at IS 'Timestamp when article was marked complete (80%+ scroll). NULL if still in progress.';

-- ============================================
-- 2. Create index for filtering completed vs in-progress
-- ============================================

CREATE INDEX IF NOT EXISTS idx_reading_history_completed
  ON reading_history(user_id, completed_at)
  WHERE completed_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_reading_history_in_progress
  ON reading_history(user_id)
  WHERE completed_at IS NULL;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
-- Changes made:
-- ✓ Made completed_at nullable to support partial progress
-- ✓ Removed default NOW() from completed_at
-- ✓ Added indexes for completed and in-progress articles
--
-- How it works now:
-- 1. Reading session starts -> create record with completed_at = NULL
-- 2. User reads -> periodic updates to time_spent_seconds
-- 3. User exits -> final update to time_spent_seconds
-- 4. User scrolls 80%+ -> set completed_at = NOW()
-- ============================================
