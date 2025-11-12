# Helpful Commands Reference

Quick reference for deploying and testing your CORS proxy backends.

---

## 🔧 Prerequisites Installation

### Supabase CLI
```bash
npm install -g supabase
```

### Vercel CLI
```bash
npm install -g vercel
```

### Cloudflare Wrangler
```bash
npm install -g wrangler
```

---

## 🚀 Deployment Commands

### Supabase Edge Functions

```bash
# Login (first time only)
supabase login

# Link to your project (first time only)
cd frontend
supabase link --project-ref YOUR_PROJECT_REF

# Deploy TTS function
supabase functions deploy tts

# Deploy Jisho function
supabase functions deploy jisho

# Deploy both at once
supabase functions deploy tts && supabase functions deploy jisho

# List deployed functions
supabase functions list

# View function logs (for debugging)
supabase functions logs tts
supabase functions logs jisho
```

### Vercel Edge Functions

```bash
# Deploy (from project root)
vercel

# Deploy to production
vercel --prod

# View deployment logs
vercel logs

# List deployments
vercel ls

# Remove deployment
vercel rm [deployment-url]
```

### Cloudflare Workers

```bash
# Login (first time only)
wrangler login

# Deploy TTS worker
cd cloudflare-workers
wrangler deploy tts-proxy.js --name inkline-tts

# Deploy Jisho worker
wrangler deploy jisho-proxy.js --name inkline-jisho

# View worker logs (tail)
wrangler tail inkline-tts
wrangler tail inkline-jisho

# Delete worker
wrangler delete inkline-tts
wrangler delete inkline-jisho
```

---

## 🧪 Testing Commands

### Automated Testing

```bash
# Windows
test-backend.bat

# Mac/Linux
chmod +x test-backend.sh
./test-backend.sh
```

### Manual Testing with curl

**Test Supabase TTS:**
```bash
curl "https://YOUR_PROJECT.supabase.co/functions/v1/tts?text=你好&lang=zh-CN" \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

**Test Supabase Jisho:**
```bash
curl "https://YOUR_PROJECT.supabase.co/functions/v1/jisho?keyword=hello" \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

**Test Vercel TTS:**
```bash
curl "https://your-project.vercel.app/api/tts?text=你好&lang=zh-CN"
```

**Test Vercel Jisho:**
```bash
curl "https://your-project.vercel.app/api/jisho?keyword=hello"
```

**Test Cloudflare TTS:**
```bash
curl "https://inkline-tts.your-username.workers.dev?text=你好&lang=zh-CN"
```

**Test Cloudflare Jisho:**
```bash
curl "https://inkline-jisho.your-username.workers.dev?keyword=hello"
```

### Browser Testing

```bash
# Start dev server
cd frontend
npm run dev

# Then open http://localhost:5173
# Open browser console (F12)
# Click any Japanese word
# Look for: "Using Supabase Edge Function for Jisho API"
```

---

## 📊 Monitoring Commands

### Supabase

```bash
# View function logs
supabase functions logs tts --tail

# View function metrics (in dashboard)
# Go to: https://supabase.com/dashboard/project/YOUR_PROJECT/functions
```

### Vercel

```bash
# View recent logs
vercel logs

# Stream logs in real-time
vercel logs --follow

# View analytics
# Go to: https://vercel.com/your-username/your-project/analytics
```

### Cloudflare

```bash
# Stream logs in real-time
wrangler tail inkline-tts
wrangler tail inkline-jisho

# View analytics (in dashboard)
# Go to: https://dash.cloudflare.com → Workers → Analytics
```

---

## 🔄 Update/Redeploy Commands

### Supabase

```bash
# After editing function code
cd frontend
supabase functions deploy tts
supabase functions deploy jisho
```

### Vercel

```bash
# After editing function code
vercel --prod

# Or let GitHub auto-deploy
git push origin main
```

### Cloudflare

```bash
# After editing worker code
cd cloudflare-workers
wrangler deploy tts-proxy.js --name inkline-tts
wrangler deploy jisho-proxy.js --name inkline-jisho
```

---

## 🗑️ Cleanup Commands

### Supabase

```bash
# Delete function
supabase functions delete tts
supabase functions delete jisho
```

### Vercel

```bash
# Remove project
vercel rm your-project
```

### Cloudflare

```bash
# Delete worker
wrangler delete inkline-tts
wrangler delete inkline-jisho
```

---

## 🔍 Debugging Commands

### Supabase

```bash
# Test function locally (requires Docker)
supabase start
supabase functions serve tts --env-file ./frontend/.env.local

# Test local function
curl http://localhost:54321/functions/v1/tts?text=你好&lang=zh-CN
```

### Vercel

```bash
# Test locally
vercel dev

# Test local function
curl http://localhost:3000/api/tts?text=你好&lang=zh-CN
```

### Cloudflare

```bash
# Test locally
cd cloudflare-workers
wrangler dev tts-proxy.js

# Test local worker
curl http://localhost:8787?text=你好&lang=zh-CN
```

---

## 📝 Environment Variables

### Check current values

```bash
# View .env.local
cat frontend/.env.local

# Or on Windows
type frontend\.env.local
```

### Required variables

```env
# Supabase (required for Supabase option)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Vercel (optional, auto-detected)
VITE_VERCEL_URL=your-project.vercel.app

# Cloudflare (optional)
VITE_CLOUDFLARE_TTS_URL=https://inkline-tts.your-username.workers.dev
VITE_CLOUDFLARE_JISHO_URL=https://inkline-jisho.your-username.workers.dev
```

---

## 🎯 Common Workflows

### Initial Deployment

```bash
# 1. Choose platform (e.g., Supabase)
npm install -g supabase

# 2. Login
supabase login

# 3. Link project
cd frontend
supabase link --project-ref YOUR_REF

# 4. Deploy
supabase functions deploy tts
supabase functions deploy jisho

# 5. Test
cd ..
./test-backend.bat  # or .sh on Mac/Linux
```

### Update After Code Changes

```bash
# 1. Edit function code
# 2. Redeploy
supabase functions deploy tts

# 3. Test
./test-backend.bat
```

### Switch Platforms

```bash
# From Supabase to Vercel
vercel --prod

# From Vercel to Cloudflare
cd cloudflare-workers
wrangler deploy tts-proxy.js --name inkline-tts
wrangler deploy jisho-proxy.js --name inkline-jisho
```

---

## 📚 Help Commands

```bash
# Supabase help
supabase --help
supabase functions --help

# Vercel help
vercel --help

# Cloudflare help
wrangler --help
```

---

## 🆘 Troubleshooting Commands

### Supabase: "Not logged in"

```bash
supabase login
```

### Supabase: "Project not linked"

```bash
cd frontend
supabase link --project-ref YOUR_REF
```

### Vercel: "Not authorized"

```bash
vercel login
```

### Cloudflare: "Not authenticated"

```bash
wrangler login
```

### General: "Command not found"

```bash
# Reinstall CLI
npm install -g supabase
npm install -g vercel
npm install -g wrangler
```

---

**Keep this file handy for quick reference! 📖**
