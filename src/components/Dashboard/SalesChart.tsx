import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BarChart3 } from 'lucide-react';
import { useCurrencyFormatter } from '../../utils/formatters';
import { dashboardService } from '../../services/dashboard.service';
import { HourlySale } from '../../services/dashboard.service';

interface SalesChartProps {
  period?: string;
  date?: string;
}

export const SalesChart = ({ period = 'today', date }: SalesChartProps) => {
  const { t } = useTranslation();
  const [data, setData] = useState<HourlySale[]>([]);
  const [loading, setLoading] = useState(true);
  const { formatCurrency } = useCurrencyFormatter();

  useEffect(() => {
    loadData();
  }, [period, date]);

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await dashboardService.getHourlySales(date);
      if (response.success) {
        setData(response.data);
      }
    } catch (error) {
      console.error('Error loading hourly sales:', error);
    } finally {
      setLoading(false);
    }
  };

  const maxValue = data.length > 0 
    ? Math.max(...data.map(item => item.value)) * 1.1
    : 100;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <BarChart3 className="w-5 h-5 text-gray-700 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">{t('salesChart.title')}</h3>
        </div>
      </div>
      
      <div className="h-72 w-full" style={{ minHeight: "288px", width: "100%" }}>
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="hour" stroke="#6b7280" fontSize={12} />
              <YAxis 
                domain={[0, maxValue]}
                stroke="#6b7280"
                fontSize={12}
                tickFormatter={(value) => formatCurrency(value)}
              />
              <Tooltip 
                formatter={(value: any) => {
                  if (typeof value === 'number') {
                    return [formatCurrency(value), t('salesChart.sales')];
                  }
                  return [value, t('salesChart.sales')];
                }}
                labelStyle={{ color: '#111827' }}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#3b82f6" 
                strokeWidth={3}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            {t('salesChart.no_data')}
          </div>
        )}
      </div>
    </div>
  );
};
