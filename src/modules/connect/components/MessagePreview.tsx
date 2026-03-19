// src/modules/connect/components/MessagePreview.tsx
import React, { useState, useEffect } from 'react';
import { Eye, Send, AlertCircle, Clock } from 'lucide-react';

interface MessagePreviewProps {
  template: {
    id: number;
    name: string;
    content: string;
    variables: string[];
  };
  clients: Array<{
    id: number;
    first_name?: string;
    last_name?: string;
    phone: string;
    loyaltyPoints?: number;
    lastPurchaseDate?: string;
  }>;
  onSend: (clientIds: number[], personalizedMessages: string[]) => void;
}

export const MessagePreview: React.FC<MessagePreviewProps> = ({
  template,
  clients,
  onSend
}) => {
  const [previewMessages, setPreviewMessages] = useState<any[]>([]);
  const [selectedClients, setSelectedClients] = useState<Set<number>>(new Set());
  const [showPreview, setShowPreview] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendProgress, setSendProgress] = useState(0);

  // Generar mensajes personalizados para cada cliente
  useEffect(() => {
    const messages = clients.map(client => {
      let message = template.content;

      // Reemplazar variables con datos reales del cliente
      const variables = {
        '{{nombre_cliente}}': `${client.first_name || ''} ${client.last_name || ''}`.trim() || 'client',
        '{{puntos_actuales}}': client.loyaltyPoints?.toString() || '0',
        '{{fecha_vencimiento_lote}}': new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR'),
        '{{producto_sugerido}}': 'Protecteur solaire'
      };

      Object.entries(variables).forEach(([key, value]) => {
        message = message.replace(new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), value);
      });

      return {
        clientId: client.id,
        clientName: `${client.first_name || ''} ${client.last_name || ''}`.trim() || 'Client',
        phone: client.phone,
        message,
        selected: true
      };
    });

    setPreviewMessages(messages);
    setSelectedClients(new Set(clients.map(c => c.id)));
  }, [template, clients]);

  const toggleClient = (clientId: number) => {
    const newSelected = new Set(selectedClients);
    if (newSelected.has(clientId)) {
      newSelected.delete(clientId);
    } else {
      newSelected.add(clientId);
    }
    setSelectedClients(newSelected);
  };

  const toggleAll = () => {
    if (selectedClients.size === previewMessages.length) {
      setSelectedClients(new Set());
    } else {
      setSelectedClients(new Set(previewMessages.map(m => m.clientId)));
    }
  };

  const handleSend = async () => {
    const selectedMessages = previewMessages.filter(m => selectedClients.has(m.clientId));
    
    setSending(true);
    setSendProgress(0);

    // Simular envío progresivo
    for (let i = 0; i < selectedMessages.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 100));
      setSendProgress(((i + 1) / selectedMessages.length) * 100);
    }

    setTimeout(() => {
      setSending(false);
      setSendProgress(0);
      onSend(
        Array.from(selectedClients),
        selectedMessages.map(m => m.message)
      );
      setShowPreview(false);
    }, 500);
  };

  const getPhoneDisplay = (phone: string) => {
    if (!phone) return 'Numéro non disponible';
    if (phone.length === 10) {
      return phone.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
    }
    return phone;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Eye className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold">Aperçu des messages personnalisés</h3>
        </div>
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          {showPreview ? 'Masquer' : 'Afficher'}
        </button>
      </div>

      {showPreview && (
        <div className="p-6">
          {/* Barre d'outils */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedClients.size === previewMessages.length}
                  onChange={toggleAll}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm">Tout sélectionner</span>
              </label>
              <span className="text-sm text-gray-500">
                {selectedClients.size} client(s) sélectionné(s)
              </span>
            </div>
            
            <button
              onClick={handleSend}
              disabled={sending || selectedClients.size === 0}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {sending ? 'Envoi en cours...' : `Envoyer à ${selectedClients.size} client(s)`}
            </button>
          </div>

          {/* Barre de progression */}
          {sending && (
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Progression</span>
                <span>{Math.round(sendProgress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${sendProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Liste des messages */}
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {previewMessages.map((item) => (
              <div
                key={item.clientId}
                className={`border rounded-lg p-4 transition-colors ${
                  selectedClients.has(item.clientId)
                    ? 'border-blue-300 bg-blue-50'
                    : 'border-gray-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={selectedClients.has(item.clientId)}
                    onChange={() => toggleClient(item.clientId)}
                    className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium">{item.clientName}</h4>
                        <p className="text-sm text-gray-600">{getPhoneDisplay(item.phone)}</p>
                      </div>
                      {item.phone ? (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                          WhatsApp disponible
                        </span>
                      ) : (
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                          Pas de téléphone
                        </span>
                      )}
                    </div>
                    
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                      <p className="text-gray-800 whitespace-pre-wrap">{item.message}</p>
                    </div>
                    
                    {!item.phone && (
                      <div className="mt-2 flex items-center gap-1 text-xs text-red-600">
                        <AlertCircle className="w-3 h-3" />
                        <span>Ce client n'a pas de numéro de téléphone enregistré</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Résumé */}
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-blue-800">
              <Clock className="w-4 h-4" />
              <span>
                Les messages seront envoyés avec un délai de 5 secondes entre chaque envoi 
                pour respecter les limites anti-spam de WhatsApp.
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};