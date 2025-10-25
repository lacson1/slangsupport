# SlangSupport Deployment Guide

## Prerequisites

- Docker and Docker Compose installed
- PostgreSQL database (or use the included Docker setup)
- Gemini API key
- Domain name (optional, for production)

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```bash
# Database
POSTGRES_PASSWORD=your-secure-password

# JWT Secret (generate a strong secret key)
JWT_SECRET=your-super-secret-jwt-key-here

# Frontend URL
FRONTEND_URL=https://yourdomain.com

# Gemini API Key
GEMINI_API_KEY=your-gemini-api-key-here
```

## Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd slangsupport
   ```

2. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your values
   ```

3. **Start the services**
   ```bash
   docker-compose up -d
   ```

4. **Run database migrations**
   ```bash
   docker-compose exec backend npx prisma migrate deploy
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - Database: localhost:5432

## Production Deployment

### Using Docker Compose (Recommended)

1. **Set up production environment**
   ```bash
   # Create production .env file
   cp env.example .env.production
   # Edit with production values
   ```

2. **Deploy with production configuration**
   ```bash
   docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
   ```

3. **Set up SSL certificates (using Let's Encrypt)**
   ```bash
   # Install certbot
   sudo apt install certbot

   # Generate certificates
   sudo certbot certonly --standalone -d yourdomain.com
   ```

### Using Cloud Providers

#### AWS Deployment

1. **EC2 Instance Setup**
   ```bash
   # Launch EC2 instance (Ubuntu 20.04+)
   # Install Docker
   sudo apt update
   sudo apt install docker.io docker-compose
   sudo systemctl start docker
   sudo systemctl enable docker
   ```

2. **RDS Database Setup**
   - Create PostgreSQL RDS instance
   - Update DATABASE_URL in .env
   - Configure security groups

3. **Deploy Application**
   ```bash
   # Clone repository
   git clone <repository-url>
   cd slangsupport
   
   # Set up environment
   cp env.example .env
   # Edit .env with production values
   
   # Deploy
   docker-compose up -d
   ```

#### DigitalOcean App Platform

1. **Create app.yaml**
   ```yaml
   name: slangsupport
   services:
   - name: backend
     source_dir: /backend
     github:
       repo: your-username/slangsupport
       branch: main
     run_command: npm start
     environment_slug: node-js
     instance_count: 1
     instance_size_slug: basic-xxs
     envs:
     - key: DATABASE_URL
       value: ${db.DATABASE_URL}
     - key: JWT_SECRET
       value: ${JWT_SECRET}
     - key: GEMINI_API_KEY
       value: ${GEMINI_API_KEY}
   
   - name: frontend
     source_dir: /
     github:
       repo: your-username/slangsupport
       branch: main
     build_command: npm run build
     run_command: npm run preview
     environment_slug: node-js
     instance_count: 1
     instance_size_slug: basic-xxs
     envs:
     - key: VITE_API_URL
       value: ${backend.PUBLIC_URL}/api
   
   databases:
   - name: db
     engine: PG
     version: "13"
   ```

2. **Deploy to DigitalOcean**
   ```bash
   doctl apps create --spec app.yaml
   ```

## Database Management

### Backup Database
```bash
# Create backup
docker-compose exec postgres pg_dump -U slangsupport slangsupport > backup.sql

# Restore backup
docker-compose exec -T postgres psql -U slangsupport slangsupport < backup.sql
```

### Run Migrations
```bash
# Development
docker-compose exec backend npx prisma migrate dev

# Production
docker-compose exec backend npx prisma migrate deploy
```

### Database Studio
```bash
# Access Prisma Studio
docker-compose exec backend npx prisma studio
```

## Monitoring and Maintenance

### Health Checks
- Backend: `curl http://localhost:3001/health`
- Frontend: `curl http://localhost:3000/health`

### Logs
```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Updates
```bash
# Pull latest changes
git pull origin main

# Rebuild and restart services
docker-compose down
docker-compose up -d --build
```

## Security Considerations

1. **Environment Variables**
   - Never commit .env files
   - Use strong, unique passwords
   - Rotate JWT secrets regularly

2. **Database Security**
   - Use strong database passwords
   - Restrict database access to application servers only
   - Enable SSL connections

3. **API Security**
   - Implement rate limiting
   - Use HTTPS in production
   - Validate all inputs

4. **Frontend Security**
   - Use Content Security Policy headers
   - Implement proper CORS settings
   - Sanitize user inputs

## Troubleshooting

### Common Issues

1. **Database Connection Issues**
   ```bash
   # Check database status
   docker-compose exec postgres pg_isready -U slangsupport
   
   # Check logs
   docker-compose logs postgres
   ```

2. **Backend API Issues**
   ```bash
   # Check backend logs
   docker-compose logs backend
   
   # Test API endpoint
   curl http://localhost:3001/health
   ```

3. **Frontend Build Issues**
   ```bash
   # Check build logs
   docker-compose logs frontend
   
   # Rebuild frontend
   docker-compose build frontend
   ```

### Performance Optimization

1. **Database Optimization**
   - Add indexes for frequently queried fields
   - Monitor query performance
   - Use connection pooling

2. **API Optimization**
   - Implement caching
   - Use compression
   - Optimize database queries

3. **Frontend Optimization**
   - Enable gzip compression
   - Use CDN for static assets
   - Implement service workers for caching

## Support

For issues and questions:
- Check the logs first
- Review this deployment guide
- Create an issue in the repository
- Contact support at support@feyisdigital.com
