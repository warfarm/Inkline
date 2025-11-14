import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { Sparkles, X, Plus, RefreshCw } from 'lucide-react';
import type { Language } from '@/types';

interface SetRecommendation {
  name: string;
  description: string;
  color: string;
  wordIds: string[];
  reason: string;
  type: 'article' | 'grammar' | 'recent' | 'leastReviewed' | 'difficulty';
}

interface SetRecommendationsProps {
  userId: string;
  language: Language;
  onDismiss: () => void;
  onCreateFromRecommendation: (recommendation: SetRecommendation) => Promise<void>;
}

export function SetRecommendations({
  userId,
  language,
  onDismiss,
  onCreateFromRecommendation,
}: SetRecommendationsProps) {
  const [recommendation, setRecommendation] = useState<SetRecommendation | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    generateRecommendation();
  }, [userId, language]);

  const generateRecommendation = async () => {
    setLoading(true);
    try {
      // Randomly select a recommendation type
      const types: SetRecommendation['type'][] = [
        'recent',
        'leastReviewed',
        'grammar',
        'article',
        'difficulty',
      ];
      const randomType = types[Math.floor(Math.random() * types.length)];

      const rec = await generateRecommendationByType(randomType);
      setRecommendation(rec);
    } catch (err) {
      console.error('Error generating recommendation:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateRecommendationByType = async (
    type: SetRecommendation['type']
  ): Promise<SetRecommendation | null> => {
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    switch (type) {
      case 'recent': {
        // Words added in the last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const { data, error } = await supabase
          .from('word_bank')
          .select('id, word')
          .eq('user_id', userId)
          .eq('language', language)
          .gte('first_seen_at', sevenDaysAgo.toISOString())
          .limit(30);

        if (error || !data || data.length < 5) return null;

        return {
          name: 'This Week\'s Words',
          description: `Practice the ${data.length} words you added this week`,
          color: randomColor,
          wordIds: data.map((w) => w.id),
          reason: 'Recent words need extra practice to stick!',
          type: 'recent',
        };
      }

      case 'leastReviewed': {
        // Words with low review count
        const { data, error } = await supabase
          .from('word_bank')
          .select('id, word')
          .eq('user_id', userId)
          .eq('language', language)
          .lte('times_reviewed', 2)
          .limit(25);

        if (error || !data || data.length < 5) return null;

        return {
          name: 'Needs Review',
          description: `${data.length} words that need more practice`,
          color: randomColor,
          wordIds: data.map((w) => w.id),
          reason: 'These words haven\'t been reviewed much yet',
          type: 'leastReviewed',
        };
      }

      case 'grammar': {
        // Words with grammar notes (particles, function words, etc.)
        const { data, error } = await supabase
          .from('word_bank')
          .select('id, word')
          .eq('user_id', userId)
          .eq('language', language)
          .not('grammar_notes', 'is', null)
          .limit(20);

        if (error || !data || data.length < 5) return null;

        return {
          name: 'Grammar Patterns',
          description: `Practice ${data.length} words with important grammar notes`,
          color: randomColor,
          wordIds: data.map((w) => w.id),
          reason: 'Master grammar patterns for better fluency',
          type: 'grammar',
        };
      }

      case 'article': {
        // Group words by article (if we have article tracking)
        // For now, just return null as this requires more complex logic
        return null;
      }

      case 'difficulty': {
        // Learning status words
        const { data, error } = await supabase
          .from('word_bank')
          .select('id, word')
          .eq('user_id', userId)
          .eq('language', language)
          .eq('status', 'learning')
          .limit(30);

        if (error || !data || data.length < 5) return null;

        return {
          name: 'Learning in Progress',
          description: `Focus on ${data.length} words you're currently learning`,
          color: randomColor,
          wordIds: data.map((w) => w.id),
          reason: 'Consistent practice helps words stick',
          type: 'difficulty',
        };
      }

      default:
        return null;
    }
  };

  const handleCreate = async () => {
    if (!recommendation) return;

    setCreating(true);
    try {
      await onCreateFromRecommendation(recommendation);
      onDismiss();
    } catch (err) {
      console.error('Error creating set from recommendation:', err);
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <Card className="border-primary/50 bg-gradient-to-r from-primary/5 to-primary/10">
        <CardContent className="p-6 text-center">
          <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" />
          <p className="text-sm text-muted-foreground">Generating recommendation...</p>
        </CardContent>
      </Card>
    );
  }

  if (!recommendation) {
    return null;
  }

  return (
    <Card className="border-primary/50 bg-gradient-to-r from-primary/5 to-primary/10">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Recommended Set</CardTitle>
            <Badge variant="secondary" className="text-xs">
              New
            </Badge>
          </div>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onDismiss}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Recommendation preview */}
        <div className="flex items-start gap-3">
          <div
            className="w-12 h-12 rounded-md flex items-center justify-center text-2xl shrink-0"
            style={{
              background: `linear-gradient(135deg, ${recommendation.color}30, ${recommendation.color}10)`,
            }}
          >
            ✨
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold mb-1">{recommendation.name}</h3>
            <p className="text-sm text-muted-foreground mb-2">
              {recommendation.description}
            </p>
            <p className="text-xs text-muted-foreground italic">
              💡 {recommendation.reason}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            onClick={handleCreate}
            disabled={creating}
            className="flex-1"
            size="sm"
          >
            <Plus className="mr-2 h-4 w-4" />
            {creating ? 'Creating...' : 'Create This Set'}
          </Button>
          <Button
            variant="outline"
            onClick={generateRecommendation}
            disabled={loading}
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {/* Dismiss permanently */}
        <button
          onClick={() => {
            localStorage.setItem('showSetRecommendations', 'false');
            onDismiss();
          }}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors w-full text-center"
        >
          Don't show recommendations again
        </button>
      </CardContent>
    </Card>
  );
}
