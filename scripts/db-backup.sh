#!/bin/bash

# SlangSupport Database Backup Script

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="backup_${DATE}.sql"

echo "📦 Creating database backup: $BACKUP_FILE"
docker-compose exec postgres pg_dump -U slangsupport slangsupport > $BACKUP_FILE
echo "✅ Backup created: $BACKUP_FILE"
