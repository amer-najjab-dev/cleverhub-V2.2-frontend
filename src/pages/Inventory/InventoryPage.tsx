import { useState, useEffect } from 'react';
import { Download, RefreshCw, FileText, Package, AlertTriangle } from 'lucide-react';
import { StockTable } from '../../components/Inventory/StockTable';
import { StockFilters } from '../../components/Inventory/StockFilters';
import { EditStockModal } from '../../components/Inventory/EditStockModal';
import { StockSummary } from '../../components/Inventory/StockSummary';
import { Pagination } from '../../components/Inventory/Pagination';
import { inventoryService, InventoryProduct } from '../../services/inventory.service';

export const InventoryPage = () => {
  const [products, setProducts] = useState<InventoryProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<InventoryProduct | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [zoneFilter, setZoneFilter] = useState('');
  const [labFilter, setLabFilter] = useState('');
  const [showExpiringOnly, setShowExpiringOnly] = useState(false);

  // Opciones para filtros
  const [categories, setCategories] = useState<string[]>([]);
  const [zones, setZones] = useState<string[]>([]);
  const [laboratories, setLaboratories] = useState<string[]>([]);

  // Resumen
  const [summary, setSummary] = useState({
  totalProducts: 0,
  totalStockValue: 0,
  totalRetailValue: 0,
  lowStockCount: 0,
  expiringCount: 0,
  expiredCount: 0
});

  useEffect(() => {
    loadInventory();
  }, [currentPage, pageSize, searchQuery, categoryFilter, zoneFilter, labFilter]);

  // Cargar datos para filtros (solo una vez)
  useEffect(() => {
    loadFilterOptions();
    loadSummary();
  }, []);

  const loadInventory = async () => {
    setLoading(true);
    try {
      const params: any = {
        page: currentPage,
        limit: pageSize
      };
      
      if (searchQuery) params.search = searchQuery;
      if (categoryFilter) params.category = categoryFilter;
      if (zoneFilter) params.zone = zoneFilter;
      if (labFilter) params.lab = labFilter;
      
      const response = await inventoryService.getInventory(params);
      if (response.success) {
        setProducts(response.data);
        setTotalItems(response.meta?.total || 0);
        setTotalPages(response.meta?.totalPages || 0);
      }
    } catch (error) {
      console.error('Error loading inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFilterOptions = async () => {
    try {
      // Cargar una página grande para obtener opciones de filtro
      const response = await inventoryService.getInventory({ limit: 1000 });
      if (response.success) {
        const cats = [...new Set(response.data.map(p => p.category).filter(Boolean))];
        const zns = [...new Set(response.data.map(p => p.zone).filter(Boolean))];
        const labs = [...new Set(response.data.map(p => p.laboratory).filter(Boolean))];
        
        setCategories(cats as string[]);
        setZones(zns as string[]);
        setLaboratories(labs as string[]);
      }
    } catch (error) {
      console.error('Error loading filter options:', error);
    }
  };

  const loadSummary = async () => {
  try {
    const response = await inventoryService.getSummary();
    if (response.success) {
      // Mapear los campos de InventorySummary a nuestro estado
      setSummary({
        totalProducts: response.data.totalProducts,
        totalStockValue: response.data.totalStockValue,
        totalRetailValue: response.data.totalRetailValue,
        lowStockCount: response.data.lowStockCount,
        expiringCount: response.data.expiringCount,
        expiredCount: response.data.expiredCount
      });
    }
  } catch (error) {
    console.error('Error loading summary:', error);
  }
};

  const handleEdit = (product: InventoryProduct) => {
    setSelectedProduct(product);
    setShowEditModal(true);
  };

  const handleSaveEdit = async (productId: number, data: any) => {
    try {
      // Asegurarnos de que productId está incluido en data
      const adjustmentData = { ...data, productId };
      const response = await inventoryService.adjustStock(adjustmentData);
      if (response.success) {
        setShowEditModal(false);
        loadInventory();
        loadSummary();
      }
    } catch (error) {
      console.error('Error adjusting stock:', error);
    }
  };

  const handleExport = () => {
    console.log('Exportando inventario...');
  };

  const handlePrintStock = () => {
    console.log('Imprimiendo stock...');
  };

  const handleResetStock = () => {
    if (window.confirm('⚠️ ¿Estás seguro de querer poner todo el stock a cero?')) {
      if (window.confirm('⚠️ CONFIRMACIÓN FINAL: Esta acción no se puede deshacer. ¿Continuar?')) {
        console.log('Stock reset');
      }
    }
  };

  const handleSearch = () => {
    setCurrentPage(1); // Resetear a primera página al buscar
    loadInventory();
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1); // Resetear a primera página al cambiar tamaño
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Stock</h1>
          <p className="text-gray-600 mt-2">Control de inventario y caducidades</p>
        </div>

        {/* Barra de acciones */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Download className="w-4 h-4" />
                Exportar
              </button>
              <button
                onClick={handlePrintStock}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <FileText className="w-4 h-4" />
                Imprimir Stock
              </button>
              <button
                onClick={handleResetStock}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                <RefreshCw className="w-4 h-4" />
                Stock a Cero
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                <Package className="w-4 h-4" />
                Importaciones
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                <AlertTriangle className="w-4 h-4" />
                Inventario
              </button>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <StockFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSearch={handleSearch}
          categoryFilter={categoryFilter}
          onCategoryChange={setCategoryFilter}
          zoneFilter={zoneFilter}
          onZoneChange={setZoneFilter}
          labFilter={labFilter}
          onLabChange={setLabFilter}
          showExpiringOnly={showExpiringOnly}
          onExpiringToggle={() => setShowExpiringOnly(!showExpiringOnly)}
          categories={categories}
          zones={zones}
          laboratories={laboratories}
        />

        {/* Tabla de stock */}
        <StockTable
          products={products}
          loading={loading}
          onEdit={handleEdit}
        />

        {/* Paginación */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          pageSize={pageSize}
          onPageSizeChange={handlePageSizeChange}
          totalItems={totalItems}
        />

        {/* Resumen */}
        <StockSummary
          totalPPH={summary.totalStockValue}
          totalPPV={summary.totalRetailValue}
          margin={summary.totalRetailValue - summary.totalStockValue}
          lowStockCount={summary.lowStockCount}
          expiringCount={summary.expiringCount}
        />

        {/* Modal de edición */}
        <EditStockModal
          product={selectedProduct}
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSave={handleSaveEdit}
        />
      </div>
    </div>
  );
};