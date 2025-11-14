@echo off
REM Backend Proxy Test Script for Windows
REM Tests all deployed CORS proxy functions

echo.
echo ============================================
echo   Testing Backend Proxy Functions
echo ============================================
echo.

REM Load environment variables from .env.local
if exist "frontend\.env.local" (
    for /f "usebackq tokens=1,2 delims==" %%a in ("frontend\.env.local") do (
        set %%a=%%b
    )
)

REM Test Supabase Edge Functions
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo   SUPABASE EDGE FUNCTIONS
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.

if defined VITE_SUPABASE_URL (
    if defined VITE_SUPABASE_ANON_KEY (
        echo Testing Jisho API...
        curl -s "%VITE_SUPABASE_URL%/functions/v1/jisho?keyword=hello" -H "Authorization: Bearer %VITE_SUPABASE_ANON_KEY%" > nul 2>&1
        if errorlevel 1 (
            echo [FAILED] Jisho API
        ) else (
            echo [PASSED] Jisho API
        )

        echo Testing TTS API...
        curl -s "%VITE_SUPABASE_URL%/functions/v1/tts?text=你好&lang=zh-CN" -H "Authorization: Bearer %VITE_SUPABASE_ANON_KEY%" > nul 2>&1
        if errorlevel 1 (
            echo [FAILED] TTS API
        ) else (
            echo [PASSED] TTS API
        )
    ) else (
        echo [SKIPPED] Missing VITE_SUPABASE_ANON_KEY
    )
) else (
    echo [SKIPPED] Missing VITE_SUPABASE_URL
)

echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo   VERCEL EDGE FUNCTIONS
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.

if defined VITE_VERCEL_URL (
    echo Testing Jisho API...
    curl -s "https://%VITE_VERCEL_URL%/api/jisho?keyword=hello" > nul 2>&1
    if errorlevel 1 (
        echo [FAILED] Jisho API
    ) else (
        echo [PASSED] Jisho API
    )

    echo Testing TTS API...
    curl -s "https://%VITE_VERCEL_URL%/api/tts?text=你好&lang=zh-CN" > nul 2>&1
    if errorlevel 1 (
        echo [FAILED] TTS API
    ) else (
        echo [PASSED] TTS API
    )
) else (
    echo [SKIPPED] Missing VITE_VERCEL_URL in .env.local
)

echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo   CLOUDFLARE WORKERS
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.

if defined VITE_CLOUDFLARE_JISHO_URL (
    echo Testing Jisho API...
    curl -s "%VITE_CLOUDFLARE_JISHO_URL%?keyword=hello" > nul 2>&1
    if errorlevel 1 (
        echo [FAILED] Jisho API
    ) else (
        echo [PASSED] Jisho API
    )
) else (
    echo [SKIPPED] Missing VITE_CLOUDFLARE_JISHO_URL
)

if defined VITE_CLOUDFLARE_TTS_URL (
    echo Testing TTS API...
    curl -s "%VITE_CLOUDFLARE_TTS_URL%?text=你好&lang=zh-CN" > nul 2>&1
    if errorlevel 1 (
        echo [FAILED] TTS API
    ) else (
        echo [PASSED] TTS API
    )
) else (
    echo [SKIPPED] Missing VITE_CLOUDFLARE_TTS_URL
)

echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo   Tests completed!
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo If you see SKIPPED messages, deploy a backend option:
echo   1. Supabase: supabase functions deploy tts
echo   2. Vercel: vercel --prod
echo   3. Cloudflare: wrangler deploy tts-proxy.js
echo.

pause
