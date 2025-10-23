-- Create views table for analytics
create table if not exists public.views (
  id uuid primary key default gen_random_uuid(),
  video_id uuid not null references public.videos(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  watch_duration integer, -- in seconds
  created_at timestamptz default now() not null
);

-- Enable RLS
alter table public.views enable row level security;

-- RLS Policies for views
create policy "views_select_own_videos"
  on public.views for select
  using (
    exists (
      select 1 from public.videos
      where videos.id = views.video_id
      and videos.user_id = auth.uid()
    )
  );

create policy "views_insert_all"
  on public.views for insert
  with check (true);

-- Create indexes
create index if not exists views_video_id_idx on public.views(video_id);
create index if not exists views_user_id_idx on public.views(user_id);
create index if not exists views_created_at_idx on public.views(created_at desc);
