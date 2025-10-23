-- Create comments table
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  video_id uuid not null references public.videos(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  content text not null,
  like_count integer default 0 not null,
  parent_id uuid references public.comments(id) on delete cascade,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Enable RLS
alter table public.comments enable row level security;

-- RLS Policies for comments
create policy "comments_select_all"
  on public.comments for select
  using (true);

create policy "comments_insert_authenticated"
  on public.comments for insert
  with check (auth.uid() = user_id);

create policy "comments_update_own"
  on public.comments for update
  using (auth.uid() = user_id);

create policy "comments_delete_own"
  on public.comments for delete
  using (auth.uid() = user_id);

-- Create indexes
create index if not exists comments_video_id_idx on public.comments(video_id);
create index if not exists comments_user_id_idx on public.comments(user_id);
create index if not exists comments_parent_id_idx on public.comments(parent_id);
