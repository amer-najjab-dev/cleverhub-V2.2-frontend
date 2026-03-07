import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { useCurrencyFormatter } from '../../utils/formatters';
import { dashboardService } from '../../services/dashboard.service';
import { ComparativeData } from '../../services/dashboard.service';

interface ComparativeChartProps {
  period?: string;
}

export const ComparativeChart = ({ period }: ComparativeChartProps) => {
  const [data, setData] = useState<ComparativeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [growth, setGrowth] = useState(0);
  const { formatCurrency } = useCurrencyFormatter();

  useEffect(() => {
    loadData();
  }, [period]);

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await dashboardService.getComparativeData();
      if (response.success) {
        setData(response.data);
        
        // Calcular crecimiento total
        const totalActual = response.data.reduce((sum, item) => sum + item.actual, 0);
        const totalPrevious = response.data.reduce((sum, item) => sum + item.previous, 0);
        const calculatedGrowth = totalPrevious > 0 
          ? ((totalActual - totalPrevious) / totalPrevious) * 100 
          : 0;
        setGrowth(calculatedGrowth);
      }
    } catch (error) {
      console.error('Error loading comparative data:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalActual = data.reduce((sum, item) => sum + item.actual, 0);
  const totalPrevious = data.reduce((sum, item) => sum + item.previous, 0);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Ventas Comparativas</h3>
          <p className="text-sm text-gray-500">Esta semana vs semana anterior</p>
        </div>
        {!loading && data.length > 0 && (
          <div className="flex items-center bg-green-50 text-green-700 px-3 py-1 rounded-full">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span className="text-sm font-medium">+{growth.toFixed(1)}%</span>
          </div>
        )}
      </div>
      
      <div className="h-72 min-w-0" style={{ minHeight: "288px" }}>
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="day" stroke="#6b7280" fontSize={12} />
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
              <Legend />
              <Bar 
                dataKey="actual" 
                name="Esta semana" 
                fill="#3b82f6" 
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="previous" 
                name="Semana anterior" 
                fill="#d1d5db" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            No hay datos para el período seleccionado
          </div>
        )}
      </div>
      
      {!loading && data.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{formatCurrency(totalActual)}</div>
            <div className="text-sm text-gray-500">Total actual</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{formatCurrency(totalPrevious)}</div>
            <div className="text-sm text-gray-500">Total anterior</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">+{growth.toFixed(1)}%</div>
            <div className="text-sm text-gray-500">Crecimiento</div>
          </div>
        </div>
      )}
    </div>
  );
};