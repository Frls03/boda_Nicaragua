// ============================================================================
// MODO DEMO, SOLO PARA PRUEBAS. Borrar cuando Supabase este conectado.
//
// Imita la parte del cliente de Supabase que usa src/data/wedding.js, con
// datos guardados en localStorage de este navegador. Se usa solo si faltan
// VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY (ver supabaseClient.js).
//
// Para quitarlo:
//   1. Borrar este archivo.
//   2. supabaseClient.js: quitar el import y el `?? demoClient`, y `isDemo`.
//   3. App.jsx: quitar el import de isDemo y el bloque {isDemo && ...}.
// ============================================================================

export const DEMO_ADMIN = { email: 'admin@demo.com', password: 'demo1234' };

const KEY = 'jj.demo.db.v2'; // v2: con sillas
const now = () => new Date().toISOString();

function seed() {
  const t = now();
  const guest = (id, full_name, password, max_attendees, attendance = 'pending', attendance_count = 0, table_id = '', seat_numbers = []) => ({
    id, password, full_name, names: [full_name], phone: '', notes: '',
    attendance, attendance_count, max_attendees, table_id, seat_numbers, created_at: t, updated_at: t,
  });
  return {
    session: null,
    guests: [
      guest('g-demo-1', 'Familia Pérez', 'demo-familia', 4),
      guest('g-demo-2', 'Ana López', 'demo-ana', 1),
      guest('g-demo-3', 'Carlos y María Ruiz', 'demo-pareja', 2, 'confirmed', 2, 't-demo-1', [1, 2]),
      guest('g-demo-5', 'Lucía Méndez', 'demo-lucia', 3, 'confirmed', 3),
      guest('g-demo-4', 'Roberto Díaz', 'demo-roberto', 2, 'declined'),
    ],
    tables: [
      { id: 't-demo-1', name: 'Mesa 1', area: 'Familia', capacity: 8 },
      { id: 't-demo-2', name: 'Mesa 2', area: 'Amigos', capacity: 10 },
    ],
  };
}

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // almacenamiento bloqueado: se trabaja en memoria
  }
  return seed();
}

let db = load();

function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(db));
  } catch {
    // sin almacenamiento: los cambios duran hasta recargar
  }
}

// Respuestas con la misma forma que Supabase: { data, error }
const ok = (data = null) => Promise.resolve({ data, error: null });
const fail = (message) => Promise.resolve({ data: null, error: new Error(message) });
const noAuth = () => fail('Modo demo: inicia sesión como admin.');

function from(table) {
  return {
    select() {
      return {
        order(column, { ascending = true } = {}) {
          if (!db.session) return noAuth();
          const rows = [...db[table]].sort((a, b) =>
            String(a[column]).localeCompare(String(b[column]), 'es', { numeric: true })
          );
          return ok(ascending ? rows : rows.reverse());
        },
      };
    },
    upsert(rows) {
      if (!db.session) return noAuth();
      for (const row of rows) {
        const i = db[table].findIndex((r) => r.id === row.id);
        if (i >= 0) db[table][i] = { ...db[table][i], ...row };
        else db[table].push({ created_at: now(), ...row });
      }
      save();
      return ok();
    },
    delete() {
      return {
        eq(column, value) {
          if (!db.session) return noAuth();
          db[table] = db[table].filter((r) => r[column] !== value);
          save();
          return ok();
        },
      };
    },
  };
}

// Mismas reglas que las funciones de supabase/schema.sql
function rpc(name, args) {
  if (name === 'login_guest') {
    const pwd = String(args.p_password ?? '').trim();
    return ok(pwd ? db.guests.filter((g) => g.password === pwd).slice(0, 1) : []);
  }

  if (name === 'submit_rsvp') {
    if (!['confirmed', 'declined'].includes(args.p_attendance)) {
      return fail(`attendance invalido: ${args.p_attendance}`);
    }
    const g = db.guests.find((r) => r.id === args.p_guest_id && r.password === args.p_password);
    if (!g) return ok([]);
    g.attendance = args.p_attendance;
    g.attendance_count =
      args.p_attendance === 'confirmed'
        ? Math.min(Math.max(Number(args.p_attendance_count) || 1, 1), g.max_attendees)
        : 0;
    g.notes = String(args.p_notes ?? '').slice(0, 1000);
    g.updated_at = now();
    save();
    return ok([{ ...g }]);
  }

  return fail(`Modo demo: rpc desconocida ${name}`);
}

const auth = {
  getSession: () => ok({ session: db.session }),
  signInWithPassword({ email, password }) {
    if (email?.toLowerCase() !== DEMO_ADMIN.email || password !== DEMO_ADMIN.password) {
      return fail('Invalid login credentials');
    }
    db.session = { user: { email: DEMO_ADMIN.email } };
    save();
    return ok({ session: db.session });
  },
  signOut() {
    db.session = null;
    save();
    return ok();
  },
};

export const demoClient = { from, rpc, auth };

// Vuelve los datos de prueba a como estaban al principio.
export function resetDemo() {
  db = seed();
  save();
}
