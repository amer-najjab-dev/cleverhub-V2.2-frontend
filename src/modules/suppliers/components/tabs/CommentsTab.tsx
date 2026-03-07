import React from 'react';

interface CommentsTabProps {
  supplierId: string;
}

const CommentsTab: React.FC<CommentsTabProps> = ({ supplierId }) => {
  // TODO: Implementar vista de comentarios usando supplierId
  return (
    <div className="text-center py-12 text-gray-500">
      Page en construction - CommentsTab (ID: {supplierId})
    </div>
  );
};

export default CommentsTab;
