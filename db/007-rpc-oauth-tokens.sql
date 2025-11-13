-- Created automatically by Cursor AI (2025-11-13)
-- RPC functions to read/write emailreply.oauth_tokens via public schema (PostgREST-exposed)

create extension if not exists pgcrypto;

-- Read latest token for a project/provider
create or replace function public.get_oauth_token(
	p_project_id text,
	p_provider text default 'google'
)
returns table (
	id uuid,
	profile_id text,
	project_id text,
	provider text,
	access_token text,
	refresh_token text,
	expires_at timestamptz,
	scopes text,
	created_at timestamptz,
	updated_at timestamptz
)
language sql
security definer
set search_path = public, emailreply
as $$
	select id, profile_id, project_id, provider, access_token, refresh_token, expires_at, scopes, created_at, updated_at
	from emailreply.oauth_tokens
	where project_id = p_project_id and provider = p_provider
	order by updated_at desc nulls last
	limit 1;
$$;

grant execute on function public.get_oauth_token(text, text) to anon, authenticated, service_role;


-- Upsert token record
create or replace function public.upsert_oauth_token(
	p_profile_id text,
	p_project_id text,
	p_provider text,
	p_access_token text,
	p_refresh_token text,
	p_expires_at timestamptz,
	p_scopes text
)
returns emailreply.oauth_tokens
language sql
security definer
set search_path = public, emailreply
as $$
	insert into emailreply.oauth_tokens (
		profile_id, project_id, provider, access_token, refresh_token, expires_at, scopes, updated_at
	) values (
		p_profile_id, p_project_id, p_provider, p_access_token, p_refresh_token, p_expires_at, p_scopes, now()
	)
	on conflict (profile_id, project_id, provider)
	do update set
		access_token = excluded.access_token,
		refresh_token = excluded.refresh_token,
		expires_at = excluded.expires_at,
		scopes = excluded.scopes,
		updated_at = now()
	returning *;
$$;

grant execute on function public.upsert_oauth_token(text, text, text, text, text, timestamptz, text) to anon, authenticated, service_role;

-- Nudge PostgREST to reload schema/functions
notify pgrst, 'reload schema';
notify pgrst, 'reload config';


