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
import type { WordBankEntry } from '@/types';

export default function WordBank() {
  const { user, profile } = useAuth();
  const [words, setWords] = useState<WordBankEntry[]>([]);
  const [filter, setFilter] = useState<'all' | 'learning' | 'mastered'>('all');
  const [loading, setLoading] = useState(true);
  const [practiceMode, setPracticeMode] = useState(false);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [editingNotes, setEditingNotes] = useState<{ [key: string]: string }>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [speakingWords, setSpeakingWords] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (user) {
      fetchWords();
    }
  }, [user, filter]);

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

    return matchesFilter && matchesSearch;
  });

  const filteredWordsForPractice = filteredWords;

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
        <div className="flex items-center justify-between flex-wrap gap-2">
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

          <div className="flex gap-2">
            {filteredWords.length > 0 && (
              <>
                <Button onClick={handleExportToFlashcards} variant="outline">
                  Export to CSV
                </Button>
                <Button onClick={() => setPracticeMode(true)} variant="default">
                  Practice Flashcards
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
          {filteredWords.map((word) => {
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
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-2xl">{word.word}</CardTitle>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSpeak(word.word, word.id)}
                          disabled={speakingWords.has(word.id)}
                          className="h-8 w-8 p-0 text-lg transition-transform hover:scale-110"
                          title="Listen to pronunciation"
                        >
                          <span className="inline-block transition-transform hover:scale-125">
                            {speakingWords.has(word.id) ? '⏸' : '🔊'}
                          </span>
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
                      {word.status === 'mastered' ? '✓' : '○'}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Grammar Notes - Always visible for particles */}
                  {word.grammar_notes && (
                    <div className="rounded-md bg-blue-50 border border-blue-200 p-2 text-sm">
                      <div className="font-semibold text-blue-900 mb-1">Grammar:</div>
                      <div className="text-blue-800">{word.grammar_notes}</div>
                    </div>
                  )}

                  {/* Primary Definition */}
                  <div className="text-sm">
                    {word.formality_level && (
                      <span className="inline-block px-2 py-0.5 text-xs rounded bg-gray-100 text-gray-700 mr-2 mb-1">
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
                      {isExpanded ? '▲ Show Less' : `▼ Show More${word.example_sentence || word.usage_notes || (word.additional_definitions && word.additional_definitions.length > 1) ? ' (Examples, Notes & More)' : ' (Add Notes)'}`}
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
                        <div className="rounded-md bg-amber-50 border border-amber-200 p-2 text-sm">
                          <div className="font-semibold text-amber-900 mb-1">Usage:</div>
                          <div className="text-amber-800">{word.usage_notes}</div>
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
                          <div className="rounded-md bg-green-50 border border-green-200 p-2 text-sm">
                            <div className="text-green-800 whitespace-pre-wrap">{word.user_notes}</div>
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
