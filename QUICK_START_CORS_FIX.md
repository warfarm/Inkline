# Quick Start: Fix CORS Issues in 5 Minutes

Choose your deployment platform and follow the steps below.

---

## 🎯 Supabase (Recommended - Fastest Setup)

### Step 1: Install Supabase CLI

```bash
npm install -g supabase
```

### Step 2: Login

```bash
supabase login
```

### Step 3: Link Your Project

```bash
cd frontend
supabase link --project-ref YOUR_PROJECT_REF
```

💡 **Find your project ref:** Go to your Supabase dashboard URL: `https://supabase.com/dashboard/project/[THIS_IS_YOUR_REF]`

### Step 4: Deploy Functions

```bash
supabase functions deploy tts
supabase functions deploy jisho
```

### ✅ Done!

Test by clicking any word in your app. Check the console:
```
Using Supabase Edge Function for Jisho API ✅
```

---

## 🚀 Vercel (Zero Config)

### If you're already using Vercel:

1. **Push your code:**
   ```bash
   git add .
   git commit -m "Add CORS proxy functions"
   git push
   ```

2. **That's it!** Vercel auto-deploys functions in `/api` folder.

### If you're NOT using Vercel yet:

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel
   ```

3. **Follow the prompts**, then:
   ```bash
   vercel --prod
   ```

### ✅ Done!

Your functions are live at:
- `https://your-project.vercel.app/api/tts`
- `https://your-project.vercel.app/api/jisho`

---

## ⚡ Cloudflare Workers

### Step 1: Install Wrangler

```bash
npm install -g wrangler
```

### Step 2: Login

```bash
wrangler login
```

### Step 3: Deploy

```bash
cd cloudflare-workers
wrangler deploy tts-proxy.js --name inkline-tts
wrangler deploy jisho-proxy.js --name inkline-jisho
```

### Step 4: Update .env.local

Copy the worker URLs from the terminal output and add to `frontend/.env.local`:

```env
VITE_CLOUDFLARE_TTS_URL=https://inkline-tts.YOUR_USERNAME.workers.dev
VITE_CLOUDFLARE_JISHO_URL=https://inkline-jisho.YOUR_USERNAME.workers.dev
```

### ✅ Done!

---

## 🧪 Test Your Deployment

### Browser Test

1. Open your app: `npm run dev`
2. Open browser console (F12)
3. Click any Japanese word
4. Look for this in console:

**✅ Success:**
```
Using Supabase Edge Function for Jisho API
```

**❌ Still using fallback:**
```
Using third-party CORS proxy (consider deploying backend proxy)
```

### Command Line Test

**Test Supabase:**
```bash
curl "YOUR_SUPABASE_URL/functions/v1/jisho?keyword=hello" \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

**Test Vercel:**
```bash
curl "https://your-project.vercel.app/api/jisho?keyword=hello"
```

**Test Cloudflare:**
```bash
curl "https://inkline-jisho.YOUR_USERNAME.workers.dev?keyword=hello"
```

---

## 🎊 Success Checklist

After deployment, verify:

- ✅ Console shows "Using [Platform] Edge Function"
- ✅ No CORS errors in browser console
- ✅ Japanese words show definitions instantly
- ✅ TTS (speaker icon) works without errors
- ✅ No "All CORS proxies failed" errors

---

## 💡 Pro Tips

1. **Start with Supabase** - You're already using it, so it's the easiest
2. **Monitor usage** - Check your dashboard after a few days
3. **Add caching later** - For frequently requested words
4. **Keep fallbacks** - The code gracefully degrades if backend is down

---

## 🆘 Troubleshooting

### "Function not found"
```bash
# Re-deploy
supabase functions deploy tts
supabase functions deploy jisho
```

### "CORS error" persists
1. Check `.env.local` has correct `VITE_SUPABASE_URL`
2. Hard reload browser (Ctrl+Shift+R)
3. Check browser console for exact error

### "401 Unauthorized"
- Verify `VITE_SUPABASE_ANON_KEY` in `.env.local`
- Check Supabase dashboard → API → Project API keys

---

## 📖 Full Documentation

See `BACKEND_DEPLOYMENT_GUIDE.md` for:
- Detailed explanations
- Advanced configurations
- Custom domain setup
- Cost comparisons
- Monitoring and analytics

---

**Ready to deploy? Pick one option above and you'll be CORS-free in 5 minutes! 🚀**
