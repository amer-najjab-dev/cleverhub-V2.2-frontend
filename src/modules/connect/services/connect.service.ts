// src/modules/connect/services/connect.service.ts
import { api } from '../../../services/api';

export interface MessageTemplate {
  id: number;
  name: string;
  content: string;
  variables: string[];
  status: 'draft' | 'active' | 'archived';
  category: 'promotion' | 'reactivation' | 'points' | 'expiring';
  createdAt: string;
  updatedAt: string;
}

export interface CampaignSegment {
  tiers?: ('Or' | 'Argent' | 'Bronze')[];
  dormantDays?: number;
  minPoints?: number;
  maxPoints?: number;
  lastPurchaseDays?: number;
  productIds?: number[];
}

export interface MessageCampaign {
  id: number;
  name: string;
  templateId: number;
  template?: MessageTemplate;
  segments: CampaignSegment;
  totalRecipients: number;
  sentCount: number;
  deliveredCount: number;
  readCount: number;
  conversionCount: number;
  conversionValue: number;
  status: 'draft' | 'scheduled' | 'sending' | 'completed' | 'cancelled';
  scheduledFor?: string;
  sentAt?: string;
  completedAt?: string;
  createdAt: string;
}

export interface AIGeneratedMessage {
  id: number;
  tone: 'professional' | 'friendly' | 'urgent';
  message: string;
  productId: number;
  pointsCost?: number;
  usageCount: number;
  likeCount: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface Client {
  id: number;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  loyaltyPoints?: number;
  lastPurchaseDate?: string;
}

export const connectService = {
  // ========== PLANTILLAS ==========
  getTemplates: async () => {
    const response = await api.get<ApiResponse<MessageTemplate[]>>('/campaigns/templates');
    return response.data;
  },

  createTemplate: async (data: Partial<MessageTemplate>) => {
    const response = await api.post<ApiResponse<MessageTemplate>>('/campaigns/templates', data);
    return response.data;
  },

  updateTemplate: async (id: number, data: Partial<MessageTemplate>) => {
    const response = await api.put<ApiResponse<MessageTemplate>>(`/campaigns/templates/${id}`, data);
    return response.data;
  },

  deleteTemplate: async (id: number) => {
    const response = await api.delete<ApiResponse<any>>(`/campaigns/templates/${id}`);
    return response.data;
  },

  // ========== CAMPAÑAS ==========
  getCampaigns: async () => {
    const response = await api.get<ApiResponse<MessageCampaign[]>>('/campaigns');
    return response.data;
  },

  getCampaign: async (id: number) => {
    const response = await api.get<ApiResponse<MessageCampaign>>(`/campaigns/${id}`);
    return response.data;
  },

  createCampaign: async (data: Partial<MessageCampaign>) => {
    const response = await api.post<ApiResponse<MessageCampaign>>('/campaigns', data);
    return response.data;
  },

  sendCampaign: async (id: number, delayMs?: number) => {
    const response = await api.post<ApiResponse<any>>(`/campaigns/${id}/send`, { delayMs });
    return response.data;
  },

  // ========== SEGMENTACIÓN ==========
  previewSegmentation: async (segments: CampaignSegment) => {
    const response = await api.post<ApiResponse<{ count: number; clients: any[] }>>('/campaigns/preview', { segments });
    return response.data;
  },

  getDormantClients: async (days: number = 90) => {
    const response = await api.get<ApiResponse<any[]>>(`/campaigns/dormant?days=${days}`);
    return response.data;
  },

  // ========== IA GENERADORA ==========
  generateAIMessages: async (productId: number, pointsCost?: number) => {
    const response = await api.post<ApiResponse<AIGeneratedMessage[]>>('/campaigns/ai/generate', { productId, pointsCost });
    return response.data;
  },

  likeAIMessage: async (id: number) => {
    const response = await api.post<ApiResponse<any>>(`/campaigns/ai/like/${id}`);
    return response.data;
  },

  // ========== CLIENTES ==========
  getClients: async (search?: string, limit: number = 20) => {
    const params: any = { limit };
    if (search) params.q = search;
    const response = await api.get<ApiResponse<Client[]>>('/clients', { params });
    return response.data;
  },

  getClientById: async (id: number) => {
    const response = await api.get<ApiResponse<Client>>(`/clients/${id}`);
    return response.data;
  },

  getClientPoints: async (clientId: number) => {
    const response = await api.get<ApiResponse<any>>(`/clients/${clientId}/loyalty`);
    return response.data;
  },

  // ========== ENVÍO DE MENSAJES ==========
  sendBulkMessages: async (campaignData: {
    templateId: number;
    clientIds: number[];
    personalizedMessages: string[];
    delayMs?: number;
  }) => {
    const response = await api.post<ApiResponse<any>>('/campaigns/bulk-send', campaignData);
    return response.data;
  },

  sendSingleMessage: async (clientId: number, templateId: number, variables?: any) => {
    const response = await api.post<ApiResponse<any>>('/campaigns/send-single', {
      clientId,
      templateId,
      variables
    });
    return response.data;
  },
};