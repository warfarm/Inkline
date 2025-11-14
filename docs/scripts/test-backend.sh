#!/bin/bash

# Backend Proxy Test Script
# Tests all deployed CORS proxy functions

echo "🧪 Testing Backend Proxy Functions..."
echo ""

# Load environment variables
if [ -f "frontend/.env.local" ]; then
    export $(cat frontend/.env.local | grep -v '^#' | xargs)
fi

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
PASSED=0
FAILED=0

# Function to test an endpoint
test_endpoint() {
    local name=$1
    local url=$2
    local auth_header=$3

    echo -n "Testing $name... "

    if [ -n "$auth_header" ]; then
        response=$(curl -s -w "\n%{http_code}" "$url" -H "$auth_header" 2>&1)
    else
        response=$(curl -s -w "\n%{http_code}" "$url" 2>&1)
    fi

    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)

    if [ "$http_code" == "200" ]; then
        echo -e "${GREEN}✅ PASSED${NC} (HTTP $http_code)"
        PASSED=$((PASSED + 1))
        return 0
    else
        echo -e "${RED}❌ FAILED${NC} (HTTP $http_code)"
        echo "   Response: $body"
        FAILED=$((FAILED + 1))
        return 1
    fi
}

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  SUPABASE EDGE FUNCTIONS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -n "$VITE_SUPABASE_URL" ] && [ -n "$VITE_SUPABASE_ANON_KEY" ]; then
    # Test Jisho function
    test_endpoint \
        "Jisho API" \
        "${VITE_SUPABASE_URL}/functions/v1/jisho?keyword=hello" \
        "Authorization: Bearer ${VITE_SUPABASE_ANON_KEY}"

    # Test TTS function
    test_endpoint \
        "TTS API" \
        "${VITE_SUPABASE_URL}/functions/v1/tts?text=你好&lang=zh-CN" \
        "Authorization: Bearer ${VITE_SUPABASE_ANON_KEY}"
else
    echo -e "${YELLOW}⚠️  Skipped (missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY)${NC}"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  VERCEL EDGE FUNCTIONS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -n "$VITE_VERCEL_URL" ]; then
    # Test Jisho function
    test_endpoint \
        "Jisho API" \
        "https://${VITE_VERCEL_URL}/api/jisho?keyword=hello"

    # Test TTS function
    test_endpoint \
        "TTS API" \
        "https://${VITE_VERCEL_URL}/api/tts?text=你好&lang=zh-CN"
else
    echo -e "${YELLOW}⚠️  Skipped (missing VITE_VERCEL_URL in .env.local)${NC}"
    echo "   To test: Add VITE_VERCEL_URL=your-project.vercel.app"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  CLOUDFLARE WORKERS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -n "$VITE_CLOUDFLARE_JISHO_URL" ]; then
    # Test Jisho worker
    test_endpoint \
        "Jisho API" \
        "${VITE_CLOUDFLARE_JISHO_URL}?keyword=hello"
else
    echo -e "${YELLOW}⚠️  Skipped (missing VITE_CLOUDFLARE_JISHO_URL)${NC}"
fi

if [ -n "$VITE_CLOUDFLARE_TTS_URL" ]; then
    # Test TTS worker
    test_endpoint \
        "TTS API" \
        "${VITE_CLOUDFLARE_TTS_URL}?text=你好&lang=zh-CN"
else
    echo -e "${YELLOW}⚠️  Skipped (missing VITE_CLOUDFLARE_TTS_URL)${NC}"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  TEST SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ Passed: $PASSED${NC}"
echo -e "${RED}❌ Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ] && [ $PASSED -gt 0 ]; then
    echo -e "${GREEN}🎉 All tests passed! CORS issues are fixed!${NC}"
    exit 0
elif [ $PASSED -eq 0 ]; then
    echo -e "${YELLOW}⚠️  No functions tested. Deploy at least one backend option.${NC}"
    echo ""
    echo "Quick start:"
    echo "  1. For Supabase: supabase functions deploy tts"
    echo "  2. For Vercel: vercel --prod"
    echo "  3. For Cloudflare: wrangler deploy tts-proxy.js"
    exit 1
else
    echo -e "${YELLOW}⚠️  Some tests failed. Check the errors above.${NC}"
    exit 1
fi
