#!/bin/bash

# SlangSupport Vercel Deployment Automation Script
# This script automates the Vercel deployment and environment variable setup

echo "🚀 SlangSupport Vercel Deployment Automation"
echo "=========================================="

# Check if Vercel CLI is available
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI locally..."
    npx vercel --version
fi

echo ""
echo "🔐 Setting up Vercel authentication..."
echo "You'll need to login to Vercel. Please follow the prompts:"
npx vercel login

echo ""
echo "🔧 Linking project to Vercel..."
npx vercel link

echo ""
echo "📝 Setting up environment variables..."

# Set environment variables
echo "Setting VITE_API_URL..."
npx vercel env add VITE_API_URL production
echo "Enter: http://localhost:3001/api"

echo ""
echo "Setting GEMINI_API_KEY..."
npx vercel env add GEMINI_API_KEY production
echo "Enter your actual Gemini API key"

echo ""
echo "Setting VITE_DEBUG..."
npx vercel env add VITE_DEBUG production
echo "Enter: false"

echo ""
echo "🚀 Deploying to production..."
npx vercel --prod

echo ""
echo "✅ Deployment complete!"
echo "Your SlangSupport app is now live on Vercel!"
echo ""
echo "📋 Next steps:"
echo "1. Visit your deployed URL"
echo "2. Test the quiz functionality"
echo "3. Verify no console errors"
echo "4. Check that styling is correct"
echo ""
echo "🔧 If you need to update environment variables later:"
echo "   npx vercel env add VARIABLE_NAME production"
echo ""
echo "📊 To view deployment logs:"
echo "   npx vercel logs"
