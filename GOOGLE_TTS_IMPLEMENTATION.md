# Google Translate TTS Implementation

## Overview

The app now uses **Google Translate's Text-to-Speech API** for pronunciation, providing high-quality native Chinese and Japanese voices without requiring any voice packs or language installations.

## What Changed

### Previous System (Browser TTS)
- ❌ Required Chinese voice packs installed on the system
- ❌ Inconsistent quality across platforms
- ❌ Limited voice availability
- ❌ Users without voice packs heard nothing or pinyin fallback

### New System (Google Translate TTS)
- ✅ **No installation required** - works immediately
- ✅ **Native quality** - Google's professional Chinese/Japanese voices
- ✅ **Cross-platform consistency** - same quality everywhere
- ✅ **Always available** - no dependency on system configurations
- ✅ **Automatic fallback** - uses browser TTS if Google is unavailable

## How It Works

### Primary Method: Google Translate API
When you click the speaker icon (🔊):

1. **Detects language** - Chinese (zh-CN) or Japanese (ja)
2. **Fetches audio from Google** - `https://translate.google.com/translate_tts?ie=UTF-8&tl=zh-CN&client=tw-ob&q=功能`
3. **Plays native pronunciation** - High-quality Chinese voice

**Example:**
- Word: 功能 (gōngnéng)
- API URL: `https://translate.google.com/translate_tts?ie=UTF-8&tl=zh-CN&client=tw-ob&q=%E5%8A%9F%E8%83%BD`
- Result: Native Chinese pronunciation of "gōngnéng"

### Fallback Method: Browser TTS
If Google TTS fails (network issues, API problems):

1. **Falls back to browser TTS**
2. **Uses native voices if available**
3. **Uses pinyin fallback** if no Chinese voices installed
4. **Always provides some pronunciation**

## Technical Implementation

**File:** `frontend/src/components/reading/WordPopup.tsx`

### Google TTS Function (Primary)
```typescript
const handleSpeak = async () => {
  const text = encodeURIComponent(result.word);
  const audioUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${language}&client=tw-ob&q=${text}`;

  const audio = new Audio(audioUrl);
  await audio.play();
  // ... error handling
};
```

### Browser TTS Function (Fallback)
```typescript
const fallbackToBrowserTTS = (language: string) => {
  // Uses native browser voices if available
  // Falls back to pinyin pronunciation if needed
  // ... implementation
};
```

## Benefits

### For Users
1. **Immediate pronunciation** - No setup required
2. **High quality** - Professional native voices
3. **Reliable** - Always works, even without voice packs
4. **Cross-platform** - Same experience on Windows/Mac/Linux

### For Developers
1. **No API keys needed** - Uses Google's public endpoint
2. **No rate limits** (for reasonable use)
3. **Simple implementation** - Just construct a URL
4. **Automatic fallback** - Graceful degradation

## API Details

### Google Translate TTS Endpoint
```
https://translate.google.com/translate_tts
```

### Parameters
- `ie=UTF-8` - Input encoding
- `tl=zh-CN` - Target language (zh-CN for Chinese, ja for Japanese)
- `client=tw-ob` - Client identifier
- `q={text}` - URL-encoded text to speak

### Supported Languages
- **Chinese (Simplified):** `zh-CN`
- **Japanese:** `ja`
- Can be extended to other languages Google Translate supports

## Console Output

When working correctly:
```
Using Google Translate TTS for: 功能 language: zh-CN
Google TTS started: 功能
Google TTS ended
```

When falling back to browser TTS:
```
Google TTS error: [error details]
Falling back to browser TTS...
Using pinyin fallback: gōngnéng
```

## Testing

### Test the Google TTS:
1. Open the app at http://localhost:5173/
2. Open browser console (F12)
3. Click any Chinese word
4. Click the speaker icon 🔊
5. You should hear native Chinese pronunciation
6. Check console for: `Using Google Translate TTS for: [word]`

### Test the Fallback:
To test the browser TTS fallback, you can:
1. Disconnect from the internet
2. Click speaker icon
3. Should fall back to browser TTS or pinyin
4. Console shows: `Falling back to browser TTS...`

### Manual Test (Browser Console):
```javascript
// Test Google TTS directly
const audio = new Audio('https://translate.google.com/translate_tts?ie=UTF-8&tl=zh-CN&client=tw-ob&q=你好');
audio.play();
```

## Limitations & Considerations

### Known Limitations
1. **Requires internet** - Google TTS needs network access
2. **Unofficial endpoint** - Google could change this anytime
3. **No API guarantees** - Not officially supported by Google

### Best Practices
1. **Always have fallback** - Browser TTS as backup ✅ (implemented)
2. **Handle errors gracefully** - Don't break if Google fails ✅ (implemented)
3. **Rate limiting awareness** - Don't spam requests (user-initiated only) ✅
4. **Privacy** - Words are sent to Google servers (standard translation usage)

### If You Want Official Google Cloud TTS
For production apps with high volume:

1. **Get API key** - https://cloud.google.com/text-to-speech
2. **Update code** to use official API
3. **Handle billing** - Paid service with free tier

Benefits:
- ✅ Official support and SLA
- ✅ More voice options
- ✅ Guaranteed availability
- ✅ Higher rate limits

## Troubleshooting

### No sound when clicking speaker:
1. **Check console** - Look for error messages
2. **Test network** - Make sure internet is connected
3. **Try different word** - Some characters might not be supported
4. **Check browser audio** - Ensure system volume is up

### "Google TTS error" in console:
- **Network issue** - Check internet connection
- **CORS issue** - Usually not a problem, but check console
- **Google service down** - Should automatically fall back to browser TTS

### Fallback to pinyin:
- This means Google TTS failed AND no Chinese voices are installed
- Still better than silence!
- Consider installing Chinese voice pack for better browser fallback

## Future Enhancements

Potential improvements:
1. **Cache audio** - Store Google TTS responses to reduce API calls
2. **Preload common words** - Fetch audio for frequent words ahead of time
3. **Voice selection** - Let users choose from multiple Chinese voices
4. **Speed control** - Add UI to adjust playback rate
5. **Download option** - Let users save audio files
6. **Offline mode** - Pre-download audio for offline use

## Summary

✅ **High-quality Chinese pronunciation without any installation**
✅ **Uses Google Translate's professional voices**
✅ **Automatic fallback to browser TTS if needed**
✅ **Works across all platforms consistently**
✅ **No API keys or setup required**

**Result:** Every user can now hear proper Chinese pronunciation immediately, regardless of their system configuration!
