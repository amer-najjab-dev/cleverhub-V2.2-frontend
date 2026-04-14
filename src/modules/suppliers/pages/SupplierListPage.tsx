import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, History, Search, Filter, Download, X, Check, Trash2 } from 'lucide-react';
import { supplierService } from '../services/supplier.service';
import { Supplier, SupplierAddress } from '../types/supplier.types';
import { useTranslation } from 'react-i18next';

export const SupplierListPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [balanceRange, setBalanceRange] = useState<[number, number]>([0, 1000000]);
  const [cities, setCities] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  
  // Estado para el modal
  const [showModal, setShowModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    taxId: '',
    paymentTerms: ''
  });

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setFormData({
      companyName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      postalCode: '',
      taxId: '',
      paymentTerms: ''
    });
  };

  const handleCreateSupplier = async () => {
    if (!formData.companyName || !formData.phone) {
      alert('El nombre y teléfono son obligatorios');
      return;
    }

    setModalLoading(true);
    try {
      const newSupplier = {
        name: formData.companyName,
        email: formData.email || undefined,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        postalCode: formData.postalCode,
        taxId: formData.taxId || undefined,
        paymentTerms: formData.paymentTerms || undefined,
        notes: `Teléfono: ${formData.phone}\nDirección: ${formData.address}, ${formData.city} ${formData.postalCode}`
      };
      console.log('📦 Datos a enviar al backend:', JSON.stringify(newSupplier, null, 2));
      await supplierService.create(newSupplier);
      setShowModal(false);
      resetForm();
      loadSuppliers();
    } catch (error) {
      console.error('Error creating supplier:', error);
      alert('Error al crear el proveedor');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (id: string, companyName: string) => {
    if (window.confirm(`¿Eliminar proveedor "${companyName}"? Esta acción no se puede deshacer.`)) {
      try {
        await supplierService.delete(id);
        loadSuppliers(); // Recargar lista
      } catch (error) {
        console.error('Error deleting supplier:', error);
        alert('Error al eliminar el proveedor');
      }
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="">
        {/* Cabecera */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex gap-3">
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              {t('suppliers.new_supplier')}
            </button>
            <button
              onClick={() => navigate('/providers/suggestions')}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              <History className="w-4 h-4" />
              {t('suppliers.suggestions_history')}
            </button>
          </div>

          <div className="flex gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={t('common.search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-64 pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-lg border ${showFilters ? 'bg-blue-50 border-blue-300' : 'border-gray-300 hover:bg-gray-50'}`}
              title={t('suppliers.advanced_filters')}
            >
              <Filter className="w-5 h-5 text-gray-600" />
            </button>
            
            <button
              onClick={() => {/* Exportar */}}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              title={t('common.export')}
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
                  {t('suppliers.city')}
                </label>
                <select
                  value={cityFilter}
                  onChange={(e) => setCityFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">{t('suppliers.all_cities')}</option>
                  {cities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('suppliers.balance')}
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="0"
                    value={balanceRange[0]}
                    onChange={(e) => setBalanceRange([Number(e.target.value), balanceRange[1]])}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder={t('suppliers.min')}
                  />
                  <span className="text-gray-500">-</span>
                  <input
                    type="number"
                    min="0"
                    value={balanceRange[1]}
                    onChange={(e) => setBalanceRange([balanceRange[0], Number(e.target.value)])}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder={t('suppliers.max')}
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
                      {t('suppliers.name')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('suppliers.phone')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('suppliers.city_and_address')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('suppliers.balance')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('common.actions')}
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
                        className="hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <td 
                          className="px-6 py-4"
                          onClick={() => navigate(`/providers/${supplier.id}`)}
                        >
                          <div className="font-medium text-gray-900">{supplier.companyName}</div>
                          {supplier.email && (
                            <div className="text-sm text-gray-500">{supplier.email}</div>
                          )}
                        </td>
                        <td 
                          className="px-6 py-4"
                          onClick={() => navigate(`/providers/${supplier.id}`)}
                        >
                          {primaryPhone && (
                            <div className="text-sm text-gray-900">{primaryPhone.number}</div>
                          )}
                          {supplier.phones && supplier.phones.length > 1 && (
                            <div className="text-xs text-gray-500">
                              +{supplier.phones.length - 1} {t('suppliers.other')}
                            </div>
                          )}
                        </td>
                        <td 
                          className="px-6 py-4"
                          onClick={() => navigate(`/providers/${supplier.id}`)}
                        >
                          {primaryAddress && (
                            <>
                              <div className="text-sm text-gray-900">{primaryAddress.city}</div>
                              <div className="text-xs text-gray-500">
                                {primaryAddress.streetNumber} {primaryAddress.streetName}
                              </div>
                            </>
                          )}
                        </td>
                        <td 
                          className="px-6 py-4"
                          onClick={() => navigate(`/providers/${supplier.id}`)}
                        >
                          <span className={`text-sm font-semibold ${
                            supplier.balance > 0 ? 'text-red-600' : 'text-green-600'
                          }`}>
                            {formatCurrency(supplier.balance)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(supplier.id, supplier.companyName);
                            }}
                            className="text-red-600 hover:text-red-800 transition-colors p-1 hover:bg-red-50 rounded-lg"
                            title="Eliminar proveedor"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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

      {/* Modal de creación de proveedor */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">{t('suppliers.new_supplier_title')}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('suppliers.name_required')}</label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder={t('suppliers.name_placeholder')}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('suppliers.phone_required')}</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder={t('suppliers.phone_placeholder')}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('common.email')}</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder={t('common.email')}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('suppliers.address')}</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder={t('suppliers.address_placeholder')}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('suppliers.city')}</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder={t('suppliers.city_placeholder')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('suppliers.postal_code')}</label>
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder={t('suppliers.postal_code_placeholder')}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('suppliers.tax_id')}</label>
                <input
                  type="text"
                  name="taxId"
                  value={formData.taxId}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder={t('suppliers.tax_id_placeholder')}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('suppliers.payment_terms')}</label>
                <input
                  type="text"
                  name="paymentTerms"
                  value={formData.paymentTerms}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder={t('suppliers.payment_terms_placeholder')}
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 p-4 border-t border-gray-200">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleCreateSupplier}
                disabled={modalLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                {modalLoading ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : <Check className="w-4 h-4" />}
                {t('common.create')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};