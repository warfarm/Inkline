// Quick test file to verify Jisho API is working
// Run this in your browser console to test

export async function testJishoAPI() {
  const testWords = ['日本', '学生', 'は', '食べる'];

  for (const word of testWords) {
    console.log(`\n=== Testing: ${word} ===`);
    try {
      const response = await fetch(
        `https://jisho.org/api/v1/search/words?keyword=${encodeURIComponent(word)}`
      );

      const data = await response.json();
      console.log('Response:', data);

      if (data.data && data.data.length > 0) {
        const entry = data.data[0];
        console.log('Word:', entry.japanese[0]?.word || entry.japanese[0]?.reading);
        console.log('Reading:', entry.japanese[0]?.reading);
        console.log('Definition:', entry.senses[0]?.english_definitions.join(', '));
      } else {
        console.log('No results found');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }
}

// Uncomment to run:
// testJishoAPI();
