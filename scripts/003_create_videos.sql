-- Create videos table
create table if not exists public.videos (
  id uuid primary key default gen_random_uuid(),
  channel_id uuid not null references public.channels(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  video_url text not null,
  thumbnail_url text,
  duration integer, -- in seconds
  view_count integer default 0 not null,
  like_count integer default 0 not null,
  comment_count integer default 0 not null,
  is_public boolean default true not null,
  published_at timestamptz default now() not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Enable RLS
alter table public.videos enable row level security;

-- RLS Policies for videos
create policy "videos_select_public"
  on public.videos for select
  using (is_public = true or auth.uid() = user_id);

create policy "videos_insert_own"
  on public.videos for insert
  with check (auth.uid() = user_id);

create policy "videos_update_own"
  on public.videos for update
  using (auth.uid() = user_id);

create policy "videos_delete_own"
  on public.videos for delete
  using (auth.uid() = user_id);

-- Create indexes for faster queries
create index if not exists videos_channel_id_idx on public.videos(channel_id);
create index if not exists videos_user_id_idx on public.videos(user_id);
create index if not exists videos_published_at_idx on public.videos(published_at desc);
create index if not exists videos_view_count_idx on public.videos(view_count desc);
