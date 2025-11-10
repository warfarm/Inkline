import { supabase } from '@/lib/supabase';
import { lookupChinese } from '@/lib/dictionaries/chinese';
import { lookupJapanese } from '@/lib/dictionaries/jisho';

/**
 * Preloads dictionary definitions for all words in Chinese articles
 * This improves reading experience by eliminating lookup delays
 */
export async function preloadArticleDefinitions(articleId?: string) {
  try {
    // Fetch articles (all or specific one)
    let query = supabase
      .from('articles')
      .select('id, language, segmented_content, word_definitions');

    if (articleId) {
      query = query.eq('id', articleId);
    }

    const { data: articles, error } = await query;

    if (error) {
      console.error('Error fetching articles:', error);
      return;
    }

    if (!articles || articles.length === 0) {
      console.log('No articles found');
      return;
    }

    console.log(`Preloading definitions for ${articles.length} article(s)...`);

    for (const article of articles) {
      console.log(`Processing article ${article.id} (${article.language})...`);

      const words = article.segmented_content?.words || [];
      const uniqueWords = [...new Set(words.map((w: any) => w.text as string))] as string[];

      // Start with existing definitions (if any)
      const wordDefinitions: Record<string, any> = article.word_definitions || {};
      const existingCount = Object.keys(wordDefinitions).length;

      // Filter out words that already have definitions
      const wordsToFetch = uniqueWords.filter(word => !wordDefinitions[word]);

      console.log(`  - Found ${uniqueWords.length} unique words`);
      console.log(`  - Already has ${existingCount} definitions`);
      console.log(`  - Need to fetch ${wordsToFetch.length} new definitions`);

      // Skip if all words already have definitions
      if (wordsToFetch.length === 0) {
        console.log(`  ✓ All words already preloaded, skipping...`);
        continue;
      }

      let successCount = 0;

      // Batch process words with a small delay to avoid overwhelming the API
      for (let i = 0; i < wordsToFetch.length; i++) {
        const word = wordsToFetch[i];

        try {
          const result = article.language === 'zh'
            ? await lookupChinese(word)
            : await lookupJapanese(word);

          if (result) {
            wordDefinitions[word] = {
              reading: result.reading,
              definition: result.definition,
              example: result.example,
              grammarNotes: result.grammarNotes,
              formalityLevel: result.formalityLevel,
              usageNotes: result.usageNotes,
              definitions: result.definitions,
              examples: result.examples,
            };
            successCount++;
          }

          // Add delay for Japanese API calls to avoid rate limiting
          if (article.language === 'ja' && i < wordsToFetch.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 300));
          }

          // Progress update every 10 words
          if ((i + 1) % 10 === 0) {
            console.log(`  - Progress: ${i + 1}/${wordsToFetch.length} words processed`);
          }
        } catch (error) {
          console.error(`  - Error fetching definition for "${word}":`, error);
        }
      }

      // Update article with preloaded definitions
      const { error: updateError } = await supabase
        .from('articles')
        .update({ word_definitions: wordDefinitions })
        .eq('id', article.id);

      if (updateError) {
        console.error(`  - Error updating article:`, updateError);
      } else {
        const totalDefinitions = Object.keys(wordDefinitions).length;
        console.log(`  ✓ Successfully preloaded ${successCount} new definitions (total: ${totalDefinitions})`);
      }
    }

    console.log('✓ All articles processed!');
  } catch (error) {
    console.error('Fatal error:', error);
  }
}
