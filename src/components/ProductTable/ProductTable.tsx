import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCurrencyFormatter } from '../../utils/formatters';
import { productsService, Product } from '../../services/products.service';
import { CATEGORIES, DOSAGE_FORMS, ZONES, ACTIVE_OPTIONS } from '../../constants/productConstants';
import FilterComponent from './FilterComponent';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const ProductTable: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [paginatedProducts, setPaginatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { formatCurrency } = useCurrencyFormatter();

  // Estados de paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);

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

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [products, filters]);

  // Actualizar paginación cuando cambien los productos filtrados
  useEffect(() => {
    const pages = Math.ceil(filteredProducts.length / pageSize);
    setTotalPages(pages || 1);
    setCurrentPage(1); // Resetear a primera página al filtrar
  }, [filteredProducts, pageSize]);

  // Actualizar productos paginados cuando cambie la página o el tamaño de página
  useEffect(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    setPaginatedProducts(filteredProducts.slice(start, end));
  }, [filteredProducts, currentPage, pageSize]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productsService.getAll();
      setProducts(response);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...products];

    if (filters.name) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(filters.name.toLowerCase())
      );
    }
    if (filters.category) {
      filtered = filtered.filter(p => p.category === filters.category);
    }
    if (filters.dosageForm) {
      filtered = filtered.filter(p => p.dosageForm === filters.dosageForm);
    }
    if (filters.pricePPV) {
      const val = parseFloat(filters.pricePPV);
      if (!isNaN(val)) {
        filtered = filtered.filter(p => p.pricePPV === val);
      }
    }
    if (filters.pricePPH) {
      const val = parseFloat(filters.pricePPH);
      if (!isNaN(val)) {
        filtered = filtered.filter(p => p.pricePPH === val);
      }
    }
    if (filters.barcode) {
      filtered = filtered.filter(p =>
        p.barcode && p.barcode.includes(filters.barcode)
      );
    }
    if (filters.zone) {
      filtered = filtered.filter(p => p.zone === filters.zone);
    }
    if (filters.active !== '') {
      const activeBool = filters.active === 'true';
      filtered = filtered.filter(p => p.active === activeBool);
    }

    setFilteredProducts(filtered);
  };

  const handleFilterChange = (field: string, value: any) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, filteredProducts.length);

  if (loading) {
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
            <tr>
              <th className="px-4 py-2">
                <FilterComponent
                  type="text"
                  value={filters.name}
                  onChange={(val) => handleFilterChange('name', val)}
                  placeholder="Filtrar nombre"
                />
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
                  placeholder="Precio exacto"
                  min={0}
                  step={0.01}
                />
              </th>
              <th className="px-4 py-2">
                <FilterComponent
                  type="number"
                  value={filters.pricePPH}
                  onChange={(val) => handleFilterChange('pricePPH', val)}
                  placeholder="Precio exacto"
                  min={0}
                  step={0.01}
                />
              </th>
              <th className="px-4 py-2">
                <FilterComponent
                  type="text"
                  value={filters.barcode}
                  onChange={(val) => handleFilterChange('barcode', val)}
                  placeholder="Código barras"
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
            {paginatedProducts.map((product) => {
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
        {filteredProducts.length === 0 && (
          <div className="p-4 text-center text-gray-500">No se encontraron productos</div>
        )}

        {/* Paginación */}
        {filteredProducts.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-700">
                Mostrando <span className="font-medium">{startItem}</span> a{' '}
                <span className="font-medium">{endItem}</span>{' '}
                de <span className="font-medium">{filteredProducts.length}</span> productos
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