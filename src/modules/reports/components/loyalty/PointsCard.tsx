import React from 'react';
import { Coins, Award, TrendingUp, Users } from 'lucide-react';
import { LoyaltyPoints } from '../../services/loyalty.service';

interface PointsCardProps {
  points: LoyaltyPoints;
}

export const PointsCard: React.FC<PointsCardProps> = ({ points }) => {
  const items = [
    {
      icon: Coins,
      label: 'Points totaux',
      value: points.totalPoints.toLocaleString(),
      color: 'bg-blue-100 text-blue-600'
    },
    {
      icon: Award,
      label: 'Points disponibles',
      value: points.totalPointsAvailable.toLocaleString(),
      color: 'bg-green-100 text-green-600'
    },
    {
      icon: TrendingUp,
      label: 'Points utilisés',
      value: points.totalPointsUsed.toLocaleString(),
      color: 'bg-purple-100 text-purple-600'
    },
    {
      icon: Users,
      label: 'Clients avec points',
      value: points.clientsWithPoints.toLocaleString(),
      color: 'bg-orange-100 text-orange-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {items.map((item, index) => {
        const Icon = item.icon;
        return (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-lg ${item.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{item.label}</p>
                <p className="text-2xl font-bold text-gray-900">{item.value}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};