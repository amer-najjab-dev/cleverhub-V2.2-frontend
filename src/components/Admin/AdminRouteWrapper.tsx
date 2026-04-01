// src/components/Admin/AdminRouteWrapper.tsx
import { useAuth } from '../../contexts/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';

export const AdminRouteWrapper = () => {
  const { user } = useAuth();
  
  if (user?.role !== 'SUPER_ADMIN') {
    return <Navigate to="/" replace />;
  }
  
  return <Outlet />;
};
