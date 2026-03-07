import React, { useState } from 'react';
import { 
  Filter, 
  Award, 
  Clock, 
  TrendingUp,
  Users,
  Eye
} from 'lucide-react';
import { connectService, CampaignSegment } from '../services/connect.service';

interface CampaignSegmentationProps {
  onSegmentChange: (segment: CampaignSegment) => void;
  onPreview: (count: number) => void;
}

export const CampaignSegmentation: React.FC<CampaignSegmentationProps> = ({
  onSegmentChange,
  onPreview
}) => {
  const [selectedTiers, setSelectedTiers] = useState<string[]>([]);
  const [dormantDays, setDormantDays] = useState<number | undefined>(undefined);
  const [minPoints, setMinPoints] = useState<number | undefined>(undefined);
  const [maxPoints, setMaxPoints] = useState<number | undefined>(undefined);
  const [lastPurchaseDays, setLastPurchaseDays] = useState<number | undefined>(undefined);
  const [previewCount, setPreviewCount] = useState<number | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const tiers = [
    { id: 'Or', label: 'Or', color: 'text-yellow-600 bg-yellow-50 border-yellow-200' },
    { id: 'Argent', label: 'Argent', color: 'text-gray-600 bg-gray-50 border-gray-200' },
    { id: 'Bronze', label: 'Bronze', color: 'text-amber-600 bg-amber-50 border-amber-200' }
  ];

  const handleTierToggle = (tier: string) => {
    setSelectedTiers(prev => 
      prev.includes(tier) 
        ? prev.filter(t => t !== tier)
        : [...prev, tier]
    );
  };

  const handlePreview = async () => {
    const segment: CampaignSegment = {
      tiers: selectedTiers.length > 0 ? selectedTiers as any : undefined,
      dormantDays,
      minPoints,
      maxPoints,
      lastPurchaseDays
    };

    setPreviewLoading(true);
    try {
      const response = await connectService.previewSegmentation(segment);
      // CORRECCIÓN: response.data ya contiene el objeto { count, clients }
      setPreviewCount(response.data.count);
      onPreview(response.data.count);
      onSegmentChange(segment);
    } catch (error) {
      console.error('Error previewing segment:', error);
    } finally {
      setPreviewLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Filter className="w-5 h-5 text-blue-600" />
        Segmentation de la campagne
      </h3>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-1">
            <Award className="w-4 h-4" />
            Niveaux de fidélité
          </label>
          <div className="flex gap-2">
            {tiers.map((tier) => (
              <button
                key={tier.id}
                onClick={() => handleTierToggle(tier.id)}
                className={`px-4 py-2 rounded-lg border transition-all ${
                  selectedTiers.includes(tier.id)
                    ? tier.color + ' border-2 font-medium'
                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {tier.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-1">
            <Clock className="w-4 h-4" />
            Clients dormants
          </label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              value={dormantDays || ''}
              onChange={(e) => setDormantDays(e.target.value ? parseInt(e.target.value) : undefined)}
              placeholder="90"
              className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-gray-600">jours sans achat</span>
            <button
              onClick={() => setDormantDays(90)}
              className="px-3 py-1 bg-blue-50 text-blue-600 text-sm rounded-lg hover:bg-blue-100"
            >
              Réactivation
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-1">
            <TrendingUp className="w-4 h-4" />
            Solde de points
          </label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              value={minPoints || ''}
              onChange={(e) => setMinPoints(e.target.value ? parseInt(e.target.value) : undefined)}
              placeholder="Min"
              className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-gray-400">-</span>
            <input
              type="number"
              value={maxPoints || ''}
              onChange={(e) => setMaxPoints(e.target.value ? parseInt(e.target.value) : undefined)}
              placeholder="Max"
              className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-gray-600">points</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-1">
            <Users className="w-4 h-4" />
            Dernier achat
          </label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              value={lastPurchaseDays || ''}
              onChange={(e) => setLastPurchaseDays(e.target.value ? parseInt(e.target.value) : undefined)}
              placeholder="30"
              className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-gray-600">jours ou moins</span>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <button
            onClick={handlePreview}
            disabled={previewLoading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <Eye className="w-4 h-4" />
            {previewLoading ? 'Calcul...' : 'Prévisualiser la segmentation'}
          </button>

          {previewCount !== null && (
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <span className="font-bold">{previewCount}</span> client(s) correspondent à ces critères
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};