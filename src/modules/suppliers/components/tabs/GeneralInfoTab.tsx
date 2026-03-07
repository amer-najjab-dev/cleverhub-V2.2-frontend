import React, { useState, useEffect } from 'react';
import { Building2, Mail, Globe, Phone } from 'lucide-react';
import { supplierService } from '../../services/supplier.service';
import { Supplier } from '../../types/supplier.types';

interface GeneralInfoTabProps {
  supplierId: string;
}

const GeneralInfoTab: React.FC<GeneralInfoTabProps> = ({ supplierId }) => {
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadSupplier();
  }, [supplierId]);

  const loadSupplier = async () => {
    try {
      setLoading(true);
      const data = await supplierService.getById(supplierId);
      setSupplier(data);
    } catch (error) {
      console.error('Error loading supplier:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!supplier) return null;

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
        >
          {isEditing ? 'Sauvegarder' : 'Modifier'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <Building2 className="w-5 h-5 text-gray-400 mt-0.5" />
            <div className="flex-1">
              <div className="text-xs text-gray-500 uppercase">Société</div>
              {isEditing ? (
                <input
                  type="text"
                  defaultValue={supplier.companyName}
                  className="w-full px-3 py-1 border border-gray-300 rounded-lg text-sm"
                />
              ) : (
                <div className="text-base font-medium text-gray-900">{supplier.companyName}</div>
              )}
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
            <div className="flex-1">
              <div className="text-xs text-gray-500 uppercase">Email</div>
              {isEditing ? (
                <input
                  type="email"
                  defaultValue={supplier.email}
                  className="w-full px-3 py-1 border border-gray-300 rounded-lg text-sm"
                />
              ) : (
                <div className="text-sm text-gray-900">{supplier.email || '—'}</div>
              )}
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Globe className="w-5 h-5 text-gray-400 mt-0.5" />
            <div className="flex-1">
              <div className="text-xs text-gray-500 uppercase">Site Web</div>
              {isEditing ? (
                <input
                  type="text"
                  defaultValue={supplier.website}
                  className="w-full px-3 py-1 border border-gray-300 rounded-lg text-sm"
                />
              ) : (
                <div className="text-sm text-gray-900">{supplier.website || '—'}</div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
            <div className="flex-1">
              <div className="text-xs text-gray-500 uppercase">Téléphones</div>
              <div className="space-y-2 mt-1">
                {supplier.phones?.map((phone) => (
                  <div key={phone.id} className="flex items-center gap-2">
                    <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full">
                      {phone.type}
                    </span>
                    <span className="text-sm text-gray-900">{phone.number}</span>
                    {phone.isPrimary && (
                      <span className="text-xs text-blue-600">(Principal)</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneralInfoTab;