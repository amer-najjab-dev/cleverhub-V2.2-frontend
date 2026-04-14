import { useTranslation } from 'react-i18next';
import { TrendingUp, DollarSign, Package, Activity } from 'lucide-react';

interface QuickStatsProps {
  kpis: any;
  loading: boolean;
  formatCurrency: (value: number) => string;
}

export const QuickStats = ({ kpis, loading, formatCurrency }: QuickStatsProps) => {
  const { t } = useTranslation();

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

  const todaySales = typeof kpis?.todaySales === 'number' ? kpis.todaySales : 0;
  const averageTicket = typeof kpis?.averageTicket === 'number' ? kpis.averageTicket : 0;
  const lowStockCount = typeof kpis?.lowStockCount === 'number' ? kpis.lowStockCount : 0;
  const growth = typeof kpis?.growth === 'number' ? kpis.growth : 0;

  return (
    <>
      <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-105 animate-fadeIn">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-2">{t('quickStats.today_sales')}</p>
            <p className="text-2xl font-bold text-blue-600">{formatCurrency(todaySales)}</p>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg">
            <TrendingUp className="w-6 h-6 text-blue-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-105 animate-fadeIn" style={{ animationDelay: '100ms' }}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-2">{t('quickStats.average_ticket')}</p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(averageTicket)}</p>
          </div>
          <div className="bg-green-50 p-3 rounded-lg">
            <DollarSign className="w-6 h-6 text-green-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-105 animate-fadeIn" style={{ animationDelay: '200ms' }}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-2">{t('quickStats.low_stock')}</p>
            <p className="text-2xl font-bold text-amber-600">{lowStockCount}</p>
          </div>
          <div className="bg-amber-50 p-3 rounded-lg">
            <Package className="w-6 h-6 text-amber-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-105 animate-fadeIn" style={{ animationDelay: '300ms' }}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-2">{t('quickStats.growth')}</p>
            <p className={`text-2xl font-bold ${growth >= 0 ? 'text-purple-600' : 'text-red-600'}`}>
              {growth.toFixed(1)}%
            </p>
          </div>
          <div className="bg-purple-50 p-3 rounded-lg">
            <Activity className="w-6 h-6 text-purple-600" />
          </div>
        </div>
      </div>
    </>
  );
};
