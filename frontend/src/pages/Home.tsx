import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, Lightbulb, BookOpen } from 'lucide-react';
import type { Article } from '@/types';

export default function Home() {
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
        .eq('difficulty_level', profile.current_level)
        .order('created_at', { ascending: false })
        .limit(20);

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
          <GraduationCap className="h-8 w-8" />
          Welcome, {profile.display_name}
        </h2>
        <p className="mt-2 text-muted-foreground">
          {profile.target_language === 'zh' ? 'Chinese' : 'Japanese'} •{' '}
          {profile.current_level?.charAt(0).toUpperCase() + profile.current_level?.slice(1)}
        </p>
      </div>

      <section>
        <h3 className="mb-4 text-xl font-semibold flex items-center gap-2">
          <Lightbulb className="h-5 w-5" />
          Recommended Articles
        </h3>
        {loading ? (
          <p className="text-muted-foreground">Loading articles...</p>
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
