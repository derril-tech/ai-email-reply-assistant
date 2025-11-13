-- Created automatically by Cursor AI (2025-11-13)
-- Migration: Force PostgREST schema reload and ensure exposed schemas
-- Safe to run multiple times

-- Ensure exposed schemas include emailreply
alter role authenticator set pgrst.db_schemas = 'public,emailreply';
alter role service_role set pgrst.db_schemas = 'public,emailreply';

-- Request PostgREST to reload schema and config
notify pgrst, 'reload schema';
notify pgrst, 'reload config';


