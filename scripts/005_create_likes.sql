-- Create likes table for video likes
create table if not exists public.likes (
  id uuid primary key default gen_random_uuid(),
  video_id uuid not null references public.videos(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz default now() not null,
  unique(video_id, user_id)
);

-- Enable RLS
alter table public.likes enable row level security;

-- RLS Policies for likes
create policy "likes_select_all"
  on public.likes for select
  using (true);

create policy "likes_insert_authenticated"
  on public.likes for insert
  with check (auth.uid() = user_id);

create policy "likes_delete_own"
  on public.likes for delete
  using (auth.uid() = user_id);

-- Create indexes
create index if not exists likes_video_id_idx on public.likes(video_id);
create index if not exists likes_user_id_idx on public.likes(user_id);
