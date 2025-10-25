#!/bin/bash

# SlangSupport Docker Setup Script

set -e

echo "🐳 Setting up SlangSupport with Docker..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create environment file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp env.docker .env
    echo "⚠️  Please edit .env file with your configuration before continuing."
    echo "   Especially set your GEMINI_API_KEY!"
    read -p "Press Enter to continue after editing .env file..."
fi

# Build and start services
echo "🔨 Building Docker images..."
docker-compose build

echo "🚀 Starting services..."
docker-compose up -d

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 10

# Run database migrations
echo "🗄️  Running database migrations..."
docker-compose exec backend npx prisma migrate deploy

# Generate Prisma client
echo "🔧 Generating Prisma client..."
docker-compose exec backend npx prisma generate

echo "✅ Setup complete!"
echo ""
echo "🌐 Services are running:"
echo "   Backend API: http://localhost:3001"
echo "   Database: localhost:5432"
echo "   Health Check: http://localhost:3001/health"
echo ""
echo "📊 Useful commands:"
echo "   View logs: docker-compose logs -f"
echo "   Stop services: docker-compose down"
echo "   Restart services: docker-compose restart"
echo "   Database studio: docker-compose exec backend npx prisma studio"
echo ""
echo "🔑 Don't forget to:"
echo "   1. Update your frontend to use http://localhost:3001/api"
echo "   2. Set your GEMINI_API_KEY in the .env file"
echo "   3. Test the API endpoints"
