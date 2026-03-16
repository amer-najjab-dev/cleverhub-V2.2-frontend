import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  ShoppingCart, 
  Package, 
  Calendar,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { SalesChart } from '../../components/Dashboard/SalesChart';
import { ComparativeChart } from '../../components/Dashboard/ComparativeChart';
import { QuickStats } from '../../components/Dashboard/QuickStats';
import { TopProductsTable } from '../../modules/reports/components/bi/TopProductsTable';
import { SalesHistory } from '../../components/Dashboard/SalesHistory/SalesHistory';
import { useCurrencyFormatter } from '../../utils/formatters';
import { dashboardService } from '../../services/dashboard.service';

export const HomeDashboard = () => {
  const [kpis, setKpis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const navigate = useNavigate();
  const { formatCurrency } = useCurrencyFormatter();

  useEffect(() => {
    fetchKPIs();
    fetchTopProducts();
  }, []);

  const fetchKPIs = async () => {
    try {
      setLoading(true);
      const response = await dashboardService.getKPIs('today');
      if (response.success) {
        setKpis(response.data);
        setError(null);
      }
    } catch (err) {
      setError('Error al cargar los indicadores');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTopProducts = async () => {
    try {
      setLoadingProducts(true);
      const response = await dashboardService.getTopProducts(5, 'week');
      if (response.success) {
        setTopProducts(response.data);
      }
    } catch (error) {
      console.error('Error loading top products:', error);
    } finally {
      setLoadingProducts(false);
    }
  };

  const quickActions = [
    {
      title: 'Nueva Venta',
      description: 'Crear una nueva venta en POS',
      icon: ShoppingCart,
      color: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600',
      route: '/sales',
      enabled: true
    },
    {
      title: 'Reabastecer',
      description: 'Productos con stock bajo',
      icon: Package,
      color: 'bg-green-500',
      hoverColor: 'hover:bg-green-600',
      route: '/inventory/low-stock',
      enabled: false
    },
    {
      title: 'Reportes',
      description: 'Análisis y estadísticas',
      icon: TrendingUp,
      color: 'bg-purple-500',
      hoverColor: 'hover:bg-purple-600',
      route: '/reports/bi',
      enabled: true
    },
    {
      title: 'Caducidades',
      description: 'Productos próximos a caducar',
      icon: Calendar,
      color: 'bg-amber-500',
      hoverColor: 'hover:bg-amber-600',
      route: '/reports/batches',
      enabled: true
    }
  ];

  const handleQuickAction = (route: string, enabled: boolean) => {
    if (enabled) {
      navigate(route);
    } else {
      alert('Esta funcionalidad estará disponible próximamente');
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Resumen de actividad y rendimiento</p>
          </div>
          
          <button
            onClick={fetchKPIs}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Actualizar
          </button>
        </div>

        {/* KPIs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <QuickStats kpis={kpis} loading={loading} formatCurrency={formatCurrency} />
        </div>

        {/* SALES HISTORY - Ahora arriba y ancho completo */}
        <div className="w-full">
          <SalesHistory />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="w-full h-[400px]">
            <SalesChart />
          </div>
          <div className="w-full h-[400px]">
            <ComparativeChart />
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Acceso Rápido</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <button
                key={action.title}
                onClick={() => handleQuickAction(action.route, action.enabled)}
                className={`${action.color} ${action.hoverColor} text-white rounded-xl p-6 shadow-sm transition-all transform hover:scale-105 flex items-start justify-between`}
              >
                <div className="flex-1">
                  <action.icon className="w-8 h-8 mb-3 opacity-90" />
                  <h3 className="text-lg font-semibold mb-1">{action.title}</h3>
                  <p className="text-sm opacity-90">{action.description}</p>
                </div>
                <ArrowRight className="w-5 h-5 opacity-70" />
              </button>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Productos Más Vendidos</h2>
          <div className="w-full">
            {loadingProducts ? (
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-12 bg-gray-100 rounded animate-pulse"></div>
                  ))}
                </div>
              </div>
            ) : (
              <TopProductsTable products={topProducts} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};