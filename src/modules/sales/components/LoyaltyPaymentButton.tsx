import React, { useState } from 'react';
import { Gift } from 'lucide-react';
import { api } from '../../../services/api';

interface LoyaltyPaymentButtonProps {
  clientId: number;
  clientPoints: number;
  cartTotal: number;
  onSuccess: (transaction: any) => void;
  onError: (error: string) => void;
}

export const LoyaltyPaymentButton: React.FC<LoyaltyPaymentButtonProps> = ({
  clientId,
  clientPoints,
  onSuccess,
  onError
}) => {
  const [loading, setLoading] = useState(false);
  const [showRewards, setShowRewards] = useState(false);
  const [rewards, setRewards] = useState<any[]>([]);

  const loadRewards = async () => {
    try {
      const response = await api.get('/loyalty/rewards?activeOnly=true');
      const availableRewards = response.data.data.filter(
        (r: any) => r.pointsCost <= clientPoints
      );
      setRewards(availableRewards);
      setShowRewards(true);
    } catch (error) {
      console.error('Error loading rewards:', error);
    }
  };

  const handleRedeem = async (rewardId: number, pointsCost: number) => {
    if (pointsCost > clientPoints) {
      onError('Puntos insuficientes');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post(`/loyalty/redeem/reward/${clientId}/${rewardId}`, {
        saleId: null // Se asociará a la venta actual
      });
      
      onSuccess(response.data.data);
      setShowRewards(false);
    } catch (error: any) {
      onError(error.response?.data?.message || 'Error al canjear puntos');
    } finally {
      setLoading(false);
    }
  };


  return (
    <>
      {clientPoints > 0 && (
        <div className="mt-4">
          <button
            onClick={loadRewards}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Gift className="w-5 h-5" />
            Payer avec Points ({clientPoints} points disponibles)
          </button>
        </div>
      )}

      {showRewards && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold">Choisir une récompense</h3>
              <p className="text-sm text-gray-500 mt-1">
                Vos points: {clientPoints} pts
              </p>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
              {rewards.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  Aucune récompense disponible avec vos points
                </p>
              ) : (
                <div className="space-y-4">
                  {rewards.map((reward) => (
                    <div
                      key={reward.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{reward.product?.name}</h4>
                          <p className="text-sm text-gray-500 mt-1">
                            {reward.description || 'Produit disponible en échange de points'}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-purple-600">
                            {reward.pointsCost} pts
                          </div>
                          <div className="text-sm text-gray-500 line-through">
                            {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'MAD' }).format(reward.product?.pricePPV || 0)}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleRedeem(reward.id, reward.pointsCost)}
                        disabled={loading || reward.pointsCost > clientPoints}
                        className="mt-3 w-full px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors disabled:opacity-50"
                      >
                        {loading ? 'Traitement...' : 'Échanger mes points'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setShowRewards(false)}
                className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};