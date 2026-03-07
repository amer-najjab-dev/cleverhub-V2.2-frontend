import React from 'react';
import { Wallet, CreditCard, Landmark, DollarSign, FileText, Layers } from 'lucide-react';
import { PaymentSummary } from '../../types/report.types';
import { useCurrencyFormatter } from '../../../../utils/formatters';

interface PaymentBreakdownProps {
  payments: PaymentSummary;
}

export const PaymentBreakdown: React.FC<PaymentBreakdownProps> = ({ payments }) => {
  const { formatCurrency } = useCurrencyFormatter();

  const paymentMethods = [
    { label: 'Espèces', value: payments.cash, icon: Wallet, color: 'text-green-600' },
    { label: 'Carte bancaire', value: payments.card, icon: CreditCard, color: 'text-blue-600' },
    { label: 'Virement', value: payments.transfer, icon: Landmark, color: 'text-purple-600' },
    { label: 'Chèque', value: payments.check, icon: FileText, color: 'text-orange-600' },
    { label: 'Crédit', value: payments.credit, icon: DollarSign, color: 'text-red-600' },
    { label: 'Mixte', value: payments.mixed, icon: Layers, color: 'text-indigo-600' },
  ];

  const total = Object.values(payments).reduce((sum, val) => sum + val, 0);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Moyens de paiement</h3>

      <div className="space-y-3">
        {paymentMethods.map((method) => (
          <div key={method.label} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <method.icon className={`w-5 h-5 ${method.color}`} />
              <span className="text-sm text-gray-700">{method.label}</span>
            </div>
            <span className="text-sm font-medium">{formatCurrency(method.value)}</span>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">Total encaissé</span>
          <span className="text-lg font-bold text-blue-600">{formatCurrency(total)}</span>
        </div>
      </div>
    </div>
  );
};