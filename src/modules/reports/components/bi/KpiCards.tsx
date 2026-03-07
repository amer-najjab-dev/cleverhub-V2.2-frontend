import React from 'react';
import { TrendingUp, Package, AlertCircle, ShoppingCart, Percent } from 'lucide-react';
// Eliminado DollarSign y useCurrencyFormatter que no se usaban

interface KpiCardsProps {
  kpis: {
    totalStockValue: number;
    averageMargin: number;
    expiringPercentage: number;
    totalSales: number;
    salesGrowth: number;
    lowStockCount: number;
    pendingOrders: number;
  };
  formatCurrency: (value: number) => string;
}

export const KpiCards: React.FC<KpiCardsProps> = ({ kpis, formatCurrency }) => {
  const cards = [
    {
      title: 'Valeur du stock',
      value: formatCurrency(kpis.totalStockValue),
      icon: Package,
      color: 'bg-blue-500',
      bgLight: 'bg-blue-50',
      textColor: 'text-blue-700'
    },
    {
      title: 'Marge moyenne',
      value: `${kpis.averageMargin.toFixed(1)}%`,
      icon: Percent,
      color: 'bg-green-500',
      bgLight: 'bg-green-50',
      textColor: 'text-green-700'
    },
    {
      title: 'Produits à risque',
      value: `${kpis.expiringPercentage.toFixed(1)}%`,
      icon: AlertCircle,
      color: 'bg-red-500',
      bgLight: 'bg-red-50',
      textColor: 'text-red-700'
    },
    {
      title: 'Ventes totales',
      value: formatCurrency(kpis.totalSales),
      icon: ShoppingCart,
      color: 'bg-purple-500',
      bgLight: 'bg-purple-50',
      textColor: 'text-purple-700'
    },
    {
      title: 'Croissance',
      value: `${kpis.salesGrowth > 0 ? '+' : ''}${kpis.salesGrowth.toFixed(1)}%`,
      icon: TrendingUp,
      color: kpis.salesGrowth >= 0 ? 'bg-emerald-500' : 'bg-orange-500',
      bgLight: kpis.salesGrowth >= 0 ? 'bg-emerald-50' : 'bg-orange-50',
      textColor: kpis.salesGrowth >= 0 ? 'text-emerald-700' : 'text-orange-700'
    },
    {
      title: 'Stock faible',
      value: kpis.lowStockCount,
      icon: Package,
      color: 'bg-amber-500',
      bgLight: 'bg-amber-50',
      textColor: 'text-amber-700'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div
            key={index}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{card.title}</p>
                <p className={`text-2xl font-bold ${card.textColor}`}>{card.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${card.bgLight}`}>
                <Icon className={`w-6 h-6 ${card.textColor}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};