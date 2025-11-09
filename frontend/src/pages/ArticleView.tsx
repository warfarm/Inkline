import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useWordBankPanelPosition } from '@/hooks/useWordBankPanelPosition';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArticleReader } from '@/components/reading/ArticleReader';
import { ArticleFeedback } from '@/components/reading/ArticleFeedback';
import type { Article, WordBankEntry } from '@/types';

export default function ArticleView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { position: panelPosition } = useWordBankPanelPosition();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFeedback, setShowFeedback] = useState(false);
  const [words, setWords] = useState<WordBankEntry[]>([]);
  const [wordsLoading, setWordsLoading] = useState(false);
  const [showWordBank, setShowWordBank] = useState(false);

  useEffect(() => {
    if (id) {
      fetchArticle(id);
    }
  }, [id]);

  const fetchArticle = async (articleId: string) => {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('id', articleId)
        .single();

      if (error) throw error;
      setArticle(data);
    } catch (error) {
      console.error('Error fetching article:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleArticleComplete = () => {
    setShowFeedback(true);
  };

  const fetchWords = async () => {
    if (!user) return;

    setWordsLoading(true);
    try {
      const { data, error } = await supabase
        .from('word_bank')
        .select('*')
        .eq('user_id', user.id)
        .order('first_seen_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setWords(data || []);
    } catch (error) {
      console.error('Error fetching word bank:', error);
    } finally {
      setWordsLoading(false);
    }
  };

  useEffect(() => {
    if (showWordBank && user) {
      fetchWords();
    }
  }, [showWordBank, user]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading article...</p>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="mb-4">Article not found</p>
          <Button onClick={() => navigate('/home')}>Back to Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] relative">
      {/* Word Bank Side Panel */}
      {showWordBank && (
        <div
          className={`fixed top-0 ${panelPosition === 'right' ? 'right-0 border-l' : 'left-0 border-r'} h-full w-80 bg-white shadow-xl overflow-y-auto z-50 transition-transform duration-300`}
        >
          <div className="p-4 border-b sticky top-0 bg-white z-10">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-semibold text-lg">My Word Bank</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowWordBank(false)}>
                ✕
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">Latest 50 saved words</p>
          </div>

          <div className="p-4 space-y-3">
            {wordsLoading ? (
              <p className="text-muted-foreground text-center py-8">Loading words...</p>
            ) : words.length === 0 ? (
              <p className="text-muted-foreground text-center py-8 text-sm">
                No words saved yet. Hover over words in the article to save them!
              </p>
            ) : (
              <>
                {words.map((word) => (
                  <Card key={word.id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{word.word}</CardTitle>
                          {word.reading && (
                            <CardDescription className="text-xs mt-1">{word.reading}</CardDescription>
                          )}
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          word.status === 'mastered' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {word.status}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="text-xs">{word.definition}</div>
                      {word.example_sentence && (
                        <div className="mt-2 rounded-md bg-muted p-2 text-xs">
                          {word.example_sentence}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </>
            )}
          </div>

          <div className="p-4 border-t sticky bottom-0 bg-white">
            <Button variant="outline" onClick={() => navigate('/word-bank')} className="w-full text-sm">
              View Full Word Bank
            </Button>
          </div>
        </div>
      )}

      <header className="sticky top-0 z-40 border-b bg-white/95 backdrop-blur shadow-sm">
        <div className="container mx-auto flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/home')} className="text-sm sm:text-base">
            ← Back
          </Button>
          <h1 className="text-sm sm:text-lg font-semibold text-[#1a1a1a] truncate max-w-[50%] sm:max-w-none">{article.title}</h1>
          <Button
            variant="outline"
            size="sm"
            className="text-sm"
            onClick={() => setShowWordBank(!showWordBank)}
          >
            {showWordBank ? 'Close' : 'Word Bank'}
          </Button>
        </div>
      </header>

      <main className="container mx-auto max-w-4xl px-4 sm:px-6 py-6 sm:py-8 pb-28 sm:pb-32 space-y-6 sm:space-y-8">
        <ArticleReader article={article} onComplete={handleArticleComplete} />

        {showFeedback && user && (
          <ArticleFeedback
            articleId={article.id}
            userId={user.id}
            topic={article.topic}
          />
        )}
      </main>
    </div>
  );
}
