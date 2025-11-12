// Cloudflare Worker for Google Translate TTS
// Alternative to Supabase/Vercel Edge Functions

export default {
  async fetch(request) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      })
    }

    try {
      const url = new URL(request.url)
      const text = url.searchParams.get('text')
      const lang = url.searchParams.get('lang') || 'zh-CN'

      if (!text) {
        return new Response(
          JSON.stringify({ error: 'Missing text parameter' }),
          {
            status: 400,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Content-Type': 'application/json',
            },
          }
        )
      }

      // Fetch audio from Google Translate
      const googleUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${lang}&client=tw-ob&q=${encodeURIComponent(text)}`

      const response = await fetch(googleUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      })

      if (!response.ok) {
        throw new Error(`Google TTS returned ${response.status}`)
      }

      const audioData = await response.arrayBuffer()

      return new Response(audioData, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'audio/mpeg',
          'Cache-Control': 'public, max-age=86400',
        },
      })
    } catch (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        {
          status: 500,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json',
          },
        }
      )
    }
  },
}
