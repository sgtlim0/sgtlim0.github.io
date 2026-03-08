-- =============================================================================
-- H Chat Development Seed Data
-- WARNING: FOR DEVELOPMENT/TESTING ONLY — DO NOT USE IN PRODUCTION
-- =============================================================================
-- Idempotent: safe to run multiple times (ON CONFLICT DO NOTHING)
-- No passwords included — authentication uses mock service
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. Users (5 roles: admin, manager, developer, analyst, viewer)
-- ---------------------------------------------------------------------------
INSERT INTO users (id, email, name, role, organization, department) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'admin@hchat.ai',     'Admin User',    'admin',     'HMG', 'IT'),
  ('a0000000-0000-0000-0000-000000000002', 'manager@hchat.ai',   'Manager Kim',   'manager',   'HMG', 'Engineering'),
  ('a0000000-0000-0000-0000-000000000003', 'developer@hchat.ai', 'Developer Park', 'developer', 'HMG', 'Engineering'),
  ('a0000000-0000-0000-0000-000000000004', 'analyst@hchat.ai',   'Analyst Lee',   'analyst',   'HMG', 'Data Science'),
  ('a0000000-0000-0000-0000-000000000005', 'viewer@hchat.ai',    'Viewer Choi',   'viewer',    'HMG', 'Marketing')
ON CONFLICT (email) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 2. Conversations (10 total, 2 per user)
-- ---------------------------------------------------------------------------
INSERT INTO conversations (id, user_id, assistant_id, title) VALUES
  -- Admin conversations
  ('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'hchat-general',  'System monitoring setup'),
  ('c0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'hchat-code',     'API gateway configuration'),
  -- Manager conversations
  ('c0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000002', 'hchat-general',  'Q1 sprint planning'),
  ('c0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000002', 'hchat-docs',     'Architecture review notes'),
  -- Developer conversations
  ('c0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000003', 'hchat-code',     'React component refactoring'),
  ('c0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000003', 'hchat-code',     'Database query optimization'),
  -- Analyst conversations
  ('c0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000004', 'hchat-general',  'Monthly usage report'),
  ('c0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000004', 'hchat-docs',     'ROI dashboard metrics'),
  -- Viewer conversations
  ('c0000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000005', 'hchat-general',  'Marketing copy review'),
  ('c0000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000005', 'hchat-docs',     'Product documentation QA')
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 3. Messages (50 total, 5 per conversation)
-- ---------------------------------------------------------------------------

-- Conversation 1: System monitoring setup (Admin)
INSERT INTO messages (id, conversation_id, role, content, tokens, model) VALUES
  ('m0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'user',      'How do I set up system health monitoring?', 12, NULL),
  ('m0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', 'assistant', 'I recommend using the /health endpoint with Prometheus metrics. Here is a basic setup guide...', 245, 'gpt-4o'),
  ('m0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000001', 'user',      'Can we add alerting for CPU usage above 80%?', 14, NULL),
  ('m0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000001', 'assistant', 'Yes, you can configure AlertManager rules. Here is an example alert configuration...', 312, 'gpt-4o'),
  ('m0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000001', 'user',      'Great, let me try that. Thanks!', 8, NULL)
ON CONFLICT (id) DO NOTHING;

-- Conversation 2: API gateway configuration (Admin)
INSERT INTO messages (id, conversation_id, role, content, tokens, model) VALUES
  ('m0000000-0000-0000-0000-000000000006', 'c0000000-0000-0000-0000-000000000002', 'user',      'What rate limiting strategy should we use for the API gateway?', 15, NULL),
  ('m0000000-0000-0000-0000-000000000007', 'c0000000-0000-0000-0000-000000000002', 'assistant', 'For your use case, I recommend a sliding window rate limiter with Redis as the backing store...', 287, 'claude-3.5-sonnet'),
  ('m0000000-0000-0000-0000-000000000008', 'c0000000-0000-0000-0000-000000000002', 'user',      'How many requests per minute is reasonable?', 10, NULL),
  ('m0000000-0000-0000-0000-000000000009', 'c0000000-0000-0000-0000-000000000002', 'assistant', 'For enterprise usage, 60 requests/min per user and 1000 requests/min globally is a good starting point...', 198, 'claude-3.5-sonnet'),
  ('m0000000-0000-0000-0000-000000000010', 'c0000000-0000-0000-0000-000000000002', 'user',      'Makes sense. I will implement this with the token bucket algorithm.', 14, NULL)
ON CONFLICT (id) DO NOTHING;

-- Conversation 3: Q1 sprint planning (Manager)
INSERT INTO messages (id, conversation_id, role, content, tokens, model) VALUES
  ('m0000000-0000-0000-0000-000000000011', 'c0000000-0000-0000-0000-000000000003', 'user',      'Help me plan the Q1 sprint backlog for the H Chat team.', 16, NULL),
  ('m0000000-0000-0000-0000-000000000012', 'c0000000-0000-0000-0000-000000000003', 'assistant', 'Based on your roadmap, here are the key priorities for Q1: 1) SSO integration, 2) ROI dashboard, 3) Mobile PWA...', 356, 'gpt-4o'),
  ('m0000000-0000-0000-0000-000000000013', 'c0000000-0000-0000-0000-000000000003', 'user',      'Can you estimate story points for each?', 10, NULL),
  ('m0000000-0000-0000-0000-000000000014', 'c0000000-0000-0000-0000-000000000003', 'assistant', 'Here are my estimates: SSO integration (13 pts), ROI dashboard (21 pts), Mobile PWA (8 pts)...', 278, 'gpt-4o'),
  ('m0000000-0000-0000-0000-000000000015', 'c0000000-0000-0000-0000-000000000003', 'user',      'Let us split the ROI dashboard into smaller tasks.', 12, NULL)
ON CONFLICT (id) DO NOTHING;

-- Conversation 4: Architecture review notes (Manager)
INSERT INTO messages (id, conversation_id, role, content, tokens, model) VALUES
  ('m0000000-0000-0000-0000-000000000016', 'c0000000-0000-0000-0000-000000000004', 'user',      'Summarize the key points from our architecture review meeting.', 14, NULL),
  ('m0000000-0000-0000-0000-000000000017', 'c0000000-0000-0000-0000-000000000004', 'assistant', 'Key decisions from the review: 1) Adopt monorepo with Turborepo, 2) Static export for all frontend apps...', 410, 'claude-3.5-sonnet'),
  ('m0000000-0000-0000-0000-000000000018', 'c0000000-0000-0000-0000-000000000004', 'user',      'What were the concerns raised about the AI Core backend?', 13, NULL),
  ('m0000000-0000-0000-0000-000000000019', 'c0000000-0000-0000-0000-000000000004', 'assistant', 'The main concerns were: 1) Cold start latency for FastAPI, 2) LLM provider failover strategy...', 325, 'claude-3.5-sonnet'),
  ('m0000000-0000-0000-0000-000000000020', 'c0000000-0000-0000-0000-000000000004', 'user',      'Add these to the ADR backlog.', 8, NULL)
ON CONFLICT (id) DO NOTHING;

-- Conversation 5: React component refactoring (Developer)
INSERT INTO messages (id, conversation_id, role, content, tokens, model) VALUES
  ('m0000000-0000-0000-0000-000000000021', 'c0000000-0000-0000-0000-000000000005', 'user',      'How should I refactor the ChatPage component? It is over 400 lines.', 18, NULL),
  ('m0000000-0000-0000-0000-000000000022', 'c0000000-0000-0000-0000-000000000005', 'assistant', 'I recommend extracting these sub-components: ChatHeader, MessageList, MessageInput, and ChatActions...', 389, 'gpt-4o'),
  ('m0000000-0000-0000-0000-000000000023', 'c0000000-0000-0000-0000-000000000005', 'user',      'Should I use a custom hook for the chat state?', 12, NULL),
  ('m0000000-0000-0000-0000-000000000024', 'c0000000-0000-0000-0000-000000000005', 'assistant', 'Yes, create a useChat hook that manages messages, streaming state, and error handling...', 456, 'gpt-4o'),
  ('m0000000-0000-0000-0000-000000000025', 'c0000000-0000-0000-0000-000000000005', 'user',      'Perfect. I will start with the hook extraction.', 10, NULL)
ON CONFLICT (id) DO NOTHING;

-- Conversation 6: Database query optimization (Developer)
INSERT INTO messages (id, conversation_id, role, content, tokens, model) VALUES
  ('m0000000-0000-0000-0000-000000000026', 'c0000000-0000-0000-0000-000000000006', 'user',      'The audit_logs query is slow when filtering by date range. How can I optimize it?', 20, NULL),
  ('m0000000-0000-0000-0000-000000000027', 'c0000000-0000-0000-0000-000000000006', 'assistant', 'Add a composite index on (created_at, user_id) and use BRIN index for the timestamp column...', 298, 'claude-3.5-sonnet'),
  ('m0000000-0000-0000-0000-000000000028', 'c0000000-0000-0000-0000-000000000006', 'user',      'What about partitioning the table by month?', 11, NULL),
  ('m0000000-0000-0000-0000-000000000029', 'c0000000-0000-0000-0000-000000000006', 'assistant', 'Table partitioning is a good idea for audit_logs. Here is how to set up monthly partitions with PostgreSQL...', 367, 'claude-3.5-sonnet'),
  ('m0000000-0000-0000-0000-000000000030', 'c0000000-0000-0000-0000-000000000006', 'user',      'I will benchmark both approaches and compare.', 10, NULL)
ON CONFLICT (id) DO NOTHING;

-- Conversation 7: Monthly usage report (Analyst)
INSERT INTO messages (id, conversation_id, role, content, tokens, model) VALUES
  ('m0000000-0000-0000-0000-000000000031', 'c0000000-0000-0000-0000-000000000007', 'user',      'Generate a summary of last month AI usage across departments.', 14, NULL),
  ('m0000000-0000-0000-0000-000000000032', 'c0000000-0000-0000-0000-000000000007', 'assistant', 'Here is the usage summary: Engineering (45%), Data Science (25%), Marketing (15%), IT (15%)...', 234, 'gpt-4o'),
  ('m0000000-0000-0000-0000-000000000033', 'c0000000-0000-0000-0000-000000000007', 'user',      'What is the token consumption trend?', 8, NULL),
  ('m0000000-0000-0000-0000-000000000034', 'c0000000-0000-0000-0000-000000000007', 'assistant', 'Token usage increased 23% month-over-month. GPT-4o accounts for 60% of total tokens...', 189, 'gpt-4o'),
  ('m0000000-0000-0000-0000-000000000035', 'c0000000-0000-0000-0000-000000000007', 'user',      'Include cost breakdown in the final report.', 10, NULL)
ON CONFLICT (id) DO NOTHING;

-- Conversation 8: ROI dashboard metrics (Analyst)
INSERT INTO messages (id, conversation_id, role, content, tokens, model) VALUES
  ('m0000000-0000-0000-0000-000000000036', 'c0000000-0000-0000-0000-000000000008', 'user',      'What KPIs should we track on the ROI dashboard?', 13, NULL),
  ('m0000000-0000-0000-0000-000000000037', 'c0000000-0000-0000-0000-000000000008', 'assistant', 'Key KPIs: 1) Time saved per task, 2) Cost per query, 3) User adoption rate, 4) NPS score...', 312, 'claude-3.5-sonnet'),
  ('m0000000-0000-0000-0000-000000000038', 'c0000000-0000-0000-0000-000000000008', 'user',      'How do we calculate time saved accurately?', 11, NULL),
  ('m0000000-0000-0000-0000-000000000039', 'c0000000-0000-0000-0000-000000000008', 'assistant', 'Compare task completion time before and after AI adoption. Use survey data for qualitative input...', 276, 'claude-3.5-sonnet'),
  ('m0000000-0000-0000-0000-000000000040', 'c0000000-0000-0000-0000-000000000008', 'user',      'Let us set up A/B testing for the baseline.', 12, NULL)
ON CONFLICT (id) DO NOTHING;

-- Conversation 9: Marketing copy review (Viewer)
INSERT INTO messages (id, conversation_id, role, content, tokens, model) VALUES
  ('m0000000-0000-0000-0000-000000000041', 'c0000000-0000-0000-0000-000000000009', 'user',      'Review this marketing copy for the H Chat launch announcement.', 14, NULL),
  ('m0000000-0000-0000-0000-000000000042', 'c0000000-0000-0000-0000-000000000009', 'assistant', 'The copy is clear but could be more engaging. Consider: 1) Add a compelling hook, 2) Highlight ROI numbers...', 267, 'gpt-4o'),
  ('m0000000-0000-0000-0000-000000000043', 'c0000000-0000-0000-0000-000000000009', 'user',      'Can you suggest a better headline?', 8, NULL),
  ('m0000000-0000-0000-0000-000000000044', 'c0000000-0000-0000-0000-000000000009', 'assistant', 'How about: "H Chat: Save 40% of Your Team''s Time with Enterprise AI That Actually Works"', 156, 'gpt-4o'),
  ('m0000000-0000-0000-0000-000000000045', 'c0000000-0000-0000-0000-000000000009', 'user',      'Love it. I will use that for the press release.', 12, NULL)
ON CONFLICT (id) DO NOTHING;

-- Conversation 10: Product documentation QA (Viewer)
INSERT INTO messages (id, conversation_id, role, content, tokens, model) VALUES
  ('m0000000-0000-0000-0000-000000000046', 'c0000000-0000-0000-0000-000000000010', 'user',      'Check the user guide for any outdated screenshots or broken links.', 15, NULL),
  ('m0000000-0000-0000-0000-000000000047', 'c0000000-0000-0000-0000-000000000010', 'assistant', 'I found 3 issues: 1) Settings page screenshot is outdated, 2) /api/v1 link returns 404...', 234, 'gpt-4o'),
  ('m0000000-0000-0000-0000-000000000048', 'c0000000-0000-0000-0000-000000000010', 'user',      'Can you draft replacement text for the API section?', 12, NULL),
  ('m0000000-0000-0000-0000-000000000049', 'c0000000-0000-0000-0000-000000000010', 'assistant', 'Here is the updated API section with correct endpoints and examples...', 345, 'gpt-4o'),
  ('m0000000-0000-0000-0000-000000000050', 'c0000000-0000-0000-0000-000000000010', 'user',      'Thanks, I will update the wiki pages now.', 10, NULL)
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 4. API Keys (2 keys — hashed values are placeholders for dev)
-- ---------------------------------------------------------------------------
INSERT INTO api_keys (id, user_id, name, key_hash, prefix) VALUES
  ('k0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Admin Dev Key',     'sha256_placeholder_admin_key_hash_not_real',     'hc_dev_'),
  ('k0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000003', 'Developer Test Key', 'sha256_placeholder_developer_key_hash_not_real', 'hc_test_')
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 5. Audit Logs (15 entries across various actions)
-- ---------------------------------------------------------------------------
INSERT INTO audit_logs (id, user_id, action, resource, details, ip_address) VALUES
  ('l0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'user.login',        'auth',          '{"method": "password"}',                        '10.0.0.1'),
  ('l0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'settings.update',   'system',        '{"field": "rate_limit", "old": 30, "new": 60}', '10.0.0.1'),
  ('l0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'user.create',       'users',         '{"email": "developer@hchat.ai"}',               '10.0.0.1'),
  ('l0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000002', 'user.login',        'auth',          '{"method": "sso"}',                             '10.0.0.2'),
  ('l0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000002', 'conversation.create','conversations', '{"assistant": "hchat-general"}',                '10.0.0.2'),
  ('l0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000003', 'user.login',        'auth',          '{"method": "password"}',                        '10.0.0.3'),
  ('l0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000003', 'api_key.create',    'api_keys',      '{"name": "Developer Test Key"}',                '10.0.0.3'),
  ('l0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000003', 'conversation.create','conversations', '{"assistant": "hchat-code"}',                   '10.0.0.3'),
  ('l0000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000004', 'user.login',        'auth',          '{"method": "sso"}',                             '10.0.0.4'),
  ('l0000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000004', 'report.export',     'reports',       '{"type": "monthly_usage", "format": "xlsx"}',   '10.0.0.4'),
  ('l0000000-0000-0000-0000-000000000011', 'a0000000-0000-0000-0000-000000000004', 'report.export',     'reports',       '{"type": "roi_summary", "format": "pdf"}',      '10.0.0.4'),
  ('l0000000-0000-0000-0000-000000000012', 'a0000000-0000-0000-0000-000000000005', 'user.login',        'auth',          '{"method": "password"}',                        '10.0.0.5'),
  ('l0000000-0000-0000-0000-000000000013', 'a0000000-0000-0000-0000-000000000005', 'conversation.create','conversations', '{"assistant": "hchat-general"}',                '10.0.0.5'),
  ('l0000000-0000-0000-0000-000000000014', 'a0000000-0000-0000-0000-000000000001', 'provider.update',   'providers',     '{"provider": "openai", "status": "active"}',    '10.0.0.1'),
  ('l0000000-0000-0000-0000-000000000015', 'a0000000-0000-0000-0000-000000000001', 'model.update',      'models',        '{"model": "gpt-4o", "pricing_changed": true}',  '10.0.0.1')
ON CONFLICT (id) DO NOTHING;
