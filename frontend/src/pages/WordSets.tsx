import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useWordSets } from '@/hooks/useWordSets';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { SetCard } from '@/components/wordsets/SetCard';
import { CreateSetModal } from '@/components/wordsets/CreateSetModal';
import { SetDetailView } from '@/components/wordsets/SetDetailView';
import { ShareSetModal } from '@/components/wordsets/ShareSetModal';
import { PublicLibraryModal } from '@/components/wordsets/PublicLibraryModal';
import { SetRecommendations } from '@/components/wordsets/SetRecommendations';
import { toast } from 'sonner';
import {
  Plus,
  Search,
  Star,
  Library,
  Grid3x3,
  List,
} from 'lucide-react';
import type { WordSet, Language } from '@/types';

export default function WordSets() {
  const { user, profile } = useAuth();
  const userLanguage = profile?.target_language || 'zh';

  const {
    sets,
    loading,
    fetchSets,
    createSet,
    updateSet,
    deleteSet,
    toggleFavorite,
    copySet,
  } = useWordSets(user?.id, undefined); // Fetch all languages

  // UI State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPublicLibrary, setShowPublicLibrary] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(true);
  const [editingSet, setEditingSet] = useState<WordSet | null>(null);
  const [selectedSet, setSelectedSet] = useState<WordSet | null>(null);
  const [sharingSet, setSharingSet] = useState<WordSet | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [languageFilter, setLanguageFilter] = useState<'all' | Language>('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Check if recommendations should be shown (from settings)
  useEffect(() => {
    const showRecs = localStorage.getItem('showSetRecommendations');
    if (showRecs !== null) {
      setShowRecommendations(showRecs === 'true');
    }
  }, []);

  // Update selectedSet when sets data changes to keep it in sync
  useEffect(() => {
    if (selectedSet) {
      const updatedSet = sets.find((s) => s.id === selectedSet.id);
      if (updatedSet) {
        setSelectedSet(updatedSet);
      }
    }
  }, [sets]);

  // Filter sets
  const filteredSets = sets.filter((set) => {
    const matchesSearch =
      !searchQuery ||
      set.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      set.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesLanguage = languageFilter === 'all' || set.language === languageFilter;
    const matchesFavorite = !showFavoritesOnly || set.is_favorite;

    return matchesSearch && matchesLanguage && matchesFavorite;
  });

  // Sort: favorites first, then by position
  const sortedSets = [...filteredSets].sort((a, b) => {
    if (a.is_favorite && !b.is_favorite) return -1;
    if (!a.is_favorite && b.is_favorite) return 1;
    return a.position - b.position;
  });

  const handleCreateSet = async (setData: Partial<WordSet>) => {
    await createSet(setData);
    setShowCreateModal(false);
  };

  const handleEditSet = async (setData: Partial<WordSet>) => {
    if (!editingSet) return;
    await updateSet(editingSet.id, setData);
    setEditingSet(null);
    setShowCreateModal(false);
  };

  const handleDeleteSet = async (setId: string) => {
    if (!confirm('Are you sure you want to delete this set? This action cannot be undone.')) {
      return;
    }
    await deleteSet(setId);
  };

  const handleShareSet = (set: WordSet) => {
    setSharingSet(set);
  };

  const handleCopySet = async (setId: string) => {
    const set = sets.find((s) => s.id === setId);
    const newName = prompt('Enter a name for the copied set:', set ? `${set.name} (Copy)` : 'Copy');
    if (!newName) return;

    await copySet(setId, newName);
  };

  const handlePracticeSet = (set: WordSet) => {
    setSelectedSet(set);
  };

  const handleSetClick = (set: WordSet) => {
    setSelectedSet(set);
  };

  // If viewing a set detail
  if (selectedSet && user) {
    return (
      <Layout>
        <SetDetailView
          set={selectedSet}
          onBack={() => {
            fetchSets(); // Refresh sets to get updated word counts
            setSelectedSet(null);
          }}
          onEdit={(set) => {
            setEditingSet(set);
            setShowCreateModal(true);
          }}
          onDelete={async (setId) => {
            await handleDeleteSet(setId);
            setSelectedSet(null);
          }}
          onShare={handleShareSet}
          userId={user.id}
          profile={profile}
        />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Word Sets</h1>
            <p className="text-muted-foreground mt-1">
              Organize your vocabulary into custom practice sets
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowPublicLibrary(true)}>
              <Library className="mr-2 h-4 w-4" />
              Public Library
            </Button>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Set
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{sets.length}</div>
              <p className="text-xs text-muted-foreground">Total Sets</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                {sets.reduce((sum, set) => sum + set.word_count, 0)}
              </div>
              <p className="text-xs text-muted-foreground">Total Words</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                {sets.filter((s) => s.is_favorite).length}
              </div>
              <p className="text-xs text-muted-foreground">Favorites</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                {sets.reduce((sum, set) => sum + set.total_practice_sessions, 0)}
              </div>
              <p className="text-xs text-muted-foreground">Practice Sessions</p>
            </CardContent>
          </Card>
        </div>

        {/* Recommendations */}
        {showRecommendations && sets.length > 0 && (
          <SetRecommendations
            userId={user?.id || ''}
            language={userLanguage}
            onDismiss={() => setShowRecommendations(false)}
            onCreateFromRecommendation={async (recommendation) => {
              // Create set from recommendation
              await createSet({
                name: recommendation.name,
                description: recommendation.description,
                language: userLanguage,
                color: recommendation.color || '#3B82F6',
              });
              toast.success('Set created from recommendation');
            }}
          />
        )}

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search sets..."
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

          <Button
            variant={showFavoritesOnly ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
          >
            <Star className={`mr-2 h-4 w-4 ${showFavoritesOnly ? 'fill-current' : ''}`} />
            Favorites
          </Button>

          <div className="flex gap-1 border rounded-md p-1">
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="h-8 w-8 p-0"
            >
              <Grid3x3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="h-8 w-8 p-0"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Sets Grid/List */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading sets...</p>
          </div>
        ) : filteredSets.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Plus className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {sets.length === 0 ? 'No sets yet' : 'No sets match your filters'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {sets.length === 0
                  ? 'Create your first word set to organize your vocabulary'
                  : 'Try adjusting your search or filters'}
              </p>
              {sets.length === 0 && (
                <Button onClick={() => setShowCreateModal(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Set
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div
            className={
              viewMode === 'grid'
                ? 'grid gap-6 md:grid-cols-2 lg:grid-cols-3'
                : 'space-y-4'
            }
          >
            {sortedSets.map((set) => (
              <SetCard
                key={set.id}
                set={set}
                onEdit={(set) => {
                  setEditingSet(set);
                  setShowCreateModal(true);
                }}
                onDelete={handleDeleteSet}
                onShare={handleShareSet}
                onCopy={handleCopySet}
                onToggleFavorite={toggleFavorite}
                onPractice={handlePracticeSet}
                onClick={handleSetClick}
              />
            ))}
          </div>
        )}

        {/* Set limit warning */}
        {sets.length >= 20 && (
          <Card className="border-amber-500 bg-amber-50 dark:bg-amber-950">
            <CardContent className="p-4">
              <p className="text-sm text-amber-900 dark:text-amber-100">
                You've reached the maximum of 20 sets. Consider deleting unused sets to create new
                ones.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modals */}
      <CreateSetModal
        open={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setEditingSet(null);
        }}
        onSave={editingSet ? handleEditSet : handleCreateSet}
        editingSet={editingSet}
        userLanguage={userLanguage}
      />

      {sharingSet && (
        <ShareSetModal
          open={!!sharingSet}
          onClose={() => setSharingSet(null)}
          set={sharingSet}
        />
      )}

      {showPublicLibrary && (
        <PublicLibraryModal
          open={showPublicLibrary}
          onClose={() => setShowPublicLibrary(false)}
          onCopySet={copySet}
          userLanguage={userLanguage}
        />
      )}
    </Layout>
  );
}
