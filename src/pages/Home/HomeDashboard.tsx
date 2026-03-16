import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, 
  Package, 
  Calendar,
  ArrowRight,
  RefreshCw,
  BarChart3
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
      description: 'Crear una nueva venta',
      icon: ShoppingCart,
      color: 'bg-blue-600',
      hover: 'hover:bg-blue-700',
      route: '/sales',
      enabled: true
    },
    {
      title: 'Reabastecer',
      description: 'Productos con stock bajo',
      icon: Package,
      color: 'bg-emerald-600',
      hover: 'hover:bg-emerald-700',
      route: '/inventory/low-stock',
      enabled: false
    },
    {
      title: 'Reportes',
      description: 'Análisis y estadísticas',
      icon: BarChart3,
      color: 'bg-violet-600',
      hover: 'hover:bg-violet-700',
      route: '/reports/bi',
      enabled: true
    },
    {
      title: 'Caducidades',
      description: 'Productos próximos a caducar',
      icon: Calendar,
      color: 'bg-amber-600',
      hover: 'hover:bg-amber-700',
      route: '/reports/batches',
      enabled: true
    }
  ];

  const handleQuickAction = (route: string, enabled: boolean) => {
    if (enabled) {
      navigate(route);
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
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
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

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <QuickStats kpis={kpis} loading={loading} formatCurrency={formatCurrency} />
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Acceso Rápido</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <button
                key={action.title}
                onClick={() => handleQuickAction(action.route, action.enabled)}
                disabled={!action.enabled}
                className={`${action.color} ${action.hover} text-white rounded-xl p-6 shadow-sm transition-all transform hover:scale-105 ${
                  !action.enabled && 'opacity-50 cursor-not-allowed'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <action.icon className="w-8 h-8 mb-3" />
                    <h3 className="text-lg font-semibold mb-1">{action.title}</h3>
                    <p className="text-sm opacity-90">{action.description}</p>
                  </div>
                  {action.enabled && <ArrowRight className="w-5 h-5 opacity-70" />}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Sales History */}
        <SalesHistory />

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SalesChart />
          <ComparativeChart />
        </div>

        {/* Top Products */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Productos Más Vendidos</h2>
          {loadingProducts ? (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
                ))}
              </div>
            </div>
          ) : (
            <TopProductsTable products={topProducts} />
          )}
        </div>
      </div>
    </div>
  );
};