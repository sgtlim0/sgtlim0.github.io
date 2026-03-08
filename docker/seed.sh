#!/bin/bash
# =============================================================================
# H Chat Development Seed Script
# WARNING: FOR DEVELOPMENT/TESTING ONLY — DO NOT USE IN PRODUCTION
# =============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SEED_FILE="${SCRIPT_DIR}/seed.sql"

DB_USER="${POSTGRES_USER:-hchat}"
DB_NAME="${POSTGRES_DB:-hchat}"

if [ ! -f "$SEED_FILE" ]; then
  echo "ERROR: seed.sql not found at $SEED_FILE"
  exit 1
fi

echo "=== H Chat Seed Data ==="
echo "Database: $DB_NAME"
echo "User: $DB_USER"
echo ""

psql -U "$DB_USER" -d "$DB_NAME" -f "$SEED_FILE"

echo ""
echo "=== Seed Complete ==="
echo "Users:         $(psql -U "$DB_USER" -d "$DB_NAME" -tAc "SELECT count(*) FROM users;")"
echo "Conversations: $(psql -U "$DB_USER" -d "$DB_NAME" -tAc "SELECT count(*) FROM conversations;")"
echo "Messages:      $(psql -U "$DB_USER" -d "$DB_NAME" -tAc "SELECT count(*) FROM messages;")"
echo "API Keys:      $(psql -U "$DB_USER" -d "$DB_NAME" -tAc "SELECT count(*) FROM api_keys;")"
echo "Audit Logs:    $(psql -U "$DB_USER" -d "$DB_NAME" -tAc "SELECT count(*) FROM audit_logs;")"
