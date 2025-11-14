import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import type {
  WordSet,
  WordSetFolder,
  WordSetItem,
  WordSetTag,
  WordSetPracticeHistory,
  Language
} from '@/types';

export function useWordSets(userId?: string, language?: Language) {
  const [sets, setSets] = useState<WordSet[]>([]);
  const [folders, setFolders] = useState<WordSetFolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all sets for user
  const fetchSets = useCallback(async () => {
    if (!userId) {
      setSets([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('word_sets')
        .select('*')
        .eq('user_id', userId)
        .order('position', { ascending: true });

      if (language) {
        query = query.eq('language', language);
      }

      const { data, error } = await query;

      if (error) throw error;

      setSets(data || []);
    } catch (err) {
      console.error('Error fetching word sets:', err);
      setError('Failed to load sets');
      toast.error('Failed to load sets');
    } finally {
      setLoading(false);
    }
  }, [userId, language]);

  // Fetch folders
  const fetchFolders = useCallback(async () => {
    if (!userId) {
      setFolders([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('word_set_folders')
        .select('*')
        .eq('user_id', userId)
        .order('position', { ascending: true });

      if (error) throw error;

      setFolders(data || []);
    } catch (err) {
      console.error('Error fetching folders:', err);
    }
  }, [userId]);

  // Initial fetch
  useEffect(() => {
    fetchSets();
    fetchFolders();
  }, [fetchSets, fetchFolders]);

  // Create new set
  const createSet = async (setData: Partial<WordSet>) => {
    if (!userId) throw new Error('User not authenticated');

    try {
      const { data, error } = await supabase
        .from('word_sets')
        .insert({
          user_id: userId,
          ...setData,
        })
        .select()
        .single();

      if (error) throw error;

      setSets((prev) => [...prev, data]);
      toast.success('Set created successfully');
      return data;
    } catch (err) {
      console.error('Error creating set:', err);
      toast.error('Failed to create set');
      throw err;
    }
  };

  // Update set
  const updateSet = async (setId: string, updates: Partial<WordSet>) => {
    try {
      const { data, error } = await supabase
        .from('word_sets')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', setId)
        .select()
        .single();

      if (error) throw error;

      setSets((prev) =>
        prev.map((set) => (set.id === setId ? data : set))
      );
      toast.success('Set updated successfully');
      return data;
    } catch (err) {
      console.error('Error updating set:', err);
      toast.error('Failed to update set');
      throw err;
    }
  };

  // Delete set
  const deleteSet = async (setId: string) => {
    try {
      const { error } = await supabase
        .from('word_sets')
        .delete()
        .eq('id', setId);

      if (error) throw error;

      setSets((prev) => prev.filter((set) => set.id !== setId));
      toast.success('Set deleted successfully');
    } catch (err) {
      console.error('Error deleting set:', err);
      toast.error('Failed to delete set');
      throw err;
    }
  };

  // Toggle favorite
  const toggleFavorite = async (setId: string, isFavorite: boolean) => {
    try {
      const { error } = await supabase
        .from('word_sets')
        .update({ is_favorite: isFavorite })
        .eq('id', setId);

      if (error) throw error;

      setSets((prev) =>
        prev.map((set) =>
          set.id === setId ? { ...set, is_favorite: isFavorite } : set
        )
      );
    } catch (err) {
      console.error('Error toggling favorite:', err);
      toast.error('Failed to update favorite status');
      throw err;
    }
  };

  // Copy set (for user's own duplication or copying shared sets)
  const copySet = async (sourceSetId: string, newName?: string) => {
    if (!userId) throw new Error('User not authenticated');

    try {
      const { data, error } = await supabase.rpc('copy_word_set', {
        source_set_id: sourceSetId,
        target_user_id: userId,
        new_set_name: newName || null,
      });

      if (error) throw error;

      await fetchSets();
      toast.success('Set copied successfully');
      return data;
    } catch (err) {
      console.error('Error copying set:', err);
      toast.error('Failed to copy set');
      throw err;
    }
  };

  // Create folder
  const createFolder = async (folderData: Partial<WordSetFolder>) => {
    if (!userId) throw new Error('User not authenticated');

    try {
      const { data, error } = await supabase
        .from('word_set_folders')
        .insert({
          user_id: userId,
          ...folderData,
        })
        .select()
        .single();

      if (error) throw error;

      setFolders((prev) => [...prev, data]);
      toast.success('Folder created successfully');
      return data;
    } catch (err) {
      console.error('Error creating folder:', err);
      toast.error('Failed to create folder');
      throw err;
    }
  };

  // Update folder
  const updateFolder = async (folderId: string, updates: Partial<WordSetFolder>) => {
    try {
      const { data, error } = await supabase
        .from('word_set_folders')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', folderId)
        .select()
        .single();

      if (error) throw error;

      setFolders((prev) =>
        prev.map((folder) => (folder.id === folderId ? data : folder))
      );
      toast.success('Folder updated successfully');
      return data;
    } catch (err) {
      console.error('Error updating folder:', err);
      toast.error('Failed to update folder');
      throw err;
    }
  };

  // Delete folder
  const deleteFolder = async (folderId: string) => {
    try {
      const { error } = await supabase
        .from('word_set_folders')
        .delete()
        .eq('id', folderId);

      if (error) throw error;

      setFolders((prev) => prev.filter((folder) => folder.id !== folderId));
      toast.success('Folder deleted successfully');
    } catch (err) {
      console.error('Error deleting folder:', err);
      toast.error('Failed to delete folder');
      throw err;
    }
  };

  return {
    sets,
    folders,
    loading,
    error,
    fetchSets,
    createSet,
    updateSet,
    deleteSet,
    toggleFavorite,
    copySet,
    createFolder,
    updateFolder,
    deleteFolder,
  };
}

// Hook for managing items within a set
export function useSetItems(setId?: string) {
  const [items, setItems] = useState<WordSetItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch items with word details
  const fetchItems = useCallback(async () => {
    if (!setId) {
      setItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('word_set_items')
        .select(`
          *,
          word:word_bank(*)
        `)
        .eq('set_id', setId)
        .order('position', { ascending: true });

      if (error) throw error;

      setItems(data || []);
    } catch (err) {
      console.error('Error fetching set items:', err);
      toast.error('Failed to load set items');
    } finally {
      setLoading(false);
    }
  }, [setId]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // Add word to set
  const addWord = async (wordBankId: string, position?: number) => {
    if (!setId) throw new Error('No set selected');

    try {
      const { data, error } = await supabase
        .from('word_set_items')
        .insert({
          set_id: setId,
          word_bank_id: wordBankId,
          position: position ?? items.length,
        })
        .select(`
          *,
          word:word_bank(*)
        `)
        .single();

      if (error) throw error;

      setItems((prev) => [...prev, data]);
      return data;
    } catch (err) {
      console.error('Error adding word to set:', err);
      toast.error('Failed to add word to set');
      throw err;
    }
  };

  // Add multiple words to set
  const addWords = async (wordBankIds: string[]) => {
    if (!setId) throw new Error('No set selected');

    try {
      const itemsToInsert = wordBankIds.map((wordBankId, index) => ({
        set_id: setId,
        word_bank_id: wordBankId,
        position: items.length + index,
      }));

      const { error } = await supabase
        .from('word_set_items')
        .insert(itemsToInsert);

      if (error) throw error;

      await fetchItems();
    } catch (err) {
      console.error('Error adding words to set:', err);
      toast.error('Failed to add words to set');
      throw err;
    }
  };

  // Remove word from set
  const removeWord = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('word_set_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      setItems((prev) => prev.filter((item) => item.id !== itemId));
    } catch (err) {
      console.error('Error removing word from set:', err);
      toast.error('Failed to remove word from set');
      throw err;
    }
  };

  // Update item position (for drag-and-drop)
  const updatePosition = async (itemId: string, newPosition: number) => {
    try {
      const { error } = await supabase
        .from('word_set_items')
        .update({ position: newPosition })
        .eq('id', itemId);

      if (error) throw error;

      setItems((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, position: newPosition } : item
        )
      );
    } catch (err) {
      console.error('Error updating item position:', err);
      throw err;
    }
  };

  // Reorder items (for batch updates after drag-and-drop)
  const reorderItems = async (reorderedItems: { id: string; position: number }[]) => {
    try {
      // Update all positions in parallel
      await Promise.all(
        reorderedItems.map((item) =>
          supabase
            .from('word_set_items')
            .update({ position: item.position })
            .eq('id', item.id)
        )
      );

      await fetchItems();
    } catch (err) {
      console.error('Error reordering items:', err);
      toast.error('Failed to reorder items');
      throw err;
    }
  };

  // Increment review count for item
  const incrementReviewCount = async (itemId: string) => {
    try {
      const item = items.find((i) => i.id === itemId);
      if (!item) return;

      const { error } = await supabase
        .from('word_set_items')
        .update({
          times_reviewed_in_set: (item.times_reviewed_in_set || 0) + 1,
          last_reviewed_in_set: new Date().toISOString(),
        })
        .eq('id', itemId);

      if (error) throw error;
    } catch (err) {
      console.error('Error incrementing review count:', err);
    }
  };

  return {
    items,
    loading,
    fetchItems,
    addWord,
    addWords,
    removeWord,
    updatePosition,
    reorderItems,
    incrementReviewCount,
  };
}

// Hook for managing set tags
export function useSetTags(setId?: string) {
  const [tags, setTags] = useState<WordSetTag[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTags = useCallback(async () => {
    if (!setId) {
      setTags([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('word_set_tags')
        .select('*')
        .eq('set_id', setId);

      if (error) throw error;

      setTags(data || []);
    } catch (err) {
      console.error('Error fetching tags:', err);
    } finally {
      setLoading(false);
    }
  }, [setId]);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  const addTag = async (tagName: string) => {
    if (!setId) throw new Error('No set selected');

    try {
      const { data, error } = await supabase
        .from('word_set_tags')
        .insert({
          set_id: setId,
          tag_name: tagName.trim(),
        })
        .select()
        .single();

      if (error) throw error;

      setTags((prev) => [...prev, data]);
      return data;
    } catch (err) {
      console.error('Error adding tag:', err);
      toast.error('Failed to add tag');
      throw err;
    }
  };

  const removeTag = async (tagId: string) => {
    try {
      const { error } = await supabase
        .from('word_set_tags')
        .delete()
        .eq('id', tagId);

      if (error) throw error;

      setTags((prev) => prev.filter((tag) => tag.id !== tagId));
    } catch (err) {
      console.error('Error removing tag:', err);
      toast.error('Failed to remove tag');
      throw err;
    }
  };

  return {
    tags,
    loading,
    fetchTags,
    addTag,
    removeTag,
  };
}

// Hook for practice history
export function usePracticeHistory(setId?: string, userId?: string) {
  const [history, setHistory] = useState<WordSetPracticeHistory[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = useCallback(async () => {
    if (!setId || !userId) {
      setHistory([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('word_set_practice_history')
        .select('*')
        .eq('set_id', setId)
        .eq('user_id', userId)
        .order('started_at', { ascending: false });

      if (error) throw error;

      setHistory(data || []);
    } catch (err) {
      console.error('Error fetching practice history:', err);
    } finally {
      setLoading(false);
    }
  }, [setId, userId]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // Create new practice session
  const startSession = async () => {
    if (!setId || !userId) throw new Error('Missing set or user ID');

    try {
      const { data, error } = await supabase
        .from('word_set_practice_history')
        .insert({
          set_id: setId,
          user_id: userId,
        })
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (err) {
      console.error('Error starting practice session:', err);
      throw err;
    }
  };

  // Complete practice session
  const completeSession = async (
    sessionId: string,
    stats: {
      cards_reviewed: number;
      cards_correct: number;
      cards_incorrect: number;
      time_spent_seconds: number;
    }
  ) => {
    try {
      const { error } = await supabase
        .from('word_set_practice_history')
        .update({
          completed_at: new Date().toISOString(),
          ...stats,
        })
        .eq('id', sessionId);

      if (error) throw error;

      await fetchHistory();
    } catch (err) {
      console.error('Error completing practice session:', err);
      throw err;
    }
  };

  return {
    history,
    loading,
    fetchHistory,
    startSession,
    completeSession,
  };
}
