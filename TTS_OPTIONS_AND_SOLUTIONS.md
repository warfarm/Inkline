# Text-to-Speech Options & Solutions

## Current Status

The app **attempts** to use Google Translate TTS but will likely encounter CORS (Cross-Origin Resource Sharing) restrictions that prevent direct browser access to Google's TTS endpoint.

### What Happens Now:
1. **Tries Google TTS first** - Attempts to load audio from Google Translate
2. **Graceful fallback** - If Google fails (due to CORS), automatically falls back to browser TTS
3. **Pinyin pronunciation** - If no Chinese voices installed, reads pinyin aloud

## The CORS Problem

Google Translate's TTS endpoint (`https://translate.google.com/translate_tts`) **blocks direct browser requests** for security reasons. This is a fundamental limitation of client-side web apps.

**Error you'll see:**
```
Access to audio at 'https://translate.google.com/translate_tts...' from origin
'http://localhost:5173' has been blocked by CORS policy
```

## Solutions

### Option 1: Browser TTS with Pinyin Fallback ✅ (Current)

**Status:** ✅ Already implemented and working

**How it works:**
- Uses native browser voices if available (high quality)
- Falls back to reading pinyin with English voice (always works)
- No additional setup required

**Pros:**
- ✅ Works immediately, no setup
- ✅ Free, no API costs
- ✅ Reliable, always provides pronunciation

**Cons:**
- ❌ Requires voice pack installation for best quality
- ❌ Pinyin fallback not as good as native Chinese

**To improve:** Install Chinese voice pack on your system (see TTS_TROUBLESHOOTING.md)

---

### Option 2: Backend Proxy Server ⭐ (Recommended for Production)

**Status:** ⚠️ Requires backend implementation

**How it works:**
1. Create a simple backend endpoint (Node.js/Python/etc.)
2. Frontend requests audio from your backend
3. Backend fetches from Google and returns to frontend
4. Bypasses CORS because backend isn't subject to browser restrictions

**Implementation:**

#### Node.js/Express Example:
```javascript
// backend/server.js
const express = require('express');
const fetch = require('node-fetch');
const app = express();

app.get('/api/tts/:lang/:text', async (req, res) => {
  const { lang, text } = req.params;
  const googleUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${lang}&client=tw-ob&q=${encodeURIComponent(text)}`;

  try {
    const response = await fetch(googleUrl);
    const buffer = await response.buffer();

    res.set('Content-Type', 'audio/mpeg');
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ error: 'TTS failed' });
  }
});

app.listen(3001, () => console.log('TTS proxy running on port 3001'));
```

#### Frontend Update:
```typescript
// Change audioUrl to point to your backend
const audioUrl = `http://localhost:3001/api/tts/${language}/${encodeURIComponent(result.word)}`;
```

**Pros:**
- ✅ Full access to Google TTS
- ✅ High-quality Chinese voices
- ✅ No client-side limitations
- ✅ Can add caching to reduce Google requests

**Cons:**
- ❌ Requires backend server
- ❌ Additional infrastructure to maintain
- ❌ Hosting costs (if deployed)

---

###Option 3: Serverless Function (Edge Functions) 🚀

**Status:** ⚠️ Requires cloud setup

**How it works:**
Deploy a serverless function (Vercel/Netlify/Cloudflare) that proxies TTS requests

**Vercel Edge Function Example:**
```typescript
// api/tts.ts
export const config = { runtime: 'edge' };

export default async function handler(req: Request) {
  const url = new URL(req.url);
  const lang = url.searchParams.get('lang') || 'zh-CN';
  const text = url.searchParams.get('text') || '';

  const googleUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${lang}&client=tw-ob&q=${encodeURIComponent(text)}`;

  const response = await fetch(googleUrl);
  return new Response(response.body, {
    headers: {
      'Content-Type': 'audio/mpeg',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
```

**Frontend Update:**
```typescript
const audioUrl = `/api/tts?lang=${language}&text=${encodeURIComponent(result.word)}`;
```

**Pros:**
- ✅ No dedicated server needed
- ✅ Scales automatically
- ✅ Free tier usually sufficient
- ✅ Easy deployment

**Cons:**
- ❌ Requires cloud account
- ❌ May have cold start delays
- ❌ Function execution limits

**Services:**
- **Vercel** (easiest for Next.js/Vite)
- **Netlify Functions**
- **Cloudflare Workers**
- **AWS Lambda**

---

### Option 4: Alternative TTS Services

**Status:** ⚠️ Requires API keys and potentially costs

#### A. Responsive Voice (Free Tier)
```typescript
// Add script to index.html
<script src="https://code.responsivevoice.org/responsivevoice.js?key=YOUR_KEY"></script>

// In component
responsiveVoice.speak(result.word, "Chinese Female");
```

**Pros:** ✅ Free tier available, ✅ No CORS issues
**Cons:** ❌ Requires API key, ❌ Limited free requests

#### B. Azure Speech Service
```typescript
import * as sdk from "microsoft-cognitiveservices-speech-sdk";

const speechConfig = sdk.SpeechConfig.fromSubscription("YOUR_KEY", "YOUR_REGION");
const synthesizer = new sdk.SpeechSynthesizer(speechConfig);
synthesizer.speakTextAsync(result.word);
```

**Pros:** ✅ Professional quality, ✅ Reliable
**Cons:** ❌ Paid service ($1.50/1000 requests after free tier)

#### C. Amazon Polly
Similar to Azure, requires AWS account and API setup.

---

### Option 5: Pre-Generated Audio Files

**Status:** ⚠️ Requires preparation

**How it works:**
1. Pre-generate audio files for all dictionary words
2. Store in `/public/audio/zh/` directory
3. Load audio files directly (no CORS issues)

**Generation Script:**
```python
# generate_audio.py
from gtts import gTTS
import json

with open('dictionary.json') as f:
    words = json.load(f)

for word in words:
    tts = gTTS(text=word, lang='zh-CN')
    tts.save(f'public/audio/zh/{word}.mp3')
```

**Pros:**
- ✅ No runtime API calls
- ✅ Fast, reliable
- ✅ Works offline
- ✅ No CORS issues

**Cons:**
- ❌ Large file size for many words
- ❌ Pre-generation required
- ❌ Can't handle new words dynamically

---

## Recommendations

### For Development / Testing:
**Use Option 1 (Browser TTS)** ✅ Already working
- Install Chinese voice pack for best quality
- Acceptable pinyin fallback for words

### For Production:
**Use Option 2 or 3 (Backend Proxy or Serverless)** ⭐ Recommended
- Set up a simple proxy
- Vercel Edge Functions are easiest if you're deploying there
- Provides professional Google TTS quality

### For Commercial App:
**Use Option 4 (Professional TTS Service)** 💼
- Azure or AWS for reliability and support
- Better for high-volume usage
- SLA guarantees

## Current Implementation

The app currently:
1. **Attempts Google TTS** (will fail due to CORS in most browsers)
2. **Falls back to browser TTS** (works with native voices)
3. **Falls back to pinyin** (always works, reads pinyin with English voice)

**You will hear pronunciation**, but it may be pinyin rather than native Chinese until you either:
- Install Chinese voice pack (for better browser TTS), OR
- Implement one of the backend solutions (for Google TTS)

## Quick Win: Install Voice Pack

The fastest improvement:

**Windows:**
1. Settings → Time & Language → Language
2. Add "Chinese (Simplified, China)"
3. Options → Speech → Download
4. Restart browser

**Now browser TTS will use native Chinese instead of pinyin!**

## Next Steps

Choose your preferred solution based on your needs:

- **Just want it to work now?** → Install voice pack (5 minutes)
- **Want best quality for production?** → Set up Vercel Edge Function (30 minutes)
- **Need commercial-grade?** → Sign up for Azure Speech (1 hour setup)

Questions? Check the implementation examples above or ask for help with your preferred solution!
