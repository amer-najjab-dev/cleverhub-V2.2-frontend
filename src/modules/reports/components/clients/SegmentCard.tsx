import React from 'react';
import { Users, AlertTriangle } from 'lucide-react';
import { ClientSegment } from '../../services/clientIntelligence.service';
import { useCurrencyFormatter } from '../../../../utils/formatters';

interface SegmentCardProps {
  segment: ClientSegment;
}

export const SegmentCard: React.FC<SegmentCardProps> = ({ segment }) => {
  const { formatCurrency } = useCurrencyFormatter();

  const colorClasses = {
    purple: 'bg-purple-50 border-purple-200 text-purple-700',
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    green: 'bg-green-50 border-green-200 text-green-700',
    orange: 'bg-orange-50 border-orange-200 text-orange-700',
    red: 'bg-red-50 border-red-200 text-red-700'
  };

  const iconMap = {
    purple: <Users className="w-5 h-5 text-purple-600" />,
    blue: <Users className="w-5 h-5 text-blue-600" />,
    green: <Users className="w-5 h-5 text-green-600" />,
    orange: <AlertTriangle className="w-5 h-5 text-orange-600" />,
    red: <AlertTriangle className="w-5 h-5 text-red-600" />
  };

  return (
    <div className={`rounded-xl border p-6 ${colorClasses[segment.color as keyof typeof colorClasses]}`}>
      <div className="flex items-center gap-3 mb-4">
        {iconMap[segment.color as keyof typeof iconMap]}
        <h3 className="font-semibold">{segment.name}</h3>
      </div>
      
      <p className="text-sm mb-4">{segment.description}</p>
      
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm">Nombre de clients</span>
          <span className="text-2xl font-bold">{segment.clientCount}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm">Ticket moyen</span>
          <span className="text-lg font-semibold">{formatCurrency(segment.averageSpent)}</span>
        </div>
      </div>
    </div>
  );
};