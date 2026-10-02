// Capa de datos del admin y del RSVP, replicada de webapp_bodanica
// (src/data/wedding.js). Se quito lo propio de esa boda (textos de playa,
// hospedaje, galeria de subida). El esquema esta en supabase/schema.sql.
import { requireSupabase } from '../lib/supabaseClient';

// ─── Datos de la boda ─────────────────────────────────────────────────────────
export const coupleName = 'Jonathan & Jasmin';

// ─── Sesion del invitado (solo comodidad del navegador, sin credenciales de admin) ─
const GUEST_SESSION_KEY = 'jj.invite.session.v1';

// ─── Fila de la DB <-> objeto de la app ───────────────────────────────────────
function fromDbGuest(row) {
  return {
    id: row.id,
    password: row.password,
    fullName: row.full_name,
    names: row.names?.length ? row.names : [row.full_name],
    phone: row.phone ?? '',
    notes: row.notes ?? '',
    attendance: row.attendance,
    attendanceCount: row.attendance_count,
    maxAttendees: row.max_attendees,
    tableId: row.table_id ?? '',
    seatNumbers: row.seat_numbers ?? [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toDbGuest(g) {
  return {
    id: g.id,
    password: g.password,
    full_name: g.fullName,
    names: g.names?.length ? g.names : [g.fullName],
    phone: g.phone ?? '',
    notes: g.notes ?? '',
    attendance: g.attendance,
    attendance_count: g.attendanceCount,
    max_attendees: g.maxAttendees,
    table_id: g.tableId ?? '',
    seat_numbers: g.seatNumbers ?? [],
    updated_at: new Date().toISOString(),
  };
}

// ─── CRUD de invitados (admin: requiere sesion de Supabase Auth) ──────────────
export function generateId() {
  return `g-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export async function fetchGuests() {
  const { data, error } = await requireSupabase()
    .from('guests')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data.map(fromDbGuest);
}

export async function saveGuests(guests) {
  const { error } = await requireSupabase().from('guests').upsert(guests.map(toDbGuest));
  if (error) throw error;
}

export async function deleteGuestRemote(id) {
  const { error } = await requireSupabase().from('guests').delete().eq('id', id);
  if (error) throw error;
}

export function createGuest(data) {
  const now = new Date().toISOString();
  const fullName = String(data.fullName ?? '').trim();
  return {
    id: generateId(),
    password: String(data.password ?? '').trim(),
    fullName,
    names: [fullName],
    phone: '',
    notes: String(data.notes ?? '').trim(),
    attendance: 'pending',
    attendanceCount: 0,
    maxAttendees: Math.max(1, Number(data.maxAttendees) || 1),
    tableId: '',
    seatNumbers: [],
    createdAt: now,
    updatedAt: now,
  };
}

// Sienta al invitado desde `startSeat` y reserva tantas sillas seguidas como
// personas trae. Sin mesa (o soltado en "Sin asignar") lo libera. Si alguna
// silla destino ya esta ocupada por otro, rechaza el movimiento entero.
export function assignGuestToSeats(guests, guestId, tableId, startSeat, tables) {
  const dragged = guests.find((g) => g.id === guestId);
  if (!dragged) return guests;

  const now = new Date().toISOString();

  if (!tableId || startSeat == null) {
    return guests.map((g) => (g.id === guestId ? { ...g, tableId: '', seatNumbers: [], updatedAt: now } : g));
  }

  const table = (tables ?? []).find((t) => t.id === tableId);
  if (!table) return guests;

  const cap = table.capacity;
  const count = Math.min(dragged.attendanceCount || 1, cap);
  // El grupo nunca da la vuelta despues de la ultima silla
  const adjustedStart = Math.max(1, Math.min(startSeat, cap - count + 1));
  const targetSeats = Array.from({ length: count }, (_, i) => adjustedStart + i);

  const hasConflict = guests.some(
    (g) => g.id !== guestId && g.tableId === tableId && (g.seatNumbers ?? []).some((sn) => targetSeats.includes(sn))
  );
  if (hasConflict) return guests;

  return guests.map((g) => (g.id === guestId ? { ...g, tableId, seatNumbers: targetSeats, updatedAt: now } : g));
}

export function updateGuestInList(guests, id, changes) {
  return guests.map((g) => {
    if (g.id !== id) return g;
    const fullName = changes.fullName ?? g.fullName;
    return { ...g, ...changes, fullName, names: [fullName], updatedAt: new Date().toISOString() };
  });
}

export function deleteGuestFromList(guests, id) {
  return guests.filter((g) => g.id !== id);
}

// ─── CRUD de mesas (admin) ────────────────────────────────────────────────────
export async function fetchTables() {
  const { data, error } = await requireSupabase().from('tables').select('*').order('name');
  if (error) throw error;
  return data;
}

export async function saveTables(tables) {
  const { error } = await requireSupabase().from('tables').upsert(tables);
  if (error) throw error;
}

export async function deleteTableRemote(id) {
  const { error } = await requireSupabase().from('tables').delete().eq('id', id);
  if (error) throw error;
}

export function createTable(data) {
  return {
    id: `t-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`,
    name: String(data.name ?? '').trim(),
    area: String(data.area ?? '').trim(),
    capacity: Math.max(2, Math.min(30, Number(data.capacity) || 8)),
  };
}

export function updateTableInList(tables, id, changes) {
  return tables.map((t) =>
    t.id === id
      ? { ...t, ...changes, capacity: Math.max(2, Math.min(30, Number(changes.capacity) || t.capacity)) }
      : t
  );
}

export function deleteTableFromList(tables, id) {
  return tables.filter((t) => t.id !== id);
}

// ─── Acceso y RSVP del invitado (RPCs con contrasena, sin acceso directo a tablas) ─
export async function loginGuest(password) {
  const { data, error } = await requireSupabase().rpc('login_guest', { p_password: password });
  if (error) throw error;
  return data?.[0] ? fromDbGuest(data[0]) : null;
}

export async function submitRsvp(guest, { attendance, attendanceCount, notes }) {
  const { data, error } = await requireSupabase().rpc('submit_rsvp', {
    p_guest_id: guest.id,
    p_password: guest.password,
    p_attendance: attendance,
    p_attendance_count: attendanceCount,
    p_notes: notes,
  });
  if (error) throw error;
  if (!data?.[0]) throw new Error('No se pudo actualizar la confirmación.');
  return fromDbGuest(data[0]);
}

// ─── Sesiones ─────────────────────────────────────────────────────────────────
export function readGuestSession() {
  try {
    const raw = sessionStorage.getItem(GUEST_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.guest ? parsed : null;
  } catch {
    return null;
  }
}

export function saveGuestSession(guest) {
  try {
    sessionStorage.setItem(GUEST_SESSION_KEY, JSON.stringify({ guest, lastActive: Date.now() }));
  } catch {
    // modo privado o almacenamiento bloqueado: la sesion dura lo que la pestana
  }
}

export function clearGuestSession() {
  try {
    sessionStorage.removeItem(GUEST_SESSION_KEY);
  } catch {
    // nada que limpiar
  }
}

// La sesion del admin vive en Supabase Auth (no se guardan credenciales).
export async function readAdminSession() {
  const { data } = await requireSupabase().auth.getSession();
  return data.session ?? null;
}

export async function loginAdmin(email, password) {
  const { data, error } = await requireSupabase().auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.session;
}

export async function logoutAdmin() {
  await requireSupabase().auth.signOut();
}

// ─── Estadisticas ─────────────────────────────────────────────────────────────
export function buildStats(guests) {
  const confirmed = guests.filter((g) => g.attendance === 'confirmed');
  const declined = guests.filter((g) => g.attendance === 'declined');
  const pending = guests.filter((g) => g.attendance === 'pending');
  const totalAttendees = confirmed.reduce((s, g) => s + g.attendanceCount, 0);

  return {
    total: guests.length,
    confirmed: confirmed.length,
    declined: declined.length,
    pending: pending.length,
    totalAttendees,
  };
}

// ─── Formato ──────────────────────────────────────────────────────────────────
export function formatDate(isoDate) {
  if (!isoDate) return '-';
  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(isoDate));
}

// ─── Mensaje de invitacion (boton "copiar" del admin) ─────────────────────────
// El original tenia el dominio fijo; aca se usa el dominio donde este publicada.
export function buildInvitationMessage(guest) {
  const firstName = (guest.names?.[0] ?? guest.fullName).split(' ')[0];
  const link = window.location.origin;
  return `Querido/a ${firstName}, es un honor invitarte a nuestra boda. Aquí tienes el link de tu invitación y tu contraseña:\n${link}\nContraseña: ${guest.password}`;
}

// ─── Excel: importar / exportar ───────────────────────────────────────────────
export const EXCEL_TEMPLATE_HEADERS = ['Nombre Completo', 'Contraseña', 'Máx. Invitados', 'Notas'];

export function parseExcelRows(rows) {
  return rows
    .filter((row) => String(row['Nombre Completo'] ?? '').trim())
    .map((row) =>
      createGuest({
        fullName: String(row['Nombre Completo'] ?? '').trim(),
        password: String(row['Contraseña'] ?? '').trim(),
        maxAttendees: Number(row['Máx. Invitados']) || 1,
        notes: String(row['Notas'] ?? '').trim(),
      })
    );
}
