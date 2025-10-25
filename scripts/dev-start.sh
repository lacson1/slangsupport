#!/bin/bash

# SlangSupport Development Start Script

echo "🚀 Starting SlangSupport development environment..."

# Start services
docker-compose up -d

# Wait for database
echo "⏳ Waiting for database..."
sleep 10

# Run migrations
echo "🗄️ Running migrations..."
docker-compose exec backend npx prisma migrate dev

# Generate Prisma client
echo "🔧 Generating Prisma client..."
docker-compose exec backend npx prisma generate

echo "✅ Development environment ready!"
echo "🌐 Backend: http://localhost:3001"
echo "🗄️ Database: localhost:5432"
