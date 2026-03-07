import React from 'react';
import { Percent } from 'lucide-react';
import { VatBreakdown as VatBreakdownType } from '../../types/report.types';
import { useCurrencyFormatter } from '../../../../utils/formatters';

interface VatBreakdownProps {
  vat: VatBreakdownType;
}

export const VatBreakdown: React.FC<VatBreakdownProps> = ({ vat }) => {
  const { formatCurrency } = useCurrencyFormatter();

  const vatItems = [
    { rate: '7%', value: vat.vat7, color: 'bg-blue-50' },
    { rate: '10%', value: vat.vat10, color: 'bg-green-50' },
    { rate: '14%', value: vat.vat14, color: 'bg-purple-50' },
    { rate: '20%', value: vat.vat20, color: 'bg-orange-50' },
    { rate: 'Exonéré', value: vat.vatExempt, color: 'bg-gray-50' },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Percent className="w-5 h-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">Détail de la 
TVA</h3>
      </div>

      <div className="space-y-3">
        {vatItems.map((item) => (
          <div key={item.rate} className={`p-3 rounded-lg ${item.color}`}>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">TVA {item.rate}</span>
              <span className="text-sm 
font-semibold">{formatCurrency(item.value)}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">Total TVA</span>
          <span className="text-lg font-bold text-blue-600">
            {formatCurrency(vat.vat7 + vat.vat10 + vat.vat14 + vat.vat20 + 
vat.vatExempt)}
          </span>
        </div>
      </div>
    </div>
  );
};
