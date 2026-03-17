import { api } from './api';
import { AxiosResponse } from 'axios';

// ============================================
// TIPOS PARA DASHBOARD
// ============================================

export interface DashboardKPI {
  todaySales: number;
  weekSales: number;
  averageTicket: number;
  lowStockCount: number;
  growth: number;
  totalSales?: number;
  totalProfit?: number;
  averageMargin?: number;
  pendingOrders?: number;
}

export interface HourlySale {
  hour: string;
  value: number;
}

export interface ComparativeData {
  day: string;
  actual: number;
  previous: number;
}

export interface TopProduct {
  id: number;
  name: string;
  category: string;
  quantity: number;      // ← Cambiado de 'sales' a 'quantity'
  revenue: number;
  margin: number;
  marginPercentage: number;
}

export interface QuickSummary {
  bestHour: {
    hour: string;
    value: number;
  };
  topProduct: {
    name: string;
    sales: number;
  };
  topCustomer: {
    name: string;
    total: number;
  };
}

// Interfaz para la respuesta del backend
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
  message?: string;
}

// Helper para extraer data de AxiosResponse
const extractData = <T>(response: AxiosResponse<ApiResponse<T>>): ApiResponse<T> => {
  return response.data;
};

// ============================================
// DASHBOARD SERVICE CON SOPORTE PARA RANGO DE FECHAS
// ============================================

export const dashboardService = {
  /**
   * Obtener KPIs del dashboard
   * @param period - 'today' | 'week' | 'month'
   */
  getKPIs: (period: string = 'today'): Promise<ApiResponse<DashboardKPI>> => 
    api.get<ApiResponse<DashboardKPI>>('/dashboard/kpis', { params: { period } }).then(extractData),

  /**
   * Obtener ventas por hora para un día específico
   * @param date - Fecha en formato YYYY-MM-DD (opcional, por defecto hoy)
   */
  getHourlySales: (date?: string): Promise<ApiResponse<HourlySale[]>> => {
    const params: any = {};
    if (date) {
      params.date = date;
    }
    return api.get<ApiResponse<HourlySale[]>>('/dashboard/hourly-sales', { params }).then(extractData);
  },

  /**
   * Obtener datos comparativos (semana actual vs anterior)
   */
  getComparativeData: (): Promise<ApiResponse<ComparativeData[]>> => 
    api.get<ApiResponse<ComparativeData[]>>('/dashboard/comparative').then(extractData),

  /**
   * Obtener top productos más vendidos
   * @param limit - Número de productos a obtener (por defecto 10)
   * @param period - 'week' | 'month' | 'quarter'
   * @param startDate - Fecha inicio (YYYY-MM-DD) para rango personalizado
   * @param endDate - Fecha fin (YYYY-MM-DD) para rango personalizado
   */
  getTopProducts: (
    limit: number = 10, 
    period?: string,
    startDate?: string,
    endDate?: string
  ): Promise<ApiResponse<TopProduct[]>> => {
    const params: any = { limit };
    if (period) params.period = period;
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    
    return api.get<ApiResponse<TopProduct[]>>('/dashboard/top-products', { params })
      .then(extractData);
  },

  /**
   * Calcular ticket medio del período
   * @param period - 'today' | 'week' | 'month'
   */
  getAverageTicket: (period: string = 'week'): Promise<ApiResponse<{ average: number }>> => 
    api.get<ApiResponse<{ average: number }>>('/dashboard/average-ticket', { params: { period } }).then(extractData),

  /**
   * Obtener conteo de productos con stock bajo
   * @param threshold - Umbral de stock bajo (por defecto 10)
   */
  getLowStockCount: (threshold: number = 10): Promise<ApiResponse<{ count: number }>> => 
    api.get<ApiResponse<{ count: number }>>('/dashboard/low-stock', { params: { threshold } }).then(extractData),

  /**
   * Obtener resumen rápido para el panel lateral
   */
  getQuickSummary: (): Promise<ApiResponse<QuickSummary>> => 
    api.get<ApiResponse<QuickSummary>>('/dashboard/quick-summary').then(extractData),

  /**
   * Obtener métricas completas del dashboard (versión enriquecida)
   */
  getDashboardMetrics: (): Promise<ApiResponse<any>> => 
    api.get<ApiResponse<any>>('/dashboard/metrics').then(extractData),
};