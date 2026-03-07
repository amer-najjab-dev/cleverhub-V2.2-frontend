import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react'; // Eliminado Filter que no se usaba
import { supplierService } from '../../services/supplier.service';
import { CreditNote } from '../../types/supplier.types';

interface CreditsTabProps {
  supplierId: string;
}

const CreditsTab: React.FC<CreditsTabProps> = ({ supplierId }) => {
  const [credits, setCredits] = useState<CreditNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'used'>('all');

  useEffect(() => {
    loadCredits();
  }, [supplierId]);

  const loadCredits = async () => {
    try {
      setLoading(true);
      const data = await supplierService.getCreditNotes(supplierId);
      setCredits(data);
    } catch (error) {
      console.error('Error loading credits:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD',
      minimumFractionDigits: 2
    }).format(value);
  };

  const filteredCredits = credits.filter(c => {
    if (filter === 'all') return true;
    if (filter === 'pending') return c.status === 'pending';
    if (filter === 'used') return c.status === 'used' || c.status === 'partial';
    return true;
  });

  const totalPending = credits.reduce((sum, c) => sum + c.remainingAmount, 0);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Avoirs fournisseurs</h3>
          <p className="text-sm text-gray-500 mt-1">
            Montant total inutilisé: <span className="font-bold text-blue-600">{formatCurrency(totalPending)}</span>
          </p>
        </div>
        <div className="flex gap-3">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tous</option>
            <option value="pending">En attente</option>
            <option value="used">Utilisés</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Plus className="w-4 h-4" />
            Nouvel avoir
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Référence</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Montant total</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Montant inutilisé</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredCredits.map((credit) => (
              <tr key={credit.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <span className="font-medium text-gray-900">{credit.reference}</span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  {new Date(credit.issueDate).toLocaleDateString('fr-FR')}
                </td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  {formatCurrency(credit.totalAmount)}
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm font-semibold text-blue-600">
                    {formatCurrency(credit.remainingAmount)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-3 py-1 text-xs rounded-full ${
                    credit.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    credit.status === 'partial' ? 'bg-blue-100 text-blue-800' :
                    credit.status === 'used' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {credit.status === 'pending' ? 'En attente' :
                     credit.status === 'partial' ? 'Partiel' :
                     credit.status === 'used' ? 'Utilisé' : 'Expiré'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button
                    disabled={credit.remainingAmount <= 0}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Appliquer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CreditsTab;