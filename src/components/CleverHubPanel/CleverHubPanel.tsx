// src/components/CleverHubPanel/CleverHubPanel.tsx - VERSIÓN TRADUCIDA
import { useTranslation } from 'react-i18next';
import { Brain, TrendingUp, AlertTriangle, Trophy } from 'lucide-react';
import { useCartStore } from '../../store/cart.store';
import { ToastNotification } from '../ui/ToastNotification';
import { useState, useEffect } from 'react';
import { productsService, Product } from '../../services/products.service';
import { useCurrencyFormatter } from '../../utils/formatters';

export const CleverHubPanel = () => {
  const { t } = useTranslation();
  const { addItem } = useCartStore();
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { formatCurrency } = useCurrencyFormatter();

  // Obtener productos reales del backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const productsData = await productsService.getAll();
        
        // Filtrar productos para mostrar solo algunos
        const filteredProducts = productsData
          .filter((product: Product) => product.stock > 0) // Solo productos con stock
          .slice(0, 4); // Mostrar máximo 4 productos
        
        setProducts(filteredProducts);
        setError(null);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(t('cleverHub.load_error'));
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleAddToCart = (product: Product) => {
    addItem({
      id: product.id,
      name: product.name,
      category: product.category,
      stock: product.stock,
      pricePPV: parseFloat(product.pricePPV.toString()),
      pricePPH: parseFloat(product.pricePPH.toString()),
      hasInteraction: false,
      lowStock: product.stock < 20
    });
    
    setNotificationMessage(t('cleverHub.added_to_cart', { name: product.name }));
    setShowNotification(true);
  };

  return (
    <>
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="bg-purple-600 p-2 rounded-lg mr-3">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">{t('cleverHub.title')}</h3>
              <p className="text-sm text-gray-600">
                {t('cleverHub.subtitle')}
              </p>
            </div>
          </div>
          
          {/* Gamificación */}
          <div className="flex items-center bg-white px-4 py-2 rounded-full border border-purple-200">
            <Trophy className="w-5 h-5 text-amber-500 mr-2" />
            <div>
              <div className="text-sm font-semibold text-gray-900">{t('cleverHub.level')} 7</div>
              <div className="text-xs text-gray-500">{t('cleverHub.specialist')}</div>
            </div>
          </div>
        </div>

        {/* Sugerencias de Upselling */}
        <div className="mb-6">
          <div className="flex items-center mb-4">
            <TrendingUp className="w-5 h-5 text-green-600 mr-2" />
            <h4 className="font-semibold text-gray-900">{t('cleverHub.sales_suggestions')}</h4>
          </div>
          
          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">{t('common.loading')}</p>
            </div>
          ) : error ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-700">{error}</p>
            </div>
          ) : products.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-gray-600">{t('cleverHub.no_products')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {products.map((product) => {
                const pricePPV = parseFloat(product.pricePPV.toString());
                
                return (
                  <div 
                    key={product.id} 
                    className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleAddToCart(product)}
                  >
                    <div className="font-medium text-gray-900">{product.name}</div>
                    <div className="text-sm text-gray-500 mt-1">{product.category}</div>
                    
                    <div className="mt-2 text-center">
                      <span className={`text-xs ${product.stock < 20 ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                        {t('cleverHub.stock')}: {product.stock} {product.stock < 10 ? '⚠️' : ''}
                      </span>
                    </div>
                    
                    <div className="mt-4 space-y-3">
                      <div className="text-center">
                        <span className="text-base font-semibold text-gray-900">
                          {formatCurrency(pricePPV)}
                        </span>
                      </div>
                      
                      <button 
                        className="w-full bg-blue-600 text-white text-sm px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(product);
                        }}
                      >
                        {t('cleverHub.add_to_cart')}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Interacciones medicamentosas */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
            <h4 className="font-semibold text-red-700">{t('cleverHub.interaction_detected')}</h4>
          </div>
          <p className="text-red-700">
            <span className="font-semibold">{t('cleverHub.interaction_products')}</span> • {t('cleverHub.interaction_risk')}
          </p>
          <div className="flex items-center mt-3 text-sm text-red-600">
            <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
            <span>{t('cleverHub.severity')}</span>
          </div>
        </div>

        {/* Objetivos de gamificación */}
        <div className="mt-6 flex justify-between items-center text-sm">
          <div className="flex items-center">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-2">
              <span className="text-blue-700 font-bold">5</span>
            </div>
            <span className="text-gray-600">{t('cleverHub.upselling_completed')}</span>
          </div>
          <div className="flex items-center">
            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-2">
              <span className="text-green-700 font-bold">3</span>
            </div>
            <span className="text-gray-600">{t('cleverHub.interactions_prevented')}</span>
          </div>
          <div className="flex items-center">
            <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center mr-2">
              <span className="text-amber-700 font-bold">85%</span>
            </div>
            <span className="text-gray-600">{t('cleverHub.conversion_rate')}</span>
          </div>
        </div>
      </div>

      {/* Notificación toast */}
      <ToastNotification
        message={notificationMessage}
        isVisible={showNotification}
        onClose={() => setShowNotification(false)}
      />
    </>
  );
};
