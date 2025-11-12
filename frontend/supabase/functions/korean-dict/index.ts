// Supabase Edge Function for Korean Dictionary API
// Proxies requests to Korean-English Dictionary (krdict.korean.go.kr) and Wiktionary
// Bypasses CORS by making requests server-side

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Romanization mapping for common Korean characters
// This is a simplified version - production would use a proper library
const ROMANIZATION_MAP: Record<string, string> = {
  '안녕하세요': 'annyeonghaseyo',
  '감사합니다': 'gamsahamnida',
  '네': 'ne',
  '아니요': 'aniyo',
  // Add more common words as needed
}

/**
 * Fetch from Korean-English Dictionary API (krdict.korean.go.kr)
 */
async function fetchFromKrdict(word: string): Promise<any> {
  try {
    // Note: The actual krdict API endpoint may require an API key
    // For now, this is a placeholder. Replace with actual API endpoint
    const url = `https://krdict.korean.go.kr/api/search?q=${encodeURIComponent(word)}&key=${Deno.env.get('KRDICT_API_KEY') || ''}`

    console.log(`Fetching from krdict: ${word}`)

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    })

    if (!response.ok) {
      console.warn(`krdict API returned ${response.status}`)
      return null
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.warn('krdict API error:', error)
    return null
  }
}

/**
 * Fetch from Wiktionary API as fallback
 */
async function fetchFromWiktionary(word: string): Promise<any> {
  try {
    const url = `https://en.wiktionary.org/api/rest_v1/page/definition/${encodeURIComponent(word)}`

    console.log(`Fetching from Wiktionary: ${word}`)

    const response = await fetch(url)

    if (!response.ok) {
      return null
    }

    const data = await response.json()

    // Extract Korean definitions if available
    if (data.ko && data.ko.length > 0) {
      return data.ko
    }

    return null
  } catch (error) {
    console.warn('Wiktionary API error:', error)
    return null
  }
}

/**
 * Transform API response to standard DictionaryResult format
 */
function transformToStandardFormat(word: string, data: any, source: string): any {
  if (!data) return null

  try {
    if (source === 'wiktionary') {
      const firstEntry = data[0]
      const definitions = firstEntry.definitions || []

      if (definitions.length === 0) return null

      return {
        word: word,
        reading: ROMANIZATION_MAP[word] || '', // Simplified romanization
        definition: definitions[0].definition || '',
        definitions: definitions.map((def: any) => ({
          meaning: def.definition,
          partOfSpeech: def.partOfSpeech || '',
        })),
        examples: definitions[0].examples || [],
      }
    }

    // Transform krdict format (placeholder - adjust based on actual API response)
    if (source === 'krdict') {
      // Adjust this based on actual krdict API response format
      return {
        word: word,
        reading: data.romanization || ROMANIZATION_MAP[word] || '',
        definition: data.definition || '',
        definitions: data.definitions || [],
        examples: data.examples || [],
        formalityLevel: data.formality,
        grammarNotes: data.grammar,
      }
    }

    return null
  } catch (error) {
    console.error('Error transforming dictionary data:', error)
    return null
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get parameters from URL
    const url = new URL(req.url)
    const word = url.searchParams.get('word')

    if (!word) {
      return new Response(
        JSON.stringify({ error: 'Missing word parameter' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    console.log(`Korean dictionary request: word="${word}"`)

    // Try krdict first (official Korean dictionary)
    let data = await fetchFromKrdict(word)
    let result = transformToStandardFormat(word, data, 'krdict')

    // Fallback to Wiktionary if krdict fails
    if (!result) {
      console.log('Falling back to Wiktionary')
      data = await fetchFromWiktionary(word)
      result = transformToStandardFormat(word, data, 'wiktionary')
    }

    // If still no result, return a basic response
    if (!result) {
      result = {
        word: word,
        reading: ROMANIZATION_MAP[word] || '',
        definition: 'Definition not found',
      }
    }

    // Return data with CORS headers
    return new Response(JSON.stringify(result), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
      },
    })
  } catch (error) {
    console.error('Korean dictionary error:', error)
    return new Response(
      JSON.stringify({
        error: error.message,
        word: new URL(req.url).searchParams.get('word'),
        reading: '',
        definition: 'Unable to fetch definition',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
