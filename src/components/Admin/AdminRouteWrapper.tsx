// src/components/Admin/AdminRouteWrapper.tsx
import { useAuth } from '../../contexts/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';

export const AdminRouteWrapper = () => {
  const { user, isLoading } = useAuth();
  
  // Esperar a que termine de cargar la autenticación
  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Cargando...</div>;
  }
  
  if (!user || user.role !== 'SUPER_ADMIN') {
    return <Navigate to="/" replace />;
  }
  
  return <Outlet />;
};