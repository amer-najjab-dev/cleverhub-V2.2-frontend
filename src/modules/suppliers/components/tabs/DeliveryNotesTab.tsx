import React from 'react';

interface DeliveryNotesTabProps {
  supplierId: string;
}

const DeliveryNotesTab: React.FC<DeliveryNotesTabProps> = ({ supplierId }) => {
  // TODO: Implementar vista de bons de livraison usando supplierId
  return (
    <div className="text-center py-12 text-gray-500">
      Page en construction - DeliveryNotesTab (ID: {supplierId})
    </div>
  );
};

export default DeliveryNotesTab;
