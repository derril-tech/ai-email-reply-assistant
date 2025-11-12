-- Migration: Expose emailreply schema to PostgREST API
-- Created: 2025-11-12
-- Purpose: Make emailreply schema accessible via Supabase REST API

-- Make emailreply schema accessible to PostgREST
GRANT USAGE ON SCHEMA emailreply TO anon, authenticated, service_role;

-- Grant permissions on all tables in emailreply schema
GRANT ALL ON ALL TABLES IN SCHEMA emailreply TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA emailreply TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA emailreply TO anon, authenticated, service_role;

-- Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA emailreply GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA emailreply GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA emailreply GRANT ALL ON ROUTINES TO anon, authenticated, service_role;

-- Tell PostgREST to expose emailreply schema (add it to search_path)
ALTER ROLE authenticator SET search_path = public, emailreply;

-- Reload PostgREST configuration
NOTIFY pgrst, 'reload config';

-- Verify schema exposure
SELECT schema_name 
FROM information_schema.schemata 
WHERE schema_name = 'emailreply';

