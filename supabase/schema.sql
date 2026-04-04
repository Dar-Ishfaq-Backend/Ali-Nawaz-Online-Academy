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

create table if not exists public.certificates (
  certificate_id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id text not null,
  student_name text not null default '',
  course_name text not null default '',
  completion_date date not null default current_date,
  issued_at timestamptz not null default now()
);

create table if not exists public.issues (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'student',
  subject text not null default '',
  message text not null default '',
  screenshot_url text not null default '',
  status text not null default 'open',
  assigned_to text not null default 'admin',
  created_at timestamptz not null default now(),
  constraint issues_role_check check (role in ('student', 'admin')),
  constraint issues_status_check check (status in ('open', 'resolved', 'escalated')),
  constraint issues_assigned_to_check check (assigned_to in ('admin', 'super_admin'))
);

alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.enrollments enable row level security;
alter table public.payments enable row level security;
alter table public.certificates enable row level security;
alter table public.issues enable row level security;

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

create or replace function public.current_platform_role()
returns text
language sql
stable
as $$
  select coalesce(
    (
      select role
      from public.profiles
      where id = auth.uid()
    ),
    'Student'
  );
$$;

create or replace function public.is_super_admin()
returns boolean
language sql
stable
as $$
  select public.current_platform_role() = 'Super Admin';
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

drop policy if exists "Certificates are publicly verifiable" on public.certificates;
create policy "Certificates are publicly verifiable"
on public.certificates
for select
to public
using (true);

drop policy if exists "Certificate owners and admins insert rows" on public.certificates;
create policy "Certificate owners and admins insert rows"
on public.certificates
for insert
to authenticated
with check (auth.uid() = user_id or public.is_admin());

drop policy if exists "Certificate owners and admins update rows" on public.certificates;
create policy "Certificate owners and admins update rows"
on public.certificates
for update
to authenticated
using (auth.uid() = user_id or public.is_admin())
with check (auth.uid() = user_id or public.is_admin());

drop policy if exists "Certificate owners and admins delete rows" on public.certificates;
create policy "Certificate owners and admins delete rows"
on public.certificates
for delete
to authenticated
using (auth.uid() = user_id or public.is_admin());

drop policy if exists "Students view their own issues" on public.issues;
create policy "Students view their own issues"
on public.issues
for select
to authenticated
using (
  auth.uid() = user_id
  or (
    public.current_platform_role() = 'Admin'
    and role = 'student'
  )
  or (
    public.current_platform_role() = 'Super Admin'
    and assigned_to = 'super_admin'
  )
);

drop policy if exists "Students create their own issues" on public.issues;
create policy "Students create their own issues"
on public.issues
for insert
to authenticated
with check (
  auth.uid() = user_id
  and role = 'student'
  and status = 'open'
  and assigned_to = 'admin'
);

drop policy if exists "Admins update assigned issues" on public.issues;
create policy "Admins update assigned issues"
on public.issues
for update
to authenticated
using (
  public.current_platform_role() = 'Admin'
  and role = 'student'
  and assigned_to = 'admin'
)
with check (
  public.current_platform_role() = 'Admin'
  and role = 'student'
  and assigned_to in ('admin', 'super_admin')
  and status in ('open', 'resolved', 'escalated')
);

drop policy if exists "Super admins update escalated issues" on public.issues;
create policy "Super admins update escalated issues"
on public.issues
for update
to authenticated
using (
  public.current_platform_role() = 'Super Admin'
  and assigned_to = 'super_admin'
)
with check (
  public.current_platform_role() = 'Super Admin'
  and assigned_to = 'super_admin'
  and status in ('escalated', 'resolved')
);

insert into storage.buckets (id, name, public)
values ('payments', 'payments', true)
on conflict (id) do update
set public = excluded.public;

insert into storage.buckets (id, name, public)
values ('issues', 'issues', true)
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

drop policy if exists "Issue screenshots are publicly viewable" on storage.objects;
create policy "Issue screenshots are publicly viewable"
on storage.objects
for select
to public
using (bucket_id = 'issues');

drop policy if exists "Authenticated users can upload issue screenshots" on storage.objects;
create policy "Authenticated users can upload issue screenshots"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'issues');

drop policy if exists "Authenticated users can delete issue screenshots" on storage.objects;
create policy "Authenticated users can delete issue screenshots"
on storage.objects
for delete
to authenticated
using (bucket_id = 'issues');
