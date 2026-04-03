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

alter table if exists public.certificates enable row level security;

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
