import { createClient } from '@supabase/supabase-js';
import { demoClient } from './demoClient'; // DEMO: quitar al pasar a produccion

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// DEMO: VITE_USE_DEMO=true fuerza el cliente de prueba (datos en este
// navegador) aunque las claves de Supabase esten cargadas. Sin claves tambien
// cae al demo. Para produccion: VITE_USE_DEMO=false (o quitar la linea).
const forzarDemo = import.meta.env.VITE_USE_DEMO === 'true';
const real = !forzarDemo && url && anonKey ? createClient(url, anonKey) : null;

export const isDemo = !real;
export const supabase = real ?? demoClient;

export function requireSupabase() {
  if (!supabase) {
    throw new Error('Falta configurar VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en el archivo .env');
  }
  return supabase;
}
