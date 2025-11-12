-- Migration: Configure PostgREST to expose emailreply schema via GUC
-- Created automatically by Cursor AI (2025-11-12)

-- Ensure PostgREST exposes both public and emailreply schemas
ALTER ROLE authenticator SET pgrst.db_schemas = 'public,emailreply';
ALTER ROLE service_role SET pgrst.db_schemas = 'public,emailreply';

-- Reload PostgREST so changes take effect
NOTIFY pgrst, 'reload config';
