-- ============================================
-- INKLINE - COMPLETE DATABASE SETUP
-- Run this entire file in Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- DROP EXISTING TABLES (if re-running)
-- ============================================
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

-- User profiles (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  role TEXT NOT NULL CHECK (role IN ('student', 'teacher')),
  display_name TEXT NOT NULL,
  native_language TEXT DEFAULT 'en',
  target_language TEXT CHECK (target_language IN ('zh', 'ja')),
  current_level TEXT CHECK (current_level IN ('beginner', 'intermediate', 'advanced')),
  interests JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Classes (for teachers)
CREATE TABLE classes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  join_code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  archived BOOLEAN DEFAULT FALSE
);

-- Class enrollments (student-class relationship)
CREATE TABLE class_enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(class_id, student_id)
);

-- Articles (pre-generated content)
CREATE TABLE articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  language TEXT NOT NULL CHECK (language IN ('zh', 'ja')),
  difficulty_level TEXT NOT NULL CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  topic TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  segmented_content JSONB NOT NULL,
  word_count INTEGER NOT NULL,
  target_words JSONB DEFAULT '[]'::jsonb,
  grammar_points JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Word bank (user's saved vocabulary)
CREATE TABLE word_bank (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  word TEXT NOT NULL,
  language TEXT NOT NULL,
  definition TEXT NOT NULL,
  reading TEXT,
  example_sentence TEXT,
  user_notes TEXT,
  grammar_notes TEXT,
  formality_level TEXT,
  usage_notes TEXT,
  additional_definitions JSONB,
  status TEXT DEFAULT 'learning' CHECK (status IN ('learning', 'mastered')),
  times_reviewed INTEGER DEFAULT 0,
  first_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_reviewed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, word, language)
);

-- Reading history (track article completions)
CREATE TABLE reading_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  time_spent_seconds INTEGER,
  words_saved_count INTEGER DEFAULT 0,
  liked BOOLEAN
);

-- Kanji familiarity (for auto-hide furigana)
CREATE TABLE kanji_familiarity (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  kanji_character TEXT NOT NULL,
  times_encountered INTEGER DEFAULT 1,
  times_clicked INTEGER DEFAULT 0,
  show_furigana BOOLEAN DEFAULT TRUE,
  last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, kanji_character)
);

-- Word interactions (analytics for future improvements)
CREATE TABLE word_interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  word TEXT NOT NULL,
  interaction_type TEXT CHECK (interaction_type IN ('click', 'save', 'phrase_highlight')),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- CREATE INDEXES
-- ============================================
CREATE INDEX idx_profiles_target_language ON profiles(target_language);
CREATE INDEX idx_articles_language_level ON articles(language, difficulty_level);
CREATE INDEX idx_articles_topic ON articles(topic);
CREATE INDEX idx_word_bank_user ON word_bank(user_id);
CREATE INDEX idx_reading_history_user ON reading_history(user_id);
CREATE INDEX idx_class_enrollments_student ON class_enrollments(student_id);
CREATE INDEX idx_class_enrollments_class ON class_enrollments(class_id);

-- ============================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE word_bank ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE kanji_familiarity ENABLE ROW LEVEL SECURITY;
ALTER TABLE word_interactions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- CREATE RLS POLICIES (FIXED - NO CIRCULAR DEPENDENCIES)
-- ============================================

-- Profiles: Users can read/update/insert their own profile
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Classes: Teachers can manage their own classes (NO reference to enrollments)
CREATE POLICY "Teachers can view own classes" ON classes
  FOR SELECT
  USING (auth.uid() = teacher_id);

-- Allow anyone to look up non-archived classes (for joining via join code)
-- This is safe because join codes are meant to be shared publicly
CREATE POLICY "Anyone can lookup non-archived classes" ON classes
  FOR SELECT
  USING (archived = false);

CREATE POLICY "Teachers can insert own classes" ON classes
  FOR INSERT
  WITH CHECK (auth.uid() = teacher_id);

CREATE POLICY "Teachers can update own classes" ON classes
  FOR UPDATE
  USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can delete own classes" ON classes
  FOR DELETE
  USING (auth.uid() = teacher_id);

-- Class enrollments: Teachers and students can access (simple checks, no circular dependency)
CREATE POLICY "View enrollments if teacher owns class" ON class_enrollments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM classes
      WHERE classes.id = class_enrollments.class_id
      AND classes.teacher_id = auth.uid()
    )
    OR auth.uid() = class_enrollments.student_id
  );

CREATE POLICY "Insert enrollments as student" ON class_enrollments
  FOR INSERT
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Delete enrollments if teacher" ON class_enrollments
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM classes
      WHERE classes.id = class_enrollments.class_id
      AND classes.teacher_id = auth.uid()
    )
  );

-- Articles: Everyone can read articles
CREATE POLICY "Anyone can read articles" ON articles FOR SELECT USING (true);

-- Word bank: Users can manage their own word bank
CREATE POLICY "Users can manage own word bank" ON word_bank FOR ALL USING (auth.uid() = user_id);

-- Reading history: Users can manage their own history
CREATE POLICY "Users can manage own reading history" ON reading_history FOR ALL USING (auth.uid() = user_id);

-- Kanji familiarity: Users can manage their own data
CREATE POLICY "Users can manage own kanji familiarity" ON kanji_familiarity FOR ALL USING (auth.uid() = user_id);

-- Word interactions: Users can manage their own interactions
CREATE POLICY "Users can manage own word interactions" ON word_interactions FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- SEED DATA - SAMPLE ARTICLES
-- ============================================

-- Japanese beginner article
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

-- Chinese beginner article
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

-- Japanese intermediate article
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

-- Chinese intermediate article
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
-- You should now have:
-- ✓ All tables created
-- ✓ RLS policies enabled (fixed, no circular dependencies)
-- ✓ Sample articles (2 Japanese, 2 Chinese)
--
-- Next steps:
-- 1. Enable Google OAuth in Supabase Authentication settings
-- 2. Copy your Supabase URL and anon key to frontend/.env.local
-- 3. Start the frontend: cd frontend && npm run dev
-- ============================================
