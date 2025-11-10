import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { preloadArticleDefinitions } from '@/scripts/preloadArticleDefinitions';
import { toast } from 'sonner';

export function PreloadDefinitions() {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState('');

  const handlePreload = async () => {
    if (loading) return;

    setLoading(true);
    setProgress('Starting preload process...');

    try {
      // Intercept console.log to show progress
      const originalLog = console.log;
      console.log = (...args) => {
        setProgress(args.join(' '));
        originalLog(...args);
      };

      await preloadArticleDefinitions();

      // Restore console.log
      console.log = originalLog;

      toast.success('Successfully preloaded all article definitions!');
      setProgress('✓ Complete! All articles now have preloaded definitions.');
    } catch (error) {
      console.error('Error preloading:', error);
      toast.error('Failed to preload definitions. Check console for details.');
      setProgress(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Preload Article Definitions</CardTitle>
        <CardDescription>
          Preload dictionary definitions for all words in all articles to improve reading experience.
          This will fetch definitions for Chinese and Japanese articles and store them in the database.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-muted/50 rounded-lg p-4 text-sm">
          <p className="font-semibold mb-2">What this does:</p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>Fetches definitions for all unique words in each article</li>
            <li>Stores them in the article's word_definitions field</li>
            <li>Eliminates lookup delays when users hover/click words</li>
            <li>Japanese articles may take longer due to API rate limiting</li>
          </ul>
        </div>

        {progress && (
          <div className="bg-primary/10 rounded-lg p-4 text-sm font-mono whitespace-pre-wrap">
            {progress}
          </div>
        )}

        <Button
          onClick={handlePreload}
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Preloading... (Check progress above)' : 'Start Preloading All Articles'}
        </Button>

        <p className="text-xs text-muted-foreground">
          Note: You need to first run the migration to add the word_definitions column:
          <code className="block mt-1 p-2 bg-muted rounded text-foreground">
            ALTER TABLE articles ADD COLUMN IF NOT EXISTS word_definitions JSONB DEFAULT '{}'::jsonb;
          </code>
        </p>
      </CardContent>
    </Card>
  );
}
