-- Created automatically by Cursor AI (2025-11-13)
-- Utility: Audit schemas/tables/settings and oauth_tokens presence

-- 1) Does the table exist (expect 'emailreply.oauth_tokens')
select to_regclass('emailreply.oauth_tokens') as regclass;

-- 2) List tables in public and emailreply
select n.nspname as schema, c.relname as "table"
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where c.relkind = 'r' and n.nspname in ('public','emailreply')
order by 1,2;

-- 3) Show PostgREST exposed schemas for roles
select r.rolname, s.setconfig
from pg_db_role_setting s
join pg_roles r on r.oid = s.setrole
where s.setdatabase = 0 and r.rolname in ('authenticator','service_role');

-- 4) Permissions on schema and table
select n.nspname as schema, n.nspacl
from pg_namespace n
where n.nspname = 'emailreply';

select c.relname, c.relacl
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'emailreply' and c.relname = 'oauth_tokens' and c.relkind='r';

-- 5) Row Level Security (should be false or disabled for service_role use)
select c.relname, c.relrowsecurity
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'emailreply' and c.relname = 'oauth_tokens';


