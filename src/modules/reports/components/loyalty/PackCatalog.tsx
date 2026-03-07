import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  ToggleLeft, 
  ToggleRight,
  Search,
  X
} from 'lucide-react';
import { api } from '../../../../services/api';
import { useCurrencyFormatter } from '../../../../utils/formatters';

interface Pack {
  id: number;
  name: string;
  description?: string;
  pointsCost: number;
  isActive: boolean;
  imageUrl?: string;
  maxQuantity?: number;
  startDate?: string;
  endDate?: string;
  products: Array<{
    id: number;
    name: string;
    pricePPV: number;
    pricePPH: number;
    imageUrl?: string;
  }>;
}

export const PackCatalog: React.FC = () => {
  const { formatCurrency } = useCurrencyFormatter();
  const [packs, setPacks] = useState<Pack[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<any[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadPacks();
  }, []);

  const loadPacks = async () => {
    try {
      const response = await api.get('/loyalty/packs?activeOnly=false');
      setPacks(response.data.data);
    } catch (error) {
      console.error('Error loading packs:', error);
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

  const addProductToPack = (product: any) => {
    if (!selectedProducts.find(p => p.id === product.id)) {
      setSelectedProducts([...selectedProducts, product]);
    }
    setProductSearch('');
    setSearchResults([]);
  };

  const removeProductFromPack = (productId: number) => {
    setSelectedProducts(selectedProducts.filter(p => p.id !== productId));
  };

  const handleCreatePack = async () => {
    const name = (document.getElementById('packName') as HTMLInputElement)?.value;
    const pointsCost = (document.getElementById('packPoints') as HTMLInputElement)?.value;
    const description = (document.getElementById('packDescription') as HTMLTextAreaElement)?.value;

    console.log('Creating pack:', { name, pointsCost, description, products: selectedProducts });

    if (!name || !pointsCost || selectedProducts.length === 0) {
      alert('Complete todos los campos y seleccione al menos un producto');
      return;
    }

    try {
      const response = await api.post('/loyalty/packs', {
        name,
        description,
        pointsCost: parseInt(pointsCost),
        productIds: selectedProducts.map(p => p.id),
        isActive: true
      });
      
      console.log('Pack created:', response.data);
      
      setShowCreateModal(false);
      setSelectedProducts([]);
      loadPacks();
    } catch (error: any) {
      console.error('Error creating pack:', error);
      alert(error.response?.data?.message || 'Error al crear el pack');
    }
  };

  const handleToggleActive = async (pack: Pack) => {
    try {
      await api.put(`/loyalty/packs/${pack.id}`, {
        isActive: !pack.isActive
      });
      loadPacks();
    } catch (error) {
      console.error('Error toggling pack:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este pack?')) return;
    try {
      await api.delete(`/loyalty/packs/${id}`);
      loadPacks();
    } catch (error) {
      console.error('Error deleting pack:', error);
    }
  };

  const totalValue = selectedProducts.reduce((sum, p) => sum + p.pricePPV, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Packs de Fidélité</h3>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Créer un pack
        </button>
      </div>

      {/* Lista de packs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {packs.map((pack) => (
          <div
            key={pack.id}
            className={`bg-white rounded-xl shadow-sm border p-6 ${
              pack.isActive ? 'border-gray-200' : 'border-gray-200 opacity-60'
            }`}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="font-semibold text-lg">{pack.name}</h4>
                {pack.description && (
                  <p className="text-sm text-gray-500 mt-1">{pack.description}</p>
                )}
              </div>
              <button onClick={() => handleToggleActive(pack)}>
                {pack.isActive ? (
                  <ToggleRight className="w-6 h-6 text-green-600" />
                ) : (
                  <ToggleLeft className="w-6 h-6 text-gray-400" />
                )}
              </button>
            </div>

            <div className="mb-4">
              <div className="text-2xl font-bold text-purple-600">
                {pack.pointsCost} pts
              </div>
              <div className="text-sm text-gray-500 line-through">
                {formatCurrency(pack.products.reduce((sum, p) => sum + p.pricePPV, 0))}
              </div>
            </div>

            <div className="space-y-2 mb-4">
              {pack.products.map((product) => (
                <div key={product.id} className="flex justify-between text-sm">
                  <span>{product.name}</span>
                  <span className="text-gray-500">{formatCurrency(product.pricePPV)}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => handleDelete(pack.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {packs.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <p className="text-gray-500">Aucun pack créé</p>
        </div>
      )}

      {/* Modal de creación */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold">Créer un pack de fidélité</h3>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="space-y-4">
                {/* Información básica */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom du pack *
                  </label>
                  <input
                    type="text"
                    id="packName"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: Pack Bien-être"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    id="packDescription"
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Description du pack..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Points requis *
                  </label>
                  <input
                    type="number"
                    id="packPoints"
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: 2000"
                  />
                </div>

                {/* Búsqueda de productos */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Produits du pack *
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={productSearch}
                      onChange={(e) => {
                        setProductSearch(e.target.value);
                        searchProducts(e.target.value);
                      }}
                      placeholder="Rechercher des produits..."
                      className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {searchResults.length > 0 && (
                    <div className="mt-2 border border-gray-200 rounded-lg max-h-40 overflow-y-auto">
                      {searchResults.map((product) => (
                        <button
                          key={product.id}
                          onClick={() => addProductToPack(product)}
                          className="w-full p-2 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 flex justify-between items-center"
                        >
                          <span className="text-sm">{product.name}</span>
                          <span className="text-xs text-gray-500">
                            {formatCurrency(product.pricePPV)}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Productos seleccionados */}
                {selectedProducts.length > 0 && (
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium mb-3">Produits sélectionnés</h4>
                    <div className="space-y-2">
                      {selectedProducts.map((product) => (
                        <div key={product.id} className="flex justify-between items-center">
                          <span className="text-sm">{product.name}</span>
                          <button
                            onClick={() => removeProductFromPack(product.id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">Valeur totale</span>
                        <span>{formatCurrency(totalValue)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setSelectedProducts([]);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleCreatePack}
                disabled={selectedProducts.length === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Créer le pack
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};