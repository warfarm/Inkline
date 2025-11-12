-- Fix for reading_history constraint error
-- Error: "there is no unique or exclusion constraint matching the ON CONFLICT specification"

-- Add unique constraint on (user_id, article_id) to reading_history table
ALTER TABLE reading_history
ADD CONSTRAINT reading_history_user_article_unique
UNIQUE (user_id, article_id);

-- This allows the ON CONFLICT clause in upsert operations to work properly
