import { useState, useEffect } from 'react';
import { 
  clientIntelligenceService, 
  ClientIntelligence, 
  ClientRiskScore, 
  ClientSegment,
  PurchaseBehavior 
} from '../services/clientIntelligence.service';

export const useClientIntelligence = () => {
  const [intelligence, setIntelligence] = useState<ClientIntelligence | null>(null);
  const [riskScores, setRiskScores] = useState<ClientRiskScore[]>([]);
  const [segments, setSegments] = useState<ClientSegment[]>([]);
  const [selectedClientBehavior, setSelectedClientBehavior] = useState<PurchaseBehavior | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔵 Fetching client intelligence data...');

      const [intelligenceData, scoresData, segmentsData] = await Promise.all([
        clientIntelligenceService.getIntelligence(),
        clientIntelligenceService.getAllRiskScores(),
        clientIntelligenceService.getSegments()
      ]);

      console.log('📦 Intelligence:', intelligenceData);
      console.log('📦 Risk scores:', scoresData);
      console.log('📦 Segments:', segmentsData);

      setIntelligence(intelligenceData);
      setRiskScores(scoresData);
      setSegments(segmentsData);
    } catch (err: any) {
      setError(err.message || 'Error al cargar los datos de inteligencia de clientes');
      console.error('🔴 Error loading client intelligence:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchClientBehavior = async (clientId: number) => {
    try {
      const behavior = await clientIntelligenceService.getPurchaseBehavior(clientId);
      setSelectedClientBehavior(behavior);
      return behavior;
    } catch (err: any) {
      console.error('Error loading client behavior:', err);
      return null;
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    intelligence,
    riskScores,
    segments,
    selectedClientBehavior,
    loading,
    error,
    refetch: fetchData,
    fetchClientBehavior
  };
};