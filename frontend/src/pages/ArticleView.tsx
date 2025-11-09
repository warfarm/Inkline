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
  const [expandedPanelCards, setExpandedPanelCards] = useState<Set<string>>(new Set());

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
      setWordsLoading(false);
    }
  };

  useEffect(() => {
    if (showWordBank && user) {
      fetchWords();
    }
  }, [showWordBank, user]);

  const togglePanelCardExpansion = (wordId: string) => {
    setExpandedPanelCards((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(wordId)) {
        newSet.delete(wordId);
      } else {
        newSet.add(wordId);
      }
      return newSet;
    });
  };

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
    <div className="min-h-screen bg-background relative">
      {/* Word Bank Side Panel */}
      {showWordBank && (
        <div
          className={`fixed top-0 ${panelPosition === 'right' ? 'right-0 border-l' : 'left-0 border-r'} h-full w-80 bg-card/100 shadow-xl overflow-y-auto z-[60] transition-transform duration-300`}
        >
          <div className="p-4 border-b sticky top-0 bg-card/100 z-[70]">
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
                {words.map((word) => {
                  const isExpanded = expandedPanelCards.has(word.id);
                  const hasExpandableContent = word.example_sentence || word.user_notes || word.grammar_notes ||
                    word.usage_notes || (word.additional_definitions && word.additional_definitions.length > 1);

                  return (
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
                      <CardContent className="pt-0 space-y-2">
                        {/* Grammar Notes */}
                        {word.grammar_notes && (
                          <div className="rounded-md bg-blue-50 border border-blue-200 p-2 text-xs">
                            <div className="font-semibold text-blue-900 mb-1">Grammar:</div>
                            <div className="text-blue-800">{word.grammar_notes}</div>
                          </div>
                        )}

                        {/* Primary Definition */}
                        <div className="text-xs">
                          {word.formality_level && (
                            <span className="inline-block px-1.5 py-0.5 text-xs rounded bg-muted text-muted-foreground mr-1 mb-1">
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
                            onClick={() => togglePanelCardExpansion(word.id)}
                            className="w-full text-xs h-7"
                          >
                            {isExpanded ? '▲ Show Less' : '▼ Show More'}
                          </Button>
                        )}

                        {/* Expanded Content */}
                        {isExpanded && (
                          <div className="space-y-2 pt-2 border-t">
                            {/* Additional Definitions */}
                            {word.additional_definitions && word.additional_definitions.length > 1 && (
                              <div>
                                <div className="font-semibold text-xs text-muted-foreground mb-1">
                                  Additional Meanings:
                                </div>
                                <div className="space-y-1">
                                  {word.additional_definitions.slice(1).map((def, idx) => (
                                    <div key={idx} className="text-xs">
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
                              <div className="rounded-md bg-amber-50 border border-amber-200 p-2 text-xs">
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
                                <div className="rounded-md bg-muted p-2 text-xs">
                                  {word.example_sentence}
                                </div>
                              </div>
                            )}

                            {/* User Notes */}
                            {word.user_notes && (
                              <div>
                                <div className="font-semibold text-xs text-muted-foreground mb-1">
                                  Personal Notes:
                                </div>
                                <div className="rounded-md bg-green-50 border border-green-200 p-2 text-xs">
                                  <div className="text-green-800 whitespace-pre-wrap">{word.user_notes}</div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </>
            )}
          </div>

          <div className="p-4 border-t sticky bottom-0 bg-card">
            <Button variant="outline" onClick={() => navigate('/word-bank')} className="w-full text-sm">
              View Full Word Bank
            </Button>
          </div>
        </div>
      )}

      <header className="sticky top-0 z-40 border-b bg-background shadow-sm">
        <div className="container mx-auto flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/home')} className="text-sm sm:text-base">
            ← Back
          </Button>
          <h1 className="text-sm sm:text-lg font-semibold text-foreground truncate max-w-[50%] sm:max-w-none">{article.title}</h1>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-9 w-9 p-0"
              onClick={() => navigate('/settings')}
              title="Settings"
            >
              ⚙️
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-sm"
              onClick={() => setShowWordBank(!showWordBank)}
            >
              {showWordBank ? 'Close' : 'Word Bank'}
            </Button>
          </div>
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
