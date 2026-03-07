import React from 'react';

interface ProductHistoryTabProps {
  supplierId: string;
}

const ProductHistoryTab: React.FC<ProductHistoryTabProps> = ({ supplierId }) => {
  // TODO: Implementar historial de productos usando supplierId
  return (
    <div className="text-center py-12 text-gray-500">
      Page en construction - ProductHistoryTab (ID: {supplierId})
    </div>
  );
};

export default ProductHistoryTab;
