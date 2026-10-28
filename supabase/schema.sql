-- Encoding Experiences Summit — Supabase schema
-- Run this in the Supabase SQL editor (Dashboard → SQL → New query).

create extension if not exists pgcrypto;

-- ————————————————————————————————— notes ——————————————————————————————————

create table public.notes (
  id         uuid primary key default gen_random_uuid(),
  anchor_id  text not null,
  what       text not null check (char_length(what) between 1 and 180),
  how        text not null default '' check (char_length(how)  <= 180),
  why        text not null default '' check (char_length(why)  <= 180),
  wish       text not null default '' check (char_length(wish) <= 180),
  methods    text[] not null default '{}',
  author     text check (char_length(author) <= 80),
  hidden     boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.notes enable row level security;

-- Anyone may read notes that are not hidden…
create policy "public read visible notes"
  on public.notes for select
  using (hidden = false);

-- …and anyone may add a note (never pre-hidden).
create policy "public insert notes"
  on public.notes for insert
  with check (hidden = false);

-- No update/delete policies exist: moderation goes through the
-- password-checked functions below, which run as the table owner.

-- —————————————————————————————— admin password ————————————————————————————

-- Single-row table holding a bcrypt hash. RLS is on with no policies,
-- so it is unreadable and unwritable through the public API.
create table public.admin_secret (
  id            boolean primary key default true check (id),
  password_hash text not null
);
alter table public.admin_secret enable row level security;

-- Set the admin password (re-run any time to change it):
insert into public.admin_secret (id, password_hash)
values (true, crypt('pd-kz?@zSCAc9,m', gen_salt('bf')))
on conflict (id) do update set password_hash = excluded.password_hash;

create or replace function public.check_admin(pass text)
returns void
language plpgsql security definer set search_path = public
as $$
begin
  if not exists (
    select 1 from admin_secret where password_hash = crypt(pass, password_hash)
  ) then
    raise exception 'Wrong admin password';
  end if;
end;
$$;

-- —————————————————————————————— admin functions ————————————————————————————

create or replace function public.admin_list_notes(admin_password text)
returns setof public.notes
language plpgsql security definer set search_path = public
as $$
begin
  perform check_admin(admin_password);
  return query select * from notes order by created_at desc;
end;
$$;

create or replace function public.admin_set_hidden(note_id uuid, hide boolean, admin_password text)
returns void
language plpgsql security definer set search_path = public
as $$
begin
  perform check_admin(admin_password);
  update notes set hidden = hide where id = note_id;
end;
$$;

create or replace function public.admin_delete_note(note_id uuid, admin_password text)
returns void
language plpgsql security definer set search_path = public
as $$
begin
  perform check_admin(admin_password);
  delete from notes where id = note_id;
end;
$$;

-- ————————————————————————————————— realtime ————————————————————————————————

-- Let clients subscribe to note changes (the app refetches on any event).
alter publication supabase_realtime add table public.notes;
