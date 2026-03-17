import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { KpiCards } from '../components/bi/KpiCards';
import { SalesTrendChart } from '../components/bi/SalesTrendChart';
import { TopProductsTable } from '../components/bi/TopProductsTable';
import { LostSalesTable } from '../components/bi/LostSalesTable';
import { useDashboardData } from '../hooks/useReportData';
import { useCurrencyFormatter } from '../../../utils/formatters';

export const BIDashboardPage: React.FC = () => {
  const { formatCurrency } = useCurrencyFormatter();
  const [period, setPeriod] = useState<'week' | 'month' | 'quarter'>('week');
  
  const { 
    kpis, 
    salesTrend, 
    topProducts, 
    lostSales, 
    loading, 
    error, 
    refetch 
  } = useDashboardData(period);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tableau de bord analytique</h1>
            <p className="text-gray-600 mt-1">KPIs, tendances et performances</p>
          </div>
          
          <div className="flex gap-3">
            {/* Selector de período - CORREGIDO */}
            <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-300 p-1">
              <button
                onClick={() => setPeriod('week')}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  period === 'week' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                7j
              </button>
              <button
                onClick={() => setPeriod('month')}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  period === 'month' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                30j
              </button>
              <button
                onClick={() => setPeriod('quarter')}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  period === 'quarter' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                90j
              </button>
            </div>

            <button
              onClick={refetch}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              title="Actualiser"
            >
              <RefreshCw className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* KPIs */}
        {kpis && (
          <div className="mb-6">
            <KpiCards kpis={kpis} formatCurrency={formatCurrency} />
          </div>
        )}

        {/* Gráfico de tendencia */}
        <div className="mb-6">
          <SalesTrendChart data={salesTrend} period={period} />
        </div>

        {/* Tablas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TopProductsTable products={topProducts} />
          <LostSalesTable sales={lostSales} />
        </div>
      </div>
    </div>
  );
};