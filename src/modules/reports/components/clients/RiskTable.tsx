import React from 'react';
import { ClientRiskScore } from '../../services/clientIntelligence.service';
import { useCurrencyFormatter } from '../../../../utils/formatters';
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react';

interface RiskTableProps {
  riskScores: ClientRiskScore[];
  onSelectClient: (clientId: number) => void;
  selectedClientId?: number | null;
}

export const RiskTable: React.FC<RiskTableProps> = ({ 
  riskScores, 
  onSelectClient,
  selectedClientId 
}) => {
  const { formatCurrency } = useCurrencyFormatter();

  const getRiskColor = (level: string) => {
    switch(level) {
      case 'low': return 'text-green-700 bg-green-100';
      case 'medium': return 'text-blue-700 bg-blue-100';
      case 'high': return 'text-orange-700 bg-orange-100';
      case 'critical': return 'text-red-700 bg-red-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  const getRiskIcon = (level: string) => {
    switch(level) {
      case 'low': return <CheckCircle className="w-4 h-4" />;
      case 'medium': return <Clock className="w-4 h-4" />;
      case 'high': return <AlertTriangle className="w-4 h-4" />;
      case 'critical': return <AlertTriangle className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Achats</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total dépensé</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ticket moyen</th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Score paiement</th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Score retard</th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Risque</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {riskScores.map((client) => (
            <tr 
              key={client.clientId}
              onClick={() => onSelectClient(client.clientId)}
              className={`hover:bg-gray-50 cursor-pointer transition-colors ${
                selectedClientId === client.clientId ? 'bg-blue-50' : ''
              }`}
            >
              <td className="px-6 py-4">
                <div className="font-medium text-gray-900">{client.clientName}</div>
                <div className="text-xs text-gray-500">{client.clientPhone || client.clientEmail || 'Sans contact'}</div>
              </td>
              <td className="px-6 py-4 text-right">{client.totalPurchases}</td>
              <td className="px-6 py-4 text-right font-medium">{formatCurrency(client.totalSpent)}</td>
              <td className="px-6 py-4 text-right">{formatCurrency(client.averageTicket)}</td>
              <td className="px-6 py-4 text-center">
                <div className="flex items-center justify-center gap-1">
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${client.paymentScore}%` }}
                    />
                  </div>
                  <span className="text-xs">{client.paymentScore}%</span>
                </div>
              </td>
              <td className="px-6 py-4 text-center">
                <div className="flex items-center justify-center gap-1">
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-orange-500 h-2 rounded-full"
                      style={{ width: `${client.delayScore}%` }}
                    />
                  </div>
                  <span className="text-xs">{client.delayScore}%</span>
                </div>
              </td>
              <td className="px-6 py-4 text-center">
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(client.riskLevel)}`}>
                  {getRiskIcon(client.riskLevel)}
                  {client.riskLevel === 'low' ? 'Faible' :
                   client.riskLevel === 'medium' ? 'Moyen' :
                   client.riskLevel === 'high' ? 'Élevé' : 'Critique'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {riskScores.length === 0 && (
        <div className="p-8 text-center text-gray-500">
          Aucune donnée client disponible
        </div>
      )}
    </div>
  );
};