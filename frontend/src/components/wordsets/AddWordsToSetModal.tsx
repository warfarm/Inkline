import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { Search, Plus, BookPlus, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { WordBankEntry, WordSet } from '@/types';

interface AddWordsToSetModalProps {
  open: boolean;
  onClose: () => void;
  set: WordSet;
  currentWordIds: string[]; // Word IDs already in the set
  onWordsAdded: () => void; // Callback to refresh the set items
  userId: string;
}

export function AddWordsToSetModal({
  open,
  onClose,
  set,
  currentWordIds,
  onWordsAdded,
  userId,
}: AddWordsToSetModalProps) {
  const [availableWords, setAvailableWords] = useState<WordBankEntry[]>([]);
  const [selectedWordIds, setSelectedWordIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'learning' | 'mastered'>('all');

  // Fetch available words when modal opens
  useEffect(() => {
    if (open) {
      fetchAvailableWords();
      setSelectedWordIds([]);
      setSearchQuery('');
    }
  }, [open, set.language, userId]);

  const fetchAvailableWords = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('word_bank')
        .select('*')
        .eq('user_id', userId)
        .eq('language', set.language)
        .order('first_seen_at', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;

      // Filter out words already in the set
      const filtered = (data || []).filter((word) => !currentWordIds.includes(word.id));

      setAvailableWords(filtered);
    } catch (error) {
      console.error('Error fetching available words:', error);
      toast.error('Failed to load words');
    } finally {
      setLoading(false);
    }
  };

  // Filter and search words
  const filteredWords = availableWords.filter((word) => {
    const matchesSearch =
      !searchQuery ||
      word.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
      word.definition.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (word.reading && word.reading.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || word.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleToggleWord = (wordId: string) => {
    setSelectedWordIds((prev) =>
      prev.includes(wordId)
        ? prev.filter((id) => id !== wordId)
        : [...prev, wordId]
    );
  };

  const handleSelectAll = () => {
    if (selectedWordIds.length === filteredWords.length) {
      setSelectedWordIds([]);
    } else {
      setSelectedWordIds(filteredWords.map((word) => word.id));
    }
  };

  const handleAddWords = async () => {
    if (selectedWordIds.length === 0) {
      toast.error('Please select at least one word');
      return;
    }

    // Check word limit
    const totalAfterAdd = currentWordIds.length + selectedWordIds.length;
    if (totalAfterAdd > 100) {
      toast.error(`Cannot add ${selectedWordIds.length} words. Set limit is 100 words (currently ${currentWordIds.length})`);
      return;
    }

    setSaving(true);
    try {
      // Get the current max position in the set
      const { data: existingItems, error: fetchError } = await supabase
        .from('word_set_items')
        .select('position')
        .eq('set_id', set.id)
        .order('position', { ascending: false })
        .limit(1);

      if (fetchError) throw fetchError;

      const startPosition = existingItems && existingItems.length > 0
        ? existingItems[0].position + 1
        : 0;

      // Insert all selected words
      const itemsToInsert = selectedWordIds.map((wordId, index) => ({
        set_id: set.id,
        word_bank_id: wordId,
        position: startPosition + index,
      }));

      const { error: insertError } = await supabase
        .from('word_set_items')
        .insert(itemsToInsert);

      if (insertError) throw insertError;

      toast.success(`Added ${selectedWordIds.length} word${selectedWordIds.length > 1 ? 's' : ''} to ${set.name}`);
      onWordsAdded();
      onClose();
    } catch (error) {
      console.error('Error adding words to set:', error);
      toast.error('Failed to add words to set');
    } finally {
      setSaving(false);
    }
  };

  const languageDisplay = set.language === 'zh' ? 'Chinese' : set.language === 'ja' ? 'Japanese' : 'Korean';

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Add Words to {set.name}</DialogTitle>
          <DialogDescription>
            Select words from your {languageDisplay} word bank to add to this set
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 py-4">
          {/* Search and Filters */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search words..."
                className="pl-9"
              />
            </div>
            <div className="flex gap-1">
              <Button
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('all')}
              >
                All
              </Button>
              <Button
                variant={statusFilter === 'learning' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('learning')}
              >
                Learning
              </Button>
              <Button
                variant={statusFilter === 'mastered' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('mastered')}
              >
                Mastered
              </Button>
            </div>
          </div>

          {/* Select All */}
          {filteredWords.length > 0 && (
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={selectedWordIds.length === filteredWords.length && filteredWords.length > 0}
                  onCheckedChange={handleSelectAll}
                />
                <span className="text-sm text-muted-foreground">
                  Select All ({filteredWords.length} words)
                </span>
              </div>
              <span className="text-sm text-muted-foreground">
                {selectedWordIds.length} selected
              </span>
            </div>
          )}

          {/* Words List */}
          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading words...</p>
            </div>
          ) : filteredWords.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <BookPlus className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground mb-2">
                  {availableWords.length === 0
                    ? `No ${languageDisplay} words available to add`
                    : 'No words match your search'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {availableWords.length === 0
                    ? 'All your words are already in this set!'
                    : 'Try adjusting your search or filters'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {filteredWords.map((word) => {
                const isSelected = selectedWordIds.includes(word.id);

                return (
                  <Card
                    key={word.id}
                    className={`cursor-pointer transition-all ${
                      isSelected
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'hover:bg-accent'
                    }`}
                    onClick={() => handleToggleWord(word.id)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => handleToggleWord(word.id)}
                          onClick={(e) => e.stopPropagation()}
                        />

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg font-semibold">{word.word}</span>
                            {word.reading && (
                              <span className="text-sm text-muted-foreground">
                                {word.reading}
                              </span>
                            )}
                            <Badge variant="outline" className="text-xs">
                              {word.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {word.definition}
                          </p>
                          <div className="flex gap-2 mt-1 text-xs text-muted-foreground">
                            <span>Reviewed: {word.times_reviewed}x</span>
                            {word.formality_level && <span>• {word.formality_level}</span>}
                          </div>
                        </div>

                        {isSelected && (
                          <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Word limit info */}
          {currentWordIds.length + selectedWordIds.length > 100 && (
            <div className="text-sm text-destructive p-3 bg-destructive/10 rounded-md">
              Warning: Cannot exceed 100 words per set. Currently {currentWordIds.length} words, adding {selectedWordIds.length} would exceed the limit.
            </div>
          )}
        </div>

        <DialogFooter className="flex-row justify-between items-center">
          <div className="text-sm text-muted-foreground">
            {currentWordIds.length} / 100 words in set
            {selectedWordIds.length > 0 && (
              <span className="text-foreground font-medium">
                {' '}→ {currentWordIds.length + selectedWordIds.length} after adding
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button
              onClick={handleAddWords}
              disabled={saving || selectedWordIds.length === 0}
            >
              {saving ? (
                'Adding...'
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Add {selectedWordIds.length > 0 ? selectedWordIds.length : ''} Word{selectedWordIds.length !== 1 ? 's' : ''}
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
