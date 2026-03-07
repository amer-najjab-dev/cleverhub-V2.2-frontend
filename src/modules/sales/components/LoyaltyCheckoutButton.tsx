import React, { useState } from 'react';
import { Gift, Package, X, Check, ShoppingCart } from 'lucide-react';
import { useCurrencyFormatter } from '../../../utils/formatters';
import { loyaltyCheckoutService, RedeemableReward } from '../services/loyaltyCheckout.service';

interface LoyaltyCheckoutButtonProps {
  clientId: number;
  clientName: string;
  clientPoints: number;
  onAddToCart: (items: any[]) => void;
}

export const LoyaltyCheckoutButton: React.FC<LoyaltyCheckoutButtonProps> = ({
  clientId,
  clientName,
  clientPoints,
  onAddToCart
}) => {
  const { formatCurrency } = useCurrencyFormatter();
  const [showModal, setShowModal] = useState(false);
  const [rewards, setRewards] = useState<RedeemableReward[]>([]);
  const [availablePoints, setAvailablePoints] = useState(clientPoints);
  const [loading, setLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Map<number, RedeemableReward>>(new Map());
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'rewards' | 'packs'>('all');

  const loadAvailableRewards = async () => {
    setLoading(true);
    try {
      const response = await loyaltyCheckoutService.getAvailableRewards(clientId);
      setRewards(response.data);
      setAvailablePoints(response.clientPoints);
      setShowModal(true);
    } catch (error) {
      console.error('Error loading rewards:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (reward: RedeemableReward) => {
    const newSelected = new Map(selectedItems);
    if (newSelected.has(reward.id)) {
      newSelected.delete(reward.id);
    } else {
      newSelected.set(reward.id, reward);
    }
    setSelectedItems(newSelected);
  };

  const handleAddToCart = () => {
    const items: any[] = [];
    
    selectedItems.forEach((reward) => {
      if (reward.type === 'reward' && reward.product) {
        items.push({
          id: reward.id,
          type: 'reward',
          productId: reward.product.id,
          productName: reward.product.name,
          quantity: 1,
          price: 0,
          points: reward.pointsCost,
          isLoyalty: true
        });
      } else if (reward.type === 'pack' && reward.products) {
        // Para packs, añadimos los productos individualmente
        reward.products.forEach(product => {
          items.push({
            id: reward.id,
            type: 'pack',
            packId: reward.id,
            packName: reward.name,
            productId: product.id,
            productName: product.name,
            quantity: 1,
            price: 0,
            points: 0, // Los puntos se cobran una vez por pack
            isLoyalty: true
          });
        });
        
        // Añadir metadata del pack
        items.push({
          isPackMetadata: true,
          packId: reward.id,
          packName: reward.name,
          pointsCost: reward.pointsCost,
          productCount: reward.products.length
        });
      }
    });
    
    onAddToCart(items);
    setShowModal(false);
    setSelectedItems(new Map());
  };

  const filteredRewards = rewards.filter(reward => {
    if (activeTab === 'rewards' && reward.type !== 'reward') return false;
    if (activeTab === 'packs' && reward.type !== 'pack') return false;
    
    if (searchTerm) {
      return reward.name.toLowerCase().includes(searchTerm.toLowerCase());
    }
    return true;
  });

  const totalPoints = Array.from(selectedItems.values()).reduce((sum, item) => sum + item.pointsCost, 0);
  const totalValue = Array.from(selectedItems.values()).reduce((sum, item) => sum + item.originalValue, 0);

  return (
    <>
      <button
        onClick={loadAvailableRewards}
        disabled={loading || !clientId}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
      >
        <Gift className="w-5 h-5" />
        {loading ? 'Chargement...' : `Payer avec Points (${clientPoints} pts)`}
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">Choisir des récompenses</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Client: {clientName} | Points disponibles: <span className="font-bold text-purple-600">{availablePoints} pts</span>
                  </p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex gap-4 mt-4 border-b border-gray-200">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'all' ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-500'
                  }`}
                >
                  Tout ({rewards.length})
                </button>
                <button
                  onClick={() => setActiveTab('rewards')}
                  className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'rewards' ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-500'
                  }`}
                >
                  Produits ({rewards.filter(r => r.type === 'reward').length})
                </button>
                <button
                  onClick={() => setActiveTab('packs')}
                  className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'packs' ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-500'
                  }`}
                >
                  Packs ({rewards.filter(r => r.type === 'pack').length})
                </button>
              </div>

              {/* Search */}
              <div className="relative mt-4">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Rechercher une récompense..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* Lista de recompensas */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-300px)]">
              <div className="grid grid-cols-1 gap-4">
                {filteredRewards.map((reward) => (
                  <div
                    key={reward.id}
                    className={`border rounded-lg p-4 transition-colors cursor-pointer ${
                      selectedItems.has(reward.id)
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                    onClick={() => toggleSelect(reward)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          {reward.type === 'pack' ? (
                            <Package className="w-4 h-4 text-purple-600" />
                          ) : (
                            <Gift className="w-4 h-4 text-purple-600" />
                          )}
                          <h4 className="font-medium">{reward.name}</h4>
                          {reward.type === 'pack' && (
                            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">
                              Pack
                            </span>
                          )}
                        </div>
                        
                        {reward.type === 'pack' && reward.products && (
                          <div className="mt-2 text-sm text-gray-600">
                            <p>Contient: {reward.products.map(p => p.name).join(', ')}</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="text-right">
                        <div className="text-lg font-bold text-purple-600">
                          {reward.pointsCost} pts
                        </div>
                        <div className="text-sm text-gray-500 line-through">
                          {formatCurrency(reward.originalValue)}
                        </div>
                      </div>
                    </div>

                    {selectedItems.has(reward.id) && (
                      <div className="mt-2 flex items-center gap-1 text-green-600">
                        <Check className="w-4 h-4" />
                        <span className="text-sm">Sélectionné</span>
                      </div>
                    )}
                  </div>
                ))}

                {filteredRewards.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    Aucune récompense disponible
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <span className="text-sm text-gray-600">Total sélectionné:</span>
                  <span className="ml-2 font-bold">{selectedItems.size} article(s)</span>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">Points requis</div>
                  <div className={`text-xl font-bold ${totalPoints > availablePoints ? 'text-red-600' : 'text-purple-600'}`}>
                    {totalPoints} pts
                  </div>
                  <div className="text-xs text-gray-500">
                    Valeur: {formatCurrency(totalValue)}
                  </div>
                </div>
              </div>

              {totalPoints > availablePoints && (
                <div className="mb-4 p-2 bg-red-50 text-red-700 text-sm rounded-lg">
                  Points insuffisants. Il vous manque {totalPoints - availablePoints} points.
                </div>
              )}

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  onClick={handleAddToCart}
                  disabled={selectedItems.size === 0 || totalPoints > availablePoints}
                  className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Ajouter au panier
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};