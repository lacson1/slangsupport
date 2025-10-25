#!/bin/bash

# SlangSupport Health Check Script

API_URL="http://localhost:3001/health"

echo "🏥 Checking API health..."
response=$(curl -s -o /dev/null -w "%{http_code}" $API_URL)

if [ $response -eq 200 ]; then
    echo "✅ API is healthy"
    exit 0
else
    echo "❌ API is unhealthy (HTTP $response)"
    exit 1
fi
