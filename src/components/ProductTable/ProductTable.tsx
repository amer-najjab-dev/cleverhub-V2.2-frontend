import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCurrencyFormatter } from '../../utils/formatters';
import { productsService, Product } from '../../services/products.service';
import { CATEGORIES, DOSAGE_FORMS, ZONES, ACTIVE_OPTIONS } from '../../constants/productConstants';
import FilterComponent from './FilterComponent';
import { ChevronLeft, ChevronRight, Search, X } from 'lucide-react';

const ProductTable: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { formatCurrency } = useCurrencyFormatter();

  // Estados de paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  // Estados de filtros
  const [filters, setFilters] = useState({
    name: '',
    category: '',
    dosageForm: '',
    pricePPV: '',
    pricePPH: '',
    barcode: '',
    zone: '',
    active: '' as '' | 'true' | 'false',
  });

  // Estado para el término de búsqueda
  const [searchInput, setSearchInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Búsqueda directa usando el mismo método que ventas
  useEffect(() => {
    const searchProducts = async () => {
      if (searchInput.length >= 3) {
        setIsSearching(true);
        try {
          const results = await productsService.search(searchInput);
          setProducts(results);
          setTotalItems(results.length);
          setTotalPages(Math.ceil(results.length / pageSize));
          setCurrentPage(1);
        } catch (error) {
          console.error('Error searching products:', error);
        } finally {
          setIsSearching(false);
        }
      } else if (searchInput.length === 0) {
        // Si no hay búsqueda, cargar todos los productos paginados
        fetchProducts();
      }
    };
    
    const debounceTimer = setTimeout(searchProducts, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchInput]);

  // Cargar productos paginados cuando no hay búsqueda
  const fetchProducts = async () => {
    try {
      setLoading(true);
      
      const params: any = {
        page: currentPage,
        limit: pageSize,
      };
      
      if (filters.category) params.category = filters.category;
      if (filters.dosageForm) params.dosageForm = filters.dosageForm;
      if (filters.barcode) params.barcode = filters.barcode;
      if (filters.zone) params.zone = filters.zone;
      if (filters.active !== '') params.active = filters.active === 'true';
      if (filters.pricePPV) {
        const val = parseFloat(filters.pricePPV);
        if (!isNaN(val)) params.pricePPV = val;
      }
      if (filters.pricePPH) {
        const val = parseFloat(filters.pricePPH);
        if (!isNaN(val)) params.pricePPH = val;
      }
      
      const response = await productsService.getAllPaginated(params);
      setProducts(response.data);
      setTotalPages(response.meta.totalPages);
      setTotalItems(response.meta.total);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Recargar cuando cambian los filtros que no son nombre
  useEffect(() => {
    if (searchInput.length === 0) {
      fetchProducts();
    }
  }, [currentPage, pageSize, filters.category, filters.dosageForm, filters.pricePPV, filters.pricePPH, filters.barcode, filters.zone, filters.active]);

  const handleFilterChange = (field: string, value: any) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setCurrentPage(1);
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const clearSearch = () => {
    setSearchInput('');
    setCurrentPage(1);
    fetchProducts();
  };

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  if (loading || isSearching) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Cargando productos...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Listado de Productos</h1>

      {/* Tabla de productos */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoría</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Forma</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">PPV</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">PPH</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Código barras</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Zona</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Activo</th>
            </tr>
            <tr className="border-t border-gray-200">
              <th className="px-4 py-2">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Buscar por nombre... (mínimo 3 caracteres)"
                    className="w-full pl-7 pr-7 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {searchInput && (
                    <button
                      onClick={clearSearch}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2"
                    >
                      <X className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600" />
                    </button>
                  )}
                </div>
                {searchInput.length > 0 && searchInput.length < 3 && (
                  <p className="text-xs text-amber-600 mt-0.5">Mínimo 3 caracteres</p>
                )}
                {searchInput.length >= 3 && products.length === 0 && !isSearching && (
                  <p className="text-xs text-red-500 mt-0.5">No se encontraron productos</p>
                )}
              </th>
              <th className="px-4 py-2">
                <FilterComponent
                  type="select"
                  value={filters.category}
                  onChange={(val) => handleFilterChange('category', val)}
                  options={CATEGORIES.map((c: string) => ({ value: c, label: c }))}
                />
              </th>
              <th className="px-4 py-2">
                <FilterComponent
                  type="select"
                  value={filters.dosageForm}
                  onChange={(val) => handleFilterChange('dosageForm', val)}
                  options={DOSAGE_FORMS.map((f: string) => ({ value: f, label: f }))}
                />
              </th>
              <th className="px-4 py-2">
                <FilterComponent
                  type="number"
                  value={filters.pricePPV}
                  onChange={(val) => handleFilterChange('pricePPV', val)}
                  placeholder="Precio"
                  min={0}
                  step={0.01}
                />
              </th>
              <th className="px-4 py-2">
                <FilterComponent
                  type="number"
                  value={filters.pricePPH}
                  onChange={(val) => handleFilterChange('pricePPH', val)}
                  placeholder="Precio"
                  min={0}
                  step={0.01}
                />
              </th>
              <th className="px-4 py-2">
                <FilterComponent
                  type="text"
                  value={filters.barcode}
                  onChange={(val) => handleFilterChange('barcode', val)}
                  placeholder="Código"
                />
              </th>
              <th className="px-4 py-2">
                <FilterComponent
                  type="select"
                  value={filters.zone}
                  onChange={(val) => handleFilterChange('zone', val)}
                  options={ZONES.map((z: string) => ({ value: z, label: z }))}
                />
              </th>
              <th className="px-4 py-2">
                <FilterComponent
                  type="select"
                  value={filters.active}
                  onChange={(val) => handleFilterChange('active', val)}
                  options={ACTIVE_OPTIONS.map((opt: { value: boolean; label: string }) => ({ 
                    value: String(opt.value), 
                    label: opt.label 
                  }))}
                />
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((product) => {
              const pricePPV = typeof product.pricePPV === 'string' ? parseFloat(product.pricePPV) : product.pricePPV;
              const pricePPH = typeof product.pricePPH === 'string' ? parseFloat(product.pricePPH) : product.pricePPH;
              
              return (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link to={`/products/${product.id}`} className="text-blue-600 hover:underline">
                      {product.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{product.category}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{product.dosageForm || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{formatCurrency(pricePPV)}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{formatCurrency(pricePPH)}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{product.barcode || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{product.zone || '-'}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        product.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {product.active ? 'Oui' : 'Non'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Mensaje si no hay resultados */}
        {products.length === 0 && !isSearching && searchInput.length === 0 && (
          <div className="p-4 text-center text-gray-500">No se encontraron productos</div>
        )}

        {/* Paginación */}
        {totalItems > 0 && (
          <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-700">
                Mostrando <span className="font-medium">{startItem}</span> a{' '}
                <span className="font-medium">{endItem}</span>{' '}
                de <span className="font-medium">{totalItems}</span> productos
              </span>
              
              <select
                value={pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value={10}>10 por página</option>
                <option value={50}>50 por página</option>
                <option value={100}>100 por página</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-2 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <span className="px-3 py-1 text-sm text-gray-700">
                Página {currentPage} de {totalPages}
              </span>
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="relative inline-flex items-center px-2 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductTable;
