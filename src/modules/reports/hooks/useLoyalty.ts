import { useState, useEffect } from 'react';
import { loyaltyService, LoyaltySummary } from '../services/loyalty.service';

export const useLoyalty = () => {
  const [summary, setSummary] = useState<LoyaltySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔵 Fetching loyalty data...');
      const data = await loyaltyService.getLoyaltySummary();

      console.log('📦 Loyalty summary:', data);
      setSummary(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar los datos de fidelización');
      console.error('🔴 Error loading loyalty:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    summary,
    loading,
    error,
    refetch: fetchData
  };
};