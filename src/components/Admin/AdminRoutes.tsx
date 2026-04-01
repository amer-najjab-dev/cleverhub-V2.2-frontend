import { useAuth } from '../../contexts/AuthContext';
import { Route } from 'react-router-dom';
import { AdminDashboard } from '../../pages/Admin/AdminDashboard';
import { PharmaciesPage } from '../../pages/Admin/PharmaciesPage';
import { GlobalUsersPage } from '../../pages/Admin/GlobalUsersPage';
import { SubscriptionsPage } from '../../pages/Admin/SubscriptionsPage';
import { BroadcastPage } from '../../pages/Admin/BroadcastPage';
import { HealthPage } from '../../pages/Admin/HealthPage';

export const AdminRoutes = () => {
  const { user } = useAuth();
  
  // Solo mostrar si es SUPER_ADMIN
  if (user?.role !== 'SUPER_ADMIN') {
    return null;
  }
  
  return (
    <>
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/pharmacies" element={<PharmaciesPage />} />
      <Route path="/admin/users" element={<GlobalUsersPage />} />
      <Route path="/admin/subscriptions" element={<SubscriptionsPage />} />
      <Route path="/admin/broadcast" element={<BroadcastPage />} />
      <Route path="/admin/health" element={<HealthPage />} />
    </>
  );
};
