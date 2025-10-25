# Environment Variables for SlangSupport

## Development (.env.local)

```env
# Backend API URL (for development) - Optional
VITE_API_URL=http://localhost:3001/api

# Optional: Enable debug mode
VITE_DEBUG=true
```

## Production (Vercel Environment Variables)

Set these in your Vercel dashboard under Project Settings > Environment Variables:

```env
# Backend API URL (for production) - Optional
VITE_API_URL=https://your-backend-api.vercel.app/api

# Optional: Enable debug mode
VITE_DEBUG=false
```

## No External API Keys Required!

SlangSupport now uses built-in mock data, so you don't need to set up any external API keys like Gemini. The app works completely offline with a comprehensive database of slang terms.

## How to Set Environment Variables in Vercel

1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings > Environment Variables
4. Add each variable with its value
5. Make sure to set them for Production, Preview, and Development environments

## Security Notes

- Never commit `.env` files to version control
- Use strong, unique values for secrets
- Rotate API keys regularly (if using external APIs)
- Use different keys for development and production
