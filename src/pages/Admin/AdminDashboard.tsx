import { useEffect, useState } from 'react';
import { adminService, HealthStatus } from '../../services/admin.service';
import { useAuth } from '../../contexts/AuthContext';
import { Store, AlertCircle, CheckCircle, Clock } from 'lucide-react';

export const AdminDashboard = () => {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await adminService.getHealthStatus();
      setHealth(data);
    } catch (error) {
      console.error('Error loading health status:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: 'Total Farmacias',
      value: health?.summary.total || 0,
      icon: Store,
      color: 'bg-blue-500',
    },
    {
      title: 'Estado Verde',
      value: health?.summary.green || 0,
      icon: CheckCircle,
      color: 'bg-green-500',
    },
    {
      title: 'Estado Amarillo',
      value: health?.summary.yellow || 0,
      icon: Clock,
      color: 'bg-yellow-500',
    },
    {
      title: 'Estado Rojo',
      value: health?.summary.red || 0,
      icon: AlertCircle,
      color: 'bg-red-500',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard SUPER_ADMIN</h1>
          <p className="text-gray-600 mt-1">
            Bienvenido, {user?.fullName}. Aquí tienes el resumen global de la plataforma.
          </p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-xl`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Tabla de farmacias por estado */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Verdes */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-green-50 px-6 py-4 border-b border-green-200">
              <h2 className="font-semibold text-green-800">🟢 Estado Verde</h2>
              <p className="text-sm text-green-600">Activas y con ventas recientes</p>
            </div>
            <div className="divide-y divide-gray-100">
              {health?.status.green.length === 0 ? (
                <p className="p-6 text-center text-gray-500">No hay farmacias en estado verde</p>
              ) : (
                health?.status.green.map((pharmacy) => (
                  <div key={pharmacy.id} className="p-4 hover:bg-gray-50">
                    <p className="font-medium text-gray-900">{pharmacy.name}</p>
                    <p className="text-sm text-gray-500">Licencia: {pharmacy.license}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Amarillas */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-yellow-50 px-6 py-4 border-b border-yellow-200">
              <h2 className="font-semibold text-yellow-800">🟡 Estado Amarillo</h2>
              <p className="text-sm text-yellow-600">Vencen pronto o sin actividad</p>
            </div>
            <div className="divide-y divide-gray-100">
              {health?.status.yellow.length === 0 ? (
                <p className="p-6 text-center text-gray-500">No hay farmacias en estado amarillo</p>
              ) : (
                health?.status.yellow.map((pharmacy) => (
                  <div key={pharmacy.id} className="p-4 hover:bg-gray-50">
                    <p className="font-medium text-gray-900">{pharmacy.name}</p>
                    <p className="text-sm text-gray-500">
                      Expira: {new Date(pharmacy.subscription_end).toLocaleDateString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Rojas */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-red-50 px-6 py-4 border-b border-red-200">
              <h2 className="font-semibold text-red-800">🔴 Estado Rojo</h2>
              <p className="text-sm text-red-600">Suspendidas o sin actividad</p>
            </div>
            <div className="divide-y divide-gray-100">
              {health?.status.red.length === 0 ? (
                <p className="p-6 text-center text-gray-500">No hay farmacias en estado rojo</p>
              ) : (
                health?.status.red.map((pharmacy) => (
                  <div key={pharmacy.id} className="p-4 hover:bg-gray-50">
                    <p className="font-medium text-gray-900">{pharmacy.name}</p>
                    <p className="text-sm text-red-600">Estado: {pharmacy.status}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

