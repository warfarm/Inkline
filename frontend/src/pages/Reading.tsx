import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { Loader2, Settings, Sparkles } from 'lucide-react';
import type { GeneratedArticle, ArticleLength } from '@/types';
import { lookupChinese } from '@/lib/dictionaries/chinese';
import { lookupJapanese } from '@/lib/dictionaries/jisho';

export default function Reading() {
  const navigate = useNavigate();
  const { profile } = useAuth();

  // Form state
  const [topic, setTopic] = useState('');
  const [length, setLength] = useState<ArticleLength>('medium');
  const [isTestArticle, setIsTestArticle] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);

  // Articles state
  const [previousArticles, setPreviousArticles] = useState<GeneratedArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [remainingGenerations, setRemainingGenerations] = useState(5);

  // Generation state
  const [currentArticle, setCurrentArticle] = useState<GeneratedArticle | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typedContent, setTypedContent] = useState('');
  const [isPreloadingDefinitions, setIsPreloadingDefinitions] = useState(false);
  const [preloadProgress, setPreloadProgress] = useState(0);
  const [preloadTotal, setPreloadTotal] = useState(0);

  useEffect(() => {
    if (profile) {
      fetchPreviousArticles();
      fetchRemainingGenerations();
    }
  }, [profile]);

  const fetchPreviousArticles = async () => {
    if (!profile) return;

    try {
      const { data, error } = await supabase
        .from('generated_articles')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setPreviousArticles(data || []);
    } catch (error) {
      console.error('Error fetching previous articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRemainingGenerations = async () => {
    if (!profile) return;

    try {
      const { data, error } = await supabase
        .rpc('get_remaining_generations', { p_user_id: profile.id });

      if (error) throw error;
      setRemainingGenerations(data || 0);
    } catch (error) {
      console.error('Error fetching remaining generations:', error);
    }
  };

  const handleGenerate = async () => {
    if (!profile || !topic.trim()) {
      toast.error('Please enter a topic');
      return;
    }

    if (remainingGenerations <= 0) {
      toast.error('Daily generation limit reached (5/5). Try again tomorrow!');
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(0);

    try {
      // Fetch user's word bank (learning words only)
      setGenerationProgress(10);
      const { data: wordBankData, error: wordBankError } = await supabase
        .from('word_bank')
        .select('word')
        .eq('user_id', profile.id)
        .eq('language', profile.target_language)
        .eq('status', 'learning')
        .limit(50);

      if (wordBankError) throw wordBankError;

      const wordBankWords = wordBankData?.map((w: { word: string }) => w.word) || [];

      // Call Edge Function to generate article
      setGenerationProgress(30);
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      console.log('Session check:', {
        hasSession: !!session,
        hasToken: !!session?.access_token,
        error: sessionError
      });

      if (!session || !session.access_token) {
        throw new Error('No valid session. Please sign out and sign back in.');
      }

      const authToken = session.access_token;
      console.log('Token preview:', authToken.substring(0, 20) + '...');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-article`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            topic: topic.trim(),
            length,
            isTestArticle,
            language: profile.target_language,
            difficultyLevel: profile.current_level,
            wordBankWords: wordBankWords.slice(0, 12), // Send up to 12 words
          }),
        }
      );

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('Error response:', errorText);

        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          throw new Error(`Server error: ${errorText}`);
        }

        const errorMessage = errorData.details
          ? `${errorData.error}: ${errorData.details}`
          : errorData.error || 'Failed to generate article';

        throw new Error(errorMessage);
      }

      setGenerationProgress(60);
      const generatedData = await response.json();

      // Use backend-segmented content (with readings already included!)
      setGenerationProgress(70);
      const segmentedContent = generatedData.segmentedContent || { words: [] };

      console.log('Using backend segmentation:', segmentedContent.words?.length, 'words');

      // Save to database
      setGenerationProgress(80);
      const { data: savedArticle, error: saveError } = await supabase
        .from('generated_articles')
        .insert({
          user_id: profile.id,
          language: profile.target_language,
          difficulty_level: profile.current_level,
          topic: generatedData.topic,
          title: generatedData.title,
          content: generatedData.content,
          segmented_content: segmentedContent,
          word_count: generatedData.wordCount,
          generation_prompt: generatedData.generationPrompt,
          word_bank_words_used: generatedData.wordBankWordsUsed,
          is_test_article: generatedData.isTestArticle,
          article_length: generatedData.articleLength,
          target_words: [],
          grammar_points: [],
        })
        .select()
        .single();

      if (saveError) throw saveError;

      setGenerationProgress(90);

      // Increment generation count now that article is saved
      const today = new Date().toISOString().split('T')[0];

      // First, check if a record exists for today
      const { data: existingLimit } = await supabase
        .from('generation_limits')
        .select('count')
        .eq('user_id', profile.id)
        .eq('generation_date', today)
        .maybeSingle();

      if (existingLimit) {
        // Update existing record
        await supabase
          .from('generation_limits')
          .update({
            count: existingLimit.count + 1,
            last_generated_at: new Date().toISOString(),
          })
          .eq('user_id', profile.id)
          .eq('generation_date', today);
      } else {
        // Insert new record
        await supabase
          .from('generation_limits')
          .insert({
            user_id: profile.id,
            generation_date: today,
            count: 1,
            last_generated_at: new Date().toISOString(),
          });
      }

      // Update remaining generations display
      await fetchRemainingGenerations();

      // Start typewriter effect
      setCurrentArticle(savedArticle);
      setIsGenerating(false);
      startTypewriterEffect(savedArticle);

      // Preload definitions in background
      preloadDefinitions(savedArticle);

      toast.success('Article generated successfully!');

      // Refresh previous articles list
      fetchPreviousArticles();

    } catch (error: any) {
      console.error('Error generating article:', error);
      toast.error(error.message || 'Failed to generate article');
      setIsGenerating(false);
      setGenerationProgress(0);
    }
  };

  const startTypewriterEffect = (article: GeneratedArticle) => {
    setIsTyping(true);
    setTypedContent('');

    const content = article.content;
    let index = 0;
    const speed = 20; // milliseconds per character

    const typeNextChar = () => {
      if (index < content.length) {
        setTypedContent(content.substring(0, index + 1));
        index++;
        setTimeout(typeNextChar, speed);
      } else {
        setIsTyping(false);
      }
    };

    typeNextChar();
  };

  const preloadDefinitions = async (article: GeneratedArticle) => {
    setIsPreloadingDefinitions(true);

    try {
      // Safely handle segmented_content structure
      const words = article.segmented_content?.words?.map?.(w => w.text) || [];
      const uniqueWords = [...new Set(words)];

      setPreloadTotal(uniqueWords.length);
      setPreloadProgress(0);

      const definitions: Record<string, any> = {};

      for (let i = 0; i < uniqueWords.length; i++) {
        const word = uniqueWords[i];
        try {
          let result;
          if (article.language === 'zh') {
            result = await lookupChinese(word);
          } else {
            result = await lookupJapanese(word);
          }

          if (result) {
            definitions[word] = {
              reading: result.reading,
              definition: result.definition,
              grammarNotes: result.grammarNotes,
              formalityLevel: result.formalityLevel,
              usageNotes: result.usageNotes,
              definitions: result.definitions,
              examples: result.examples,
              componentCharacters: result.componentCharacters,
            };
          }

          // Update progress
          setPreloadProgress(i + 1);

          // Small delay to avoid overwhelming APIs
          await new Promise(resolve => setTimeout(resolve, 300));
        } catch (error) {
          console.error(`Error looking up word ${word}:`, error);
        }
      }

      // Update article with preloaded definitions
      const { error } = await supabase
        .from('generated_articles')
        .update({ word_definitions: definitions })
        .eq('id', article.id);

      if (error) throw error;

      // Update current article state
      setCurrentArticle(prev => prev ? { ...prev, word_definitions: definitions } : null);

      toast.success('Definitions preloaded!');
    } catch (error) {
      console.error('Error preloading definitions:', error);
    } finally {
      setIsPreloadingDefinitions(false);
    }
  };

  const handleArticleClick = (articleId: string) => {
    navigate(`/article/${articleId}?source=generated`);
  };

  const formatLevel = (level: string): string => {
    return level.charAt(0).toUpperCase() + level.slice(1);
  };

  const getLengthDescription = (length: ArticleLength): string => {
    const ranges = {
      short: '150-200 words',
      medium: '300-400 words',
      long: '500-700 words',
    };
    return ranges[length];
  };

  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <Layout>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Generate Article</h2>
          <p className="mt-2 text-muted-foreground">
            Create custom articles for your learning level
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => navigate('/settings')}
          className="gap-2"
        >
          <Settings className="h-4 w-4" />
          Settings
        </Button>
      </div>

      {/* Generation Form */}
      {!currentArticle && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Generate New Article
            </CardTitle>
            <CardDescription>
              Generations remaining today: {remainingGenerations}/5
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Topic Input */}
            <div className="space-y-2">
              <Label htmlFor="topic">Topic</Label>
              <Input
                id="topic"
                placeholder="E.g., Technology, Daily Life, Food, Travel..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                disabled={isGenerating}
              />
            </div>

            {/* Length Options */}
            <div className="space-y-2">
              <Label>Article Length</Label>
              <div className="grid grid-cols-3 gap-3">
                {(['short', 'medium', 'long'] as ArticleLength[]).map((len) => (
                  <button
                    key={len}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setLength(len);
                    }}
                    disabled={isGenerating}
                    className={`rounded-lg p-4 text-center transition-all relative z-10 ${
                      isGenerating ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:shadow-md'
                    }`}
                    style={{
                      borderWidth: '2px',
                      borderStyle: 'solid',
                      borderColor: length === len ? 'hsl(var(--primary))' : 'hsl(var(--border))',
                      backgroundColor: length === len ? 'hsl(var(--primary) / 0.1)' : 'transparent',
                    }}
                  >
                    <div className="font-semibold capitalize pointer-events-none">{len}</div>
                    <div className="text-sm text-muted-foreground pointer-events-none">
                      {getLengthDescription(len)}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Test Article Toggle */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="testArticle"
                checked={isTestArticle}
                onChange={(e) => setIsTestArticle(e.target.checked)}
                disabled={isGenerating}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="testArticle" className="cursor-pointer">
                Test Article (Follow {profile.target_language === 'zh' ? 'HSK' : 'JLPT'} levels strictly)
              </Label>
            </div>

            {/* Generate Button */}
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !topic.trim() || remainingGenerations <= 0}
              className="w-full"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate Article'
              )}
            </Button>

            {/* Progress Bar */}
            {isGenerating && (
              <div className="space-y-2">
                <Progress value={generationProgress} />
                <p className="text-center text-sm text-muted-foreground">
                  {generationProgress < 30 && 'Preparing...'}
                  {generationProgress >= 30 && generationProgress < 60 && 'Generating content...'}
                  {generationProgress >= 60 && generationProgress < 80 && 'Processing article...'}
                  {generationProgress >= 80 && 'Saving...'}
                </p>
              </div>
            )}

            {/* Definition Preloading Progress */}
            {isPreloadingDefinitions && (
              <div className="space-y-2 mt-4">
                <Progress value={(preloadProgress / preloadTotal) * 100} />
                <p className="text-center text-sm text-muted-foreground">
                  Preloading definitions... {preloadProgress} / {preloadTotal}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Typewriter Display */}
      {currentArticle && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{currentArticle.title}</CardTitle>
            <CardDescription>
              {currentArticle.topic} • {formatLevel(currentArticle.difficulty_level)} •{' '}
              {currentArticle.word_count} words
              {isTestArticle && ' • Test Article'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <p className="whitespace-pre-wrap leading-relaxed">{typedContent}</p>
              {isTyping && <span className="animate-pulse">▊</span>}
            </div>

            {isPreloadingDefinitions && (
              <div className="mt-4 text-sm text-muted-foreground">
                <Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
                Preloading definitions...
              </div>
            )}

            {!isTyping && !isPreloadingDefinitions && (
              <div className="mt-6 flex gap-4">
                <Button onClick={() => handleArticleClick(currentArticle.id)} size="lg">
                  Read Article
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setCurrentArticle(null)}
                >
                  Generate Another
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Previously Generated Articles */}
      {!currentArticle && (
        <section>
          <h3 className="mb-4 text-xl font-semibold">Previously Generated Articles</h3>
          {loading ? (
            <p className="text-muted-foreground">Loading articles...</p>
          ) : previousArticles.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">
                  No generated articles yet. Create your first one above!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {previousArticles.map((article) => (
                <Card
                  key={article.id}
                  className="cursor-pointer transition-colors hover:border-primary"
                  onClick={() => handleArticleClick(article.id)}
                >
                  <CardHeader>
                    <CardTitle className="line-clamp-2">{article.title}</CardTitle>
                    <CardDescription>
                      {article.topic} • {formatLevel(article.difficulty_level)} •{' '}
                      {article.word_count} words
                      {article.is_test_article && ' • Test'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="line-clamp-3 text-sm text-muted-foreground">
                      {article.content.substring(0, 150)}...
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      )}
    </Layout>
  );
}
