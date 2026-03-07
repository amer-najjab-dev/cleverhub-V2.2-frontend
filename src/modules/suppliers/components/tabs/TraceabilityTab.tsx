import React from 'react';

interface TraceabilityTabProps {
  supplierId: string;
}

const TraceabilityTab: React.FC<TraceabilityTabProps> = ({ supplierId }) => {
  // TODO: Implementar vista de trazabilidad usando supplierId
  return (
    <div className="text-center py-12 text-gray-500">
      Page en construction - TraceabilityTab (ID: {supplierId})
    </div>
  );
};

export default TraceabilityTab;
