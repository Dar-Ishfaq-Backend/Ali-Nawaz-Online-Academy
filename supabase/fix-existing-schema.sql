create extension if not exists pgcrypto;

alter table if exists public.payments
drop constraint if exists payments_course_id_fkey;

alter table if exists public.enrollments
drop constraint if exists enrollments_course_id_fkey;

alter table if exists public.payments
add column if not exists course_title text,
add column if not exists payment_reference text,
add column if not exists screenshot_url text,
add column if not exists payer_name text,
add column if not exists transaction_id text,
add column if not exists amount integer,
add column if not exists status text,
add column if not exists created_at timestamptz default now();

alter table if exists public.enrollments
add column if not exists status text,
add column if not exists created_at timestamptz default now();

alter table if exists public.profiles
add column if not exists name text,
add column if not exists email text,
add column if not exists role text,
add column if not exists created_at timestamptz default now();

alter table if exists public.courses
add column if not exists title text,
add column if not exists description text,
add column if not exists price integer,
add column if not exists is_paid boolean,
add column if not exists youtube_playlist_url text,
add column if not exists thumbnail text,
add column if not exists instructor text,
add column if not exists created_at timestamptz default now();

update public.profiles
set
  name = coalesce(nullif(name, ''), nullif(full_name, ''), split_part(email, '@', 1), 'Student'),
  email = coalesce(email, ''),
  role = coalesce(role, 'Student'),
  created_at = coalesce(created_at, now());

alter table if exists public.courses
alter column id type text using id::text;

alter table if exists public.payments
alter column course_id type text using course_id::text;

alter table if exists public.enrollments
alter column course_id type text using course_id::text;

alter table if exists public.payments
alter column amount type integer using coalesce(amount, 0)::integer;

alter table if exists public.payments
alter column course_title type text using coalesce(course_title, ''),
alter column transaction_id type text using coalesce(transaction_id, ''),
alter column payment_reference type text using coalesce(payment_reference, ''),
alter column payer_name type text using coalesce(payer_name, ''),
alter column screenshot_url type text using coalesce(screenshot_url, ''),
alter column status type text using coalesce(status, 'pending');

alter table if exists public.profiles
alter column name set default '',
alter column email set default '',
alter column role set default 'Student',
alter column created_at set default now();

alter table if exists public.courses
alter column title set default '',
alter column description set default '',
alter column price set default 0,
alter column is_paid set default false,
alter column youtube_playlist_url set default '',
alter column thumbnail set default '',
alter column instructor set default '',
alter column created_at set default now();

alter table if exists public.enrollments
alter column status set default 'active',
alter column created_at set default now();

alter table if exists public.payments
alter column course_title set default '',
alter column amount set default 0,
alter column status set default 'pending',
alter column payer_name set default '',
alter column transaction_id set default '',
alter column payment_reference set default '',
alter column screenshot_url set default '',
alter column created_at set default now();

alter table if exists public.payments
alter column course_title set not null,
alter column amount set not null,
alter column status set not null,
alter column payer_name set not null,
alter column transaction_id set not null,
alter column payment_reference set not null,
alter column screenshot_url set not null,
alter column created_at set not null;

alter table if exists public.enrollments
alter column status set not null,
alter column created_at set not null;

alter table if exists public.profiles
alter column name set not null,
alter column email set not null,
alter column role set not null,
alter column created_at set not null;

alter table if exists public.courses
alter column id set not null,
alter column title set not null,
alter column description set not null,
alter column price set not null,
alter column is_paid set not null,
alter column youtube_playlist_url set not null,
alter column thumbnail set not null,
alter column instructor set not null,
alter column created_at set not null;

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
  created_at timestamptz not null default now()
);

alter table if exists public.certificates
add column if not exists user_id uuid,
add column if not exists course_id text,
add column if not exists student_name text,
add column if not exists course_name text,
add column if not exists completion_date date default current_date,
add column if not exists issued_at timestamptz default now();

alter table if exists public.certificates
alter column certificate_id type text using certificate_id::text,
alter column course_id type text using course_id::text,
alter column student_name type text using coalesce(student_name, ''),
alter column course_name type text using coalesce(course_name, ''),
alter column completion_date set default current_date,
alter column issued_at set default now();

update public.certificates
set
  student_name = coalesce(student_name, ''),
  course_name = coalesce(course_name, ''),
  completion_date = coalesce(completion_date, current_date),
  issued_at = coalesce(issued_at, now());

alter table if exists public.certificates
alter column certificate_id set not null,
alter column user_id set not null,
alter column course_id set not null,
alter column student_name set not null,
alter column course_name set not null,
alter column completion_date set not null,
alter column issued_at set not null;

alter table if exists public.issues
add column if not exists user_id uuid,
add column if not exists role text,
add column if not exists subject text,
add column if not exists message text,
add column if not exists screenshot_url text,
add column if not exists status text,
add column if not exists assigned_to text,
add column if not exists created_at timestamptz default now();

update public.issues
set
  role = coalesce(nullif(role, ''), 'student'),
  subject = coalesce(subject, ''),
  message = coalesce(message, ''),
  screenshot_url = coalesce(screenshot_url, ''),
  status = coalesce(nullif(status, ''), 'open'),
  assigned_to = coalesce(nullif(assigned_to, ''), 'admin'),
  created_at = coalesce(created_at, now());

alter table if exists public.issues
alter column role type text using coalesce(role, 'student'),
alter column subject type text using coalesce(subject, ''),
alter column message type text using coalesce(message, ''),
alter column screenshot_url type text using coalesce(screenshot_url, ''),
alter column status type text using coalesce(status, 'open'),
alter column assigned_to type text using coalesce(assigned_to, 'admin'),
alter column created_at set default now();

alter table if exists public.issues
alter column user_id set not null,
alter column role set not null,
alter column subject set not null,
alter column message set not null,
alter column screenshot_url set not null,
alter column status set not null,
alter column assigned_to set not null,
alter column created_at set not null;

alter table if exists public.issues
drop constraint if exists issues_role_check;

alter table if exists public.issues
add constraint issues_role_check
check (role in ('student', 'admin'));

alter table if exists public.issues
drop constraint if exists issues_status_check;

alter table if exists public.issues
add constraint issues_status_check
check (status in ('open', 'resolved', 'escalated'));

alter table if exists public.issues
drop constraint if exists issues_assigned_to_check;

alter table if exists public.issues
add constraint issues_assigned_to_check
check (assigned_to in ('admin', 'super_admin'));

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

alter table if exists public.certificates enable row level security;
alter table if exists public.issues enable row level security;

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
with check (
  auth.uid() = user_id
  or exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role in ('Admin', 'Super Admin')
  )
);

drop policy if exists "Certificate owners and admins update rows" on public.certificates;
create policy "Certificate owners and admins update rows"
on public.certificates
for update
to authenticated
using (
  auth.uid() = user_id
  or exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role in ('Admin', 'Super Admin')
  )
)
with check (
  auth.uid() = user_id
  or exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role in ('Admin', 'Super Admin')
  )
);

drop policy if exists "Certificate owners and admins delete rows" on public.certificates;
create policy "Certificate owners and admins delete rows"
on public.certificates
for delete
to authenticated
using (
  auth.uid() = user_id
  or exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role in ('Admin', 'Super Admin')
  )
);

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
values ('issues', 'issues', true)
on conflict (id) do update
set public = excluded.public;

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
