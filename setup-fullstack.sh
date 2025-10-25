#!/bin/bash

# SlangSupport Full-Stack Setup Script
echo "🚀 Setting up SlangSupport Full-Stack Application..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "⚠️  PostgreSQL is not installed. Please install PostgreSQL first."
    echo "   macOS: brew install postgresql"
    echo "   Ubuntu: sudo apt install postgresql"
fi

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install

# Set up environment file
if [ ! -f .env ]; then
    echo "📝 Creating backend environment file..."
    cp env.example .env
    echo "⚠️  Please edit backend/.env with your actual values:"
    echo "   - DATABASE_URL (PostgreSQL connection)"
    echo "   - GEMINI_API_KEY (Google AI API key)"
    echo "   - JWT_SECRET (strong secret key)"
fi

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd ..
npm install

# Set up frontend environment
if [ ! -f .env.local ]; then
    echo "📝 Creating frontend environment file..."
    echo "VITE_API_URL=http://localhost:3001/api" > .env.local
fi

# Generate Prisma client
echo "🔧 Generating Prisma client..."
cd backend
npx prisma generate

echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Edit backend/.env with your actual values"
echo "2. Set up PostgreSQL database:"
echo "   createdb slangsupport"
echo "3. Run database migrations:"
echo "   cd backend && npx prisma db push"
echo "4. Start the backend:"
echo "   cd backend && npm run dev"
echo "5. Start the frontend (in another terminal):"
echo "   npm run dev"
echo ""
echo "🌐 Frontend will be available at: http://localhost:3000"
echo "🔗 Backend API will be available at: http://localhost:3001"
echo "📊 Health check: http://localhost:3001/health"
