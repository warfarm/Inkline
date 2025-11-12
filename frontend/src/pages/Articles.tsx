import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Library, Loader2 } from 'lucide-react';
import type { Article } from '@/types';

export default function Articles() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      fetchArticles();
    }
  }, [profile]);

  const fetchArticles = async () => {
    if (!profile) return;

    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('language', profile.target_language)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setArticles(data || []);
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleArticleClick = (articleId: string) => {
    navigate(`/article/${articleId}`);
  };

  const formatLevel = (level: string): string => {
    return level.charAt(0).toUpperCase() + level.slice(1);
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
      <div className="mb-8">
        <h2 className="text-3xl font-bold flex items-center gap-2">
          <Library className="h-8 w-8" />
          All Articles
        </h2>
        <p className="mt-2 text-muted-foreground">
          Browse all {profile.target_language === 'zh' ? 'Chinese' : 'Japanese'} articles
        </p>
      </div>

      <section>
        {loading ? (
          <p className="text-muted-foreground flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading articles...
          </p>
        ) : articles.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">
                No articles available yet. Check back soon!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <Card
                key={article.id}
                className="cursor-pointer transition-colors hover:border-primary"
                onClick={() => handleArticleClick(article.id)}
              >
                <CardHeader>
                  <CardTitle className="line-clamp-2">{article.title}</CardTitle>
                  <CardDescription>
                    {article.topic} • {formatLevel(article.difficulty_level)} • {article.word_count} words
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
    </Layout>
  );
}
