import { useState, useEffect } from 'react';
import { connectService } from '../services/connect.service';
import { MessageTemplate, MessageCampaign } from '../services/connect.service';

export const useConnect = () => {
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [campaigns, setCampaigns] = useState<MessageCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [templatesRes, campaignsRes] = await Promise.all([
        connectService.getTemplates(),
        connectService.getCampaigns()
      ]);

      setTemplates(templatesRes.data);
      setCampaigns(campaignsRes.data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar datos de conectividad');
      console.error('Error loading connect data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return {
    templates,
    campaigns,
    loading,
    error,
    refetch: loadData
  };
};