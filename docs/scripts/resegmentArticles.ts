import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { segmentChinese } from '../lib/segmentation/chinese';
import { segmentJapanese } from '../lib/segmentation/japanese';

// Load environment variables from .env.local file
config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Re-segments all articles in the database using the improved segmentation algorithms
 * This fixes issues where articles were segmented character-by-character instead of by words
 */
async function resegmentAllArticles() {
  console.log('🔄 Starting re-segmentation of all articles...\n');

  // Fetch all articles
  const { data: articles, error } = await supabase
    .from('articles')
    .select('id, language, title, content, segmented_content')
    .order('language', { ascending: true });

  if (error) {
    console.error('❌ Error fetching articles:', error);
    return;
  }

  if (!articles || articles.length === 0) {
    console.log('No articles found in database');
    return;
  }

  console.log(`Found ${articles.length} articles to process\n`);

  let successCount = 0;
  let errorCount = 0;

  for (const article of articles) {
    console.log(`Processing: [${article.language}] "${article.title}"`);

    try {
      // Segment based on language
      const segmentedWords = article.language === 'zh'
        ? segmentChinese(article.content)
        : await segmentJapanese(article.content);

      // Create the segmented content structure
      const segmentedContent = {
        words: segmentedWords
      };

      // Update the article in the database
      const { error: updateError } = await supabase
        .from('articles')
        .update({ segmented_content: segmentedContent })
        .eq('id', article.id);

      if (updateError) {
        console.error(`  ❌ Error updating article: ${updateError.message}`);
        errorCount++;
      } else {
        console.log(`  ✅ Successfully re-segmented (${segmentedWords.length} words)`);
        successCount++;
      }
    } catch (err) {
      console.error(`  ❌ Error processing article:`, err);
      errorCount++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`✨ Re-segmentation complete!`);
  console.log(`   Success: ${successCount}`);
  console.log(`   Errors: ${errorCount}`);
  console.log('='.repeat(60));
}

// Run the script
resegmentAllArticles()
  .then(() => {
    console.log('\n✅ Script finished');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
