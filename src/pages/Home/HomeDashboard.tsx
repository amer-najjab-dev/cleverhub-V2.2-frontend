import { useState, useEffect } from 'react';
import { DollarSign, Calendar, CreditCard, Package } from 'lucide-react';
import { KPICard } from '../../components/Dashboard/KPICard';
import { SalesChart } from '../../components/Dashboard/SalesChart';
import { ComparativeChart } from '../../components/Dashboard/ComparativeChart';
import { BestSellersTable } from '../../components/Dashboard/BestSellersTable';
import { SalesHistory } from '../../components/Dashboard/SalesHistory/SalesHistory';
import { dashboardService } from '../../services/dashboard.service';
import { DashboardKPI } from '../../services/dashboard.service';
import { useCurrencyFormatter } from '../../utils/formatters';

export const HomeDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState<DashboardKPI>({
    todaySales: 0,
    weekSales: 0,
    averageTicket: 0,
    lowStockCount: 0,
    growth: 0,
    totalSales: 0,
    totalProfit: 0,
    averageMargin: 0,
    pendingOrders: 0
  });
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  const { formatCurrency } = useCurrencyFormatter();

  useEffect(() => {
    loadDashboardData();
  }, [selectedPeriod]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const response = await dashboardService.getKPIs(selectedPeriod);
      if (response.success) {
        setKpis(response.data);
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header con selector de período */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard CleverHub</h1>
            <p className="text-gray-600 mt-2">
              Sistema de gestión farmacéutica inteligente
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedPeriod('today')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedPeriod === 'today'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Hoy
            </button>
            <button
              onClick={() => setSelectedPeriod('week')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedPeriod === 'week'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Esta Semana
            </button>
            <button
              onClick={() => setSelectedPeriod('month')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedPeriod === 'month'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Este Mes
            </button>
          </div>
        </div>

        {/* KPIs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <KPICard 
            title="Ventas Hoy" 
            value={loading ? 'Cargando...' : formatCurrency(kpis.todaySales)}
            change={kpis.growth}
            icon={<DollarSign className="w-6 h-6 text-white" />}
            color="bg-blue-500"
            loading={loading}
          />
          <KPICard 
            title="Ventas Semana" 
            value={loading ? 'Cargando...' : formatCurrency(kpis.weekSales)}
            change={kpis.growth}
            icon={<Calendar className="w-6 h-6 text-white" />}
            color="bg-purple-500"
            loading={loading}
          />
          <KPICard 
            title="Ticket Medio" 
            value={loading ? 'Cargando...' : formatCurrency(kpis.averageTicket)}
            change={kpis.growth}
            icon={<CreditCard className="w-6 h-6 text-white" />}
            color="bg-green-500"
            loading={loading}
          />
          <KPICard 
            title="Stock Bajo" 
            value={loading ? '...' : kpis.lowStockCount}
            icon={<Package className="w-6 h-6 text-white" />}
            color="bg-amber-500"
            loading={loading}
          />
        </div>

        {/* Historial de Ventas */}
        <div className="mb-8">
          <SalesHistory />
        </div>

        {/* Charts Grid - Primera fila */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <SalesChart period={selectedPeriod} />
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen Rápido</h3>
            <div className="space-y-4">
              {loading ? (
                <div className="animate-pulse space-y-4">
                  <div className="h-12 bg-gray-200 rounded"></div>
                  <div className="h-12 bg-gray-200 rounded"></div>
                  <div className="h-12 bg-gray-200 rounded"></div>
                </div>
              ) : (
                <>
                  <div>
                    <div className="text-sm text-gray-500">Mejor hora de ventas</div>
                    <div className="font-semibold text-gray-900">15:00 - 16:00</div>
                    <div className="text-sm text-gray-500">
                      {formatCurrency(kpis.todaySales * 0.15)} promedio
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Producto más vendido</div>
                    <div className="font-semibold text-gray-900">-</div>
                    <div className="text-sm text-gray-500">Cargando...</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Cliente más activo</div>
                    <div className="font-semibold text-gray-900">-</div>
                    <div className="text-sm text-gray-500">Cargando...</div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Charts Grid - Segunda fila */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <ComparativeChart period={selectedPeriod} />
          <BestSellersTable period={selectedPeriod} />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="bg-white border border-gray-300 rounded-lg p-4 hover:bg-gray-50 text-center transition-colors">
            <div className="text-blue-600 font-medium">Nueva Venta</div>
            <div className="text-sm text-gray-500 mt-1">Iniciar venta rápida</div>
          </button>
          <button className="bg-white border border-gray-300 rounded-lg p-4 hover:bg-gray-50 text-center transition-colors">
            <div className="text-green-600 font-medium">Reabastecer</div>
            <div className="text-sm text-gray-500 mt-1">Ver stock bajo</div>
          </button>
          <button className="bg-white border border-gray-300 rounded-lg p-4 hover:bg-gray-50 text-center transition-colors">
            <div className="text-purple-600 font-medium">Reportes</div>
            <div className="text-sm text-gray-500 mt-1">Generar informes</div>
          </button>
          <button className="bg-white border border-gray-300 rounded-lg p-4 hover:bg-gray-50 text-center transition-colors">
            <div className="text-amber-600 font-medium">Caducidades</div>
            <div className="text-sm text-gray-500 mt-1">Ver próximas</div>
          </button>
        </div>
      </div>
    </div>
  );
};