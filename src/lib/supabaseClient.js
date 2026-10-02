import { createClient } from '@supabase/supabase-js';
import { demoClient } from './demoClient'; // DEMO: quitar al conectar Supabase

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const real = url && anonKey ? createClient(url, anonKey) : null;

// DEMO: sin .env se usa el cliente de prueba (datos en este navegador).
// Con las variables configuradas, esto ya usa Supabase real automaticamente.
export const isDemo = !real;
export const supabase = real ?? demoClient;

export function requireSupabase() {
  if (!supabase) {
    throw new Error('Falta configurar VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en el archivo .env');
  }
  return supabase;
}
