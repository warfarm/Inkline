import { useState } from 'react';
import { useSetItems, useSetTags } from '@/hooks/useWordSets';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Share2,
  BookOpen,
  GripVertical,
  X,
  Plus,
  Search,
  SortAsc,
  Shuffle,
} from 'lucide-react';
import type { WordSet } from '@/types';

interface SetDetailViewProps {
  set: WordSet;
  onBack: () => void;
  onEdit: (set: WordSet) => void;
  onDelete: (setId: string) => void;
  onShare: (set: WordSet) => void;
}

export function SetDetailView({ set, onBack, onEdit, onDelete, onShare }: SetDetailViewProps) {
  const { items, loading, removeWord, reorderItems } = useSetItems(set.id);
  const { tags, addTag, removeTag } = useSetTags(set.id);

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'position' | 'alphabetical' | 'leastReviewed'>('position');
  const [tagInput, setTagInput] = useState('');

  // Filter and sort items
  const filteredItems = items.filter((item) => {
    if (!item.word) return false;
    const matchesSearch =
      !searchQuery ||
      item.word.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.word.definition.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    if (!a.word || !b.word) return 0;

    switch (sortBy) {
      case 'alphabetical':
        return a.word.word.localeCompare(b.word.word);
      case 'leastReviewed':
        return (a.times_reviewed_in_set || 0) - (b.times_reviewed_in_set || 0);
      case 'position':
      default:
        return a.position - b.position;
    }
  });

  const handleRemoveWord = async (itemId: string) => {
    if (!confirm('Remove this word from the set?')) return;
    await removeWord(itemId);
  };

  const handleSortAlphabetically = async () => {
    const reordered = [...items]
      .filter((item) => item.word)
      .sort((a, b) => a.word!.word.localeCompare(b.word!.word))
      .map((item, index) => ({
        id: item.id,
        position: index,
      }));

    await reorderItems(reordered);
    setSortBy('position');
    toast.success('Set reordered alphabetically');
  };

  const handleShuffleSet = async () => {
    const reordered = [...items]
      .sort(() => Math.random() - 0.5)
      .map((item, index) => ({
        id: item.id,
        position: index,
      }));

    await reorderItems(reordered);
    setSortBy('position');
    toast.success('Set shuffled');
  };

  const handleAddTag = async () => {
    const trimmed = tagInput.trim();
    if (!trimmed) return;

    try {
      await addTag(trimmed);
      setTagInput('');
    } catch (error) {
      // Error already handled in hook
    }
  };

  const getCoverDisplay = () => {
    if (!set.cover_image_url) {
      const defaultEmojis: Record<string, string> = {
        zh: '📚',
        ja: '🎌',
        ko: '🇰🇷',
      };
      return defaultEmojis[set.language] || '📖';
    }

    if (set.cover_image_url.startsWith('emoji:')) {
      return set.cover_image_url.replace('emoji:', '');
    }

    return null;
  };

  const coverEmoji = getCoverDisplay();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <div className="flex-1">
          {/* Cover and Title */}
          <div className="flex items-start gap-4">
            <div
              className="w-20 h-20 rounded-lg flex items-center justify-center text-4xl shadow-sm"
              style={{
                background: coverEmoji
                  ? `linear-gradient(135deg, ${set.color}20, ${set.color}10)`
                  : undefined,
              }}
            >
              {coverEmoji ? (
                coverEmoji
              ) : set.cover_image_url ? (
                <img
                  src={set.cover_image_url}
                  alt={set.name}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                '📖'
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-3xl font-bold">{set.name}</h1>
                <Badge variant="secondary">
                  {set.language === 'zh' ? '中文' : set.language === 'ja' ? '日本語' : '한국어'}
                </Badge>
                {set.is_favorite && (
                  <Badge className="bg-amber-500">
                    Favorite
                  </Badge>
                )}
              </div>
              {set.description && (
                <p className="text-muted-foreground">{set.description}</p>
              )}

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <Badge key={tag.id} variant="outline" className="gap-1">
                    {tag.tag_name}
                    <button
                      onClick={() => removeTag(tag.id)}
                      className="hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                <div className="flex gap-1">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    placeholder="Add tag..."
                    className="h-6 text-xs w-24"
                  />
                  <Button size="sm" variant="ghost" onClick={handleAddTag} className="h-6 px-2">
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Stats and Actions */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex gap-6 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">
                {set.word_count} {set.word_count === 1 ? 'word' : 'words'}
              </span>
              {set.total_practice_sessions > 0 && (
                <span>Practiced {set.total_practice_sessions}x</span>
              )}
              {set.last_practiced_at && (
                <span>
                  Last practiced: {new Date(set.last_practiced_at).toLocaleDateString()}
                </span>
              )}
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => onEdit(set)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
              <Button variant="outline" size="sm" onClick={() => onShare(set)}>
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(set.id)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
              <Button size="sm" disabled={set.word_count === 0}>
                <BookOpen className="mr-2 h-4 w-4" />
                Practice Now
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Practice Settings Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Practice Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Cards per session:</span>{' '}
              <span className="font-medium">
                {set.practice_settings.cardsPerSession === 'all'
                  ? 'All'
                  : set.practice_settings.cardsPerSession}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Shuffle:</span>{' '}
              <span className="font-medium">
                {set.practice_settings.shuffle ? 'On' : 'Off'}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Show reading:</span>{' '}
              <span className="font-medium capitalize">
                {set.practice_settings.showReading.replace(/([A-Z])/g, ' $1').trim()}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search words in set..."
            className="pl-9"
          />
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleSortAlphabetically}>
            <SortAsc className="mr-2 h-4 w-4" />
            Sort A-Z
          </Button>
          <Button variant="outline" size="sm" onClick={handleShuffleSet}>
            <Shuffle className="mr-2 h-4 w-4" />
            Shuffle
          </Button>
        </div>
      </div>

      {/* Words List */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading words...</p>
        </div>
      ) : sortedItems.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">
              {searchQuery
                ? 'No words match your search'
                : 'No words in this set yet'}
            </p>
            {!searchQuery && (
              <p className="text-sm text-muted-foreground">
                Add words from your Word Bank to get started
              </p>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {sortedItems.map((item, index) => {
            if (!item.word) return null;

            return (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {/* Drag handle (for future drag-and-drop) */}
                    <div className="cursor-grab text-muted-foreground hover:text-foreground">
                      <GripVertical className="h-5 w-5" />
                    </div>

                    {/* Position number */}
                    <div className="w-8 text-center text-sm text-muted-foreground font-mono">
                      {index + 1}
                    </div>

                    {/* Word info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="text-xl font-semibold">{item.word.word}</span>
                        {item.word.reading && (
                          <span className="text-sm text-muted-foreground">
                            {item.word.reading}
                          </span>
                        )}
                        <Badge variant="outline" className="text-xs">
                          {item.word.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {item.word.definition}
                      </p>
                    </div>

                    {/* Review stats */}
                    <div className="text-sm text-muted-foreground text-right">
                      <div>
                        Global: {item.word.times_reviewed}x
                      </div>
                      <div>
                        In set: {item.times_reviewed_in_set || 0}x
                      </div>
                    </div>

                    {/* Remove button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveWord(item.id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Word limit warning */}
      {set.word_count >= 100 && (
        <Card className="border-amber-500 bg-amber-50 dark:bg-amber-950">
          <CardContent className="p-4">
            <p className="text-sm text-amber-900 dark:text-amber-100">
              You've reached the maximum of 100 words per set. Consider creating a new set or
              removing some words.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
