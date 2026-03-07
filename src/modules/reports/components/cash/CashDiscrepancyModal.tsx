import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { useCurrencyFormatter } from '../../../../utils/formatters';

interface CashDiscrepancyModalProps {
  expectedCash: number;
  actualCash: number;
  onClose: () => void;
  onResolve: (data: { reason: string; notes: string }) => void;
}

export const CashDiscrepancyModal: React.FC<CashDiscrepancyModalProps> = ({
  expectedCash,
  actualCash,
  onClose,
  onResolve
}) => {
  const { formatCurrency } = useCurrencyFormatter();
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  
  const discrepancy = actualCash - expectedCash;
  const isPositive = discrepancy > 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center 
justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b 
border-gray-200">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-yellow-600" />
            <h3 className="text-lg font-semibold text-gray-900">Écart de caisse 
détecté</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 
hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className={`p-4 rounded-lg mb-4 ${isPositive ? 'bg-green-50' : 
'bg-red-50'}`}>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Écart:</span>
              <span className={`text-lg font-bold ${isPositive ? 
'text-green-600' : 'text-red-600'}`}>
                {isPositive ? '+' : ''}{formatCurrency(discrepancy)}
              </span>
            </div>
            <div className="text-sm text-gray-600 mt-2">
              <div className="flex justify-between">
                <span>Caisse attendue:</span>
                <span>{formatCurrency(expectedCash)}</span>
              </div>
              <div className="flex justify-between">
                <span>Caisse réelle:</span>
                <span>{formatCurrency(actualCash)}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Raison de l'écart *
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg 
focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Sélectionner une raison</option>
                <option value="erreur_rendu">Erreur de rendu monnaie</option>
                <option value="oubli_transaction">Transaction oubliée</option>
                <option value="fausse_manoeuvre">Fausse manipulation</option>
                <option value="autre">Autre</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (optionnel)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg 
focus:ring-2 focus:ring-blue-500"
                placeholder="Détails supplémentaires..."
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg 
hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            onClick={() => onResolve({ reason, notes })}
            disabled={!reason}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg 
hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Valider l'écart
          </button>
        </div>
      </div>
    </div>
  );
};
