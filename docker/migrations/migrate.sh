#!/bin/bash
set -euo pipefail

# H Chat Database Migration Runner
# Usage: ./migrate.sh [options]
#
# Options:
#   -h, --host       Database host (default: localhost)
#   -p, --port       Database port (default: 5432)
#   -d, --database   Database name (default: hchat)
#   -U, --user       Database user (default: hchat)
#   --dry-run        Show pending migrations without executing

DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-hchat}"
DB_USER="${DB_USER:-hchat}"
DRY_RUN=false

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

while [[ $# -gt 0 ]]; do
  case "$1" in
    -h|--host)     DB_HOST="$2"; shift 2 ;;
    -p|--port)     DB_PORT="$2"; shift 2 ;;
    -d|--database) DB_NAME="$2"; shift 2 ;;
    -U|--user)     DB_USER="$2"; shift 2 ;;
    --dry-run)     DRY_RUN=true; shift ;;
    *)
      echo "Unknown option: $1" >&2
      exit 1
      ;;
  esac
done

PSQL="psql -h $DB_HOST -p $DB_PORT -d $DB_NAME -U $DB_USER -v ON_ERROR_STOP=1"

echo "=== H Chat Migration Runner ==="
echo "Host: $DB_HOST:$DB_PORT"
echo "Database: $DB_NAME"
echo "User: $DB_USER"
echo ""

# Create migration tracking table if it does not exist
$PSQL -q <<'SQL'
CREATE TABLE IF NOT EXISTS schema_migrations (
  version INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  applied_at TIMESTAMPTZ DEFAULT NOW()
);
SQL

# Collect applied versions
APPLIED=$($PSQL -t -A -c "SELECT version FROM schema_migrations ORDER BY version;")

PENDING=0

for file in "$SCRIPT_DIR"/[0-9][0-9][0-9]_*.sql; do
  [ -f "$file" ] || continue

  filename="$(basename "$file")"
  version="${filename%%_*}"
  version=$((10#$version))  # strip leading zeros
  name="${filename%.sql}"

  if echo "$APPLIED" | grep -qw "$version"; then
    continue
  fi

  PENDING=$((PENDING + 1))

  if [ "$DRY_RUN" = true ]; then
    echo "[PENDING] $filename"
    continue
  fi

  echo "Applying: $filename ..."

  $PSQL -q -f "$file"

  $PSQL -q -c "INSERT INTO schema_migrations (version, name) VALUES ($version, '$name');"

  echo "  Done."
done

if [ "$DRY_RUN" = true ]; then
  echo ""
  echo "$PENDING migration(s) pending."
else
  if [ "$PENDING" -eq 0 ]; then
    echo "Database is up to date. No pending migrations."
  else
    echo ""
    echo "$PENDING migration(s) applied successfully."
  fi
fi

echo ""
echo "Applied migrations:"
$PSQL -t -A -c "SELECT version || ' - ' || name || ' (' || applied_at::date || ')' FROM schema_migrations ORDER BY version;"
