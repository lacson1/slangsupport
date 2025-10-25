# SlangSupport Docker Development Scripts

## Development Commands

### Start Development Environment
```bash
#!/bin/bash
# dev-start.sh

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
```

### Stop Development Environment
```bash
#!/bin/bash
# dev-stop.sh

echo "🛑 Stopping SlangSupport development environment..."
docker-compose down
echo "✅ Environment stopped"
```

### Reset Development Environment
```bash
#!/bin/bash
# dev-reset.sh

echo "🔄 Resetting SlangSupport development environment..."

# Stop and remove volumes
docker-compose down -v

# Remove images (optional)
# docker-compose down --rmi all

# Start fresh
docker-compose up -d

# Wait for database
sleep 10

# Run migrations
docker-compose exec backend npx prisma migrate dev
docker-compose exec backend npx prisma generate

echo "✅ Environment reset complete!"
```

### Database Management
```bash
#!/bin/bash
# db-backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="backup_${DATE}.sql"

echo "📦 Creating database backup: $BACKUP_FILE"
docker-compose exec postgres pg_dump -U slangsupport slangsupport > $BACKUP_FILE
echo "✅ Backup created: $BACKUP_FILE"
```

```bash
#!/bin/bash
# db-restore.sh

if [ -z "$1" ]; then
    echo "❌ Please provide backup file: ./db-restore.sh backup_20240101_120000.sql"
    exit 1
fi

echo "📥 Restoring database from: $1"
docker-compose exec -T postgres psql -U slangsupport slangsupport < $1
echo "✅ Database restored"
```

### Logs and Monitoring
```bash
#!/bin/bash
# logs.sh

if [ -z "$1" ]; then
    echo "📊 Showing all logs..."
    docker-compose logs -f
else
    echo "📊 Showing logs for: $1"
    docker-compose logs -f $1
fi
```

### Database Studio
```bash
#!/bin/bash
# db-studio.sh

echo "🎨 Opening Prisma Studio..."
docker-compose exec backend npx prisma studio
```

## Production Commands

### Production Deploy
```bash
#!/bin/bash
# prod-deploy.sh

echo "🚀 Deploying SlangSupport to production..."

# Build production images
docker-compose -f docker-compose.yml -f docker-compose.prod.yml build

# Start production services
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Wait for services
sleep 15

# Run migrations
docker-compose -f docker-compose.yml -f docker-compose.prod.yml exec backend npx prisma migrate deploy

echo "✅ Production deployment complete!"
```

### Production Backup
```bash
#!/bin/bash
# prod-backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="prod_backup_${DATE}.sql"

echo "📦 Creating production backup: $BACKUP_FILE"
docker-compose -f docker-compose.yml -f docker-compose.prod.yml exec postgres pg_dump -U slangsupport slangsupport > $BACKUP_FILE

# Compress backup
gzip $BACKUP_FILE
echo "✅ Compressed backup created: ${BACKUP_FILE}.gz"
```

## Health Check Scripts

### API Health Check
```bash
#!/bin/bash
# health-check.sh

API_URL="http://localhost:3001/health"

echo "🏥 Checking API health..."
response=$(curl -s -o /dev/null -w "%{http_code}" $API_URL)

if [ $response -eq 200 ]; then
    echo "✅ API is healthy"
else
    echo "❌ API is unhealthy (HTTP $response)"
    exit 1
fi
```

### Database Health Check
```bash
#!/bin/bash
# db-health.sh

echo "🏥 Checking database health..."
docker-compose exec postgres pg_isready -U slangsupport -d slangsupport

if [ $? -eq 0 ]; then
    echo "✅ Database is healthy"
else
    echo "❌ Database is unhealthy"
    exit 1
fi
```

## Utility Scripts

### Clean Up Docker
```bash
#!/bin/bash
# cleanup.sh

echo "🧹 Cleaning up Docker resources..."

# Stop and remove containers
docker-compose down

# Remove unused images
docker image prune -f

# Remove unused volumes (be careful!)
# docker volume prune -f

echo "✅ Cleanup complete"
```

### Update Services
```bash
#!/bin/bash
# update.sh

echo "🔄 Updating SlangSupport services..."

# Pull latest images
docker-compose pull

# Rebuild and restart
docker-compose up -d --build

echo "✅ Services updated"
```

### Environment Check
```bash
#!/bin/bash
# env-check.sh

echo "🔍 Checking environment configuration..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found"
    exit 1
fi

# Check required variables
required_vars=("POSTGRES_PASSWORD" "JWT_SECRET" "GEMINI_API_KEY")

for var in "${required_vars[@]}"; do
    if grep -q "^${var}=" .env; then
        echo "✅ $var is set"
    else
        echo "❌ $var is missing"
    fi
done

echo "🔍 Environment check complete"
```

## Make Commands (Alternative)

Create a `Makefile` for easier command management:

```makefile
# Makefile

.PHONY: dev-start dev-stop dev-reset prod-deploy backup restore logs clean

dev-start:
	@echo "🚀 Starting development environment..."
	docker-compose up -d
	@sleep 10
	docker-compose exec backend npx prisma migrate dev
	docker-compose exec backend npx prisma generate

dev-stop:
	@echo "🛑 Stopping development environment..."
	docker-compose down

dev-reset:
	@echo "🔄 Resetting development environment..."
	docker-compose down -v
	docker-compose up -d
	@sleep 10
	docker-compose exec backend npx prisma migrate dev
	docker-compose exec backend npx prisma generate

prod-deploy:
	@echo "🚀 Deploying to production..."
	docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
	@sleep 15
	docker-compose -f docker-compose.yml -f docker-compose.prod.yml exec backend npx prisma migrate deploy

backup:
	@echo "📦 Creating backup..."
	@DATE=$$(date +%Y%m%d_%H%M%S); \
	docker-compose exec postgres pg_dump -U slangsupport slangsupport > backup_$$DATE.sql; \
	echo "✅ Backup created: backup_$$DATE.sql"

restore:
	@if [ -z "$(FILE)" ]; then \
		echo "❌ Please specify backup file: make restore FILE=backup.sql"; \
		exit 1; \
	fi
	@echo "📥 Restoring from $(FILE)..."
	docker-compose exec -T postgres psql -U slangsupport slangsupport < $(FILE)

logs:
	@docker-compose logs -f

clean:
	@echo "🧹 Cleaning up..."
	docker-compose down
	docker image prune -f
```

## Usage Examples

### Development Workflow
```bash
# Start development
./dev-start.sh

# Make changes to code
# Rebuild backend
docker-compose build backend
docker-compose up -d backend

# View logs
./logs.sh backend

# Stop when done
./dev-stop.sh
```

### Production Workflow
```bash
# Deploy to production
./prod-deploy.sh

# Create backup
./prod-backup.sh

# Monitor health
./health-check.sh
```

### Database Management
```bash
# Create backup
./db-backup.sh

# Restore from backup
./db-restore.sh backup_20240101_120000.sql

# Open database studio
./db-studio.sh
```

These scripts provide a complete toolkit for managing the SlangSupport Docker environment in both development and production scenarios.
