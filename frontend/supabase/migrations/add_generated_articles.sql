-- Migration: Add generated articles tables
-- Description: Creates tables for AI-generated articles and generation limits

-- 1. Create generated_articles table
CREATE TABLE IF NOT EXISTS generated_articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  language TEXT NOT NULL CHECK (language IN ('zh', 'ja')),
  difficulty_level TEXT NOT NULL CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  topic TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  segmented_content JSONB NOT NULL,
  word_count INTEGER NOT NULL,
  target_words JSONB DEFAULT '[]'::jsonb,
  grammar_points JSONB DEFAULT '[]'::jsonb,
  word_definitions JSONB DEFAULT '{}'::jsonb,

  -- Generated article specific fields
  generation_prompt TEXT NOT NULL,
  word_bank_words_used JSONB DEFAULT '[]'::jsonb,
  is_favorite BOOLEAN DEFAULT FALSE,
  is_test_article BOOLEAN DEFAULT FALSE,
  article_length TEXT CHECK (article_length IN ('short', 'medium', 'long')),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create generation_limits table
CREATE TABLE IF NOT EXISTS generation_limits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  generation_date DATE NOT NULL DEFAULT CURRENT_DATE,
  count INTEGER DEFAULT 0,
  last_generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id, generation_date)
);

-- 3. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_generated_articles_user ON generated_articles(user_id);
CREATE INDEX IF NOT EXISTS idx_generated_articles_language_level ON generated_articles(language, difficulty_level);
CREATE INDEX IF NOT EXISTS idx_generated_articles_created_at ON generated_articles(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_generation_limits_user_date ON generation_limits(user_id, generation_date);

-- 4. Enable Row Level Security
ALTER TABLE generated_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE generation_limits ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies for generated_articles
-- Users can only see their own generated articles
CREATE POLICY "Users can view their own generated articles"
  ON generated_articles FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own generated articles
CREATE POLICY "Users can insert their own generated articles"
  ON generated_articles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own generated articles
CREATE POLICY "Users can update their own generated articles"
  ON generated_articles FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own generated articles
CREATE POLICY "Users can delete their own generated articles"
  ON generated_articles FOR DELETE
  USING (auth.uid() = user_id);

-- 6. Create RLS policies for generation_limits
-- Users can view their own generation limits
CREATE POLICY "Users can view their own generation limits"
  ON generation_limits FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own generation limits
CREATE POLICY "Users can insert their own generation limits"
  ON generation_limits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own generation limits
CREATE POLICY "Users can update their own generation limits"
  ON generation_limits FOR UPDATE
  USING (auth.uid() = user_id);

-- 7. Create function to check and update generation limits
CREATE OR REPLACE FUNCTION check_generation_limit(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_count INTEGER;
  v_limit INTEGER := 5; -- Daily limit
BEGIN
  -- Get today's generation count
  SELECT COALESCE(count, 0) INTO v_count
  FROM generation_limits
  WHERE user_id = p_user_id
    AND generation_date = CURRENT_DATE;

  -- Check if under limit
  IF v_count < v_limit THEN
    -- Upsert the count
    INSERT INTO generation_limits (user_id, generation_date, count, last_generated_at)
    VALUES (p_user_id, CURRENT_DATE, 1, NOW())
    ON CONFLICT (user_id, generation_date)
    DO UPDATE SET
      count = generation_limits.count + 1,
      last_generated_at = NOW();

    RETURN TRUE;
  ELSE
    RETURN FALSE;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Create function to get remaining generations for today
CREATE OR REPLACE FUNCTION get_remaining_generations(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
  v_limit INTEGER := 5;
BEGIN
  SELECT COALESCE(count, 0) INTO v_count
  FROM generation_limits
  WHERE user_id = p_user_id
    AND generation_date = CURRENT_DATE;

  RETURN GREATEST(0, v_limit - v_count);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
