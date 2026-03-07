import { api } from '../../../services/api';
import { 
  CashClosure, 
  DashboardKPIs, 
  SalesTrend, 
  TopProduct, 
  LostSale,
  SupplierPurchaseAnalysis,
  BatchTracking,
  AuditLogEntry,
  ReportFilters,
  SupplierReportFilters,
  DateRange
} from '../types/report.types';

export const reportService = {
  // ========== CIERRE DE CAJA ==========
  
  getDailyClosure: async (date: Date): Promise<CashClosure> => {
    const formattedDate = date.toISOString().split('T')[0];
    const response = await api.get('/reports/cash-closure', { 
      params: { date: formattedDate } 
    });
    return response.data.data;
  },

  validateClosure: async (data: {
    date: Date;
    actualCash: number;
    manualEntries: any[];
    userId?: number;
  }): Promise<void> => {
    await api.post('/reports/cash-closure/validate', data);
  },

  resolveDiscrepancy: async (data: {
    date: Date;
    expectedCash: number;
    actualCash: number;
    reason: string;
    notes?: string;
  }): Promise<void> => {
    await api.post('/reports/cash-closure/resolve', data);
  },

  // ========== BUSINESS INTELLIGENCE ==========
  
  getDashboardKPIs: async (period: 'week' | 'month' | 'quarter'): Promise<DashboardKPIs> => {
    const response = await api.get('/reports/dashboard/kpis', { 
      params: { period } 
    });
    return response.data.data;
  },

  getSalesTrend: async (period: 'week' | 'month' | 'quarter'): Promise<SalesTrend[]> => {
    const response = await api.get('/reports/dashboard/sales-trend', { 
      params: { period } 
    });
    return response.data.data;
  },

  getTopProducts: async (limit: number = 10, period: 'week' | 'month' | 'quarter'): Promise<TopProduct[]> => {
    const response = await api.get('/reports/dashboard/top-products', { 
      params: { limit, period } 
    });
    return response.data.data;
  },

  getLostSales: async (period: 'week' | 'month' | 'quarter'): Promise<LostSale[]> => {
    const response = await api.get('/reports/dashboard/lost-sales', { 
      params: { period } 
    });
    return response.data.data;
  },

  // ========== ANÁLISIS DE PROVEEDORES ==========
  
  getSupplierAnalysis: async (filters: SupplierReportFilters): Promise<SupplierPurchaseAnalysis[]> => {
    // CORRECCIÓN: Convertir supplierIds a string separada por comas
    const params: any = {
      startDate: filters.startDate,
      endDate: filters.endDate
    };
    
    if (filters.supplierIds && filters.supplierIds.length > 0) {
      params.supplierIds = filters.supplierIds.join(',');
    }
    
    const response = await api.get('/reports/suppliers/analysis', { params });
    
    // CORRECCIÓN: El backend devuelve { period, summary, suppliers }
    // Extraemos suppliers que es el array que necesitamos
    return response.data.data.suppliers || [];
  },

  getSupplierDetail: async (supplierId: string, filters: DateRange): Promise<SupplierPurchaseAnalysis> => {
    const response = await api.get(`/reports/suppliers/${supplierId}`, { 
      params: filters 
    });
    return response.data.data;
  },

  // ========== TRAZABILIDAD DE LOTES ==========
  
  searchBatch: async (batchNumber: string): Promise<BatchTracking> => {
    const response = await api.get('/reports/batches/search', { 
      params: { batchNumber } 
    });
    return response.data.data;
  },

  getBatchTransactions: async (batchNumber: string): Promise<any[]> => {
    const response = await api.get(`/reports/batches/${batchNumber}/transactions`);
    return response.data.data;
  },

  // ========== LOG DE AUDITORÍA ==========
  
  getAuditLogs: async (filters?: ReportFilters): Promise<AuditLogEntry[]> => {
    const response = await api.get('/reports/audit-logs', { 
      params: filters 
    });
    return response.data.data;
  },

  logAudit: async (entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): Promise<void> => {
    await api.post('/reports/audit-logs', entry);
  },

  // ========== EXPORTACIÓN ==========
  
  exportSupplierAnalysis: async (analysis: SupplierPurchaseAnalysis[], format: 'pdf' | 'excel'): Promise<void> => {
    const response = await api.post('/reports/export/suppliers', { 
      data: analysis, 
      format 
    }, {
      responseType: 'blob'
    });
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `analyse-fournisseurs.${format}`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  }
};