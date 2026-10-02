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

      {/* DEMO: quitar este bloque al conectar Supabase */}
      {isDemo && (
        <div className="fixed bottom-[92px] left-3 z-[60] min-[861px]:bottom-3 min-[861px]:left-auto min-[861px]:right-3 flex items-center gap-2 rounded-full bg-[#2b3653]/90 py-1.5 pl-3.5 pr-1.5 text-[11px] font-medium tracking-[.08em] text-cream shadow-lg backdrop-blur">
          MODO DEMO
          <button
            type="button"
            onClick={() => {
              resetDemo();
              sessionStorage.clear();
              window.location.reload();
            }}
            className="rounded-full bg-cream/15 px-2.5 py-1 transition-colors hover:bg-cream/30"
          >
            Reiniciar datos
          </button>
        </div>
      )}
    </BrowserRouter>
  );
}
