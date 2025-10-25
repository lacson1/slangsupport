#!/bin/bash

# SlangSupport Vercel Deployment Script
echo "🚀 SlangSupport Vercel Deployment"
echo "================================"

# Check if Vercel CLI is available
if ! command -v vercel &> /dev/null; then
    echo "📦 Using npx vercel..."
    VERCEL_CMD="npx vercel"
else
    VERCEL_CMD="vercel"
fi

echo ""
echo "🔐 Step 1: Login to Vercel"
echo "Please login when prompted..."
$VERCEL_CMD login

echo ""
echo "🔧 Step 2: Link Project"
echo "Linking to your existing SlangSupport project..."
$VERCEL_CMD link

echo ""
echo "🚀 Step 3: Deploy to Production"
echo "Deploying your SlangSupport app..."
$VERCEL_CMD --prod

echo ""
echo "✅ Deployment Complete!"
echo "======================"
echo ""
echo "🎉 Your SlangSupport app is now live!"
echo ""
echo "📋 Next Steps:"
echo "1. Visit your deployed URL"
echo "2. Test the app functionality"
echo "3. Clear browser cache if needed"
echo "4. Enjoy your offline slang dictionary!"
echo ""
echo "🔧 Management Commands:"
echo "- View logs: $VERCEL_CMD logs"
echo "- Redeploy: $VERCEL_CMD --prod"
echo "- Check status: $VERCEL_CMD ls"
