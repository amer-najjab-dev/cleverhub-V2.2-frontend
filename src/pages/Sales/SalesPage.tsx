import { useState, useEffect, useRef } from 'react';
import { SalesCart } from '../../components/SalesCart/SalesCart';
import { FinancialSummary } from '../../components/FinancialSummary/FinancialSummary';
import { CleverHubPanel } from '../../components/CleverHubPanel/CleverHubPanel';
import ProductSearchDropdown from '../../components/ProductSearchDropdown/ProductSearchDropdown';
import { productsService, Product } from '../../services/products.service';
import { clientsService, Client } from '../../services/clients.service';
import { salesService } from '../../services/sales.service';
import { useCartStore } from '../../store/cart.store';
import { useCurrencyFormatter } from '../../utils/formatters';
import { LoyaltyCheckoutButton } from '../../modules/sales/components/LoyaltyCheckoutButton';
import { loyaltyCheckoutService } from '../../modules/sales/services/loyaltyCheckout.service';
import { Search, X, User, Plus } from 'lucide-react';

// Debouncer para búsquedas
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  
  return debouncedValue;
};

export const SalesPage = () => {
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [showNewCustomerModal, setShowNewCustomerModal] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState<Client | null>(null);
  const [customerSearchResults, setCustomerSearchResults] = useState<Client[]>([]);
  const [showCustomerResults, setShowCustomerResults] = useState(false);
  
  const [productSearchResults, setProductSearchResults] = useState<Product[]>([]);
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [productFilter, setProductFilter] = useState('Todos');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isSearchingCustomers, setIsSearchingCustomers] = useState(false);
  
  // Refs para control de foco
  const productSearchRef = useRef<HTMLInputElement>(null);
  const customerSearchRef = useRef<HTMLInputElement>(null);
  
  // Estado para items de fidelidad
  const [loyaltyMetadata, setLoyaltyMetadata] = useState<any[]>([]);
  
  const { addItem, clearCart, setClient, clearClient } = useCartStore();
  const { formatCurrency } = useCurrencyFormatter();
  
  // AUTO-FOCUS INICIAL: al cargar la página, el foco va al buscador de productos
  useEffect(() => {
    if (productSearchRef.current) {
      productSearchRef.current.focus();
    }
  }, []);
  
  // Debounce para búsqueda de productos (300ms)
  const debouncedProductSearch = useDebounce(productSearchQuery, 300);
  
  // Búsqueda de productos usando API real
  useEffect(() => {
    const searchProducts = async () => {
      if (!debouncedProductSearch.trim() && productFilter === 'Todos') {
        setProductSearchResults([]);
        setSearchError(null);
        return;
      }
      
      setIsSearching(true);
      setSearchError(null);
      
      try {
        const response = await productsService.search(debouncedProductSearch);
        let results = response;
        
        if (productFilter !== 'Todos') {
          results = results.filter((product: Product) => {
            switch (productFilter) {
              case 'Medicamentos':
                return product.category === 'Medicamentos' || product.category?.includes('Medicamento');
              case 'Dermo':
                return product.category === 'Dermo' || product.category?.includes('Dermocosmética');
              case 'Solar':
                return product.category === 'Solar' || product.name.toLowerCase().includes('solar');
              case 'STOCK BAJO':
                return product.stock < 20;
              case 'MÁS VENDIDOS':
                return product.stock < 50;
              default:
                return true;
            }
          });
        }
        
        setProductSearchResults(results);
      } catch (error) {
        console.error('Error en búsqueda de productos:', error);
        setSearchError('No se pudieron cargar los productos. Intenta de nuevo más tarde.');
        setProductSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };
    
    searchProducts();
  }, [debouncedProductSearch, productFilter]);
  
  // Búsqueda de clientes con filtrado local (mínimo 3 caracteres)
  useEffect(() => {
    const searchCustomers = async () => {
      const query = customerSearchQuery.trim();
      if (!query || query.length < 3) {
        setCustomerSearchResults([]);
        setShowCustomerResults(false);
        return;
      }
      
      setIsSearchingCustomers(true);
      try {
        const response = await clientsService.search(query);
        let results = response.data;
        
        const lowerQuery = query.toLowerCase();
        results = results.filter(client => 
          client.name?.toLowerCase().includes(lowerQuery) ||
          client.phone?.toLowerCase().includes(lowerQuery) ||
          client.email?.toLowerCase().includes(lowerQuery) ||
          client.dni?.toLowerCase().includes(lowerQuery)
        );
        
        setCustomerSearchResults(results);
        setShowCustomerResults(results.length > 0);
      } catch (error) {
        console.error('Error en búsqueda de clientes:', error);
        setCustomerSearchResults([]);
        setShowCustomerResults(false);
      } finally {
        setIsSearchingCustomers(false);
      }
    };
    
    const timer = setTimeout(searchCustomers, 300);
    return () => clearTimeout(timer);
  }, [customerSearchQuery]);
  
  // Manejar blur del campo de cliente para volver al producto
  const handleCustomerBlur = () => {
    setTimeout(() => {
      if (productSearchRef.current) {
        productSearchRef.current.focus();
      }
    }, 200);
  };
  
  // Función para manejar la adición de items de fidelidad
  const handleAddLoyaltyItems = (items: any[]) => {
    const metadata = items.filter(item => item.isPackMetadata);
    const products = items.filter(item => !item.isPackMetadata);
    
    products.forEach(item => {
      addItem({
        id: item.productId,
        name: item.productName,
        category: 'Récompense',
        stock: 999,
        pricePPV: 0,
        pricePPH: 0,
        hasInteraction: false,
        lowStock: false,
        interactionWarning: undefined,
        isLoyalty: true,
        loyaltyType: item.type,
        loyaltyId: item.id,
        packId: item.packId,
        points: item.points
      });
    });
    
    setLoyaltyMetadata(prev => [...prev, ...metadata]);
  };
  
  const saveDraft = () => {
    const cartState = useCartStore.getState();
    if (cartState.items.length > 0) {
      const draft = {
        items: cartState.items,
        clientId: cartState.clientId,
        paymentMethod: cartState.paymentMethod,
        timestamp: new Date().toISOString(),
        customer: currentCustomer,
        loyaltyMetadata
      };
      localStorage.setItem('sales_draft', JSON.stringify(draft));
      console.log('📝 Borrador guardado automáticamente');
    }
  };

  useEffect(() => {
    const savedDraft = localStorage.getItem('sales_draft');
    if (savedDraft && window.confirm('¿Recuperar venta en borrador?')) {
      try {
        const draft = JSON.parse(savedDraft);
        console.log('📂 Borrador recuperado:', draft);
      } catch (error) {
        console.error('Error cargando borrador:', error);
      }
    }
    
    localStorage.removeItem('sales_draft');
  }, []);

  useEffect(() => {
    return () => {
      saveDraft();
    };
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const cartState = useCartStore.getState();
      if (cartState.items.length > 0) {
        e.preventDefault();
        saveDraft();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);
  
  const handleProductSearch = (query: string) => {
    setProductSearchQuery(query);
  };
  
  const handleFilterChange = (filter: string) => {
    setProductFilter(filter);
  };
  
  const handleCustomerSearch = (query: string) => {
    setCustomerSearchQuery(query);
    setShowCustomerResults(query.length >= 3);
  };
  
  const handleNewCustomer = () => {
    setShowNewCustomerModal(true);
  };
  
  const handleCustomerCreated = async (clientData: any) => {
    try {
      const response = await clientsService.create(clientData);
      const newClient = response.data;
      
      setCurrentCustomer(newClient);
      setShowNewCustomerModal(false);
      setCustomerSearchQuery('');
      setCustomerSearchResults([]);
      setShowCustomerResults(false);
      
      setClient(newClient.id);
      console.log('Nuevo cliente creado:', newClient);
      
      alert(`Cliente ${newClient.first_name} ${newClient.last_name || ''} creado exitosamente`);
      
      // Devolver foco al input de productos
      if (productSearchRef.current) {
        productSearchRef.current.focus();
      }
    } catch (error: any) {
      console.error('Error creando cliente:', error);
      alert(error.response?.data?.message || 'Error al crear cliente');
    }
  };
  
  const handleClearCustomer = () => {
    setCurrentCustomer(null);
    clearClient();
    setCustomerSearchQuery('');
    setCustomerSearchResults([]);
    setShowCustomerResults(false);
    setLoyaltyMetadata([]);
    console.log('🗑️ Cliente limpiado, carrito sin cliente asignado');
    
    // Devolver foco al input de productos
    if (productSearchRef.current) {
      productSearchRef.current.focus();
    }
  };
  
  const handleSelectCustomer = (client: Client) => {
    setCurrentCustomer(client);
    setClient(client.id);
    setCustomerSearchQuery('');
    setCustomerSearchResults([]);
    setShowCustomerResults(false);
    console.log('✅ Cliente seleccionado:', client.name);
    
    // Devolver foco al input de productos
    if (productSearchRef.current) {
      productSearchRef.current.focus();
    }
  };
  
  const handleAddProductToCart = async (product: Product, event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation();
    }
    
    try {
      addItem({
        id: product.id,
        name: product.name,
        category: product.category,
        stock: product.stock,
        pricePPV: typeof product.pricePPV === 'string' ? parseFloat(product.pricePPV) : product.pricePPV,
        pricePPH: typeof product.pricePPH === 'string' ? parseFloat(product.pricePPH) : product.pricePPH,
        hasInteraction: false,
        lowStock: product.stock < 10,
        interactionWarning: product.stock < 5 ? 'Stock muy bajo' : undefined
      });
      
      console.log('📦 Producto añadido al carrito:', product.name);
      
      setProductSearchResults(prev => 
        prev.map(p => 
          p.id === product.id 
            ? { ...p, stock: p.stock - 1 } 
            : p
        )
      );
      
      // Limpiar búsqueda y devolver foco
      setProductSearchQuery('');
      if (productSearchRef.current) {
        productSearchRef.current.focus();
      }
      
    } catch (error) {
      console.error('Error añadiendo producto al carrito:', error);
      alert('Error al añadir producto');
    }
  };

  const handleCheckout = async () => {
    try {
      const cartState = useCartStore.getState();
      const total = cartState.items.reduce((sum, item) => sum + item.pricePPV * item.quantity, 0);
      
      const saleData = {
        userId: 1,
        clientId: currentCustomer?.id,
        items: cartState.items.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.isLoyalty ? 0 : item.pricePPV,
          isLoyalty: item.isLoyalty || false
        })),
        paymentMethod: 'mixed' as const,
        paidAmount: total,
        total: total
      };
      
      const response = await salesService.create(saleData);
      const saleId = response.data.id;
      
      const itemsToRedeem: Array<{ id: number; type: string }> = [];
      
      const redeemed = new Set();
      cartState.items.forEach(item => {
        if (item.isLoyalty && item.loyaltyId && !redeemed.has(item.loyaltyId)) {
          itemsToRedeem.push({
            id: item.loyaltyId,
            type: item.loyaltyType || 'reward'
          });
          redeemed.add(item.loyaltyId);
        }
      });
      
      if (itemsToRedeem.length > 0 && currentCustomer) {
        await loyaltyCheckoutService.redeemItems(
          currentCustomer.id,
          itemsToRedeem,
          saleId
        );
      }
      
      clearCart();
      setLoyaltyMetadata([]);
      alert('Venta completada con éxito');
      
      // Devolver foco al input de productos
      if (productSearchRef.current) {
        productSearchRef.current.focus();
      }
      
    } catch (error) {
      console.error('Error processing sale:', error);
      alert('Error al procesar la venta');
    }
  };

  const getCustomerFullName = (client: any) => {
    const firstName = client.first_name || '';
    const lastName = client.last_name || '';
    
    if (firstName || lastName) {
      return `${firstName} ${lastName}`.trim();
    }
    return client.name || 'Cliente';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* STICKY 1: Barra de búsqueda (debajo del header principal) */}
      <div className="sticky top-[60px] z-40 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="px-6 py-3">
          {/* Barra de búsqueda superior - Compacta */}
          <div className="flex flex-col gap-3">
            {/* Fila principal: Productos (ancho completo) + Cliente + Nuevo */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              {/* Buscador de productos (ancho principal) */}
              <div className="flex-1 w-full">
                <ProductSearchDropdown
                  ref={productSearchRef}
                  onSearch={handleProductSearch}
                  onFilterChange={handleFilterChange}
                  onSelectProduct={handleAddProductToCart}
                  searchResults={productSearchResults}
                  isSearching={isSearching} 
                  placeholder="Buscar productos... (mínimo 3 caracteres)"
                />
              </div>

              {/* Cliente actual (si existe) - formato compacto */}
              {currentCustomer && (
                <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 whitespace-nowrap">
                  <User className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <div className="text-sm">
                    <span className="font-medium text-blue-900">
                      {getCustomerFullName(currentCustomer)}
                    </span>
                    {currentCustomer.phone && (
                      <span className="text-blue-600 ml-2">
                        • {currentCustomer.phone}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={handleClearCustomer}
                    className="ml-1 p-1 hover:bg-blue-100 rounded-full transition-colors"
                    title="Quitar cliente"
                  >
                    <X className="w-4 h-4 text-blue-600" />
                  </button>
                </div>
              )}

              {/* Buscador de clientes + Botón nuevo cliente */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-none sm:w-64">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <Search className="h-4 w-4" />
                  </div>
                  <input
                    ref={customerSearchRef}
                    type="text"
                    placeholder="Buscar cliente... (3+ letras)"
                    value={customerSearchQuery}
                    onChange={(e) => handleCustomerSearch(e.target.value)}
                    onFocus={() => customerSearchQuery.length >= 3 && setShowCustomerResults(true)}
                    onBlur={handleCustomerBlur}
                    className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                  
                  {/* Resultados de búsqueda de clientes */}
                  {showCustomerResults && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-40 max-h-60 overflow-y-auto">
                      {isSearchingCustomers ? (
                        <div className="p-3 text-center text-gray-500">Buscando...</div>
                      ) : customerSearchResults.length > 0 ? (
                        customerSearchResults.map(client => (
                          <button
                            key={client.id}
                            onClick={() => handleSelectCustomer(client)}
                            onMouseDown={(e) => e.preventDefault()}
                            className="w-full p-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                          >
                            <div className="font-medium text-gray-900">{getCustomerFullName(client)}</div>
                            <div className="text-xs text-gray-600">{client.phone}</div>
                          </button>
                        ))
                      ) : (
                        <div className="p-3 text-center text-gray-500">No se encontraron clientes</div>
                      )}
                    </div>
                  )}
                </div>
                
                <button
                  onClick={handleNewCustomer}
                  className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1 whitespace-nowrap"
                  title="Nuevo cliente"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Nuevo</span>
                </button>
              </div>
            </div>
            
            {/* Botón de Pago con Puntos (si hay cliente) */}
            {currentCustomer && (
              <div className="mt-2">
                <LoyaltyCheckoutButton
                  clientId={currentCustomer.id}
                  clientName={getCustomerFullName(currentCustomer)}
                  clientPoints={currentCustomer.loyaltyPoints || 0}
                  onAddToCart={handleAddLoyaltyItems}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mostrar resultados de búsqueda de productos (fuera del sticky) */}
      {(productSearchResults.length > 0 || isSearching || searchError) && (
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="max-w-7xl mx-auto">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              {isSearching ? 'Buscando productos...' : searchError ? 'Error' : `Resultados: ${productSearchResults.length} encontrados`}
            </h4>
            
            {isSearching ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : searchError ? (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
                {searchError}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {productSearchResults.map(product => {
                  const pricePPV = typeof product.pricePPV === 'string' ? parseFloat(product.pricePPV) : product.pricePPV;
                  const pricePPH = typeof product.pricePPH === 'string' ? parseFloat(product.pricePPH) : product.pricePPH;
                  
                  return (
                    <div 
                      key={product.id} 
                      className="p-3 bg-blue-50 border border-blue-100 rounded-lg hover:bg-blue-100 hover:border-blue-200 cursor-pointer transition-colors"
                      onClick={(e) => handleAddProductToCart(product, e)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h5 className="font-medium text-blue-800">{product.name}</h5>
                          <p className="text-sm text-blue-600">{product.category}</p>
                          {product.sku && (
                            <p className="text-xs text-blue-500">SKU: {product.sku}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <span className="text-blue-700 font-semibold">{formatCurrency(pricePPV)}</span>
                          <div className="text-xs text-gray-500">PPH: {formatCurrency(pricePPH)}</div>
                        </div>
                      </div>
                      <div className="mt-2 flex justify-between items-center">
                        <div className={`text-xs ${product.stock < 10 ? 'text-red-600 font-medium' : 'text-blue-500'}`}>
                          Stock: {product.stock} {product.stock < 10 && ' (¡Bajo stock!)'}
                        </div>
                        <button
                          onClick={(e) => handleAddProductToCart(product, e)}
                          disabled={product.stock <= 0}
                          className={`px-3 py-1 text-xs rounded ${
                            product.stock <= 0
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              : 'bg-blue-500 text-white hover:bg-blue-600'
                          }`}
                        >
                          {product.stock <= 0 ? 'Sin stock' : 'Añadir'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Contenido principal - Debajo del header sticky */}
      <div className="px-6 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-12 gap-6">
            {/* Carrito - 7 columnas */}
            <div className="col-span-12 lg:col-span-7">
              <SalesCart customer={currentCustomer} onClearCustomer={handleClearCustomer} />
              <CleverHubPanel />
            </div>
            
            {/* STICKY 2: Resumen financiero */}
            <div className="col-span-12 lg:col-span-5 sticky top-[152px] self-start">
              <FinancialSummary />
              <button
                onClick={handleCheckout}
                className="w-full mt-4 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
              >
                Finalizar Venta
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal para nuevo cliente */}
      {showNewCustomerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Nuevo Cliente</h3>
              <button 
                onClick={() => setShowNewCustomerModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre *
                </label>
                <input
                  type="text"
                  id="clientFirstName"
                  placeholder="Ej: Juan"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Apellido
                </label>
                <input
                  type="text"
                  id="clientLastName"
                  placeholder="Ej: Pérez"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono *
                </label>
                <input
                  type="tel"
                  id="clientPhone"
                  placeholder="Ej: 0612345678"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="clientEmail"
                  placeholder="ejemplo@email.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  DNI/NIF
                </label>
                <input
                  type="text"
                  id="clientDni"
                  placeholder="12345678A"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t flex justify-end gap-3">
              <button
                onClick={() => setShowNewCustomerModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={async () => {
                  const firstName = (document.getElementById('clientFirstName') as HTMLInputElement)?.value;
                  const lastName = (document.getElementById('clientLastName') as HTMLInputElement)?.value;
                  const phone = (document.getElementById('clientPhone') as HTMLInputElement)?.value;
                  const email = (document.getElementById('clientEmail') as HTMLInputElement)?.value;
                  const dni = (document.getElementById('clientDni') as HTMLInputElement)?.value;
                  
                  if (!firstName || !phone) {
                    alert('Nombre y teléfono son obligatorios');
                    return;
                  }
                  
                  const clientData = {
                    firstName,
                    lastName: lastName || undefined,
                    phone,
                    email: email || undefined,
                    dni: dni || undefined,
                  };
                  
                  await handleCustomerCreated(clientData);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Crear Cliente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};