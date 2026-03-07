import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, History, Search, Filter, Download } from 'lucide-react';
import { supplierService } from '../services/supplier.service';
import { Supplier, SupplierAddress } from '../types/supplier.types';


export const SupplierListPage: React.FC = () => {
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [balanceRange, setBalanceRange] = useState<[number, number]>([0, 1000000]);
  const [cities, setCities] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadSuppliers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [suppliers, searchQuery, cityFilter, balanceRange]);

  const loadSuppliers = async () => {
    try {
      setLoading(true);
      const data = await supplierService.getAll();
      setSuppliers(data);
      
      // Extraer ciudades únicas para el filtro
      const uniqueCities = [...new Set(data.map((s: Supplier) => s.addresses?.[0]?.city).filter(Boolean))] as string[];
      setCities(uniqueCities);
    } catch (error) {
      console.error('Error loading suppliers:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...suppliers];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(s => 
        s.companyName.toLowerCase().includes(query) ||
        s.phones?.some(p => p.number.includes(query))
      );
    }

    if (cityFilter) {
      filtered = filtered.filter(s => 
        s.addresses?.some((a: SupplierAddress) => a.city === cityFilter)
      );
    }

    filtered = filtered.filter(s => 
      s.balance >= balanceRange[0] && s.balance <= balanceRange[1]
    );

    setFilteredSuppliers(filtered);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD',
      minimumFractionDigits: 2
    }).format(value);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Cabecera */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/providers/new')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              Nouveau fournisseur
            </button>
            <button
              onClick={() => navigate('/providers/suggestions')}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              <History className="w-4 h-4" />
              Historique des suggestions
            </button>
          </div>

          <div className="flex gap-3 w-full sm:w-auto">
            {/* Barra de búsqueda */}
            <div className="relative flex-1 sm:flex-initial">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-64 pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-lg border ${showFilters ? 'bg-blue-50 border-blue-300' : 'border-gray-300 hover:bg-gray-50'}`}
              title="Filtres avancés"
            >
              <Filter className="w-5 h-5 text-gray-600" />
            </button>
            
            <button
              onClick={() => {/* Exportar */}}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              title="Exporter"
            >
              <Download className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Filtros avanzados */}
        {showFilters && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ville
                </label>
                <select
                  value={cityFilter}
                  onChange={(e) => setCityFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Toutes les villes</option>
                  {cities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Solde (DHS)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="0"
                    value={balanceRange[0]}
                    onChange={(e) => setBalanceRange([Number(e.target.value), balanceRange[1]])}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Min"
                  />
                  <span className="text-gray-500">-</span>
                  <input
                    type="number"
                    min="0"
                    value={balanceRange[1]}
                    onChange={(e) => setBalanceRange([balanceRange[0], Number(e.target.value)])}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Max"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabla de proveedores */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nom
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Téléphone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ville et adresse
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Solde (DHS)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredSuppliers.map((supplier) => {
                    const primaryPhone = supplier.phones?.find(p => p.isPrimary) || supplier.phones?.[0];
                    const primaryAddress = supplier.addresses?.find((a: SupplierAddress) => a.isPrimary) || supplier.addresses?.[0];
                    
                    return (
                      <tr
                        key={supplier.id}
                        onClick={() => navigate(`/providers/${supplier.id}`)}
                        className="hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{supplier.companyName}</div>
                          {supplier.email && (
                            <div className="text-sm text-gray-500">{supplier.email}</div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {primaryPhone && (
                            <div className="text-sm text-gray-900">{primaryPhone.number}</div>
                          )}
                          {supplier.phones && supplier.phones.length > 1 && (
                            <div className="text-xs text-gray-500">
                              +{supplier.phones.length - 1} autre(s)
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {primaryAddress && (
                            <>
                              <div className="text-sm text-gray-900">{primaryAddress.city}</div>
                              <div className="text-xs text-gray-500">
                                {primaryAddress.streetNumber} {primaryAddress.streetName}
                              </div>
                            </>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-sm font-semibold ${
                            supplier.balance > 0 ? 'text-red-600' : 'text-green-600'
                          }`}>
                            {formatCurrency(supplier.balance)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};