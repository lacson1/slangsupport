# SlangSupport Docker Development Guide

## Quick Start

### Prerequisites
- Docker and Docker Compose installed
- Git (to clone the repository)

### 1. Clone and Setup
```bash
git clone <repository-url>
cd slangsupport
```

### 2. Configure Environment
```bash
# Copy environment template
cp env.docker .env

# Edit .env file with your settings
nano .env
```

**Required Environment Variables:**
```bash
# Database
POSTGRES_PASSWORD=slangsupport123

# JWT Secret (generate a strong secret)
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Gemini API Key (required)
GEMINI_API_KEY=your-gemini-api-key-here

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

### 3. Run Setup Script
```bash
./setup-docker.sh
```

Or manually:
```bash
# Build and start services
docker-compose build
docker-compose up -d

# Wait for database
sleep 10

# Run migrations
docker-compose exec backend npx prisma migrate deploy
docker-compose exec backend npx prisma generate
```

## Services

### Backend API
- **URL**: http://localhost:3001
- **Health Check**: http://localhost:3001/health
- **API Docs**: http://localhost:3001/api

### PostgreSQL Database
- **Host**: localhost
- **Port**: 5432
- **Database**: slangsupport
- **User**: slangsupport
- **Password**: (from .env file)

## Docker Commands

### Basic Operations
```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# Restart services
docker-compose restart

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f postgres
```

### Development Commands
```bash
# Access backend container
docker-compose exec backend sh

# Run Prisma commands
docker-compose exec backend npx prisma studio
docker-compose exec backend npx prisma migrate dev
docker-compose exec backend npx prisma generate

# Access database
docker-compose exec postgres psql -U slangsupport -d slangsupport

# Rebuild backend
docker-compose build backend
docker-compose up -d backend
```

### Database Management
```bash
# Create backup
docker-compose exec postgres pg_dump -U slangsupport slangsupport > backup.sql

# Restore backup
docker-compose exec -T postgres psql -U slangsupport slangsupport < backup.sql

# Reset database
docker-compose down -v
docker-compose up -d
docker-compose exec backend npx prisma migrate deploy
```

## Production Deployment

### Using Production Compose
```bash
# Use production configuration
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### Environment Variables for Production
```bash
# Production .env
NODE_ENV=production
POSTGRES_PASSWORD=your-secure-production-password
JWT_SECRET=your-super-secure-jwt-secret
FRONTEND_URL=https://yourdomain.com
GEMINI_API_KEY=your-gemini-api-key
```

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   ```bash
   # Check if postgres is running
   docker-compose ps postgres
   
   # Check postgres logs
   docker-compose logs postgres
   
   # Restart postgres
   docker-compose restart postgres
   ```

2. **Backend Won't Start**
   ```bash
   # Check backend logs
   docker-compose logs backend
   
   # Check if environment variables are set
   docker-compose exec backend env | grep DATABASE_URL
   
   # Rebuild backend
   docker-compose build backend
   docker-compose up -d backend
   ```

3. **Migration Issues**
   ```bash
   # Reset database and run migrations
   docker-compose down -v
   docker-compose up -d postgres
   sleep 10
   docker-compose exec backend npx prisma migrate deploy
   ```

4. **Port Conflicts**
   ```bash
   # Check what's using port 3001
   lsof -i :3001
   
   # Change port in docker-compose.yml
   ports:
     - "3002:3001"  # Use port 3002 instead
   ```

### Performance Optimization

1. **Database Performance**
   ```bash
   # Increase shared_buffers in postgres
   # Add to docker-compose.yml postgres service:
   command: postgres -c shared_buffers=256MB
   ```

2. **Backend Performance**
   ```bash
   # Add resource limits
   deploy:
     resources:
       limits:
         memory: 1G
       reservations:
         memory: 512M
   ```

### Monitoring

1. **Health Checks**
   ```bash
   # Check all services
   docker-compose ps
   
   # Test API health
   curl http://localhost:3001/health
   ```

2. **Resource Usage**
   ```bash
   # View resource usage
   docker stats
   
   # View specific container stats
   docker stats slangsupport-backend
   ```

## Development Workflow

### Making Changes

1. **Backend Changes**
   ```bash
   # Make changes to backend code
   # Rebuild and restart
   docker-compose build backend
   docker-compose up -d backend
   ```

2. **Database Schema Changes**
   ```bash
   # Create migration
   docker-compose exec backend npx prisma migrate dev --name your-migration-name
   
   # Apply migration
   docker-compose exec backend npx prisma migrate deploy
   ```

3. **Environment Changes**
   ```bash
   # Update .env file
   # Restart services
   docker-compose restart
   ```

### Testing

1. **API Testing**
   ```bash
   # Test health endpoint
   curl http://localhost:3001/health
   
   # Test API endpoints
   curl http://localhost:3001/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","username":"test","password":"password123"}'
   ```

2. **Database Testing**
   ```bash
   # Connect to database
   docker-compose exec postgres psql -U slangsupport -d slangsupport
   
   # Run queries
   \dt  # List tables
   SELECT * FROM "User" LIMIT 5;
   ```

## Security Considerations

1. **Environment Variables**
   - Never commit .env files
   - Use strong passwords
   - Rotate secrets regularly

2. **Database Security**
   - Use strong database passwords
   - Limit database access
   - Enable SSL in production

3. **Network Security**
   - Use Docker networks
   - Limit exposed ports
   - Use reverse proxy for production

## Backup and Recovery

### Automated Backup Script
```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="backup_${DATE}.sql"

docker-compose exec postgres pg_dump -U slangsupport slangsupport > $BACKUP_FILE
echo "Backup created: $BACKUP_FILE"
```

### Recovery
```bash
# Restore from backup
docker-compose exec -T postgres psql -U slangsupport slangsupport < backup_20240101_120000.sql
```

## Scaling

### Horizontal Scaling
```bash
# Scale backend service
docker-compose up -d --scale backend=3

# Use load balancer (nginx)
# Update nginx.conf upstream configuration
```

### Vertical Scaling
```bash
# Increase memory limits in docker-compose.yml
deploy:
  resources:
    limits:
      memory: 2G
    reservations:
      memory: 1G
```

This Docker setup provides a complete development and production environment for SlangSupport with PostgreSQL database and backend API.
