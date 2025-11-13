-- Created automatically by Cursor AI (2025-11-13)
-- Ensure unique constraint for upserts on emailreply.oauth_tokens

create schema if not exists emailreply;

-- Create unique index used by ON CONFLICT (profile_id, project_id, provider)
create unique index if not exists idx_oauth_tokens_profile_project_provider
on emailreply.oauth_tokens (profile_id, project_id, provider);

-- Hint PostgREST to reload (not strictly required for indexes, but harmless)
notify pgrst, 'reload schema';
notify pgrst, 'reload config';


