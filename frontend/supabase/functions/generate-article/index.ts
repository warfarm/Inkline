// Supabase Edge Function: generate-article
// Securely calls Gemini API to generate language learning articles

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
// @ts-ignore - TinySegmenter doesn't have TypeScript definitions
import TinySegmenter from 'https://esm.sh/tiny-segmenter@0.2.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GenerationRequest {
  topic: string;
  length: 'short' | 'medium' | 'long';
  isTestArticle: boolean;
  language: 'zh' | 'ja';
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
  wordBankWords: string[];
}

const WORD_COUNT_RANGES = {
  short: { min: 150, max: 200 },
  medium: { min: 300, max: 400 },
  long: { min: 500, max: 700 },
};

const HSK_JLPT_LEVELS = {
  beginner: { zh: 'HSK 1-2', ja: 'JLPT N5-N4' },
  intermediate: { zh: 'HSK 3-4', ja: 'JLPT N3-N2' },
  advanced: { zh: 'HSK 5-6', ja: 'JLPT N1' },
};

// Helper function to check if a character is kanji
function isKanji(char: string): boolean {
  const code = char.charCodeAt(0);
  return (
    (code >= 0x4e00 && code <= 0x9faf) || // CJK Unified Ideographs
    (code >= 0x3400 && code <= 0x4dbf) || // CJK Extension A
    (code >= 0xf900 && code <= 0xfaff)    // CJK Compatibility Ideographs
  );
}

// Helper function to check if text contains kanji
function hasKanji(text: string): boolean {
  return Array.from(text).some(char => isKanji(char));
}

// Segment Japanese text using TinySegmenter
function segmentJapanese(text: string): Array<{ text: string; start: number; end: number }> {
  const segmenter = new TinySegmenter();
  const segments = segmenter.segment(text);
  const words: Array<{ text: string; start: number; end: number }> = [];
  let currentPosition = 0;

  for (const segment of segments) {
    const start = currentPosition;
    const end = currentPosition + segment.length;
    words.push({ text: segment, start, end });
    currentPosition = end;
  }

  return words;
}

// Simple Chinese segmentation (character-based for now)
function segmentChinese(text: string): Array<{ text: string; start: number; end: number }> {
  const words: Array<{ text: string; start: number; end: number }> = [];
  let currentPosition = 0;

  // Group consecutive Chinese characters together
  let currentWord = '';
  let wordStart = 0;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const code = char.charCodeAt(0);
    const isChinese = (code >= 0x4e00 && code <= 0x9fff);

    if (isChinese) {
      if (currentWord === '') {
        wordStart = currentPosition;
      }
      currentWord += char;
    } else {
      if (currentWord) {
        words.push({ text: currentWord, start: wordStart, end: currentPosition });
        currentWord = '';
      }
      if (char.trim()) {
        words.push({ text: char, start: currentPosition, end: currentPosition + 1 });
      }
    }
    currentPosition++;
  }

  if (currentWord) {
    words.push({ text: currentWord, start: wordStart, end: currentPosition });
  }

  return words;
}

// Fetch reading from Jisho API for Japanese words
async function fetchJapaneseReading(word: string): Promise<string | null> {
  try {
    // Only fetch if word contains kanji
    if (!hasKanji(word)) {
      return null;
    }

    const response = await fetch(`https://jisho.org/api/v1/search/words?keyword=${encodeURIComponent(word)}`);
    if (!response.ok) return null;

    const data = await response.json();

    if (data.data && data.data.length > 0) {
      const firstResult = data.data[0];
      // Get the reading from japanese array
      if (firstResult.japanese && firstResult.japanese.length > 0) {
        return firstResult.japanese[0].reading || null;
      }
    }
    return null;
  } catch (error) {
    console.error(`Error fetching reading for ${word}:`, error);
    return null;
  }
}

// Segment text and add readings
async function segmentWithReadings(
  content: string,
  language: 'zh' | 'ja'
): Promise<{ words: Array<{ text: string; start: number; end: number; reading?: string }> }> {
  console.log('[SEGMENT] Starting segmentation for', language);

  // Segment based on language
  const words = language === 'ja'
    ? segmentJapanese(content)
    : segmentChinese(content);

  console.log('[SEGMENT] Segmented into', words.length, 'words');

  // For Japanese, fetch readings for words with kanji
  if (language === 'ja') {
    const wordsWithKanji = words.filter(w => hasKanji(w.text));
    console.log('[SEGMENT] Found', wordsWithKanji.length, 'words with kanji, fetching readings...');

    // Fetch readings in batches to avoid rate limiting
    const batchSize = 5;
    for (let i = 0; i < wordsWithKanji.length; i += batchSize) {
      const batch = wordsWithKanji.slice(i, i + batchSize);

      await Promise.all(
        batch.map(async (word) => {
          const reading = await fetchJapaneseReading(word.text);
          if (reading) {
            word.reading = reading;
          }
        })
      );

      // Small delay between batches to be respectful to Jisho API
      if (i + batchSize < wordsWithKanji.length) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }

    console.log('[SEGMENT] Fetched readings for', wordsWithKanji.filter(w => w.reading).length, 'words');
  }

  return { words };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('[1] Function called');

    // Get Gemini API key from environment
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      console.log('[2] Missing GEMINI_API_KEY');
      throw new Error('GEMINI_API_KEY not configured');
    }
    console.log('[2] GEMINI_API_KEY found');

    // Parse request body
    const body: GenerationRequest = await req.json();
    const { topic, length, isTestArticle, language, difficultyLevel, wordBankWords } = body;
    console.log('[3] Body parsed:', { topic, length, language, difficultyLevel });

    // Validate inputs
    if (!topic || !length || !language || !difficultyLevel) {
      console.log('[4] Missing required fields');
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    console.log('[4] All required fields present');

    // Get authorization header for Supabase client
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.log('[5] Missing authorization header');
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    console.log('[5] Authorization header present:', authHeader.substring(0, 30) + '...');

    // Extract JWT token from Authorization header
    const token = authHeader.replace('Bearer ', '');
    console.log('[5.5] Extracted token:', token.substring(0, 20) + '...');

    // Create Supabase client with user's JWT token for authenticated requests
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    console.log('[6] Creating Supabase client with URL:', supabaseUrl);

    // Create authenticated client using the user's JWT token
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    });
    console.log('[7] Supabase client created, calling getUser() with token');

    // Get user from JWT token directly
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    console.log('[8] getUser() returned:', { hasUser: !!user, error: userError?.message });
    if (userError || !user) {
      console.error('Auth error:', {
        error: userError,
        hasUser: !!user,
        authHeaderPreview: authHeader?.substring(0, 30),
        supabaseUrl,
      });
      return new Response(
        JSON.stringify({
          error: 'Unauthorized',
          details: userError?.message || 'No user found',
        }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check generation limit (doesn't increment yet)
    console.log('[9] Checking generation limit for user:', user.id);

    // Query generation_limits table directly instead of using RPC
    const { data: limitData, error: limitError } = await supabase
      .from('generation_limits')
      .select('count')
      .eq('user_id', user.id)
      .eq('generation_date', new Date().toISOString().split('T')[0])
      .maybeSingle();

    console.log('[10] Limit check result:', { limitData, error: limitError });

    if (limitError) {
      console.error('[11] Error checking generation limit:', limitError);
      return new Response(
        JSON.stringify({ error: 'Failed to check generation limit' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const currentCount = limitData?.count || 0;
    const dailyLimit = 5;
    const canGenerate = currentCount < dailyLimit;

    console.log('[10.5] Count check:', { currentCount, dailyLimit, canGenerate });

    if (!canGenerate) {
      console.log('[12] Generation limit reached, count:', currentCount);
      return new Response(
        JSON.stringify({ error: 'Daily generation limit reached (5/5)' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[13] Limit check passed, proceeding with generation');

    // Build Gemini prompt
    const wordCountRange = WORD_COUNT_RANGES[length];
    const languageName = language === 'zh' ? 'Simplified Chinese' : 'Japanese';
    const levelDescription = isTestArticle
      ? `${HSK_JLPT_LEVELS[difficultyLevel][language]} vocabulary level`
      : `${difficultyLevel} level`;

    const wordBankInstructions = wordBankWords.length > 0
      ? `\n\nImportantly, naturally incorporate these words from the learner's vocabulary bank where relevant to the topic: ${wordBankWords.join(', ')}. Use them naturally in context - don't force them if they don't fit the topic.`
      : '';

    const prompt = `You are a language learning content creator. Write an engaging article in ${languageName} for ${levelDescription} learners.

Topic: ${topic}

Requirements:
- Write ${wordCountRange.min}-${wordCountRange.max} words
- Use ${languageName === 'Simplified Chinese' ? 'simplified Chinese characters only' : 'a mix of hiragana, katakana, and kanji appropriate for the level'}
- Write naturally and engagingly about the topic
- Use vocabulary and grammar appropriate for ${levelDescription}${wordBankInstructions}
- Create a compelling title that reflects the content
- Structure the content with clear paragraphs
- Make it educational and interesting

${isTestArticle ? `\nThis is a test article, so strictly adhere to ${HSK_JLPT_LEVELS[difficultyLevel][language]} vocabulary and grammar patterns.` : ''}

Return ONLY a JSON object with this structure:
{
  "title": "Article title in ${languageName}",
  "content": "Full article text in ${languageName}",
  "wordCount": actual_word_count_number
}

Do not include any markdown formatting, code blocks, or additional text outside the JSON object.`;

    // Helper function to call Gemini API with a specific model
    const callGeminiAPI = async (modelName: string) => {
      console.log(`[14] Calling Gemini API with model: ${modelName}`);
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: prompt }],
            }],
            generationConfig: {
              temperature: 0.8,
              maxOutputTokens: 8192, // Increased from 2048 to accommodate article generation
            },
          }),
        }
      );
      return response;
    };

    // Retry logic with exponential backoff and model fallback
    // Using Flash-Lite models for higher free tier limits (1000 RPD vs 250 RPD for regular Flash)
    const models = ['gemini-2.0-flash-lite', 'gemini-2.5-flash', 'gemini-2.0-flash'];
    let geminiResponse: Response | null = null;
    let lastError: string = '';

    for (const model of models) {
      // Try each model up to 3 times with exponential backoff
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          geminiResponse = await callGeminiAPI(model);

          if (geminiResponse.ok) {
            console.log(`[15] Success with ${model} on attempt ${attempt}`);
            break; // Success! Exit retry loop
          }

          const errorData = await geminiResponse.json();
          lastError = JSON.stringify(errorData);
          console.log(`[15] ${model} attempt ${attempt} failed:`, lastError);

          // If 503 (overloaded), retry with backoff
          if (geminiResponse.status === 503 && attempt < 3) {
            const backoffMs = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
            console.log(`[16] Model overloaded, retrying in ${backoffMs}ms...`);
            await new Promise(resolve => setTimeout(resolve, backoffMs));
            continue; // Retry same model
          }

          // If not 503 or max retries reached, try next model
          break;
        } catch (error) {
          lastError = error.message;
          console.error(`[15] ${model} attempt ${attempt} exception:`, error);
          if (attempt < 3) {
            const backoffMs = Math.pow(2, attempt) * 1000;
            await new Promise(resolve => setTimeout(resolve, backoffMs));
          }
        }
      }

      // If we got a successful response, break out of model loop
      if (geminiResponse?.ok) break;
    }

    // Check if we got a successful response
    if (!geminiResponse || !geminiResponse.ok) {
      console.error('[17] All Gemini models failed:', lastError);
      return new Response(
        JSON.stringify({
          error: 'Gemini API is currently overloaded. Please try again in a few moments.',
          details: lastError
        }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const geminiData = await geminiResponse.json();
    console.log('[18] Full Gemini response:', JSON.stringify(geminiData, null, 2));

    // Extract generated content
    const generatedText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!generatedText) {
      console.error('[19] Failed to extract text. Response structure:', {
        hasCandidates: !!geminiData.candidates,
        candidatesLength: geminiData.candidates?.length,
        firstCandidate: geminiData.candidates?.[0],
        fullResponse: geminiData
      });
      throw new Error('No content generated from Gemini');
    }

    // Parse JSON response from Gemini
    let articleData;
    try {
      // Remove markdown code blocks if present
      const cleanedText = generatedText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      articleData = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', generatedText);
      throw new Error('Invalid JSON response from Gemini');
    }

    console.log('[20] Starting segmentation and reading fetch...');

    // Segment the content and fetch readings
    const segmentedContent = await segmentWithReadings(articleData.content, language);

    console.log('[21] Segmentation complete, returning article data');

    // Return the generated article data with segmented content
    // Note: Counter will be incremented by frontend after successful DB save
    return new Response(
      JSON.stringify({
        title: articleData.title,
        content: articleData.content,
        segmentedContent, // Include segmented content with readings
        wordCount: articleData.wordCount,
        topic,
        language,
        difficultyLevel,
        isTestArticle,
        articleLength: length,
        generationPrompt: topic,
        wordBankWordsUsed: wordBankWords,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in generate-article function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
