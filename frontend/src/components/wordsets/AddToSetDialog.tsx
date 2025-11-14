import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, Search, Folder } from 'lucide-react';
import type { WordSet, Language } from '@/types';

interface AddToSetDialogProps {
  open: boolean;
  onClose: () => void;
  word: string;
  language: Language;
  sets: WordSet[];
  currentSetIds?: string[]; // Sets this word is already in
  onAddToSets: (setIds: string[]) => Promise<void>;
  onCreateNewSet: (setName: string) => void;
}

export function AddToSetDialog({
  open,
  onClose,
  word,
  language,
  sets,
  currentSetIds = [],
  onAddToSets,
  onCreateNewSet,
}: AddToSetDialogProps) {
  const [selectedSetIds, setSelectedSetIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateNew, setShowCreateNew] = useState(false);
  const [newSetName, setNewSetName] = useState('');
  const [saving, setSaving] = useState(false);

  // Filter sets by language and search query
  const filteredSets = sets.filter((set) => {
    const matchesLanguage = set.language === language;
    const matchesSearch = !searchQuery ||
      set.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      set.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesLanguage && matchesSearch;
  });

  // Initialize with current sets
  useEffect(() => {
    if (open) {
      setSelectedSetIds([...currentSetIds]);
      setSearchQuery('');
      setShowCreateNew(false);
      setNewSetName('');
    }
  }, [open, currentSetIds]);

  const handleToggleSet = (setId: string) => {
    setSelectedSetIds((prev) => {
      if (prev.includes(setId)) {
        return prev.filter((id) => id !== setId);
      } else {
        return [...prev, setId];
      }
    });
  };

  const handleCreateAndAdd = () => {
    const trimmedName = newSetName.trim();
    if (!trimmedName) {
      toast.error('Please enter a set name');
      return;
    }

    // Check for duplicate name
    if (sets.some((s) => s.name.toLowerCase() === trimmedName.toLowerCase() && s.language === language)) {
      toast.error('A set with this name already exists');
      return;
    }

    onCreateNewSet(trimmedName);
    setShowCreateNew(false);
    setNewSetName('');
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onAddToSets(selectedSetIds);
      toast.success(`Added "${word}" to ${selectedSetIds.length} set(s)`);
      onClose();
    } catch (error) {
      console.error('Error adding to sets:', error);
      toast.error('Failed to add word to sets');
    } finally {
      setSaving(false);
    }
  };

  // Calculate changes
  const newlySelected = selectedSetIds.filter((id) => !currentSetIds.includes(id));
  const removed = currentSetIds.filter((id) => !selectedSetIds.includes(id));
  const hasChanges = newlySelected.length > 0 || removed.length > 0;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Add to Set</DialogTitle>
          <DialogDescription>
            Select which sets to add <span className="font-semibold">{word}</span> to
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 py-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search sets..."
              className="pl-9"
            />
          </div>

          {/* Create New Set */}
          {!showCreateNew ? (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setShowCreateNew(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Create New Set
            </Button>
          ) : (
            <div className="space-y-2 p-3 border rounded-md bg-muted/50">
              <Label htmlFor="new-set-name">New Set Name</Label>
              <div className="flex gap-2">
                <Input
                  id="new-set-name"
                  value={newSetName}
                  onChange={(e) => setNewSetName(e.target.value)}
                  placeholder="Enter set name..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleCreateAndAdd();
                    } else if (e.key === 'Escape') {
                      setShowCreateNew(false);
                      setNewSetName('');
                    }
                  }}
                  autoFocus
                />
                <Button
                  size="sm"
                  onClick={handleCreateAndAdd}
                  disabled={!newSetName.trim()}
                >
                  Create
                </Button>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={() => {
                  setShowCreateNew(false);
                  setNewSetName('');
                }}
              >
                Cancel
              </Button>
            </div>
          )}

          {/* Sets List */}
          <div className="space-y-2">
            {filteredSets.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Folder className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">
                  {searchQuery ? 'No sets match your search' : `No ${language === 'zh' ? 'Chinese' : language === 'ja' ? 'Japanese' : 'Korean'} sets yet`}
                </p>
                <p className="text-xs mt-1">Create your first set to get started</p>
              </div>
            ) : (
              <>
                {filteredSets.map((set) => {
                  const isSelected = selectedSetIds.includes(set.id);
                  const isCurrentlyIn = currentSetIds.includes(set.id);
                  const isNewlyAdded = newlySelected.includes(set.id);
                  const isRemoved = removed.includes(set.id);

                  return (
                    <div
                      key={set.id}
                      className={`flex items-center gap-3 p-3 rounded-md border transition-colors cursor-pointer ${
                        isSelected
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:bg-accent'
                      }`}
                      onClick={() => handleToggleSet(set.id)}
                    >
                      {/* Color bar */}
                      <div
                        className="w-1 h-10 rounded-full"
                        style={{ backgroundColor: set.color }}
                      />

                      {/* Checkbox */}
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => handleToggleSet(set.id)}
                        onClick={(e) => e.stopPropagation()}
                      />

                      {/* Set info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium truncate">{set.name}</span>
                          {isCurrentlyIn && !isRemoved && (
                            <Badge variant="secondary" className="text-xs">
                              In set
                            </Badge>
                          )}
                          {isNewlyAdded && (
                            <Badge variant="default" className="text-xs">
                              Adding
                            </Badge>
                          )}
                          {isRemoved && (
                            <Badge variant="destructive" className="text-xs">
                              Removing
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {set.word_count} {set.word_count === 1 ? 'word' : 'words'}
                          {set.folder_id && ' • In folder'}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>

          {/* Set limit warning */}
          {sets.filter((s) => s.language === language).length >= 20 && (
            <div className="text-xs text-amber-600 dark:text-amber-500 p-2 bg-amber-50 dark:bg-amber-950 rounded-md">
              You've reached the maximum of 20 sets. Consider deleting unused sets.
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || !hasChanges}
          >
            {saving ? 'Saving...' : hasChanges ? `Update (${newlySelected.length} added, ${removed.length} removed)` : 'No Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
