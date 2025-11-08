import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FlashcardPractice } from '@/components/wordbank/FlashcardPractice';
import type { WordBankEntry } from '@/types';

export default function WordBank() {
  const { user } = useAuth();
  const [words, setWords] = useState<WordBankEntry[]>([]);
  const [filter, setFilter] = useState<'all' | 'learning' | 'mastered'>('all');
  const [loading, setLoading] = useState(true);
  const [practiceMode, setPracticeMode] = useState(false);

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
      setWords(data || []);
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

  const filteredWordsForPractice = words.filter((w) => {
    if (filter === 'all') return true;
    return w.status === filter;
  });

  if (practiceMode && filteredWordsForPractice.length > 0) {
    return (
      <Layout>
        <FlashcardPractice
          words={filteredWordsForPractice}
          onExit={() => setPracticeMode(false)}
          onMarkMastered={handleMarkMastered}
        />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-6 flex items-center justify-between">
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

        {words.length > 0 && (
          <Button onClick={() => setPracticeMode(true)} variant="default">
            Practice Flashcards
          </Button>
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
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {words.map((word) => (
            <Card key={word.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-2xl">{word.word}</CardTitle>
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
                <div className="text-sm">{word.definition}</div>
                {word.example_sentence && (
                  <div className="rounded-md bg-muted p-2 text-sm">
                    {word.example_sentence}
                  </div>
                )}
                <div className="text-xs text-muted-foreground">
                  Added {new Date(word.first_seen_at).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </Layout>
  );
}
