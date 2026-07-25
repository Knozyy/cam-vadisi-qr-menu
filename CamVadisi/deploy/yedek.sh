#!/usr/bin/env bash
# Cam Vadisi - gunluk yedek. Cron ile calistirilir:
#   0 4 * * * /var/www/cam-vadisi/app/deploy/yedek.sh
# Tek gercek kaynak data.db ve uploads/; kendi sunucuda yedek bizim sorumlulugumuz.
set -euo pipefail

DATA_DIR="/var/www/cam-vadisi/data"
BACKUP_DIR="/var/www/cam-vadisi/backups"
STAMP="$(date +%Y-%m-%d-%H%M)"

mkdir -p "$BACKUP_DIR"

# WAL acikken tutarli kopya icin sqlite3 .backup kullan.
sqlite3 "$DATA_DIR/data.db" ".backup '$BACKUP_DIR/data-$STAMP.db'"
tar -czf "$BACKUP_DIR/uploads-$STAMP.tar.gz" -C "$DATA_DIR" uploads

# 14 gunden eski yedekleri temizle.
find "$BACKUP_DIR" -type f -mtime +14 -delete

echo "Yedek alindi: $STAMP"
