-- Migration: Fix reading history time tracking
-- Date: 2025-11-10
-- Description: Add DEFAULT 0 to time_spent_seconds and update NULL values

-- Update NULL values to 0
UPDATE reading_history
SET time_spent_seconds = 0
WHERE time_spent_seconds IS NULL;

-- Add DEFAULT constraint to column
ALTER TABLE reading_history
ALTER COLUMN time_spent_seconds SET DEFAULT 0;

-- Verify the change
SELECT
  COUNT(*) as total_records,
  COUNT(time_spent_seconds) as records_with_time,
  SUM(time_spent_seconds) as total_seconds,
  ROUND(AVG(time_spent_seconds)) as avg_seconds
FROM reading_history;
