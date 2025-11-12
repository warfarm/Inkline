# Chinese Text-to-Speech (TTS) Troubleshooting Guide

## Problem
You see the speaker icon (🔊) when hovering over Chinese words, but clicking it doesn't produce any sound.

## Changes Made

### Improved TTS with Better Diagnostics
**File:** `frontend/src/components/reading/WordPopup.tsx`

**Improvements:**
1. ✅ Added explicit voice selection for Chinese (zh-CN)
2. ✅ Added comprehensive console logging to diagnose issues
3. ✅ Better error handling with specific error messages
4. ✅ Fallback voice detection

## How to Diagnose the Issue

### Step 1: Open Browser Console
1. Go to your app at http://localhost:5173/
2. Open browser DevTools (F12 or Right-click → Inspect)
3. Click on the **Console** tab

### Step 2: Click a Chinese Word and Try to Play Audio
1. Click on any Chinese word in an article
2. Click the speaker icon (🔊)
3. Watch the console for diagnostic messages

### What to Look For in Console:

#### ✅ Good - If you see:
```
Available voices: ["Microsoft Huihui - Chinese (Simplified, PRC) (zh-CN)", ...]
Selected voice: Microsoft Huihui - Chinese (Simplified, PRC) zh-CN
Speaking with 10 voices available
Speech started: 功能
Speech ended
```
**This means TTS is working!** If you still don't hear sound, check your system volume.

#### ❌ Problem - If you see:
```
No zh-CN voice found. Available languages: ["en-US", "en-GB", ...]
```
**This means you don't have Chinese voices installed.**

#### ❌ Problem - If you see:
```
Speech synthesis error: not-allowed
Speech synthesis not allowed - user may need to interact with page first
```
**This means browser blocked TTS.** Try clicking around the page first.

## Common Issues & Solutions

### Issue 1: No Chinese Voices Available

**Windows:**
1. Open **Settings** → **Time & Language** → **Language**
2. Click **Add a language**
3. Search for "Chinese (Simplified, China)" and add it
4. Click on the language → **Options** → **Speech**
5. Download the speech voice pack
6. Restart your browser

**macOS:**
1. Open **System Preferences** → **Accessibility** → **Spoken Content**
2. Click **System Voice** dropdown
3. Click **Customize...**
4. Find and download Chinese voices (e.g., "Ting-Ting")
5. Restart your browser

**Linux:**
1. Install espeak-ng: `sudo apt install espeak-ng`
2. Or use festival: `sudo apt install festival festvox-zh`
3. Browser support varies - Chrome/Chromium usually works best

**Chrome OS:**
- Chinese voices are typically pre-installed
- Check Settings → Languages → Speech

### Issue 2: Browser Compatibility

**Best browsers for TTS:**
- ✅ Chrome/Edge (Best support)
- ✅ Safari (Good support on macOS/iOS)
- ⚠️ Firefox (Limited voice selection)
- ❌ Some older browsers don't support Web Speech API

### Issue 3: Permission Issues

**If you see "not-allowed" error:**
1. Make sure you've interacted with the page (clicked something)
2. Check browser settings for microphone/audio permissions
3. Try clicking the speaker icon again

### Issue 4: No Sound Even With Voices Available

**Check system audio:**
1. Make sure system volume is not muted
2. Check browser tab is not muted (look for 🔇 on tab)
3. Try playing other audio on your system
4. Check if other websites' audio works

**Chrome-specific:**
1. Right-click on tab → Check if "Mute site" is enabled
2. Go to `chrome://settings/content/sound`
3. Make sure site isn't blocked

## Testing TTS Manually

You can test if Chinese TTS works in your browser by pasting this in the browser console:

```javascript
// Test Chinese TTS
const utterance = new SpeechSynthesisUtterance('你好');
utterance.lang = 'zh-CN';

// Log available voices
console.log('All voices:', speechSynthesis.getVoices().map(v => `${v.name} (${v.lang})`));

// Find Chinese voice
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

If this doesn't produce sound, the issue is with your browser/system, not the app.

## Alternative Solutions

### Online TTS Services
If local TTS doesn't work, you could integrate an online service:
- Google Cloud Text-to-Speech API
- Microsoft Azure Speech Service
- Amazon Polly

Note: These require API keys and may have costs.

### Browser Extensions
Some browser extensions provide better TTS:
- **Speechify** (Chrome/Edge)
- **Read Aloud** (Chrome/Firefox)

## How the Fix Helps

The updated code now:
1. **Explicitly selects Chinese voices** when available
2. **Logs all available voices** so you can see what's on your system
3. **Shows clear error messages** when voices are missing
4. **Handles edge cases** better (permissions, network errors, etc.)

## Need More Help?

If TTS still doesn't work after trying these steps:

1. **Share console output** - Copy the console messages when clicking speaker
2. **Share browser info** - What browser and version?
3. **Share OS info** - Windows/Mac/Linux and version?
4. **Share available voices** - Run the test script above and share the output

## Summary

The TTS functionality should now work if:
- ✅ You have Chinese voices installed on your system
- ✅ Your browser supports Web Speech API (Chrome/Edge recommended)
- ✅ Audio permissions are granted

**Most common fix:** Install Chinese speech voices on your operating system, then restart your browser.
