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

  return (
    <>
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <p className="text-sm text-gray-600 mb-2">Ventas Hoy</p>
        <p className="text-2xl font-bold text-gray-900">{formatCurrency(kpis?.todaySales || 0)}</p>
      </div>
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <p className="text-sm text-gray-600 mb-2">Ticket Promedio</p>
        <p className="text-2xl font-bold text-gray-900">{formatCurrency(kpis?.averageTicket || 0)}</p>
      </div>
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <p className="text-sm text-gray-600 mb-2">Stock Bajo</p>
        <p className="text-2xl font-bold text-gray-900">{kpis?.lowStockCount || 0}</p>
      </div>
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <p className="text-sm text-gray-600 mb-2">Crecimiento</p>
        <p className={`text-2xl font-bold ${kpis?.growth && kpis.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {kpis?.growth ? kpis.growth.toFixed(1) : 0}%
        </p>
      </div>
    </>
  );
};