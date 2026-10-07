-- ============================================================================
-- Invitacion Jonathan & Jasmin: base de datos completa (Supabase / Postgres).
--
-- Se aplica en un proyecto NUEVO de Supabase, de una de dos formas:
--   a) SQL Editor: pegar este archivo completo y ejecutar.
--   b) CLI: `npx supabase link --project-ref <ref>` y `npx supabase db push`.
-- Es idempotente: correrlo dos veces no rompe nada ni borra datos.
--
-- Despues de aplicarlo (ver supabase/README.md):
--   1. Authentication > Users > Add user: crear el usuario de los novios.
--   2. insert into public.admins (email) values ('su-correo@ejemplo.com');
--   3. Authentication > Sign In / Providers > Email: desactivar
--      "Allow new users to sign up".
--
-- Modelo de seguridad
--   - Invitado (rol anon, sin cuenta): NO puede leer ni escribir ninguna tabla.
--     Solo usa login_guest y submit_rsvp, que exigen su contrasena, devuelven
--     unicamente sus propios datos publicos y tienen limite de intentos por IP.
--   - Novios (rol authenticated + email en public.admins): acceso completo a
--     invitados y mesas. Cualquier otra cuenta autenticada no ve nada.
--   - Esquema private: no lo expone la API (solo public lo esta). Guarda los
--     intentos de acceso y el historial de respuestas.
-- ============================================================================


-- ─── Esquemas ───────────────────────────────────────────────────────────────

create schema if not exists private;
revoke all on schema private from public;
revoke all on schema private from anon, authenticated;


-- ─── Tablas de la app ───────────────────────────────────────────────────────

create table if not exists public.tables (
  id        text primary key check (char_length(id) between 1 and 64),
  name      text not null check (char_length(trim(name)) between 1 and 60),
  area      text not null default '' check (char_length(area) <= 60),
  capacity  integer not null default 8 check (capacity between 2 and 30)
);

create table if not exists public.guests (
  id                text primary key check (char_length(id) between 1 and 64),
  -- La contrasena se guarda legible a proposito: los novios la ven y la copian
  -- en el mensaje de invitacion. Solo el admin puede leer esta tabla.
  password          text not null unique
                      check (password = trim(password) and char_length(password) between 6 and 64),
  full_name         text not null check (char_length(trim(full_name)) between 1 and 120),
  names             text[] not null default '{}',
  phone             text not null default '' check (char_length(phone) <= 30),
  notes             text not null default '' check (char_length(notes) <= 1000),
  attendance        text not null default 'pending'
                      check (attendance in ('pending', 'confirmed', 'declined')),
  attendance_count  integer not null default 0 check (attendance_count >= 0),
  max_attendees     integer not null default 1 check (max_attendees between 1 and 20),
  -- '' = sin mesa (el admin guarda '' al desasignar, por eso no es FK)
  table_id          text not null default '' check (char_length(table_id) <= 64),
  -- sillas que ocupa en su mesa (1..30), una por persona confirmada
  seat_numbers      integer[] not null default '{}'
                      check (array_position(seat_numbers, null) is null
                             and coalesce(cardinality(seat_numbers), 0) <= 30),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  constraint guests_count_le_max check (attendance_count <= max_attendees)
);

-- Proyectos donde ya se corrio una version anterior del esquema
alter table public.guests add column if not exists seat_numbers integer[] not null default '{}';

-- Quienes pueden entrar a /novios
create table if not exists public.admins (
  email      text primary key check (email = lower(trim(email)) and email like '%_@_%'),
  created_at timestamptz not null default now()
);


-- ─── Tablas privadas ────────────────────────────────────────────────────────

-- Intentos fallidos de contrasena, para frenar la fuerza bruta
create table if not exists private.login_attempts (
  id         bigint generated always as identity primary key,
  client     text not null,
  at         timestamptz not null default now()
);
create index if not exists login_attempts_client_at on private.login_attempts (client, at);

-- Historial de respuestas: cada confirmacion queda registrada aunque despues
-- el invitado cambie de opinion (util ante dudas con los novios)
create table if not exists private.rsvp_log (
  id               bigint generated always as identity primary key,
  guest_id         text not null,
  attendance       text not null,
  attendance_count integer not null,
  client           text not null,
  at               timestamptz not null default now()
);
create index if not exists rsvp_log_guest on private.rsvp_log (guest_id, at);


-- ─── Integridad: normalizar invitados al guardar ────────────────────────────
-- Si no confirmo, no trae personas; nunca mas personas que su maximo.
-- updated_at siempre lo pone el servidor.

create or replace function private.guests_normalize()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.attendance <> 'confirmed' then
    new.attendance_count := 0;
  end if;
  new.attendance_count := least(new.attendance_count, new.max_attendees);
  if new.attendance <> 'confirmed' then
    new.table_id := '';
    new.seat_numbers := '{}';
  end if;
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists guests_normalize on public.guests;
create trigger guests_normalize
  before insert or update on public.guests
  for each row execute function private.guests_normalize();


-- ─── Helpers privados ───────────────────────────────────────────────────────

-- IP del cliente segun los headers que pasa la API de Supabase
create or replace function private.client_id()
returns text
language sql
stable
set search_path = ''
as $$
  select coalesce(
    nullif(split_part(coalesce(
      (current_setting('request.headers', true)::json ->> 'cf-connecting-ip'),
      (current_setting('request.headers', true)::json ->> 'x-real-ip'),
      (current_setting('request.headers', true)::json ->> 'x-forwarded-for')
    ), ',', 1), ''),
    'desconocido'
  );
$$;

-- Corta si esta IP fallo demasiadas veces en la ventana reciente
create or replace function private.check_rate_limit(p_client text)
returns void
language plpgsql
set search_path = ''
as $$
declare
  fallidos integer;
begin
  -- limpieza: los intentos viejos ya no cuentan
  delete from private.login_attempts where at < now() - interval '1 day';

  select count(*) into fallidos
  from private.login_attempts
  where client = p_client and at > now() - interval '15 minutes';

  if fallidos >= 10 then
    raise exception 'Demasiados intentos. Espera unos minutos y vuelve a intentar.'
      using errcode = 'P0429';
  end if;
end;
$$;


-- ─── Seguridad (RLS) ────────────────────────────────────────────────────────

alter table public.guests enable row level security;
alter table public.tables enable row level security;
alter table public.admins enable row level security;

-- Defensa en profundidad: aunque RLS ya bloquea, el invitado anonimo no tiene
-- ningun privilegio sobre las tablas.
revoke all on public.guests, public.tables, public.admins from anon;
grant select, insert, update, delete on public.guests, public.tables to authenticated;
revoke all on public.admins from authenticated;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admins
    where email = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

drop policy if exists "admin full access guests" on public.guests;
create policy "admin full access guests" on public.guests
  for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

drop policy if exists "admin full access tables" on public.tables;
create policy "admin full access tables" on public.tables
  for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- public.admins no tiene policies: no se lee ni escribe desde la app. Se
-- administra desde el SQL Editor (rol postgres).


-- ─── RPCs del invitado ──────────────────────────────────────────────────────
-- Devuelven solo lo que la invitacion necesita. Nunca notes, phone, mesa ni
-- sillas: las notas son privadas de los novios.

drop function if exists public.login_guest(text);
create or replace function public.login_guest(p_password text)
returns table (
  id               text,
  password         text,
  full_name        text,
  names            text[],
  attendance       text,
  attendance_count integer,
  max_attendees    integer,
  created_at       timestamptz,
  updated_at       timestamptz
)
language plpgsql
volatile
security definer
set search_path = ''
as $$
#variable_conflict use_column
declare
  cliente text := private.client_id();
  clave   text := trim(coalesce(p_password, ''));
begin
  perform private.check_rate_limit(cliente);

  return query
    select g.id, g.password, g.full_name, g.names, g.attendance,
           g.attendance_count, g.max_attendees, g.created_at, g.updated_at
    from public.guests g
    where g.password = clave and clave <> ''
    limit 1;

  if not found then
    insert into private.login_attempts (client) values (cliente);
  end if;
end;
$$;

-- Confirmacion. Valida la contrasena, respeta max_attendees en el servidor y
-- no toca las notas del admin.
drop function if exists public.submit_rsvp(text, text, text, integer, text);
drop function if exists public.submit_rsvp(text, text, text, integer);
create or replace function public.submit_rsvp(
  p_guest_id          text,
  p_password          text,
  p_attendance        text,
  p_attendance_count  integer
)
returns table (
  id               text,
  password         text,
  full_name        text,
  names            text[],
  attendance       text,
  attendance_count integer,
  max_attendees    integer,
  created_at       timestamptz,
  updated_at       timestamptz
)
language plpgsql
volatile
security definer
set search_path = ''
as $$
#variable_conflict use_column
declare
  cliente text := private.client_id();
begin
  perform private.check_rate_limit(cliente);

  if p_attendance not in ('confirmed', 'declined') then
    raise exception 'Respuesta invalida.' using errcode = '22023';
  end if;

  return query
    update public.guests g
    set attendance       = p_attendance,
        attendance_count = case
                             when p_attendance = 'confirmed'
                               then least(greatest(coalesce(p_attendance_count, 1), 1), g.max_attendees)
                             else 0
                           end
    where g.id = p_guest_id
      and g.password = p_password
    returning g.id, g.password, g.full_name, g.names, g.attendance,
              g.attendance_count, g.max_attendees, g.created_at, g.updated_at;

  if not found then
    insert into private.login_attempts (client) values (cliente);
  else
    insert into private.rsvp_log (guest_id, attendance, attendance_count, client)
      select g.id, g.attendance, g.attendance_count, cliente
      from public.guests g where g.id = p_guest_id;
  end if;
end;
$$;

revoke all on function public.login_guest(text) from public;
revoke all on function public.submit_rsvp(text, text, text, integer) from public;
grant execute on function public.login_guest(text) to anon, authenticated;
grant execute on function public.submit_rsvp(text, text, text, integer) to anon, authenticated;

-- Las funciones privadas no se pueden llamar desde la API
revoke all on all functions in schema private from public, anon, authenticated;
