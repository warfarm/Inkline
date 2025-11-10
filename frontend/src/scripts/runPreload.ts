import { preloadArticleDefinitions } from './preloadArticleDefinitions';

/**
 * Simple wrapper to run the preload script
 */
async function main() {
  console.log('Starting article definitions preload...\n');

  try {
    await preloadArticleDefinitions();
    console.log('\n✅ Preload completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Preload failed:', error);
    process.exit(1);
  }
}

main();
