import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Save, Package, CreditCard } from 'lucide-react';
import { supplierService } from '../services/supplier.service';
import { Supplier } from '../types/supplier.types';
import { DeliveryForm } from '../../../components/Delivery/DeliveryForm';
import { PaymentObligations } from '../../../components/Delivery/PaymentObligations';

export const SupplierDetailPage: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'delivery' | 'obligations'>('info');
  const [formData, setFormData] = useState({
    companyName: '',
    email: '',
    paymentTerms: '',
    taxId: ''
  });

  useEffect(() => {
    if (id && id !== 'new') {
      loadSupplier();
    }
  }, [id]);

  const loadSupplier = async () => {
    if (!id || id === 'new') return;
    try {
      setLoading(true);
      const data = await supplierService.getById(id);
      setSupplier(data);
      setFormData({
        companyName: data.companyName,
        email: data.email || '',
        paymentTerms: data.paymentTerms || '',
        taxId: data.taxId || ''
      });
    } catch (error) {
      console.error('Error loading supplier:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!id || id === 'new') return;
    try {
      await supplierService.update(id, {
        companyName: formData.companyName,
        email: formData.email,
        paymentTerms: formData.paymentTerms,
        taxId: formData.taxId
      });
      setIsEditing(false);
      loadSupplier();
    } catch (error) {
      console.error('Error updating supplier:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!supplier) {
    return <div className="p-6 text-center text-gray-500">{t('supplierDetail.not_found')}</div>;
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-full mx-auto">
        <button
          onClick={() => navigate('/providers')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('supplierDetail.back_to_suppliers')}
        </button>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex justify-between items-center p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditing ? t('supplierDetail.edit_supplier') : supplier.companyName}
            </h1>
            {activeTab === 'info' && (
              <button
                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {isEditing ? <Save className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
                {isEditing ? t('common.save') : t('common.edit')}
              </button>
            )}
          </div>

          {/* Tabs estilo ReportsLayout */}
          <div className="bg-white px-6 pt-2">
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              <button
                onClick={() => {
                  setActiveTab('info');
                  setIsEditing(false);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap shadow-md ${
                  activeTab === 'info'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white text-gray-600 hover:shadow-xl hover:text-gray-900'
                }`}
              >
                {t('supplierDetail.information')}
              </button>
              <button
                onClick={() => {
                  setActiveTab('delivery');
                  setIsEditing(false);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap shadow-md ${
                  activeTab === 'delivery'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white text-gray-600 hover:shadow-xl hover:text-gray-900'
                }`}
              >
                <Package className="w-4 h-4" />
                {t('supplierDetail.bl_reception')}
              </button>
              <button
                onClick={() => {
                  setActiveTab('obligations');
                  setIsEditing(false);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap shadow-md ${
                  activeTab === 'obligations'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white text-gray-600 hover:shadow-xl hover:text-gray-900'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                {t('supplierDetail.payment_obligations')}
              </button>
            </div>
          </div>

          <div className="p-6 border-t border-gray-100">
            {activeTab === 'info' && (
              <div className="space-y-4 max-w-2xl">
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t('supplierDetail.name')}</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="mt-1 text-gray-900">{supplier.companyName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">{t('common.email')}</label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="mt-1 text-gray-900">{supplier.email || '-'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">{t('supplierDetail.payment_terms')}</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.paymentTerms}
                      onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="mt-1 text-gray-900">{supplier.paymentTerms || '-'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">{t('supplierDetail.tax_id')}</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.taxId}
                      onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="mt-1 text-gray-900">{supplier.taxId || '-'}</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'delivery' && id && (
              <div>
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">{t('supplierDetail.delivery_reception')}</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {t('supplierDetail.delivery_description')}
                  </p>
                </div>
                <DeliveryForm supplierId={id} onSuccess={loadSupplier} />
              </div>
            )}

            {activeTab === 'obligations' && id && (
              <div>
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">{t('supplierDetail.payment_obligations_title')}</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {t('supplierDetail.payment_obligations_description')}
                  </p>
                </div>
                <PaymentObligations supplierId={id} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
