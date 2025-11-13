-- Created automatically by Cursor AI (2025-11-13)
-- Add unique index on (project_id, provider) for conflict target

create schema if not exists emailreply;

create unique index if not exists idx_oauth_tokens_project_provider_unique
on emailreply.oauth_tokens (project_id, provider);

-- Keep existing triple unique index if present; harmless
-- notify PostgREST (optional)
notify pgrst, 'reload schema';
notify pgrst, 'reload config';


