import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Search, Copy, Eye, TrendingUp, Star, Download } from 'lucide-react';
import type { PublicWordSet, Language } from '@/types';

interface PublicLibraryModalProps {
  open: boolean;
  onClose: () => void;
  onCopySet: (setId: string, newName: string) => Promise<any>;
  userLanguage: Language;
}

export function PublicLibraryModal({
  open,
  onClose,
  onCopySet,
  userLanguage,
}: PublicLibraryModalProps) {
  const [sets, setSets] = useState<PublicWordSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [languageFilter, setLanguageFilter] = useState<Language | 'all'>(userLanguage);
  const [sortBy, setSortBy] = useState<'popular' | 'recent' | 'words'>('popular');
  const [copying, setCopying] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      fetchPublicSets();
    }
  }, [open, languageFilter, sortBy]);

  const fetchPublicSets = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('word_sets')
        .select(`
          *,
          owner:profiles!word_sets_user_id_fkey(display_name),
          shares:word_set_shares!inner(view_count, copy_count),
          tags:word_set_tags(tag_name)
        `)
        .eq('is_public', true);

      if (languageFilter !== 'all') {
        query = query.eq('language', languageFilter);
      }

      // Sort
      if (sortBy === 'popular') {
        query = query.order('times_copied', { ascending: false });
      } else if (sortBy === 'recent') {
        query = query.order('created_at', { ascending: false });
      } else if (sortBy === 'words') {
        query = query.order('word_count', { ascending: false });
      }

      query = query.limit(50);

      const { data, error } = await query;

      if (error) throw error;

      // Transform data
      const transformedSets: PublicWordSet[] = (data || []).map((set: any) => ({
        ...set,
        owner_name: set.owner?.display_name || 'Unknown',
        tags: set.tags?.map((t: any) => t.tag_name) || [],
        preview_words: [], // We'll fetch this separately if needed
      }));

      setSets(transformedSets);
    } catch (err) {
      console.error('Error fetching public sets:', err);
      toast.error('Failed to load public sets');
    } finally {
      setLoading(false);
    }
  };

  const handleCopySet = async (set: PublicWordSet) => {
    const newName = prompt(
      `Enter a name for your copy of "${set.name}":`,
      `${set.name} (Copy)`
    );

    if (!newName) return;

    setCopying(set.id);
    try {
      await onCopySet(set.id, newName);
      toast.success(`Copied "${set.name}" to your sets`);

      // Increment copy count
      await supabase.rpc('increment_share_copy_count', { set_id: set.id });

      // Refresh to show updated stats
      fetchPublicSets();
    } catch (err) {
      console.error('Error copying set:', err);
      toast.error('Failed to copy set');
    } finally {
      setCopying(null);
    }
  };

  const handleViewSet = async (set: PublicWordSet) => {
    // Increment view count
    await supabase.rpc('increment_share_view_count', { set_id: set.id });

    // Open in new tab or show preview
    window.open(`/sets/shared/${set.share_token}`, '_blank');
  };

  const filteredSets = sets.filter((set) => {
    if (!searchQuery) return true;

    const query = searchQuery.toLowerCase();
    return (
      set.name.toLowerCase().includes(query) ||
      set.description?.toLowerCase().includes(query) ||
      set.owner_name.toLowerCase().includes(query) ||
      set.tags.some((tag) => tag.toLowerCase().includes(query))
    );
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Public Library</DialogTitle>
          <DialogDescription>
            Browse and copy sets shared by the community
          </DialogDescription>
        </DialogHeader>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 py-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search public sets..."
              className="pl-9"
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant={languageFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setLanguageFilter('all')}
            >
              All
            </Button>
            <Button
              variant={languageFilter === 'zh' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setLanguageFilter('zh')}
            >
              中文
            </Button>
            <Button
              variant={languageFilter === 'ja' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setLanguageFilter('ja')}
            >
              日本語
            </Button>
            <Button
              variant={languageFilter === 'ko' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setLanguageFilter('ko')}
            >
              한국어
            </Button>
          </div>
        </div>

        {/* Sort options */}
        <div className="flex gap-2 pb-4">
          <Button
            variant={sortBy === 'popular' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setSortBy('popular')}
          >
            <TrendingUp className="mr-2 h-4 w-4" />
            Popular
          </Button>
          <Button
            variant={sortBy === 'recent' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setSortBy('recent')}
          >
            <Star className="mr-2 h-4 w-4" />
            Recent
          </Button>
          <Button
            variant={sortBy === 'words' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setSortBy('words')}
          >
            Most Words
          </Button>
        </div>

        {/* Sets List */}
        <div className="flex-1 overflow-y-auto space-y-3">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading public sets...</p>
            </div>
          ) : filteredSets.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {searchQuery
                  ? 'No sets match your search'
                  : 'No public sets available yet'}
              </p>
            </div>
          ) : (
            filteredSets.map((set) => (
              <Card key={set.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Cover */}
                    <div
                      className="w-16 h-16 rounded-md flex items-center justify-center text-3xl shrink-0"
                      style={{
                        background: `linear-gradient(135deg, ${set.color}30, ${set.color}10)`,
                      }}
                    >
                      {set.cover_image_url?.startsWith('emoji:')
                        ? set.cover_image_url.replace('emoji:', '')
                        : '📖'}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate">{set.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            by {set.owner_name}
                          </p>
                        </div>
                        <Badge variant="secondary" className="shrink-0">
                          {set.language === 'zh' ? '中文' : set.language === 'ja' ? '日本語' : '한국어'}
                        </Badge>
                      </div>

                      {set.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                          {set.description}
                        </p>
                      )}

                      {/* Tags */}
                      {set.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {set.tags.slice(0, 3).map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {set.tags.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{set.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}

                      {/* Stats */}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">
                          {set.word_count} {set.word_count === 1 ? 'word' : 'words'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Download className="h-3 w-3" />
                          {set.times_copied} {set.times_copied === 1 ? 'copy' : 'copies'}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewSet(set)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleCopySet(set)}
                        disabled={copying === set.id}
                      >
                        <Copy className="mr-2 h-4 w-4" />
                        {copying === set.id ? 'Copying...' : 'Copy'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
