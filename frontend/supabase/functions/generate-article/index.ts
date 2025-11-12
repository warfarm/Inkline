// Supabase Edge Function: generate-article
// Securely calls Gemini API to generate language learning articles

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

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
              maxOutputTokens: 2048,
            },
          }),
        }
      );
      return response;
    };

    // Retry logic with exponential backoff and model fallback
    const models = ['gemini-2.5-flash', 'gemini-2.0-flash'];
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

    // Extract generated content
    const generatedText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!generatedText) {
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

    // Return the generated article data
    // Note: Counter will be incremented by frontend after successful DB save
    return new Response(
      JSON.stringify({
        title: articleData.title,
        content: articleData.content,
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
