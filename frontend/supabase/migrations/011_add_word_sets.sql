-- Word Sets Feature Migration
-- Enables users to organize their word bank into customizable sets with practice tracking

-- ============================================
-- FOLDERS: Hierarchical organization for sets
-- ============================================
CREATE TABLE word_set_folders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  parent_folder_id UUID REFERENCES word_set_folders(id) ON DELETE CASCADE,
  position INTEGER DEFAULT 0, -- For manual ordering
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Prevent circular references and ensure user owns parent folder
  CONSTRAINT no_self_reference CHECK (id != parent_folder_id)
);

-- ============================================
-- WORD SETS: Main sets table
-- ============================================
CREATE TABLE word_sets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  language TEXT NOT NULL CHECK (language IN ('zh', 'ja', 'ko')),

  -- Organization
  folder_id UUID REFERENCES word_set_folders(id) ON DELETE SET NULL,
  color TEXT DEFAULT '#3B82F6', -- Hex color code
  is_favorite BOOLEAN DEFAULT FALSE,
  position INTEGER DEFAULT 0, -- For manual ordering within folder

  -- Media
  cover_image_url TEXT, -- Supabase Storage URL or default image identifier

  -- Practice settings (per-set configuration)
  practice_settings JSONB DEFAULT '{
    "cardsPerSession": "all",
    "shuffle": false,
    "showReading": "always"
  }'::jsonb,

  -- Metadata
  word_count INTEGER DEFAULT 0, -- Denormalized for performance
  total_practice_sessions INTEGER DEFAULT 0,
  last_practiced_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Sharing
  is_public BOOLEAN DEFAULT FALSE,
  share_token TEXT UNIQUE, -- For public sharing links
  original_set_id UUID REFERENCES word_sets(id) ON DELETE SET NULL, -- If this is a copy
  times_copied INTEGER DEFAULT 0, -- How many times this set has been copied

  UNIQUE(user_id, name, language) -- Prevent duplicate set names per user per language
);

-- ============================================
-- WORD SET ITEMS: Junction table for words in sets
-- ============================================
CREATE TABLE word_set_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  set_id UUID REFERENCES word_sets(id) ON DELETE CASCADE NOT NULL,
  word_bank_id UUID REFERENCES word_bank(id) ON DELETE CASCADE NOT NULL,

  -- Ordering
  position INTEGER DEFAULT 0, -- For manual drag-and-drop ordering

  -- Metadata
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Per-set review tracking (separate from global word_bank.times_reviewed)
  times_reviewed_in_set INTEGER DEFAULT 0,
  last_reviewed_in_set TIMESTAMP WITH TIME ZONE,

  UNIQUE(set_id, word_bank_id) -- Word can only appear once per set
);

-- ============================================
-- TAGS: Flexible categorization for sets
-- ============================================
CREATE TABLE word_set_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  set_id UUID REFERENCES word_sets(id) ON DELETE CASCADE NOT NULL,
  tag_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(set_id, tag_name) -- Prevent duplicate tags on same set
);

-- ============================================
-- PRACTICE HISTORY: Track practice sessions per set
-- ============================================
CREATE TABLE word_set_practice_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  set_id UUID REFERENCES word_sets(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,

  -- Session details
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  cards_reviewed INTEGER DEFAULT 0,
  cards_correct INTEGER DEFAULT 0, -- "I know this" count
  cards_incorrect INTEGER DEFAULT 0, -- "I don't know" count
  time_spent_seconds INTEGER DEFAULT 0,

  -- Settings used during this session
  session_settings JSONB -- Snapshot of practice settings used
);

-- ============================================
-- SHARING: Track shared sets and permissions
-- ============================================
CREATE TABLE word_set_shares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  set_id UUID REFERENCES word_sets(id) ON DELETE CASCADE NOT NULL,
  shared_by_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,

  -- Share type and target
  share_type TEXT NOT NULL CHECK (share_type IN ('public', 'link', 'user', 'class')),
  shared_with_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  shared_with_class_id UUID REFERENCES classes(id) ON DELETE CASCADE,

  -- Permissions
  permissions TEXT DEFAULT 'view' CHECK (permissions IN ('view', 'copy', 'edit')),

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE, -- Optional expiration

  -- Analytics
  view_count INTEGER DEFAULT 0,
  copy_count INTEGER DEFAULT 0
);

-- ============================================
-- INDEXES: Optimize common queries
-- ============================================

-- Folders
CREATE INDEX idx_word_set_folders_user ON word_set_folders(user_id);
CREATE INDEX idx_word_set_folders_parent ON word_set_folders(parent_folder_id);

-- Sets
CREATE INDEX idx_word_sets_user ON word_sets(user_id);
CREATE INDEX idx_word_sets_folder ON word_sets(folder_id);
CREATE INDEX idx_word_sets_language ON word_sets(language);
CREATE INDEX idx_word_sets_public ON word_sets(is_public) WHERE is_public = true;
CREATE INDEX idx_word_sets_share_token ON word_sets(share_token) WHERE share_token IS NOT NULL;
CREATE INDEX idx_word_sets_original ON word_sets(original_set_id) WHERE original_set_id IS NOT NULL;

-- Set items
CREATE INDEX idx_word_set_items_set ON word_set_items(set_id);
CREATE INDEX idx_word_set_items_word ON word_set_items(word_bank_id);
CREATE INDEX idx_word_set_items_position ON word_set_items(set_id, position);

-- Tags
CREATE INDEX idx_word_set_tags_set ON word_set_tags(set_id);
CREATE INDEX idx_word_set_tags_name ON word_set_tags(tag_name);

-- Practice history
CREATE INDEX idx_word_set_practice_history_set ON word_set_practice_history(set_id);
CREATE INDEX idx_word_set_practice_history_user ON word_set_practice_history(user_id);
CREATE INDEX idx_word_set_practice_history_date ON word_set_practice_history(started_at);

-- Shares
CREATE INDEX idx_word_set_shares_set ON word_set_shares(set_id);
CREATE INDEX idx_word_set_shares_user ON word_set_shares(shared_by_user_id);
CREATE INDEX idx_word_set_shares_public ON word_set_shares(share_type) WHERE share_type = 'public';

-- ============================================
-- FUNCTIONS: Helper functions for automation
-- ============================================

-- Update word_count when items are added/removed
CREATE OR REPLACE FUNCTION update_word_set_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE word_sets
    SET word_count = word_count + 1,
        updated_at = NOW()
    WHERE id = NEW.set_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE word_sets
    SET word_count = GREATEST(word_count - 1, 0),
        updated_at = NOW()
    WHERE id = OLD.set_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_word_set_count
AFTER INSERT OR DELETE ON word_set_items
FOR EACH ROW
EXECUTE FUNCTION update_word_set_count();

-- Update practice stats when practice session completes
CREATE OR REPLACE FUNCTION update_set_practice_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.completed_at IS NOT NULL AND OLD.completed_at IS NULL THEN
    UPDATE word_sets
    SET total_practice_sessions = total_practice_sessions + 1,
        last_practiced_at = NEW.completed_at,
        updated_at = NOW()
    WHERE id = NEW.set_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_set_practice_stats
AFTER UPDATE ON word_set_practice_history
FOR EACH ROW
EXECUTE FUNCTION update_set_practice_stats();

-- Generate unique share token for sets
CREATE OR REPLACE FUNCTION generate_share_token()
RETURNS TEXT AS $$
DECLARE
  token TEXT;
  exists BOOLEAN := true;
BEGIN
  WHILE exists LOOP
    token := encode(gen_random_bytes(12), 'base64');
    token := replace(replace(replace(token, '/', ''), '=', ''), '+', '');
    SELECT EXISTS(SELECT 1 FROM word_sets WHERE share_token = token) INTO exists;
  END LOOP;
  RETURN token;
END;
$$ LANGUAGE plpgsql;

-- Increment view count for shared sets
CREATE OR REPLACE FUNCTION increment_share_view_count(set_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE word_set_shares
  SET view_count = view_count + 1
  WHERE word_set_shares.set_id = increment_share_view_count.set_id
    AND share_type = 'public';
END;
$$ LANGUAGE plpgsql;

-- Increment copy count for shared sets
CREATE OR REPLACE FUNCTION increment_share_copy_count(set_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE word_set_shares
  SET copy_count = copy_count + 1
  WHERE word_set_shares.set_id = increment_share_copy_count.set_id
    AND share_type = 'public';
END;
$$ LANGUAGE plpgsql;

-- Function to copy a set (for when users copy shared sets)
CREATE OR REPLACE FUNCTION copy_word_set(
  source_set_id UUID,
  target_user_id UUID,
  new_set_name TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  new_set_id UUID;
  source_set RECORD;
  source_item RECORD;
  target_word_id UUID;
BEGIN
  -- Get source set details
  SELECT * INTO source_set FROM word_sets WHERE id = source_set_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Source set not found';
  END IF;

  -- Create new set
  INSERT INTO word_sets (
    user_id, name, description, language, color,
    cover_image_url, practice_settings, original_set_id, is_public
  ) VALUES (
    target_user_id,
    COALESCE(new_set_name, source_set.name || ' (Copy)'),
    source_set.description,
    source_set.language,
    source_set.color,
    source_set.cover_image_url,
    source_set.practice_settings,
    source_set_id,
    false -- Copies are private by default
  ) RETURNING id INTO new_set_id;

  -- Copy all items (matching words in target user's word bank)
  FOR source_item IN
    SELECT wsi.*, wb.word, wb.language
    FROM word_set_items wsi
    JOIN word_bank wb ON wb.id = wsi.word_bank_id
    WHERE wsi.set_id = source_set_id
    ORDER BY wsi.position
  LOOP
    -- Find matching word in target user's word bank
    SELECT id INTO target_word_id
    FROM word_bank
    WHERE user_id = target_user_id
      AND word = source_item.word
      AND language = source_item.language
    LIMIT 1;

    -- Only copy if user has this word in their word bank
    IF target_word_id IS NOT NULL THEN
      INSERT INTO word_set_items (set_id, word_bank_id, position)
      VALUES (new_set_id, target_word_id, source_item.position);
    END IF;
  END LOOP;

  -- Increment copy count on source
  UPDATE word_sets
  SET times_copied = times_copied + 1
  WHERE id = source_set_id;

  RETURN new_set_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS
ALTER TABLE word_set_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE word_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE word_set_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE word_set_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE word_set_practice_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE word_set_shares ENABLE ROW LEVEL SECURITY;

-- Folders: Users can only manage their own folders
CREATE POLICY "Users can manage own folders"
  ON word_set_folders FOR ALL
  USING (auth.uid() = user_id);

-- Sets: Users can manage own sets, view public sets
CREATE POLICY "Users can manage own sets"
  ON word_sets FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view public sets"
  ON word_sets FOR SELECT
  USING (is_public = true);

-- Set items: Users can manage items in their own sets
CREATE POLICY "Users can manage items in own sets"
  ON word_set_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM word_sets
      WHERE word_sets.id = word_set_items.set_id
        AND word_sets.user_id = auth.uid()
    )
  );

-- Tags: Users can manage tags on their own sets
CREATE POLICY "Users can manage tags on own sets"
  ON word_set_tags FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM word_sets
      WHERE word_sets.id = word_set_tags.set_id
        AND word_sets.user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can view tags on public sets"
  ON word_set_tags FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM word_sets
      WHERE word_sets.id = word_set_tags.set_id
        AND word_sets.is_public = true
    )
  );

-- Practice history: Users can only access their own practice data
CREATE POLICY "Users can manage own practice history"
  ON word_set_practice_history FOR ALL
  USING (auth.uid() = user_id);

-- Shares: Users can manage shares they created
CREATE POLICY "Users can manage own shares"
  ON word_set_shares FOR ALL
  USING (auth.uid() = shared_by_user_id);

CREATE POLICY "Anyone can view public shares"
  ON word_set_shares FOR SELECT
  USING (share_type = 'public');

-- ============================================
-- STORAGE: Create bucket for set cover images
-- ============================================

-- Note: This needs to be run separately in Supabase dashboard or via API
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('set-covers', 'set-covers', true);

-- Storage policies will need to be set:
-- - Allow authenticated users to upload to their own folder
-- - Allow public read access to all cover images

-- ============================================
-- COMMENTS: Documentation for tables
-- ============================================

COMMENT ON TABLE word_set_folders IS 'Hierarchical folders for organizing word sets';
COMMENT ON TABLE word_sets IS 'User-created collections of words for organized practice';
COMMENT ON TABLE word_set_items IS 'Junction table linking words to sets with ordering';
COMMENT ON TABLE word_set_tags IS 'Flexible tags/categories for sets';
COMMENT ON TABLE word_set_practice_history IS 'Tracks individual practice sessions per set';
COMMENT ON TABLE word_set_shares IS 'Manages sharing permissions and public library';

COMMENT ON COLUMN word_sets.word_count IS 'Denormalized count, updated via trigger';
COMMENT ON COLUMN word_sets.share_token IS 'Unique token for public sharing URLs';
COMMENT ON COLUMN word_sets.original_set_id IS 'References original if this is a copied set';
COMMENT ON COLUMN word_set_items.position IS 'Manual ordering position (0-indexed)';
COMMENT ON COLUMN word_set_items.times_reviewed_in_set IS 'Review count specific to this set context';
