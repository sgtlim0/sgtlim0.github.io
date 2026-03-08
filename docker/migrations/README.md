# Database Migrations

PostgreSQL 16 schema migration system for H Chat.

## Quick Start

```bash
# Run all pending migrations (dev)
cd docker/migrations
PGPASSWORD=hchat_dev_2026 ./migrate.sh

# Dry run — show pending without executing
PGPASSWORD=hchat_dev_2026 ./migrate.sh --dry-run

# Custom connection
./migrate.sh -h db.example.com -p 5432 -d hchat_prod -U hchat_admin
```

Environment variables `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER` are also supported.

## Docker

The `docker-compose.yml` mounts the migrations directory into the PostgreSQL init directory. Files are executed alphabetically on first container start (empty volume only).

For existing databases, run the migration script manually:

```bash
docker compose exec postgres sh -c \
  "PGPASSWORD=\$POSTGRES_PASSWORD /migrations/migrate.sh -h localhost -U hchat"
```

## Creating a New Migration

1. Create a file: `NNN_description.sql` (zero-padded 3-digit prefix)
2. Use `IF NOT EXISTS` / `IF EXISTS` for idempotency
3. Add rollback SQL as a comment header
4. Test locally, then commit

Example:

```sql
-- Migration: 004_add_user_preferences
-- Description: User preferences JSONB column
-- Rollback: ALTER TABLE users DROP COLUMN IF EXISTS preferences;

ALTER TABLE users ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}';
```

## Migration Tracking

Applied migrations are tracked in `schema_migrations`:

```sql
SELECT * FROM schema_migrations ORDER BY version;
```

| Column     | Type        | Description              |
|------------|-------------|--------------------------|
| version    | INTEGER     | Migration number (PK)    |
| name       | TEXT        | File name without .sql   |
| applied_at | TIMESTAMPTZ | When migration was applied|

## Conventions

- Prefix: 3-digit zero-padded (`001`, `002`, ...)
- Naming: `NNN_snake_case_description.sql`
- All DDL uses `IF NOT EXISTS` / `IF EXISTS` for safe re-runs
- Rollback SQL included as comment header (manual execution)
- One logical change per migration file
