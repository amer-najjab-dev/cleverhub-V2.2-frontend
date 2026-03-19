// src/modules/connect/components/ClientSelector.tsx
import React, { useState } from 'react';
import { Search, X, Users } from 'lucide-react';
import { clientsService } from '../../../services/clients.service';

interface Client {
  id: number;
  first_name: string;
  last_name: string;
  phone: string;
  email?: string;
  loyaltyPoints?: number;
  lastPurchaseDate?: string;
}

interface ClientSelectorProps {
  onClientsSelected: (clients: Client[]) => void;
  selectedClients?: Client[];
  maxSelections?: number;
}

export const ClientSelector: React.FC<ClientSelectorProps> = ({
  onClientsSelected,
  selectedClients = [],
  maxSelections = 50
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Client[]>([]);
  const [selected, setSelected] = useState<Client[]>(selectedClients);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const searchClients = async (query: string) => {
    if (!query) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await clientsService.search(query);
      // Filtrar clientes que ya están seleccionados
      const filtered = response.data.filter(
        client => !selected.some(s => s.id === client.id)
      );
      // Mapear para asegurar el tipo correcto
      const mappedResults: Client[] = filtered.map(client => ({
        id: client.id,
        first_name: client.first_name || '',
        last_name: client.last_name || '',
        phone: client.phone || '',
        email: client.email,
        loyaltyPoints: client.loyaltyPoints,
        lastPurchaseDate: client.last_purchase_date || undefined
      }));
      setSearchResults(mappedResults.slice(0, 10));
    } catch (error) {
      console.error('Error searching clients:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectClient = (client: Client) => {
    if (selected.length >= maxSelections) {
      alert(`Vous ne pouvez sélectionner que ${maxSelections} clients maximum`);
      return;
    }
    const newSelected = [...selected, client];
    setSelected(newSelected);
    onClientsSelected(newSelected);
    setSearchTerm('');
    setSearchResults([]);
    setShowResults(false);
  };

  const handleRemoveClient = (clientId: number) => {
    const newSelected = selected.filter(c => c.id !== clientId);
    setSelected(newSelected);
    onClientsSelected(newSelected);
  };

  const getClientDisplayName = (client: Client) => {
    return `${client.first_name || ''} ${client.last_name || ''}`.trim() || 'Sans nom';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600" />
          Sélection des clients
        </h3>
        <span className="text-sm text-gray-500">
          {selected.length}/{maxSelections} sélectionnés
        </span>
      </div>

      {/* Barre de recherche */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            searchClients(e.target.value);
            setShowResults(true);
          }}
          onFocus={() => setShowResults(true)}
          placeholder="Rechercher un client par nom ou téléphone..."
          className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          disabled={selected.length >= maxSelections}
        />
        
        {/* Résultats de recherche */}
        {showResults && searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
            {isSearching ? (
              <div className="p-3 text-center text-gray-500">Recherche en cours...</div>
            ) : (
              searchResults.map((client) => (
                <button
                  key={client.id}
                  onClick={() => handleSelectClient(client)}
                  className="w-full p-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 flex justify-between items-center"
                >
                  <div>
                    <div className="font-medium">{getClientDisplayName(client)}</div>
                    <div className="text-sm text-gray-600">{client.phone}</div>
                  </div>
                  {client.loyaltyPoints ? (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                      {client.loyaltyPoints} pts
                    </span>
                  ) : null}
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* Clients sélectionnés */}
      {selected.length > 0 && (
        <div className="space-y-2 max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-2">
          {selected.map((client) => (
            <div
              key={client.id}
              className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100"
            >
              <div className="flex-1">
                <div className="font-medium text-sm">{getClientDisplayName(client)}</div>
                <div className="text-xs text-gray-500">{client.phone}</div>
              </div>
              <button
                onClick={() => handleRemoveClient(client.id)}
                className="p-1 text-gray-400 hover:text-red-600 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Message si aucun client sélectionné */}
      {selected.length === 0 && (
        <div className="p-4 text-center text-gray-500 border border-dashed border-gray-300 rounded-lg">
          Aucun client sélectionné. Utilisez la recherche ci-dessus pour ajouter des clients.
        </div>
      )}
    </div>
  );
};