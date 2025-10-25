#!/bin/bash

# SlangSupport Automated Vercel Deployment
# This script fully automates the Vercel deployment process

echo "🚀 SlangSupport Automated Vercel Deployment"
echo "==========================================="

# Function to prompt for input with default
prompt_with_default() {
    local prompt="$1"
    local default="$2"
    local var_name="$3"
    
    echo -n "$prompt [$default]: "
    read input
    eval "$var_name=\${input:-$default}"
}

# Check if Vercel CLI is available
if ! command -v vercel &> /dev/null; then
    echo "📦 Vercel CLI not found, using npx..."
    VERCEL_CMD="npx vercel"
else
    VERCEL_CMD="vercel"
fi

echo ""
echo "🔐 Setting up Vercel authentication..."
echo "Please login to Vercel when prompted:"
$VERCEL_CMD login

echo ""
echo "🔧 Linking project to Vercel..."
$VERCEL_CMD link --yes

echo ""
echo "📝 Setting up environment variables..."

# Get user input for API key
prompt_with_default "Enter your Gemini API key" "" GEMINI_API_KEY
if [ -z "$GEMINI_API_KEY" ]; then
    echo "⚠️  Warning: No Gemini API key provided. You can set it later in Vercel dashboard."
    GEMINI_API_KEY="your-gemini-api-key-here"
fi

# Set environment variables
echo "Setting VITE_API_URL..."
echo "http://localhost:3001/api" | $VERCEL_CMD env add VITE_API_URL production

echo "Setting GEMINI_API_KEY..."
echo "$GEMINI_API_KEY" | $VERCEL_CMD env add GEMINI_API_KEY production

echo "Setting VITE_DEBUG..."
echo "false" | $VERCEL_CMD env add VITE_DEBUG production

echo ""
echo "🚀 Deploying to production..."
$VERCEL_CMD --prod

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📋 Your SlangSupport app is now live!"
echo "🔗 Check your Vercel dashboard for the deployment URL"
echo ""
echo "🧪 Test these features:"
echo "   - Search for slang terms"
echo "   - Take the quiz (scores should be accurate!)"
echo "   - Check browser console for errors"
echo "   - Verify styling looks correct"
echo ""
echo "🔧 To update environment variables later:"
echo "   $VERCEL_CMD env add VARIABLE_NAME production"
echo ""
echo "📊 To view logs:"
echo "   $VERCEL_CMD logs"
