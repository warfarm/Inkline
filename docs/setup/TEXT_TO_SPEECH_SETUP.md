# Text-to-Speech (TTS) Setup & Troubleshooting

Complete guide for setting up and troubleshooting text-to-speech functionality in Inkline.

---

## Overview

Inkline supports multiple TTS methods with automatic fallback:
1. **Supabase Edge Function** (Google TTS proxy) - Primary
2. **Web Speech API** (Browser native) - Fallback
3. **Pinyin pronunciation** (Chinese only) - Last resort

---

## Current Implementation Status

### ✅ Implemented Features

- **Multiple TTS backends**: Supabase, Vercel, Cloudflare Workers
- **Smart fallback chain**: Tries multiple methods automatically
- **Language-specific optimizations**:
  - Japanese: Uses hiragana readings for accurate pronunciation
  - Chinese: Proper tone pronunciation with native voices
- **CORS-free solution**: Backend proxies eliminate browser restrictions
- **Graceful degradation**: Always provides some form of pronunciation

### Key Fixes Applied
- ✅ Fixed 私 (watashi) pronunciation - now correctly says "watashi" not "shi"
- ✅ Uses reading field (hiragana/pinyin) instead of characters
- ✅ Web Speech API prioritized for Japanese
- ✅ Comprehensive error handling and fallbacks

---

## Setup Options

### Option 1: Supabase Edge Function ⭐ (Recommended)

**Status**: ✅ Already implemented

**How it works**:
1. Frontend requests TTS from Supabase Edge Function
2. Edge Function fetches audio from Google Translate TTS
3. Returns audio to frontend (bypasses CORS)

**Setup**:
```bash
# Deploy TTS function
cd frontend
supabase functions deploy tts
```

**Pros**:
- ✅ High-quality Google voices
- ✅ No client-side limitations
- ✅ 500K invocations/month free
- ✅ Works for all users immediately

**Cons**:
- ❌ Requires Supabase account
- ❌ Network dependency

**Location**: `frontend/supabase/functions/tts/index.ts`

---

### Option 2: Vercel Edge Function

**Status**: ✅ Code provided

**Setup**:
```bash
# Vercel auto-deploys functions in /api folder
vercel --prod
```

**Pros**:
- ✅ Unlimited invocations
- ✅ Zero configuration with Vercel deployment

**Location**: `api/tts.ts`

---

### Option 3: Cloudflare Workers

**Status**: ✅ Code provided

**Setup**:
```bash
npm install -g wrangler
wrangler login
cd cloudflare-workers
wrangler deploy tts-proxy.js --name inkline-tts
```

**Pros**:
- ✅ 100K requests/day (3M/month)
- ✅ Excellent performance

**Location**: `cloudflare-workers/tts-proxy.js`

---

### Option 4: Browser TTS (Web Speech API)

**Status**: ✅ Always available as fallback

**How it works**:
- Uses native browser voices
- Falls back to reading pinyin (Chinese) or romaji (Japanese)
- No setup required

**Pros**:
- ✅ Works offline
- ✅ No API costs
- ✅ Instant pronunciation

**Cons**:
- ❌ Requires voice pack installation for best quality
- ❌ Quality varies by system

---

## Installing System Voice Packs

For best quality with Browser TTS:

### Windows

1. Open **Settings** → **Time & Language** → **Language**
2. Click **Add a language**
3. Add your target language:
   - Chinese (Simplified, China) for Chinese
   - Japanese (Japan) for Japanese
   - Korean (South Korea) for Korean
4. Click on the language → **Options** → **Speech**
5. Download the speech voice pack
6. **Restart your browser**

### macOS

1. Open **System Preferences** → **Accessibility** → **Spoken Content**
2. Click **System Voice** dropdown
3. Click **Customize...**
4. Download voices:
   - **Ting-Ting** for Chinese
   - **Kyoko** for Japanese
   - **Yuna** for Korean
5. **Restart your browser**

### Linux

```bash
# For Chinese
sudo apt install espeak-ng

# Or use festival
sudo apt install festival festvox-zh

# Browser support varies - Chrome/Chromium works best
```

### Chrome OS

- Voices typically pre-installed
- Check **Settings** → **Languages** → **Speech**

---

## Troubleshooting

### No Sound When Clicking Speaker Icon

#### Step 1: Open Browser Console

1. Press **F12** or right-click → **Inspect**
2. Click **Console** tab
3. Click a word and try TTS
4. Look for diagnostic messages

#### Step 2: Check Console Messages

**✅ Good signs**:
```
Supabase TTS started: 你好
Available voices: ["Microsoft Huihui - Chinese (zh-CN)", ...]
Selected voice: Microsoft Huihui - Chinese zh-CN
Speech started: 你好
Speech ended
```

**❌ Problem signs**:
```
No zh-CN voice found. Available languages: ["en-US", "en-GB"]
```
→ **Solution**: Install Chinese voice pack (see above)

```
Speech synthesis error: not-allowed
```
→ **Solution**: Click around the page first, check permissions

```
Failed to load audio: 403
```
→ **Solution**: Backend proxy not deployed or credentials issue

---

### Common Issues

#### Issue 1: No Chinese/Japanese Voices

**Solution**: Install system voice packs (see above section)

#### Issue 2: Browser Compatibility

**Best browsers**:
- ✅ Chrome/Edge (best support)
- ✅ Safari (good on macOS/iOS)
- ⚠️ Firefox (limited voices)
- ❌ Older browsers may not support Web Speech API

#### Issue 3: Permission Errors

If you see "not-allowed":
1. Interact with page (click something)
2. Check browser audio permissions
3. Try clicking speaker icon again

#### Issue 4: Tab/System Muted

**Check**:
1. System volume not muted
2. Browser tab not muted (look for 🔇 icon)
3. Chrome: Right-click tab → check "Mute site"
4. Chrome settings: `chrome://settings/content/sound`

---

## Testing TTS

### Manual Browser Test

Paste in browser console:

```javascript
// Test Chinese TTS
const utterance = new SpeechSynthesisUtterance('你好');
utterance.lang = 'zh-CN';

// Log available voices
console.log('All voices:', speechSynthesis.getVoices().map(v => `${v.name} (${v.lang})`));

// Find and use Chinese voice
const voices = speechSynthesis.getVoices();
const chineseVoice = voices.find(v => v.lang.startsWith('zh'));
if (chineseVoice) {
  utterance.voice = chineseVoice;
  console.log('Using voice:', chineseVoice.name);
  speechSynthesis.speak(utterance);
} else {
  console.error('No Chinese voice found!');
}
```

If this doesn't work, the issue is with your browser/system, not the app.

### Testing Backend Proxies

**Supabase**:
```bash
curl "YOUR_SUPABASE_URL/functions/v1/tts?text=你好&lang=zh-CN" \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

**Vercel**:
```bash
curl "https://your-project.vercel.app/api/tts?text=你好&lang=zh-CN"
```

**Cloudflare**:
```bash
curl "https://inkline-tts.your-username.workers.dev?text=你好&lang=zh-CN"
```

Should return audio/mpeg data.

---

## TTS Fallback Chain

The system tries methods in this order:

### For Chinese (zh-CN)
1. **Supabase Edge Function** → Google TTS (high quality)
2. **Browser TTS** with zh-CN voice → Native Chinese voice
3. **Browser TTS** with pinyin → English voice reads pinyin
4. **Error message** → User notified

### For Japanese (ja)
1. **Web Speech API** with hiragana reading → Native Japanese voice
2. **Supabase Edge Function** → Google TTS fallback
3. **Error message** → User notified

---

## Language-Specific Features

### Japanese
- **Uses hiragana for pronunciation**: 私 → わたし
- **Respects word readings**: Uses reading field from dictionary
- **Conjugation aware**: Pronounces verb forms correctly

### Chinese
- **Uses pinyin with tone marks**: 成功 → chéng gōng
- **Proper tone pronunciation**: With native voices
- **Character-by-character**: Can pronounce individual characters

---

## Advanced Configuration

### Custom Backend Proxy

If you want to host your own TTS proxy:

```javascript
// Node.js/Express example
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

app.listen(3001);
```

Update frontend:
```typescript
const audioUrl = `http://localhost:3001/api/tts/${language}/${encodeURIComponent(text)}`;
```

---

## Alternative TTS Services

If built-in TTS doesn't meet your needs:

### Cloud TTS APIs
- **Google Cloud Text-to-Speech**: High quality, requires API key
- **Microsoft Azure Speech**: Natural voices, pay per use
- **Amazon Polly**: Good quality, AWS integration

### Browser Extensions
- **Speechify** (Chrome/Edge)
- **Read Aloud** (Chrome/Firefox)

---

## CORS Problem Explained

### Why Direct Google TTS Doesn't Work

Google's TTS endpoint blocks direct browser requests:

```
Access to audio at 'https://translate.google.com/translate_tts...'
has been blocked by CORS policy
```

This is a browser security restriction, not an Inkline issue.

### How Backend Proxies Solve This

```
Browser → Backend Proxy → Google TTS → Backend Proxy → Browser
         ✅ Same origin    ✅ No CORS    ✅ Returns audio
```

Backends aren't subject to CORS restrictions.

---

## Deployment Checklist

- [ ] Deploy TTS backend (Supabase/Vercel/Cloudflare)
- [ ] Test TTS with curl commands
- [ ] Verify `.env.local` has correct credentials
- [ ] Test in browser with various languages
- [ ] Check browser console for errors
- [ ] Verify fallback chain works
- [ ] Install system voice packs (optional)

---

## Summary

### Current Status
- ✅ Multiple TTS backends available
- ✅ Automatic fallback chain
- ✅ Language-specific optimizations
- ✅ CORS issues solved
- ✅ Works with or without backend

### Recommended Setup
1. Deploy Supabase TTS function (best quality)
2. Install system voice packs (offline fallback)
3. Test with browser console
4. Monitor backend usage if needed

### Need Help?

If TTS still doesn't work:
1. Share console output when clicking speaker
2. Share browser and OS versions
3. Run manual browser test script
4. Share available voices list

---

**Most common fix**: Install language voice packs on your system, then restart browser.
