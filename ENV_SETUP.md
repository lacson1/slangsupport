# Environment Variables for SlangSupport

## Development (.env.local)

```env
# Backend API URL (for development)
VITE_API_URL=http://localhost:3001/api

# Optional: Enable debug mode
VITE_DEBUG=true
```

## Production (Vercel Environment Variables)

Set these in your Vercel dashboard under Project Settings > Environment Variables:

```env
# Backend API URL (for production)
VITE_API_URL=https://your-backend-api.vercel.app/api

# Optional: Enable debug mode
VITE_DEBUG=false
```

## Backend Environment Variables

If you're also deploying the backend, you'll need:

```env
# Gemini API Key
GEMINI_API_KEY=your_actual_gemini_api_key_here

# Database URL (if using database)
DATABASE_URL=your_database_connection_string

# JWT Secret (for authentication)
JWT_SECRET=your_jwt_secret_key

# Frontend URL (for CORS)
FRONTEND_URL=https://your-frontend.vercel.app
```

## How to Set Environment Variables in Vercel

1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings > Environment Variables
4. Add each variable with its value
5. Make sure to set them for Production, Preview, and Development environments

## Security Notes

- Never commit `.env` files to version control
- Use strong, unique values for secrets
- Rotate API keys regularly
- Use different keys for development and production
