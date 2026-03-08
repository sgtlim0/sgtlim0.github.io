-- Migration: 003_add_sessions
-- Description: Session management table for httpOnly cookie authentication
-- Rollback: DROP TABLE IF EXISTS sessions;

CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL,
  ip_address INET,
  user_agent TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_active_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lookup by token hash (session validation on every request)
CREATE INDEX IF NOT EXISTS idx_sessions_token_hash
  ON sessions(token_hash);

-- Lookup by user (list active sessions, force logout)
CREATE INDEX IF NOT EXISTS idx_sessions_user
  ON sessions(user_id);

-- Cleanup expired sessions (scheduled job)
CREATE INDEX IF NOT EXISTS idx_sessions_expires
  ON sessions(expires_at);
