import React from 'react';

interface DescriptiveInfoTabProps {
  supplierId: string;
}

const DescriptiveInfoTab: React.FC<DescriptiveInfoTabProps> = ({ supplierId }) => {
  // TODO: Implementar vista de información descriptiva usando supplierId
  return (
    <div className="text-center py-12 text-gray-500">
      Page en construction - DescriptiveInfoTab (ID: {supplierId})
    </div>
  );
};

export default DescriptiveInfoTab;
