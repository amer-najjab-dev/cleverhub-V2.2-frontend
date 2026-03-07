import React from 'react';
import { AlertCircle, Phone } from 'lucide-react';

interface LostSalesTableProps {
  sales: Array<{
    id: string;
    date: string;
    productName: string;
    quantity: number;
    clientName?: string;
    clientPhone?: string;
    reason?: string;
  }>;
}

export const LostSalesTable: React.FC<LostSalesTableProps> = ({ sales }) => {
  if (sales.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 
text-center">
        <div className="text-gray-400 mb-3">
          <AlertCircle className="w-12 h-12 mx-auto" />
        </div>
        <h4 className="text-lg font-medium text-gray-700 mb-2">Aucune vente 
perdue</h4>
        <p className="text-gray-500">Tous les produits étaient en stock</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 
overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Ventes 
perdues</h3>
            <p className="text-sm text-gray-500 mt-1">Produits demandés en 
rupture</p>
          </div>
          <span className="px-3 py-1 bg-red-100 text-red-800 text-xs font-medium 
rounded-full">
            {sales.length} rupture(s)
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium 
text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium 
text-gray-500 uppercase">Produit</th>
              <th className="px-6 py-3 text-right text-xs font-medium 
text-gray-500 uppercase">Quantité</th>
              <th className="px-6 py-3 text-left text-xs font-medium 
text-gray-500 uppercase">Client</th>
              <th className="px-6 py-3 text-left text-xs font-medium 
text-gray-500 uppercase">Raison</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sales.map((sale) => (
              <tr key={sale.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-700">
                  {new Date(sale.date).toLocaleDateString('fr-FR')}
                </td>
                <td className="px-6 py-4">
                  <span className="font-medium 
text-gray-900">{sale.productName}</span>
                </td>
                <td className="px-6 py-4 text-right 
font-medium">{sale.quantity}</td>
                <td className="px-6 py-4">
                  {sale.clientName ? (
                    <div>
                      <div className="text-sm 
text-gray-900">{sale.clientName}</div>
                      {sale.clientPhone && (
                        <div className="flex items-center gap-1 text-xs 
text-gray-500 mt-1">
                          <Phone className="w-3 h-3" />
                          {sale.clientPhone}
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400">Non 
enregistré</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-600">{sale.reason || 
'Rupture de stock'}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
