import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, Eye, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { clientsService } from '../../services/clients.service';
import { Client } from '../../services/clients.service';

const ClientsPage = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [paginatedClients, setPaginatedClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [debtMap, setDebtMap] = useState<Map<number, number>>(new Map());
  
  // Estados para el filtro de deuda
  const [showDebtFilter, setShowDebtFilter] = useState(false);
  const [debtRange, setDebtRange] = useState<[number, number]>([0, 5000]);
  const [debtFilterActive, setDebtFilterActive] = useState(false);
  
  // Estados de paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);

  // Fetch clients on component mount
  useEffect(() => {
    fetchClients();
  }, []);

  // Filtrar clientes cuando cambie la búsqueda, el rango de deuda o los clientes cargados
  useEffect(() => {
    filterClients();
  }, [searchQuery, debtRange, debtFilterActive, clients, debtMap]);

  // Actualizar paginación cuando cambien los clientes filtrados
  useEffect(() => {
    const pages = Math.ceil(filteredClients.length / pageSize);
    setTotalPages(pages || 1);
    setCurrentPage(1); // Resetear a primera página al filtrar
  }, [filteredClients, pageSize]);

  // Actualizar clientes paginados cuando cambie la página o el tamaño de página
  useEffect(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    setPaginatedClients(filteredClients.slice(start, end));
  }, [filteredClients, currentPage, pageSize]);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const response = await clientsService.getAll();
      const clientsData = response.data;
      
      // Obtener deudas para todos los clientes en paralelo
      const debtPromises = clientsData.map(client => 
        clientsService.getDebt(client.id).catch(() => null)
      );
      
      const debtsResults = await Promise.all(debtPromises);
      
      // Construir mapa de deudas
      const newDebtMap = new Map<number, number>();
      clientsData.forEach((client, index) => {
        const debtData = debtsResults[index]?.data;
        const debtAmount = debtData?.pending_amount ? Number(debtData.pending_amount) : 0;
        newDebtMap.set(client.id, debtAmount);
      });
      
      setDebtMap(newDebtMap);
      setClients(clientsData);
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast.error('Error al cargar los clientes');
    } finally {
      setLoading(false);
    }
  };

  const filterClients = () => {
    let filtered = [...clients];
    
    // Filtro por texto
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(client => 
        (client.first_name?.toLowerCase() + ' ' + client.last_name?.toLowerCase()).includes(query) ||
        client.phone?.toLowerCase().includes(query) ||
        client.email?.toLowerCase().includes(query) ||
        client.dni?.toLowerCase().includes(query)
      );
    }
    
    // Filtro por rango de deuda
    if (debtFilterActive) {
      filtered = filtered.filter(client => {
        const debt = debtMap.get(client.id) || 0;
        return debt >= debtRange[0] && debt <= debtRange[1];
      });
    }
    
    setFilteredClients(filtered);
  };

  const handleSearch = () => {
    filterClients();
  };

  const handleDeleteClick = (client: Client) => {
    setClientToDelete(client);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!clientToDelete) return;

    try {
      const canDeleteResponse = await clientsService.checkCanDelete(clientToDelete.id);
      
      if (!canDeleteResponse.data.canDelete) {
        toast.error('No se puede eliminar el cliente porque tiene un importe pendiente de pago mayor a 0');
        return;
      }

      await clientsService.delete(clientToDelete.id);
      
      toast.success('Cliente eliminado correctamente');
      fetchClients();
    } catch (error: any) {
      console.error('Error deleting client:', error);
      toast.error(error.response?.data?.error || 'Error al eliminar el cliente');
    } finally {
      setShowDeleteModal(false);
      setClientToDelete(null);
    }
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, filteredClients.length);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
          <p className="text-gray-600">Gestión de clientes y registros de salud</p>
        </div>
        <Link
          to="/clients/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus size={20} />
          Nuevo Cliente
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow p-4 mb-6">
        <div className="flex flex-wrap gap-4 relative">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar por nombre, teléfono, email o DNI..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
          </div>
          <button
            onClick={handleSearch}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Search size={20} />
            Buscar
          </button>
          
          <div className="relative">
            <button
              onClick={() => setShowDebtFilter(!showDebtFilter)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200 ${
                debtFilterActive 
                  ? 'bg-blue-50 border-blue-300 text-blue-700' 
                  : 'bg-white border-gray-300 text-gray-600 hover:border-blue-400'
              }`}
            >
              <Filter size={16} />
              <span className="text-sm font-medium">Filtro deuda</span>
              {debtFilterActive && (
                <span className="ml-1 w-4 h-4 bg-blue-500 text-white rounded-full text-xs flex items-center justify-center">
                  !
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Dropdown de filtro - aparece debajo, sin solaparse */}
        {showDebtFilter && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex flex-wrap items-end gap-4">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">Deuda mínima (MAD)</label>
                <input
                  type="number"
                  value={debtRange[0]}
                  onChange={(e) => setDebtRange([Number(e.target.value), debtRange[1]])}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0"
                  min="0"
                  step="100"
                />
              </div>
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">Deuda máxima (MAD)</label>
                <input
                  type="number"
                  value={debtRange[1]}
                  onChange={(e) => setDebtRange([debtRange[0], Number(e.target.value)])}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="5000"
                  min="0"
                  step="100"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setDebtFilterActive(true);
                    filterClients();
                    setShowDebtFilter(false);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition font-medium"
                >
                  Aplicar
                </button>
                <button
                  onClick={() => {
                    setDebtRange([0, 5000]);
                    setDebtFilterActive(false);
                    filterClients();
                    setShowDebtFilter(false);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
                >
                  Limpiar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Clients Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando clientes...</p>
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-600">No se encontraron clientes</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contacto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Última Compra
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Deuda
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Puntos
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedClients.map((client) => {
                    const debt = debtMap.get(client.id) || 0;
                    return (
                      <tr key={client.id} className="hover:bg-gray-50">
                        {/* 1. CLIENTE - Avatar + Nombre + DNI */}
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0 bg-blue-100 rounded-lg flex items-center justify-center">
                              <span className="text-blue-600 font-bold">
                                {client.first_name?.charAt(0)}{client.last_name?.charAt(0)}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {client.first_name} {client.last_name}
                              </div>
                              <div className="text-sm text-gray-500">{client.dni || 'Sin DNI'}</div>
                            </div>
                          </div>
                        </td>

                        {/* 2. CONTACTO - Email + Teléfono */}
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{client.email || 'Sin email'}</div>
                          <div className="text-sm text-gray-500">{client.phone || 'Sin teléfono'}</div>
                        </td>

                        {/* 3. ÚLTIMA COMPRA - Fecha + Estado */}
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {client.last_purchase_date 
                              ? new Date(client.last_purchase_date).toLocaleDateString('es-ES')
                              : 'Nunca'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {client.last_purchase_date ? 'Con compras' : 'Sin compras'}
                          </div>
                        </td>

                        {/* 4. DEUDA - Monto con color */}
                        <td className="px-6 py-4">
                          <span className={`text-sm font-medium ${debt > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                            {debt.toFixed(2)} MAD
                          </span>
                        </td>

                        {/* 5. PUNTOS - Número */}
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-900">{client.loyalty_points || 0} puntos</span>
                        </td>

                        {/* 6. ACCIONES - Iconos */}
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <Link
                              to={`/clients/${client.id}`}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                              title="Ver detalle"
                            >
                              <Eye size={18} />
                            </Link>
                            <Link
                              to={`/clients/${client.id}/edit`}
                              className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                              title="Editar"
                            >
                              <Edit size={18} />
                            </Link>
                            <button
                              onClick={() => handleDeleteClick(client)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                              title="Eliminar"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            <div className="flex items-center justify-between px-6 py-3 bg-white border-t border-gray-200">
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-700">
                  Mostrando <span className="font-medium">{startItem}</span> a{' '}
                  <span className="font-medium">{endItem}</span>{' '}
                  de <span className="font-medium">{filteredClients.length}</span> clientes
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
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && clientToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirmar eliminación</h3>
            <p className="text-gray-600 mb-4">
              ¿Estás seguro de que quieres eliminar a {clientToDelete.first_name} {clientToDelete.last_name}?
              Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setClientToDelete(null);
                }}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientsPage;