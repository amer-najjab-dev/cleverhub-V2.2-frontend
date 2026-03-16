import { TrendingUp, DollarSign, Package, Activity } from 'lucide-react';

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

  const stats = [
    {
      label: 'Ventas Hoy',
      value: formatCurrency(kpis?.todaySales || 0),
      icon: TrendingUp,
      color: 'bg-blue-500',
      bgLight: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      label: 'Ticket Promedio',
      value: formatCurrency(kpis?.averageTicket || 0),
      icon: DollarSign,
      color: 'bg-green-500',
      bgLight: 'bg-green-50',
      textColor: 'text-green-600'
    },
    {
      label: 'Stock Bajo',
      value: kpis?.lowStockCount || 0,
      icon: Package,
      color: 'bg-amber-500',
      bgLight: 'bg-amber-50',
      textColor: 'text-amber-600'
    },
    {
      label: 'Crecimiento',
      value: `${typeof kpis?.growth === 'number' ? kpis.growth.toFixed(1) : '0.0'}%`,
      icon: Activity,
      color: 'bg-purple-500',
      bgLight: 'bg-purple-50',
      textColor: 'text-purple-600'
    }
  ];

  return (
    <>
      {stats.map((stat, index) => (
        <div
          key={index}
          className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-105 animate-fadeIn"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-2">{stat.label}</p>
              <p className={`text-2xl font-bold ${stat.textColor}`}>{stat.value}</p>
            </div>
            <div className={`${stat.bgLight} p-3 rounded-lg`}>
              <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
            </div>
          </div>
        </div>
      ))}
    </>
  );
};