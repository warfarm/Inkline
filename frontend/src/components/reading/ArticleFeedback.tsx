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

  const handleFeedback = async (liked: boolean) => {
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
      toast.success('Thanks for your feedback!', {
        description: liked
          ? `We'll show you more articles about ${topic}`
          : `We'll show you fewer articles about ${topic}`,
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
    <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
      <CardHeader>
        <CardTitle className="text-lg">How did you like this article?</CardTitle>
        <CardDescription>
          Help us recommend better content for you
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 justify-center">
          <Button
            variant="outline"
            size="lg"
            onClick={() => handleFeedback(true)}
            disabled={loading}
            className="flex-1 max-w-xs hover:bg-green-50 hover:border-green-500 hover:text-green-700 dark:hover:bg-green-950"
          >
            👍 More like this
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => handleFeedback(false)}
            disabled={loading}
            className="flex-1 max-w-xs hover:bg-red-50 hover:border-red-500 hover:text-red-700 dark:hover:bg-red-950"
          >
            👎 Less like this
          </Button>
        </div>
        <p className="text-xs text-muted-foreground text-center mt-3">
          This helps us personalize articles about "{topic}" for you
        </p>
      </CardContent>
    </Card>
  );
}
