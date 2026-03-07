import React from 'react';
import { Phone, Mail } from 'lucide-react'; // Eliminado Clock que no se usaba
import { DormantClient } from '../../services/loyalty.service';

interface DormantClientsTableProps {
  clients: DormantClient[];
}

export const DormantClientsTable: React.FC<DormantClientsTableProps> = ({ clients }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dernier achat</th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Jours sans activité</th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Contact</th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {clients.map((client) => (
            <tr key={client.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 font-medium">{client.name}</td>
              <td className="px-6 py-4 text-sm text-gray-600">
                {client.lastPurchaseDate 
                  ? new Date(client.lastPurchaseDate).toLocaleDateString('fr-FR')
                  : 'Jamais'
                }
              </td>
              <td className="px-6 py-4 text-center">
                <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs">
                  {client.daysSinceLastPurchase} jours
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center justify-center gap-2">
                  {client.phone && (
                    <a 
                      href={`tel:${client.phone}`}
                      className="p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition-colors"
                      title="Appeler"
                    >
                      <Phone className="w-4 h-4" />
                    </a>
                  )}
                  {client.email && (
                    <a 
                      href={`mailto:${client.email}`}
                      className="p-2 bg-green-100 text-green-600 rounded-full hover:bg-green-200 transition-colors"
                      title="Envoyer un email"
                    >
                      <Mail className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 text-center">
                <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
                  Réactiver
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};