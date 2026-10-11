import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Invite from './Invite';

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
    </BrowserRouter>
  );
}
