import React from 'react';
import { Crown, Star, Medal } from 'lucide-react';
import { useCurrencyFormatter } from '../../../../utils/formatters';
import { TierAnalysis } from '../../services/loyalty.service';

interface TierCardsProps {
  tiers: TierAnalysis;
}

export const TierCards: React.FC<TierCardsProps> = ({ tiers }) => {
  const { formatCurrency } = useCurrencyFormatter();

  const tierConfig = {
    Or: {
      icon: Crown,
      color: 'bg-yellow-100 text-yellow-600',
      border: 'border-yellow-200',
      bg: 'bg-yellow-50'
    },
    Argent: {
      icon: Star,
      color: 'bg-gray-100 text-gray-600',
      border: 'border-gray-200',
      bg: 'bg-gray-50'
    },
    Bronze: {
      icon: Medal,
      color: 'bg-amber-100 text-amber-700',
      border: 'border-amber-200',
      bg: 'bg-amber-50'
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {(['Or', 'Argent', 'Bronze'] as const).map((tier) => {
        const config = tierConfig[tier];
        const Icon = config.icon;
        const data = tiers.tiers[tier];

        return (
          <div key={tier} className={`bg-white rounded-xl shadow-sm border ${config.border} p-6`}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-3 rounded-lg ${config.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-lg">{tier}</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Nombre de clients</span>
                <span className="font-bold text-xl">{data.count}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Dépense totale</span>
                <span className="font-semibold">{formatCurrency(data.totalSpent)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-100">
                <span className="text-gray-600">Dépense moyenne</span>
                <span className="font-semibold text-blue-600">
                  {formatCurrency(tiers.averageSpentByTier[tier])}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};