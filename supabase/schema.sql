create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '',
  email text not null default '',
  role text not null default 'Student',
  created_at timestamptz not null default now()
);

create table if not exists public.courses (
  id text primary key,
  title text not null default '',
  description text not null default '',
  price integer not null default 0,
  is_paid boolean not null default false,
  youtube_playlist_url text not null default '',
  thumbnail text not null default '',
  instructor text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id text not null,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  unique (user_id, course_id)
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id text not null,
  course_title text not null default '',
  amount integer not null default 0,
  status text not null default 'pending',
  payer_name text not null default '',
  transaction_id text not null default '',
  payment_reference text not null default '',
  screenshot_url text not null default '',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.enrollments enable row level security;
alter table public.payments enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select coalesce(
    (
      select role in ('Admin', 'Super Admin')
      from public.profiles
      where id = auth.uid()
    ),
    false
  );
$$;

drop policy if exists "Profiles select own row" on public.profiles;
create policy "Profiles select own row"
on public.profiles
for select
to authenticated
using (auth.uid() = id or public.is_admin());

drop policy if exists "Profiles insert own row" on public.profiles;
create policy "Profiles insert own row"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists "Profiles update own row" on public.profiles;
create policy "Profiles update own row"
on public.profiles
for update
to authenticated
using (auth.uid() = id or public.is_admin())
with check (auth.uid() = id or public.is_admin());

drop policy if exists "Courses are visible to authenticated users" on public.courses;
create policy "Courses are visible to authenticated users"
on public.courses
for select
to authenticated
using (true);

drop policy if exists "Admins manage courses" on public.courses;
create policy "Admins manage courses"
on public.courses
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Payments select own rows" on public.payments;
create policy "Payments select own rows"
on public.payments
for select
to authenticated
using (auth.uid() = user_id or public.is_admin());

drop policy if exists "Payments insert own rows" on public.payments;
create policy "Payments insert own rows"
on public.payments
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Payments admin update rows" on public.payments;
create policy "Payments admin update rows"
on public.payments
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Enrollments select own rows" on public.enrollments;
create policy "Enrollments select own rows"
on public.enrollments
for select
to authenticated
using (auth.uid() = user_id or public.is_admin());

drop policy if exists "Enrollments admin insert rows" on public.enrollments;
create policy "Enrollments admin insert rows"
on public.enrollments
for insert
to authenticated
with check (public.is_admin());

drop policy if exists "Enrollments admin update rows" on public.enrollments;
create policy "Enrollments admin update rows"
on public.enrollments
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

insert into storage.buckets (id, name, public)
values ('payments', 'payments', true)
on conflict (id) do update
set public = excluded.public;

drop policy if exists "Payment screenshots are publicly viewable" on storage.objects;
create policy "Payment screenshots are publicly viewable"
on storage.objects
for select
to public
using (bucket_id = 'payments');

drop policy if exists "Authenticated users can upload payment screenshots" on storage.objects;
create policy "Authenticated users can upload payment screenshots"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'payments');
