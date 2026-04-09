import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import { RegionProvider } from './contexts/RegionContext';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/Auth/ProtectedRoute';
import { LoginPage } from './pages/Auth/LoginPage';
import { Header } from './layout/Header/Header';
import { HomeDashboard } from './pages/Home/HomeDashboard';
import { SalesPage } from './pages/Sales/SalesPage';
import ClientsPage from './pages/Clients/ClientsPage';
import ClientDetailPage from './pages/Clients/ClientDetailPage';
import NewClientPage from './pages/Clients/NewClientPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import ProductTable from './components/ProductTable/ProductTable';
import { InventoryPage } from './pages/Inventory/InventoryPage';
import { SupplierListPage } from './modules/suppliers/pages/SupplierListPage';
import { SupplierDetailPage } from './modules/suppliers/pages/SupplierDetailPage';
import { CashClosurePage } from './modules/reports/pages/CashClosurePage';
import { BIDashboardPage } from './modules/reports/pages/BIDashboardPage';
import { ReportsLayout } from './modules/reports/layout/ReportsLayout';
import { SupplierAnalysisPage } from './modules/reports/pages/SupplierAnalysisPage';
import { ProductIntelligencePage } from './modules/reports/pages/ProductIntelligencePage';
import { ClientIntelligencePage } from './modules/reports/pages/ClientIntelligencePage';
import { LoyaltyPage } from './modules/reports/pages/LoyaltyPage';
import { ConnectPage } from './modules/connect/pages/ConnectPage';
import { SalesHistoryPage } from './pages/Sales/SalesHistoryPage';
import EditClientPage from './pages/Clients/EditClientPage';
import { HRDashboard } from './pages/HR/HRDashboard';
import { AdminDashboard } from './pages/Admin/AdminDashboard';
import { PharmaciesPage } from './pages/Admin/PharmaciesPage';
import { GlobalUsersPage } from './pages/Admin/GlobalUsersPage';
import { SubscriptionsPage } from './pages/Admin/SubscriptionsPage';
import { BroadcastPage } from './pages/Admin/BroadcastPage';
import { HealthPage } from './pages/Admin/HealthPage';
import { AdminRouteWrapper } from './components/Admin/AdminRouteWrapper';

function App() {
  // Redirigir SUPER_ADMIN desde / a /admin/dashboard
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.role === 'SUPER_ADMIN' && window.location.pathname === '/') {
          window.location.href = '/admin/dashboard';
        }
      } catch (e) {
        console.error('Error parsing user from localStorage:', e);
      }
    }
  }, []);

  return (
    <BrowserRouter>
      <RegionProvider>
        <AuthProvider>
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
            }}
          />
          
          <Header />
          
          <main className="min-h-screen bg-gray-50">
            {/* ✅ Contenedor responsive mejorado */}
            <div className="w-full mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16">
              <div className="max-w-[1600px] mx-auto py-6">
                <Routes>
                  {/* Ruta pública */}
                  <Route path="/login" element={<LoginPage />} />

                  {/* Redirección de /dashboard a / */}
                  <Route path="/dashboard" element={<Navigate to="/" replace />} />
                  
                  {/* Rutas protegidas principales */}
                  <Route path="/" element={<ProtectedRoute><HomeDashboard /></ProtectedRoute>} />
                  <Route path="/sales" element={<ProtectedRoute><SalesPage /></ProtectedRoute>} />
                  <Route path="/products" element={<ProtectedRoute><ProductTable /></ProtectedRoute>} />
                  <Route path="/products/:id" element={<ProtectedRoute><ProductDetailPage /></ProtectedRoute>} />
                  <Route path="/stock" element={<ProtectedRoute><InventoryPage /></ProtectedRoute>} />
                  <Route path="/clients" element={<ProtectedRoute><ClientsPage /></ProtectedRoute>} />
                  <Route path="/clients/new" element={<ProtectedRoute><NewClientPage /></ProtectedRoute>} />
                  <Route path="/clients/:id" element={<ProtectedRoute><ClientDetailPage /></ProtectedRoute>} />
                  <Route path="/clients/:id/edit" element={<ProtectedRoute><EditClientPage /></ProtectedRoute>} />
                  <Route path="/sales/history" element={<ProtectedRoute><SalesHistoryPage /></ProtectedRoute>} />
                  <Route path="/hr" element={<ProtectedRoute><HRDashboard /></ProtectedRoute>} />
                  
                  {/* Rutas de proveedores */}
                  <Route path="/providers" element={<ProtectedRoute><SupplierListPage /></ProtectedRoute>} />
                  <Route path="/providers/:id" element={<ProtectedRoute><SupplierDetailPage /></ProtectedRoute>} />
                  {/* Redirección de /suppliers a /providers (compatibilidad) */}
                  <Route path="/suppliers" element={<Navigate to="/providers" replace />} />
                  <Route path="/suppliers/:id" element={<Navigate to="/providers/:id" replace />} />
                  
                  {/* Ruta directa para Connect (opcional) */}
                  <Route path="/connect" element={<ProtectedRoute><ConnectPage /></ProtectedRoute>} />
                  
                  {/* RUTA DE REPORTS */}
                  <Route path="/reports" element={<ProtectedRoute><ReportsLayout /></ProtectedRoute>}>
                    <Route index element={<CashClosurePage />} />
                    <Route path="cash-closure" element={<CashClosurePage />} />
                    <Route path="bi" element={<BIDashboardPage />} />
                    <Route path="suppliers" element={<SupplierAnalysisPage />} />
                    <Route path="products" element={<ProductIntelligencePage />} />
                    <Route path="products/intelligence" element={<ProductIntelligencePage />} />
                    <Route path="clients" element={<ClientIntelligencePage />} />
                    <Route path="loyalty" element={<LoyaltyPage />} />
                    <Route path="connect" element={<ConnectPage />} />
                    <Route path="debts" element={
                      <div className="bg-white rounded-xl p-6 text-center text-gray-500">
                        Page en construction - Dettes clients
                      </div>
                    } />
                    <Route path="batches" element={
                      <div className="bg-white rounded-xl p-6 text-center text-gray-500">
                        Page en construction - Traçabilité lots
                      </div>
                    } />
                    <Route path="audit" element={
                      <div className="bg-white rounded-xl p-6 text-center text-gray-500">
                        Page en construction - Journal d'audit
                      </div>
                    } />
                  </Route>

                  {/* RUTAS DE ADMINISTRACIÓN (SOLO SUPER_ADMIN) */}
                  <Route element={<AdminRouteWrapper />}>
                    <Route path="/admin/dashboard" element={<AdminDashboard />} />
                    <Route path="/admin/pharmacies" element={<PharmaciesPage />} />
                    <Route path="/admin/users" element={<GlobalUsersPage />} />
                    <Route path="/admin/subscriptions" element={<SubscriptionsPage />} />
                    <Route path="/admin/broadcast" element={<BroadcastPage />} />
                    <Route path="/admin/health" element={<HealthPage />} />
                  </Route>
                </Routes>
              </div>
            </div>
          </main>
        </AuthProvider>
      </RegionProvider>
    </BrowserRouter>
  );
}

export default App;