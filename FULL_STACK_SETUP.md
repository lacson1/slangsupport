# 🚀 SlangSupport Full-Stack Setup Guide

## 📋 **What's Been Implemented**

### ✅ **Frontend Fixes**
- Fixed CSS inline style warnings
- Improved settings panel close functionality
- Added keyboard escape handler
- Better error handling and user feedback

### ✅ **Complete Backend API**
- **Express.js** server with TypeScript
- **Prisma ORM** with PostgreSQL database
- **JWT Authentication** system
- **Rate limiting** and security middleware
- **CORS** configuration for frontend
- **Comprehensive API endpoints** for all features

### ✅ **Database Schema**
- **Users** table with authentication
- **Search History** with timestamps
- **Favorites** system
- **Quiz Scores** tracking
- **User Preferences** management
- **Word of the Day** feature

### ✅ **API Endpoints**
- `/api/auth/*` - Authentication (register, login, profile)
- `/api/search/*` - Slang definitions and suggestions
- `/api/favorites/*` - Favorites management
- `/api/history/*` - Search history
- `/api/quiz/*` - Quiz scores and statistics
- `/api/preferences/*` - User preferences
- `/api/word-of-day/*` - Daily featured terms

## 🛠️ **Setup Instructions**

### **1. Backend Setup**

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Set up environment variables
cp env.example .env
# Edit .env with your actual values:
# - DATABASE_URL (PostgreSQL connection)
# - GEMINI_API_KEY (Google AI API key)
# - JWT_SECRET (strong secret key)

# Generate Prisma client
npx prisma generate

# Set up database
npx prisma db push

# Start development server
npm run dev
```

### **2. Frontend Setup**

```bash
# Navigate to root directory
cd ..

# Install dependencies (if not already done)
npm install

# Set environment variable for API
echo "VITE_API_URL=http://localhost:3001/api" > .env.local

# Start frontend
npm run dev
```

### **3. Database Setup (PostgreSQL)**

```bash
# Install PostgreSQL (if not already installed)
# macOS: brew install postgresql
# Ubuntu: sudo apt install postgresql

# Start PostgreSQL service
# macOS: brew services start postgresql
# Ubuntu: sudo systemctl start postgresql

# Create database
createdb slangsupport

# Update DATABASE_URL in backend/.env
# DATABASE_URL="postgresql://username:password@localhost:5432/slangsupport?schema=public"
```

## 🔧 **Environment Variables**

### **Backend (.env)**
```env
PORT=3001
NODE_ENV=development
DATABASE_URL="postgresql://username:password@localhost:5432/slangsupport?schema=public"
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
GEMINI_API_KEY=your_actual_gemini_api_key_here
FRONTEND_URL=http://localhost:3000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### **Frontend (.env.local)**
```env
VITE_API_URL=http://localhost:3001/api
```

## 🚀 **Running the Application**

### **Development Mode**
```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd ..
npm run dev
```

### **Production Build**
```bash
# Build backend
cd backend
npm run build

# Build frontend
cd ..
npm run build

# Start production backend
cd backend
npm start
```

## 📊 **Features Available**

### **🔐 Authentication**
- User registration and login
- JWT token-based authentication
- Profile management
- Password change functionality

### **🔍 Search & Definitions**
- AI-powered slang definitions via Gemini
- Search history tracking
- Popular and trending terms
- Related terms suggestions

### **⭐ Favorites System**
- Save favorite definitions
- Remove from favorites
- Clear all favorites
- Favorites count tracking

### **🧠 Quiz System**
- Interactive quiz with user's search history
- Score tracking and statistics
- High score management
- Quiz attempt counting

### **⚙️ User Preferences**
- Speech settings (auto-speak, rate)
- Display preferences (theme, show/hide panels)
- Data management (export/import)
- Statistics tracking

### **📅 Word of the Day**
- Daily featured slang terms
- Automatic generation
- Historical word tracking

## 🔒 **Security Features**

- **Helmet.js** for security headers
- **Rate limiting** to prevent abuse
- **CORS** configuration
- **JWT** authentication
- **Password hashing** with bcrypt
- **Input validation** with Joi
- **SQL injection** protection via Prisma

## 📈 **Performance Features**

- **Compression** middleware
- **Database indexing**
- **Pagination** for large datasets
- **Caching** strategies
- **Error handling** and logging

## 🧪 **Testing**

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd ..
npm test
```

## 📦 **Deployment**

### **Docker Deployment**
```bash
# Build and run with Docker Compose
docker-compose up --build
```

### **Manual Deployment**
1. Set up PostgreSQL database
2. Configure environment variables
3. Build and deploy backend
4. Build and deploy frontend
5. Set up reverse proxy (Nginx)

## 🐛 **Troubleshooting**

### **Common Issues**

1. **Database Connection Error**
   - Check PostgreSQL is running
   - Verify DATABASE_URL format
   - Ensure database exists

2. **CORS Errors**
   - Check FRONTEND_URL in backend/.env
   - Verify frontend is running on correct port

3. **Authentication Issues**
   - Check JWT_SECRET is set
   - Verify token is being sent in headers

4. **Gemini API Errors**
   - Verify GEMINI_API_KEY is valid
   - Check API quota and limits

## 📚 **API Documentation**

### **Authentication Endpoints**
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/password` - Change password

### **Search Endpoints**
- `POST /api/search` - Get slang definition
- `GET /api/search/suggestions` - Get popular terms
- `GET /api/search/trending` - Get trending terms

### **Favorites Endpoints**
- `GET /api/favorites` - Get user's favorites
- `POST /api/favorites` - Add to favorites
- `DELETE /api/favorites/:term` - Remove favorite
- `DELETE /api/favorites` - Clear all favorites

### **History Endpoints**
- `GET /api/history` - Get search history
- `DELETE /api/history/:id` - Remove from history
- `DELETE /api/history` - Clear history

### **Quiz Endpoints**
- `GET /api/quiz/scores` - Get quiz scores
- `POST /api/quiz/score` - Save quiz score
- `GET /api/quiz/stats` - Get quiz statistics

### **Preferences Endpoints**
- `GET /api/preferences` - Get user preferences
- `PUT /api/preferences` - Update preferences
- `POST /api/preferences/reset` - Reset to default

### **Word of Day Endpoints**
- `GET /api/word-of-day` - Get today's word
- `GET /api/word-of-day/history` - Get word history

## 🎉 **Success!**

Your SlangSupport app is now a **complete full-stack application** with:

- ✅ **Modern React frontend** with TypeScript
- ✅ **Robust Express backend** with authentication
- ✅ **PostgreSQL database** with Prisma ORM
- ✅ **AI-powered definitions** via Gemini
- ✅ **User management** and data persistence
- ✅ **Security** and performance optimizations
- ✅ **Production-ready** deployment setup

**Ready to deploy and scale!** 🚀
