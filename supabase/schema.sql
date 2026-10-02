-- ============================================================================
-- Invitacion Jonathan & Jasmin: esquema de Supabase para el admin y el RSVP.
--
-- Replicado del admin de webapp_bodanica (src/data/wedding.js). Ese repo no
-- trae el SQL; esto se reconstruyo a partir de las columnas y RPCs que usa
-- el codigo. Correr completo en Supabase > SQL Editor, en un proyecto NUEVO
-- (no el de la otra boda: los invitados son otros).
--
-- Despues de correrlo:
--   1. Authentication > Users > Add user: crear el usuario admin (email + clave).
--   2. Agregar ese email a la tabla admins (ver el insert al final).
--   3. Authentication > Sign In / Providers: desactivar "Allow new users to sign up".
-- ============================================================================


-- ─── Tablas ─────────────────────────────────────────────────────────────────

create table if not exists public.tables (
  id        text primary key,
  name      text not null,
  area      text not null default '',
  capacity  integer not null default 8 check (capacity between 2 and 30)
);

create table if not exists public.guests (
  id                text primary key,
  password          text not null unique,
  full_name         text not null,
  names             text[] not null default '{}',
  phone             text not null default '',
  notes             text not null default '',
  attendance        text not null default 'pending'
                      check (attendance in ('pending', 'confirmed', 'declined')),
  attendance_count  integer not null default 0 check (attendance_count >= 0),
  max_attendees     integer not null default 1 check (max_attendees >= 1),
  -- '' = sin mesa. Texto y no FK porque el admin guarda '' al desasignar.
  table_id          text not null default '',
  -- sillas que ocupa en su mesa (1..capacidad), una por persona confirmada
  seat_numbers      integer[] not null default '{}',
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- Si ya habias corrido una version anterior de este archivo (sin sillas):
alter table public.guests add column if not exists seat_numbers integer[] not null default '{}';

-- Quienes pueden entrar a /novios. Cualquier usuario de Supabase Auth que NO
-- este aca no ve ni toca nada, aunque logre iniciar sesion.
create table if not exists public.admins (
  email text primary key
);


-- ─── Seguridad (RLS) ────────────────────────────────────────────────────────
-- El invitado (rol anon) NO lee tablas directo: solo usa las dos funciones de
-- abajo, que exigen su contrasena. El admin lee y escribe todo.

alter table public.guests enable row level security;
alter table public.tables enable row level security;
alter table public.admins enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admins
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

drop policy if exists "admin full access guests" on public.guests;
create policy "admin full access guests" on public.guests
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin full access tables" on public.tables;
create policy "admin full access tables" on public.tables
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- La tabla admins no tiene policies: no se lee ni escribe desde la app.
-- Se administra desde el SQL Editor.


-- ─── RPCs del invitado ──────────────────────────────────────────────────────

-- Login con la contrasena de la invitacion. Devuelve la fila o nada.
create or replace function public.login_guest(p_password text)
returns setof public.guests
language sql
stable
security definer
set search_path = public
as $$
  select * from public.guests
  where password = trim(p_password)
    and trim(p_password) <> ''
  limit 1;
$$;

-- Confirmacion. Valida la contrasena y respeta max_attendees en el servidor:
-- aunque el navegador mande otro numero, nunca queda por encima del maximo.
create or replace function public.submit_rsvp(
  p_guest_id          text,
  p_password          text,
  p_attendance        text,
  p_attendance_count  integer,
  p_notes             text
)
returns setof public.guests
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_attendance not in ('confirmed', 'declined') then
    raise exception 'attendance invalido: %', p_attendance;
  end if;

  return query
  update public.guests g
  set attendance       = p_attendance,
      attendance_count = case
                           when p_attendance = 'confirmed'
                             then least(greatest(coalesce(p_attendance_count, 1), 1), g.max_attendees)
                           else 0
                         end,
      notes            = left(coalesce(p_notes, ''), 1000),
      updated_at       = now()
  where g.id = p_guest_id
    and g.password = p_password
  returning g.*;
end;
$$;

revoke all on function public.login_guest(text) from public;
revoke all on function public.submit_rsvp(text, text, text, integer, text) from public;
grant execute on function public.login_guest(text) to anon, authenticated;
grant execute on function public.submit_rsvp(text, text, text, integer, text) to anon, authenticated;


-- ─── Admin inicial ──────────────────────────────────────────────────────────
-- Cambiar por el email con el que vas a entrar a /novios y descomentar:
-- insert into public.admins (email) values ('tu-correo@ejemplo.com');
