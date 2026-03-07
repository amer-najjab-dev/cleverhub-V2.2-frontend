import React, { useState, useEffect } from 'react';
import { Search, Plus, Trash2, Package, ToggleLeft, ToggleRight } from 'lucide-react';
import { api } from '../../../../services/api';

interface Reward {
  id: number;
  productId: number;
  product: {
    id: number;
    name: string;
    pricePPV: number;
    pricePPH: number;
    stock: number;
    imageUrl?: string;
  };
  pointsCost: number;
  isActive: boolean;
  description?: string;
  maxQuantity?: number;
  startDate?: string;
  endDate?: string;
}

export const RewardCatalog: React.FC = () => {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [productSearch, setProductSearch] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  useEffect(() => {
    loadRewards();
  }, []);

  const loadRewards = async () => {
    try {
      const response = await api.get('/loyalty/rewards?activeOnly=false');
      setRewards(response.data.data);
    } catch (error) {
      console.error('Error loading rewards:', error);
    }
  };

  const searchProducts = async (query: string) => {
    if (!query) {
      setSearchResults([]);
      return;
    }
    try {
      console.log('Searching products:', query);
      const response = await api.get(`/products/search?q=${query}`);
      
      // La API devuelve DIRECTAMENTE un array
      const products = Array.isArray(response.data) ? response.data : [];
      console.log('Products found:', products);
      
      setSearchResults(products.slice(0, 10));
    } catch (error) {
      console.error('Error searching products:', error);
      setSearchResults([]);
    }
  };

  const handleCreateReward = async (productId: number, pointsCost: number) => {
    try {
      console.log('Creating reward:', { productId, pointsCost });
      
      const response = await api.post('/loyalty/rewards', {
        productId,
        pointsCost,
        isActive: true
      });
      
      console.log('Reward created:', response.data);
      
      setShowCreateModal(false);
      setSelectedProduct(null);
      setProductSearch('');
      loadRewards();
    } catch (error: any) {
      console.error('Error creating reward:', error);
      alert(error.response?.data?.message || 'Error al crear la recompensa');
    }
  };

  const handleToggleActive = async (reward: Reward) => {
    try {
      await api.put(`/loyalty/rewards/${reward.id}`, {
        isActive: !reward.isActive
      });
      loadRewards();
    } catch (error) {
      console.error('Error toggling reward:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar esta recompensa?')) return;
    try {
      await api.delete(`/loyalty/rewards/${id}`);
      loadRewards();
    } catch (error) {
      console.error('Error deleting reward:', error);
    }
  };

  const filteredRewards = rewards.filter(r => 
    r.product?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Catalogue de Récompenses</h3>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Ajouter une récompense
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Rechercher une récompense..."
          className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Lista de recompensas */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produit</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prix</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Points requis</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Stock</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actif</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredRewards.map((reward) => (
              <tr key={reward.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <Package className="w-5 h-5 text-gray-400" />
                    <div>
                      <div className="font-medium">{reward.product?.name}</div>
                      <div className="text-xs text-gray-500">ID: {reward.productId}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'MAD' }).format(reward.product?.pricePPV || 0)}
                </td>
                <td className="px-6 py-4 text-center font-semibold text-purple-600">
                  {reward.pointsCost} pts
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    reward.product?.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {reward.product?.stock || 0}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <button onClick={() => handleToggleActive(reward)}>
                    {reward.isActive ? (
                      <ToggleRight className="w-6 h-6 text-green-600" />
                    ) : (
                      <ToggleLeft className="w-6 h-6 text-gray-400" />
                    )}
                  </button>
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => handleDelete(reward.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredRewards.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            Aucune récompense disponible
          </div>
        )}
      </div>

      {/* Modal de creación */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Ajouter une récompense</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rechercher un produit
                </label>
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => {
                    setProductSearch(e.target.value);
                    searchProducts(e.target.value);
                  }}
                  placeholder="Nom du produit..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {searchResults.length > 0 && (
                <div className="border border-gray-200 rounded-lg max-h-60 overflow-y-auto">
                  {searchResults.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => {
                        setSelectedProduct(product);
                        setProductSearch('');
                        setSearchResults([]);
                      }}
                      className="w-full p-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                    >
                      <div className="font-medium">{product.name}</div>
                      <div className="text-sm text-gray-500">
                        Prix: {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'MAD' }).format(product.pricePPV)}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {selectedProduct && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="font-medium">{selectedProduct.name}</div>
                  <div className="text-sm text-blue-700 mt-1">
                    Prix: {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'MAD' }).format(selectedProduct.pricePPV)}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Points requis
                </label>
                <input
                  type="number"
                  id="rewardPointsCost"
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: 1000"
                />
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setSelectedProduct(null);
                    setProductSearch('');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  onClick={() => {
                    const pointsCost = (document.getElementById('rewardPointsCost') as HTMLInputElement)?.value;
                    if (selectedProduct && pointsCost) {
                      handleCreateReward(selectedProduct.id, parseInt(pointsCost));
                    } else {
                      alert('Selecciona un producto y especifica los puntos');
                    }
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Créer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};