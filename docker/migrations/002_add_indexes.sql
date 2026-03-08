-- Migration: 002_add_indexes
-- Description: Performance indexes for common query patterns
-- Rollback:
--   DROP INDEX IF EXISTS idx_conversations_user_created;
--   DROP INDEX IF EXISTS idx_messages_conversation_created;
--   DROP INDEX IF EXISTS idx_audit_logs_user_created;
--   DROP INDEX IF EXISTS idx_api_keys_user;
--   DROP INDEX IF EXISTS idx_users_organization;
--   DROP INDEX IF EXISTS idx_users_department;

-- Composite index: conversations by user + time (dashboard, history queries)
CREATE INDEX IF NOT EXISTS idx_conversations_user_created
  ON conversations(user_id, created_at DESC);

-- Composite index: messages by conversation + time (chat history pagination)
CREATE INDEX IF NOT EXISTS idx_messages_conversation_created
  ON messages(conversation_id, created_at DESC);

-- Composite index: audit logs by user + time (user activity tracking)
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_created
  ON audit_logs(user_id, created_at DESC);

-- API keys lookup by user
CREATE INDEX IF NOT EXISTS idx_api_keys_user
  ON api_keys(user_id);

-- Users by organization (admin filtering)
CREATE INDEX IF NOT EXISTS idx_users_organization
  ON users(organization);

-- Users by department (ROI dashboard department heatmap)
CREATE INDEX IF NOT EXISTS idx_users_department
  ON users(department);
