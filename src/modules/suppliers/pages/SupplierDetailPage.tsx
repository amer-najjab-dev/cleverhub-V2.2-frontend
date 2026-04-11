import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Save, Package, CreditCard } from 'lucide-react';
import { supplierService } from '../services/supplier.service';
import { Supplier } from '../types/supplier.types';
import { DeliveryForm } from '../../../components/Delivery/DeliveryForm';
import { PaymentObligations } from '../../../components/Delivery/PaymentObligations';

export const SupplierDetailPage: React.FC = () => {
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
    return <div className="p-6 text-center text-gray-500">Proveedor no encontrado</div>;
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/providers')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a proveedores
        </button>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex justify-between items-center p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditing ? 'Editar Proveedor' : supplier.companyName}
            </h1>
            {activeTab === 'info' && (
              <button
                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {isEditing ? <Save className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
                {isEditing ? 'Guardar' : 'Editar'}
              </button>
            )}
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 px-6">
            <div className="flex gap-6">
              <button
                onClick={() => {
                  setActiveTab('info');
                  setIsEditing(false);
                }}
                className={`pb-3 px-1 text-sm font-medium transition-colors ${
                  activeTab === 'info'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Información
              </button>
              <button
                onClick={() => {
                  setActiveTab('delivery');
                  setIsEditing(false);
                }}
                className={`pb-3 px-1 text-sm font-medium transition-colors flex items-center gap-2 ${
                  activeTab === 'delivery'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Package className="w-4 h-4" />
                Recepción BL
              </button>
              <button
                onClick={() => {
                  setActiveTab('obligations');
                  setIsEditing(false);
                }}
                className={`pb-3 px-1 text-sm font-medium transition-colors flex items-center gap-2 ${
                  activeTab === 'obligations'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                Obligaciones de Pago
              </button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'info' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nombre</label>
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
                  <label className="block text-sm font-medium text-gray-700">Email</label>
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
                  <label className="block text-sm font-medium text-gray-700">Condiciones de pago</label>
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
                  <label className="block text-sm font-medium text-gray-700">NIF</label>
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
              <DeliveryForm supplierId={id} onSuccess={loadSupplier} />
            )}

            {activeTab === 'obligations' && id && (
              <PaymentObligations supplierId={id} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};