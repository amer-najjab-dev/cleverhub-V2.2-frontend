// src/modules/connect/pages/ConnectPage.tsx
import React, { useState } from 'react';
import { 
  MessageSquare, 
  BarChart3, 
  Plus,
  Send
} from 'lucide-react';
import { useConnect } from '../hooks/useConnect';
import { TemplateBuilder } from '../components/TemplateBuilder';
import { CampaignSegmentation } from '../components/CampaignSegmentation';
import { AIMessageGenerator } from '../components/AIMessageGenerator';
import { ClientSelector } from '../components/ClientSelector';
import { MessagePreview } from '../components/MessagePreview';
import { format } from 'date-fns';

export const ConnectPage: React.FC = () => {
  const { templates, campaigns, loading, error, refetch } = useConnect();
  const [activeTab, setActiveTab] = useState<'templates' | 'campaigns' | 'analytics'>('templates');
  const [showTemplateBuilder, setShowTemplateBuilder] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [campaignSegments, setCampaignSegments] = useState<any>({});
  const [previewCount, setPreviewCount] = useState<number | null>(null);
  const [selectedClients, setSelectedClients] = useState<any[]>([]);

  const handleCreateCampaign = async () => {
    if (!selectedTemplate) {
      alert('Veuillez sélectionner un modèle');
      return;
    }
    console.log('Creating campaign with:', { selectedTemplate, campaignSegments });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">Brouillon</span>;
      case 'scheduled':
        return <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded-full text-xs">Programmé</span>;
      case 'sending':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-600 rounded-full text-xs">Envoi en cours</span>;
      case 'completed':
        return <span className="px-2 py-1 bg-green-100 text-green-600 rounded-full text-xs">Terminé</span>;
      case 'cancelled':
        return <span className="px-2 py-1 bg-red-100 text-red-600 rounded-full text-xs">Annulé</span>;
      default:
        return null;
    }
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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">CleverConnect</h1>
            <p className="text-gray-500 mt-1">Campagnes WhatsApp et communication client</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex gap-6">
            <button
              onClick={() => setActiveTab('templates')}
              className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'templates'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              Modèles ({templates.length})
            </button>
            <button
              onClick={() => setActiveTab('campaigns')}
              className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'campaigns'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Send className="w-4 h-4" />
              Campagnes ({campaigns.length})
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'analytics'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Analyses
            </button>
          </nav>
        </div>

        {/* Contenu des tabs */}
        {activeTab === 'templates' && (
          <div className="space-y-6">
            <div className="flex justify-end">
              <button
                onClick={() => {
                  setSelectedTemplate(null);
                  setShowTemplateBuilder(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                Nouveau modèle
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => {
                    setSelectedTemplate(template);
                  }}
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-lg">{template.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      template.status === 'active' ? 'bg-green-100 text-green-700' :
                      template.status === 'draft' ? 'bg-gray-100 text-gray-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {template.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                    {template.content.substring(0, 120)}...
                  </p>
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>Catégorie: {template.category}</span>
                    <span>Variables: {template.variables?.length || 0}</span>
                  </div>
                </div>
              ))}
            </div>

            {templates.length === 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">Aucun modèle</h3>
                <p className="text-gray-500 mb-4">Créez votre premier modèle de message</p>
                <button
                  onClick={() => setShowTemplateBuilder(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Créer un modèle
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'campaigns' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold mb-4">Nouvelle campagne</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Modèle à utiliser
                  </label>
                  <select
                    onChange={(e) => {
                      const template = templates.find(t => t.id === parseInt(e.target.value));
                      setSelectedTemplate(template);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Sélectionner un modèle</option>
                    {templates.filter(t => t.status === 'active').map((template) => (
                      <option key={template.id} value={template.id}>{template.name}</option>
                    ))}
                  </select>
                </div>

                <AIMessageGenerator
                  onSelectMessage={(message) => {
                    console.log('Selected message:', message);
                  }}
                />
              </div>

              {/* Sélection de clients */}
              {selectedTemplate && (
                <div className="mt-6">
                  <ClientSelector
                    selectedClients={selectedClients}
                    onClientsSelected={setSelectedClients}
                  />
                </div>
              )}

              {/* Aperçu des messages */}
              {selectedTemplate && selectedClients.length > 0 && (
                <div className="mt-6">
                  <MessagePreview
                    template={selectedTemplate}
                    clients={selectedClients}
                    onSend={(clientIds, personalizedMessages) => {
                      console.log('Campagne envoyée à:', clientIds.length, 'clients');
                      console.log('Messages:', personalizedMessages.length);
                      setSelectedClients([]);
                      setSelectedTemplate(null);
                    }}
                  />
                </div>
              )}

              {/* Segmentation (optionnelle) */}
              {selectedTemplate && selectedClients.length === 0 && (
                <div className="mt-6">
                  <CampaignSegmentation
                    onSegmentChange={setCampaignSegments}
                    onPreview={setPreviewCount}
                  />
                </div>
              )}

              {selectedTemplate && previewCount && previewCount > 0 && selectedClients.length === 0 && (
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={handleCreateCampaign}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Créer la campagne ({previewCount} destinataires)
                  </button>
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h3 className="font-semibold">Campagnes récentes</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Modèle</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Statut</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Destinataires</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Taux lecture</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Conversions</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {campaigns.map((campaign) => (
                      <tr key={campaign.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium">{campaign.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{campaign.template?.name}</td>
                        <td className="px-6 py-4 text-center">{getStatusBadge(campaign.status)}</td>
                        <td className="px-6 py-4 text-right">{campaign.totalRecipients}</td>
                        <td className="px-6 py-4 text-right">
                          {campaign.totalRecipients > 0
                            ? Math.round((campaign.readCount / campaign.totalRecipients) * 100)
                            : 0}%
                        </td>
                        <td className="px-6 py-4 text-right">{campaign.conversionCount}</td>
                        <td className="px-6 py-4 text-right text-sm text-gray-500">
                          {campaign.sentAt
                            ? format(new Date(campaign.sentAt), 'dd MMM yyyy')
                            : format(new Date(campaign.createdAt), 'dd MMM yyyy')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {campaigns.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  Aucune campagne créée
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">Analyses des campagnes</h3>
            <p className="text-gray-500">
              Cette section affichera les métriques détaillées de vos campagnes
            </p>
          </div>
        )}
      </div>

      {/* Modal Template Builder */}
      {showTemplateBuilder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-2xl">
            <TemplateBuilder
              template={selectedTemplate}
              onSave={() => {
                setShowTemplateBuilder(false);
                refetch();
              }}
              onCancel={() => setShowTemplateBuilder(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};