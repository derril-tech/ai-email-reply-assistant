-- Created automatically by Cursor AI (2025-11-13)
-- Relax oauth_tokens.profile_id constraints to allow first-time inserts

do $$
begin
	-- Drop FK if present (name based on Postgres default naming)
	if exists (
		select 1
		from information_schema.table_constraints tc
		where tc.constraint_name = 'oauth_tokens_profile_id_fkey'
		  and tc.table_schema = 'emailreply'
		  and tc.table_name = 'oauth_tokens'
	) then
		execute 'alter table emailreply.oauth_tokens drop constraint oauth_tokens_profile_id_fkey';
	end if;
exception when others then
	-- ignore
end $$;

-- Allow NULL profile_id so we can store tokens without a linked profile
alter table emailreply.oauth_tokens
	alter column profile_id drop not null;

-- Keep indexes and RPCs functioning
notify pgrst, 'reload schema';
notify pgrst, 'reload config';


