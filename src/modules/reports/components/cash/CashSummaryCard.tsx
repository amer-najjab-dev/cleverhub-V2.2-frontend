import React from 'react';
import { LucideIcon } from 'lucide-react';
import { useCurrencyFormatter } from '../../../../utils/formatters';

interface CashSummaryCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  color: 'blue' | 'green' | 'orange' | 'red' | 'purple';
}

const colorClasses = {
  blue: 'bg-blue-50 text-blue-700 border-blue-200',
  green: 'bg-green-50 text-green-700 border-green-200',
  orange: 'bg-orange-50 text-orange-700 border-orange-200',
  red: 'bg-red-50 text-red-700 border-red-200',
  purple: 'bg-purple-50 text-purple-700 border-purple-200'
};

export const CashSummaryCard: React.FC<CashSummaryCardProps> = ({
  title,
  value,
  icon: Icon,
  color
}) => {
  const { formatCurrency } = useCurrencyFormatter();

  return (
    <div className={`rounded-xl p-6 border ${colorClasses[color]}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 rounded-lg bg-white/50">
          <Icon className="w-6 h-6" />
        </div>
      </div>
      <p className="text-sm font-medium opacity-80 mb-1">{title}</p>
      <p className="text-2xl font-bold">{formatCurrency(value)}</p>
    </div>
  );
};
