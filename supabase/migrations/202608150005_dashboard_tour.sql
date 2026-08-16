-- Stores the latest dashboard tour version completed by each user.
-- The existing profiles_owner RLS policy restricts reads and writes to auth.uid().
alter table public.profiles
  add column if not exists dashboard_tour_version smallint not null default 0
  check (dashboard_tour_version >= 0);
