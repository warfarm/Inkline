import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { ArticleReader } from '@/components/reading/ArticleReader';
import { ArticleFeedback } from '@/components/reading/ArticleFeedback';
import type { Article } from '@/types';

export default function ArticleView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFeedback, setShowFeedback] = useState(false);

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
    <div className="min-h-screen bg-[#fafafa]">
      <header className="sticky top-0 z-40 border-b bg-white/95 backdrop-blur shadow-sm">
        <div className="container mx-auto flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/home')} className="text-sm sm:text-base">
            ← Back
          </Button>
          <h1 className="text-sm sm:text-lg font-semibold text-[#1a1a1a] truncate max-w-[50%] sm:max-w-none">{article.title}</h1>
          <div className="w-12 sm:w-20"></div>
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
