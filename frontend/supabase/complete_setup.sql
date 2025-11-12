-- ============================================
-- INKLINE - COMPLETE DATABASE SETUP
-- Language Learning Platform for Chinese & Japanese
--
-- This file contains the complete schema for Inkline.
-- Simply copy and paste this entire file into Supabase SQL Editor to initialize your database.
--
-- Features:
-- - User profiles with role-based access (student/teacher)
-- - Interactive articles with word segmentation
-- - Personal word banks with rich dictionary data
-- - Teacher classroom management
-- - Reading progress tracking
-- - Kanji familiarity system (Japanese)
-- ============================================

-- ============================================
-- EXTENSIONS
-- ============================================

-- Enable UUID generation for primary keys
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- DROP EXISTING TABLES (if re-running)
-- ============================================

-- Drop tables in reverse dependency order to avoid foreign key conflicts
DROP TABLE IF EXISTS word_interactions CASCADE;
DROP TABLE IF EXISTS kanji_familiarity CASCADE;
DROP TABLE IF EXISTS reading_history CASCADE;
DROP TABLE IF EXISTS word_bank CASCADE;
DROP TABLE IF EXISTS class_enrollments CASCADE;
DROP TABLE IF EXISTS classes CASCADE;
DROP TABLE IF EXISTS articles CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- ============================================
-- CREATE TABLES
-- ============================================

-- ---------------------------------------------
-- PROFILES TABLE
-- User profiles extending Supabase auth.users
-- ---------------------------------------------
CREATE TABLE profiles (
  -- Primary key linking to Supabase auth system
  id UUID REFERENCES auth.users PRIMARY KEY,

  -- User role determines UI and permissions
  role TEXT NOT NULL CHECK (role IN ('student', 'teacher')),

  -- Display name shown throughout the app
  display_name TEXT NOT NULL,

  -- User's native language (default: English)
  native_language TEXT DEFAULT 'en',

  -- Language the user is learning (zh = Chinese Simplified, ja = Japanese, ko = Korean)
  target_language TEXT CHECK (target_language IN ('zh', 'ja', 'ko')),

  -- Current proficiency level (affects article recommendations)
  current_level TEXT CHECK (current_level IN ('beginner', 'intermediate', 'advanced')),

  -- User's interests stored as JSON array (e.g., ["technology", "culture", "food"])
  -- Used for personalized article recommendations
  interests JSONB DEFAULT '[]'::jsonb,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add table comment
COMMENT ON TABLE profiles IS 'User profiles with learning preferences and role information';
COMMENT ON COLUMN profiles.role IS 'User role: student or teacher';
COMMENT ON COLUMN profiles.target_language IS 'Language being learned: zh (Chinese) or ja (Japanese)';
COMMENT ON COLUMN profiles.interests IS 'Array of topic interests for article recommendations';

-- ---------------------------------------------
-- CLASSES TABLE
-- Teacher-created classrooms for student management
-- ---------------------------------------------
CREATE TABLE classes (
  -- Unique class identifier
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Teacher who owns this class
  teacher_id UUID REFERENCES profiles(id) ON DELETE CASCADE,

  -- Class name (e.g., "Chinese 101 - Spring 2025")
  name TEXT NOT NULL,

  -- Unique join code for students to enroll (e.g., "SPRING2025")
  -- Must be unique across all classes
  join_code TEXT UNIQUE NOT NULL,

  -- Timestamp when class was created
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Whether class is archived (hidden from active view)
  archived BOOLEAN DEFAULT FALSE
);

COMMENT ON TABLE classes IS 'Teacher-managed classrooms for organizing students';
COMMENT ON COLUMN classes.join_code IS 'Unique code students use to join the class';
COMMENT ON COLUMN classes.archived IS 'Whether the class is archived (no longer active)';

-- ---------------------------------------------
-- CLASS ENROLLMENTS TABLE
-- Links students to classes (many-to-many relationship)
-- ---------------------------------------------
CREATE TABLE class_enrollments (
  -- Unique enrollment identifier
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Class being enrolled in
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,

  -- Student enrolling in the class
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,

  -- When the student joined
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Prevent duplicate enrollments
  UNIQUE(class_id, student_id)
);

COMMENT ON TABLE class_enrollments IS 'Student enrollment in classes (many-to-many relationship)';
COMMENT ON CONSTRAINT class_enrollments_class_id_student_id_key ON class_enrollments IS 'Prevents duplicate enrollments';

-- ---------------------------------------------
-- ARTICLES TABLE
-- Pre-generated reading content with word segmentation
-- ---------------------------------------------
CREATE TABLE articles (
  -- Unique article identifier
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Article language (zh = Chinese, ja = Japanese, ko = Korean)
  language TEXT NOT NULL CHECK (language IN ('zh', 'ja', 'ko')),

  -- Difficulty level for filtering
  difficulty_level TEXT NOT NULL CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),

  -- Topic category (e.g., "Technology", "Daily Life", "Culture")
  topic TEXT NOT NULL,

  -- Article title
  title TEXT NOT NULL,

  -- Full article text content
  content TEXT NOT NULL,

  -- Pre-segmented words with position data
  -- Structure: {
  --   "words": [
  --     {"text": "学习", "start": 0, "end": 2, "reading": "xuéxí"},
  --     ...
  --   ]
  -- }
  segmented_content JSONB NOT NULL,

  -- Total word count (for metadata display)
  word_count INTEGER NOT NULL,

  -- Key vocabulary words to focus on (stored as JSON array)
  target_words JSONB DEFAULT '[]'::jsonb,

  -- Grammar points covered in this article (JSON array)
  grammar_points JSONB DEFAULT '[]'::jsonb,

  -- Preloaded dictionary definitions for instant lookup
  -- Structure: {
  --   "word": {
  --     "reading": "xuéxí",
  --     "definition": "to study; to learn",
  --     "grammarNotes": "...",
  --     "definitions": [...],
  --     "examples": [...]
  --   }
  -- }
  -- Eliminates API lookup delays during reading
  word_definitions JSONB DEFAULT '{}'::jsonb,

  -- When the article was created
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE articles IS 'Reading content with pre-segmented words and preloaded definitions';
COMMENT ON COLUMN articles.segmented_content IS 'Pre-segmented words with boundaries for interactive clicking';
COMMENT ON COLUMN articles.word_definitions IS 'Cached dictionary definitions for all words (eliminates API delays)';
COMMENT ON COLUMN articles.target_words IS 'Key vocabulary words students should learn from this article';
COMMENT ON COLUMN articles.grammar_points IS 'Grammar concepts covered in the article';

-- ---------------------------------------------
-- WORD BANK TABLE
-- User's personal vocabulary collection
-- ---------------------------------------------
CREATE TABLE word_bank (
  -- Unique word entry identifier
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- User who saved this word
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,

  -- The word or phrase in target language
  word TEXT NOT NULL,

  -- Language of the word (zh or ja)
  language TEXT NOT NULL,

  -- Primary English definition
  definition TEXT NOT NULL,

  -- Pronunciation (Pinyin for Chinese, Hiragana for Japanese)
  reading TEXT,

  -- Example sentence using the word
  example_sentence TEXT,

  -- User's personal notes, mnemonics, or context
  user_notes TEXT,

  -- Grammar explanations (especially for particles like は, を, de, etc.)
  grammar_notes TEXT,

  -- Formality level: casual, polite, or formal
  formality_level TEXT,

  -- Usage context and tips (when/how to use the word)
  usage_notes TEXT,

  -- Additional definitions with parts of speech
  -- Structure: [
  --   {"meaning": "to study", "partOfSpeech": "verb"},
  --   {"meaning": "learning", "partOfSpeech": "noun"}
  -- ]
  additional_definitions JSONB,

  -- Learning status
  status TEXT DEFAULT 'learning' CHECK (status IN ('learning', 'mastered')),

  -- Spaced repetition tracking
  times_reviewed INTEGER DEFAULT 0,

  -- When word was first encountered
  first_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Last time word was reviewed in practice
  last_reviewed_at TIMESTAMP WITH TIME ZONE,

  -- Prevent duplicate words per user per language
  UNIQUE(user_id, word, language)
);

COMMENT ON TABLE word_bank IS 'User vocabulary collection with rich dictionary metadata';
COMMENT ON COLUMN word_bank.user_notes IS 'Personal notes, mnemonics, and examples added by the user';
COMMENT ON COLUMN word_bank.grammar_notes IS 'Grammar explanations for particles and function words';
COMMENT ON COLUMN word_bank.formality_level IS 'Formality: casual, polite, or formal';
COMMENT ON COLUMN word_bank.usage_notes IS 'Context about when and how to use the word';
COMMENT ON COLUMN word_bank.additional_definitions IS 'Multiple meanings with parts of speech (JSON)';
COMMENT ON COLUMN word_bank.status IS 'Learning progress: learning or mastered';
COMMENT ON COLUMN word_bank.times_reviewed IS 'Number of times reviewed in flashcard practice';

-- ---------------------------------------------
-- READING HISTORY TABLE
-- Tracks article completions and time spent
-- ---------------------------------------------
CREATE TABLE reading_history (
  -- Unique history entry identifier
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- User who completed the article
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,

  -- Article that was read
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,

  -- When the article was marked complete
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Total time spent reading (in seconds)
  time_spent_seconds INTEGER DEFAULT 0,

  -- Number of words saved to word bank from this article
  words_saved_count INTEGER DEFAULT 0,

  -- User feedback on article topic (for recommendations)
  -- true = more of this, false = less of this, null = neutral
  liked BOOLEAN
);

COMMENT ON TABLE reading_history IS 'Tracks article completions, time spent, and user feedback';
COMMENT ON COLUMN reading_history.time_spent_seconds IS 'Total reading time in seconds';
COMMENT ON COLUMN reading_history.words_saved_count IS 'Words saved to word bank from this article';
COMMENT ON COLUMN reading_history.liked IS 'User feedback: true = more, false = less, null = neutral';

-- ---------------------------------------------
-- KANJI FAMILIARITY TABLE
-- Tracks kanji familiarity for auto-hiding furigana (Japanese only)
-- ---------------------------------------------
CREATE TABLE kanji_familiarity (
  -- Unique familiarity entry identifier
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- User learning the kanji
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,

  -- Single kanji character being tracked
  kanji_character TEXT NOT NULL,

  -- How many times user has encountered this kanji
  times_encountered INTEGER DEFAULT 1,

  -- How many times user clicked to see reading
  times_clicked INTEGER DEFAULT 0,

  -- Whether to show furigana (reading) above the kanji
  -- Auto-hidden after user demonstrates familiarity
  show_furigana BOOLEAN DEFAULT TRUE,

  -- Last time this kanji was seen
  last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- One entry per user per kanji
  UNIQUE(user_id, kanji_character)
);

COMMENT ON TABLE kanji_familiarity IS 'Tracks kanji familiarity to auto-hide furigana when learned';
COMMENT ON COLUMN kanji_familiarity.times_encountered IS 'Number of times user has seen this kanji';
COMMENT ON COLUMN kanji_familiarity.times_clicked IS 'Number of times user clicked to reveal reading';
COMMENT ON COLUMN kanji_familiarity.show_furigana IS 'Whether to show furigana above the kanji';

-- ---------------------------------------------
-- WORD INTERACTIONS TABLE
-- Analytics tracking for word lookups and saves
-- ---------------------------------------------
CREATE TABLE word_interactions (
  -- Unique interaction identifier
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- User who interacted with the word
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,

  -- Article context where interaction occurred
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,

  -- The word that was interacted with
  word TEXT NOT NULL,

  -- Type of interaction
  -- click = looked up definition
  -- save = saved to word bank
  -- phrase_highlight = selected as part of phrase
  interaction_type TEXT CHECK (interaction_type IN ('click', 'save', 'phrase_highlight')),

  -- When the interaction occurred
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE word_interactions IS 'Analytics for word lookups, saves, and phrase highlights';
COMMENT ON COLUMN word_interactions.interaction_type IS 'Type: click (lookup), save (to word bank), or phrase_highlight';

-- ============================================
-- CREATE INDEXES FOR PERFORMANCE
-- ============================================

-- Profile lookups by target language (for article filtering)
CREATE INDEX idx_profiles_target_language ON profiles(target_language);

-- Article filtering by language and difficulty
CREATE INDEX idx_articles_language_level ON articles(language, difficulty_level);

-- Article browsing by topic
CREATE INDEX idx_articles_topic ON articles(topic);

-- Word bank queries per user
CREATE INDEX idx_word_bank_user ON word_bank(user_id);

-- Reading history per user
CREATE INDEX idx_reading_history_user ON reading_history(user_id);

-- Student enrollment lookups
CREATE INDEX idx_class_enrollments_student ON class_enrollments(student_id);

-- Class roster lookups
CREATE INDEX idx_class_enrollments_class ON class_enrollments(class_id);

COMMENT ON INDEX idx_articles_language_level IS 'Fast filtering by language and difficulty';
COMMENT ON INDEX idx_word_bank_user IS 'Fast word bank queries per user';

-- ============================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables for data isolation
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE word_bank ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE kanji_familiarity ENABLE ROW LEVEL SECURITY;
ALTER TABLE word_interactions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- CREATE ROW LEVEL SECURITY POLICIES
-- ============================================

-- ---------------------------------------------
-- PROFILES POLICIES
-- Users can only access their own profile
-- ---------------------------------------------

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Users can insert their own profile (during onboarding)
CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ---------------------------------------------
-- CLASSES POLICIES
-- Teachers manage their own classes
-- Students can view classes they're enrolled in
-- ---------------------------------------------

-- Teachers can view their own classes
CREATE POLICY "Teachers can view own classes"
  ON classes
  FOR SELECT
  USING (auth.uid() = teacher_id);

-- Anyone can look up non-archived classes by join code
-- This is intentional: join codes are meant to be shared
CREATE POLICY "Anyone can lookup non-archived classes"
  ON classes
  FOR SELECT
  USING (archived = false);

-- Teachers can create classes
CREATE POLICY "Teachers can insert own classes"
  ON classes
  FOR INSERT
  WITH CHECK (auth.uid() = teacher_id);

-- Teachers can update their own classes
CREATE POLICY "Teachers can update own classes"
  ON classes
  FOR UPDATE
  USING (auth.uid() = teacher_id);

-- Teachers can delete their own classes
CREATE POLICY "Teachers can delete own classes"
  ON classes
  FOR DELETE
  USING (auth.uid() = teacher_id);

-- ---------------------------------------------
-- CLASS ENROLLMENTS POLICIES
-- Teachers can view/manage enrollments in their classes
-- Students can view their own enrollments
-- ---------------------------------------------

-- Teachers can view enrollments in their classes
-- Students can view their own enrollments
CREATE POLICY "View enrollments if teacher owns class"
  ON class_enrollments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM classes
      WHERE classes.id = class_enrollments.class_id
      AND classes.teacher_id = auth.uid()
    )
    OR auth.uid() = class_enrollments.student_id
  );

-- Students can enroll themselves in classes
CREATE POLICY "Insert enrollments as student"
  ON class_enrollments
  FOR INSERT
  WITH CHECK (auth.uid() = student_id);

-- Teachers can remove students from their classes
CREATE POLICY "Delete enrollments if teacher"
  ON class_enrollments
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM classes
      WHERE classes.id = class_enrollments.class_id
      AND classes.teacher_id = auth.uid()
    )
  );

-- ---------------------------------------------
-- ARTICLES POLICIES
-- All articles are publicly readable
-- ---------------------------------------------

-- Anyone can read articles (no authentication required for browsing)
CREATE POLICY "Anyone can read articles"
  ON articles
  FOR SELECT
  USING (true);

-- ---------------------------------------------
-- WORD BANK POLICIES
-- Users can only access their own word bank
-- ---------------------------------------------

-- Users have full access to their own word bank
CREATE POLICY "Users can manage own word bank"
  ON word_bank
  FOR ALL
  USING (auth.uid() = user_id);

-- ---------------------------------------------
-- READING HISTORY POLICIES
-- Users can only access their own reading history
-- ---------------------------------------------

-- Users have full access to their own reading history
CREATE POLICY "Users can manage own reading history"
  ON reading_history
  FOR ALL
  USING (auth.uid() = user_id);

-- ---------------------------------------------
-- KANJI FAMILIARITY POLICIES
-- Users can only access their own familiarity data
-- ---------------------------------------------

-- Users have full access to their own kanji familiarity
CREATE POLICY "Users can manage own kanji familiarity"
  ON kanji_familiarity
  FOR ALL
  USING (auth.uid() = user_id);

-- ---------------------------------------------
-- WORD INTERACTIONS POLICIES
-- Users can only access their own interaction analytics
-- ---------------------------------------------

-- Users have full access to their own word interactions
CREATE POLICY "Users can manage own word interactions"
  ON word_interactions
  FOR ALL
  USING (auth.uid() = user_id);

-- ============================================
-- SEED DATA - SAMPLE ARTICLES
-- ============================================

-- ---------------------------------------------
-- Japanese Beginner Article: My Day
-- ---------------------------------------------
INSERT INTO articles (language, difficulty_level, topic, title, content, segmented_content, word_count) VALUES
(
  'ja',
  'beginner',
  'Daily Life',
  '私の一日',
  '私は学生です。毎日学校に行きます。朝ごはんを食べます。友達と話します。日本語を勉強します。',
  '{
    "words": [
      {"text": "私", "start": 0, "end": 1, "reading": "わたし"},
      {"text": "は", "start": 1, "end": 2},
      {"text": "学生", "start": 2, "end": 4, "reading": "がくせい"},
      {"text": "です", "start": 4, "end": 6},
      {"text": "。", "start": 6, "end": 7},
      {"text": "毎日", "start": 7, "end": 9, "reading": "まいにち"},
      {"text": "学校", "start": 9, "end": 11, "reading": "がっこう"},
      {"text": "に", "start": 11, "end": 12},
      {"text": "行き", "start": 12, "end": 14, "reading": "いき"},
      {"text": "ます", "start": 14, "end": 16},
      {"text": "。", "start": 16, "end": 17},
      {"text": "朝", "start": 17, "end": 18, "reading": "あさ"},
      {"text": "ごはん", "start": 18, "end": 21},
      {"text": "を", "start": 21, "end": 22},
      {"text": "食べ", "start": 22, "end": 24, "reading": "たべ"},
      {"text": "ます", "start": 24, "end": 26},
      {"text": "。", "start": 26, "end": 27},
      {"text": "友達", "start": 27, "end": 29, "reading": "ともだち"},
      {"text": "と", "start": 29, "end": 30},
      {"text": "話し", "start": 30, "end": 32, "reading": "はなし"},
      {"text": "ます", "start": 32, "end": 34},
      {"text": "。", "start": 34, "end": 35},
      {"text": "日本語", "start": 35, "end": 38, "reading": "にほんご"},
      {"text": "を", "start": 38, "end": 39},
      {"text": "勉強", "start": 39, "end": 41, "reading": "べんきょう"},
      {"text": "し", "start": 41, "end": 42},
      {"text": "ます", "start": 42, "end": 44},
      {"text": "。", "start": 44, "end": 45}
    ]
  }',
  28
);

-- ---------------------------------------------
-- Chinese Beginner Article: My Day
-- ---------------------------------------------
INSERT INTO articles (language, difficulty_level, topic, title, content, segmented_content, word_count) VALUES
(
  'zh',
  'beginner',
  'Daily Life',
  '我的一天',
  '我是学生。我每天去学校。我吃早饭。我和朋友说话。我学习中文。',
  '{
    "words": [
      {"text": "我", "start": 0, "end": 1, "reading": "wǒ"},
      {"text": "是", "start": 1, "end": 2, "reading": "shì"},
      {"text": "学生", "start": 2, "end": 4, "reading": "xuésheng"},
      {"text": "。", "start": 4, "end": 5},
      {"text": "我", "start": 5, "end": 6, "reading": "wǒ"},
      {"text": "每天", "start": 6, "end": 8, "reading": "měitiān"},
      {"text": "去", "start": 8, "end": 9, "reading": "qù"},
      {"text": "学校", "start": 9, "end": 11, "reading": "xuéxiào"},
      {"text": "。", "start": 11, "end": 12},
      {"text": "我", "start": 12, "end": 13, "reading": "wǒ"},
      {"text": "吃", "start": 13, "end": 14, "reading": "chī"},
      {"text": "早饭", "start": 14, "end": 16, "reading": "zǎofàn"},
      {"text": "。", "start": 16, "end": 17},
      {"text": "我", "start": 17, "end": 18, "reading": "wǒ"},
      {"text": "和", "start": 18, "end": 19, "reading": "hé"},
      {"text": "朋友", "start": 19, "end": 21, "reading": "péngyou"},
      {"text": "说话", "start": 21, "end": 23, "reading": "shuōhuà"},
      {"text": "。", "start": 23, "end": 24},
      {"text": "我", "start": 24, "end": 25, "reading": "wǒ"},
      {"text": "学习", "start": 25, "end": 27, "reading": "xuéxí"},
      {"text": "中文", "start": 27, "end": 29, "reading": "zhōngwén"},
      {"text": "。", "start": 29, "end": 30}
    ]
  }',
  22
);

-- ---------------------------------------------
-- Japanese Intermediate Article: Smartphones
-- ---------------------------------------------
INSERT INTO articles (language, difficulty_level, topic, title, content, segmented_content, word_count) VALUES
(
  'ja',
  'intermediate',
  'Technology',
  'スマートフォンの使い方',
  'スマートフォンは現代社会で重要なツールです。メッセージを送ったり、写真を撮ったり、インターネットで情報を検索したりできます。多くの人が毎日使っています。',
  '{
    "words": [
      {"text": "スマートフォン", "start": 0, "end": 8},
      {"text": "は", "start": 8, "end": 9},
      {"text": "現代", "start": 9, "end": 11, "reading": "げんだい"},
      {"text": "社会", "start": 11, "end": 13, "reading": "しゃかい"},
      {"text": "で", "start": 13, "end": 14},
      {"text": "重要", "start": 14, "end": 16, "reading": "じゅうよう"},
      {"text": "な", "start": 16, "end": 17},
      {"text": "ツール", "start": 17, "end": 20},
      {"text": "です", "start": 20, "end": 22},
      {"text": "。", "start": 22, "end": 23}
    ]
  }',
  35
);

-- ---------------------------------------------
-- Chinese Intermediate Article: Smartphones
-- ---------------------------------------------
INSERT INTO articles (language, difficulty_level, topic, title, content, segmented_content, word_count) VALUES
(
  'zh',
  'intermediate',
  'Technology',
  '智能手机的使用',
  '智能手机是现代社会的重要工具。我们可以发送消息、拍照片、上网搜索信息。很多人每天都在使用它。',
  '{
    "words": [
      {"text": "智能", "start": 0, "end": 2, "reading": "zhìnéng"},
      {"text": "手机", "start": 2, "end": 4, "reading": "shǒujī"},
      {"text": "是", "start": 4, "end": 5, "reading": "shì"},
      {"text": "现代", "start": 5, "end": 7, "reading": "xiàndài"},
      {"text": "社会", "start": 7, "end": 9, "reading": "shèhuì"},
      {"text": "的", "start": 9, "end": 10, "reading": "de"},
      {"text": "重要", "start": 10, "end": 12, "reading": "zhòngyào"},
      {"text": "工具", "start": 12, "end": 14, "reading": "gōngjù"},
      {"text": "。", "start": 14, "end": 15}
    ]
  }',
  30
);

-- ============================================
-- SETUP COMPLETE!
-- ============================================
--
-- Your Inkline database is now fully initialized with:
--
-- ✓ 8 tables with complete schema
-- ✓ Row Level Security (RLS) policies for data isolation
-- ✓ Performance indexes on common queries
-- ✓ 4 sample articles (2 Japanese, 2 Chinese)
-- ✓ Rich dictionary metadata columns
-- ✓ Preloaded definitions support
-- ✓ Character breakdown support for Chinese
--
-- NEXT STEPS:
--
-- 1. Enable Google OAuth in Supabase Dashboard:
--    Authentication > Providers > Google > Enable
--
-- 2. Set environment variables in frontend/.env.local:
--    VITE_SUPABASE_URL=your-project-url
--    VITE_SUPABASE_ANON_KEY=your-anon-key
--
-- 3. Start the development server:
--    cd frontend
--    npm install
--    npm run dev
--
-- 4. (Optional) Preload article definitions:
--    Navigate to /admin in the app to preload dictionary data
--    This eliminates API lookup delays during reading
--
-- ============================================
