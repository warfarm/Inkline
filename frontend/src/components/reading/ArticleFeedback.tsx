import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface ArticleFeedbackProps {
  articleId: string;
  userId: string;
  topic: string;
}

export function ArticleFeedback({ articleId, userId, topic }: ArticleFeedbackProps) {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleFeedback = async (liked: boolean | null) => {
    setLoading(true);
    try {
      // Update the reading_history entry with the liked status
      const { error } = await supabase
        .from('reading_history')
        .update({ liked })
        .eq('article_id', articleId)
        .eq('user_id', userId)
        .order('completed_at', { ascending: false })
        .limit(1);

      if (error) throw error;

      setSubmitted(true);

      let description = '';
      if (liked === true) {
        description = `We'll show you more articles about ${topic}`;
      } else if (liked === false) {
        description = `We'll show you fewer articles about ${topic}`;
      } else {
        description = 'Your preference has been noted';
      }

      toast.success('Thanks for your feedback!', {
        description,
        duration: 3000,
      });
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('Failed to submit feedback', {
        description: 'Please try again',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <Card className="bg-muted/30">
        <CardContent className="p-6 text-center">
          <p className="text-sm text-muted-foreground">Thank you for your feedback!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-muted/20 border-border">
      <CardHeader>
        <CardTitle className="text-lg">How did you like this article?</CardTitle>
        <CardDescription>
          Help us recommend better content for you
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-3 justify-center flex-wrap">
          <Button
            variant="outline"
            size="lg"
            onClick={() => handleFeedback(true)}
            disabled={loading}
            className="flex-1 min-w-[140px] max-w-[180px] hover:bg-green-500 hover:border-green-600 hover:text-white transition-all"
          >
            <span className="inline-block text-lg mr-2 transition-transform hover:scale-125">👍</span>
            More
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => handleFeedback(null)}
            disabled={loading}
            className="flex-1 min-w-[140px] max-w-[180px] hover:bg-gray-200 hover:border-gray-300 hover:text-gray-900 transition-all"
          >
            <span className="inline-block text-lg mr-2 transition-transform hover:scale-125">😐</span>
            Neutral
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => handleFeedback(false)}
            disabled={loading}
            className="flex-1 min-w-[140px] max-w-[180px] hover:bg-red-500 hover:border-red-600 hover:text-white transition-all"
          >
            <span className="inline-block text-lg mr-2 transition-transform hover:scale-125">👎</span>
            Less
          </Button>
        </div>
        <p className="text-xs text-muted-foreground text-center mt-4">
          This helps us recommend better articles about "{topic}"
        </p>
      </CardContent>
    </Card>
  );
}
