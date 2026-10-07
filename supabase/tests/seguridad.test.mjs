// Pruebas de la base de datos contra un Postgres real en memoria (PGlite).
// Simula lo minimo de Supabase (roles anon/authenticated, auth.jwt(), headers
// de la API) y verifica funcionalidad y reglas de seguridad de la migracion.
//
//   npm run test:db
import { PGlite } from '@electric-sql/pglite';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const aqui = dirname(fileURLToPath(import.meta.url));
const migraciones = join(aqui, '..', 'migrations');

const db = new PGlite();
let fallos = 0;
let ok = 0;

function check(nombre, cond, detalle = '') {
  if (cond) { ok++; console.log(`  ok    ${nombre}`); }
  else { fallos++; console.log(`  FALLA ${nombre}${detalle ? `  (${detalle})` : ''}`); }
}

async function falla(sql, params = []) {
  try { await db.query(sql, params); return null; } catch (e) { return e; }
}

// Ejecuta como un rol de Supabase, con su JWT y su IP simulados
async function como(rol, { email = null, ip = '203.0.113.7' } = {}, fn) {
  const claims = email ? JSON.stringify({ role: rol, email }) : JSON.stringify({ role: rol });
  await db.exec(`reset role;`);
  await db.query(`select set_config('request.jwt.claims', $1, false)`, [claims]);
  await db.query(`select set_config('request.headers', $1, false)`, [JSON.stringify({ 'x-forwarded-for': `${ip}, 10.0.0.1` })]);
  await db.exec(`set role ${rol};`);
  try { return await fn(); } finally { await db.exec(`reset role;`); }
}

// ── Lo minimo de Supabase ───────────────────────────────────────────────────
await db.exec(`
  create role anon nologin;
  create role authenticated nologin;
  create schema auth;
  create function auth.jwt() returns jsonb language sql stable as $$
    select coalesce(nullif(current_setting('request.jwt.claims', true), ''), '{}')::jsonb
  $$;
  grant usage on schema auth to anon, authenticated;
  grant execute on function auth.jwt() to anon, authenticated;
  grant usage on schema public to anon, authenticated;
`);

// ── Migracion (dos veces: debe ser idempotente) ─────────────────────────────
for (const f of readdirSync(migraciones).filter((x) => x.endsWith('.sql')).sort()) {
  const sql = readFileSync(join(migraciones, f), 'utf8');
  await db.exec(sql);
  await db.exec(sql);
}
console.log('migracion aplicada dos veces sin errores\n');

// ── Datos de prueba (como postgres, igual que desde el SQL Editor) ──────────
await db.exec(`
  insert into public.admins (email) values ('novios@boda.com');
  insert into public.tables (id, name, area, capacity) values ('t1', 'Mesa 1', 'Familia', 8);
  insert into public.guests (id, password, full_name, max_attendees, notes, phone)
    values ('g1', 'perez-7k2m', 'Familia Perez', 4, 'nota privada de los novios', '5555-5555'),
           ('g2', 'lopez-9x1q', 'Ana Lopez', 1, '', '');
`);

console.log('Invitado anonimo');
await como('anon', {}, async () => {
  check('no puede leer invitados', !!(await falla('select * from public.guests')));
  check('no puede leer mesas', !!(await falla('select * from public.tables')));
  check('no puede leer admins', !!(await falla('select * from public.admins')));
  check('no puede escribir invitados', !!(await falla(`update public.guests set max_attendees = 20`)));
  check('no puede ver el esquema private', !!(await falla('select * from private.login_attempts')));
  check('no puede llamar funciones privadas', !!(await falla('select private.check_rate_limit($1)', ['x'])));

  const r = await db.query(`select * from public.login_guest('perez-7k2m')`);
  check('login con contrasena correcta devuelve su invitacion', r.rows.length === 1 && r.rows[0].full_name === 'Familia Perez');
  const cols = Object.keys(r.rows[0] ?? {});
  check('login NO devuelve notas, telefono ni mesa', !cols.includes('notes') && !cols.includes('phone') && !cols.includes('table_id'), cols.join(','));
  check('login con contrasena incorrecta no devuelve nada', (await db.query(`select * from public.login_guest('nope-nope')`)).rows.length === 0);
  check('login con contrasena vacia no devuelve nada', (await db.query(`select * from public.login_guest('   ')`)).rows.length === 0);

  const pide9 = await db.query(`select * from public.submit_rsvp('g1', 'perez-7k2m', 'confirmed', 9)`);
  check('confirmar 9 con maximo 4 guarda 4', pide9.rows[0]?.attendance_count === 4, `guardo ${pide9.rows[0]?.attendance_count}`);
  const mala = await db.query(`select * from public.submit_rsvp('g1', 'otra-clave', 'confirmed', 1)`);
  check('confirmar con contrasena ajena no cambia nada', mala.rows.length === 0);
  check('respuesta invalida se rechaza', !!(await falla(`select * from public.submit_rsvp('g2', 'lopez-9x1q', 'maybe', 1)`)));
  const no = await db.query(`select * from public.submit_rsvp('g2', 'lopez-9x1q', 'declined', 3)`);
  check('no asistire guarda 0 personas', no.rows[0]?.attendance_count === 0);
});

const notas = await db.query(`select notes from public.guests where id = 'g1'`);
check('las notas del admin siguen intactas tras confirmar', notes(notas) === 'nota privada de los novios');
function notes(r) { return r.rows[0]?.notes; }
const log = await db.query(`select count(*)::int as n from private.rsvp_log`);
check('cada respuesta queda en el historial', log.rows[0].n === 2, `${log.rows[0].n} registros`);

console.log('\nFuerza bruta');
await db.exec(`truncate private.login_attempts;`);
await como('anon', { ip: '198.51.100.9' }, async () => {
  for (let i = 0; i < 10; i++) await db.query(`select * from public.login_guest($1)`, [`intento-${i}`]);
  const e = await falla(`select * from public.login_guest('perez-7k2m')`);
  check('tras 10 fallos, esa IP queda bloqueada (incluso con la clave correcta)', !!e && /Demasiados intentos/.test(e.message), e?.message);
  check('el bloqueo tambien aplica a submit_rsvp', !!(await falla(`select * from public.submit_rsvp('g1', 'perez-7k2m', 'confirmed', 1)`)));
});
await como('anon', { ip: '192.0.2.44' }, async () => {
  const r = await db.query(`select * from public.login_guest('perez-7k2m')`);
  check('otra IP no queda afectada', r.rows.length === 1);
});
await db.exec(`update private.login_attempts set at = now() - interval '16 minutes';`);
await como('anon', { ip: '198.51.100.9' }, async () => {
  const r = await db.query(`select * from public.login_guest('perez-7k2m')`);
  check('pasados 15 minutos, la IP puede volver a intentar', r.rows.length === 1);
});

console.log('\nCuenta autenticada que NO es admin');
await como('authenticated', { email: 'intruso@mail.com' }, async () => {
  check('no ve invitados', (await db.query('select * from public.guests')).rows.length === 0);
  check('no ve mesas', (await db.query('select * from public.tables')).rows.length === 0);
  check('no puede crear invitados', !!(await falla(`insert into public.guests (id, password, full_name) values ('x', 'xxxxxx', 'X')`)));
  check('no puede leer la lista de admins', !!(await falla('select * from public.admins')));
  check('no puede agregarse como admin', !!(await falla(`insert into public.admins (email) values ('intruso@mail.com')`)));
});

console.log('\nNovios (admin)');
await como('authenticated', { email: 'Novios@Boda.com' }, async () => {
  check('ven todos los invitados (email sin importar mayusculas)', (await db.query('select * from public.guests')).rows.length === 2);
  check('ven las notas privadas', (await db.query(`select notes from public.guests where id = 'g1'`)).rows[0]?.notes.length > 0);
  await db.query(`insert into public.guests (id, password, full_name, max_attendees) values ('g3', 'ruiz-4p8w', 'Carlos Ruiz', 2)
                  on conflict (id) do update set full_name = excluded.full_name`);
  check('pueden crear invitados (upsert)', (await db.query(`select 1 from public.guests where id = 'g3'`)).rows.length === 1);
  check('contrasena repetida se rechaza', !!(await falla(`insert into public.guests (id, password, full_name) values ('g4', 'ruiz-4p8w', 'Otro')`)));
  check('contrasena corta se rechaza', !!(await falla(`insert into public.guests (id, password, full_name) values ('g5', 'abc', 'Corta')`)));
  check('contrasena con espacios al borde se rechaza', !!(await falla(`insert into public.guests (id, password, full_name) values ('g6', ' clave-ok ', 'Esp')`)));
  check('maximo fuera de rango se rechaza', !!(await falla(`insert into public.guests (id, password, full_name, max_attendees) values ('g7', 'clave-777', 'Max', 50)`)));
  await db.query(`update public.guests set max_attendees = 2 where id = 'g1'`);
  check('bajar el maximo ajusta las personas confirmadas', (await db.query(`select attendance_count from public.guests where id = 'g1'`)).rows[0].attendance_count === 2);
  await db.query(`update public.guests set table_id = 't1', seat_numbers = '{1,2}' where id = 'g1'`);
  await db.query(`update public.guests set attendance = 'declined' where id = 'g1'`);
  const g1 = (await db.query(`select attendance_count, table_id, seat_numbers from public.guests where id = 'g1'`)).rows[0];
  check('si pasa a "no asistira" libera su mesa y sus sillas', g1.attendance_count === 0 && g1.table_id === '' && g1.seat_numbers.length === 0);
  await db.query(`insert into public.tables (id, name, capacity) values ('t2', 'Mesa 2', 10)`);
  check('pueden crear mesas', (await db.query('select * from public.tables')).rows.length === 2);
  check('capacidad fuera de rango se rechaza', !!(await falla(`insert into public.tables (id, name, capacity) values ('t3', 'X', 99)`)));
  await db.query(`delete from public.guests where id = 'g3'`);
  check('pueden borrar invitados', (await db.query(`select 1 from public.guests where id = 'g3'`)).rows.length === 0);
  check('no pueden leer la lista de admins desde la app', !!(await falla('select * from public.admins')));
  check('no ven el historial privado', !!(await falla('select * from private.rsvp_log')));
});

console.log(`\n${ok} pruebas ok, ${fallos} fallas`);
process.exit(fallos ? 1 : 0);
