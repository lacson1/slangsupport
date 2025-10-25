#!/bin/bash

# One-Command SlangSupport Deployment
# Run this script to automatically deploy to Vercel

echo "🚀 SlangSupport One-Command Deployment"
echo "===================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the SlangSupport project root"
    exit 1
fi

# Check if Vercel CLI is available
if ! command -v vercel &> /dev/null; then
    echo "📦 Using npx vercel..."
    VERCEL_CMD="npx vercel"
else
    VERCEL_CMD="vercel"
fi

echo ""
echo "🔐 Step 1: Vercel Authentication"
echo "Please login to Vercel when prompted..."
$VERCEL_CMD login

echo ""
echo "🔧 Step 2: Project Setup"
$VERCEL_CMD link --yes

echo ""
echo "📝 Step 3: Environment Variables"
echo "Setting up production environment variables..."

# Set environment variables with defaults
echo "http://localhost:3001/api" | $VERCEL_CMD env add VITE_API_URL production
echo "your-gemini-api-key-here" | $VERCEL_CMD env add GEMINI_API_KEY production  
echo "false" | $VERCEL_CMD env add VITE_DEBUG production

echo ""
echo "🚀 Step 4: Production Deployment"
$VERCEL_CMD --prod

echo ""
echo "✅ DEPLOYMENT COMPLETE!"
echo "======================"
echo ""
echo "🎉 Your SlangSupport app is now live on Vercel!"
echo ""
echo "📋 IMPORTANT: Update your Gemini API key in Vercel dashboard:"
echo "   1. Go to vercel.com → Your Project → Settings → Environment Variables"
echo "   2. Edit GEMINI_API_KEY with your real API key"
echo "   3. Redeploy if needed"
echo ""
echo "🧪 Test your deployment:"
echo "   - Visit your Vercel URL"
echo "   - Test quiz functionality"
echo "   - Check browser console for errors"
echo ""
echo "🔧 Management commands:"
echo "   - View logs: $VERCEL_CMD logs"
echo "   - Redeploy: $VERCEL_CMD --prod"
echo "   - Add env var: $VERCEL_CMD env add VARIABLE_NAME production"
