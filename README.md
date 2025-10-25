# SlangSupport - AI-Powered Slang Dictionary

A modern, feature-rich slang dictionary powered by Google's Gemini AI with voice input, favorites, search history, and interactive quiz features.

## Features

- 🎤 **Voice Input** - Speech recognition for hands-free searching
- ⭐ **Favorites System** - Save and organize your favorite slang terms
- 📚 **Search History** - Track your slang learning journey
- 🏷️ **Categories** - Organized by Internet, Gaming, Gen Z, AAVE, and more
- 🧠 **Quiz Mode** - Test your slang knowledge with interactive quizzes
- 📱 **Mobile Responsive** - Optimized for all devices
- 🌙 **Dark Theme** - Modern, easy-on-the-eyes interface
- 🔊 **Text-to-Speech** - Hear pronunciations of slang terms
- 📊 **Statistics** - Track your learning progress

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS
- **AI**: Google Gemini API
- **Voice**: Web Speech API
- **Storage**: localStorage for data persistence

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Google Gemini API key

### Installation

1. Clone the repository
```bash
git clone <your-repo-url>
cd slangsupport
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env.local
# Add your VITE_API_URL and other variables
```

4. Start development server
```bash
npm run dev
```

### Environment Variables

Create a `.env.local` file with:

```env
VITE_API_URL=http://localhost:3002/api
```

For production, set these in your Vercel dashboard:
- `VITE_API_URL` - Your backend API URL

## Deployment

### Vercel (Recommended)

1. Install Vercel CLI
```bash
npm i -g vercel
```

2. Deploy
```bash
vercel
```

3. Set environment variables in Vercel dashboard

### Manual Build

```bash
npm run build
# Deploy the 'dist' folder to your hosting provider
```

## Project Structure

```
slangsupport/
├── components/          # React components
│   ├── CategoryBadge.tsx
│   ├── Favorites.tsx
│   ├── Quiz.tsx
│   ├── SearchHistory.tsx
│   ├── Settings.tsx
│   ├── Toast.tsx
│   ├── WordOfTheDay.tsx
│   └── RelatedTerms.tsx
├── services/           # API services
│   ├── geminiService.ts
│   └── simpleApiService.ts
├── utils/              # Utility functions
│   ├── storage.ts
│   └── dateUtils.ts
├── types.ts            # TypeScript definitions
├── App.tsx             # Main application
└── package.json
```

## API Integration

The app integrates with a backend API for:
- Slang definitions via Gemini AI
- Text-to-speech generation
- User authentication (future)
- Data persistence (future)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- Create an issue on GitHub
- Check the documentation
- Contact the development team

---

Built with ❤️ using React, TypeScript, and Google Gemini AI