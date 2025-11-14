# Backend Deployment Guide - CORS Proxy Solutions

This guide provides three free options to deploy backend proxy functions that solve CORS issues for:
- **Google Translate TTS API** (text-to-speech pronunciation)
- **Jisho.org API** (Japanese dictionary lookups)

---

## ⭐ Option 1: Supabase Edge Functions (Recommended)

**Why Supabase?**
- ✅ You're already using Supabase for auth & database
- ✅ Free tier: 500K invocations/month
- ✅ Global edge deployment
- ✅ Integrated with your existing setup

### Prerequisites

1. **Install Supabase CLI:**

```bash
# Windows (using npm)
npm install -g supabase

# Or using Scoop
scoop install supabase

# Verify installation
supabase --version
```

2. **Login to Supabase:**

```bash
supabase login
```

This will open a browser window to authenticate.

### Deployment Steps

#### Step 1: Link Your Project

```bash
cd frontend
supabase link --project-ref YOUR_PROJECT_REF
```

**To find your project ref:**
1. Go to https://supabase.com/dashboard
2. Select your project
3. The URL will be: `https://supabase.com/dashboard/project/YOUR_PROJECT_REF`

#### Step 2: Deploy Both Functions

```bash
# Deploy TTS proxy function
supabase functions deploy tts

# Deploy Jisho proxy function
supabase functions deploy jisho
```

#### Step 3: Verify Deployment

Test the functions:

```bash
# Test TTS function
curl "YOUR_SUPABASE_URL/functions/v1/tts?text=你好&lang=zh-CN" \
  -H "Authorization: Bearer YOUR_ANON_KEY"

# Test Jisho function
curl "YOUR_SUPABASE_URL/functions/v1/jisho?keyword=hello" \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

Replace:
- `YOUR_SUPABASE_URL` with your Supabase project URL (from `.env.local`)
- `YOUR_ANON_KEY` with your anon key (from `.env.local`)

### ✅ Done!

The frontend code already tries Supabase Edge Functions first. No code changes needed!

**Console logs will show:**
```
Using Supabase Edge Function for Jisho API
Supabase TTS started: 你好
```

---

## 🚀 Option 2: Vercel Edge Functions

**Why Vercel?**
- ✅ Perfect if you're deploying to Vercel
- ✅ Free tier: Unlimited invocations
- ✅ Zero configuration needed
- ✅ Automatic deployment on git push

### Prerequisites

1. **Install Vercel CLI (optional):**

```bash
npm install -g vercel
```

2. **Vercel account** (free): https://vercel.com/signup

### Deployment Steps

#### Option A: Deploy via GitHub (Recommended)

1. **Push your code to GitHub:**

```bash
git add .
git commit -m "Add Vercel Edge Functions for CORS proxies"
git push origin main
```

2. **Connect to Vercel:**
   - Go to https://vercel.com/new
   - Import your GitHub repository
   - Select the **root directory** (not `frontend/`)
   - Click "Deploy"

3. **That's it!** Vercel automatically detects functions in the `/api` folder.

#### Option B: Deploy via CLI

```bash
# From project root
vercel

# Follow the prompts:
# - Link to existing project? No
# - Project name? inkline
# - Directory? ./
# - Override settings? No

# Deploy to production
vercel --prod
```

### Verify Deployment

Visit:
- `https://your-project.vercel.app/api/tts?text=你好&lang=zh-CN`
- `https://your-project.vercel.app/api/jisho?keyword=hello`

You should get audio (for TTS) or JSON data (for Jisho).

### ✅ Done!

The frontend code automatically tries `/api/jisho` when Supabase is unavailable.

**Console logs will show:**
```
Using Vercel Edge Function for Jisho API
```

---

## ⚡ Option 3: Cloudflare Workers

**Why Cloudflare?**
- ✅ Extremely generous free tier (100K requests/day)
- ✅ Fastest global performance
- ✅ Easy to deploy

### Prerequisites

1. **Install Wrangler CLI:**

```bash
npm install -g wrangler
```

2. **Login to Cloudflare:**

```bash
wrangler login
```

This opens a browser for authentication.

3. **Cloudflare account** (free): https://dash.cloudflare.com/sign-up

### Deployment Steps

#### Step 1: Deploy TTS Worker

```bash
cd cloudflare-workers

# Deploy TTS proxy
wrangler deploy tts-proxy.js --name inkline-tts
```

Copy the deployed URL (e.g., `https://inkline-tts.your-username.workers.dev`)

#### Step 2: Deploy Jisho Worker

```bash
# Deploy Jisho proxy
wrangler deploy jisho-proxy.js --name inkline-jisho
```

Copy the deployed URL (e.g., `https://inkline-jisho.your-username.workers.dev`)

#### Step 3: Update Frontend Code

Create a file `frontend/.env.local` and add:

```env
VITE_CLOUDFLARE_TTS_URL=https://inkline-tts.your-username.workers.dev
VITE_CLOUDFLARE_JISHO_URL=https://inkline-jisho.your-username.workers.dev
```

Then update `frontend/src/lib/dictionaries/jisho.ts` and `frontend/src/components/reading/WordPopup.tsx` to try Cloudflare Workers as a fallback.

### Optional: Custom Domain

1. Go to Cloudflare Dashboard → Workers
2. Select your worker
3. Click "Triggers" → "Add Custom Domain"
4. Enter your domain (e.g., `api.yourdomain.com`)

Now you can use:
- `https://api.yourdomain.com/tts`
- `https://api.yourdomain.com/jisho`

### Verify Deployment

Visit:
- `https://inkline-tts.your-username.workers.dev?text=你好&lang=zh-CN`
- `https://inkline-jisho.your-username.workers.dev?keyword=hello`

---

## 🎯 Which Option Should I Choose?

### Choose **Supabase** if:
- ✅ You want the simplest setup (already using Supabase)
- ✅ You don't need custom domains
- ✅ 500K requests/month is enough

### Choose **Vercel** if:
- ✅ You're deploying your frontend to Vercel
- ✅ You want zero backend configuration
- ✅ You need unlimited requests
- ✅ You want automatic deployments on git push

### Choose **Cloudflare Workers** if:
- ✅ You need the best global performance
- ✅ You want the most generous free tier (100K/day)
- ✅ You might add custom domains later

---

## 📊 Feature Comparison

| Feature | Supabase | Vercel | Cloudflare |
|---------|----------|--------|------------|
| **Free Tier** | 500K/month | Unlimited | 100K/day (3M/month) |
| **Setup Difficulty** | Easy | Easiest | Medium |
| **Global Edge** | ✅ | ✅ | ✅ |
| **Custom Domain** | ❌ | ✅ | ✅ |
| **Auto Deploy** | CLI | Git Push | CLI |
| **Cold Start** | ~50ms | ~0ms | ~0ms |

---

## 🧪 Testing After Deployment

### Test TTS Function

```bash
# Open browser console on your app
# Click speaker icon on any word
# Check console logs for:
"Using Supabase Edge Function for TTS"
# or
"Using Vercel Edge Function for TTS"
```

### Test Jisho Function

```bash
# Click any Japanese word
# Check console logs for:
"Using Supabase Edge Function for Jisho API"
# or
"Using Vercel Edge Function for Jisho API"
```

### Expected Behavior

**Before deployment:**
```
Using third-party CORS proxy (consider deploying backend proxy)
```

**After deployment:**
```
Using Supabase Edge Function for Jisho API
Supabase TTS started: 你好
```

---

## 🔧 Troubleshooting

### Supabase: "Function not found"

```bash
# Re-link project
supabase link --project-ref YOUR_PROJECT_REF

# Re-deploy
supabase functions deploy tts
supabase functions deploy jisho
```

### Vercel: "404 Not Found"

1. Check that `/api` folder exists in your repository root
2. Verify deployment logs in Vercel dashboard
3. Ensure functions use `export const config = { runtime: 'edge' }`

### Cloudflare: "Worker exceeded CPU time limit"

This shouldn't happen with our simple proxies. If it does:
1. Check Cloudflare dashboard for error logs
2. Ensure you're on the Free plan (not Workers Free)

### CORS Still Not Working

1. **Check browser console** for exact error
2. **Verify environment variables** in `.env.local`:
   ```
   VITE_SUPABASE_URL=https://xxx.supabase.co
   VITE_SUPABASE_ANON_KEY=xxx
   ```
3. **Clear browser cache** and hard reload (Ctrl+Shift+R)
4. **Test function directly** with curl (see verification steps above)

---

## 💰 Cost Estimates

### Supabase (Free Tier)
- **500,000 invocations/month** = FREE
- If exceeded: $0.000002 per invocation
- **Estimated monthly cost for 1M requests:** $1

### Vercel (Hobby Plan)
- **Unlimited invocations** = FREE
- **100GB bandwidth/month** = FREE
- If exceeded: Upgrade to Pro ($20/month)

### Cloudflare (Free Plan)
- **100,000 requests/day** = FREE
- **3,000,000 requests/month** = FREE
- If exceeded: $0.50 per million requests

**Verdict:** All three options are FREE for typical usage! 🎉

---

## 📚 Next Steps

After deploying:

1. **Test thoroughly** - Click words, use TTS, verify no CORS errors
2. **Monitor usage** - Check your dashboard after a week
3. **Remove third-party proxies** - Once confirmed working, you can simplify the fallback logic
4. **Add caching** - Consider adding Redis/KV storage for frequently requested words

---

## 🆘 Need Help?

- **Supabase Docs:** https://supabase.com/docs/guides/functions
- **Vercel Docs:** https://vercel.com/docs/functions/edge-functions
- **Cloudflare Docs:** https://developers.cloudflare.com/workers/

---

**Good luck! You're eliminating CORS issues like a pro! 🚀**
