import React from 'react';

interface PurchaseOrdersTabProps {
  supplierId: string;
}

const PurchaseOrdersTab: React.FC<PurchaseOrdersTabProps> = ({ supplierId }) => {
  // TODO: Implementar vista de órdenes de compra usando supplierId
  return (
    <div className="text-center py-12 text-gray-500">
      Page en construction - PurchaseOrdersTab (ID: {supplierId})
    </div>
  );
};

export default PurchaseOrdersTab;
