-- Migration: Ensure PostgREST uses emailreply schema for service_role
-- Created automatically by Cursor AI (2025-11-12)

-- Set search_path for service_role (used by SUPABASE_SERVICE_ROLE key)
ALTER ROLE service_role SET search_path = public, emailreply;

-- Reload PostgREST configuration so the change takes effect immediately
NOTIFY pgrst, 'reload config';
