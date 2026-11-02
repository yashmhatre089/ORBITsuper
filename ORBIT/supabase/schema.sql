-- Run once in Supabase > SQL Editor
create table if not exists public.orbit_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null,
  updated_at timestamptz not null default now()
);
alter table public.orbit_state enable row level security;
drop policy if exists "orbit select own" on public.orbit_state;
drop policy if exists "orbit insert own" on public.orbit_state;
drop policy if exists "orbit update own" on public.orbit_state;
drop policy if exists "orbit delete own" on public.orbit_state;
create policy "orbit select own" on public.orbit_state for select using (auth.uid() = user_id);
create policy "orbit insert own" on public.orbit_state for insert with check (auth.uid() = user_id);
create policy "orbit update own" on public.orbit_state for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "orbit delete own" on public.orbit_state for delete using (auth.uid() = user_id);
