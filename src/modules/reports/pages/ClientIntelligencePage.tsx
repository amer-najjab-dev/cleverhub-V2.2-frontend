import React, { useState } from 'react';
import { 
  Users, 
  TrendingUp, 
  AlertTriangle,
  RefreshCw,
  DollarSign,
  PieChart
} from 'lucide-react';
import { useClientIntelligence } from '../hooks/useClientIntelligence';
import { useCurrencyFormatter } from '../../../utils/formatters';
import { SegmentCard } from '../components/clients/SegmentCard';
import { RiskTable } from '../components/clients/RiskTable';
import { ClientBehavior } from '../components/clients/ClientBehavior';

export const ClientIntelligencePage: React.FC = () => {
  const { formatCurrency } = useCurrencyFormatter();
  const { 
    intelligence, 
    riskScores, 
    segments, 
    selectedClientBehavior,
    loading, 
    error, 
    refetch,
    fetchClientBehavior
  } = useClientIntelligence();

  const [selectedClient, setSelectedClient] = useState<number | null>(null);

  const handleSelectClient = async (clientId: number) => {
    setSelectedClient(clientId);
    await fetchClientBehavior(clientId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className=" space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Intelligence Clients</h1>
            <p className="text-gray-500 mt-1">Analyse du comportement et scoring de risque</p>
          </div>
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Actualiser
          </button>
        </div>

        {/* KPIs principales */}
        {intelligence && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total clients</p>
                  <p className="text-2xl font-bold text-gray-900">{intelligence.totalClients}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 rounded-lg">
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Chiffre d'affaires total</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(intelligence.totalRevenue)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Ticket moyen</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(intelligence.averagePerClient)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-red-100 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Clients à risque</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {intelligence.atRiskCount} <span className="text-sm font-normal text-gray-500">({intelligence.atRiskPercentage}%)</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Segmentos de clientes */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-blue-600" />
            Segmentation automatique
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {segments.map((segment) => (
              <SegmentCard key={segment.id} segment={segment} />
            ))}
          </div>
        </div>

        {/* Tabla de riesgos */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="font-semibold">Scoring de risque client</h2>
          </div>
          <RiskTable 
            riskScores={riskScores} 
            onSelectClient={handleSelectClient}
            selectedClientId={selectedClient}
          />
        </div>

        {/* Comportamiento del cliente seleccionado */}
        {selectedClientBehavior && (
          <ClientBehavior behavior={selectedClientBehavior} />
        )}
      </div>
    </div>
  );
};