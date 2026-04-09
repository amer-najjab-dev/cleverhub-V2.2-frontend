// src/components/ui/ResponsiveTable.tsx
import React from 'react';

interface ResponsiveTableProps {
  children: React.ReactNode;
  className?: string;
}

export const ResponsiveTable = ({ children, className = '' }: ResponsiveTableProps) => {
  return (
    <div className="overflow-x-auto -mx-4 sm:-mx-6 lg:mx-0">
      <div className="inline-block min-w-full align-middle">
        <div className="overflow-hidden shadow-sm ring-1 ring-black ring-opacity-5 rounded-lg">
          <table className={`min-w-full divide-y divide-gray-300 ${className}`}>
            {children}
          </table>
        </div>
      </div>
    </div>
  );
};

export const TableHead = ({ children }: { children: React.ReactNode }) => (
  <thead className="bg-gray-50">{children}</thead>
);

export const TableBody = ({ children }: { children: React.ReactNode }) => (
  <tbody className="divide-y divide-gray-200 bg-white">{children}</tbody>
);

export const TableRow = ({ children, onClick, className = '' }: { children: React.ReactNode; onClick?: () => void; 
className?: string }) => (
  <tr className={`hover:bg-gray-50 transition-colors ${className}`} onClick={onClick}>
    {children}
  </tr>
);

export const TableHeaderCell = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => 
(
  <th className={`px-3 py-3 lg:px-6 lg:py-4 text-left text-xs lg:text-sm font-semibold text-gray-900 
${className}`}>
    {children}
  </th>
);

export const TableCell = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <td className={`whitespace-nowrap px-3 py-3 lg:px-6 lg:py-4 text-sm lg:text-base text-gray-700 ${className}`}>
    {children}
  </td>
);
