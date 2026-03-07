import { useState, useEffect } from 'react';
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

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <BarChart3 className="w-5 h-5 text-gray-700 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Ventas por Hora</h3>
        </div>
      </div>
      
      <div className="h-72 min-w-0" style={{ minHeight: "288px" }}>
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="hour" stroke="#6b7280" fontSize={12} />
              <YAxis 
                stroke="#6b7280"
                fontSize={12}
                tickFormatter={(value) => formatCurrency(value)}
              />
              <Tooltip 
                formatter={(value: any) => {
                  if (typeof value === 'number') {
                    return [formatCurrency(value), 'Ventas'];
                  }
                  return [value, 'Ventas'];
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
            No hay datos para el período seleccionado
          </div>
        )}
      </div>
    </div>
  );
};