interface QuickStatsProps {
  kpis: any;
  loading: boolean;
  formatCurrency: (value: number) => string;
}

export const QuickStats = ({ kpis, loading, formatCurrency }: QuickStatsProps) => {
  if (loading) {
    return (
      <>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-xl p-6 shadow-sm animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-24 mb-4"></div>
            <div className="h-8 bg-gray-300 rounded w-32"></div>
          </div>
        ))}
      </>
    );
  }

  // Valores seguros con fallbacks
  const todaySales = typeof kpis?.todaySales === 'number' ? kpis.todaySales : 0;
  const averageTicket = typeof kpis?.averageTicket === 'number' ? kpis.averageTicket : 0;
  const lowStockCount = typeof kpis?.lowStockCount === 'number' ? kpis.lowStockCount : 0;
  const growth = typeof kpis?.growth === 'number' ? kpis.growth : 0;

  return (
    <>
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <p className="text-sm text-gray-600 mb-2">Ventas Hoy</p>
        <p className="text-2xl font-bold text-gray-900">{formatCurrency(todaySales)}</p>
      </div>
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <p className="text-sm text-gray-600 mb-2">Ticket Promedio</p>
        <p className="text-2xl font-bold text-gray-900">{formatCurrency(averageTicket)}</p>
      </div>
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <p className="text-sm text-gray-600 mb-2">Stock Bajo</p>
        <p className="text-2xl font-bold text-gray-900">{lowStockCount}</p>
      </div>
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <p className="text-sm text-gray-600 mb-2">Crecimiento</p>
        <p className={`text-2xl font-bold ${growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {growth.toFixed(1)}%
        </p>
      </div>
    </>
  );
};