-- Create subscriptions table
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  subscriber_id uuid not null references auth.users(id) on delete cascade,
  channel_id uuid not null references public.channels(id) on delete cascade,
  created_at timestamptz default now() not null,
  unique(subscriber_id, channel_id)
);

-- Enable RLS
alter table public.subscriptions enable row level security;

-- RLS Policies for subscriptions
create policy "subscriptions_select_all"
  on public.subscriptions for select
  using (true);

create policy "subscriptions_insert_authenticated"
  on public.subscriptions for insert
  with check (auth.uid() = subscriber_id);

create policy "subscriptions_delete_own"
  on public.subscriptions for delete
  using (auth.uid() = subscriber_id);

-- Create indexes
create index if not exists subscriptions_subscriber_id_idx on public.subscriptions(subscriber_id);
create index if not exists subscriptions_channel_id_idx on public.subscriptions(channel_id);
