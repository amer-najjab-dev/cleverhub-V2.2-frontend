import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { TrendingUp } from 'lucide-react';
import { useCurrencyFormatter } from '../../../../utils/formatters';

interface SalesTrendChartProps {
  data: Array<{
    date: string;
    actual: number;
    previous: number;
  }>;
  period: string;
}

export const SalesTrendChart: React.FC<SalesTrendChartProps> = ({ data, period }) => {
  const { formatCurrency } = useCurrencyFormatter();

  const getPeriodText = () => {
    switch (period) {
      case 'week': return '7 derniers jours';
      case 'month': return '30 derniers jours';
      case 'quarter': return '90 derniers jours';
      default: return 'Période';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Tendance des ventes</h3>
        </div>
        <span className="text-sm text-gray-500">{getPeriodText()}</span>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" tickFormatter={(value) => formatCurrency(value)} />
            <Tooltip
              formatter={(value: any) => {
                if (typeof value === 'number') {
                  return [formatCurrency(value), 'Ventes'];
                }
                return [value, 'Ventes'];
              }}
              labelStyle={{ color: '#111827' }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="actual"
              name="Période actuelle"
              stroke="#3b82f6"
              strokeWidth={3}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="previous"
              name="Période précédente"
              stroke="#9ca3af"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};