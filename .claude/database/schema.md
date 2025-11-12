# Database Schema

## Overview

Inkline uses Supabase (PostgreSQL) with Row Level Security (RLS) for data isolation. The schema supports:
- User profiles with role-based access
- Interactive articles with pre-segmented words
- Personal word banks with rich dictionary metadata
- Teacher classroom management
- Reading progress tracking
- Kanji familiarity system (Japanese)

**Setup:** Copy and run `frontend/supabase/complete_setup.sql` in Supabase SQL Editor.

## Tables

### 1. profiles

User profiles extending Supabase `auth.users`.

```sql
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
```

**Columns:**
- `id` - Primary key, links to Supabase auth.users
- `role` - 'student' or 'teacher' (determines UI and permissions)
- `display_name` - User's display name
- `native_language` - User's native language (default: 'en')
- `target_language` - Language being learned ('zh' = Chinese, 'ja' = Japanese)
- `current_level` - Proficiency level (beginner, intermediate, advanced)
- `interests` - JSONB array of topics (e.g., ["technology", "culture"])
- `created_at` / `updated_at` - Timestamps

**RLS Policies:**
- Users can view/update/insert their own profile only

---

### 2. classes

Teacher-created classrooms for student management.

```sql
CREATE TABLE classes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  join_code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  archived BOOLEAN DEFAULT FALSE
);
```

**Columns:**
- `id` - Primary key
- `teacher_id` - Teacher who owns the class
- `name` - Class name (e.g., "Chinese 101 - Spring 2025")
- `join_code` - Unique code for students to join (e.g., "SPRING2025")
- `created_at` - Creation timestamp
- `archived` - Whether class is archived (hidden from active view)

**RLS Policies:**
- Teachers can manage their own classes
- Anyone can look up non-archived classes by join code (for enrollment)

---

### 3. class_enrollments

Links students to classes (many-to-many relationship).

```sql
CREATE TABLE class_enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(class_id, student_id)
);
```

**Columns:**
- `id` - Primary key
- `class_id` - Class being enrolled in
- `student_id` - Student enrolling
- `enrolled_at` - Enrollment timestamp
- Unique constraint prevents duplicate enrollments

**RLS Policies:**
- Teachers can view/delete enrollments in their classes
- Students can view their own enrollments
- Students can enroll themselves

---

### 4. articles

Pre-generated reading content with word segmentation.

```sql
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
  word_definitions JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Columns:**
- `id` - Primary key
- `language` - 'zh' (Chinese) or 'ja' (Japanese)
- `difficulty_level` - beginner, intermediate, or advanced
- `topic` - Category (e.g., "Technology", "Daily Life")
- `title` - Article title
- `content` - Full article text
- `segmented_content` - Pre-segmented words with boundaries (JSONB)
- `word_count` - Total word count
- `target_words` - Key vocabulary words (JSONB array)
- `grammar_points` - Grammar concepts covered (JSONB array)
- `word_definitions` - **NEW:** Preloaded dictionary definitions (JSONB)
- `created_at` - Creation timestamp

**segmented_content structure:**
```json
{
  "words": [
    {"text": "学习", "start": 0, "end": 2, "reading": "xuéxí"},
    {"text": "中文", "start": 2, "end": 4, "reading": "zhōngwén"}
  ]
}
```

**word_definitions structure:**
```json
{
  "学习": {
    "reading": "xuéxí",
    "definition": "to study; to learn",
    "grammarNotes": null,
    "formalityLevel": null,
    "usageNotes": null,
    "definitions": [
      {"meaning": "to study", "partOfSpeech": "verb"},
      {"meaning": "to learn", "partOfSpeech": "verb"}
    ],
    "examples": ["我每天学习中文"],
    "componentCharacters": [
      {"character": "学", "reading": "xué", "definition": "to learn"},
      {"character": "习", "reading": "xí", "definition": "to practice"}
    ]
  }
}
```

**RLS Policies:**
- Anyone can read articles (public access)

---

### 5. word_bank

User's personal vocabulary collection with rich metadata.

```sql
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
```

**Columns:**
- `id` - Primary key
- `user_id` - User who saved the word
- `word` - Word or phrase in target language
- `language` - 'zh' or 'ja'
- `definition` - Primary English definition
- `reading` - Pronunciation (Pinyin for Chinese, Hiragana for Japanese)
- `example_sentence` - Example usage
- `user_notes` - **NEW:** User's personal notes and mnemonics
- `grammar_notes` - **NEW:** Grammar explanations (for particles, function words)
- `formality_level` - **NEW:** Formality level (casual, polite, formal)
- `usage_notes` - **NEW:** Usage context and tips
- `additional_definitions` - **NEW:** Multiple definitions with parts of speech (JSONB)
- `status` - Learning progress ('learning' or 'mastered')
- `times_reviewed` - Review count for spaced repetition
- `first_seen_at` - When word was first encountered
- `last_reviewed_at` - Last review timestamp
- Unique constraint per user per word per language

**additional_definitions structure:**
```json
[
  {"meaning": "to study", "partOfSpeech": "verb"},
  {"meaning": "learning", "partOfSpeech": "noun"}
]
```

**RLS Policies:**
- Users have full access to their own word bank only

---

### 6. reading_history

Tracks article completions, time spent, and user feedback.

```sql
CREATE TABLE reading_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  time_spent_seconds INTEGER DEFAULT 0,
  words_saved_count INTEGER DEFAULT 0,
  liked BOOLEAN
);
```

**Columns:**
- `id` - Primary key
- `user_id` - User who completed the article
- `article_id` - Article that was read
- `completed_at` - Completion timestamp
- `time_spent_seconds` - Total reading time
- `words_saved_count` - Words saved to word bank from this article
- `liked` - User feedback (true = more, false = less, null = neutral)

**RLS Policies:**
- Users have full access to their own reading history only

---

### 7. kanji_familiarity

Tracks kanji familiarity for auto-hiding furigana (Japanese only).

```sql
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
```

**Columns:**
- `id` - Primary key
- `user_id` - User learning the kanji
- `kanji_character` - Single kanji character
- `times_encountered` - How many times user has seen this kanji
- `times_clicked` - How many times user clicked to see reading
- `show_furigana` - Whether to show furigana above kanji (auto-hidden when familiar)
- `last_seen_at` - Last encounter timestamp
- Unique constraint per user per kanji

**Logic:**
- Initially `show_furigana = true`
- After user encounters kanji 3+ times without clicking, `show_furigana = false`
- Promotes character recognition

**RLS Policies:**
- Users have full access to their own kanji familiarity data only

---

### 8. word_interactions

Analytics tracking for word lookups and saves.

```sql
CREATE TABLE word_interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  word TEXT NOT NULL,
  interaction_type TEXT CHECK (interaction_type IN ('click', 'save', 'phrase_highlight')),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Columns:**
- `id` - Primary key
- `user_id` - User who interacted
- `article_id` - Article context
- `word` - Word that was interacted with
- `interaction_type` - Type of interaction:
  - `click` - Looked up definition
  - `save` - Saved to word bank
  - `phrase_highlight` - Selected as part of phrase
- `timestamp` - Interaction timestamp

**Usage:**
- Analytics for understanding user behavior
- Identify difficult words
- Improve article recommendations

**RLS Policies:**
- Users have full access to their own interaction data only

---

## Indexes for Performance

```sql
CREATE INDEX idx_profiles_target_language ON profiles(target_language);
CREATE INDEX idx_articles_language_level ON articles(language, difficulty_level);
CREATE INDEX idx_articles_topic ON articles(topic);
CREATE INDEX idx_word_bank_user ON word_bank(user_id);
CREATE INDEX idx_reading_history_user ON reading_history(user_id);
CREATE INDEX idx_class_enrollments_student ON class_enrollments(student_id);
CREATE INDEX idx_class_enrollments_class ON class_enrollments(class_id);
```

**Purpose:**
- Fast article filtering by language and difficulty
- Quick word bank and reading history queries
- Efficient class roster lookups
- Profile queries by target language

---

## Row Level Security (RLS)

All tables have RLS enabled with policies enforcing:

1. **Data Isolation:** Users can only access their own data
2. **Teacher Access:** Teachers can see students in their classes only
3. **Public Articles:** Anyone can read articles (no auth required)
4. **Safe Enrollment:** Students can enroll in any non-archived class via join code

**Key Security Features:**
- JWT-based authentication via Supabase Auth
- Automatic token validation on every query
- No SQL injection vulnerabilities (parameterized queries)
- Foreign key constraints prevent orphaned records

---

## JSONB Usage

JSONB columns enable flexible schema and fast queries:

### articles.segmented_content
Pre-segmented words with position data for interactive clicking.

### articles.word_definitions
Cached dictionary definitions eliminate API lookup delays during reading.

### articles.target_words & articles.grammar_points
Flexible arrays without schema changes.

### word_bank.additional_definitions
Multiple meanings with parts of speech.

### profiles.interests
User interest tags for article recommendations.

**Performance:**
- JSONB indexed with GIN for fast lookups
- Native PostgreSQL support for JSON operators
- Efficient storage (binary format)

---

## Database Setup

### Option 1: Single-File Setup (Recommended)

```bash
# 1. Copy contents of frontend/supabase/complete_setup.sql
# 2. Paste into Supabase SQL Editor
# 3. Run query
```

This creates:
- All tables with latest schema
- RLS policies
- Indexes
- 4 sample articles (2 Japanese, 2 Chinese)

### Option 2: Migrations (Historical)

```bash
# Apply migrations in order
frontend/supabase/migrations/001_initial_schema.sql
frontend/supabase/migrations/002_add_user_notes.sql
frontend/supabase/migrations/003_add_rich_dictionary_data.sql
frontend/supabase/migrations/004_add_word_definitions.sql
```

**Note:** Option 1 includes all migrations, no need to run both.

---

## Schema Evolution

### Recent Changes

1. **Added `word_definitions` column to articles** (migration 004)
   - Preloaded dictionary definitions for instant lookup
   - Eliminates API delays during reading

2. **Added rich metadata to word_bank** (migrations 002, 003)
   - `user_notes` - Personal notes and mnemonics
   - `grammar_notes` - Grammar explanations
   - `formality_level` - Casual/polite/formal
   - `usage_notes` - Context and tips
   - `additional_definitions` - Multiple meanings (JSONB)

3. **Character breakdown support**
   - `componentCharacters` in `word_definitions` JSONB
   - Shows individual Chinese character meanings

---

## Querying Examples

### Get user's word bank with filters

```sql
SELECT * FROM word_bank
WHERE user_id = auth.uid()
  AND language = 'zh'
  AND status = 'learning'
ORDER BY times_reviewed ASC, first_seen_at DESC;
```

### Get articles with preloaded definitions

```sql
SELECT
  id,
  title,
  topic,
  difficulty_level,
  word_count,
  (word_definitions IS NOT NULL AND word_definitions != '{}') as has_preloaded_defs
FROM articles
WHERE language = 'zh'
  AND difficulty_level = 'beginner'
ORDER BY created_at DESC;
```

### Get student progress in a class

```sql
SELECT
  p.display_name,
  COUNT(DISTINCT rh.article_id) as articles_read,
  COUNT(DISTINCT wb.id) as words_saved,
  SUM(rh.time_spent_seconds) as total_time_seconds
FROM profiles p
JOIN class_enrollments ce ON ce.student_id = p.id
LEFT JOIN reading_history rh ON rh.user_id = p.id
LEFT JOIN word_bank wb ON wb.user_id = p.id
WHERE ce.class_id = 'class-uuid-here'
GROUP BY p.id, p.display_name
ORDER BY articles_read DESC;
```

### Get kanji needing review (low familiarity)

```sql
SELECT kanji_character, times_encountered, times_clicked
FROM kanji_familiarity
WHERE user_id = auth.uid()
  AND times_clicked > times_encountered * 0.5  -- Clicked more than half the time
  AND show_furigana = true
ORDER BY last_seen_at DESC;
```

---

## Backup & Restore

### Backup (via Supabase Dashboard)
1. Navigate to Database > Backups
2. Backups are automatic (point-in-time recovery available)
3. Download manual backup: `pg_dump` via SQL Editor

### Restore
1. Supabase Dashboard > Database > Backups
2. Select backup and restore

---

## Troubleshooting

### RLS Policy Issues
If users can't access data:
```sql
-- Check RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables
WHERE schemaname = 'public';

-- List policies
SELECT * FROM pg_policies WHERE schemaname = 'public';
```

### Performance Issues
```sql
-- Analyze query performance
EXPLAIN ANALYZE
SELECT * FROM word_bank WHERE user_id = 'user-uuid';

-- Check index usage
SELECT * FROM pg_stat_user_indexes;
```

### Missing Columns
If you get "column does not exist" errors:
```sql
-- Check table schema
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'word_bank';
```

Run migration if columns are missing.
