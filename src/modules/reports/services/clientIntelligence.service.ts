// src/modules/reports/services/clientIntelligence.service.ts
import { api } from '../../../services/api';

export interface ClientRiskScore {
  clientId: number;
  clientName: string;
  clientPhone?: string;
  clientEmail?: string;
  totalPurchases: number;
  totalSpent: number;
  averageTicket: number;
  paymentScore: number;
  delayScore: number;
  frequencyScore: number;
  overallRisk: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  recommendations: string[];
}

export interface ClientSegment {
  id: string;
  name: string;
  description: string;
  criteria: string;
  clientCount: number;
  averageSpent: number;
  color: string;
}

export interface PurchaseBehavior {
  clientId: number;
  clientName: string;
  favoriteCategories: {
    category: string;
    count: number;
    percentage: number;
  }[];
  favoriteLaboratories: {
    laboratory: string;
    count: number;
    percentage: number;
  }[];
  purchaseFrequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'rare';
  averageDaysBetweenPurchases: number;
  lastPurchaseDate: Date;
  firstPurchaseDate: Date;
  preferredPaymentMethod: string;
  preferredHour: number;
}

export interface ClientIntelligence {
  totalClients: number;
  totalRevenue: number;
  averagePerClient: number;
  atRiskCount: number;
  atRiskPercentage: number;
  segments: ClientSegment[];
}

export const clientIntelligenceService = {
  // Obtener inteligencia general de clientes
  getIntelligence: async (): Promise<ClientIntelligence> => {
    const response = await api.get('/ai/clients/intelligence');
    return response.data.data;
  },

  // Obtener scores de riesgo de todos los clientes
  getAllRiskScores: async (): Promise<ClientRiskScore[]> => {
    const response = await api.get('/ai/clients/risk-scores');
    return response.data.data;
  },

  // Obtener score de riesgo de un cliente específico
  getClientRiskScore: async (clientId: number): Promise<ClientRiskScore> => {
    const response = await api.get(`/ai/clients/risk-scores/${clientId}`);
    return response.data.data;
  },

  // Obtener segmentos de clientes
  getSegments: async (): Promise<ClientSegment[]> => {
    const response = await api.get('/ai/clients/segments');
    return response.data.data;
  },

  // Obtener comportamiento de compra de un cliente
  getPurchaseBehavior: async (clientId: number): Promise<PurchaseBehavior> => {
    const response = await api.get(`/ai/clients/behavior/${clientId}`);
    return response.data.data;
  }
};