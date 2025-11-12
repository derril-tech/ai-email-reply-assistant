-- Created automatically by Cursor AI (2025-11-12)
-- Migration: Create emailreply.oauth_tokens table and required grants

-- Ensure schema exists
create schema if not exists emailreply;

-- Create oauth_tokens table
create table if not exists emailreply.oauth_tokens (
  id uuid primary key default gen_random_uuid(),
  profile_id text not null,
  project_id text not null,
  provider text not null,
  access_token text not null,
  refresh_token text,
  expires_at timestamptz,
  scopes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (profile_id, project_id, provider)
);

-- Basic grants (service_role bypasses RLS, but we grant anyway)
grant usage on schema emailreply to service_role;
grant all on all tables in schema emailreply to service_role;
grant all on all sequences in schema emailreply to service_role;

-- Optional: default privileges for future tables/sequences
alter default privileges in schema emailreply grant all on tables to service_role;
alter default privileges in schema emailreply grant all on sequences to service_role;

-- Reload PostgREST configuration
notify pgrst, 'reload config';


