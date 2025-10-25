#!/bin/bash

# Quick Fix for API_KEY Error
echo "🔧 Quick Fix for SlangSupport API_KEY Error"
echo "=========================================="

# Check if Vercel CLI is available
if ! command -v vercel &> /dev/null; then
    echo "📦 Using npx vercel..."
    VERCEL_CMD="npx vercel"
else
    VERCEL_CMD="vercel"
fi

echo ""
echo "🔐 Step 1: Login to Vercel (if not already logged in)"
$VERCEL_CMD login

echo ""
echo "🔧 Step 2: Link to your project"
$VERCEL_CMD link

echo ""
echo "📝 Step 3: Set Environment Variables"
echo "Setting GEMINI_API_KEY..."
echo "Enter your actual Gemini API key when prompted:"
$VERCEL_CMD env add GEMINI_API_KEY production

echo ""
echo "Setting VITE_API_URL..."
echo "http://localhost:3001/api" | $VERCEL_CMD env add VITE_API_URL production

echo ""
echo "Setting VITE_DEBUG..."
echo "false" | $VERCEL_CMD env add VITE_DEBUG production

echo ""
echo "🚀 Step 4: Redeploy with new environment variables"
$VERCEL_CMD --prod

echo ""
echo "✅ DONE! Your API_KEY error should now be fixed!"
echo ""
echo "🧪 Test your app:"
echo "1. Visit your Vercel URL"
echo "2. Check browser console (should be no errors)"
echo "3. Test the quiz functionality"
echo ""
echo "If you still see errors, try:"
echo "1. Hard refresh (Ctrl+F5 or Cmd+Shift+R)"
echo "2. Clear browser cache"
echo "3. Check Vercel dashboard for deployment status"
