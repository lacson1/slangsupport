#!/bin/bash

# SlangSupport Production Deployment Script
# This script prepares and deploys the SlangSupport application for production

set -e  # Exit on any error

echo "🚀 Starting SlangSupport Production Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required environment variables are set
check_env_vars() {
    print_status "Checking environment variables..."
    
    required_vars=("JWT_SECRET" "POSTGRES_PASSWORD" "FRONTEND_URL" "GEMINI_API_KEY")
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            print_error "Required environment variable $var is not set!"
            print_warning "Please set the following environment variables:"
            echo "  export JWT_SECRET=\"your-super-secure-jwt-secret\""
            echo "  export POSTGRES_PASSWORD=\"your-secure-db-password\""
            echo "  export FRONTEND_URL=\"https://yourdomain.com\""
            echo "  export GEMINI_API_KEY=\"your-gemini-api-key\""
            exit 1
        fi
    done
    
    print_status "All required environment variables are set ✓"
}

# Generate secure secrets if not provided
generate_secrets() {
    if [ -z "$JWT_SECRET" ] || [ "$JWT_SECRET" = "your-super-secret-jwt-key-change-in-production" ]; then
        print_warning "Generating secure JWT secret..."
        export JWT_SECRET=$(openssl rand -base64 32)
        print_status "JWT_SECRET generated: ${JWT_SECRET:0:10}..."
    fi
}

# Build frontend for production
build_frontend() {
    print_status "Building frontend for production..."
    
    cd /Users/lacbis/Downloads/slangsupport
    
    # Install dependencies
    npm ci --only=production
    
    # Build for production
    npm run build
    
    print_status "Frontend build completed ✓"
}

# Build backend for production
build_backend() {
    print_status "Building backend for production..."
    
    cd /Users/lacbis/Downloads/slangsupport/backend
    
    # Install dependencies
    npm ci --only=production
    
    # Build TypeScript
    npm run build
    
    print_status "Backend build completed ✓"
}

# Run security audit
run_security_audit() {
    print_status "Running security audit..."
    
    cd /Users/lacbis/Downloads/slangsupport
    
    # Frontend audit
    npm audit --audit-level=moderate
    
    cd backend
    npm audit --audit-level=moderate
    
    print_status "Security audit completed ✓"
}

# Build Docker images
build_docker_images() {
    print_status "Building Docker images..."
    
    cd /Users/lacbis/Downloads/slangsupport
    
    # Build production images
    docker-compose -f docker-compose.prod.yml build --no-cache
    
    print_status "Docker images built ✓"
}

# Deploy with Docker Compose
deploy_production() {
    print_status "Deploying to production..."
    
    cd /Users/lacbis/Downloads/slangsupport
    
    # Stop existing containers
    docker-compose -f docker-compose.prod.yml down
    
    # Start production services
    docker-compose -f docker-compose.prod.yml up -d
    
    print_status "Production deployment completed ✓"
}

# Health check
health_check() {
    print_status "Performing health check..."
    
    # Wait for services to start
    sleep 30
    
    # Check backend health
    if curl -f http://localhost:3001/health > /dev/null 2>&1; then
        print_status "Backend health check passed ✓"
    else
        print_error "Backend health check failed!"
        return 1
    fi
    
    # Check database connection
    if docker exec slangsupport-postgres-prod pg_isready -U slangsupport -d slangsupport > /dev/null 2>&1; then
        print_status "Database health check passed ✓"
    else
        print_error "Database health check failed!"
        return 1
    fi
    
    print_status "All health checks passed ✓"
}

# Main deployment function
main() {
    echo "=========================================="
    echo "SlangSupport Production Deployment"
    echo "=========================================="
    
    # Pre-deployment checks
    check_env_vars
    generate_secrets
    
    # Build applications
    build_frontend
    build_backend
    
    # Security checks
    run_security_audit
    
    # Build and deploy
    build_docker_images
    deploy_production
    
    # Verify deployment
    health_check
    
    echo "=========================================="
    print_status "🎉 Production deployment completed successfully!"
    echo "=========================================="
    echo ""
    print_status "Services running:"
    echo "  - Backend API: http://localhost:3001"
    echo "  - Database: localhost:5432"
    echo "  - Nginx: http://localhost:80"
    echo ""
    print_status "Next steps:"
    echo "  1. Configure SSL certificates"
    echo "  2. Set up monitoring and logging"
    echo "  3. Configure domain DNS"
    echo "  4. Set up automated backups"
    echo ""
    print_warning "Remember to:"
    echo "  - Keep secrets secure"
    echo "  - Monitor application logs"
    echo "  - Update dependencies regularly"
    echo "  - Perform security audits"
}

# Run main function
main "$@"
