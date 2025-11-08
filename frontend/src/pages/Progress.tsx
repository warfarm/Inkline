import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ProgressChart } from '@/components/dashboard/ProgressChart';
import type { ReadingHistory, Article } from '@/types';

interface ProgressStats {
  totalArticlesRead: number;
  totalWordsLearned: number;
  masteredWords: number;
  currentStreak: number;
  totalTimeMinutes: number;
}

export default function Progress() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState<ProgressStats>({
    totalArticlesRead: 0,
    totalWordsLearned: 0,
    masteredWords: 0,
    currentStreak: 0,
    totalTimeMinutes: 0,
  });
  const [readingHistory, setReadingHistory] = useState<ReadingHistory[]>([]);
  const [recentArticles, setRecentArticles] = useState<Array<Article & { completed_at: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProgressData();
    }
  }, [user]);

  const fetchProgressData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Fetch reading history
      const { data: historyData, error: historyError } = await supabase
        .from('reading_history')
        .select('*')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false });

      if (historyError) throw historyError;
      const history = historyData || [];
      setReadingHistory(history);

      // Fetch word bank stats
      const { data: wordData, error: wordError } = await supabase
        .from('word_bank')
        .select('status')
        .eq('user_id', user.id);

      if (wordError) throw wordError;

      const totalWords = wordData?.length || 0;
      const mastered = wordData?.filter((w) => w.status === 'mastered').length || 0;

      // Calculate total time
      const totalSeconds = history.reduce((sum, entry) => sum + (entry.time_spent_seconds || 0), 0);
      const totalMinutes = Math.round(totalSeconds / 60);

      // Calculate current streak
      const streak = calculateStreak(history);

      // Fetch recent articles
      if (history.length > 0) {
        const recentIds = history.slice(0, 5).map((h) => h.article_id);
        const { data: articlesData, error: articlesError } = await supabase
          .from('articles')
          .select('*')
          .in('id', recentIds);

        if (!articlesError && articlesData) {
          const articlesWithDate = articlesData.map((article) => {
            const historyEntry = history.find((h) => h.article_id === article.id);
            return {
              ...article,
              completed_at: historyEntry?.completed_at || '',
            };
          });
          setRecentArticles(articlesWithDate);
        }
      }

      setStats({
        totalArticlesRead: history.length,
        totalWordsLearned: totalWords,
        masteredWords: mastered,
        currentStreak: streak,
        totalTimeMinutes: totalMinutes,
      });
    } catch (error) {
      console.error('Error fetching progress data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStreak = (history: ReadingHistory[]): number => {
    if (history.length === 0) return 0;

    const dates = history.map((h) => {
      const date = new Date(h.completed_at);
      date.setHours(0, 0, 0, 0);
      return date.getTime();
    });

    const uniqueDates = [...new Set(dates)].sort((a, b) => b - a);

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let checkDate = today.getTime();

    for (const date of uniqueDates) {
      if (date === checkDate) {
        streak++;
        checkDate -= 24 * 60 * 60 * 1000; // Go back one day
      } else if (date < checkDate) {
        break;
      }
    }

    return streak;
  };

  if (loading) {
    return (
      <Layout>
        <p className="text-muted-foreground">Loading progress...</p>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold">Your Progress</h2>
          <p className="mt-2 text-muted-foreground">
            Track your learning journey and celebrate your achievements
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Articles Read</CardDescription>
              <CardTitle className="text-4xl">{stats.totalArticlesRead}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Total completed articles
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Words Saved</CardDescription>
              <CardTitle className="text-4xl">{stats.totalWordsLearned}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                {stats.masteredWords} mastered
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Current Streak</CardDescription>
              <CardTitle className="text-4xl">
                {stats.currentStreak}
                <span className="text-2xl ml-1">🔥</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                {stats.currentStreak === 1 ? 'day' : 'days'} in a row
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Time Reading</CardDescription>
              <CardTitle className="text-4xl">
                {stats.totalTimeMinutes}
                <span className="text-xl ml-1">min</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Total time spent reading
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Activity Chart */}
        {readingHistory.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Reading Activity</CardTitle>
              <CardDescription>Your reading consistency over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ProgressChart readingHistory={readingHistory} />
            </CardContent>
          </Card>
        )}

        {/* Recent Articles */}
        {recentArticles.length > 0 && (
          <div>
            <h3 className="text-xl font-semibold mb-4">Recently Completed</h3>
            <div className="space-y-3">
              {recentArticles.map((article) => (
                <Card
                  key={article.id}
                  className="cursor-pointer transition-colors hover:border-primary"
                  onClick={() => navigate(`/article/${article.id}`)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{article.title}</CardTitle>
                        <CardDescription>
                          {article.topic} • {article.word_count} words
                        </CardDescription>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(article.completed_at).toLocaleDateString()}
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {stats.totalArticlesRead === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground mb-4">
                You haven't read any articles yet. Start your learning journey today!
              </p>
              <button
                onClick={() => navigate('/home')}
                className="text-primary underline hover:no-underline"
              >
                Browse articles
              </button>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
