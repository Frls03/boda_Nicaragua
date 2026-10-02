import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Invite from './Invite';
import { isDemo } from './lib/supabaseClient'; // DEMO: quitar al conectar Supabase
import { resetDemo } from './lib/demoClient'; // DEMO: quitar al conectar Supabase

// El admin se carga aparte: los invitados no descargan el panel ni la
// libreria de Excel.
const AdminPanel = lazy(() => import('./admin/AdminPanel'));

export default function App() {
  return (
    <BrowserRouter>
      {/* DEMO: quitar este bloque al conectar Supabase.
          Franja en el flujo normal (no flotante): se va al desplazar y no tapa nada. */}
      {isDemo && (
        <div className="flex items-center justify-center gap-3 bg-[#2b3653] px-4 py-1.5 text-[11px] font-medium tracking-[.06em] text-cream">
          <span>MODO DEMO<span className="hidden sm:inline"> · datos de prueba en este navegador</span></span>
          <button
            type="button"
            onClick={() => {
              resetDemo();
              sessionStorage.clear();
              window.location.reload();
            }}
            className="rounded-full px-2 py-0.5 underline decoration-cream/50 underline-offset-2 transition-colors hover:bg-cream/15"
          >
            Reiniciar datos
          </button>
        </div>
      )}

      <Routes>
        <Route path="/" element={<Invite />} />
        <Route
          path="/novios"
          element={
            <Suspense fallback={null}>
              <AdminPanel />
            </Suspense>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
