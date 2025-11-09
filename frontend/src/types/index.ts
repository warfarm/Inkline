export type UserRole = 'student' | 'teacher';
export type Language = 'zh' | 'ja';
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';
export type WordStatus = 'learning' | 'mastered';

export interface Profile {
  id: string;
  role: UserRole;
  display_name: string;
  native_language: string;
  target_language: Language;
  current_level: DifficultyLevel;
  interests: string[];
  created_at: string;
  updated_at: string;
}

export interface Article {
  id: string;
  language: Language;
  difficulty_level: DifficultyLevel;
  topic: string;
  title: string;
  content: string;
  segmented_content: {
    words: Array<{
      text: string;
      start: number;
      end: number;
      reading?: string;
    }>;
  };
  word_count: number;
  target_words: string[];
  grammar_points: Array<{
    structure: string;
    explanation: string;
    example: string;
  }>;
  created_at: string;
}

export interface WordBankEntry {
  id: string;
  user_id: string;
  word: string;
  language: Language;
  definition: string;
  reading?: string;
  example_sentence?: string;
  status: WordStatus;
  times_reviewed: number;
  first_seen_at: string;
  last_reviewed_at?: string;
  user_notes?: string;
}

export interface ReadingHistory {
  id: string;
  user_id: string;
  article_id: string;
  completed_at: string;
  time_spent_seconds: number;
  words_saved_count: number;
  liked?: boolean;
}

export interface Class {
  id: string;
  teacher_id: string;
  name: string;
  join_code: string;
  created_at: string;
  archived: boolean;
}

export interface DictionaryResult {
  word: string;
  reading: string;
  definition: string;
  definitions?: Array<{
    meaning: string;
    partOfSpeech?: string;
  }>;
  examples?: string[];
  grammarNotes?: string;
  formalityLevel?: 'casual' | 'polite' | 'formal';
  usageNotes?: string;
  example?: string; // Kept for backwards compatibility
}
