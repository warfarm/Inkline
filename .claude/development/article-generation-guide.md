# Article Generation Guide

## Required Article Structure

All articles in the database must follow this complete structure:

### Database Schema Fields

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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Complete Article Format

#### 1. `segmented_content` Structure

```json
{
  "words": [
    {
      "text": "学生",
      "start": 0,
      "end": 2,
      "reading": "がくせい",  // Hiragana for Japanese, Pinyin for Chinese
      "kanji": ["学", "生"]     // Array of kanji characters (empty array for Chinese)
    }
  ]
}
```

**Important Notes:**
- For **Japanese**: `kanji` array contains individual kanji characters found in the word
- For **Chinese**: `kanji` array is always empty `[]`
- Hiragana/katakana words have empty `kanji` arrays
- Punctuation has empty `kanji` arrays

#### 2. `target_words` Structure

Array of 5-8 key vocabulary words from the article:

```json
[
  {
    "word": "学生",
    "reading": "がくせい",
    "definition": "student",
    "example": "私は学生です。"
  }
]
```

#### 3. `grammar_points` Structure

Array of 2-3 grammar patterns found in the article:

```json
[
  {
    "structure": "は...です",
    "explanation": "Topic marker + copula for stating facts",
    "example": "私は学生です。"
  }
]
```

## Article Generation Prompts

### For Japanese Articles

```
Generate a Japanese article at {difficulty_level} level about {topic}.
Target approximately {word_count} words.
Return as a complete SQL INSERT statement with this structure:

INSERT INTO articles (language, difficulty_level, topic, title, content, segmented_content, word_count, target_words, grammar_points) VALUES
(
  'ja',
  '{difficulty_level}',
  '{topic}',
  '{title in Japanese}',
  '{full article content}',
  '{segmented_content JSON with words array including text, start, end, reading (hiragana), kanji array}',
  {word_count},
  '[{target_words array with 5-8 vocabulary words including word, reading, definition, example}]',
  '[{grammar_points array with 2-3 structures including structure, explanation, example}]'
);

Requirements:
- Content should be natural and culturally authentic
- Target JLPT N{level} vocabulary and grammar
- Include kanji arrays for each word (individual kanji characters, empty for kana-only words)
- Target words should be key vocabulary from the article
- Grammar points should reflect patterns actually used in the text
- Examples should be direct quotes from the article

Difficulty guidelines:
- Beginner: ~30-40 words, JLPT N5
- Intermediate: ~100-130 words, JLPT N4-N3
- Advanced: ~350-400 words, JLPT N2-N1
```

### For Chinese Articles

```
Generate a Chinese article at {difficulty_level} level about {topic}.
Target approximately {word_count} words.
Return as a complete SQL INSERT statement with this structure:

INSERT INTO articles (language, difficulty_level, topic, title, content, segmented_content, word_count, target_words, grammar_points) VALUES
(
  'zh',
  '{difficulty_level}',
  '{topic}',
  '{title in Chinese}',
  '{full article content}',
  '{segmented_content JSON with words array including text, start, end, reading (pinyin), kanji: []}',
  {word_count},
  '[{target_words array with 5-8 vocabulary words including word, reading, definition, example}]',
  '[{grammar_points array with 2-3 structures including structure, explanation, example}]'
);

Requirements:
- Content should be natural and culturally authentic
- Target HSK {level} vocabulary and grammar
- All words must have kanji: [] (empty array)
- Target words should be key vocabulary from the article
- Grammar points should reflect patterns actually used in the text
- Examples should be direct quotes from the article

Difficulty guidelines:
- Beginner: ~30-40 words, HSK 1-2
- Intermediate: ~90-125 words, HSK 3-4
- Advanced: ~365-420 words, HSK 5-6
```

## Example: Properly Formatted Japanese Article

```sql
INSERT INTO articles (language, difficulty_level, topic, title, content, segmented_content, word_count, target_words, grammar_points) VALUES
(
  'ja',
  'beginner',
  'Daily Life',
  '私の一日',
  '私は学生です。毎日学校に行きます。朝ごはんを食べます。友達と話します。日本語を勉強します。',
  '{
    "words": [
      {"text": "私", "start": 0, "end": 1, "reading": "わたし", "kanji": ["私"]},
      {"text": "は", "start": 1, "end": 2, "kanji": []},
      {"text": "学生", "start": 2, "end": 4, "reading": "がくせい", "kanji": ["学", "生"]},
      {"text": "です", "start": 4, "end": 6, "kanji": []},
      {"text": "。", "start": 6, "end": 7, "kanji": []}
    ]
  }',
  28,
  '[
    {"word": "学生", "reading": "がくせい", "definition": "student", "example": "私は学生です。"},
    {"word": "毎日", "reading": "まいにち", "definition": "every day", "example": "毎日学校に行きます。"}
  ]',
  '[
    {"structure": "は...です", "explanation": "Topic marker + copula for stating facts", "example": "私は学生です。"},
    {"structure": "に行きます", "explanation": "Movement toward a location", "example": "学校に行きます。"}
  ]'
);
```

## Example: Properly Formatted Chinese Article

```sql
INSERT INTO articles (language, difficulty_level, topic, title, content, segmented_content, word_count, target_words, grammar_points) VALUES
(
  'zh',
  'beginner',
  'Daily Life',
  '我的一天',
  '我是学生。我每天去学校。我吃早饭。我和朋友说话。我学习中文。',
  '{
    "words": [
      {"text": "我", "start": 0, "end": 1, "reading": "wǒ", "kanji": []},
      {"text": "是", "start": 1, "end": 2, "reading": "shì", "kanji": []},
      {"text": "学生", "start": 2, "end": 4, "reading": "xuésheng", "kanji": []},
      {"text": "。", "start": 4, "end": 5, "kanji": []}
    ]
  }',
  22,
  '[
    {"word": "学生", "reading": "xuésheng", "definition": "student", "example": "我是学生。"},
    {"word": "每天", "reading": "měitiān", "definition": "every day", "example": "我每天去学校。"}
  ]',
  '[
    {"structure": "是 + noun", "explanation": "Copula verb for identity", "example": "我是学生。"},
    {"structure": "去 + place", "explanation": "Go to a place", "example": "我每天去学校。"}
  ]'
);
```

## Common Mistakes to Avoid

1. **Missing kanji arrays**: Every word in segmented_content must have a `kanji` field
2. **Wrong kanji format**:
   - Japanese: Individual kanji characters as separate array elements
   - Chinese: Always empty array
3. **Missing target_words or grammar_points**: These are required fields
4. **Incorrect grammar point examples**: Must be actual quotes from the article
5. **Word count mismatch**: Ensure word_count matches actual character/word count
6. **Missing readings**: All content words must have reading field (pinyin/hiragana)

## Word Count Guidelines by Level

### Beginner
- Japanese: 28-43 words
- Chinese: 22-38 words

### Intermediate
- Japanese: 104-136 words
- Chinese: 94-124 words

### Advanced
- Japanese: 348-384 words
- Chinese: 368-420 words

## Topics Available

- Daily Life
- Food & Cooking
- Technology
- Culture & Travel
- Entertainment & Hobbies
- Sports & Fitness
- Current Events
- Business & Work
- Science & Nature
- Arts & Literature
