import React from 'react';

interface PaymentHistoryTabProps {
  supplierId: string;
}

const PaymentHistoryTab: React.FC<PaymentHistoryTabProps> = ({ supplierId }) => {
  // TODO: Implementar historial de pagos usando supplierId
  return (
    <div className="text-center py-12 text-gray-500">
      Page en construction - PaymentHistoryTab (ID: {supplierId})
    </div>
  );
};

export default PaymentHistoryTab;
