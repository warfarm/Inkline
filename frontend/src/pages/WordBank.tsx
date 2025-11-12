import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { FlashcardPractice } from '@/components/wordbank/FlashcardPractice';
import { toast } from 'sonner';
import { Volume2, Pause, Check, Circle, ChevronDown, ChevronUp, Download, Languages, Filter, RotateCcw } from 'lucide-react';
import type { WordBankEntry } from '@/types';

export default function WordBank() {
  const { user, profile } = useAuth();
  const [words, setWords] = useState<WordBankEntry[]>([]);
  const [filter, setFilter] = useState<'all' | 'learning' | 'mastered'>('all');
  const [languageFilter, setLanguageFilter] = useState<'all' | 'ja' | 'zh'>('all');
  const [loading, setLoading] = useState(true);
  const [practiceMode, setPracticeMode] = useState(false);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [editingNotes, setEditingNotes] = useState<{ [key: string]: string }>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [speakingWords, setSpeakingWords] = useState<Set<string>>(new Set());

  // Advanced filter states
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [dateFilter, setDateFilter] = useState<'all' | '7days' | '30days' | '3months'>('all');
  const [reviewFrequencyFilter, setReviewFrequencyFilter] = useState<'all' | 'never' | '1-5' | '5+'>('all');
  const [hasGrammarNotes, setHasGrammarNotes] = useState<boolean | null>(null);
  const [hasUsageNotes, setHasUsageNotes] = useState<boolean | null>(null);
  const [hasExampleSentence, setHasExampleSentence] = useState<boolean | null>(null);
  const [formalityFilter, setFormalityFilter] = useState<'all' | 'casual' | 'polite' | 'formal'>('all');
  const [cardLimit, setCardLimit] = useState<number | 'all'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'leastReviewed' | 'mostReviewed' | 'random'>('newest');

  useEffect(() => {
    if (user) {
      fetchWords();
    }
  }, [user, filter, languageFilter]);

  const fetchWords = async () => {
    if (!user) return;

    setLoading(true);
    try {
      let query = supabase
        .from('word_bank')
        .select('*')
        .eq('user_id', user.id)
        .order('first_seen_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      if (languageFilter !== 'all') {
        query = query.eq('language', languageFilter);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Parse JSON fields
      const parsedData = (data || []).map(word => ({
        ...word,
        additional_definitions: word.additional_definitions
          ? (typeof word.additional_definitions === 'string'
            ? JSON.parse(word.additional_definitions)
            : word.additional_definitions)
          : undefined
      }));

      setWords(parsedData);
    } catch (error) {
      console.error('Error fetching word bank:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleWordStatus = async (wordId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'learning' ? 'mastered' : 'learning';

    try {
      const { error } = await supabase
        .from('word_bank')
        .update({ status: newStatus })
        .eq('id', wordId);

      if (error) throw error;

      setWords((prev) =>
        prev.map((word) => (word.id === wordId ? { ...word, status: newStatus } : word))
      );
    } catch (error) {
      console.error('Error updating word status:', error);
    }
  };

  const handleMarkMastered = async (wordId: string) => {
    try {
      const { error } = await supabase
        .from('word_bank')
        .update({ status: 'mastered' })
        .eq('id', wordId);

      if (error) throw error;

      setWords((prev) =>
        prev.map((word) => (word.id === wordId ? { ...word, status: 'mastered' } : word))
      );
    } catch (error) {
      console.error('Error marking word as mastered:', error);
    }
  };

  const toggleCardExpansion = (wordId: string) => {
    setExpandedCards((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(wordId)) {
        newSet.delete(wordId);
      } else {
        newSet.add(wordId);
      }
      return newSet;
    });
  };

  const handleEditNotes = (wordId: string, currentNotes: string | undefined) => {
    setEditingNotes({ ...editingNotes, [wordId]: currentNotes || '' });
  };

  const handleSaveNotes = async (wordId: string) => {
    const newNotes = editingNotes[wordId];

    try {
      const { error } = await supabase
        .from('word_bank')
        .update({ user_notes: newNotes })
        .eq('id', wordId);

      if (error) throw error;

      setWords((prev) =>
        prev.map((word) => (word.id === wordId ? { ...word, user_notes: newNotes } : word))
      );

      const { [wordId]: _, ...rest } = editingNotes;
      setEditingNotes(rest);

      toast.success('Notes updated successfully');
    } catch (error) {
      console.error('Error updating notes:', error);
      toast.error('Failed to update notes');
    }
  };

  const handleCancelEditNotes = (wordId: string) => {
    const { [wordId]: _, ...rest } = editingNotes;
    setEditingNotes(rest);
  };

  const handleExportToFlashcards = () => {
    const csvContent = [
      ['Word', 'Reading', 'Definition', 'Example', 'User Notes', 'Grammar Notes', 'Usage Notes'].join(','),
      ...filteredWords.map(word => [
        `"${word.word}"`,
        `"${word.reading || ''}"`,
        `"${word.definition.replace(/"/g, '""')}"`,
        `"${(word.example_sentence || '').replace(/"/g, '""')}"`,
        `"${(word.user_notes || '').replace(/"/g, '""')}"`,
        `"${(word.grammar_notes || '').replace(/"/g, '""')}"`,
        `"${(word.usage_notes || '').replace(/"/g, '""')}"`,
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `word_bank_flashcards_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Flashcards exported successfully!');
  };

  const handleSpeak = (word: string, wordId: string) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }

      // Add a small delay to ensure cancel completes
      setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(word);

        // Use user's target language preference, with fallback to character detection
        let language = 'zh-CN'; // Default to Chinese
        if (profile?.target_language === 'ja') {
          language = 'ja-JP';
        } else if (profile?.target_language === 'zh') {
          language = 'zh-CN';
        } else {
          // Fallback: detect language from characters if no profile setting
          const hasHiragana = /[\u3040-\u309F]/.test(word);
          const hasKatakana = /[\u30A0-\u30FF]/.test(word);
          const isJapanese = hasHiragana || hasKatakana;
          language = isJapanese ? 'ja-JP' : 'zh-CN';
        }

        utterance.lang = language;
        utterance.rate = 0.8;

        utterance.onstart = () => {
          setSpeakingWords(new Set([wordId]));
        };

        utterance.onend = () => {
          setSpeakingWords(new Set());
        };

        utterance.onerror = (event) => {
          console.error('Speech synthesis error:', event);
          setSpeakingWords(new Set());
          // Only show error if it's not an "interrupted" error (which is expected when cancelling)
          if (event.error !== 'interrupted') {
            toast.error('Unable to play audio for this word');
          }
        };

        // Ensure voices are loaded before speaking
        if (window.speechSynthesis.getVoices().length === 0) {
          window.speechSynthesis.addEventListener('voiceschanged', () => {
            window.speechSynthesis.speak(utterance);
          }, { once: true });
        } else {
          window.speechSynthesis.speak(utterance);
        }
      }, 100);
    }
  };

  const filteredWords = words.filter((w) => {
    // Apply status filter
    const matchesFilter = filter === 'all' || w.status === filter;

    // Apply search query
    const matchesSearch = !searchQuery ||
      w.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.definition.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (w.reading && w.reading.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (w.user_notes && w.user_notes.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (w.grammar_notes && w.grammar_notes.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (w.usage_notes && w.usage_notes.toLowerCase().includes(searchQuery.toLowerCase()));

    // Apply date filter
    let matchesDate = true;
    if (dateFilter !== 'all') {
      const wordDate = new Date(w.first_seen_at);
      const now = new Date();
      const diffDays = Math.floor((now.getTime() - wordDate.getTime()) / (1000 * 60 * 60 * 24));

      if (dateFilter === '7days') matchesDate = diffDays <= 7;
      else if (dateFilter === '30days') matchesDate = diffDays <= 30;
      else if (dateFilter === '3months') matchesDate = diffDays <= 90;
    }

    // Apply review frequency filter
    let matchesReviewFrequency = true;
    if (reviewFrequencyFilter !== 'all') {
      const reviewCount = w.times_reviewed || 0;
      if (reviewFrequencyFilter === 'never') matchesReviewFrequency = reviewCount === 0;
      else if (reviewFrequencyFilter === '1-5') matchesReviewFrequency = reviewCount >= 1 && reviewCount <= 5;
      else if (reviewFrequencyFilter === '5+') matchesReviewFrequency = reviewCount > 5;
    }

    // Apply metadata filters
    const matchesGrammarNotes = hasGrammarNotes === null || (hasGrammarNotes ? !!w.grammar_notes : !w.grammar_notes);
    const matchesUsageNotes = hasUsageNotes === null || (hasUsageNotes ? !!w.usage_notes : !w.usage_notes);
    const matchesExampleSentence = hasExampleSentence === null || (hasExampleSentence ? !!w.example_sentence : !w.example_sentence);

    // Apply formality filter
    const matchesFormality = formalityFilter === 'all' || w.formality_level === formalityFilter;

    return matchesFilter && matchesSearch && matchesDate && matchesReviewFrequency &&
           matchesGrammarNotes && matchesUsageNotes && matchesExampleSentence && matchesFormality;
  });

  // Apply sorting
  let sortedWords = [...filteredWords];
  if (sortBy === 'newest') {
    sortedWords.sort((a, b) => new Date(b.first_seen_at).getTime() - new Date(a.first_seen_at).getTime());
  } else if (sortBy === 'oldest') {
    sortedWords.sort((a, b) => new Date(a.first_seen_at).getTime() - new Date(b.first_seen_at).getTime());
  } else if (sortBy === 'leastReviewed') {
    sortedWords.sort((a, b) => (a.times_reviewed || 0) - (b.times_reviewed || 0));
  } else if (sortBy === 'mostReviewed') {
    sortedWords.sort((a, b) => (b.times_reviewed || 0) - (a.times_reviewed || 0));
  } else if (sortBy === 'random') {
    sortedWords.sort(() => Math.random() - 0.5);
  }

  // Apply card limit
  const filteredWordsForPractice = cardLimit === 'all' ? sortedWords : sortedWords.slice(0, cardLimit);

  if (practiceMode && filteredWordsForPractice.length > 0) {
    return (
      <Layout>
        <FlashcardPractice
          words={filteredWordsForPractice}
          onExit={() => setPracticeMode(false)}
          onMarkMastered={handleMarkMastered}
          profile={profile}
        />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-6 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex flex-wrap gap-4">
            {/* Status Filter */}
            <div className="flex gap-2">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                onClick={() => setFilter('all')}
              >
                All ({words.length})
              </Button>
              <Button
                variant={filter === 'learning' ? 'default' : 'outline'}
                onClick={() => setFilter('learning')}
              >
                Learning
              </Button>
              <Button
                variant={filter === 'mastered' ? 'default' : 'outline'}
                onClick={() => setFilter('mastered')}
              >
                Mastered
              </Button>
            </div>

            {/* Language Filter */}
            <div className="flex gap-2 border-l pl-4">
              <Button
                variant={languageFilter === 'all' ? 'default' : 'outline'}
                onClick={() => setLanguageFilter('all')}
                size="sm"
              >
                <Languages className="mr-2 h-4 w-4" />
                All Languages
              </Button>
              <Button
                variant={languageFilter === 'ja' ? 'default' : 'outline'}
                onClick={() => setLanguageFilter('ja')}
                size="sm"
              >
                Japanese
              </Button>
              <Button
                variant={languageFilter === 'zh' ? 'default' : 'outline'}
                onClick={() => setLanguageFilter('zh')}
                size="sm"
              >
                Chinese
              </Button>
            </div>
          </div>

          <div className="flex gap-2">
            {filteredWords.length > 0 && (
              <>
                <Button onClick={handleExportToFlashcards} variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Export to CSV
                </Button>
                <Button onClick={() => setPracticeMode(true)} variant="default">
                  Practice Flashcards {cardLimit !== 'all' && filteredWordsForPractice.length < filteredWords.length ? `(${filteredWordsForPractice.length})` : ''}
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Search Input */}
        <div className="w-full">
          <Input
            type="text"
            placeholder="Search words, definitions, or notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md"
          />
          {searchQuery && (
            <p className="text-sm text-muted-foreground mt-2">
              Found {filteredWords.length} word{filteredWords.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* Advanced Filters Toggle */}
        <div className="w-full">
          <Button
            variant="outline"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="w-full md:w-auto"
          >
            {showAdvancedFilters ? <ChevronUp className="mr-2 h-4 w-4" /> : <ChevronDown className="mr-2 h-4 w-4" />}
            Advanced Filters
          </Button>
        </div>

        {/* Advanced Filters Section */}
        {showAdvancedFilters && (
          <Card className="w-full">
            <CardContent className="p-4 space-y-4">
              {/* Date Range Filter */}
              <div>
                <label className="text-sm font-semibold mb-2 block">Date Added</label>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant={dateFilter === 'all' ? 'default' : 'outline'}
                    onClick={() => setDateFilter('all')}
                  >
                    All Time
                  </Button>
                  <Button
                    size="sm"
                    variant={dateFilter === '7days' ? 'default' : 'outline'}
                    onClick={() => setDateFilter('7days')}
                  >
                    Last 7 Days
                  </Button>
                  <Button
                    size="sm"
                    variant={dateFilter === '30days' ? 'default' : 'outline'}
                    onClick={() => setDateFilter('30days')}
                  >
                    Last 30 Days
                  </Button>
                  <Button
                    size="sm"
                    variant={dateFilter === '3months' ? 'default' : 'outline'}
                    onClick={() => setDateFilter('3months')}
                  >
                    Last 3 Months
                  </Button>
                </div>
              </div>

              {/* Review Frequency Filter */}
              <div>
                <label className="text-sm font-semibold mb-2 block">Review Frequency</label>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant={reviewFrequencyFilter === 'all' ? 'default' : 'outline'}
                    onClick={() => setReviewFrequencyFilter('all')}
                  >
                    All
                  </Button>
                  <Button
                    size="sm"
                    variant={reviewFrequencyFilter === 'never' ? 'default' : 'outline'}
                    onClick={() => setReviewFrequencyFilter('never')}
                  >
                    Never Reviewed
                  </Button>
                  <Button
                    size="sm"
                    variant={reviewFrequencyFilter === '1-5' ? 'default' : 'outline'}
                    onClick={() => setReviewFrequencyFilter('1-5')}
                  >
                    1-5 Times
                  </Button>
                  <Button
                    size="sm"
                    variant={reviewFrequencyFilter === '5+' ? 'default' : 'outline'}
                    onClick={() => setReviewFrequencyFilter('5+')}
                  >
                    5+ Times
                  </Button>
                </div>
              </div>

              {/* Word Content Filters */}
              <div>
                <label className="text-sm font-semibold mb-2 block">Word Content</label>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant={hasGrammarNotes === true ? 'default' : hasGrammarNotes === false ? 'secondary' : 'outline'}
                    onClick={() => setHasGrammarNotes(hasGrammarNotes === null ? true : hasGrammarNotes === true ? false : null)}
                  >
                    {hasGrammarNotes === true ? '✓ Has Grammar Notes' : hasGrammarNotes === false ? '✗ No Grammar Notes' : 'Grammar Notes'}
                  </Button>
                  <Button
                    size="sm"
                    variant={hasUsageNotes === true ? 'default' : hasUsageNotes === false ? 'secondary' : 'outline'}
                    onClick={() => setHasUsageNotes(hasUsageNotes === null ? true : hasUsageNotes === true ? false : null)}
                  >
                    {hasUsageNotes === true ? '✓ Has Usage Notes' : hasUsageNotes === false ? '✗ No Usage Notes' : 'Usage Notes'}
                  </Button>
                  <Button
                    size="sm"
                    variant={hasExampleSentence === true ? 'default' : hasExampleSentence === false ? 'secondary' : 'outline'}
                    onClick={() => setHasExampleSentence(hasExampleSentence === null ? true : hasExampleSentence === true ? false : null)}
                  >
                    {hasExampleSentence === true ? '✓ Has Examples' : hasExampleSentence === false ? '✗ No Examples' : 'Examples'}
                  </Button>
                </div>
              </div>

              {/* Formality Level Filter */}
              <div>
                <label className="text-sm font-semibold mb-2 block">Formality Level</label>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant={formalityFilter === 'all' ? 'default' : 'outline'}
                    onClick={() => setFormalityFilter('all')}
                  >
                    All
                  </Button>
                  <Button
                    size="sm"
                    variant={formalityFilter === 'casual' ? 'default' : 'outline'}
                    onClick={() => setFormalityFilter('casual')}
                  >
                    Casual
                  </Button>
                  <Button
                    size="sm"
                    variant={formalityFilter === 'polite' ? 'default' : 'outline'}
                    onClick={() => setFormalityFilter('polite')}
                  >
                    Polite
                  </Button>
                  <Button
                    size="sm"
                    variant={formalityFilter === 'formal' ? 'default' : 'outline'}
                    onClick={() => setFormalityFilter('formal')}
                  >
                    Formal
                  </Button>
                </div>
              </div>

              {/* Sort Options */}
              <div>
                <label className="text-sm font-semibold mb-2 block">Sort By</label>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant={sortBy === 'newest' ? 'default' : 'outline'}
                    onClick={() => setSortBy('newest')}
                  >
                    Newest First
                  </Button>
                  <Button
                    size="sm"
                    variant={sortBy === 'oldest' ? 'default' : 'outline'}
                    onClick={() => setSortBy('oldest')}
                  >
                    Oldest First
                  </Button>
                  <Button
                    size="sm"
                    variant={sortBy === 'leastReviewed' ? 'default' : 'outline'}
                    onClick={() => setSortBy('leastReviewed')}
                  >
                    Least Reviewed
                  </Button>
                  <Button
                    size="sm"
                    variant={sortBy === 'mostReviewed' ? 'default' : 'outline'}
                    onClick={() => setSortBy('mostReviewed')}
                  >
                    Most Reviewed
                  </Button>
                  <Button
                    size="sm"
                    variant={sortBy === 'random' ? 'default' : 'outline'}
                    onClick={() => setSortBy('random')}
                  >
                    Random
                  </Button>
                </div>
              </div>

              {/* Card Limit */}
              <div>
                <label className="text-sm font-semibold mb-2 block">Practice Session Limit</label>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant={cardLimit === 10 ? 'default' : 'outline'}
                    onClick={() => setCardLimit(10)}
                  >
                    10 Cards
                  </Button>
                  <Button
                    size="sm"
                    variant={cardLimit === 20 ? 'default' : 'outline'}
                    onClick={() => setCardLimit(20)}
                  >
                    20 Cards
                  </Button>
                  <Button
                    size="sm"
                    variant={cardLimit === 50 ? 'default' : 'outline'}
                    onClick={() => setCardLimit(50)}
                  >
                    50 Cards
                  </Button>
                  <Button
                    size="sm"
                    variant={cardLimit === 'all' ? 'default' : 'outline'}
                    onClick={() => setCardLimit('all')}
                  >
                    All ({filteredWords.length})
                  </Button>
                </div>
              </div>

              {/* Reset All Filters */}
              <div className="pt-2 border-t">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setDateFilter('all');
                    setReviewFrequencyFilter('all');
                    setHasGrammarNotes(null);
                    setHasUsageNotes(null);
                    setHasExampleSentence(null);
                    setFormalityFilter('all');
                    setCardLimit('all');
                    setSortBy('newest');
                  }}
                  className="w-full"
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Reset Advanced Filters
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading words...</p>
      ) : words.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">
              No words in your word bank yet. Start reading articles and save words!
            </p>
          </CardContent>
        </Card>
      ) : filteredWords.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">
              No words match your search. Try a different query.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sortedWords.map((word) => {
            const isExpanded = expandedCards.has(word.id);
            const hasExpandableContent = word.example_sentence ||
              word.usage_notes ||
              (word.additional_definitions && word.additional_definitions.length > 1) ||
              true; // Always allow expanding to add user notes

            return (
              <Card key={word.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <CardTitle className="text-2xl">{word.word}</CardTitle>
                        <span className="text-xs px-2 py-0.5 rounded bg-muted border border-border">
                          {word.language === 'ja' ? 'JP' : 'ZH'}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSpeak(word.word, word.id)}
                          disabled={speakingWords.has(word.id)}
                          className="h-8 w-8 p-0 transition-transform hover:scale-110"
                          title="Listen to pronunciation"
                        >
                          {speakingWords.has(word.id) ? (
                            <Pause className="h-4 w-4" />
                          ) : (
                            <Volume2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      {word.reading && (
                        <CardDescription className="mt-1">{word.reading}</CardDescription>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant={word.status === 'mastered' ? 'default' : 'outline'}
                      onClick={() => toggleWordStatus(word.id, word.status)}
                    >
                      {word.status === 'mastered' ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Circle className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Grammar Notes - Always visible for particles */}
                  {word.grammar_notes && (
                    <div className="rounded-md bg-accent/50 border border-accent-foreground/20 p-2 text-sm">
                      <div className="font-semibold text-accent-foreground mb-1">Grammar:</div>
                      <div className="text-accent-foreground/90">{word.grammar_notes}</div>
                    </div>
                  )}

                  {/* Primary Definition */}
                  <div className="text-sm">
                    {word.formality_level && (
                      <span className="inline-block px-2 py-0.5 text-xs rounded bg-muted text-muted-foreground border border-border mr-2 mb-1">
                        {word.formality_level}
                      </span>
                    )}
                    {word.definition}
                  </div>

                  {/* Show More Button */}
                  {hasExpandableContent && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleCardExpansion(word.id)}
                      className="w-full text-xs"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="mr-2 h-3 w-3" />
                          Show Less
                        </>
                      ) : (
                        <>
                          <ChevronDown className="mr-2 h-3 w-3" />
                          Show More{word.example_sentence || word.usage_notes || (word.additional_definitions && word.additional_definitions.length > 1) ? ' (Examples, Notes & More)' : ' (Add Notes)'}
                        </>
                      )}
                    </Button>
                  )}

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="space-y-3 pt-2 border-t">
                      {/* Additional Definitions */}
                      {word.additional_definitions && word.additional_definitions.length > 1 && (
                        <div>
                          <div className="font-semibold text-xs text-muted-foreground mb-2">
                            Additional Meanings:
                          </div>
                          <div className="space-y-2">
                            {word.additional_definitions.slice(1).map((def, idx) => (
                              <div key={idx} className="text-sm">
                                {def.partOfSpeech && (
                                  <span className="text-xs text-muted-foreground italic">
                                    ({def.partOfSpeech}){' '}
                                  </span>
                                )}
                                {def.meaning}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Usage Notes */}
                      {word.usage_notes && (
                        <div className="rounded-md bg-secondary/70 border border-border p-2 text-sm">
                          <div className="font-semibold text-secondary-foreground mb-1">Usage:</div>
                          <div className="text-secondary-foreground/90">{word.usage_notes}</div>
                        </div>
                      )}

                      {/* Example Sentence */}
                      {word.example_sentence && (
                        <div>
                          <div className="font-semibold text-xs text-muted-foreground mb-1">
                            Example:
                          </div>
                          <div className="rounded-md bg-muted p-2 text-sm">
                            {word.example_sentence}
                          </div>
                        </div>
                      )}

                      {/* User Notes */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <div className="font-semibold text-xs text-muted-foreground">
                            Personal Notes:
                          </div>
                          {!editingNotes[word.id] && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditNotes(word.id, word.user_notes)}
                              className="h-6 px-2 text-xs"
                            >
                              {word.user_notes ? 'Edit' : 'Add'}
                            </Button>
                          )}
                        </div>
                        {editingNotes[word.id] !== undefined ? (
                          <div className="space-y-2">
                            <Textarea
                              value={editingNotes[word.id]}
                              onChange={(e) => setEditingNotes({ ...editingNotes, [word.id]: e.target.value })}
                              placeholder="Add your personal notes, mnemonics, or examples..."
                              className="text-sm min-h-[80px]"
                            />
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleSaveNotes(word.id)}
                                className="flex-1"
                              >
                                Save
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleCancelEditNotes(word.id)}
                                className="flex-1"
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : word.user_notes ? (
                          <div className="rounded-md bg-muted/70 border border-muted-foreground/20 p-2 text-sm">
                            <div className="text-foreground whitespace-pre-wrap">{word.user_notes}</div>
                          </div>
                        ) : (
                          <div className="text-xs text-muted-foreground italic">
                            No notes yet. Click "Add" to create notes.
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Metadata */}
                  <div className="text-xs text-muted-foreground pt-2 border-t">
                    Added {new Date(word.first_seen_at).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </Layout>
  );
}
