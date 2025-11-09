-- Schema for AI-EMAIL-REPLY-ASSISTANT
create schema if not exists emailreply;

create table if not exists emailreply.profiles (
  id uuid primary key default gen_random_uuid(),
  email text unique,
  created_at timestamptz default now()
);

create table if not exists emailreply.projects (
  id uuid primary key default gen_random_uuid(),
  owner uuid references emailreply.profiles(id),
  title text,
  framework text,
  external_api text,
  created_at timestamptz default now()
);

create table if not exists emailreply.messages (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references emailreply.projects(id),
  role text check (role in ('user','assistant','system')),
  content text,
  meta jsonb,
  created_at timestamptz default now()
);

create table if not exists emailreply.jobs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references emailreply.projects(id),
  kind text,
  status text,
  payload jsonb,
  result jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- OAuth token storage (server-side only)
create table if not exists emailreply.oauth_tokens (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references emailreply.profiles(id) on delete cascade,
  provider text not null default 'google',
  access_token text not null,
  refresh_token text,
  expiry timestamptz,
  scopes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Optional: cached/indexed Gmail threads (for picker)
create table if not exists emailreply.gmail_threads (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references emailreply.profiles(id) on delete cascade,
  thread_id text not null,
  subject text,
  snippet text,
  participants text[],
  normalized_text text, -- server-side normalized message history
  updated_at timestamptz default now(),
  unique (profile_id, thread_id)
);


