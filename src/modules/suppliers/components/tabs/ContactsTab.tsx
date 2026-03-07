import React, { useState, useEffect } from 'react';
import { MapPin, Home } from 'lucide-react';
import { supplierService } from '../../services/supplier.service';
import { Supplier } from '../../types/supplier.types';

interface ContactsTabProps {
  supplierId: string;
}

const ContactsTab: React.FC<ContactsTabProps> = ({ supplierId }) => {
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [loading, setLoading] = useState(true);

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
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Adresses</h3>
      
      {supplier.addresses?.map((address) => (
        <div
          key={address.id}
          className={`p-4 border rounded-lg ${
            address.isPrimary ? 'border-blue-200 bg-blue-50' : 'border-gray-200'
          }`}
        >
          {address.isPrimary && (
            <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full mb-2">
              Adresse principale
            </span>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <Home className="w-4 h-4 text-gray-400 mt-0.5" />
              <div>
                <div className="text-xs text-gray-500">Rue</div>
                <div className="text-sm text-gray-900">
                  {address.streetNumber} {address.streetName}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
              <div>
                <div className="text-xs text-gray-500">Ville / Code postal</div>
                <div className="text-sm text-gray-900">
                  {address.city} {address.postalCode}
                </div>
                <div className="text-xs text-gray-500">{address.country}</div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ContactsTab;