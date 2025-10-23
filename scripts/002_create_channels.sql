-- Create channels table for creator channels
create table if not exists public.channels (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  handle text unique not null,
  description text,
  banner_url text,
  avatar_url text,
  subscriber_count integer default 0 not null,
  video_count integer default 0 not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Enable RLS
alter table public.channels enable row level security;

-- RLS Policies for channels
create policy "channels_select_all"
  on public.channels for select
  using (true);

create policy "channels_insert_own"
  on public.channels for insert
  with check (auth.uid() = user_id);

create policy "channels_update_own"
  on public.channels for update
  using (auth.uid() = user_id);

create policy "channels_delete_own"
  on public.channels for delete
  using (auth.uid() = user_id);

-- Create index for faster lookups
create index if not exists channels_user_id_idx on public.channels(user_id);
create index if not exists channels_handle_idx on public.channels(handle);
