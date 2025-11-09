-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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

-- Indexes for performance
CREATE INDEX idx_profiles_target_language ON profiles(target_language);
CREATE INDEX idx_articles_language_level ON articles(language, difficulty_level);
CREATE INDEX idx_articles_topic ON articles(topic);
CREATE INDEX idx_word_bank_user ON word_bank(user_id);
CREATE INDEX idx_reading_history_user ON reading_history(user_id);
CREATE INDEX idx_class_enrollments_student ON class_enrollments(student_id);
CREATE INDEX idx_class_enrollments_class ON class_enrollments(class_id);

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE word_bank ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE kanji_familiarity ENABLE ROW LEVEL SECURITY;
ALTER TABLE word_interactions ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read/update their own profile
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Classes: Teachers can manage their classes, students can view enrolled classes
CREATE POLICY "Teachers can manage own classes" ON classes FOR ALL USING (auth.uid() = teacher_id);
CREATE POLICY "Students can view enrolled classes" ON classes FOR SELECT
  USING (EXISTS (SELECT 1 FROM class_enrollments WHERE class_id = classes.id AND student_id = auth.uid()));

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

-- Class enrollments: Teachers can view/manage, students can view own
CREATE POLICY "Teachers can manage class enrollments" ON class_enrollments FOR ALL
  USING (EXISTS (SELECT 1 FROM classes WHERE id = class_enrollments.class_id AND teacher_id = auth.uid()));
CREATE POLICY "Students can view own enrollments" ON class_enrollments FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Students can insert own enrollments" ON class_enrollments FOR INSERT WITH CHECK (auth.uid() = student_id);
