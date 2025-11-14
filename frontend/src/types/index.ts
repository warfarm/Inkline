export type UserRole = 'student' | 'teacher';
export type Language = 'zh' | 'ja' | 'ko';
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';
export type WordStatus = 'learning' | 'mastered';
export type ArticleLength = 'short' | 'medium' | 'long';
export type FormalityLevel = 'casual' | 'polite' | 'formal';
export type ShareType = 'public' | 'link' | 'user' | 'class';
export type SharePermission = 'view' | 'copy' | 'edit';

export interface Profile {
  id: string;
  role: UserRole;
  display_name: string;
  native_language: string;
  target_language: Language;
  current_level: DifficultyLevel;
  interests: string[];
  show_furigana?: boolean; // Display furigana (readings) above Japanese text
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
  word_definitions?: Record<string, {
    reading?: string;
    definition?: string;
    example?: string;
    grammarNotes?: string;
    formalityLevel?: 'casual' | 'polite' | 'formal';
    usageNotes?: string;
    definitions?: Array<{
      meaning: string;
      partOfSpeech?: string;
    }>;
    examples?: string[];
    jlptLevel?: number;
  }>;
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
  grammar_notes?: string;
  formality_level?: 'casual' | 'polite' | 'formal';
  usage_notes?: string;
  additional_definitions?: Array<{
    meaning: string;
    partOfSpeech?: string;
  }>;
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
  formalityLevel?: 'casual' | 'polite' | 'formal' | 'honorific';
  usageNotes?: string;
  example?: string; // Kept for backwards compatibility
  jlptLevel?: number; // JLPT level (5=easiest, 1=hardest)
  componentCharacters?: Array<{
    character: string;
    reading: string;
    definition: string;
  }>;
  // Korean-specific fields
  conjugationInfo?: {
    dictionaryForm: string;
    conjugatedForm: string;
    conjugationType?: string; // e.g., "present polite", "past casual"
  };
  particleBreakdown?: {
    stem: string;
    particle: string;
    particleDefinition: string;
  };
}

export interface GeneratedArticle {
  id: string;
  user_id: string;
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
  word_definitions?: Record<string, {
    reading?: string;
    definition?: string;
    example?: string;
    grammarNotes?: string;
    formalityLevel?: 'casual' | 'polite' | 'formal';
    usageNotes?: string;
    definitions?: Array<{
      meaning: string;
      partOfSpeech?: string;
    }>;
    examples?: string[];
    jlptLevel?: number;
  }>;
  generation_prompt: string;
  word_bank_words_used: string[];
  is_favorite: boolean;
  is_test_article: boolean;
  article_length: ArticleLength;
  created_at: string;
}

// ============================================
// WORD SETS: Set organization and management
// ============================================

export interface WordSetPracticeSettings {
  cardsPerSession: number | 'all';
  shuffle: boolean;
  showReading: 'always' | 'onReveal' | 'never';
}

export interface WordSetFolder {
  id: string;
  user_id: string;
  name: string;
  parent_folder_id?: string;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface WordSet {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  language: Language;

  // Organization
  folder_id?: string;
  color: string;
  is_favorite: boolean;
  position: number;

  // Media
  cover_image_url?: string;

  // Practice settings
  practice_settings: WordSetPracticeSettings;

  // Metadata
  word_count: number;
  total_practice_sessions: number;
  last_practiced_at?: string;
  created_at: string;
  updated_at: string;

  // Sharing
  is_public: boolean;
  share_token?: string;
  original_set_id?: string;
  times_copied: number;
}

export interface WordSetItem {
  id: string;
  set_id: string;
  word_bank_id: string;
  position: number;
  added_at: string;
  times_reviewed_in_set: number;
  last_reviewed_in_set?: string;

  // Populated word data (when joining with word_bank)
  word?: WordBankEntry;
}

export interface WordSetTag {
  id: string;
  set_id: string;
  tag_name: string;
  created_at: string;
}

export interface WordSetPracticeHistory {
  id: string;
  set_id: string;
  user_id: string;
  started_at: string;
  completed_at?: string;
  cards_reviewed: number;
  cards_correct: number;
  cards_incorrect: number;
  time_spent_seconds: number;
  session_settings?: WordSetPracticeSettings;
}

export interface WordSetShare {
  id: string;
  set_id: string;
  shared_by_user_id: string;
  share_type: ShareType;
  shared_with_user_id?: string;
  shared_with_class_id?: string;
  permissions: SharePermission;
  created_at: string;
  expires_at?: string;
  view_count: number;
  copy_count: number;
}

// Extended WordSet with populated relationships
export interface WordSetWithDetails extends WordSet {
  folder?: WordSetFolder;
  tags?: WordSetTag[];
  items?: WordSetItem[];
  share_info?: WordSetShare;
}

// For public library browsing
export interface PublicWordSet extends WordSet {
  owner_name: string; // From profiles.display_name
  tags: string[];
  preview_words: string[]; // First few words for preview
}
