-- Schema for AI-EMAIL-REPLY-ASSISTANT
create schema if not exists emailreply;

-- Required for gen_random_uuid()
create extension if not exists pgcrypto;

create table if not exists emailreply.profiles (
  id uuid primary key default gen_random_uuid(),
  email text unique,
  created_at timestamptz not null default now()
);

create table if not exists emailreply.projects (
  id uuid primary key default gen_random_uuid(),
  owner uuid not null references emailreply.profiles(id) on delete cascade,
  title text not null,
  framework text,
  external_api text,
  created_at timestamptz not null default now()
);

create index if not exists idx_projects_owner on emailreply.projects(owner);

create table if not exists emailreply.messages (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references emailreply.projects(id) on delete cascade,
  role text not null check (role in ('user','assistant','system')),
  content text not null,
  meta jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_messages_project_created on emailreply.messages(project_id, created_at desc);

create table if not exists emailreply.jobs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references emailreply.projects(id) on delete cascade,
  kind text not null,
  status text not null check (status in ('queued','running','done','error')),
  payload jsonb,
  result jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_jobs_project_status on emailreply.jobs(project_id, status);
create index if not exists idx_jobs_created on emailreply.jobs(created_at desc);

-- OAuth token storage (server-side only)
create table if not exists emailreply.oauth_tokens (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references emailreply.profiles(id) on delete cascade,
  provider text not null default 'google',
  access_token text not null,
  refresh_token text,
  expiry timestamptz,
  scopes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_oauth_tokens_profile on emailreply.oauth_tokens(profile_id);

-- Optional: cached/indexed Gmail threads (for picker)
create table if not exists emailreply.gmail_threads (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references emailreply.profiles(id) on delete cascade,
  thread_id text not null,
  subject text,
  snippet text,
  participants text[],
  normalized_text text, -- server-side normalized message history
  updated_at timestamptz not null default now(),
  unique (profile_id, thread_id)
);

create index if not exists idx_gmail_threads_profile on emailreply.gmail_threads(profile_id);
create index if not exists idx_gmail_threads_updated on emailreply.gmail_threads(updated_at desc);

-- Trigger to maintain updated_at
create or replace function emailreply.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end
$$;

do $$
begin
  if not exists (
    select 1 from pg_trigger where tgname = 'trg_jobs_updated_at'
  ) then
    create trigger trg_jobs_updated_at
    before update on emailreply.jobs
    for each row execute function emailreply.set_updated_at();
  end if;

  if not exists (
    select 1 from pg_trigger where tgname = 'trg_oauth_tokens_updated_at'
  ) then
    create trigger trg_oauth_tokens_updated_at
    before update on emailreply.oauth_tokens
    for each row execute function emailreply.set_updated_at();
  end if;

  if not exists (
    select 1 from pg_trigger where tgname = 'trg_gmail_threads_updated_at'
  ) then
    create trigger trg_gmail_threads_updated_at
    before update on emailreply.gmail_threads
    for each row execute function emailreply.set_updated_at();
  end if;
end $$;

-- Row Level Security (RLS) — Supabase
alter table emailreply.profiles enable row level security;
alter table emailreply.projects enable row level security;
alter table emailreply.messages enable row level security;
alter table emailreply.jobs enable row level security;
alter table emailreply.oauth_tokens enable row level security;
alter table emailreply.gmail_threads enable row level security;

-- Profiles: user can read/update own profile
drop policy if exists profiles_select_own on emailreply.profiles;
create policy profiles_select_own
  on emailreply.profiles
  for select
  using (id = auth.uid());

drop policy if exists profiles_update_own on emailreply.profiles;
create policy profiles_update_own
  on emailreply.profiles
  for update
  using (id = auth.uid());

-- Projects: owner can select/insert/update their projects
drop policy if exists projects_select_owner on emailreply.projects;
create policy projects_select_owner
  on emailreply.projects
  for select
  using (owner = auth.uid());

drop policy if exists projects_insert_owner on emailreply.projects;
create policy projects_insert_owner
  on emailreply.projects
  for insert
  with check (owner = auth.uid());

drop policy if exists projects_update_owner on emailreply.projects;
create policy projects_update_owner
  on emailreply.projects
  for update
  using (owner = auth.uid());

-- Messages: accessible via project ownership
drop policy if exists messages_select_by_project_owner on emailreply.messages;
create policy messages_select_by_project_owner
  on emailreply.messages
  for select
  using (project_id in (select id from emailreply.projects where owner = auth.uid()));

drop policy if exists messages_insert_by_project_owner on emailreply.messages;
create policy messages_insert_by_project_owner
  on emailreply.messages
  for insert
  with check (project_id in (select id from emailreply.projects where owner = auth.uid()));

-- Jobs: accessible via project ownership
drop policy if exists jobs_select_by_project_owner on emailreply.jobs;
create policy jobs_select_by_project_owner
  on emailreply.jobs
  for select
  using (project_id in (select id from emailreply.projects where owner = auth.uid()));

drop policy if exists jobs_insert_by_project_owner on emailreply.jobs;
create policy jobs_insert_by_project_owner
  on emailreply.jobs
  for insert
  with check (project_id in (select id from emailreply.projects where owner = auth.uid()));

-- Gmail threads: only the profile owner
drop policy if exists gmail_threads_select_own on emailreply.gmail_threads;
create policy gmail_threads_select_own
  on emailreply.gmail_threads
  for select
  using (profile_id = auth.uid());

drop policy if exists gmail_threads_upsert_own on emailreply.gmail_threads;
create policy gmail_threads_upsert_own
  on emailreply.gmail_threads
  for insert
  with check (profile_id = auth.uid());

drop policy if exists gmail_threads_update_own on emailreply.gmail_threads;
create policy gmail_threads_update_own
  on emailreply.gmail_threads
  for update
  using (profile_id = auth.uid());

-- OAuth tokens: no policies created (service_role bypasses RLS). Keep server-only.


