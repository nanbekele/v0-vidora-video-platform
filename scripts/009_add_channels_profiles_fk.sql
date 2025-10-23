-- Add foreign key from channels to profiles
alter table public.channels
add constraint channels_user_id_fk_profiles
foreign key (user_id) references public.profiles(id) on delete cascade;
