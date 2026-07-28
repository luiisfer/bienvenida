import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';

// Layouts & Pages placeholders
import AdminLayout from '@/components/layout/AdminLayout';
import Login from '@/pages/auth/Login';
import Dashboard from '@/pages/admin/Dashboard';
import QRGenerator from '@/pages/admin/QRGenerator';
import Asistencias from '@/pages/admin/Asistencias';
import Alumnos from '@/pages/admin/Alumnos';
import Config from '@/pages/admin/Config';
import Historico from '@/pages/admin/Historico';
import ScanQR from '@/pages/public/ScanQR';
import ResetDevice from '@/pages/public/ResetDevice';

function App() {
  const { checkAuth, loading, user } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent"></div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas Públicas */}
        <Route path="/login" element={user ? <Navigate to="/admin/dashboard" /> : <Login />} />
        <Route path="/scan/:uuidQR" element={<ScanQR />} />
        <Route path="/reset" element={<ResetDevice />} />
        
        {/* Rutas Protegidas de Administrador */}
        <Route path="/admin" element={user ? <AdminLayout /> : <Navigate to="/login" />}>
          <Route index element={<Navigate to="dashboard" />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="qr" element={<QRGenerator />} />
          <Route path="asistencias" element={<Asistencias />} />
          <Route path="historico" element={<Historico />} />
          <Route path="alumnos" element={<Alumnos />} />
          <Route path="config" element={<Config />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
